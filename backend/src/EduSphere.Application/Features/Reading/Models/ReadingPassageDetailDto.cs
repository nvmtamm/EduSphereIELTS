namespace EduSphere.Application.Features.Reading.Models;

public record ReadingQuestionDto(
    Guid Id,
    int QuestionNumber,
    string QuestionType,
    string Prompt,
    List<string> Options);

public record ReadingPassageDetailDto(
    Guid Id,
    string Title,
    string Topic,
    string Difficulty,
    int EstimatedTimeMinutes,
    string Content,
    List<ReadingQuestionDto> Questions);
