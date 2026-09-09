using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class WritingPrompt : BaseEntity
{
    public WritingTaskType TaskType { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Topic { get; private set; } = string.Empty;
    public string PromptText { get; private set; } = string.Empty;
    public string? ImageUrl { get; private set; }
    public DifficultyLevel Difficulty { get; private set; } = DifficultyLevel.Medium;
    public int RecommendedTimeMinutes { get; private set; } = 40;
    public int MinWordCount { get; private set; } = 250;
    public string? SampleBand8Answer { get; private set; }
    public bool IsActive { get; private set; } = true;
    public Guid? UploadedByUserId { get; private set; }

    private readonly List<WritingSubmission> _submissions = new();
    public IReadOnlyCollection<WritingSubmission> Submissions => _submissions.AsReadOnly();

    private WritingPrompt() { } // EF Core

    public WritingPrompt(
        WritingTaskType taskType,
        string title,
        string topic,
        string promptText,
        string? imageUrl = null,
        DifficultyLevel difficulty = DifficultyLevel.Medium,
        int? recommendedTimeMinutes = null,
        int? minWordCount = null,
        string? sampleBand8Answer = null,
        Guid? uploadedByUserId = null)
    {
        TaskType = taskType;
        Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty.", nameof(title)) : title.Trim();
        Topic = string.IsNullOrWhiteSpace(topic) ? throw new ArgumentException("Topic cannot be empty.", nameof(topic)) : topic.Trim();
        PromptText = string.IsNullOrWhiteSpace(promptText) ? throw new ArgumentException("PromptText cannot be empty.", nameof(promptText)) : promptText.Trim();
        ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();
        Difficulty = difficulty;
        RecommendedTimeMinutes = recommendedTimeMinutes ?? (taskType == WritingTaskType.Task1 ? 20 : 40);
        MinWordCount = minWordCount ?? (taskType == WritingTaskType.Task1 ? 150 : 250);
        SampleBand8Answer = sampleBand8Answer;
        UploadedByUserId = uploadedByUserId;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(
        string title,
        string topic,
        string promptText,
        string? imageUrl,
        DifficultyLevel difficulty,
        int recommendedTimeMinutes,
        int minWordCount,
        string? sampleBand8Answer)
    {
        Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty.", nameof(title)) : title.Trim();
        Topic = string.IsNullOrWhiteSpace(topic) ? throw new ArgumentException("Topic cannot be empty.", nameof(topic)) : topic.Trim();
        PromptText = string.IsNullOrWhiteSpace(promptText) ? throw new ArgumentException("PromptText cannot be empty.", nameof(promptText)) : promptText.Trim();
        ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();
        Difficulty = difficulty;
        RecommendedTimeMinutes = recommendedTimeMinutes > 0 ? recommendedTimeMinutes : (TaskType == WritingTaskType.Task1 ? 20 : 40);
        MinWordCount = minWordCount > 0 ? minWordCount : (TaskType == WritingTaskType.Task1 ? 150 : 250);
        SampleBand8Answer = sampleBand8Answer;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ToggleActiveStatus(bool isActive)
    {
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
