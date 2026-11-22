using EduSphere.Application.Common;
using EduSphere.Infrastructure.Services;

namespace EduSphere.UnitTests.Services;

public class WritingBandTests
{
    [Theory]
    [InlineData(6.0, 6.0, 6.0, 6.0, 6.0)]
    [InlineData(6.0, 6.0, 6.5, 6.5, 6.5)]   // 6.25 -> 6.5
    [InlineData(6.0, 6.5, 6.5, 6.5, 6.5)]   // 6.375 -> 6.5
    [InlineData(6.5, 6.5, 6.5, 7.0, 6.5)]   // 6.625 -> 6.5
    [InlineData(6.5, 7.0, 7.0, 7.0, 7.0)]   // 6.875 -> 7.0
    public void Overall_RoundsToNearestHalfBand(double tr, double cc, double lr, double gra, double expected)
    {
        var overall = WritingBand.Overall((decimal)tr, (decimal)cc, (decimal)lr, (decimal)gra);
        Assert.Equal((decimal)expected, overall);
    }

    [Theory]
    [InlineData(6.7, 6.5)]
    [InlineData(6.8, 7.0)]
    [InlineData(10, 9.0)]
    [InlineData(-1, 0.0)]
    public void Snap_ProducesValidBand(double input, double expected) =>
        Assert.Equal((decimal)expected, WritingBand.Snap((decimal)input));

    [Theory]
    [InlineData(250, 250, 8.0, 8.0)]
    [InlineData(200, 250, 8.0, 6.0)]   // 80% -> cap 6
    [InlineData(150, 250, 8.0, 5.0)]   // 60% -> cap 5
    [InlineData(80, 250, 8.0, 4.0)]    // <50% -> cap 4
    [InlineData(0, 250, 8.0, 0.0)]
    public void CapTaskResponse_PenalisesShortEssays(int words, int min, double tr, double expected) =>
        Assert.Equal((decimal)expected, WritingBand.CapTaskResponse((decimal)tr, words, min));

    [Fact]
    public void CountWords_IgnoresExtraWhitespace() =>
        Assert.Equal(4, WritingBand.CountWords("  one two\n three   four "));

    [Fact]
    public void TryParse_ReadsValidJson_AndSnapsBands()
    {
        const string json = "```json\n{\"taskResponse\":6.7,\"coherenceCohesion\":6,\"lexicalResource\":7,\"grammaticalRange\":6.5,\"summary\":\"ok\",\"criterionComments\":{\"taskResponse\":\"x\"},\"errors\":[{\"quote\":\"a\",\"correction\":\"b\",\"category\":\"Grammar\",\"explanation\":\"c\"}],\"vocabularySuggestions\":[\"w\"]}\n```";
        var r = WritingGradingService.TryParse(json);
        Assert.NotNull(r);
        Assert.Equal(6.5m, r!.TaskResponse);
        Assert.Single(r.Errors);
        Assert.Equal("Gemini", r.GradedBy);
    }

    [Fact]
    public void TryParse_ReturnsNull_ForGarbage() => Assert.Null(WritingGradingService.TryParse("not json"));
}
