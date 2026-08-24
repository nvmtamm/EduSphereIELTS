using EduSphere.Application.Features.Auth.Commands.UpdateProfile;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using EduSphere.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace EduSphere.UnitTests.Features.Auth;

public class UpdateProfileCommandHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly UpdateProfileCommandHandler _handler;

    public UpdateProfileCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _handler = new UpdateProfileCommandHandler(_context);
    }

    [Fact]
    public async Task Handle_WhenUserExists_ShouldUpdateProfileSuccessfully()
    {
        // Arrange
        var user = new User("Old Name", "test@edusphere.io", "hashed_pwd", UserRole.Student, 6.5f);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var command = new UpdateProfileCommand(user.Id, "New Name", 8.0f);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.FullName.Should().Be("New Name");
        result.Value.TargetBandScore.Should().Be(8.0f);

        var updated = await _context.Users.FindAsync(user.Id);
        updated!.FullName.Should().Be("New Name");
        updated.TargetBandScore.Should().Be(8.0f);
    }

    [Fact]
    public async Task Handle_WhenUserNotFound_ShouldReturnFailure()
    {
        // Arrange
        var command = new UpdateProfileCommand(Guid.NewGuid(), "New Name", 8.0f);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.NotFound");
    }
}
