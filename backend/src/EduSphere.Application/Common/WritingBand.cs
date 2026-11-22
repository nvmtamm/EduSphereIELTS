namespace EduSphere.Application.Common;

public static class WritingBand
{
    public static int CountWords(string? text) =>
        string.IsNullOrWhiteSpace(text) ? 0 : text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;

    /// <summary>IELTS overall rounding: average of 4 criteria, .25 rounds up to .5 and .75 up to the next whole band.</summary>
    public static decimal Overall(decimal tr, decimal cc, decimal lr, decimal gra)
    {
        var avg = (tr + cc + lr + gra) / 4m;
        return Math.Floor(avg * 2m + 0.5m) / 2m;
    }

    /// <summary>Snap an arbitrary score to a valid band (0-9 in 0.5 steps).</summary>
    public static decimal Snap(decimal value) => Math.Clamp(Math.Round(value * 2m, MidpointRounding.AwayFromZero) / 2m, 0m, 9m);

    /// <summary>Under-length essays cannot reach a high Task Response band.</summary>
    public static decimal CapTaskResponse(decimal tr, int wordCount, int minWords)
    {
        if (wordCount <= 0) return 0m;
        var ratio = (decimal)wordCount / minWords;
        if (ratio < 0.5m) return Math.Min(tr, 4.0m);
        if (ratio < 0.8m) return Math.Min(tr, 5.0m);
        if (ratio < 1m) return Math.Min(tr, 6.0m);
        return tr;
    }
}
