using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    
    // Reading
    DbSet<ReadingPassage> ReadingPassages { get; }
    DbSet<ReadingQuestion> ReadingQuestions { get; }
    DbSet<ReadingSubmission> ReadingSubmissions { get; }
    DbSet<ReadingSubmissionAnswer> ReadingSubmissionAnswers { get; }

    // Band Roadmaps & Vocab
    DbSet<BandRoadmap> BandRoadmaps { get; }
    DbSet<BandMilestone> BandMilestones { get; }
    DbSet<BandVocabulary> BandVocabularies { get; }
    DbSet<UserRoadmapProgress> UserRoadmapProgresses { get; }

    // Listening
    DbSet<ListeningTest> ListeningTests { get; }
    DbSet<ListeningQuestion> ListeningQuestions { get; }
    DbSet<ListeningTranscript> ListeningTranscripts { get; }
    DbSet<ListeningSubmission> ListeningSubmissions { get; }
    DbSet<ListeningSubmissionAnswer> ListeningSubmissionAnswers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
