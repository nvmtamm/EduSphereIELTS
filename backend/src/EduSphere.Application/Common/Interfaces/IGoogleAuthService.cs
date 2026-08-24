namespace EduSphere.Application.Common.Interfaces;

public record GooglePayload(string Email, string Name, string? Picture, string Subject);

public interface IGoogleAuthService
{
    Task<GooglePayload?> VerifyGoogleTokenAsync(string idToken, CancellationToken cancellationToken = default);
}
