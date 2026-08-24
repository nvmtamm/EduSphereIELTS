using System.Text;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Features.Auth.Commands.ResetPassword;
using EduSphere.Domain.Entities;
using EduSphere.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Moq;
using Xunit;

namespace EduSphere.UnitTests.Features.Auth;

public class ResetPasswordCommandHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly ResetPasswordCommandHandler _handler;

    public ResetPasswordCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _cacheMock = new Mock<IDistributedCache>();
        _passwordHasherMock = new Mock<IPasswordHasher>();

        _passwordHasherMock.Setup(p => p.HashPassword("NewPassword123@")).Returns("new_hashed_password");

        _handler = new ResetPasswordCommandHandler(
            _context,
            _cacheMock.Object,
            _passwordHasherMock.Object
        );
    }

    [Fact]
    public async Task Handle_WithValidTokenAndUser_ShouldUpdatePasswordAndRemoveToken()
    {
        // Arrange
        var user = new User("Tam Nguyen", "tam@edusphere.io", "old_hashed_password");
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = "valid_reset_token";
        var cacheKey = $"pwd_reset_token:{token}";
        var tokenBytes = Encoding.UTF8.GetBytes("tam@edusphere.io");

        _cacheMock.Setup(c => c.GetAsync(cacheKey, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokenBytes);

        var command = new ResetPasswordCommand("tam@edusphere.io", token, "NewPassword123@");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Contain("successfully reset");

        var updatedUser = await _context.Users.FirstAsync(u => u.Email == "tam@edusphere.io");
        updatedUser.PasswordHash.Should().Be("new_hashed_password");

        _cacheMock.Verify(c => c.RemoveAsync(cacheKey, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidOrExpiredToken_ShouldReturnFailure()
    {
        // Arrange
        var token = "invalid_token";
        var cacheKey = $"pwd_reset_token:{token}";

        _cacheMock.Setup(c => c.GetAsync(cacheKey, It.IsAny<CancellationToken>()))
            .ReturnsAsync((byte[]?)null);

        var command = new ResetPasswordCommand("tam@edusphere.io", token, "NewPassword123@");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidResetToken");
    }
}
