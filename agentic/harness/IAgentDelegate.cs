namespace EduSphere.Agentic.Harness;

public interface IAgentDelegate
{
    string AgentName { get; }
    int StepOrder { get; }
    Task<PipelineExecutionContext> ExecuteAsync(PipelineExecutionContext context, CancellationToken cancellationToken = default);
}
