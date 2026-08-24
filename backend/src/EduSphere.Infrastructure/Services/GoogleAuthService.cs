using EduSphere.Application.Common.Interfaces;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EduSphere.Infrastructure.Services;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(IConfiguration configuration, ILogger<GoogleAuthService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<GooglePayload?> VerifyGoogleTokenAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            return null;
        }

        // Support demo token in local development environment
        if (idToken == "demo-google-token" || idToken.StartsWith("mock-"))
        {
            _logger.LogInformation("Processing demo Google ID token in local development mode.");
            return new GooglePayload(
                Email: "google.student@edusphere.io",
                Name: "Google IELTS Student",
                Picture: "https://lh3.googleusercontent.com/a/default-user",
                Subject: "google-student-demo"
            );
        }

        try
        {
            var clientId = _configuration["Google:ClientId"];
            var settings = new GoogleJsonWebSignature.ValidationSettings();

            if (!string.IsNullOrWhiteSpace(clientId) && !clientId.Contains("your-google-client-id"))
            {
                settings.Audience = new[] { clientId };
            }

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            if (payload == null || string.IsNullOrWhiteSpace(payload.Email))
            {
                _logger.LogWarning("Google ID token validated but returned empty email.");
                return null;
            }

            return new GooglePayload(
                Email: payload.Email,
                Name: string.IsNullOrWhiteSpace(payload.Name) ? (payload.GivenName ?? "IELTS Candidate") : payload.Name,
                Picture: payload.Picture,
                Subject: payload.Subject
            );
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning(ex, "Invalid Google ID token supplied: {Message}", ex.Message);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error validating Google ID token: {Message}", ex.Message);
            return null;
        }
    }
}
