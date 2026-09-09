namespace EduSphere.Application.Features.Admin.Models;

public record AdminRecentActivityDto(
    Guid Id,
    string StudentName,
    string StudentEmail,
    string ExamType,
    string Title,
    float BandScore,
    DateTime SubmittedAt);

public record AdminDashboardStatsDto(
    int TotalLearners,
    int TotalSubmissions,
    float AverageBandScore,
    int TotalReadingPassages,
    int TotalListeningTests,
    int TotalWritingPrompts,
    List<AdminRecentActivityDto> RecentActivities);

public record AdminUserListItemDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    bool IsActive,
    float? TargetBandScore,
    int TotalSubmissions,
    DateTime CreatedAt);

public record AdminUserDetailDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    bool IsActive,
    float? TargetBandScore,
    DateTime CreatedAt,
    List<AdminRecentActivityDto> RecentActivities);

public record AdminExamBankOverviewDto(
    int ReadingPassagesCount,
    int ListeningTestsCount,
    int WritingPromptsCount);
