using EduSphere.Domain.Common;

namespace EduSphere.Domain.Entities;

public class ListeningSubmissionAnswer : BaseEntity
{
    public Guid SubmissionId { get; private set; }
    public Guid QuestionId { get; private set; }
    public string UserAnswer { get; private set; } = string.Empty;
    public bool IsCorrect { get; private set; }
    public string CorrectAnswer { get; private set; } = string.Empty;

    public ListeningSubmission Submission { get; private set; } = null!;
    public ListeningQuestion Question { get; private set; } = null!;

    private ListeningSubmissionAnswer() { } // EF Core

    public ListeningSubmissionAnswer(
        Guid submissionId,
        Guid questionId,
        string userAnswer,
        bool isCorrect,
        string correctAnswer = "")
    {
        SubmissionId = submissionId;
        QuestionId = questionId;
        UserAnswer = userAnswer?.Trim() ?? string.Empty;
        IsCorrect = isCorrect;
        CorrectAnswer = correctAnswer?.Trim() ?? string.Empty;
        CreatedAt = DateTime.UtcNow;
    }
}
