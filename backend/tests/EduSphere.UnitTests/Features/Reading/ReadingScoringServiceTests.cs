using EduSphere.Domain.Enums;
using EduSphere.Infrastructure.Services;
using FluentAssertions;
using Xunit;

namespace EduSphere.UnitTests.Features.Reading;

public class ReadingScoringServiceTests
{
    private readonly ReadingScoringService _sut = new();

    [Theory]
    [InlineData("TRUE", "TRUE", QuestionType.TrueFalseNotGiven, true)]
    [InlineData("T", "TRUE", QuestionType.TrueFalseNotGiven, true)]
    [InlineData("true", "TRUE", QuestionType.TrueFalseNotGiven, true)]
    [InlineData("FALSE", "FALSE", QuestionType.TrueFalseNotGiven, true)]
    [InlineData("F", "FALSE", QuestionType.TrueFalseNotGiven, true)]
    [InlineData("NOT GIVEN", "NOT GIVEN", QuestionType.TrueFalseNotGiven, true)]
    [InlineData("NG", "NOT GIVEN", QuestionType.TrueFalseNotGiven, true)]
    [InlineData("TRUE", "FALSE", QuestionType.TrueFalseNotGiven, false)]
    public void IsAnswerCorrect_TrueFalseNotGiven_ShouldMatchCorrectly(
        string userAnswer, string correctAnswer, QuestionType questionType, bool expected)
    {
        // Act
        var result = _sut.IsAnswerCorrect(userAnswer, correctAnswer, questionType);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("45", "45 / forty-five", QuestionType.SummaryCompletion, true)]
    [InlineData("forty-five", "45 / forty-five", QuestionType.SummaryCompletion, true)]
    [InlineData("Gears from the Greeks", "Gears from the Greeks", QuestionType.SummaryCompletion, true)]
    [InlineData("gears from the greeks.", "Gears from the Greeks", QuestionType.SummaryCompletion, true)]
    [InlineData("   soil   ", "soil", QuestionType.SummaryCompletion, true)]
    [InlineData("wrong answer", "soil", QuestionType.SummaryCompletion, false)]
    public void IsAnswerCorrect_SummaryCompletion_WithMultipleOptionsAndPunctuation_ShouldMatch(
        string userAnswer, string correctAnswer, QuestionType questionType, bool expected)
    {
        // Act
        var result = _sut.IsAnswerCorrect(userAnswer, correctAnswer, questionType);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(40, 40, 9.0)]
    [InlineData(39, 40, 9.0)]
    [InlineData(37, 40, 8.5)]
    [InlineData(35, 40, 8.0)]
    [InlineData(33, 40, 7.5)]
    [InlineData(30, 40, 7.0)]
    [InlineData(27, 40, 6.5)]
    [InlineData(23, 40, 6.0)]
    [InlineData(19, 40, 5.5)]
    [InlineData(15, 40, 5.0)]
    [InlineData(13, 40, 4.5)]
    [InlineData(10, 40, 4.0)]
    [InlineData(6, 40, 3.5)]
    [InlineData(0, 40, 1.0)]
    public void CalculateBandScore_40Questions_ShouldMatchCambridgeStandards(int rawScore, int totalQuestions, double expectedBand)
    {
        // Act
        var band = _sut.CalculateBandScore(rawScore, totalQuestions);

        // Assert
        band.Should().Be(expectedBand);
    }

    [Fact]
    public void CalculateBandScore_SinglePassage13Questions_ShouldScaleAccurately()
    {
        // 13/13 (100%) -> Scale to 40 -> Band 9.0
        _sut.CalculateBandScore(13, 13).Should().Be(9.0);

        // 11/13 (~85%) -> Scale to 34 -> Band 7.5
        _sut.CalculateBandScore(11, 13).Should().Be(7.5);

        // 10/13 (~77%) -> Scale to 31 -> Band 7.0
        _sut.CalculateBandScore(10, 13).Should().Be(7.0);

        // 8/13 (~61%) -> Scale to 25 -> Band 6.0
        _sut.CalculateBandScore(8, 13).Should().Be(6.0);
    }
}
