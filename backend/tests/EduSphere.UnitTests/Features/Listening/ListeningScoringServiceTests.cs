using EduSphere.Domain.Enums;
using EduSphere.Infrastructure.Services;
using Xunit;

namespace EduSphere.UnitTests.Features.Listening;

public class ListeningScoringServiceTests
{
    private readonly ListeningScoringService _sut = new();

    [Theory]
    [InlineData("three", "3 / three", QuestionType.FormCompletion, true)]
    [InlineData("3", "3 / three", QuestionType.FormCompletion, true)]
    [InlineData("Hemmings", "Hemmings", QuestionType.FormCompletion, true)]
    [InlineData("hemmings", "Hemmings", QuestionType.FormCompletion, true)]
    [InlineData("  HEMMINGS  ", "Hemmings", QuestionType.FormCompletion, true)]
    [InlineData("library", "(the) library", QuestionType.NoteCompletion, true)]
    [InlineData("the library", "(the) library", QuestionType.NoteCompletion, true)]
    [InlineData("A", "A", QuestionType.MultipleChoice, true)]
    [InlineData("a", "A", QuestionType.MultipleChoice, true)]
    [InlineData("A. First option", "A", QuestionType.MultipleChoice, true)]
    [InlineData("wrong answer", "correct answer", QuestionType.FormCompletion, false)]
    public void IsAnswerCorrect_ShouldAccuratelyMatchVariousFormats(string userAnswer, string correctAnswer, QuestionType qType, bool expected)
    {
        var result = _sut.IsAnswerCorrect(userAnswer, correctAnswer, qType);
        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(40, 40, 9.0)]
    [InlineData(39, 40, 9.0)]
    [InlineData(37, 40, 8.5)]
    [InlineData(35, 40, 8.0)]
    [InlineData(32, 40, 7.5)]
    [InlineData(30, 40, 7.0)]
    [InlineData(26, 40, 6.5)]
    [InlineData(23, 40, 6.0)]
    [InlineData(18, 40, 5.5)]
    [InlineData(16, 40, 5.0)]
    [InlineData(10, 40, 4.0)]
    [InlineData(0, 40, 1.0)]
    public void CalculateBandScore_ShouldReturnAccurateCambridgeListeningBands(int raw, int total, double expectedBand)
    {
        var band = _sut.CalculateBandScore(raw, total);
        Assert.Equal(expectedBand, band);
    }
}
