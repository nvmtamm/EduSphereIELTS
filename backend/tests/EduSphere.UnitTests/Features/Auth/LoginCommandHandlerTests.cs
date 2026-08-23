using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Features.Auth.Commands.Login;
using EduSphere.Domain.Entities;
using EduSphere.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace EduSphere.UnitTests.Features.Auth;

public class LoginCommandHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtServiceMock = new Mock<IJwtService>();

        _jwtServiceMock.Setup(j => j.GetAccessTokenExpiryMinutes()).Returns(15);
        _jwtServiceMock.Setup(j => j.GenerateAccessToken(It.IsAny<User>())).Returns("fake_access_token");
        _jwtServiceMock.Setup(j => j.GenerateRefreshToken()).Returns("fake_refresh_token");

        _handler = new LoginCommandHandler(_context, _passwordHasherMock.Object, _jwtServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCredentials_ShouldReturnAuthResponse()
    {
        // Arrange
        var user = new User("Tam Nguyen", "tam@edusphere.io", "hashed_password", targetBandScore: 7.0f);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _passwordHasherMock.Setup(p => p.VerifyPassword("Password123@", "hashed_password")).Returns(true);

        var command = new LoginCommand("tam@edusphere.io", "Password123@");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.AccessToken.Should().Be("fake_access_token");
        result.Value.RefreshToken.Should().Be("fake_refresh_token");
        result.Value.User.Email.Should().Be("tam@edusphere.io");
        result.Value.User.TargetBandScore.Should().Be(7.0f);
    }

    [Fact]
    public async Task Handle_WithInvalidPassword_ShouldReturnFailureResult()
    {
        // Arrange
        var user = new User("Tam Nguyen", "tam@edusphere.io", "hashed_password");
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _passwordHasherMock.Setup(p => p.VerifyPassword("WrongPassword", "hashed_password")).Returns(false);

        var command = new LoginCommand("tam@edusphere.io", "WrongPassword");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("Auth.InvalidCredentials");
    }

    [Fact]
    public async Task Handle_WithNonExistentEmail_ShouldReturnFailureResult()
    {
        // Arrange
        var command = new LoginCommand("nonexistent@edusphere.io", "Password123@");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("Auth.InvalidCredentials");
    }
}
