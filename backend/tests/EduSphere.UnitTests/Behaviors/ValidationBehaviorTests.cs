using EduSphere.Application.Common.Behaviors;
using FluentAssertions;
using FluentValidation;
using MediatR;
using Moq;
using Xunit;
using ValidationException = EduSphere.Application.Common.Exceptions.ValidationException;

namespace EduSphere.UnitTests.Behaviors;

public record SampleCommand(string Email) : IRequest<string>;

public class SampleCommandValidator : AbstractValidator<SampleCommand>
{
    public SampleCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class ValidationBehaviorTests
{
    [Fact]
    public async Task Handle_WithValidRequest_ShouldCallNextDelegate()
    {
        // Arrange
        var validators = new List<IValidator<SampleCommand>> { new SampleCommandValidator() };
        var behavior = new ValidationBehavior<SampleCommand, string>(validators);
        var request = new SampleCommand("valid@edusphere.io");
        var nextMock = new Mock<RequestHandlerDelegate<string>>();
        nextMock.Setup(n => n()).ReturnsAsync("SuccessResponse");

        // Act
        var result = await behavior.Handle(request, nextMock.Object, CancellationToken.None);

        // Assert
        result.Should().Be("SuccessResponse");
        nextMock.Verify(n => n(), Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidRequest_ShouldThrowValidationException()
    {
        // Arrange
        var validators = new List<IValidator<SampleCommand>> { new SampleCommandValidator() };
        var behavior = new ValidationBehavior<SampleCommand, string>(validators);
        var request = new SampleCommand("invalid-email-format");
        var nextMock = new Mock<RequestHandlerDelegate<string>>();

        // Act
        var act = () => behavior.Handle(request, nextMock.Object, CancellationToken.None);

        // Assert
        var exception = await act.Should().ThrowAsync<ValidationException>();
        exception.Which.Errors.Should().ContainKey("Email");
        nextMock.Verify(n => n(), Times.Never);
    }

    [Fact]
    public async Task Handle_WithNoValidators_ShouldPassDirectlyToNext()
    {
        // Arrange
        var validators = Enumerable.Empty<IValidator<SampleCommand>>();
        var behavior = new ValidationBehavior<SampleCommand, string>(validators);
        var request = new SampleCommand("any-value");
        var nextMock = new Mock<RequestHandlerDelegate<string>>();
        nextMock.Setup(n => n()).ReturnsAsync("BypassedResponse");

        // Act
        var result = await behavior.Handle(request, nextMock.Object, CancellationToken.None);

        // Assert
        result.Should().Be("BypassedResponse");
        nextMock.Verify(n => n(), Times.Once);
    }
}
