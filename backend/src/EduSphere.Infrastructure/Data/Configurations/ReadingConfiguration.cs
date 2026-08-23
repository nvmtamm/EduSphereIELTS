using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Data.Configurations;

public class ReadingPassageConfiguration : IEntityTypeConfiguration<ReadingPassage>
{
    public void Configure(EntityTypeBuilder<ReadingPassage> builder)
    {
        builder.ToTable("ReadingPassages");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(p => p.Topic)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Difficulty)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.Content)
            .IsRequired();

        builder.Property(p => p.EstimatedTimeMinutes)
            .HasDefaultValue(20);

        builder.HasIndex(p => p.Topic);
        builder.HasIndex(p => p.Difficulty);

        builder.HasMany(p => p.Questions)
            .WithOne(q => q.Passage)
            .HasForeignKey(q => q.PassageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Submissions)
            .WithOne(s => s.Passage)
            .HasForeignKey(s => s.PassageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ReadingQuestionConfiguration : IEntityTypeConfiguration<ReadingQuestion>
{
    public void Configure(EntityTypeBuilder<ReadingQuestion> builder)
    {
        builder.ToTable("ReadingQuestions");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.QuestionNumber)
            .IsRequired();

        builder.Property(q => q.QuestionType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(q => q.Prompt)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(q => q.OptionsJson)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(q => q.CorrectAnswer)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(q => q.Explanation)
            .HasMaxLength(2000);

        builder.HasIndex(q => new { q.PassageId, q.QuestionNumber });
    }
}

public class ReadingSubmissionConfiguration : IEntityTypeConfiguration<ReadingSubmission>
{
    public void Configure(EntityTypeBuilder<ReadingSubmission> builder)
    {
        builder.ToTable("ReadingSubmissions");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.RawScore)
            .IsRequired();

        builder.Property(s => s.TotalQuestions)
            .IsRequired();

        builder.Property(s => s.BandScore)
            .IsRequired();

        builder.Property(s => s.DurationSeconds)
            .IsRequired();

        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => s.PassageId);

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(s => s.Answers)
            .WithOne(a => a.Submission)
            .HasForeignKey(a => a.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ReadingSubmissionAnswerConfiguration : IEntityTypeConfiguration<ReadingSubmissionAnswer>
{
    public void Configure(EntityTypeBuilder<ReadingSubmissionAnswer> builder)
    {
        builder.ToTable("ReadingSubmissionAnswers");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.UserAnswer)
            .HasMaxLength(500);

        builder.Property(a => a.IsCorrect)
            .IsRequired();

        builder.HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
