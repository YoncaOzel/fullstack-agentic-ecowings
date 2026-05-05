using CleanArchitecture.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.IO;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        IConfigurationRoot configuration = new ConfigurationBuilder()
            // Not: appsettings.json dosyan WebApi katmanındaysa burası WebApi yolunu göstermeli
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../CleanArchitecture.WebApi"))
            .AddJsonFile("appsettings.json")
            .Build();

        var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        // MySQL yerine Npgsql (PostgreSQL) kullanıyoruz
        builder.UseNpgsql(connectionString);

        return new ApplicationDbContext(builder.Options);
    }
}