using EduSphere.Domain.Enums;

namespace EduSphere.Application.Common.Interfaces;

public interface IListeningScoringService
{
    /// <summary>
    /// Evaluates if user answer is correct against Cambridge IELTS answer patterns.
    /// Supports alternatives with '/', optional words in '()', number words (three vs 3), and case insensitivity.
    /// </summary>
    bool IsAnswerCorrect(string userAnswer, string correctAnswer, QuestionType questionType);

    /// <summary>
    /// Converts raw correct count (0-40) into official Cambridge IELTS Listening Band Score (1.0 - 9.0).
    /// </summary>
    double CalculateBandScore(int rawScore, int totalQuestions);
}
