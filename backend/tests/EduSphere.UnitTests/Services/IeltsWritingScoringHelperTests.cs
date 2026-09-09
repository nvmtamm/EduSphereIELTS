using EduSphere.Domain.Common;
using FluentAssertions;
using Xunit;

namespace EduSphere.UnitTests.Services;

public class IeltsWritingScoringHelperTests
{
    [Theory]
    [InlineData(6.0f, 6.0f, 6.0f, 6.0f, 6.0f)] // Exactly 6.0 -> 6.0
    [InlineData(6.5f, 6.0f, 6.0f, 6.0f, 6.0f)] // 24.5 / 4 = 6.125 -> 6.0 (< 0.25)
    [InlineData(6.5f, 6.5f, 6.0f, 6.0f, 6.5f)] // 25.0 / 4 = 6.25 -> 6.5 (>= 0.25)
    [InlineData(6.5f, 6.5f, 6.5f, 6.0f, 6.5f)] // 25.5 / 4 = 6.375 -> 6.5 (< 0.75)
    [InlineData(6.5f, 6.5f, 6.5f, 6.5f, 6.5f)] // 26.0 / 4 = 6.5 -> 6.5
    [InlineData(7.0f, 6.5f, 6.5f, 6.5f, 6.5f)] // 26.5 / 4 = 6.625 -> 6.5 (< 0.75)
    [InlineData(7.0f, 7.0f, 6.5f, 6.5f, 7.0f)] // 27.0 / 4 = 6.75 -> 7.0 (>= 0.75)
    [InlineData(7.0f, 7.0f, 7.0f, 6.5f, 7.0f)] // 27.5 / 4 = 6.875 -> 7.0 (>= 0.75)
    [InlineData(8.5f, 8.5f, 8.5f, 8.5f, 8.5f)] // Exactly 8.5 -> 8.5
    [InlineData(9.0f, 9.0f, 9.0f, 9.0f, 9.0f)] // Max 9.0 -> 9.0
    public void CalculateOverallBand_ShouldFollowOfficialCambridgeRules(
        float ta, float cc, float lr, float gra, float expectedBand)
    {
        // Act
        var result = IeltsWritingScoringHelper.CalculateOverallBand(ta, cc, lr, gra);

        // Assert
        result.Should().Be(expectedBand);
    }

    [Theory]
    [InlineData("Hello world", 2)]
    [InlineData("<p>This is a <strong>rich text</strong> paragraph.</p>", 6)]
    [InlineData("Task-oriented programming requires high-level abstractions and deep-dive analysis.", 8)]
    [InlineData("", 0)]
    [InlineData("   ", 0)]
    public void CountWords_ShouldAccuratelyCountWords(string input, int expectedCount)
    {
        // Act
        var result = IeltsWritingScoringHelper.CountWords(input);

        // Assert
        result.Should().Be(expectedCount);
    }
}
