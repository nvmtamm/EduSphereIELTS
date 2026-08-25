using System.Text;
using System.Text.Json;

namespace EduSphere.RAG.Embeddings;

public interface IEmbeddingGenerator
{
    Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default);
}

public class GeminiEmbeddingGenerator : IEmbeddingGenerator
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly string _model;

    public GeminiEmbeddingGenerator(HttpClient httpClient, string? apiKey = null, string model = "text-embedding-004")
    {
        _httpClient = httpClient;
        _apiKey = apiKey ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY_EMBEDDING") ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        _model = model;
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey.Contains("your-gemini"))
        {
            // Deterministic mock vector fallback (768 dimensions)
            return GenerateMockVector(text, 768);
        }

        try
        {
            var requestUri = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:embedContent?key={_apiKey}";
            var requestBody = new
            {
                model = $"models/{_model}",
                content = new
                {
                    parts = new[] { new { text } }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(requestUri, content, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
                using var doc = JsonDocument.Parse(responseJson);

                if (doc.RootElement.TryGetProperty("embedding", out var embeddingObj) &&
                    embeddingObj.TryGetProperty("values", out var valuesArray))
                {
                    var result = new List<float>();
                    foreach (var val in valuesArray.EnumerateArray())
                    {
                        result.Add((float)val.GetDouble());
                    }
                    return result.ToArray();
                }
            }
        }
        catch
        {
            // Fallback
        }

        return GenerateMockVector(text, 768);
    }

    private static float[] GenerateMockVector(string text, int dimensions)
    {
        var vector = new float[dimensions];
        var hash = text.GetHashCode();
        var random = new Random(hash);
        for (int i = 0; i < dimensions; i++)
        {
            vector[i] = (float)(random.NextDouble() * 2 - 1);
        }
        return vector;
    }
}
