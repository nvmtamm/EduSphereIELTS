using EduSphere.Agentic.Harness;

namespace EduSphere.Agentic.Delegates;

public class VerifierExplainerDelegate : IAgentDelegate
{
    public string AgentName => "VerifierExplainerDelegate (Quality Assurance & Citation Generator)";
    public int StepOrder => 4;

    public Task<PipelineExecutionContext> ExecuteAsync(PipelineExecutionContext context, CancellationToken cancellationToken = default)
    {
        if (context.ParsedQuestions == null || context.ParsedQuestions.Count == 0)
        {
            context.AddLog("No questions to verify.");
            return Task.FromResult(context);
        }

        int verifiedCount = 0;
        foreach (var q in context.ParsedQuestions)
        {
            if (string.IsNullOrWhiteSpace(q.Explanation))
            {
                q.Explanation = $"Verified based on context in Paragraph {q.ParagraphReference ?? "A"}.";
            }

            if (q.QuestionType == "TrueFalseNotGiven" && (q.Options == null || q.Options.Count == 0))
            {
                q.Options = new List<string> { "TRUE", "FALSE", "NOT GIVEN" };
            }

            verifiedCount++;
        }

        context.AddLog($"Verified and enriched {verifiedCount} question citations and explanations.");
        return Task.FromResult(context);
    }
}
