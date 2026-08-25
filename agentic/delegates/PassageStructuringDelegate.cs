using System.Text;
using EduSphere.Agentic.Harness;

namespace EduSphere.Agentic.Delegates;

public class PassageStructuringDelegate : IAgentDelegate
{
    public string AgentName => "PassageStructuringDelegate (Paragraph Normalizer & Topic Estimator)";
    public int StepOrder => 2;

    public Task<PipelineExecutionContext> ExecuteAsync(PipelineExecutionContext context, CancellationToken cancellationToken = default)
    {
        var text = context.CleanedText;
        var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        // 1. Extract Title
        context.ExtractedTitle = lines.Length > 0 ? lines[0].Trim('#', ' ') : Path.GetFileNameWithoutExtension(context.FileName);
        if (context.ExtractedTitle.Length > 100)
        {
            context.ExtractedTitle = context.ExtractedTitle.Substring(0, 100);
        }

        // 2. Topic Detection
        if (text.Contains("technology", StringComparison.OrdinalIgnoreCase) || text.Contains("AI", StringComparison.OrdinalIgnoreCase) || text.Contains("computer", StringComparison.OrdinalIgnoreCase))
            context.DetectedTopic = "Technology & Computer Science";
        else if (text.Contains("environment", StringComparison.OrdinalIgnoreCase) || text.Contains("climate", StringComparison.OrdinalIgnoreCase) || text.Contains("agriculture", StringComparison.OrdinalIgnoreCase))
            context.DetectedTopic = "Environment & Ecology";
        else if (text.Contains("history", StringComparison.OrdinalIgnoreCase) || text.Contains("ancient", StringComparison.OrdinalIgnoreCase) || text.Contains("archaeology", StringComparison.OrdinalIgnoreCase))
            context.DetectedTopic = "History & Archaeology";
        else
            context.DetectedTopic = "Academic Science & Society";

        // 3. Structure into Paragraphs [A], [B], [C]...
        var sb = new StringBuilder();
        var paragraphs = text.Split(new[] { "\n\n", "\r\n\r\n" }, StringSplitOptions.RemoveEmptyEntries);
        char currentLetter = 'A';

        foreach (var p in paragraphs)
        {
            if (p.Trim().StartsWith("### Paragraph"))
            {
                sb.AppendLine(p.Trim());
            }
            else
            {
                sb.AppendLine($"### Paragraph {currentLetter}");
                sb.AppendLine(p.Trim());
                sb.AppendLine();
                currentLetter++;
            }
        }

        context.StructuredPassageContent = sb.ToString();
        context.AddLog($"Structured {paragraphs.Length} paragraphs [A]–[{currentLetter}] with topic '{context.DetectedTopic}'.");

        return Task.FromResult(context);
    }
}
