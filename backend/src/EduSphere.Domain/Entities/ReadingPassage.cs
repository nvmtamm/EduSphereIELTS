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
        int estimatedTimeMinutes = 20)
    {
        Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty.", nameof(title)) : title.Trim();
        Topic = string.IsNullOrWhiteSpace(topic) ? throw new ArgumentException("Topic cannot be empty.", nameof(topic)) : topic.Trim();
        Difficulty = difficulty;
        Content = string.IsNullOrWhiteSpace(content) ? throw new ArgumentException("Content cannot be empty.", nameof(content)) : content;
        EstimatedTimeMinutes = estimatedTimeMinutes > 0 ? estimatedTimeMinutes : 20;
    }

    public void AddQuestion(ReadingQuestion question)
    {
        ArgumentNullException.ThrowIfNull(question);
        _questions.Add(question);
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(string title, string topic, DifficultyLevel difficulty, string content, int estimatedTimeMinutes)
    {
        Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty.", nameof(title)) : title.Trim();
        Topic = string.IsNullOrWhiteSpace(topic) ? throw new ArgumentException("Topic cannot be empty.", nameof(topic)) : topic.Trim();
        Difficulty = difficulty;
        Content = string.IsNullOrWhiteSpace(content) ? throw new ArgumentException("Content cannot be empty.", nameof(content)) : content;
        EstimatedTimeMinutes = estimatedTimeMinutes;
        UpdatedAt = DateTime.UtcNow;
    }
}
