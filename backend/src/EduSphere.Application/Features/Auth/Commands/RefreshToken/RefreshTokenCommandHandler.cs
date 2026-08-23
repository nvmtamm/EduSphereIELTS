using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Auth.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public RefreshTokenCommandHandler(
        IApplicationDbContext context,
        IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken && !u.IsDeleted, cancellationToken);

        if (user is null || !user.IsRefreshTokenValid(request.RefreshToken))
        {
            return Result.Failure<AuthResponse>(new Error("Auth.InvalidRefreshToken", "The refresh token is invalid or has expired."));
        }

        // Token Rotation: Generate brand new access token and refresh token
        var newAccessToken = _jwtService.GenerateAccessToken(user);
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        var newExpiryTime = DateTime.UtcNow.AddDays(7);

        user.SetRefreshToken(newRefreshToken, newExpiryTime);
        await _context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.TargetBandScore,
            user.CreatedAt);

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtService.GetAccessTokenExpiryMinutes());

        return Result.Success(new AuthResponse(newAccessToken, newRefreshToken, expiresAt, userDto));
    }
}
