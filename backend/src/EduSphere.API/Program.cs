using System.Text;
using EduSphere.API.Extensions;
using EduSphere.API.Middleware;
using EduSphere.Application;
using EduSphere.Infrastructure;
using EduSphere.Infrastructure.Data;
using EduSphere.Infrastructure.Data.Seeders;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Load centralized root .env file for secrets & configuration
EnvLoader.LoadRootEnv(builder.Configuration);

// 1. Configure Serilog Structured Logging
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/edusphere-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Add Layer Services
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// 3. Configure JWT Authentication & Authorization
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "EduSphereSuperSecureSecretKeyForSigningJwtTokens2026!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "https://api.edusphere.io";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "https://edusphere.io";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 4. Add API Services & Controllers
builder.Services.AddControllers();
builder.Services.AddSwaggerDocumentation();

// 5. Configure Health Checks
builder.Services.AddHealthChecks();

// 6. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Auto-migrate database & seed initial IELTS Reading datasets
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();
        await ReadingDataSeeder.SeedAsync(db);
        await ListeningDataSeeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Could not auto-migrate or seed database on startup. Ensure SQL Server is accessible.");
    }
}

// 7. Configure HTTP Request Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "EduSphere API v1");
    c.RoutePrefix = "swagger";
});

app.UseSerilogRequestLogging();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// 8. Map Endpoints & Health Checks
app.MapControllers();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

try
{
    Log.Information("Starting EduSphere Web API Host...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "EduSphere Web API Host terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
