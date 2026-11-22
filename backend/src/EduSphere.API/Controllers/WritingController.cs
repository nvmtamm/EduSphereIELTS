using System.Text.Json;
using EduSphere.Application.Common;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.API.Controllers;

public class WritingController(IApplicationDbContext db, IWritingGradingService grader) : ApiControllerBase
{
    public record PromptItemDto(Guid Id, string TaskType, string EssayType, string Title, string Topic, int MinWords, int SuggestedMinutes);
    public record PromptDetailDto(Guid Id, string TaskType, string EssayType, string Title, string Topic, string PromptText, string? DataText, int MinWords, int SuggestedMinutes);
    public record SubmitWritingRequest(Guid PromptId, string Essay, int DurationSeconds);
    public record SubmissionDto(Guid Id, Guid PromptId, string PromptTitle, string TaskType, string PromptText, string? DataText, string Essay,
        int WordCount, int DurationSeconds, decimal TaskResponse, decimal CoherenceCohesion, decimal LexicalResource, decimal GrammaticalRange,
        decimal OverallBand, JsonElement Feedback, string Outline, string ModelEssay, decimal ModelBand, DateTime SubmittedAt);
    public record HistoryItemDto(Guid Id, string PromptTitle, string TaskType, decimal OverallBand, int WordCount, DateTime SubmittedAt);

    [HttpGet("prompts")]
    public async Task<List<PromptItemDto>> GetPrompts([FromQuery] string? taskType, [FromQuery] string? essayType, [FromQuery] string? search, CancellationToken ct)
    {
        var q = db.WritingPrompts.AsNoTracking().AsQueryable();
        if (Enum.TryParse<WritingTaskType>(taskType, out var tt)) q = q.Where(p => p.TaskType == tt);
        if (!string.IsNullOrWhiteSpace(essayType)) q = q.Where(p => p.EssayType == essayType);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(p => p.Title.Contains(search) || p.Topic.Contains(search));
        var list = await q.OrderBy(p => p.TaskType).ThenBy(p => p.Title).ToListAsync(ct);
        return list.Select(p => new PromptItemDto(p.Id, p.TaskType.ToString(), p.EssayType, p.Title, p.Topic, p.MinWords, p.SuggestedMinutes)).ToList();
    }

    [HttpGet("prompts/{id:guid}")]
    public async Task<ActionResult<PromptDetailDto>> GetPrompt(Guid id, CancellationToken ct)
    {
        var p = await db.WritingPrompts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return p is null ? NotFound() : new PromptDetailDto(p.Id, p.TaskType.ToString(), p.EssayType, p.Title, p.Topic, p.PromptText, p.DataText, p.MinWords, p.SuggestedMinutes);
    }

    [Authorize]
    [HttpPost("submit")]
    public async Task<ActionResult<SubmissionDto>> Submit([FromBody] SubmitWritingRequest req, CancellationToken ct)
    {
        var prompt = await db.WritingPrompts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == req.PromptId, ct);
        if (prompt is null) return NotFound();

        var essay = (req.Essay ?? string.Empty).Trim();
        var words = WritingBand.CountWords(essay);
        if (words < 20) return BadRequest(new ProblemDetails { Title = "Essay too short", Detail = "Write at least 20 words before submitting." });
        if (essay.Length > 12000) return BadRequest(new ProblemDetails { Title = "Essay too long" });

        var g = await grader.GradeAsync(prompt.TaskType.ToString(), prompt.PromptText, prompt.DataText, essay, ct);

        var tr = WritingBand.CapTaskResponse(g.TaskResponse, words, prompt.MinWords);
        var overall = WritingBand.Overall(tr, g.CoherenceCohesion, g.LexicalResource, g.GrammaticalRange);
        var feedback = JsonSerializer.Serialize(new
        {
            summary = g.Summary,
            criterionComments = g.CriterionComments,
            errors = g.Errors,
            vocabularySuggestions = g.VocabularySuggestions,
            gradedBy = g.GradedBy,
            lengthPenaltyApplied = tr < g.TaskResponse
        }, new JsonSerializerOptions(JsonSerializerDefaults.Web));

        var sub = new WritingSubmission(CurrentUserId, prompt.Id, essay, words, Math.Max(0, req.DurationSeconds),
            tr, g.CoherenceCohesion, g.LexicalResource, g.GrammaticalRange, overall, feedback);
        db.WritingSubmissions.Add(sub);
        await db.SaveChangesAsync(ct);

        return ToDto(sub, prompt);
    }

    [Authorize]
    [HttpGet("submissions/{id:guid}")]
    public async Task<ActionResult<SubmissionDto>> GetSubmission(Guid id, CancellationToken ct)
    {
        var s = await db.WritingSubmissions.AsNoTracking().Include(x => x.Prompt)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUserId, ct);
        return s?.Prompt is null ? NotFound() : ToDto(s, s.Prompt);
    }

    [Authorize]
    [HttpGet("history")]
    public async Task<List<HistoryItemDto>> History(CancellationToken ct)
    {
        var list = await db.WritingSubmissions.AsNoTracking().Include(x => x.Prompt)
            .Where(x => x.UserId == CurrentUserId).OrderByDescending(x => x.CreatedAt).Take(50).ToListAsync(ct);
        return list.Select(s => new HistoryItemDto(s.Id, s.Prompt!.Title, s.Prompt.TaskType.ToString(), s.OverallBand, s.WordCount, s.CreatedAt)).ToList();
    }

    private static SubmissionDto ToDto(WritingSubmission s, WritingPrompt p) => new(
        s.Id, p.Id, p.Title, p.TaskType.ToString(), p.PromptText, p.DataText, s.Essay, s.WordCount, s.DurationSeconds,
        s.TaskResponse, s.CoherenceCohesion, s.LexicalResource, s.GrammaticalRange, s.OverallBand,
        JsonDocument.Parse(s.FeedbackJson).RootElement.Clone(), p.Outline, p.ModelEssay, p.ModelBand, s.CreatedAt);
}
