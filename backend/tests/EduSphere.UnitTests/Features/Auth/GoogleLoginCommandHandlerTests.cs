using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Features.Auth.Commands.GoogleLogin;
using EduSphere.Domain.Entities;
using EduSphere.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace EduSphere.UnitTests.Features.Auth;

public class GoogleLoginCommandHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IGoogleAuthService> _googleAuthServiceMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly GoogleLoginCommandHandler _handler;

    public GoogleLoginCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _googleAuthServiceMock = new Mock<IGoogleAuthService>();
        _jwtServiceMock = new Mock<IJwtService>();
        _passwordHasherMock = new Mock<IPasswordHasher>();

        _jwtServiceMock.Setup(j => j.GetAccessTokenExpiryMinutes()).Returns(15);
        _jwtServiceMock.Setup(j => j.GenerateAccessToken(It.IsAny<User>())).Returns("fake_google_access_token");
        _jwtServiceMock.Setup(j => j.GenerateRefreshToken()).Returns("fake_google_refresh_token");
        _passwordHasherMock.Setup(p => p.HashPassword(It.IsAny<string>())).Returns("hashed_dummy_password");

        _handler = new GoogleLoginCommandHandler(
            _context,
            _googleAuthServiceMock.Object,
            _jwtServiceMock.Object,
            _passwordHasherMock.Object
        );
    }

    [Fact]
    public async Task Handle_WithValidGoogleToken_ForNewUser_ShouldCreateUserAndReturnTokens()
    {
        // Arrange
        var payload = new GooglePayload("alex@gmail.com", "Alex Morgan", "https://photo.jpg", "sub123");
        _googleAuthServiceMock
            .Setup(g => g.VerifyGoogleTokenAsync("valid_google_token", It.IsAny<CancellationToken>()))
            .ReturnsAsync(payload);

        var command = new GoogleLoginCommand("valid_google_token");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.AccessToken.Should().Be("fake_google_access_token");
        result.Value.RefreshToken.Should().Be("fake_google_refresh_token");
        result.Value.User.Email.Should().Be("alex@gmail.com");
        result.Value.User.FullName.Should().Be("Alex Morgan");

        var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "alex@gmail.com");
        dbUser.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_WithInvalidGoogleToken_ShouldReturnFailure()
    {
        // Arrange
        _googleAuthServiceMock
            .Setup(g => g.VerifyGoogleTokenAsync("invalid_token", It.IsAny<CancellationToken>()))
            .ReturnsAsync((GooglePayload?)null);

        var command = new GoogleLoginCommand("invalid_token");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidGoogleToken");
    }
}
