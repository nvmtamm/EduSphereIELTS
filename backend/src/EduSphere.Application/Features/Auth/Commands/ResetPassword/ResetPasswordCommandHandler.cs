using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace EduSphere.Application.Features.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly IPasswordHasher _passwordHasher;

    public ResetPasswordCommandHandler(
        IApplicationDbContext context,
        IDistributedCache cache,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _cache = cache;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<string>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var rawToken = request.Token.Trim().ToLowerInvariant();

        var tokenCacheKey = $"pwd_reset_token:{rawToken}";
        var otpCacheKey = $"pwd_reset_otp:{normalizedEmail}";

        var cachedEmail = await _cache.GetStringAsync(tokenCacheKey, cancellationToken);
        var cachedOtp = await _cache.GetStringAsync(otpCacheKey, cancellationToken);

        var isTokenValid = (!string.IsNullOrWhiteSpace(cachedEmail) && cachedEmail == normalizedEmail)
            || (!string.IsNullOrWhiteSpace(cachedOtp) && cachedOtp == rawToken);

        if (!isTokenValid)
        {
            return Result.Failure<string>(new Error("Auth.InvalidResetToken", "The verification code is invalid, expired, or does not match this email address."));
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return Result.Failure<string>(new Error("Auth.UserNotFound", "User account not found."));
        }

        var newPasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.UpdatePassword(newPasswordHash);

        // Revoke existing refresh token to force re-login on all devices
        user.RevokeRefreshToken();

        await _context.SaveChangesAsync(cancellationToken);

        // Invalidate OTP / reset tokens after successful reset
        await _cache.RemoveAsync(tokenCacheKey, cancellationToken);
        await _cache.RemoveAsync(otpCacheKey, cancellationToken);

        return Result.Success("Your password has been successfully reset. You can now log in with your new credentials.");
    }
}
