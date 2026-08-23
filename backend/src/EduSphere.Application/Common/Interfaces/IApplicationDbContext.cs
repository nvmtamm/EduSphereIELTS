using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
