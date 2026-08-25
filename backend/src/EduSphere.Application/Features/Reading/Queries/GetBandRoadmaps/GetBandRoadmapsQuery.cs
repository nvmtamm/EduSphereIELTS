using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Models;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Reading.Queries.GetBandRoadmaps;

public record GetBandRoadmapsQuery(Guid? UserId = null) : IRequest<Result<List<BandRoadmapDto>>>;

public class GetBandRoadmapsQueryHandler : IRequestHandler<GetBandRoadmapsQuery, Result<List<BandRoadmapDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetBandRoadmapsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<BandRoadmapDto>>> Handle(GetBandRoadmapsQuery request, CancellationToken cancellationToken)
    {
        var roadmaps = await _context.BandRoadmaps
            .AsNoTracking()
            .Include(r => r.Milestones)
            .OrderBy(r => r.BandTier)
            .ToListAsync(cancellationToken);

        var userProgresses = new Dictionary<TargetBandTier, UserRoadmapProgress>();
        if (request.UserId.HasValue)
        {
            var progresses = await _context.UserRoadmapProgresses
                .AsNoTracking()
                .Where(p => p.UserId == request.UserId.Value)
                .ToListAsync(cancellationToken);

            userProgresses = progresses.ToDictionary(p => p.BandTier, p => p);
        }

        var result = roadmaps.Select(r =>
        {
            var userProgress = userProgresses.TryGetValue(r.BandTier, out var prog) ? prog : null;
            var currentStep = userProgress?.CurrentStepNumber ?? 1;
            var mastery = userProgress?.MasteryPercentage ?? 0.0f;
            var badge = userProgress?.EarnedBadge;

            var milestonesDto = r.Milestones
                .OrderBy(m => m.StepNumber)
                .Select(m => new BandMilestoneDto(
                    m.Id,
                    m.StepNumber,
                    m.Title,
                    m.TargetSkill,
                    m.Description,
                    m.ReadingPassageId,
                    m.MinAccuracyToUnlockNext,
                    IsCompleted: m.StepNumber < currentStep,
                    UserBestAccuracy: m.StepNumber < currentStep ? 85.0f : null))
                .ToList();

            return new BandRoadmapDto(
                r.Id,
                r.BandTier.ToString(),
                r.Title,
                r.Description,
                r.TargetSkillsSummary,
                r.TotalMilestones,
                r.VocabularyCount,
                CurrentUserStep: currentStep,
                UserMasteryPercentage: mastery,
                EarnedBadge: badge,
                Milestones: milestonesDto);
        }).ToList();

        return Result.Success(result);
    }
}
