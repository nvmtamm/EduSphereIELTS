namespace EduSphere.Application.Features.Reading.Models;

public record BandMilestoneDto(
    Guid Id,
    int StepNumber,
    string Title,
    string TargetSkill,
    string Description,
    Guid? ReadingPassageId,
    float MinAccuracyToUnlockNext,
    bool IsCompleted = false,
    float? UserBestAccuracy = null);

public record BandRoadmapDto(
    Guid Id,
    string BandTier,
    string Title,
    string Description,
    string TargetSkillsSummary,
    int TotalMilestones,
    int VocabularyCount,
    int CurrentUserStep,
    float UserMasteryPercentage,
    string? EarnedBadge,
    List<BandMilestoneDto> Milestones);

public record BandVocabularyDto(
    Guid Id,
    string BandTier,
    string Word,
    string Phonetic,
    string Meaning,
    string PartOfSpeech,
    string AcademicLevel,
    string ExampleSentence,
    List<string> Collocations,
    List<string> Synonyms);

public record AITutorMessageDto(
    string Role,
    string Message,
    string? RelevantParagraph,
    List<string>? HighlightKeywords);

public record DocumentIngestResultDto(
    Guid PassageId,
    string Title,
    string Topic,
    string Difficulty,
    int QuestionCount,
    string CollectionName,
    List<string> ProcessingLogs);
