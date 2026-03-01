using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Settings;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Models;
using CleanArchitecture.Infrastructure.Repositories;
using CleanArchitecture.Infrastructure.Repository;
using CleanArchitecture.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System;
using System.Text;

namespace CleanArchitecture.Infrastructure
{
    public static class ServiceRegistration
    {
        public static void AddPersistenceInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // DbContext
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql( // UseNpgsql kullanıyoruz
                    configuration.GetConnectionString("DefaultConnection")
                )
            );

            // Identity
            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // JWT Settings
            services.Configure<JWTSettings>(configuration.GetSection("JWTSettings"));

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true; // Token saklama açık olsun
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    ValidIssuer = configuration["JWTSettings:Issuer"],
                    ValidAudience = configuration["JWTSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWTSettings:Key"]))
                };
                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        context.NoResult();
                        context.Response.StatusCode = 500;
                        context.Response.ContentType = "text/plain";
                        return context.Response.WriteAsync(context.Exception.ToString());
                    },
                    OnChallenge = context =>
                    {
                        context.HandleResponse();
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";
                        var result = JsonConvert.SerializeObject(new { error = "You are not Authorized" });
                        return context.Response.WriteAsync(result);
                    },
                    OnForbidden = context =>
                    {
                        context.Response.StatusCode = 403;
                        context.Response.ContentType = "application/json";
                        var result = JsonConvert.SerializeObject(new { error = "You are not authorized to access this resource" });
                        return context.Response.WriteAsync(result);
                    }
                };
            });

            // Application Services
            services.AddTransient<IDateTimeService, DateTimeService>();
            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IAccountService, AccountService>();
            services.AddTransient<ITokenService, TokenService>(); // Burayı da ekledim: Login için şart!
            services.AddTransient<IUserIdentityService, UserIdentityService>();
            services.Configure<AmadeusSettings>(configuration.GetSection("AmadeusSettings"));
            services.AddHttpClient<IAmadeusService, AmadeusService>();
            services.Configure<StripeSettings>(configuration.GetSection("StripeSettings"));
            services.AddTransient<IPaymentService, StripePaymentService>();


            // Repositories
            services.AddScoped(typeof(IGenericRepositoryAsync<>), typeof(GenericRepositoryAsync<>));
            services.AddScoped<IProductRepositoryAsync, ProductRepositoryAsync>();
            services.AddScoped<ICategoryRepositoryAsync, CategoryRepositoryAsync>();
            services.AddScoped<IUserRepositoryAsync, UserRepositoryAsync>(); // Interface ve repository doğru olmalı
            services.AddScoped<IFlightRepositoryAsync, FlightRepositoryAsync>();

            // Extra Configurations
            services.Configure<MailSettings>(configuration.GetSection("MailSettings"));

            services.Configure<IdentityOptions>(options => {
                options.SignIn.RequireConfirmedEmail = false; // Set to true later
            });
        }
    }
}
