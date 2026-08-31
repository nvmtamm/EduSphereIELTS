using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Data.Configurations;

public class ListeningSectionAudioConfiguration : IEntityTypeConfiguration<ListeningSectionAudio>
{
    public void Configure(EntityTypeBuilder<ListeningSectionAudio> builder)
    {
        builder.ToTable("ListeningSectionAudios");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.SectionNumber)
            .IsRequired();

        builder.Property(a => a.AudioUrl)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(a => a.DurationSeconds)
            .IsRequired();

        builder.Property(a => a.SectionTitle)
            .HasMaxLength(200);

        builder.HasOne(a => a.Test)
            .WithMany(t => t.SectionAudios)
            .HasForeignKey(a => a.ListeningTestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => new { a.ListeningTestId, a.SectionNumber }).IsUnique();
    }
}
