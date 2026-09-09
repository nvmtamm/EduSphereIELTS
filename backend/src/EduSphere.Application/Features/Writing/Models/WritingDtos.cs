using EduSphere.Domain.Enums;

namespace EduSphere.Application.Features.Writing.Models;

public record WritingPromptDto(
    Guid Id,
    string TaskType,
    string Title,
    string Topic,
    string PromptText,
    string? ImageUrl,
    string Difficulty,
    int RecommendedTimeMinutes,
    int MinWordCount,
    string? SampleBand8Answer,
    bool IsActive,
    DateTime CreatedAt);

public record WritingSubmissionSummaryDto(
    Guid Id,
    Guid PromptId,
    string PromptTitle,
    string TaskType,
    int WordCount,
    int TimeSpentSeconds,
    float OverallBandScore,
    string Status,
    DateTime CreatedAt);

public record WritingSubmissionDetailDto(
    Guid Id,
    Guid PromptId,
    string PromptTitle,
    string TaskType,
    string PromptText,
    string Content,
    int WordCount,
    int TimeSpentSeconds,
    float TaskAchievementScore,
    float CoherenceCohesionScore,
    float LexicalResourceScore,
    float GrammaticalRangeScore,
    float OverallBandScore,
    WritingEvaluationResult EvaluationResult,
    string GeneralFeedback,
    string Status,
    DateTime CreatedAt);
