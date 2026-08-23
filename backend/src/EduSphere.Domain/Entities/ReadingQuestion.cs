using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class ReadingQuestion : BaseEntity
{
    public Guid PassageId { get; private set; }
    public int QuestionNumber { get; private set; }
    public QuestionType QuestionType { get; private set; }
    public string Prompt { get; private set; } = string.Empty;
    public string OptionsJson { get; private set; } = "[]";
    public string CorrectAnswer { get; private set; } = string.Empty;
    public string Explanation { get; private set; } = string.Empty;

    public ReadingPassage Passage { get; private set; } = null!;

    private ReadingQuestion() { } // EF Core

    public ReadingQuestion(
        Guid passageId,
        int questionNumber,
        QuestionType questionType,
        string prompt,
        string optionsJson,
        string correctAnswer,
        string explanation)
    {
        PassageId = passageId;
        QuestionNumber = questionNumber > 0 ? questionNumber : throw new ArgumentException("Question number must be positive.", nameof(questionNumber));
        QuestionType = questionType;
        Prompt = string.IsNullOrWhiteSpace(prompt) ? throw new ArgumentException("Prompt cannot be empty.", nameof(prompt)) : prompt.Trim();
        OptionsJson = string.IsNullOrWhiteSpace(optionsJson) ? "[]" : optionsJson.Trim();
        CorrectAnswer = string.IsNullOrWhiteSpace(correctAnswer) ? throw new ArgumentException("Correct answer cannot be empty.", nameof(correctAnswer)) : correctAnswer.Trim();
        Explanation = explanation?.Trim() ?? string.Empty;
    }
}
