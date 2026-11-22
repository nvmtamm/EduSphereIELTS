using EduSphere.Application.Features.Writing.Models;
using EduSphere.Domain.Enums;

namespace EduSphere.Application.Common.Interfaces;

public interface IWritingScorerService
{
    Task<WritingEvaluationResult> EvaluateEssayAsync(
        WritingTaskType taskType,
        string promptTitle,
        string promptText,
        string essayContent,
        CancellationToken cancellationToken = default);

    IAsyncEnumerable<string> StreamTutorChatAsync(
        string promptText,
        string essayContent,
        WritingEvaluationResult evaluation,
        string studentMessage,
        CancellationToken cancellationToken = default);
}
