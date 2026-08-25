using EduSphere.Application.Features.Reading.Models;

namespace EduSphere.Application.Common.Interfaces;

public interface IDocumentIngestionService
{
    Task<DocumentIngestResultDto> IngestDocumentAsync(
        string rawText,
        string fileName,
        string collectionName,
        string targetBandTier,
        Guid? userId,
        bool isCommunityShared,
        CancellationToken cancellationToken = default);
}
