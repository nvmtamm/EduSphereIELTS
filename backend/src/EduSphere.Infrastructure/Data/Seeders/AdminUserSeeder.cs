using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EduSphere.Infrastructure.Data.Seeders;

public static class AdminUserSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        const string adminEmail = "admin@edusphere.io";

        var adminExists = await context.Users.AnyAsync(u => u.Email == adminEmail);
        if (adminExists)
        {
            logger?.LogInformation("Default Admin user already exists. Skipping seed.");
            return;
        }

        // BCrypt workFactor 12 hash for "EduSphere@Admin2026!"
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("EduSphere@Admin2026!", workFactor: 12);

        var adminUser = new User(
            fullName: "System Administrator",
            email: adminEmail,
            passwordHash: passwordHash,
            role: UserRole.Admin,
            targetBandScore: 9.0f
        );

        await context.Users.AddAsync(adminUser);
        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded default Admin user ({Email}) successfully.", adminEmail);
    }
}
