using EduSphere.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.API.Controllers;

/// <summary>
/// Controller for managing media file uploads/downloads via AWS S3 presigned URLs.
/// Supports audio files (Listening tests) and images (Diagram/Map labelling).
/// </summary>
public class MediaController : ApiControllerBase
{
    private readonly IMediaStorageService _mediaStorage;
    private readonly ILogger<MediaController> _logger;

    // Allowed MIME types for upload validation
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4",
        "image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"
    };

    // Max file size: 50MB (audio can be large for full 30-min IELTS tests)
    private const long MaxFileSizeBytes = 50 * 1024 * 1024;

    public MediaController(IMediaStorageService mediaStorage, ILogger<MediaController> logger)
    {
        _mediaStorage = mediaStorage;
        _logger = logger;
    }

    /// <summary>
    /// Generate a presigned PUT URL for direct client-to-S3 upload.
    /// Client uploads the file directly to S3 using this URL.
    /// </summary>
    [HttpPost("presigned-url")]
    [Authorize]
    public async Task<IActionResult> GetPresignedUploadUrl([FromBody] PresignedUrlRequest request, CancellationToken ct)
    {
        // Validate content type
        if (string.IsNullOrWhiteSpace(request.ContentType) || !AllowedContentTypes.Contains(request.ContentType))
        {
            return BadRequest(new ProblemDetails
            {
                Status = 400,
                Title = "Invalid Content Type",
                Detail = $"Content type '{request.ContentType}' is not allowed. Allowed types: {string.Join(", ", AllowedContentTypes)}"
            });
        }

        // Validate filename
        if (string.IsNullOrWhiteSpace(request.FileName))
        {
            return BadRequest(new ProblemDetails
            {
                Status = 400,
                Title = "Invalid File Name",
                Detail = "File name is required."
            });
        }

        // Determine storage folder based on content type
        var folder = request.ContentType.StartsWith("audio/") ? "audio" : "images";

        var result = await _mediaStorage.GenerateUploadUrlAsync(request.FileName, request.ContentType, folder, ct);

        _logger.LogInformation("User {UserId} requested presigned URL for {FileName} ({ContentType}) → {ObjectKey}",
            CurrentUserId, request.FileName, request.ContentType, result.ObjectKey);

        return Ok(new
        {
            uploadUrl = result.UploadUrl,
            objectKey = result.ObjectKey,
            publicUrl = result.PublicUrl,
            expiresAt = result.ExpiresAt
        });
    }

    /// <summary>
    /// Get the public URL for an already-uploaded object.
    /// </summary>
    [HttpGet("url/{*objectKey}")]
    [Authorize]
    public async Task<IActionResult> GetPublicUrl(string objectKey, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(objectKey))
            return BadRequest("Object key is required.");

        var url = await _mediaStorage.GetPublicUrlAsync(objectKey, ct);
        return Ok(new { publicUrl = url });
    }

    /// <summary>
    /// Delete a media file from S3. Restricted to admin role.
    /// </summary>
    [HttpDelete("{*objectKey}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteMedia(string objectKey, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(objectKey))
            return BadRequest("Object key is required.");

        await _mediaStorage.DeleteAsync(objectKey, ct);

        _logger.LogInformation("Admin {UserId} deleted media object {ObjectKey}", CurrentUserId, objectKey);

        return NoContent();
    }
}

/// <summary>
/// Request body for generating a presigned upload URL.
/// </summary>
public record PresignedUrlRequest(
    string FileName,
    string ContentType
);
