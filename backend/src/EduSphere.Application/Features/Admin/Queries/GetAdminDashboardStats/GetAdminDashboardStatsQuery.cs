using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Admin.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Admin.Queries.GetAdminDashboardStats;

public record GetAdminDashboardStatsQuery : IRequest<Result<AdminDashboardStatsDto>>;

public class GetAdminDashboardStatsQueryHandler : IRequestHandler<GetAdminDashboardStatsQuery, Result<AdminDashboardStatsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminDashboardStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AdminDashboardStatsDto>> Handle(GetAdminDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var totalLearners = await _context.Users.CountAsync(cancellationToken);

        var readingSubmissionsCount = await _context.ReadingSubmissions.CountAsync(cancellationToken);
        var listeningSubmissionsCount = await _context.ListeningSubmissions.CountAsync(cancellationToken);
        var writingSubmissionsCount = await _context.WritingSubmissions.CountAsync(cancellationToken);

        var totalSubmissions = readingSubmissionsCount + listeningSubmissionsCount + writingSubmissionsCount;

        // Compute average band score across skills
        var readingBands = await _context.ReadingSubmissions
            .Select(s => (double)s.BandScore)
            .ToListAsync(cancellationToken);

        var listeningBands = await _context.ListeningSubmissions
            .Select(s => (double)s.BandScore)
            .ToListAsync(cancellationToken);

        var writingBands = await _context.WritingSubmissions
            .Where(s => s.OverallBandScore > 0)
            .Select(s => (double)s.OverallBandScore)
            .ToListAsync(cancellationToken);

        var allBands = readingBands.Concat(listeningBands).Concat(writingBands).ToList();
        float avgBandScore = allBands.Count > 0 ? (float)Math.Round(allBands.Average(), 1) : 6.0f;

        var totalReadingPassages = await _context.ReadingPassages.CountAsync(cancellationToken);
        var totalListeningTests = await _context.ListeningTests.CountAsync(cancellationToken);
        var totalWritingPrompts = await _context.WritingPrompts.CountAsync(cancellationToken);

        // Recent 5 Writing Submissions
        var recentWriting = await _context.WritingSubmissions
            .Include(s => s.User)
            .Include(s => s.Prompt)
            .OrderByDescending(s => s.CreatedAt)
            .Take(5)
            .Select(s => new AdminRecentActivityDto(
                s.Id,
                s.User != null ? s.User.FullName : "Learner",
                s.User != null ? s.User.Email : string.Empty,
                "Writing",
                s.Prompt != null ? s.Prompt.Title : "Writing Task",
                s.OverallBandScore,
                s.CreatedAt))
            .ToListAsync(cancellationToken);

        // Recent 5 Reading Submissions
        var recentReading = await _context.ReadingSubmissions
            .Include(s => s.User)
            .Include(s => s.Passage)
            .OrderByDescending(s => s.CreatedAt)
            .Take(5)
            .Select(s => new AdminRecentActivityDto(
                s.Id,
                s.User != null ? s.User.FullName : "Learner",
                s.User != null ? s.User.Email : string.Empty,
                "Reading",
                s.Passage != null ? s.Passage.Title : "Reading Passage",
                (float)s.BandScore,
                s.CreatedAt))
            .ToListAsync(cancellationToken);

        var recentActivities = recentWriting.Concat(recentReading)
            .OrderByDescending(a => a.SubmittedAt)
            .Take(10)
            .ToList();

        var stats = new AdminDashboardStatsDto(
            totalLearners,
            totalSubmissions,
            avgBandScore,
            totalReadingPassages,
            totalListeningTests,
            totalWritingPrompts,
            recentActivities);

        return Result<AdminDashboardStatsDto>.Success(stats);
    }
}
