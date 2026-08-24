namespace EduSphere.Application.Common.Interfaces;

public interface IEmailSender
{
    Task SendPasswordResetOtpAsync(string toEmail, string otpCode, string recipientName = "", CancellationToken cancellationToken = default);
    Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string recipientName = "", CancellationToken cancellationToken = default);
}
