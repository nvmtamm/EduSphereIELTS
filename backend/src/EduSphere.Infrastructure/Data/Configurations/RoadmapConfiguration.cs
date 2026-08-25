using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Data.Configurations;

public class BandRoadmapConfiguration : IEntityTypeConfiguration<BandRoadmap>
{
    public void Configure(EntityTypeBuilder<BandRoadmap> builder)
    {
        builder.ToTable("BandRoadmaps");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.BandTier)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(r => r.TargetSkillsSummary)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasIndex(r => r.BandTier).IsUnique();

        builder.HasMany(r => r.Milestones)
            .WithOne(m => m.BandRoadmap)
            .HasForeignKey(m => m.BandRoadmapId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.Vocabularies)
            .WithOne(v => v.BandRoadmap)
            .HasForeignKey(v => v.BandRoadmapId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class BandMilestoneConfiguration : IEntityTypeConfiguration<BandMilestone>
{
    public void Configure(EntityTypeBuilder<BandMilestone> builder)
    {
        builder.ToTable("BandMilestones");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.StepNumber)
            .IsRequired();

        builder.Property(m => m.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.TargetSkill)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.Description)
            .HasMaxLength(500);

        builder.HasIndex(m => new { m.BandRoadmapId, m.StepNumber });

        builder.HasOne(m => m.ReadingPassage)
            .WithMany()
            .HasForeignKey(m => m.ReadingPassageId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class BandVocabularyConfiguration : IEntityTypeConfiguration<BandVocabulary>
{
    public void Configure(EntityTypeBuilder<BandVocabulary> builder)
    {
        builder.ToTable("BandVocabularies");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.BandTier)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(v => v.Word)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(v => v.Phonetic)
            .HasMaxLength(100);

        builder.Property(v => v.Meaning)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(v => v.PartOfSpeech)
            .HasMaxLength(50);

        builder.Property(v => v.AcademicLevel)
            .HasMaxLength(10);

        builder.Property(v => v.ExampleSentence)
            .HasMaxLength(1000);

        builder.Property(v => v.CollocationsJson)
            .HasMaxLength(2000);

        builder.Property(v => v.SynonymsJson)
            .HasMaxLength(2000);

        builder.HasIndex(v => v.BandTier);
        builder.HasIndex(v => v.Word);
    }
}

public class UserRoadmapProgressConfiguration : IEntityTypeConfiguration<UserRoadmapProgress>
{
    public void Configure(EntityTypeBuilder<UserRoadmapProgress> builder)
    {
        builder.ToTable("UserRoadmapProgresses");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.BandTier)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.EarnedBadge)
            .HasMaxLength(150);

        builder.HasIndex(p => new { p.UserId, p.BandTier }).IsUnique();

        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
