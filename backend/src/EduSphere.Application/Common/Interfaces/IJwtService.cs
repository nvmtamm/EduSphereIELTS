using System.Security.Claims;
using EduSphere.Domain.Entities;

namespace EduSphere.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    int GetAccessTokenExpiryMinutes();
}
