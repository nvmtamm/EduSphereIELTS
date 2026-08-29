using EduSphere.Application.Common.Interfaces;
using EduSphere.Infrastructure.Data;
using EduSphere.Infrastructure.HarnessPipeline;
using EduSphere.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EduSphere.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. SQL Server Database Setup
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=localhost,1433;Database=EduSphere;User Id=sa;Password=EduSphere@2026StrongPass!;TrustServerCertificate=True;";

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString, b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        // 2. Redis Distributed Cache Setup (with Memory Cache Fallback)
        var redisConnectionString = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrWhiteSpace(redisConnectionString))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnectionString;
                options.InstanceName = "EduSphere_";
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        // 3. Security & Cryptography Services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        // 4. Domain & Scoring Services
        services.AddScoped<IReadingScoringService, ReadingScoringService>();
        services.AddScoped<IListeningScoringService, ListeningScoringService>();

        // 5. AI Services & Multi-Agent Pipeline
        services.AddHttpClient<IReadingAITutorService, ReadingAITutorService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(180);
        });
        services.AddHttpClient<IDocumentIngestionService, DocumentIngestionService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(180);
        });

        return services;
    }
}
