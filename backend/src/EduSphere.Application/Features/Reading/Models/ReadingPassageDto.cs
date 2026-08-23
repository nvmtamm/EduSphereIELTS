using EduSphere.Domain.Enums;

namespace EduSphere.Application.Features.Reading.Models;

public record ReadingPassageDto(
    Guid Id,
    string Title,
    string Topic,
    string Difficulty,
    int EstimatedTimeMinutes,
    int TotalQuestions,
    List<string> QuestionTypes,
    DateTime CreatedAt);
