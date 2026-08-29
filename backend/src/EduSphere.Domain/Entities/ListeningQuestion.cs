using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class ListeningQuestion : BaseEntity
{
    public Guid TestId { get; private set; }
    public int SectionNumber { get; private set; } = 1; // 1, 2, 3, 4
    public int QuestionNumber { get; private set; } // 1 to 40
    public QuestionType QuestionType { get; private set; }
    public string Prompt { get; private set; } = string.Empty;
    public string OptionsJson { get; private set; } = "[]"; // Options or Table metadata
    public string CorrectAnswer { get; private set; } = string.Empty;
    public string Explanation { get; private set; } = string.Empty;
    public double TimestampSeconds { get; private set; } = 0.0; // Point in audio where answer is found
    public double? AudioTimestampEndSeconds { get; private set; }
    public string? DiagramImageUrl { get; private set; } // For Map / Diagram Labelling

    public ListeningTest Test { get; private set; } = null!;

    private ListeningQuestion() { } // EF Core

    public ListeningQuestion(
        Guid testId,
        int sectionNumber,
        int questionNumber,
        QuestionType questionType,
        string prompt,
        string optionsJson,
        string correctAnswer,
        string explanation = "",
        double timestampSeconds = 0.0,
        double? audioTimestampEndSeconds = null,
        string? diagramImageUrl = null)
    {
        TestId = testId;
        SectionNumber = sectionNumber >= 1 && sectionNumber <= 4 ? sectionNumber : 1;
        QuestionNumber = questionNumber > 0 ? questionNumber : throw new ArgumentException("Question number must be positive.", nameof(questionNumber));
        QuestionType = questionType;
        Prompt = string.IsNullOrWhiteSpace(prompt) ? throw new ArgumentException("Prompt cannot be empty.", nameof(prompt)) : prompt.Trim();
        OptionsJson = string.IsNullOrWhiteSpace(optionsJson) ? "[]" : optionsJson.Trim();
        CorrectAnswer = string.IsNullOrWhiteSpace(correctAnswer) ? throw new ArgumentException("Correct answer cannot be empty.", nameof(correctAnswer)) : correctAnswer.Trim();
        Explanation = explanation?.Trim() ?? string.Empty;
        TimestampSeconds = timestampSeconds >= 0 ? timestampSeconds : 0.0;
        AudioTimestampEndSeconds = audioTimestampEndSeconds;
        DiagramImageUrl = diagramImageUrl?.Trim();
        CreatedAt = DateTime.UtcNow;
    }
}
