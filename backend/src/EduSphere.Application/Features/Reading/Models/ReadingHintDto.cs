namespace EduSphere.Application.Features.Reading.Models;

/// <summary>
/// One rung of the 4-step hint ladder (Practice mode only):
/// 1 Understand the question, 2 Locate the evidence, 3 Read the evidence, 4 Choose the answer.
/// </summary>
public record ReadingHintDto(
    int Step,
    string Title,
    string Content,
    List<string> Keywords,
    string? RelevantParagraph,
    bool HasNextStep);
