using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class ReadingPassage : BaseEntity
{
    public string Title { get; private set; } = string.Empty;
    public string Topic { get; private set; } = string.Empty;
    public DifficultyLevel Difficulty { get; private set; } = DifficultyLevel.Medium;
    public string Content { get; private set; } = string.Empty;
    public int EstimatedTimeMinutes { get; private set; } = 20;

    // Advanced Multi-Repository & Milestone properties
    public PassageSourceType SourceType { get; private set; } = PassageSourceType.OfficialCambridge;
    public string CollectionName { get; private set; } = "Official Cambridge";
    public TargetBandTier TargetBandTier { get; private set; } = TargetBandTier.Band6_0_6_5;
    public Guid? UploadedByUserId { get; private set; }
    public bool IsCommunityShared { get; private set; } = false;

    private readonly List<ReadingQuestion> _questions = new();
    public IReadOnlyCollection<ReadingQuestion> Questions => _questions.AsReadOnly();

    private readonly List<ReadingSubmission> _submissions = new();
    public IReadOnlyCollection<ReadingSubmission> Submissions => _submissions.AsReadOnly();

    private ReadingPassage() { } // EF Core

    public ReadingPassage(
        string title,
        string topic,
        DifficultyLevel difficulty,
        string content,
        int estimatedTimeMinutes = 20,
        PassageSourceType sourceType = PassageSourceType.OfficialCambridge,
        string collectionName = "Official Cambridge",
        TargetBandTier targetBandTier = TargetBandTier.Band6_0_6_5,
        Guid? uploadedByUserId = null,
        bool isCommunityShared = false)
    {
        Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty.", nameof(title)) : title.Trim();
        Topic = string.IsNullOrWhiteSpace(topic) ? throw new ArgumentException("Topic cannot be empty.", nameof(topic)) : topic.Trim();
        Difficulty = difficulty;
        Content = string.IsNullOrWhiteSpace(content) ? throw new ArgumentException("Content cannot be empty.", nameof(content)) : content;
        EstimatedTimeMinutes = estimatedTimeMinutes > 0 ? estimatedTimeMinutes : 20;
        SourceType = sourceType;
        CollectionName = string.IsNullOrWhiteSpace(collectionName) ? "Official Cambridge" : collectionName.Trim();
        TargetBandTier = targetBandTier;
        UploadedByUserId = uploadedByUserId;
        IsCommunityShared = isCommunityShared;
        CreatedAt = DateTime.UtcNow;
    }

    public void AddQuestion(ReadingQuestion question)
    {
        ArgumentNullException.ThrowIfNull(question);
        _questions.Add(question);
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(
        string title,
        string topic,
        DifficultyLevel difficulty,
        string content,
        int estimatedTimeMinutes,
        PassageSourceType sourceType,
        string collectionName,
        TargetBandTier targetBandTier,
        bool isCommunityShared)
    {
        Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty.", nameof(title)) : title.Trim();
        Topic = string.IsNullOrWhiteSpace(topic) ? throw new ArgumentException("Topic cannot be empty.", nameof(topic)) : topic.Trim();
        Difficulty = difficulty;
        Content = string.IsNullOrWhiteSpace(content) ? throw new ArgumentException("Content cannot be empty.", nameof(content)) : content;
        EstimatedTimeMinutes = estimatedTimeMinutes;
        SourceType = sourceType;
        CollectionName = collectionName;
        TargetBandTier = targetBandTier;
        IsCommunityShared = isCommunityShared;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCommunityShared(bool isShared)
    {
        IsCommunityShared = isShared;
        UpdatedAt = DateTime.UtcNow;
    }
}
