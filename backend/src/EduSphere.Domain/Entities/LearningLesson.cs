using EduSphere.Domain.Common;

namespace EduSphere.Domain.Entities;

/// <summary>
/// One lesson of the self-study Learning Path (3 stages x 9 lessons, e.g. SL1..SL9, W1..W9, R1..R9).
/// Each lesson bundles a written summary, and links to exercises / vocabulary / an online test.
/// </summary>
public class LearningLesson : BaseEntity
{
    public int StageNumber { get; private set; }
    public string StageTitle { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public int OrderInStage { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Skill { get; private set; } = string.Empty;
    public string SummaryMarkdown { get; private set; } = string.Empty;
    /// <summary>JSON array of { "type": "exercise|vocabulary|test", "title": "...", "route": "/reading/exam/..." }.</summary>
    public string ItemsJson { get; private set; } = "[]";

    public void SetItems(string itemsJson) => ItemsJson = itemsJson;

    private LearningLesson() { }

    public LearningLesson(int stageNumber, string stageTitle, string code, int orderInStage, string title, string skill, string summaryMarkdown, string itemsJson)
    {
        StageNumber = stageNumber;
        StageTitle = stageTitle;
        Code = code;
        OrderInStage = orderInStage;
        Title = title;
        Skill = skill;
        SummaryMarkdown = summaryMarkdown;
        ItemsJson = string.IsNullOrWhiteSpace(itemsJson) ? "[]" : itemsJson;
    }
}

public class UserLessonProgress : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid LessonId { get; private set; }
    public DateTime CompletedAtUtc { get; private set; }

    private UserLessonProgress() { }

    public UserLessonProgress(Guid userId, Guid lessonId)
    {
        UserId = userId;
        LessonId = lessonId;
        CompletedAtUtc = DateTime.UtcNow;
    }
}
