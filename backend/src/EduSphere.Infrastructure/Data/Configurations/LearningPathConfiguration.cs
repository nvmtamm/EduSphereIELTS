using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Data.Configurations;

public class LearningLessonConfiguration : IEntityTypeConfiguration<LearningLesson>
{
    public void Configure(EntityTypeBuilder<LearningLesson> builder)
    {
        builder.ToTable("LearningLessons");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.StageTitle).IsRequired().HasMaxLength(200);
        builder.Property(l => l.Code).IsRequired().HasMaxLength(20);
        builder.Property(l => l.Title).IsRequired().HasMaxLength(200);
        builder.Property(l => l.Skill).IsRequired().HasMaxLength(50);
        builder.HasIndex(l => l.Code).IsUnique();
        builder.HasIndex(l => new { l.StageNumber, l.OrderInStage });
    }
}

public class UserLessonProgressConfiguration : IEntityTypeConfiguration<UserLessonProgress>
{
    public void Configure(EntityTypeBuilder<UserLessonProgress> builder)
    {
        builder.ToTable("UserLessonProgresses");
        builder.HasKey(p => p.Id);
        builder.HasIndex(p => new { p.UserId, p.LessonId }).IsUnique();
    }
}
