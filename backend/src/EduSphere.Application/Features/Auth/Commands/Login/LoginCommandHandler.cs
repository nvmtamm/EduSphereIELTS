using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Auth.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtService jwtService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail && !u.IsDeleted, cancellationToken);

        if (user is null)
        {
            return Result.Failure<AuthResponse>(new Error("Auth.InvalidCredentials", "Invalid email or password."));
        }

        var isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return Result.Failure<AuthResponse>(new Error("Auth.InvalidCredentials", "Invalid email or password."));
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
            user.CreatedAt);

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtService.GetAccessTokenExpiryMinutes());

        return Result.Success(new AuthResponse(accessToken, refreshToken, expiresAt, userDto));
    }
}
