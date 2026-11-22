using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Data.Configurations;

public class WritingPromptConfiguration : IEntityTypeConfiguration<WritingPrompt>
{
    public void Configure(EntityTypeBuilder<WritingPrompt> b)
    {
        b.ToTable("WritingPrompts");
        b.HasKey(p => p.Id);
        b.Property(p => p.TaskType).HasConversion<string>().HasMaxLength(30);
        b.Property(p => p.EssayType).IsRequired().HasMaxLength(60);
        b.Property(p => p.Title).IsRequired().HasMaxLength(200);
        b.Property(p => p.Topic).IsRequired().HasMaxLength(100);
        b.Property(p => p.ModelBand).HasPrecision(3, 1);
    }
}

public class WritingSubmissionConfiguration : IEntityTypeConfiguration<WritingSubmission>
{
    public void Configure(EntityTypeBuilder<WritingSubmission> b)
    {
        b.ToTable("WritingSubmissions");
        b.HasKey(s => s.Id);
        foreach (var p in new[] { nameof(WritingSubmission.TaskResponse), nameof(WritingSubmission.CoherenceCohesion),
                     nameof(WritingSubmission.LexicalResource), nameof(WritingSubmission.GrammaticalRange), nameof(WritingSubmission.OverallBand) })
            b.Property(p).HasPrecision(3, 1);
        b.HasOne(s => s.Prompt).WithMany().HasForeignKey(s => s.PromptId).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(s => new { s.UserId, s.CreatedAt });
    }
}
