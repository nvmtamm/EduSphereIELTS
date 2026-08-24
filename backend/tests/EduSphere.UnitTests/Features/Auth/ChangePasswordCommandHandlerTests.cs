using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Features.Auth.Commands.ChangePassword;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using EduSphere.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace EduSphere.UnitTests.Features.Auth;

public class ChangePasswordCommandHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IPasswordHasher> _mockPasswordHasher;
    private readonly ChangePasswordCommandHandler _handler;

    public ChangePasswordCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _mockPasswordHasher = new Mock<IPasswordHasher>();
        _handler = new ChangePasswordCommandHandler(_context, _mockPasswordHasher.Object);
    }

    [Fact]
    public async Task Handle_WhenPasswordIsCorrect_ShouldUpdatePasswordSuccessfully()
    {
        // Arrange
        var user = new User("Minh Tam", "test@edusphere.io", "old_hash", UserRole.Student, 7.5f);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _mockPasswordHasher.Setup(p => p.VerifyPassword("OldPassword123@", "old_hash")).Returns(true);
        _mockPasswordHasher.Setup(p => p.HashPassword("NewPassword456@")).Returns("new_hash");

        var command = new ChangePasswordCommand(user.Id, "OldPassword123@", "NewPassword456@");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var updated = await _context.Users.FindAsync(user.Id);
        updated!.PasswordHash.Should().Be("new_hash");
    }

    [Fact]
    public async Task Handle_WhenCurrentPasswordIsInvalid_ShouldReturnFailure()
    {
        // Arrange
        var user = new User("Minh Tam", "test@edusphere.io", "old_hash", UserRole.Student, 7.5f);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _mockPasswordHasher.Setup(p => p.VerifyPassword("WrongPassword123@", "old_hash")).Returns(false);

        var command = new ChangePasswordCommand(user.Id, "WrongPassword123@", "NewPassword456@");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidCurrentPassword");
    }
}
