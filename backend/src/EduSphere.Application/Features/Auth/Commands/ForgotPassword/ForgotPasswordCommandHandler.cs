using System.Security.Cryptography;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace EduSphere.Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly IEmailSender _emailSender;

    public ForgotPasswordCommandHandler(
        IApplicationDbContext context,
        IDistributedCache cache,
        IEmailSender emailSender)
    {
        _context = context;
        _cache = cache;
        _emailSender = emailSender;
    }

    public async Task<Result<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail && !u.IsDeleted, cancellationToken);

        const string successMessage = "A 6-digit verification code has been sent to your email address.";

        if (user == null)
        {
            // Avoid account enumeration by returning generic success message
            return Result.Success(successMessage);
        }

        // Generate 6-digit numeric verification OTP
        var otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
        };

        // Cache OTP under both email key and token key
        await _cache.SetStringAsync($"pwd_reset_otp:{normalizedEmail}", otpCode, cacheOptions, cancellationToken);
        await _cache.SetStringAsync($"pwd_reset_token:{otpCode}", normalizedEmail, cacheOptions, cancellationToken);

        // Send email with 6-digit OTP template via Gmail SMTP
        await _emailSender.SendPasswordResetOtpAsync(user.Email, otpCode, user.FullName, cancellationToken);

        return Result.Success(successMessage);
    }
}
