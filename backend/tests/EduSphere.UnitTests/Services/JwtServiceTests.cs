using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using EduSphere.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace EduSphere.UnitTests.Services;

public class JwtServiceTests
{
    private readonly JwtService _jwtService;

    public JwtServiceTests()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "VeryStrongAndSecureSecretKeyWithAtLeast32BytesForTesting2026!",
                ["Jwt:Issuer"] = "https://test.edusphere.io",
                ["Jwt:Audience"] = "https://test.edusphere.io",
                ["Jwt:ExpiryMinutes"] = "15"
            })
            .Build();

        _jwtService = new JwtService(configuration);
    }

    [Fact]
    public void GenerateAccessToken_ShouldProduceValidJwtTokenWithExpectedClaims()
    {
        // Arrange
        var user = new User("Tam Nguyen", "tam@edusphere.io", "hashed_pwd", UserRole.Student, 7.5f);

        // Act
        var token = _jwtService.GenerateAccessToken(user);

        // Assert
        token.Should().NotBeNullOrWhiteSpace();

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == user.Id.ToString());
        jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == user.Email);
        jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Name && c.Value == user.FullName);
        jwtToken.Claims.Should().Contain(c => (c.Type == "role" || c.Type == ClaimTypes.Role) && c.Value == "Student");
        jwtToken.Claims.Should().Contain(c => c.Type == "targetBandScore" && c.Value == "7.5");
        jwtToken.Issuer.Should().Be("https://test.edusphere.io");
        jwtToken.Audiences.Should().Contain("https://test.edusphere.io");
    }

    [Fact]
    public void GenerateRefreshToken_ShouldReturn32ByteBase64String()
    {
        // Act
        var refreshToken1 = _jwtService.GenerateRefreshToken();
        var refreshToken2 = _jwtService.GenerateRefreshToken();

        // Assert
        refreshToken1.Should().NotBeNullOrWhiteSpace();
        refreshToken2.Should().NotBeNullOrWhiteSpace();
        refreshToken1.Should().NotBe(refreshToken2);

        var bytes = Convert.FromBase64String(refreshToken1);
        bytes.Length.Should().Be(32);
    }
}
