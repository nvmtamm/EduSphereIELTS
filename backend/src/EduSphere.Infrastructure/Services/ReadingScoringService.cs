using System.Text.RegularExpressions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Domain.Enums;

namespace EduSphere.Infrastructure.Services;

public partial class ReadingScoringService : IReadingScoringService
{
    public bool IsAnswerCorrect(string userAnswer, string correctAnswer, QuestionType questionType)
    {
        if (string.IsNullOrWhiteSpace(userAnswer) || string.IsNullOrWhiteSpace(correctAnswer))
            return false;

        var cleanUser = CleanAnswer(userAnswer);
        var cleanCorrect = CleanAnswer(correctAnswer);

        // Hỗ trợ trường hợp câu hỏi điền từ có nhiều đáp án hợp lệ cách nhau bằng dấu '/'
        // Ví dụ: "two wheels / 2 wheels"
        var possibleCorrectAnswers = cleanCorrect
            .Split('/', StringSplitOptions.RemoveEmptyEntries)
            .Select(a => a.Trim())
            .ToList();

        if (questionType is QuestionType.TrueFalseNotGiven)
        {
            cleanUser = NormalizeTfng(cleanUser);
            possibleCorrectAnswers = possibleCorrectAnswers.Select(NormalizeTfng).ToList();
        }
        else if (questionType is QuestionType.YesNoNotGiven)
        {
            cleanUser = NormalizeYnng(cleanUser);
            possibleCorrectAnswers = possibleCorrectAnswers.Select(NormalizeYnng).ToList();
        }

        return possibleCorrectAnswers.Any(ans => string.Equals(ans, cleanUser, StringComparison.OrdinalIgnoreCase));
    }

    public double CalculateBandScore(int rawScore, int totalQuestions)
    {
        if (totalQuestions <= 0 || rawScore <= 0)
            return 1.0;

        // Quy đổi về thang chuẩn 40 câu nếu làm bài 1 passage (13-14 câu)
        int scaled40Score = totalQuestions == 40
            ? rawScore
            : (int)Math.Round(((double)rawScore / totalQuestions) * 40, MidpointRounding.AwayFromZero);

        scaled40Score = Math.Clamp(scaled40Score, 0, 40);

        return scaled40Score switch
        {
            >= 39 => 9.0,
            >= 37 => 8.5,
            >= 35 => 8.0,
            >= 33 => 7.5,
            >= 30 => 7.0,
            >= 27 => 6.5,
            >= 23 => 6.0,
            >= 19 => 5.5,
            >= 15 => 5.0,
            >= 13 => 4.5,
            >= 10 => 4.0,
            >= 6 => 3.5,
            >= 4 => 3.0,
            >= 2 => 2.5,
            >= 1 => 2.0,
            _ => 1.0
        };
    }

    private static string CleanAnswer(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        // Bỏ khoảng trắng thừa và ký tự xuống dòng
        var cleaned = MultiSpaceRegex().Replace(input.Trim(), " ");
        // Bỏ dấu chấm ở cuối câu trả lời nếu có
        return cleaned.TrimEnd('.');
    }

    private static string NormalizeTfng(string input)
    {
        var upper = input.ToUpperInvariant();
        return upper switch
        {
            "T" or "TRUE" => "TRUE",
            "F" or "FALSE" => "FALSE",
            "NG" or "NOT GIVEN" or "NOTGIVEN" => "NOT GIVEN",
            _ => upper
        };
    }

    private static string NormalizeYnng(string input)
    {
        var upper = input.ToUpperInvariant();
        return upper switch
        {
            "Y" or "YES" => "YES",
            "N" or "NO" => "NO",
            "NG" or "NOT GIVEN" or "NOTGIVEN" => "NOT GIVEN",
            _ => upper
        };
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex MultiSpaceRegex();
}
