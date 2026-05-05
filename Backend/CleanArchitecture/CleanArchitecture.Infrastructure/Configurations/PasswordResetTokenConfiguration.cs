using CleanArchitecture.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CleanArchitecture.Infrastructure.Configurations
{
    public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
    {
        public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
        {
            builder.ToTable("PasswordResetTokens");
            builder.HasKey(t => t.Id);

            builder.Property(t => t.HashedToken)
                .IsRequired()
                .HasMaxLength(128)
                .HasColumnType("varchar(128)");

            builder.HasIndex(t => t.HashedToken)
                .IsUnique()
                .HasDatabaseName("IX_PasswordResetTokens_HashedToken");

            builder.Property(t => t.UserId)
                .IsRequired()
                .HasMaxLength(450)
                .HasColumnType("varchar(450)");

            builder.HasIndex(t => t.UserId)
                .HasDatabaseName("IX_PasswordResetTokens_UserId");

            builder.Property(t => t.ExpiryDate).IsRequired();
            builder.Property(t => t.IsUsed).IsRequired().HasDefaultValue(false);
            builder.Property(t => t.CreatedAt).IsRequired().HasDefaultValueSql("now()");
        }
    }
}
