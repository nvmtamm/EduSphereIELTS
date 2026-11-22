namespace EduSphere.Application.Common.Interfaces;

public record WritingError(string Quote, string Correction, string Category, string Explanation);

public record WritingGradeResult(
    decimal TaskResponse,
    decimal CoherenceCohesion,
    decimal LexicalResource,
    decimal GrammaticalRange,
    string Summary,
    Dictionary<string, string> CriterionComments,
    List<WritingError> Errors,
    List<string> VocabularySuggestions,
    string GradedBy);

public interface IWritingGradingService
{
    Task<WritingGradeResult> GradeAsync(string taskType, string promptText, string? dataText, string essay,
        CancellationToken cancellationToken = default);
}
