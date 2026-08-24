using EduSphere.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EduSphere.Infrastructure.Services;

public class ConsoleEmailSender : IEmailSender
{
    private readonly ILogger<ConsoleEmailSender> _logger;
    private readonly IConfiguration _configuration;

    public ConsoleEmailSender(ILogger<ConsoleEmailSender> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public Task SendPasswordResetOtpAsync(string toEmail, string otpCode, string recipientName = "", CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "\n========================================================" +
            "\n[EduSphere Password Reset OTP Verification]" +
            "\nTo: {ToEmail} ({RecipientName})" +
            "\nVerification Code (OTP): >>> {OtpCode} <<<" +
            "\nExpires in: 15 minutes" +
            "\n========================================================",
            toEmail,
            string.IsNullOrWhiteSpace(recipientName) ? "Learner" : recipientName,
            otpCode
        );

        return Task.CompletedTask;
    }

    public Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string recipientName = "", CancellationToken cancellationToken = default)
    {
        return SendPasswordResetOtpAsync(toEmail, resetToken, recipientName, cancellationToken);
    }
}
