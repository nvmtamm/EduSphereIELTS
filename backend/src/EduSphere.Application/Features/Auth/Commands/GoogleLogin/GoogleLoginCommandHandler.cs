using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Auth.Models;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Auth.Commands.GoogleLogin;

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, Result<AuthResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public GoogleLoginCommandHandler(
        IApplicationDbContext context,
        IGoogleAuthService googleAuthService,
        IJwtService jwtService,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _googleAuthService = googleAuthService;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<AuthResponse>> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var payload = await _googleAuthService.VerifyGoogleTokenAsync(request.IdToken, cancellationToken);
        if (payload == null)
        {
            return Result.Failure<AuthResponse>(new Error("Auth.InvalidGoogleToken", "The Google authentication token is invalid or expired."));
        }

        var normalizedEmail = payload.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            // Auto register new student with Google profile
            var dummyPasswordHash = _passwordHasher.HashPassword(Guid.NewGuid().ToString("N"));
            var fullName = string.IsNullOrWhiteSpace(payload.Name) ? "IELTS Candidate" : payload.Name.Trim();

            user = new User(
                fullName: fullName,
                email: normalizedEmail,
                passwordHash: dummyPasswordHash,
                role: UserRole.Student
            );

            _context.Users.Add(user);
        }

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        var expiryTime = DateTime.UtcNow.AddDays(7);

        user.SetRefreshToken(refreshToken, expiryTime);
        await _context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.TargetBandScore,
            user.CreatedAt
        );

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtService.GetAccessTokenExpiryMinutes());

        return Result.Success(new AuthResponse(accessToken, refreshToken, expiresAt, userDto));
    }
}
