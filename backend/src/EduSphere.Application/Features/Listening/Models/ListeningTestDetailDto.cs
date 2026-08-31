namespace EduSphere.Application.Features.Listening.Models;

public record ListeningQuestionDto(
    Guid Id,
    int SectionNumber,
    int QuestionNumber,
    string QuestionType,
    string Prompt,
    List<string> Options,
    string? DiagramImageUrl,
    double TimestampSeconds);

public record ListeningTranscriptDto(
    Guid Id,
    int SectionNumber,
    double StartTimeSeconds,
    double EndTimeSeconds,
    string Speaker,
    string TextContent,
    int? LinkedQuestionNumber);

// F-04: Per-section audio DTO for FullTest multi-audio
public record ListeningSectionAudioDto(
    Guid Id,
    int SectionNumber,
    string SectionTitle,
    string AudioUrl,
    int DurationSeconds);

public record ListeningTestDetailDto(
    Guid Id,
    string Title,
    string Topic,
    string Difficulty,
    string SectionType,
    int SectionNumber,
    string AudioUrl,
    int DurationSeconds,
    string Accent,
    string SourceType,
    string CollectionName,
    string TargetBandTier,
    string Instructions,
    Guid? UploadedByUserId,
    bool IsCommunityShared,
    bool IsOfficialExamMode,        // F-01: controls single-play constraint on frontend
    List<ListeningQuestionDto> Questions,
    List<ListeningTranscriptDto> Transcripts,
    List<ListeningSectionAudioDto> SectionAudios); // F-04

