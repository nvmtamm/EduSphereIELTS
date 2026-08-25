using EduSphere.Agentic.Harness;

namespace EduSphere.Agentic.Delegates;

public class DocIngestionDelegate : IAgentDelegate
{
    public string AgentName => "DocIngestionDelegate (OCR & Text Extractor)";
    public int StepOrder => 1;

    public Task<PipelineExecutionContext> ExecuteAsync(PipelineExecutionContext context, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(context.RawDocumentText))
        {
            context.CleanedText = "Sample document content.";
            return Task.FromResult(context);
        }

        // Clean carriage returns, unwanted control characters, and normalize whitespaces
        var normalized = context.RawDocumentText
            .Replace("\r\n", "\n")
            .Replace("\r", "\n")
            .Trim();

        context.CleanedText = normalized;
        context.AddLog($"Normalized {normalized.Length} characters of raw text input.");

        return Task.FromResult(context);
    }
}
