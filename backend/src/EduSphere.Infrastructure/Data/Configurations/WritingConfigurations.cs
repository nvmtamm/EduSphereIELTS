using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Data.Configurations;

public class WritingPromptConfiguration : IEntityTypeConfiguration<WritingPrompt>
{
    public void Configure(EntityTypeBuilder<WritingPrompt> builder)
    {
        builder.ToTable("WritingPrompts");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TaskType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(p => p.Topic)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(p => p.PromptText)
            .IsRequired();

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(1000)
            .IsRequired(false);

        builder.Property(p => p.Difficulty)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.RecommendedTimeMinutes)
            .IsRequired()
            .HasDefaultValue(40);

        builder.Property(p => p.MinWordCount)
            .IsRequired()
            .HasDefaultValue(250);

        builder.Property(p => p.SampleBand8Answer)
            .IsRequired(false);

        builder.Property(p => p.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(p => p.UploadedByUserId)
            .IsRequired(false);

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.Property(p => p.UpdatedAt)
            .IsRequired(false);

        builder.Property(p => p.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.HasIndex(p => p.TaskType);
        builder.HasIndex(p => p.Topic);

        builder.HasMany(p => p.Submissions)
            .WithOne(s => s.Prompt)
            .HasForeignKey(s => s.PromptId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(p => p.DomainEvents);
    }
}

public class WritingSubmissionConfiguration : IEntityTypeConfiguration<WritingSubmission>
{
    public void Configure(EntityTypeBuilder<WritingSubmission> builder)
    {
        builder.ToTable("WritingSubmissions");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.UserId)
            .IsRequired();

        builder.Property(s => s.PromptId)
            .IsRequired();

        builder.Property(s => s.Content)
            .IsRequired();

        builder.Property(s => s.WordCount)
            .IsRequired();

        builder.Property(s => s.TimeSpentSeconds)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(s => s.TaskAchievementScore)
            .IsRequired()
            .HasDefaultValue(0.0f);

        builder.Property(s => s.CoherenceCohesionScore)
            .IsRequired()
            .HasDefaultValue(0.0f);

        builder.Property(s => s.LexicalResourceScore)
            .IsRequired()
            .HasDefaultValue(0.0f);

        builder.Property(s => s.GrammaticalRangeScore)
            .IsRequired()
            .HasDefaultValue(0.0f);

        builder.Property(s => s.OverallBandScore)
            .IsRequired()
            .HasDefaultValue(0.0f);

        builder.Property(s => s.CriteriaBreakdownJson)
            .IsRequired()
            .HasDefaultValue("{}");

        builder.Property(s => s.GrammarErrorsJson)
            .IsRequired()
            .HasDefaultValue("[]");

        builder.Property(s => s.VocabularySuggestionsJson)
            .IsRequired()
            .HasDefaultValue("[]");

        builder.Property(s => s.GeneralFeedback)
            .HasMaxLength(4000)
            .IsRequired(false);

        builder.Property(s => s.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.Property(s => s.UpdatedAt)
            .IsRequired(false);

        builder.Property(s => s.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => s.PromptId);

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Ignore(s => s.DomainEvents);
    }
}
