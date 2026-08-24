using EduSphere.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace EduSphere.Infrastructure.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly ILogger<SmtpEmailSender> _logger;
    private readonly IConfiguration _configuration;

    public SmtpEmailSender(ILogger<SmtpEmailSender> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task SendPasswordResetOtpAsync(string toEmail, string otpCode, string recipientName = "", CancellationToken cancellationToken = default)
    {
        var smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
        var port = int.TryParse(_configuration["EmailSettings:Port"], out var p) ? p : 587;
        var senderName = _configuration["EmailSettings:SenderName"] ?? "EduSphere IELTS Official";
        var senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "edusphere.official@gmail.com";
        var username = _configuration["EmailSettings:Username"] ?? "";
        var password = _configuration["EmailSettings:Password"] ?? "";
        var enableSmtp = bool.TryParse(_configuration["EmailSettings:EnableSmtp"], out var enabled) && enabled;

        // Log OTP to Console for Dev/Debugging convenience
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

        // If SMTP credentials are provided, send actual Gmail email
        if (enableSmtp && !string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(senderName, senderEmail));
                message.To.Add(new MailboxAddress(recipientName, toEmail));
                message.Subject = $"{otpCode} is your EduSphere password reset verification code";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                    <div style=""font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px; background-color: #ffffff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.05);"">
                        <div style=""text-align: center; margin-bottom: 24px;"">
                            <h2 style=""color: #e11d48; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;"">Edu<span style=""color: #0f172a;"">Sphere</span></h2>
                            <p style=""color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 4px; letter-spacing: 1px;"">IELTS Official Prep Platform</p>
                        </div>
                        
                        <div style=""padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;"">
                            <h3 style=""color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;"">Password Reset Request</h3>
                            <p style=""color: #475569; font-size: 14px; line-height: 1.6;"">
                                Hello {(string.IsNullOrWhiteSpace(recipientName) ? "Learner" : recipientName)},<br/>
                                We received a request to reset your password. Use the verification code below to set a new password:
                            </p>
                            
                            <div style=""margin: 24px 0;"">
                                <span style=""display: inline-block; padding: 14px 32px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #e11d48; background-color: #ffffff; border: 2px dashed #f43f5e; border-radius: 12px; font-family: monospace;"">{otpCode}</span>
                            </div>
                            
                            <p style=""color: #64748b; font-size: 12px; margin-bottom: 0;"">
                                ⏱️ This verification code is valid for <strong>15 minutes</strong>.<br/>
                                If you did not request a password reset, you can safely ignore this email.
                            </p>
                        </div>
                        
                        <div style=""text-align: center; margin-top: 24px; color: #94a3b8; font-size: 11px;"">
                            <p>&copy; {DateTime.UtcNow.Year} EduSphere IELTS Prep. All rights reserved.</p>
                        </div>
                    </div>"
                };

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                client.CheckCertificateRevocation = false;
                await client.ConnectAsync(smtpServer, port, SecureSocketOptions.StartTls, cancellationToken);
                await client.AuthenticateAsync(username, password, cancellationToken);
                await client.SendAsync(message, cancellationToken);
                await client.DisconnectAsync(true, cancellationToken);

                _logger.LogInformation("Password reset OTP email sent successfully to {ToEmail}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email via SMTP to {ToEmail}: {Message}", toEmail, ex.Message);
            }
        }
    }

    public Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string recipientName = "", CancellationToken cancellationToken = default)
    {
        return SendPasswordResetOtpAsync(toEmail, resetToken, recipientName, cancellationToken);
    }
}
