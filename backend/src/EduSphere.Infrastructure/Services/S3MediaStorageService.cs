using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using EduSphere.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EduSphere.Infrastructure.Services;

/// <summary>
/// AWS S3 implementation of IMediaStorageService.
/// Uses presigned URLs for secure, direct client-to-S3 uploads.
/// </summary>
public class S3MediaStorageService : IMediaStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _region;
    private readonly ILogger<S3MediaStorageService> _logger;
    private const int PresignedUrlExpiryMinutes = 15;

    public S3MediaStorageService(IConfiguration configuration, ILogger<S3MediaStorageService> logger)
    {
        _logger = logger;

        var accessKeyId = configuration["AWS:AccessKeyId"]
            ?? throw new InvalidOperationException("AWS:AccessKeyId is not configured.");
        var secretAccessKey = configuration["AWS:SecretAccessKey"]
            ?? throw new InvalidOperationException("AWS:SecretAccessKey is not configured.");
        _bucketName = configuration["AWS:BucketName"]
            ?? throw new InvalidOperationException("AWS:BucketName is not configured.");
        _region = configuration["AWS:Region"] ?? "ap-southeast-1";

        var regionEndpoint = RegionEndpoint.GetBySystemName(_region);

        _s3Client = new AmazonS3Client(accessKeyId, secretAccessKey, regionEndpoint);
    }

    public Task<PresignedUploadResult> GenerateUploadUrlAsync(
        string fileName, string contentType, string folder = "audio", CancellationToken ct = default)
    {
        // Generate a unique key to prevent collisions
        var sanitizedName = Path.GetFileNameWithoutExtension(fileName)
            .Replace(" ", "-")
            .ToLowerInvariant();
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var objectKey = $"{folder}/{Guid.NewGuid():N}_{sanitizedName}{extension}";

        var expiresAt = DateTime.UtcNow.AddMinutes(PresignedUrlExpiryMinutes);

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = objectKey,
            Verb = HttpVerb.PUT,
            Expires = expiresAt,
            ContentType = contentType
        };

        var uploadUrl = _s3Client.GetPreSignedURL(request);
        var publicUrl = $"https://{_bucketName}.s3.{_region}.amazonaws.com/{objectKey}";

        _logger.LogInformation("Generated presigned upload URL for {ObjectKey}, expires at {ExpiresAt}", objectKey, expiresAt);

        return Task.FromResult(new PresignedUploadResult(uploadUrl, objectKey, publicUrl, expiresAt));
    }

    public Task<string> GetPublicUrlAsync(string objectKey, CancellationToken ct = default)
    {
        var publicUrl = $"https://{_bucketName}.s3.{_region}.amazonaws.com/{objectKey}";
        return Task.FromResult(publicUrl);
    }

    public async Task DeleteAsync(string objectKey, CancellationToken ct = default)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = objectKey
            };

            await _s3Client.DeleteObjectAsync(request, ct);
            _logger.LogInformation("Deleted object {ObjectKey} from S3 bucket {BucketName}", objectKey, _bucketName);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "Failed to delete object {ObjectKey} from S3", objectKey);
            throw;
        }
    }
}
