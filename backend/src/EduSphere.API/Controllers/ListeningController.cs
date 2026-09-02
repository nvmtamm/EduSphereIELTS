using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Listening.Commands.SubmitListeningExam;
using EduSphere.Application.Features.Listening.Commands.ExplainListeningQuestion;
using EduSphere.Application.Features.Listening.Models;
using EduSphere.Application.Features.Listening.Queries.GetListeningHistory;
using EduSphere.Application.Features.Listening.Queries.GetListeningTestById;
using EduSphere.Application.Features.Listening.Queries.GetListeningTests;
using EduSphere.Application.Features.Listening.Queries.GetListeningSubmissionById;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.API.Controllers;

[Route("api/listening")]
public class ListeningController : ApiControllerBase
{
    /// <summary>
    /// Get paginated list of IELTS Listening tests with filtering (Section, Accent, Difficulty, Topic, Source, Band)
    /// </summary>
    [HttpGet("tests")]
    [ProducesResponseType(typeof(PagedList<ListeningTestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTests(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] int? sectionNumber = null,
        [FromQuery] string? accent = null,
        [FromQuery] string? topic = null,
        [FromQuery] string? difficulty = null,
        [FromQuery] string? sourceType = null,
        [FromQuery] string? targetBandTier = null,
        [FromQuery] string? collectionName = null,
        [FromQuery] string? search = null,
        [FromQuery] bool? isPersonalOnly = null,
        CancellationToken ct = default)
    {
        var userId = User.Identity?.IsAuthenticated == true ? CurrentUserId : (Guid?)null;
        var query = new GetListeningTestsQuery(
            page, pageSize, sectionNumber, accent, topic, difficulty, sourceType, targetBandTier, collectionName, search, userId, isPersonalOnly);
        var result = await Mediator.Send(query, ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Get full listening test details, audio URL, questions, and timestamped transcripts
    /// </summary>
    [HttpGet("tests/{id:guid}")]
    [ProducesResponseType(typeof(ListeningTestDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetTestById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetListeningTestByIdQuery(id), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Submit completed listening exam answers for automated grading and Cambridge band score calculation
    /// </summary>
    [Authorize]
    [HttpPost("tests/{id:guid}/submit")]
    [ProducesResponseType(typeof(ListeningResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SubmitExam(
        Guid id,
        [FromBody] SubmitListeningExamRequest request,
        CancellationToken ct)
    {
        var command = new SubmitListeningExamCommand(
            CurrentUserId,
            id,
            request.DurationSeconds,
            request.Answers);

        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Get detailed review of a previously submitted listening test attempt
    /// </summary>
    [Authorize]
    [HttpGet("submissions/{id:guid}")]
    [ProducesResponseType(typeof(ListeningResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSubmissionById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetListeningSubmissionByIdQuery(id, CurrentUserId), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Get user's listening exam practice history and progression
    /// </summary>
    [Authorize]
    [HttpGet("history")]
    [ProducesResponseType(typeof(List<ListeningHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetHistory(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetListeningHistoryQuery(CurrentUserId), ct);
        return HandleResult(result);
    }
    /// <summary>
    /// Request AI diagnostic explanation for an IELTS listening question
    /// </summary>
    [Authorize]
    [HttpPost("explain")]
    [ProducesResponseType(typeof(ListeningAIExplanationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ExplainQuestion([FromBody] ExplainListeningQuestionRequest request, CancellationToken ct)
    {
        var command = new ExplainListeningQuestionCommand(request.QuestionId, request.UserAnswer);
        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }
}

public record SubmitListeningExamRequest(
    int DurationSeconds,
    List<UserListeningAnswerSubmissionDto> Answers);

public record ExplainListeningQuestionRequest(
    Guid QuestionId,
    string? UserAnswer);
