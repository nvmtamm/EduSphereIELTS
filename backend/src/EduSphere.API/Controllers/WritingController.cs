using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Writing.Commands.SubmitWritingForEvaluation;
using EduSphere.Application.Features.Writing.Models;
using EduSphere.Application.Features.Writing.Queries.GetMyWritingSubmissions;
using EduSphere.Application.Features.Writing.Queries.GetWritingPromptById;
using EduSphere.Application.Features.Writing.Queries.GetWritingPrompts;
using EduSphere.Application.Features.Writing.Queries.GetWritingSubmissionById;
using EduSphere.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.API.Controllers;

[Route("api/writing")]
public class WritingController : ApiControllerBase
{
    private readonly IWritingScorerService _writingScorerService;

    public WritingController(IWritingScorerService writingScorerService)
    {
        _writingScorerService = writingScorerService;
    }

    /// <summary>
    /// Get paginated list of IELTS Writing prompts (Task 1 / Task 2)
    /// </summary>
    [HttpGet("prompts")]
    [ProducesResponseType(typeof(PagedList<WritingPromptDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPrompts(
        [FromQuery] WritingTaskType? taskType = null,
        [FromQuery] string? topic = null,
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetWritingPromptsQuery(taskType, topic, search, pageNumber, pageSize), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Get writing prompt details by Id
    /// </summary>
    [HttpGet("prompts/{id:guid}")]
    [ProducesResponseType(typeof(WritingPromptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetPromptById(Guid id, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetWritingPromptByIdQuery(id), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Submit essay for automated 4-criteria IELTS AI evaluation
    /// </summary>
    [Authorize]
    [HttpPost("submissions")]
    [ProducesResponseType(typeof(WritingSubmissionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitWriting(
        [FromBody] SubmitWritingRequest request,
        CancellationToken ct = default)
    {
        var command = new SubmitWritingForEvaluationCommand(
            CurrentUserId,
            request.PromptId,
            request.Content,
            request.TimeSpentSeconds);

        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Get detailed writing submission result by Id
    /// </summary>
    [Authorize]
    [HttpGet("submissions/{id:guid}")]
    [ProducesResponseType(typeof(WritingSubmissionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetSubmissionById(Guid id, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetWritingSubmissionByIdQuery(id, CurrentUserId), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Get all past writing submissions of the current logged-in user
    /// </summary>
    [Authorize]
    [HttpGet("my-submissions")]
    [ProducesResponseType(typeof(PagedList<WritingSubmissionSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMySubmissions(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetMyWritingSubmissionsQuery(CurrentUserId, pageNumber, pageSize), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Interactive AI Examiner chat streaming via Server-Sent Events (SSE)
    /// </summary>
    [Authorize]
    [HttpPost("submissions/{id:guid}/chat")]
    public async Task StreamChat(
        Guid id,
        [FromBody] WritingChatRequest request,
        CancellationToken ct = default)
    {
        var submissionResult = await Mediator.Send(new GetWritingSubmissionByIdQuery(id, CurrentUserId), ct);
        if (!submissionResult.IsSuccess || submissionResult.Value == null)
        {
            Response.StatusCode = StatusCodes.Status404NotFound;
            await Response.WriteAsync("Submission not found.", ct);
            return;
        }

        var submission = submissionResult.Value;
        Response.ContentType = "text/event-stream";
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");

        await foreach (var token in _writingScorerService.StreamTutorChatAsync(
            submission.PromptText,
            submission.Content,
            submission.EvaluationResult,
            request.Message,
            ct))
        {
            await Response.WriteAsync($"data: {token}\n\n", ct);
            await Response.Body.FlushAsync(ct);
        }

        await Response.WriteAsync("data: [DONE]\n\n", ct);
        await Response.Body.FlushAsync(ct);
    }
}

public record SubmitWritingRequest(
    Guid PromptId,
    string Content,
    int TimeSpentSeconds);

public record WritingChatRequest(string Message);
