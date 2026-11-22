using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class WritingPrompt : BaseEntity
{
    public WritingTaskType TaskType { get; private set; }
    /// <summary>Opinion, Discussion, Advantages/Disadvantages, Two-part, Problem-Solution, Line graph, Table, Letter...</summary>
    public string EssayType { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Topic { get; private set; } = string.Empty;
    public string PromptText { get; private set; } = string.Empty;
    /// <summary>Optional plain-text data (e.g. a table) used instead of an image for Task 1.</summary>
    public string? DataText { get; private set; }
    public int MinWords { get; private set; }
    public int SuggestedMinutes { get; private set; }
    public string Outline { get; private set; } = string.Empty;
    public string ModelEssay { get; private set; } = string.Empty;
    public decimal ModelBand { get; private set; }

    private WritingPrompt() { }

    public WritingPrompt(WritingTaskType taskType, string essayType, string title, string topic, string promptText,
        string? dataText, string outline, string modelEssay, decimal modelBand)
    {
        TaskType = taskType;
        EssayType = essayType;
        Title = title;
        Topic = topic;
        PromptText = promptText;
        DataText = dataText;
        MinWords = taskType == WritingTaskType.Task2 ? 250 : 150;
        SuggestedMinutes = taskType == WritingTaskType.Task2 ? 40 : 20;
        Outline = outline;
        ModelEssay = modelEssay;
        ModelBand = modelBand;
    }
}

public class WritingSubmission : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid PromptId { get; private set; }
    public string Essay { get; private set; } = string.Empty;
    public int WordCount { get; private set; }
    public int DurationSeconds { get; private set; }
    public decimal TaskResponse { get; private set; }
    public decimal CoherenceCohesion { get; private set; }
    public decimal LexicalResource { get; private set; }
    public decimal GrammaticalRange { get; private set; }
    public decimal OverallBand { get; private set; }
    /// <summary>JSON: summary, per-criterion comments, errors[], vocabulary suggestions[], gradedBy.</summary>
    public string FeedbackJson { get; private set; } = "{}";

    public WritingPrompt? Prompt { get; private set; }

    private WritingSubmission() { }

    public WritingSubmission(Guid userId, Guid promptId, string essay, int wordCount, int durationSeconds,
        decimal tr, decimal cc, decimal lr, decimal gra, decimal overall, string feedbackJson)
    {
        UserId = userId;
        PromptId = promptId;
        Essay = essay;
        WordCount = wordCount;
        DurationSeconds = durationSeconds;
        TaskResponse = tr;
        CoherenceCohesion = cc;
        LexicalResource = lr;
        GrammaticalRange = gra;
        OverallBand = overall;
        FeedbackJson = feedbackJson;
    }
}
