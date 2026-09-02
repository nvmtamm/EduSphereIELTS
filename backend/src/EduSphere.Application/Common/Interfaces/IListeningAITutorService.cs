namespace EduSphere.Application.Common.Interfaces;

/// <summary>
/// AI Tutor Service for IELTS Listening exam diagnostics and Socratic reviews.
/// Analyzes transcript cues, accent nuances, connected speech, and distractor traps.
/// </summary>
public interface IListeningAITutorService
{
    Task<ListeningAIExplanationResult> ExplainQuestionAsync(
        string questionPrompt,
        string questionType,
        string? userAnswer,
        string correctAnswer,
        string transcriptExcerpt,
        string accent,
        string? preExistingExplanation,
        CancellationToken cancellationToken = default);
}

public record ListeningAIExplanationResult(
    string AccentNuance,
    string SignpostingAnalysis,
    string SocraticAdvice,
    string PhoneticTrap
);
