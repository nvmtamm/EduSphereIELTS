using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Features.Auth.Commands.Register;
using EduSphere.Domain.Entities;
using EduSphere.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace EduSphere.UnitTests.Features.Auth;

public class RegisterCommandHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly RegisterCommandHandler _handler;

    public RegisterCommandHandlerTests()
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

        _handler = new RegisterCommandHandler(_context, _passwordHasherMock.Object, _jwtServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidRequest_ShouldRegisterUserSuccessfully()
    {
        // Arrange
        var command = new RegisterCommand("Tam Nguyen", "tam@edusphere.io", "Password123@", 7.5f);
        _passwordHasherMock.Setup(p => p.HashPassword("Password123@")).Returns("hashed_password");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.AccessToken.Should().Be("fake_access_token");
        result.Value.RefreshToken.Should().Be("fake_refresh_token");
        result.Value.User.Email.Should().Be("tam@edusphere.io");
        result.Value.User.FullName.Should().Be("Tam Nguyen");
        result.Value.User.TargetBandScore.Should().Be(7.5f);

        var savedUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "tam@edusphere.io");
        savedUser.Should().NotBeNull();
        savedUser!.FullName.Should().Be("Tam Nguyen");
        savedUser.RefreshToken.Should().Be("fake_refresh_token");
    }

    [Fact]
    public async Task Handle_WithDuplicateEmail_ShouldReturnFailureResult()
    {
        // Arrange
        var existingUser = new User("Existing User", "tam@edusphere.io", "hashed_pass");
        _context.Users.Add(existingUser);
        await _context.SaveChangesAsync();

        var command = new RegisterCommand("Another User", "tam@edusphere.io", "Password123@", 8.0f);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("Auth.EmailAlreadyExists");
    }
}
