namespace EduSphere.Application.Common.Interfaces;

/// <summary>
/// Abstraction for cloud media storage operations (AWS S3).
/// Used for uploading, retrieving, and deleting audio/image assets.
/// </summary>
public interface IMediaStorageService
{
    /// <summary>
    /// Generates a time-limited presigned URL for direct client-side upload to S3.
    /// </summary>
    /// <param name="fileName">Original file name (used to derive content type and key)</param>
    /// <param name="contentType">MIME type (e.g., "audio/mpeg", "image/png")</param>
    /// <param name="folder">Storage folder prefix (e.g., "audio", "images")</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Presigned upload result with the PUT URL and the final object key</returns>
    Task<PresignedUploadResult> GenerateUploadUrlAsync(string fileName, string contentType, string folder = "audio", CancellationToken ct = default);

    /// <summary>
    /// Gets the public CDN URL for a stored object.
    /// </summary>
    Task<string> GetPublicUrlAsync(string objectKey, CancellationToken ct = default);

    /// <summary>
    /// Deletes an object from storage.
    /// </summary>
    Task DeleteAsync(string objectKey, CancellationToken ct = default);
}

/// <summary>
/// Result of generating a presigned upload URL.
/// </summary>
public record PresignedUploadResult(
    /// <summary>The presigned PUT URL for direct upload from the client.</summary>
    string UploadUrl,
    /// <summary>The S3 object key that will be used after upload.</summary>
    string ObjectKey,
    /// <summary>The full public URL to access the file after upload.</summary>
    string PublicUrl,
    /// <summary>Expiration time of the presigned URL.</summary>
    DateTime ExpiresAt
);
