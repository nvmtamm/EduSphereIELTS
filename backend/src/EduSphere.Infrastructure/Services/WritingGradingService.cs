using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using EduSphere.Application.Common;
using EduSphere.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EduSphere.Infrastructure.Services;

public class WritingGradingService : IWritingGradingService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<WritingGradingService> _logger;

    public WritingGradingService(HttpClient http, IConfiguration config, ILogger<WritingGradingService> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public async Task<WritingGradeResult> GradeAsync(string taskType, string promptText, string? dataText, string essay,
        CancellationToken cancellationToken = default)
    {
        var apiKey = _config["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        var model = _config["Gemini:ChatModel"] ?? "gemini-1.5-flash";

        var useVertex = string.Equals(_config["Vertex:Enabled"], "true", StringComparison.OrdinalIgnoreCase);
        var credentialsPath = useVertex ? VertexAuth.ResolvePath(_config["Vertex:CredentialsPath"]) : null;
        useVertex = useVertex && credentialsPath is not null && !string.IsNullOrWhiteSpace(_config["Vertex:Project"]);
        var hasApiKey = !string.IsNullOrWhiteSpace(apiKey) && !apiKey.Contains("your-gemini");

        if (!useVertex && !hasApiKey)
            return Heuristic(essay);

        var prompt = BuildPrompt(taskType, promptText, dataText, essay);
        for (var attempt = 0; attempt < 2; attempt++)
        {
            try
            {
                var body = new
                {
                    contents = new[] { new { role = "user", parts = new[] { new { text = prompt } } } },
                    generationConfig = new { temperature = 0.2, responseMimeType = "application/json" }
                };

                HttpRequestMessage request;
                if (useVertex)
                {
                    var location = _config["Vertex:Location"] ?? "asia-southeast1";
                    var vModel = _config["Vertex:Model"] ?? "gemini-2.5-flash";
                    var uri = $"https://{location}-aiplatform.googleapis.com/v1/projects/{_config["Vertex:Project"]}/locations/{location}/publishers/google/models/{vModel}:generateContent";
                    request = new HttpRequestMessage(HttpMethod.Post, uri);
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
                        "Bearer", await VertexAuth.GetTokenAsync(_http, credentialsPath!, cancellationToken));
                }
                else
                {
                    request = new HttpRequestMessage(HttpMethod.Post,
                        $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}");
                }
                request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

                var res = await _http.SendAsync(request, cancellationToken);
                if (!res.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Gemini writing grading failed: {Status} {Body}", res.StatusCode,
                        (await res.Content.ReadAsStringAsync(cancellationToken))[..Math.Min(300, (int)Math.Min(int.MaxValue, res.Content.Headers.ContentLength ?? 300))]);
                    continue;
                }

                using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync(cancellationToken));
                var text = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0]
                    .GetProperty("text").GetString() ?? string.Empty;
                var parsed = TryParse(text);
                if (parsed is not null) return parsed;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Writing grading attempt {Attempt} failed", attempt + 1);
            }
        }

        return Heuristic(essay);
    }

    private static string BuildPrompt(string taskType, string promptText, string? dataText, string essay) => $$"""
        You are a strict, fair IELTS Writing examiner. Grade the essay using the four official criteria:
        Task Response/Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy.
        Bands must be multiples of 0.5 between 0 and 9. Reply with JSON ONLY in exactly this shape:
        {"taskResponse":6.0,"coherenceCohesion":6.0,"lexicalResource":6.0,"grammaticalRange":6.0,
         "summary":"2-3 sentences","criterionComments":{"taskResponse":"...","coherenceCohesion":"...","lexicalResource":"...","grammaticalRange":"..."},
         "errors":[{"quote":"exact words from the essay","correction":"improved version","category":"Grammar|Vocabulary|Coherence","explanation":"why"}],
         "vocabularySuggestions":["more academic word or phrase"]}
        Give at most 8 errors; every quote must appear verbatim in the essay.

        TASK TYPE: {{taskType}}
        QUESTION: {{promptText}}
        DATA: {{dataText ?? "(none)"}}
        ESSAY:
        {{essay}}
        """;

    public static WritingGradeResult? TryParse(string json)
    {
        try
        {
            var cleaned = Regex.Replace(json.Trim(), "^```(?:json)?|```$", "", RegexOptions.Multiline).Trim();
            using var doc = JsonDocument.Parse(cleaned);
            var r = doc.RootElement;
            decimal Band(string name) => WritingBand.Snap(r.GetProperty(name).GetDecimal());

            var comments = new Dictionary<string, string>();
            if (r.TryGetProperty("criterionComments", out var cc) && cc.ValueKind == JsonValueKind.Object)
                foreach (var p in cc.EnumerateObject()) comments[p.Name] = p.Value.GetString() ?? string.Empty;

            var errors = new List<WritingError>();
            if (r.TryGetProperty("errors", out var errs) && errs.ValueKind == JsonValueKind.Array)
                foreach (var e in errs.EnumerateArray().Take(8))
                    errors.Add(new WritingError(
                        e.GetProperty("quote").GetString() ?? "",
                        e.TryGetProperty("correction", out var c) ? c.GetString() ?? "" : "",
                        e.TryGetProperty("category", out var cat) ? cat.GetString() ?? "Grammar" : "Grammar",
                        e.TryGetProperty("explanation", out var ex) ? ex.GetString() ?? "" : ""));

            var vocab = new List<string>();
            if (r.TryGetProperty("vocabularySuggestions", out var v) && v.ValueKind == JsonValueKind.Array)
                vocab.AddRange(v.EnumerateArray().Select(x => x.GetString() ?? "").Where(x => x.Length > 0));

            return new WritingGradeResult(Band("taskResponse"), Band("coherenceCohesion"), Band("lexicalResource"),
                Band("grammaticalRange"), r.TryGetProperty("summary", out var s) ? s.GetString() ?? "" : "",
                comments, errors, vocab, "Gemini");
        }
        catch
        {
            return null;
        }
    }

    /// <summary>Offline estimate used when no Gemini key is configured. Clearly labelled so users know it is approximate.</summary>
    public static WritingGradeResult Heuristic(string essay)
    {
        var words = WritingBand.CountWords(essay);
        var sentences = Regex.Split(essay, @"(?<=[.!?])\s+").Count(s => s.Trim().Length > 0);
        var paragraphs = Regex.Split(essay.Trim(), @"\n\s*\n").Count(p => p.Trim().Length > 0);
        var distinct = essay.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)
            .Select(w => w.Trim(',', '.', ';', ':', '"', '(', ')').ToLowerInvariant()).Where(w => w.Length > 0).Distinct().Count();
        var variety = words == 0 ? 0m : (decimal)distinct / words;

        var tr = words >= 250 ? 6.0m : words >= 150 ? 5.0m : 4.0m;
        var cc = paragraphs >= 4 ? 6.0m : paragraphs >= 3 ? 5.5m : 5.0m;
        var lr = variety > 0.6m ? 6.5m : variety > 0.45m ? 6.0m : 5.5m;
        var avgLen = sentences == 0 ? 0 : words / sentences;
        var gra = avgLen is >= 12 and <= 28 ? 6.0m : 5.5m;

        return new WritingGradeResult(tr, cc, lr, gra,
            "Offline estimate (no AI key configured): based on length, paragraphing, vocabulary variety and sentence length only. Configure a Gemini API key for full examiner-style feedback.",
            new Dictionary<string, string>
            {
                ["taskResponse"] = $"Word count: {words}. Make sure you answer every part of the question.",
                ["coherenceCohesion"] = $"{paragraphs} paragraph(s) detected. Use one clear idea per paragraph.",
                ["lexicalResource"] = $"{distinct} distinct words used. Vary your vocabulary and avoid repetition.",
                ["grammaticalRange"] = $"Average sentence length is {avgLen} words. Mix simple and complex sentences."
            },
            new List<WritingError>(), new List<string>(), "Heuristic");
    }
}
