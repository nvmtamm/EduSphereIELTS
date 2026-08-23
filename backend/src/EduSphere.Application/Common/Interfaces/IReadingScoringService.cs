using EduSphere.Domain.Enums;

namespace EduSphere.Application.Common.Interfaces;

public interface IReadingScoringService
{
    /// <summary>
    /// So khớp câu trả lời của học viên với đáp án đúng dựa theo dạng câu hỏi
    /// </summary>
    bool IsAnswerCorrect(string userAnswer, string correctAnswer, QuestionType questionType);

    /// <summary>
    /// Quy đổi số câu đúng (Raw Score) trên tổng số câu (Total Questions) ra IELTS Band Score (1.0 - 9.0)
    /// </summary>
    double CalculateBandScore(int rawScore, int totalQuestions);
}
