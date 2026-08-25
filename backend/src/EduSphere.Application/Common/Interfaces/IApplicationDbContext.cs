using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<ReadingPassage> ReadingPassages { get; }
    DbSet<ReadingQuestion> ReadingQuestions { get; }
    DbSet<ReadingSubmission> ReadingSubmissions { get; }
    DbSet<ReadingSubmissionAnswer> ReadingSubmissionAnswers { get; }

    DbSet<BandRoadmap> BandRoadmaps { get; }
    DbSet<BandMilestone> BandMilestones { get; }
    DbSet<BandVocabulary> BandVocabularies { get; }
    DbSet<UserRoadmapProgress> UserRoadmapProgresses { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
