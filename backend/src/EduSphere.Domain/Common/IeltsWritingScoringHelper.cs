using System.Text.RegularExpressions;

namespace EduSphere.Domain.Common;

public static class IeltsWritingScoringHelper
{
    /// <summary>
    /// Calculates the official Cambridge IELTS Overall Band Score from 4 criteria.
    /// Rules:
    /// - Computes the arithmetic mean: (TA + CC + LR + GRA) / 4.0
    /// - Decimal fraction < 0.25 rounds down to .0 (e.g. 6.125 -> 6.0)
    /// - Decimal fraction >= 0.25 and < 0.75 rounds to .5 (e.g. 6.25 -> 6.5, 6.625 -> 6.5)
    /// - Decimal fraction >= 0.75 rounds up to next .0 (e.g. 6.75 -> 7.0)
    /// </summary>
    public static float CalculateOverallBand(float taskAchievement, float coherenceCohesion, float lexicalResource, float grammaticalRange)
    {
        float average = (taskAchievement + coherenceCohesion + lexicalResource + grammaticalRange) / 4.0f;
        return RoundToIeltsBand(average);
    }

    public static float RoundToIeltsBand(float rawScore)
    {
        if (rawScore <= 0.0f) return 0.0f;
        if (rawScore >= 9.0f) return 9.0f;

        float floor = MathF.Floor(rawScore);
        float remainder = rawScore - floor;

        float rounded;
        if (remainder < 0.25f)
        {
            rounded = floor;
        }
        else if (remainder < 0.75f)
        {
            rounded = floor + 0.5f;
        }
        else
        {
            rounded = floor + 1.0f;
        }

        return Math.Clamp(rounded, 1.0f, 9.0f);
    }

    /// <summary>
    /// Strips HTML tags if any and accurately counts words in the essay.
    /// </summary>
    public static int CountWords(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return 0;

        // Strip HTML tags if Tiptap submits HTML
        string plainText = Regex.Replace(text, "<.*?>", " ");

        // Split by whitespace and punctuation that separates words
        var matches = Regex.Matches(plainText, @"[\b\w'’-]+");
        return matches.Count;
    }
}
