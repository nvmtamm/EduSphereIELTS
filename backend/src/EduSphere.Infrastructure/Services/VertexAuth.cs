using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace EduSphere.Infrastructure.Services;

/// <summary>Minimal Google service-account OAuth (JWT bearer) token provider for Vertex AI. No Google SDK required.</summary>
public static class VertexAuth
{
    private static readonly SemaphoreSlim Gate = new(1, 1);
    private static string? _token;
    private static DateTime _expiresUtc = DateTime.MinValue;

    public static string? ResolvePath(string? configured)
    {
        if (string.IsNullOrWhiteSpace(configured)) return null;
        if (Path.IsPathRooted(configured)) return File.Exists(configured) ? configured : null;

        // Resolve relative paths against the current dir and its parents (the repo root holds .env and secrets/).
        var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (dir is not null)
        {
            var candidate = Path.Combine(dir.FullName, configured);
            if (File.Exists(candidate)) return candidate;
            dir = dir.Parent;
        }
        return null;
    }

    public static async Task<string> GetTokenAsync(HttpClient http, string credentialsPath, CancellationToken ct)
    {
        if (_token is not null && DateTime.UtcNow < _expiresUtc.AddMinutes(-2)) return _token;

        await Gate.WaitAsync(ct);
        try
        {
            if (_token is not null && DateTime.UtcNow < _expiresUtc.AddMinutes(-2)) return _token;

            using var sa = JsonDocument.Parse(await File.ReadAllTextAsync(credentialsPath, ct));
            var email = sa.RootElement.GetProperty("client_email").GetString()!;
            var tokenUri = sa.RootElement.GetProperty("token_uri").GetString()!;
            var pem = sa.RootElement.GetProperty("private_key").GetString()!;

            using var rsa = RSA.Create();
            rsa.ImportFromPem(pem);

            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var header = B64(JsonSerializer.SerializeToUtf8Bytes(new { alg = "RS256", typ = "JWT" }));
            var claims = B64(JsonSerializer.SerializeToUtf8Bytes(new
            {
                iss = email,
                scope = "https://www.googleapis.com/auth/cloud-platform",
                aud = tokenUri,
                iat = now,
                exp = now + 3600
            }));
            var unsigned = $"{header}.{claims}";
            var sig = B64(rsa.SignData(Encoding.UTF8.GetBytes(unsigned), HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1));

            var res = await http.PostAsync(tokenUri, new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "urn:ietf:params:oauth:grant-type:jwt-bearer",
                ["assertion"] = $"{unsigned}.{sig}"
            }), ct);
            res.EnsureSuccessStatusCode();

            using var body = JsonDocument.Parse(await res.Content.ReadAsStringAsync(ct));
            _token = body.RootElement.GetProperty("access_token").GetString()!;
            _expiresUtc = DateTime.UtcNow.AddSeconds(body.RootElement.GetProperty("expires_in").GetInt32());
            return _token;
        }
        finally
        {
            Gate.Release();
        }
    }

    private static string B64(byte[] data) => Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
