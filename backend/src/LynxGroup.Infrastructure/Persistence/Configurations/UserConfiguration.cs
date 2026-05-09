using LynxGroup.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LynxGroup.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.GoogleSubject)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasIndex(u => u.GoogleSubject)
            .IsUnique();

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(320);

        builder.Property(u => u.DisplayName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(u => u.CreatedAt)
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .IsRequired();
    }
}
