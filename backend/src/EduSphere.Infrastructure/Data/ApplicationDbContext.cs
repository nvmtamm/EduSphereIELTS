using System.Reflection;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public DbSet<User> Users => Set<User>();
    
    // Reading
    public DbSet<ReadingPassage> ReadingPassages => Set<ReadingPassage>();
    public DbSet<ReadingQuestion> ReadingQuestions => Set<ReadingQuestion>();
    public DbSet<ReadingSubmission> ReadingSubmissions => Set<ReadingSubmission>();
    public DbSet<ReadingSubmissionAnswer> ReadingSubmissionAnswers => Set<ReadingSubmissionAnswer>();

    // Band Roadmaps & Vocab
    public DbSet<BandRoadmap> BandRoadmaps => Set<BandRoadmap>();
    public DbSet<BandMilestone> BandMilestones => Set<BandMilestone>();
    public DbSet<BandVocabulary> BandVocabularies => Set<BandVocabulary>();
    public DbSet<UserRoadmapProgress> UserRoadmapProgresses => Set<UserRoadmapProgress>();

    // Listening
    public DbSet<ListeningTest> ListeningTests => Set<ListeningTest>();
    public DbSet<ListeningQuestion> ListeningQuestions => Set<ListeningQuestion>();
    public DbSet<ListeningTranscript> ListeningTranscripts => Set<ListeningTranscript>();
    public DbSet<ListeningSubmission> ListeningSubmissions => Set<ListeningSubmission>();
    public DbSet<ListeningSubmissionAnswer> ListeningSubmissionAnswers => Set<ListeningSubmissionAnswer>();
    public DbSet<ListeningSectionAudio> ListeningSectionAudios => Set<ListeningSectionAudio>(); // F-04

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
