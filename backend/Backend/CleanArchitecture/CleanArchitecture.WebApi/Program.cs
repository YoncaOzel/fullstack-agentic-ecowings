using CleanArchitecture.Core;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure;
using CleanArchitecture.Infrastructure.Models;
using CleanArchitecture.Infrastructure.Repositories;
using CleanArchitecture.Infrastructure.Repository;
using CleanArchitecture.WebApi.Extensions;
using CleanArchitecture.WebApi.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using System;
using CleanArchitecture.Infrastructure.Contexts; 
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;


var builder = WebApplication.CreateBuilder(args);

//Add configurations
builder.Configuration.AddJsonFile("appsettings.json");
builder.Configuration.AddJsonFile("appsettings.Development.json", optional: true);




// Replace the following line:  
// builder.Services.AddMediatR(AppDomain.CurrentDomain.GetAssemblies());  

// With this corrected line:  
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(AppDomain.CurrentDomain.GetAssemblies()));



builder.Services.AddApplicationLayer();
builder.Services.AddPersistenceInfrastructure(builder.Configuration);
builder.Services.AddSwaggerExtension();
builder.Services.AddScoped<IUserRepositoryAsync, UserRepositoryAsync>();
builder.Services.AddScoped(typeof(IGenericRepositoryAsync<>), typeof(GenericRepositoryAsync<>));
builder.Services.AddScoped<IFlightRepositoryAsync, FlightRepositoryAsync>();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
}); builder.Services.AddApiVersioningExtension();
builder.Services.AddHealthChecks();
builder.Services.AddScoped<IAuthenticatedUserService, AuthenticatedUserService>();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

//Build the application
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}
app.UseHttpsRedirection();

app.UseRouting();
app.UseCors(options => options.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
app.UseAuthentication();
app.UseAuthorization();
app.UseSwaggerExtension();
app.UseErrorHandlingMiddleware();
app.UseHealthChecks("/health");


app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});


//Initialize Logger

Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(app.Configuration)
                .CreateLogger();

//Seed Default Data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var loggerFactory = services.GetRequiredService<ILoggerFactory>();
    try
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        await CleanArchitecture.Infrastructure.Seeds.DefaultRoles.SeedAsync(userManager, roleManager);
        await CleanArchitecture.Infrastructure.Seeds.DefaultSuperAdmin.SeedAsync(userManager, roleManager);
        await CleanArchitecture.Infrastructure.Seeds.DefaultBasicUser.SeedAsync(userManager, roleManager);
        Log.Information("Finished Seeding Default Data");
        Log.Information("Application Starting");
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "An error occurred seeding the DB");
    }
    finally
    {
        Log.CloseAndFlush();
    }
}

//Start the application
app.Run();