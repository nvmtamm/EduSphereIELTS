using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Models;
using MediatR;

namespace EduSphere.Application.Features.Reading.Commands.IngestDocument;

public record IngestDocumentCommand(
    string RawText,
    string FileName,
    string CollectionName,
    string TargetBandTier,
    Guid? UserId = null,
    bool IsCommunityShared = false) : IRequest<Result<DocumentIngestResultDto>>;

public class IngestDocumentCommandHandler : IRequestHandler<IngestDocumentCommand, Result<DocumentIngestResultDto>>
{
    private readonly IDocumentIngestionService _ingestionService;

    public IngestDocumentCommandHandler(IDocumentIngestionService ingestionService)
    {
        _ingestionService = ingestionService;
    }

    public async Task<Result<DocumentIngestResultDto>> Handle(IngestDocumentCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RawText) || request.RawText.Length < 50)
        {
            return Result.Failure<DocumentIngestResultDto>(new Error("Ingestion.TextTooShort", "Document content is too short to construct an authentic IELTS reading passage (minimum 50 characters)."));
        }

        var result = await _ingestionService.IngestDocumentAsync(
            request.RawText,
            request.FileName,
            request.CollectionName,
            request.TargetBandTier,
            request.UserId,
            request.IsCommunityShared,
            cancellationToken);

        return Result.Success(result);
    }
}
