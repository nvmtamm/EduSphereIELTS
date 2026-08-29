namespace EduSphere.Application.Features.Listening.Models;

public record UserListeningAnswerSubmissionDto(
    Guid QuestionId,
    string UserAnswer);

public record ListeningSectionBreakdownDto(
    int SectionNumber,
    string SectionTitle,
    int RawScore,
    int TotalQuestions,
    double AccuracyPercentage);

public record ListeningAnswerResultDto(
    Guid QuestionId,
    int SectionNumber,
    int QuestionNumber,
    string QuestionType,
    string Prompt,
    string UserAnswer,
    string CorrectAnswer,
    bool IsCorrect,
    string Explanation,
    double TimestampSeconds,
    double? AudioTimestampEndSeconds);

public record ListeningResultDto(
    Guid SubmissionId,
    Guid TestId,
    string TestTitle,
    int RawScore,
    int TotalQuestions,
    double AccuracyPercentage,
    double BandScore,
    int DurationSeconds,
    DateTime CompletedAt,
    List<ListeningSectionBreakdownDto> SectionBreakdowns,
    List<ListeningAnswerResultDto> Answers,
    List<ListeningTranscriptDto> Transcripts);

public record ListeningHistoryDto(
    Guid SubmissionId,
    Guid TestId,
    string TestTitle,
    int RawScore,
    int TotalQuestions,
    double AccuracyPercentage,
    double BandScore,
    int DurationSeconds,
    DateTime CompletedAt,
    string Accent,
    string SectionType);
