namespace EduSphere.Agentic.Harness;

public class PipelineExecutionContext
{
    public Guid PipelineId { get; set; } = Guid.NewGuid();
    public string FileName { get; set; } = string.Empty;
    public string RawDocumentText { get; set; } = string.Empty;
    public string CleanedText { get; set; } = string.Empty;
    public string ExtractedTitle { get; set; } = string.Empty;
    public string DetectedTopic { get; set; } = string.Empty;
    public string StructuredPassageContent { get; set; } = string.Empty;
    public string TargetBandTier { get; set; } = "Band6_0_6_5";
    public string CollectionName { get; set; } = "Personal Test Vault";
    public Guid? UploadedByUserId { get; set; }
    public bool IsCommunityShared { get; set; } = false;

    public List<ExtractedQuestionItem> ParsedQuestions { get; set; } = new();
    public bool IsPolicyGatePassed { get; set; } = false;
    public List<string> ExecutionLogs { get; set; } = new();

    public void AddLog(string message)
    {
        var timestamp = DateTime.UtcNow.ToString("HH:mm:ss.fff");
        ExecutionLogs.Add($"[{timestamp}] {message}");
    }
}

public class ExtractedQuestionItem
{
    public int QuestionNumber { get; set; }
    public string QuestionType { get; set; } = "TrueFalseNotGiven";
    public string Prompt { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string CorrectAnswer { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public string? ParagraphReference { get; set; }
}
