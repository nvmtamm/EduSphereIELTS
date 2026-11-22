using EduSphere.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduSphere.Domain.Entities;

namespace EduSphere.API.Controllers;

public class LearningPathController(IApplicationDbContext db) : ApiControllerBase
{
    public record LessonSummaryDto(Guid Id, string Code, int OrderInStage, string Title, string Skill, bool Completed);
    public record StageDto(int StageNumber, string Title, int TotalLessons, int CompletedLessons, List<LessonSummaryDto> Lessons);
    public record LearningPathDto(int TotalLessons, int CompletedLessons, List<StageDto> Stages);
    public record LessonDetailDto(Guid Id, string Code, int StageNumber, string StageTitle, int OrderInStage, string Title, string Skill, string SummaryMarkdown, string ItemsJson, bool Completed, string? PreviousCode, string? NextCode);

    [HttpGet]
    public async Task<ActionResult<LearningPathDto>> Get(CancellationToken ct)
    {
        var done = await CompletedIdsAsync(ct);
        var lessons = await db.LearningLessons.AsNoTracking()
            .OrderBy(l => l.StageNumber).ThenBy(l => l.OrderInStage).ToListAsync(ct);

        var stages = lessons.GroupBy(l => l.StageNumber).Select(g =>
        {
            var items = g.Select(l => new LessonSummaryDto(l.Id, l.Code, l.OrderInStage, l.Title, l.Skill, done.Contains(l.Id))).ToList();
            return new StageDto(g.Key, g.First().StageTitle, items.Count, items.Count(i => i.Completed), items);
        }).ToList();

        return new LearningPathDto(lessons.Count, stages.Sum(s => s.CompletedLessons), stages);
    }

    [HttpGet("lessons/{code}")]
    public async Task<ActionResult<LessonDetailDto>> GetLesson(string code, CancellationToken ct)
    {
        var all = await db.LearningLessons.AsNoTracking()
            .OrderBy(l => l.StageNumber).ThenBy(l => l.OrderInStage).ToListAsync(ct);
        var idx = all.FindIndex(l => string.Equals(l.Code, code, StringComparison.OrdinalIgnoreCase));
        if (idx < 0) return NotFound();

        var l = all[idx];
        var done = await CompletedIdsAsync(ct);
        return new LessonDetailDto(l.Id, l.Code, l.StageNumber, l.StageTitle, l.OrderInStage, l.Title, l.Skill,
            l.SummaryMarkdown, l.ItemsJson, done.Contains(l.Id),
            idx > 0 ? all[idx - 1].Code : null, idx < all.Count - 1 ? all[idx + 1].Code : null);
    }

    [Authorize]
    [HttpPost("lessons/{code}/complete")]
    public async Task<IActionResult> Complete(string code, CancellationToken ct)
    {
        var lesson = await db.LearningLessons.FirstOrDefaultAsync(l => l.Code == code, ct);
        if (lesson is null) return NotFound();

        var userId = CurrentUserId;
        var exists = await db.UserLessonProgresses.AnyAsync(p => p.UserId == userId && p.LessonId == lesson.Id, ct);
        if (!exists)
        {
            db.UserLessonProgresses.Add(new UserLessonProgress(userId, lesson.Id));
            await db.SaveChangesAsync(ct);
        }
        return NoContent();
    }

    private async Task<HashSet<Guid>> CompletedIdsAsync(CancellationToken ct)
    {
        if (User.Identity?.IsAuthenticated != true) return new HashSet<Guid>();
        var userId = CurrentUserId;
        var ids = await db.UserLessonProgresses.AsNoTracking()
            .Where(p => p.UserId == userId).Select(p => p.LessonId).ToListAsync(ct);
        return ids.ToHashSet();
    }
}
