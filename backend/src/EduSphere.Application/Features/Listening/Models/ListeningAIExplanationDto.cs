namespace EduSphere.Application.Features.Listening.Models;

public record ListeningAIExplanationDto(
    Guid QuestionId,
    int QuestionNumber,
    string QuestionPrompt,
    string? UserAnswer,
    string CorrectAnswer,
    string AccentNuance,
    string SignpostingAnalysis,
    string SocraticAdvice,
    string PhoneticTrap,
    string TranscriptExcerpt,
    double TimestampSeconds
);
