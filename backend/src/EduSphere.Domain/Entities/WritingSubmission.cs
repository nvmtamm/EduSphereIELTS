using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class WritingSubmission : BaseEntity
{
    public Guid UserId { get; private set; }
    public User? User { get; private set; }

    public Guid PromptId { get; private set; }
    public WritingPrompt? Prompt { get; private set; }

    public string Content { get; private set; } = string.Empty;
    public int WordCount { get; private set; }
    public int TimeSpentSeconds { get; private set; }

    // IELTS 4-Criteria Scores (0.0 - 9.0)
    public float TaskAchievementScore { get; private set; }
    public float CoherenceCohesionScore { get; private set; }
    public float LexicalResourceScore { get; private set; }
    public float GrammaticalRangeScore { get; private set; }
    public float OverallBandScore { get; private set; }

    // Structured JSON Feedback
    public string CriteriaBreakdownJson { get; private set; } = "{}";
    public string GrammarErrorsJson { get; private set; } = "[]";
    public string VocabularySuggestionsJson { get; private set; } = "[]";
    public string GeneralFeedback { get; private set; } = string.Empty;

    public WritingEvaluationStatus Status { get; private set; } = WritingEvaluationStatus.Pending;

    private WritingSubmission() { } // EF Core

    public WritingSubmission(
        Guid userId,
        Guid promptId,
        string content,
        int wordCount,
        int timeSpentSeconds)
    {
        UserId = userId;
        PromptId = promptId;
        Content = string.IsNullOrWhiteSpace(content) ? throw new ArgumentException("Content cannot be empty.", nameof(content)) : content.Trim();
        WordCount = wordCount;
        TimeSpentSeconds = timeSpentSeconds;
        Status = WritingEvaluationStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    public void MarkEvaluating()
    {
        Status = WritingEvaluationStatus.Evaluating;
        UpdatedAt = DateTime.UtcNow;
    }

    public void CompleteEvaluation(
        float taskAchievementScore,
        float coherenceCohesionScore,
        float lexicalResourceScore,
        float grammaticalRangeScore,
        float overallBandScore,
        string criteriaBreakdownJson,
        string grammarErrorsJson,
        string vocabularySuggestionsJson,
        string generalFeedback)
    {
        TaskAchievementScore = taskAchievementScore;
        CoherenceCohesionScore = coherenceCohesionScore;
        LexicalResourceScore = lexicalResourceScore;
        GrammaticalRangeScore = grammaticalRangeScore;
        OverallBandScore = overallBandScore;

        CriteriaBreakdownJson = criteriaBreakdownJson ?? "{}";
        GrammarErrorsJson = grammarErrorsJson ?? "[]";
        VocabularySuggestionsJson = vocabularySuggestionsJson ?? "[]";
        GeneralFeedback = generalFeedback ?? string.Empty;

        Status = WritingEvaluationStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkFailed(string errorMessage)
    {
        Status = WritingEvaluationStatus.Failed;
        GeneralFeedback = $"Evaluation failed: {errorMessage}";
        UpdatedAt = DateTime.UtcNow;
    }
}
