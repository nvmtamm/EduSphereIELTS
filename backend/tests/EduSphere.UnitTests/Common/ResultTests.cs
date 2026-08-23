using EduSphere.Application.Common.Models;
using FluentAssertions;
using Xunit;

namespace EduSphere.UnitTests.Common;

public class ResultTests
{
    [Fact]
    public void Success_ShouldCreateSuccessfulResult()
    {
        // Act
        var result = Result.Success("Sample Value");

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.IsFailure.Should().BeFalse();
        result.Value.Should().Be("Sample Value");
        result.Error.Should().Be(Error.None);
    }

    [Fact]
    public void Failure_ShouldCreateFailedResult()
    {
        // Arrange
        var customError = new Error("User.NotFound", "The user was not found.");

        // Act
        var result = Result.Failure<string>(customError);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(customError);
    }

    [Fact]
    public void AccessingValueOnFailure_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var customError = new Error("Error.Code", "Error message");
        var result = Result.Failure<string>(customError);

        // Act
        var action = () => _ = result.Value;

        // Assert
        action.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void ImplicitOperator_WithNonNullValue_ShouldReturnSuccessResult()
    {
        // Act
        Result<string> result = "Implicit Value";

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be("Implicit Value");
    }

    [Fact]
    public void ImplicitOperator_WithNullValue_ShouldReturnFailureResult()
    {
        // Act
        string? nullString = null;
        Result<string> result = nullString;

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(Error.NullValue);
    }
}
