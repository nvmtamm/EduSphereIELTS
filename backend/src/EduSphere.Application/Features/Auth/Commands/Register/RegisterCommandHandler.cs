using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Auth.Models;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;

    public RegisterCommandHandler(
        IApplicationDbContext _context,
        IPasswordHasher passwordHasher,
        IJwtService jwtService)
    {
        this._context = _context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<Result<AuthResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _context.Users
            .AnyAsync(u => u.Email == normalizedEmail && !u.IsDeleted, cancellationToken);

        if (existingUser)
        {
            return Result.Failure<AuthResponse>(new Error("Auth.EmailAlreadyExists", "The specified email address is already registered."));
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);

        var user = new User(
            fullName: request.FullName.Trim(),
            email: normalizedEmail,
            passwordHash: passwordHash,
            role: UserRole.Student,
            targetBandScore: request.TargetBandScore);

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        var expiryTime = DateTime.UtcNow.AddDays(7);

        user.SetRefreshToken(refreshToken, expiryTime);

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.TargetBandScore,
            user.CreatedAt);

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtService.GetAccessTokenExpiryMinutes());

        return Result.Success(new AuthResponse(accessToken, refreshToken, expiresAt, userDto));
    }
}
