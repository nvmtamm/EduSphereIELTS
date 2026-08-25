using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Commands.IngestDocument;
using EduSphere.Application.Features.Reading.Commands.SubmitReadingExam;
using EduSphere.Application.Features.Reading.Models;
using EduSphere.Application.Features.Reading.Queries.AskReadingAITutor;
using EduSphere.Application.Features.Reading.Queries.GetBandRoadmaps;
using EduSphere.Application.Features.Reading.Queries.GetBandVocabularies;
using EduSphere.Application.Features.Reading.Queries.GetReadingPassageById;
using EduSphere.Application.Features.Reading.Queries.GetReadingPassages;
using EduSphere.Application.Features.Reading.Queries.GetReadingSubmissionById;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.API.Controllers;

public class ReadingController : ApiControllerBase
{
    /// <summary>
    /// Lấy danh sách đề thi IELTS Reading phân trang có bộ lọc đa kho đề (Cambridge, Past Actual, Personal Vault, AI Generated)
    /// </summary>
    [HttpGet("passages")]
    [ProducesResponseType(typeof(PagedList<ReadingPassageDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPassages(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
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
        var query = new GetReadingPassagesQuery(
            page, pageSize, topic, difficulty, sourceType, targetBandTier, collectionName, search, userId, isPersonalOnly);
        var result = await Mediator.Send(query, ct);
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
    /// Lấy danh sách 6 Lộ trình Band Roadmap (Pre-IELTS 0-3.5 đến Band 8.5+) kèm tiến độ của học viên
    /// </summary>
    [HttpGet("roadmaps")]
    [ProducesResponseType(typeof(List<BandRoadmapDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoadmaps(CancellationToken ct)
    {
        var userId = User.Identity?.IsAuthenticated == true ? CurrentUserId : (Guid?)null;
        var result = await Mediator.Send(new GetBandRoadmapsQuery(userId), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Lấy danh sách từ vựng chuyên biệt theo từng phân khúc Band
    /// </summary>
    [HttpGet("vocabularies")]
    [ProducesResponseType(typeof(List<BandVocabularyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVocabularies(
        [FromQuery] string? bandTier = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetBandVocabulariesQuery(bandTier, search), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Gửi câu hỏi cho RAG AI Tutor trong phòng thi hoặc xem lại bài thi
    /// </summary>
    [HttpPost("ai-tutor")]
    [ProducesResponseType(typeof(AITutorMessageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AskAITutor([FromBody] AskAITutorRequest request, CancellationToken ct)
    {
        var query = new AskReadingAITutorQuery(request.PassageId, request.Question, request.ActiveQuestionPrompt, request.IsPostExamReview);
        var result = await Mediator.Send(query, ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Pipeline Multi-Agent (Harness Core) tự động chuyển đổi file văn bản/đề thi thành đề thi tương tác
    /// </summary>
    [Authorize]
    [HttpPost("ingest-document")]
    [ProducesResponseType(typeof(DocumentIngestResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> IngestDocument([FromBody] IngestDocumentRequest request, CancellationToken ct)
    {
        var command = new IngestDocumentCommand(
            request.RawText,
            request.FileName,
            request.CollectionName,
            request.TargetBandTier,
            CurrentUserId,
            request.IsCommunityShared);

        var result = await Mediator.Send(command, ct);
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

public record AskAITutorRequest(
    Guid PassageId,
    string Question,
    string? ActiveQuestionPrompt = null,
    bool IsPostExamReview = false);

public record IngestDocumentRequest(
    string RawText,
    string FileName,
    string CollectionName = "Personal Test Vault",
    string TargetBandTier = "Band6_0_6_5",
    bool IsCommunityShared = false);
