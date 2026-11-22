using EduSphere.Application.Features.Admin.Commands.CreateWritingPrompt;
using EduSphere.Application.Features.Admin.Commands.DeleteWritingPrompt;
using EduSphere.Application.Features.Admin.Commands.UpdateWritingPrompt;
using EduSphere.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/writing")]
public class AdminWritingController : ApiControllerBase
{
    /// <summary>
    /// Create a new Writing Task 1 or Task 2 prompt with sample answer
    /// </summary>
    [HttpPost("prompts")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePrompt([FromBody] CreateWritingPromptRequest request, CancellationToken ct = default)
    {
        var command = new CreateWritingPromptCommand(
            request.TaskType,
            request.Title,
            request.Topic,
            request.PromptText,
            request.ImageUrl,
            request.Difficulty,
            request.RecommendedTimeMinutes,
            request.MinWordCount,
            request.SampleBand8Answer,
            CurrentUserId);

        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Update existing Writing prompt content, diagram URL, or model answer
    /// </summary>
    [HttpPut("prompts/{id:guid}")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdatePrompt(Guid id, [FromBody] UpdateWritingPromptRequest request, CancellationToken ct = default)
    {
        var command = new UpdateWritingPromptCommand(
            id,
            request.Title,
            request.Topic,
            request.PromptText,
            request.ImageUrl,
            request.Difficulty,
            request.RecommendedTimeMinutes,
            request.MinWordCount,
            request.SampleBand8Answer);

        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Soft-delete Writing prompt from public exam bank
    /// </summary>
    [HttpDelete("prompts/{id:guid}")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeletePrompt(Guid id, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new DeleteWritingPromptCommand(id), ct);
        return HandleResult(result);
    }
}

public record CreateWritingPromptRequest(
    WritingTaskType TaskType,
    string Title,
    string Topic,
    string PromptText,
    string? ImageUrl = null,
    DifficultyLevel Difficulty = DifficultyLevel.Medium,
    int? RecommendedTimeMinutes = null,
    int? MinWordCount = null,
    string? SampleBand8Answer = null);

public record UpdateWritingPromptRequest(
    string Title,
    string Topic,
    string PromptText,
    string? ImageUrl,
    DifficultyLevel Difficulty,
    int RecommendedTimeMinutes,
    int MinWordCount,
    string? SampleBand8Answer);
