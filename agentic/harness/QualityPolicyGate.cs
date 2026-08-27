namespace EduSphere.Agentic.Harness;

public class QualityPolicyGate
{
    public (bool Passed, List<string> ValidationErrors) Evaluate(PipelineExecutionContext context)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(context.StructuredPassageContent) || context.StructuredPassageContent.Length < 100)
        {
            errors.Add("Policy Violation: Structured passage content must be at least 100 characters.");
        }

        if (context.ParsedQuestions == null || context.ParsedQuestions.Count < 2)
        {
            errors.Add("Policy Violation: An authentic IELTS passage requires at least 2 structured questions.");
        }
        else
        {
            foreach (var q in context.ParsedQuestions)
            {
                if (string.IsNullOrWhiteSpace(q.Prompt))
                {
                    errors.Add($"Policy Violation: Question {q.QuestionNumber} has an empty prompt.");
                }
                if (string.IsNullOrWhiteSpace(q.CorrectAnswer))
                {
                    errors.Add($"Policy Violation: Question {q.QuestionNumber} is missing a validated correct answer.");
                }
            }
        }

        return (errors.Count == 0, errors);
    }
}
