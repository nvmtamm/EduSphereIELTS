using EduSphere.API.Extensions;
using EduSphere.API.Middleware;
using EduSphere.Application;
using EduSphere.Infrastructure;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

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

// 3. Add API Services & Controllers
builder.Services.AddControllers();
builder.Services.AddSwaggerDocumentation();

// 4. Configure Health Checks
builder.Services.AddHealthChecks()
    .AddSqlServer(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnection") ?? "Server=localhost;Database=EduSphere;Integrated Security=true;TrustServerCertificate=True;",
        name: "sqlserver",
        tags: new[] { "db", "sql" })
    .AddRedis(
        redisConnectionString: builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379",
        name: "redis",
        tags: new[] { "cache", "redis" });

// 5. Configure CORS
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

// 6. Configure HTTP Request Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EduSphere API v1"));
}

app.UseSerilogRequestLogging();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// 7. Map Endpoints & Health Checks
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
