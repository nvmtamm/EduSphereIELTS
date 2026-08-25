using System.Text;
using System.Text.Json;
using EduSphere.RAG.Embeddings;
using EduSphere.RAG.VectorStores;

namespace EduSphere.RAG.Chains;

public record SocraticHintResponse(
    string HintMessage,
    string? ReferencedParagraph,
    List<string> HighlightedKeywords);

public class SocraticExamTutorChain
{
    private readonly IVectorStore _vectorStore;
    private readonly IEmbeddingGenerator _embeddingGenerator;
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;

    public SocraticExamTutorChain(
        IVectorStore vectorStore,
        IEmbeddingGenerator embeddingGenerator,
        HttpClient httpClient,
        string? apiKey = null)
    {
        _vectorStore = vectorStore;
        _embeddingGenerator = embeddingGenerator;
        _httpClient = httpClient;
        _apiKey = apiKey ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY_RAG_TUTOR") ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
    }

    public async Task<SocraticHintResponse> GenerateHintAsync(
        string collectionName,
        string studentQuery,
        string? activeQuestionPrompt = null,
        CancellationToken cancellationToken = default)
    {
        // 1. Generate query embedding & retrieve top paragraph chunks
        var queryVector = await _embeddingGenerator.GenerateEmbeddingAsync(studentQuery, cancellationToken);
        var retrievedChunks = await _vectorStore.SearchSimilarAsync(collectionName, queryVector, topK: 2, cancellationToken);

        var contextSnippet = string.Join("\n\n", retrievedChunks.Select(c => $"[{c.ParagraphLabel}]: {c.Content}"));
        var bestParagraph = retrievedChunks.FirstOrDefault()?.ParagraphLabel;

        if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey.Contains("your-gemini"))
        {
            return new SocraticHintResponse(
                HintMessage: $"🔍 **Socratic Guidance**: Look closely at {bestParagraph ?? "Paragraph B"}. Locate the subject nouns and check how the prompt statement paraphrases the author's argument!",
                ReferencedParagraph: bestParagraph ?? "Paragraph B",
                HighlightedKeywords: new List<string> { "paraphrase", "context", "scanning" });
        }

        try
        {
            var systemPrompt = @"You are EduSphere AI Tutor in Socratic Hint Mode.
RULES:
1. NEVER reveal the exact final answer or say 'The answer is TRUE/B'.
2. Guide the student by pointing to the relevant paragraph and key paraphrased terms.
3. Keep hints inspiring, concise, and under 120 words.";

            var fullPrompt = $"{systemPrompt}\n\n[CONTEXT PARAGRAPHS]:\n{contextSnippet}\n\n[QUESTION]: {activeQuestionPrompt}\n[STUDENT QUERY]: {studentQuery}";

            var requestUri = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
            var requestBody = new
            {
                contents = new[] { new { parts = new[] { new { text = fullPrompt } } } },
                generationConfig = new { temperature = 0.3, maxOutputTokens = 400 }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(requestUri, content, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
                using var doc = JsonDocument.Parse(responseJson);

                if (doc.RootElement.TryGetProperty("candidates", out var candidates) &&
                    candidates.GetArrayLength() > 0 &&
                    candidates[0].TryGetProperty("content", out var contentObj) &&
                    contentObj.TryGetProperty("parts", out var parts) &&
                    parts.GetArrayLength() > 0 &&
                    parts[0].TryGetProperty("text", out var textProp))
                {
                    var text = textProp.GetString() ?? string.Empty;
                    return new SocraticHintResponse(
                        HintMessage: text.Trim(),
                        ReferencedParagraph: bestParagraph,
                        HighlightedKeywords: new List<string> { "synonym", "evidence", "key argument" });
                }
            }
        }
        catch { }

        return new SocraticHintResponse(
            HintMessage: $"🔍 **Socratic Guidance**: Examine {bestParagraph ?? "Paragraph C"}. Notice the sentence syntax and check if the author explicitly confirms or refutes this claim.",
            ReferencedParagraph: bestParagraph ?? "Paragraph C",
            HighlightedKeywords: new List<string> { "syntax", "claim", "evidence" });
    }
}
