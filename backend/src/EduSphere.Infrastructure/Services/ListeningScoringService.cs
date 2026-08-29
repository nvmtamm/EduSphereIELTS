using System.Text.RegularExpressions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Domain.Enums;

namespace EduSphere.Infrastructure.Services;

public partial class ListeningScoringService : IListeningScoringService
{
    private static readonly Dictionary<string, string> NumberWords = new(StringComparer.OrdinalIgnoreCase)
    {
        { "zero", "0" }, { "one", "1" }, { "two", "2" }, { "three", "3" }, { "four", "4" },
        { "five", "5" }, { "six", "6" }, { "seven", "7" }, { "eight", "8" }, { "nine", "9" },
        { "ten", "10" }, { "eleven", "11" }, { "twelve", "12" }, { "thirteen", "13" }, { "fourteen", "14" },
        { "fifteen", "15" }, { "sixteen", "16" }, { "seventeen", "17" }, { "eighteen", "18" }, { "nineteen", "19" },
        { "twenty", "20" }, { "thirty", "30" }, { "forty", "40" }, { "fifty", "50" },
        { "first", "1st" }, { "second", "2nd" }, { "third", "3rd" }
    };

    public bool IsAnswerCorrect(string userAnswer, string correctAnswer, QuestionType questionType)
    {
        if (string.IsNullOrWhiteSpace(userAnswer) || string.IsNullOrWhiteSpace(correctAnswer))
            return false;

        var cleanUser = CleanAnswer(userAnswer);
        var cleanCorrect = CleanAnswer(correctAnswer);

        // Split multiple possible answers delimited by '/'
        var rawOptions = cleanCorrect
            .Split('/', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .ToList();

        var validPatterns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var opt in rawOptions)
        {
            // Add original option
            validPatterns.Add(opt);

            // If option has optional words in parentheses e.g. "(a) bicycle" or "(in) July"
            if (opt.Contains('(') && opt.Contains(')'))
            {
                // Variant 1: Without parentheses content
                var withoutParens = RemoveParensRegex().Replace(opt, "").Trim();
                withoutParens = MultiSpaceRegex().Replace(withoutParens, " ");
                if (!string.IsNullOrEmpty(withoutParens))
                    validPatterns.Add(withoutParens);

                // Variant 2: Including parentheses content without the parens characters
                var withParensContent = opt.Replace("(", "").Replace(")", "").Trim();
                withParensContent = MultiSpaceRegex().Replace(withParensContent, " ");
                if (!string.IsNullOrEmpty(withParensContent))
                    validPatterns.Add(withParensContent);
            }

            // Word number to digit expansions
            foreach (var kvp in NumberWords)
            {
                if (opt.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                {
                    var replaced = Regex.Replace(opt, $@"\b{Regex.Escape(kvp.Key)}\b", kvp.Value, RegexOptions.IgnoreCase);
                    validPatterns.Add(replaced);
                }
                if (opt.Contains(kvp.Value, StringComparison.OrdinalIgnoreCase))
                {
                    var replaced = Regex.Replace(opt, $@"\b{Regex.Escape(kvp.Value)}\b", kvp.Key, RegexOptions.IgnoreCase);
                    validPatterns.Add(replaced);
                }
            }
        }

        // Check if user answer directly matches or matches normalized digit equivalents
        if (validPatterns.Contains(cleanUser))
            return true;

        // Also normalize user number words
        var userWithDigits = cleanUser;
        foreach (var kvp in NumberWords)
        {
            if (userWithDigits.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
            {
                userWithDigits = Regex.Replace(userWithDigits, $@"\b{Regex.Escape(kvp.Key)}\b", kvp.Value, RegexOptions.IgnoreCase);
            }
        }

        if (validPatterns.Contains(userWithDigits))
            return true;

        // Handle letter-based answers for MCQs or Matching e.g. "A" vs "A. First option" or "a"
        if (validPatterns.Any(p =>
            string.Equals(p, cleanUser, StringComparison.OrdinalIgnoreCase) ||
            (p.Length == 1 && (cleanUser.StartsWith(p + ".", StringComparison.OrdinalIgnoreCase) || cleanUser.StartsWith(p + " ", StringComparison.OrdinalIgnoreCase) || cleanUser.StartsWith(p + ")", StringComparison.OrdinalIgnoreCase))) ||
            (cleanUser.Length == 1 && (p.StartsWith(cleanUser + ".", StringComparison.OrdinalIgnoreCase) || p.StartsWith(cleanUser + " ", StringComparison.OrdinalIgnoreCase) || p.StartsWith(cleanUser + ")", StringComparison.OrdinalIgnoreCase)))))
        {
            return true;
        }

        return false;
    }

    public double CalculateBandScore(int rawScore, int totalQuestions)
    {
        if (totalQuestions <= 0 || rawScore <= 0)
            return 1.0;

        // Scale to 40-question standard if partial section test
        int scaled40Score = totalQuestions == 40
            ? rawScore
            : (int)Math.Round(((double)rawScore / totalQuestions) * 40, MidpointRounding.AwayFromZero);

        scaled40Score = Math.Clamp(scaled40Score, 0, 40);

        // Cambridge IELTS Academic Listening Band Conversion Table
        return scaled40Score switch
        {
            >= 39 => 9.0,
            >= 37 => 8.5,
            >= 35 => 8.0,
            >= 32 => 7.5,
            >= 30 => 7.0,
            >= 26 => 6.5,
            >= 23 => 6.0,
            >= 18 => 5.5,
            >= 16 => 5.0,
            >= 13 => 4.5,
            >= 10 => 4.0,
            >= 6 => 3.5,
            >= 4 => 3.0,
            >= 3 => 2.5,
            >= 1 => 2.0,
            _ => 1.0
        };
    }

    private static string CleanAnswer(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        var cleaned = MultiSpaceRegex().Replace(input.Trim(), " ");
        return cleaned.TrimEnd('.');
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex MultiSpaceRegex();

    [GeneratedRegex(@"\([^)]*\)")]
    private static partial Regex RemoveParensRegex();
}
