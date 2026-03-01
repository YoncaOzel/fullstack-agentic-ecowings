using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using System.Reflection.Emit;

namespace CleanArchitecture.Infrastructure.Contexts
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        private readonly IDateTimeService _dateTime;
        private readonly IAuthenticatedUserService _authenticatedUser;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IDateTimeService dateTime, IAuthenticatedUserService authenticatedUser) : base(options)
        {
            ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
            _dateTime = dateTime;
            _authenticatedUser = authenticatedUser;
        }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
            ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Airline> Airlines { get; set; }
        public DbSet<AirlineReview> AirlineReviews { get; set; }
        public DbSet<Airport> Airports { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<Flight> Flights { get; set; }
        public DbSet<Ticket> Tickets { get; set; }


        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            foreach (var entry in ChangeTracker.Entries<AuditableBaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.Created = _dateTime.NowUtc;
                        entry.Entity.CreatedBy = _authenticatedUser?.UserId;
                        entry.Entity.LastModifiedBy = _authenticatedUser?.UserId;
                        break;
                    case EntityState.Modified:
                        entry.Entity.LastModified = _dateTime.NowUtc;
                        entry.Entity.LastModifiedBy = _authenticatedUser.UserId;
                        break;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {

            builder.Entity<ApplicationUser>(entity =>
            {
                entity.ToTable(name: "User");
            });

            builder.Entity<IdentityRole>(entity =>
            {
                entity.ToTable(name: "Role");
            });
            builder.Entity<IdentityUserRole<string>>(entity =>
            {
                entity.ToTable("UserRoles");
            });

            builder.Entity<IdentityUserClaim<string>>(entity =>
            {
                entity.ToTable("UserClaims");
            });

            builder.Entity<IdentityUserLogin<string>>(entity =>
            {
                entity.ToTable("UserLogins");
            });

            builder.Entity<IdentityRoleClaim<string>>(entity =>
            {
                entity.ToTable("RoleClaims");

            });

            builder.Entity<IdentityUserToken<string>>(entity =>
            {
                entity.ToTable("UserTokens");
            });
            builder.Entity<Flight>()
                .HasOne(f => f.Departure)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Flight>()
                .HasOne(f => f.Destination)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Flight>()
                .HasOne(f => f.Airline)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);
            builder.Entity<User>().HasKey(t => t.Id);
            // Airline ile Flight arasındaki ilişkiyi düzgünce ayarla
            builder.Entity<Flight>()
                .HasOne(f => f.Airline)
                .WithMany(a => a.Flights)
                .HasForeignKey(f => f.AirlineId)
                .OnDelete(DeleteBehavior.Restrict);

            // Departure ve Destination ilişkilerini de ekle (önceden eklediğin gibi)
            builder.Entity<Flight>()
                .HasOne(f => f.Departure)
                .WithMany()
                .HasForeignKey(f => f.DepartureAirportId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Flight>()
                .HasOne(f => f.Destination)
                .WithMany()
                .HasForeignKey(f => f.DestinationAirportId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.Entity<Ticket>()
                .HasOne(t => t.Passenger)
                .WithMany()
                .HasForeignKey(t => t.PassengerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Ticket>()
                .HasOne(t => t.Flight)
                .WithMany()
                .HasForeignKey(t => t.FlightId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Coupon>()
                .HasOne(c => c.SenderUser)
                .WithMany()
                .HasForeignKey(c => c.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Coupon>()
                .HasOne(c => c.ReceiverUser)
                .WithMany()
                .HasForeignKey(c => c.ReceiverUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<AirlineReview>()
                .HasOne(ar => ar.Airline)
                .WithMany(a => a.Reviews)
                .HasForeignKey(ar => ar.AirlineId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<AirlineReview>()
                .HasOne(ar => ar.User)
                .WithMany()
                .HasForeignKey(ar => ar.UserId)
                .OnDelete(DeleteBehavior.Restrict);




            //builder.Entity<Flight>()
            //    .HasOne(f => f.Airline)                     // Flight.Airline
            //    .WithMany(a => a.Flights)                   // Airline.Flights
            //    .HasForeignKey(f => f.AirlineId)             // FK: Flight.AirlineId
            //    .OnDelete(DeleteBehavior.Restrict);


            //All Decimals will have 18,6 Range
            foreach (var property in builder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
            {
                property.SetColumnType("decimal(18,6)");
            }
            base.OnModelCreating(builder);
        }
    }
}
