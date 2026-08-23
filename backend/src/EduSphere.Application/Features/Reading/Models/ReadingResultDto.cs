namespace EduSphere.Application.Features.Reading.Models;

public record UserAnswerSubmissionDto(
    Guid QuestionId,
    string UserAnswer);

public record ReadingAnswerResultDto(
    Guid QuestionId,
    int QuestionNumber,
    string QuestionType,
    string Prompt,
    string UserAnswer,
    string CorrectAnswer,
    bool IsCorrect,
    string Explanation);

public record ReadingResultDto(
    Guid SubmissionId,
    Guid PassageId,
    string PassageTitle,
    int RawScore,
    int TotalQuestions,
    double AccuracyPercentage,
    double BandScore,
    int DurationSeconds,
    DateTime SubmittedAt,
    List<ReadingAnswerResultDto> Answers);
