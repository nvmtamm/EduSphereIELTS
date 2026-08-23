using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public UserRole Role { get; private set; } = UserRole.Student;
    public float? TargetBandScore { get; private set; }

    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }

    // Parameterless constructor for EF Core
    private User() { }

    public User(string fullName, string email, string passwordHash, UserRole role = UserRole.Student, float? targetBandScore = null)
    {
        FullName = fullName;
        Email = email.Trim().ToLowerInvariant();
        PasswordHash = passwordHash;
        Role = role;
        TargetBandScore = targetBandScore;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetRefreshToken(string refreshToken, DateTime expiryTime)
    {
        RefreshToken = refreshToken;
        RefreshTokenExpiryTime = expiryTime;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiryTime = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsRefreshTokenValid(string refreshToken)
    {
        return !string.IsNullOrWhiteSpace(RefreshToken)
            && RefreshToken == refreshToken
            && RefreshTokenExpiryTime.HasValue
            && RefreshTokenExpiryTime.Value > DateTime.UtcNow;
    }

    public void UpdateProfile(string fullName, float? targetBandScore)
    {
        FullName = fullName;
        TargetBandScore = targetBandScore;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateTargetBandScore(float targetBandScore)
    {
        TargetBandScore = targetBandScore;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        UpdatedAt = DateTime.UtcNow;
    }
}
