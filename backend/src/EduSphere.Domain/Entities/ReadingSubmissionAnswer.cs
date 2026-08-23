using EduSphere.Domain.Common;

namespace EduSphere.Domain.Entities;

public class ReadingSubmissionAnswer : BaseEntity
{
    public Guid SubmissionId { get; private set; }
    public Guid QuestionId { get; private set; }
    public string UserAnswer { get; private set; } = string.Empty;
    public bool IsCorrect { get; private set; }

    public ReadingSubmission Submission { get; private set; } = null!;
    public ReadingQuestion Question { get; private set; } = null!;

    private ReadingSubmissionAnswer() { } // EF Core

    public ReadingSubmissionAnswer(
        Guid submissionId,
        Guid questionId,
        string userAnswer,
        bool isCorrect)
    {
        SubmissionId = submissionId;
        QuestionId = questionId;
        UserAnswer = userAnswer?.Trim() ?? string.Empty;
        IsCorrect = isCorrect;
    }
}
