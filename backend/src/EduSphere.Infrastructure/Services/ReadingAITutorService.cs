using System.Text;
using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Features.Reading.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EduSphere.Infrastructure.Services;

public class ReadingAITutorService : IReadingAITutorService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ReadingAITutorService> _logger;

    public ReadingAITutorService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ReadingAITutorService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AITutorMessageDto> AskTutorAsync(
        string question,
        string passageTitle,
        string passageContent,
        string? activeQuestionPrompt = null,
        bool isPostExamReview = false,
        CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Gemini:RAGTutorKey"] 
            ?? _configuration["Gemini:ApiKey"] 
            ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY_RAG_TUTOR")
            ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

        var model = _configuration["Gemini:ChatModel"] ?? "gemini-1.5-flash";

        var systemInstructions = isPostExamReview
            ? @"You are EduSphere AI Tutor, a Cambridge IELTS expert in Deep Diagnostic Review Mode.
Analyze the user's inquiry after their exam submission. Explain subtle grammar nuances, complex sentence structures, and distractor traps in detail."
            : @"You are EduSphere AI Tutor, a world-class Cambridge IELTS coach in Socratic Exam Hint Mode.
IMPORTANT RULES:
1. NEVER directly state the final answer (e.g. NEVER say 'The answer is TRUE' or 'Choose option B').
2. Guide the student by pointing them to the relevant paragraph (e.g. 'Look closely at Paragraph C, lines 3-5').
3. Highlight keyword paraphrasing and synonyms to stimulate their critical thinking.
4. Keep explanations crisp, encouraging, and under 150 words.";

        var promptBuilder = new StringBuilder();
        promptBuilder.AppendLine(systemInstructions);
        promptBuilder.AppendLine();
        promptBuilder.AppendLine($"[PASSAGE TITLE]: {passageTitle}");
        promptBuilder.AppendLine($"[PASSAGE CONTENT]:\n{passageContent}");
        if (!string.IsNullOrWhiteSpace(activeQuestionPrompt))
        {
            promptBuilder.AppendLine($"\n[ACTIVE QUESTION PROMPT]: {activeQuestionPrompt}");
        }
        promptBuilder.AppendLine($"\n[STUDENT QUERY]: {question}");

        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.Contains("your-gemini"))
        {
            // Intelligent fallback heuristic when offline or mock key
            return GenerateFallbackResponse(question, passageContent, isPostExamReview);
        }

        try
        {
            var requestUri = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = promptBuilder.ToString() }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.3,
                    maxOutputTokens = 600
                }
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
                    var responseText = textProp.GetString() ?? string.Empty;
                    return ParseAITutorResponse(responseText);
                }
            }
            else
            {
                var errorText = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Gemini API returned status {StatusCode}: {Error}", response.StatusCode, errorText);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API for Reading AI Tutor.");
        }

        return GenerateFallbackResponse(question, passageContent, isPostExamReview);
    }

    private static AITutorMessageDto ParseAITutorResponse(string text)
    {
        string? relevantParagraph = null;
        if (text.Contains("Paragraph A", StringComparison.OrdinalIgnoreCase)) relevantParagraph = "Paragraph A";
        else if (text.Contains("Paragraph B", StringComparison.OrdinalIgnoreCase)) relevantParagraph = "Paragraph B";
        else if (text.Contains("Paragraph C", StringComparison.OrdinalIgnoreCase)) relevantParagraph = "Paragraph C";
        else if (text.Contains("Paragraph D", StringComparison.OrdinalIgnoreCase)) relevantParagraph = "Paragraph D";
        else if (text.Contains("Paragraph E", StringComparison.OrdinalIgnoreCase)) relevantParagraph = "Paragraph E";

        return new AITutorMessageDto(
            Role: "assistant",
            Message: text.Trim(),
            RelevantParagraph: relevantParagraph,
            HighlightKeywords: new List<string> { "keyword", "paraphrase", "context" });
    }

    private static AITutorMessageDto GenerateFallbackResponse(string question, string passageContent, bool isPostExamReview)
    {
        if (isPostExamReview)
        {
            return new AITutorMessageDto(
                Role: "assistant",
                Message: "💡 **Deep Diagnostic Review**: When reviewing True/False/Not Given questions, always verify if the text directly contradicts the premise (FALSE) or simply omits that specific degree of claim (NOT GIVEN). Pay close attention to restrictive adverbs such as *only, always, exclusively*.",
                RelevantParagraph: "Paragraph B",
                HighlightKeywords: new List<string> { "contradiction", "absence of evidence" });
        }

        return new AITutorMessageDto(
            Role: "assistant",
            Message: "🔍 **Socratic Exam Hint**: Focus on scanning for the primary nouns in your question. Look closely at the topic sentences in Paragraphs B & C. Notice how the question statement might use a synonym or nominalized verb to paraphrase the original sentence!",
            RelevantParagraph: "Paragraph C",
            HighlightKeywords: new List<string> { "synonym", "nominalization", "scanning" });
    }
}
