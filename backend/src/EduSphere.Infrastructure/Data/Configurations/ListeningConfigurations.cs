using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Data.Configurations;

public class ListeningTestConfiguration : IEntityTypeConfiguration<ListeningTest>
{
    public void Configure(EntityTypeBuilder<ListeningTest> builder)
    {
        builder.ToTable("ListeningTests");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(t => t.Topic)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(t => t.Difficulty)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(t => t.SectionType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(80);

        builder.Property(t => t.Accent)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(t => t.SourceType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(t => t.CollectionName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(t => t.TargetBandTier)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(t => t.AudioUrl)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(t => t.Instructions)
            .HasMaxLength(2000);

        builder.HasMany(t => t.Questions)
            .WithOne(q => q.Test)
            .HasForeignKey(q => q.TestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Transcripts)
            .WithOne(tr => tr.Test)
            .HasForeignKey(tr => tr.TestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Submissions)
            .WithOne(s => s.Test)
            .HasForeignKey(s => s.TestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.SectionAudios)
            .WithOne(a => a.Test)
            .HasForeignKey(a => a.ListeningTestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => new { t.SectionNumber, t.Difficulty });
        builder.HasIndex(t => t.Accent);
        builder.HasIndex(t => t.CollectionName);
    }
}

public class ListeningQuestionConfiguration : IEntityTypeConfiguration<ListeningQuestion>
{
    public void Configure(EntityTypeBuilder<ListeningQuestion> builder)
    {
        builder.ToTable("ListeningQuestions");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.QuestionNumber)
            .IsRequired();

        builder.Property(q => q.SectionNumber)
            .IsRequired();

        builder.Property(q => q.QuestionType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(q => q.Prompt)
            .IsRequired();

        builder.Property(q => q.OptionsJson)
            .IsRequired();

        builder.Property(q => q.CorrectAnswer)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(q => q.Explanation)
            .HasMaxLength(4000);

        builder.Property(q => q.DiagramImageUrl)
            .HasMaxLength(1000);

        builder.HasIndex(q => new { q.TestId, q.QuestionNumber });
        builder.HasIndex(q => new { q.TestId, q.SectionNumber });
    }
}

public class ListeningTranscriptConfiguration : IEntityTypeConfiguration<ListeningTranscript>
{
    public void Configure(EntityTypeBuilder<ListeningTranscript> builder)
    {
        builder.ToTable("ListeningTranscripts");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Speaker)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.TextContent)
            .IsRequired();

        builder.HasIndex(t => new { t.TestId, t.StartTimeSeconds });
    }
}

public class ListeningSubmissionConfiguration : IEntityTypeConfiguration<ListeningSubmission>
{
    public void Configure(EntityTypeBuilder<ListeningSubmission> builder)
    {
        builder.ToTable("ListeningSubmissions");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.BreakdownJson)
            .IsRequired();

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Answers)
            .WithOne(a => a.Submission)
            .HasForeignKey(a => a.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.UserId, s.CreatedAt });
        builder.HasIndex(s => s.TestId);
    }
}

public class ListeningSubmissionAnswerConfiguration : IEntityTypeConfiguration<ListeningSubmissionAnswer>
{
    public void Configure(EntityTypeBuilder<ListeningSubmissionAnswer> builder)
    {
        builder.ToTable("ListeningSubmissionAnswers");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.UserAnswer)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.CorrectAnswer)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(a => new { a.SubmissionId, a.QuestionId });
    }
}
