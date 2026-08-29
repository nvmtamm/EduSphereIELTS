namespace EduSphere.Application.Features.Listening.Models;

public record ListeningTestDto(
    Guid Id,
    string Title,
    string Topic,
    string Difficulty,
    string SectionType,
    int SectionNumber,
    int DurationSeconds,
    string AudioUrl,
    string Accent,
    int TotalQuestions,
    List<string> QuestionTypes,
    string SourceType,
    string CollectionName,
    string TargetBandTier,
    Guid? UploadedByUserId,
    bool IsCommunityShared,
    DateTime CreatedAt);
