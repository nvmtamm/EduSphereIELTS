using System.Text;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Features.Auth.Commands.ForgotPassword;
using EduSphere.Domain.Entities;
using EduSphere.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Moq;
using Xunit;

namespace EduSphere.UnitTests.Features.Auth;

public class ForgotPasswordCommandHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly Mock<IEmailSender> _emailSenderMock;
    private readonly ForgotPasswordCommandHandler _handler;

    public ForgotPasswordCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _cacheMock = new Mock<IDistributedCache>();
        _emailSenderMock = new Mock<IEmailSender>();

        _handler = new ForgotPasswordCommandHandler(
            _context,
            _cacheMock.Object,
            _emailSenderMock.Object
        );
    }

    [Fact]
    public async Task Handle_WithExistingUser_ShouldSetOtpInCacheAndSendEmail()
    {
        // Arrange
        var user = new User("Tam Nguyen", "tam@edusphere.io", "hashed_password");
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var command = new ForgotPasswordCommand("tam@edusphere.io");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Contain("verification code");

        _cacheMock.Verify(c => c.SetAsync(
            It.Is<string>(k => k.StartsWith("pwd_reset_otp:")),
            It.IsAny<byte[]>(),
            It.IsAny<DistributedCacheEntryOptions>(),
            It.IsAny<CancellationToken>()
        ), Times.Once);

        _emailSenderMock.Verify(e => e.SendPasswordResetOtpAsync(
            "tam@edusphere.io",
            It.Is<string>(s => s.Length == 6),
            "Tam Nguyen",
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistingUser_ShouldReturnGenericSuccessToPreventEnumeration()
    {
        // Arrange
        var command = new ForgotPasswordCommand("unknown@edusphere.io");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Contain("verification code");

        _emailSenderMock.Verify(e => e.SendPasswordResetOtpAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()
        ), Times.Never);
    }
}
