using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Commands.SubmitReadingExam;
using EduSphere.Application.Features.Reading.Models;
using EduSphere.Application.Features.Reading.Queries.GetReadingPassageById;
using EduSphere.Application.Features.Reading.Queries.GetReadingPassages;
using EduSphere.Application.Features.Reading.Queries.GetReadingSubmissionById;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.API.Controllers;

public class ReadingController : ApiControllerBase
{
    /// <summary>
    /// Lấy danh sách đề thi IELTS Reading phân trang có bộ lọc topic, difficulty và tìm kiếm
    /// </summary>
    [HttpGet("passages")]
    [ProducesResponseType(typeof(PagedList<ReadingPassageDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPassages(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? topic = null,
        [FromQuery] string? difficulty = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetReadingPassagesQuery(page, pageSize, topic, difficulty, search), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Lấy nội dung chi tiết bài đọc và danh sách câu hỏi để bắt đầu thi
    /// </summary>
    [HttpGet("passages/{id:guid}")]
    [ProducesResponseType(typeof(ReadingPassageDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetPassageById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetReadingPassageByIdQuery(id), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Nộp bài thi IELTS Reading và nhận kết quả chấm điểm tự động
    /// </summary>
    [Authorize]
    [HttpPost("submissions")]
    [ProducesResponseType(typeof(ReadingResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SubmitExam([FromBody] SubmitReadingExamRequest request, CancellationToken ct)
    {
        var command = new SubmitReadingExamCommand(CurrentUserId, request.PassageId, request.DurationSeconds, request.Answers);
        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Xem lại kết quả bài nộp chi tiết kèm lời giải thích cho từng câu
    /// </summary>
    [Authorize]
    [HttpGet("submissions/{id:guid}")]
    [ProducesResponseType(typeof(ReadingResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSubmissionById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetReadingSubmissionByIdQuery(id, CurrentUserId), ct);
        return HandleResult(result);
    }
}

public record SubmitReadingExamRequest(
    Guid PassageId,
    int DurationSeconds,
    List<UserAnswerSubmissionDto> Answers);
