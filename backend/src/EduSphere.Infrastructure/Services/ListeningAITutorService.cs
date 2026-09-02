using System.Text;
using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EduSphere.Infrastructure.Services;

/// <summary>
/// Gemini-powered IELTS Listening AI Diagnostic Tutor.
/// Analyzes native accents, connected speech, elision, and distractor traps in audio transcripts.
/// </summary>
public class ListeningAITutorService : IListeningAITutorService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ListeningAITutorService> _logger;

    public ListeningAITutorService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ListeningAITutorService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ListeningAIExplanationResult> ExplainQuestionAsync(
        string questionPrompt,
        string questionType,
        string? userAnswer,
        string correctAnswer,
        string transcriptExcerpt,
        string accent,
        string? preExistingExplanation,
        CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Gemini:RAGTutorKey"]
            ?? _configuration["Gemini:ApiKey"]
            ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY_RAG_TUTOR")
            ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

        // If no API key is set, use academic template fallback based on IELTS analysis
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return GenerateAcademicFallback(questionPrompt, questionType, userAnswer, correctAnswer, accent, preExistingExplanation);
        }

        try
        {
            var model = _configuration["Gemini:ChatModel"] ?? "gemini-1.5-flash";
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            var systemPrompt = @"You are the EduSphere Cambridge IELTS Listening Chief Examiner and Diagnostic Coach.
Analyze a candidate's incorrect or reviewed question with linguistic rigor.
You must return a STRICT JSON object with these exact 4 keys:
{
  ""accentNuance"": ""Briefly explain the accent phenomenon (e.g. non-rhotic British 'r', Australian vowel shift, or American flap 't') heard in this audio cue"",
  ""signpostingAnalysis"": ""Identify the transition words, hesitation markers, or paraphrasing signals the speaker used to introduce the answer (or distract the candidate)"",
  ""phoneticTrap"": ""Explain why the student might have missed or misheard this (e.g. connected speech, weak forms, plural -s drop, spelling homophones)"",
  ""socraticAdvice"": ""1-2 actionable tips for the student on how to catch this type of cue in future exams""
}
Do NOT wrap in markdown fences or backticks. Return RAW JSON only.";

            var userContent = $@"
[EXAM ACCENT]: {accent}
[QUESTION TYPE]: {questionType}
[QUESTION PROMPT]: {questionPrompt}
[STUDENT'S ANSWER]: {(string.IsNullOrWhiteSpace(userAnswer) ? "(Unanswered)" : userAnswer)}
[OFFICIAL ANSWER]: {correctAnswer}
[AUDIO TRANSCRIPT EXCERPT]:
{transcriptExcerpt}
";

            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = systemPrompt + "\n\n" + userContent }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.3,
                    maxOutputTokens = 600,
                    responseMimeType = "application/json"
                }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, jsonContent, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Gemini Listening Tutor returned non-success code {StatusCode}, falling back to template", response.StatusCode);
                return GenerateAcademicFallback(questionPrompt, questionType, userAnswer, correctAnswer, accent, preExistingExplanation);
            }

            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(responseBody);

            var rawText = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(rawText))
            {
                return GenerateAcademicFallback(questionPrompt, questionType, userAnswer, correctAnswer, accent, preExistingExplanation);
            }

            // Clean markdown codeblocks if Gemini added them
            var cleanedJson = rawText.Trim();
            if (cleanedJson.StartsWith("```json")) cleanedJson = cleanedJson[7..];
            if (cleanedJson.StartsWith("```")) cleanedJson = cleanedJson[3..];
            if (cleanedJson.EndsWith("```")) cleanedJson = cleanedJson[..^3];
            cleanedJson = cleanedJson.Trim();

            using var parsedResult = JsonDocument.Parse(cleanedJson);
            var root = parsedResult.RootElement;

            return new ListeningAIExplanationResult(
                AccentNuance: root.TryGetProperty("accentNuance", out var a) ? a.GetString() ?? "" : "",
                SignpostingAnalysis: root.TryGetProperty("signpostingAnalysis", out var s) ? s.GetString() ?? "" : "",
                SocraticAdvice: root.TryGetProperty("socraticAdvice", out var adv) ? adv.GetString() ?? "" : "",
                PhoneticTrap: root.TryGetProperty("phoneticTrap", out var p) ? p.GetString() ?? "" : ""
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini for listening question explanation, using fallback");
            return GenerateAcademicFallback(questionPrompt, questionType, userAnswer, correctAnswer, accent, preExistingExplanation);
        }
    }

    private static ListeningAIExplanationResult GenerateAcademicFallback(
        string prompt, string questionType, string? userAnswer, string correctAnswer, string accent, string? preExplanation)
    {
        var accentText = accent switch
        {
            "British" => "British RP (Received Pronunciation) features non-rhotic vowels and glottal stops that can mask subtle word endings.",
            "Australian" => "Australian English exhibits broader vowel diphthongs (such as /aɪ/ sounding closer to /ɒɪ/) and rising intonation.",
            "American" => "General American features rhotic post-vocalic /r/ and intervocalic flapping (pronouncing 't' like a quick 'd').",
            _ => "Authentic international native accents present variations in intonation, rhythm, and stress timing."
        };

        var distractor = preExplanation ?? 
            $"In IELTS {questionType} questions, speakers frequently mention a preliminary point before correcting themselves or providing the definitive detail required for '{correctAnswer}'.";

        return new ListeningAIExplanationResult(
            AccentNuance: accentText,
            SignpostingAnalysis: distractor,
            SocraticAdvice: "Listen carefully for transition markers like 'actually', 'however', or 'in fact', which signals that the speaker is correcting earlier statements.",
            PhoneticTrap: $"Notice the exact spelling and pluralization: the standard Cambridge key is '{correctAnswer}'."
        );
    }
}
