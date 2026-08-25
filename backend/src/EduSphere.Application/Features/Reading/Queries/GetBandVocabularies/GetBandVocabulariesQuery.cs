using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Models;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Reading.Queries.GetBandVocabularies;

public record GetBandVocabulariesQuery(
    string? BandTier = null,
    string? Search = null) : IRequest<Result<List<BandVocabularyDto>>>;

public class GetBandVocabulariesQueryHandler : IRequestHandler<GetBandVocabulariesQuery, Result<List<BandVocabularyDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetBandVocabulariesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<BandVocabularyDto>>> Handle(GetBandVocabulariesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BandVocabularies.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.BandTier) && request.BandTier.ToLower() != "all" && Enum.TryParse<TargetBandTier>(request.BandTier, true, out var band))
        {
            query = query.Where(v => v.BandTier == band);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.Trim().ToLower();
            query = query.Where(v => v.Word.ToLower().Contains(searchLower) || v.Meaning.ToLower().Contains(searchLower));
        }

        var vocabList = await query
            .OrderBy(v => v.BandTier)
            .ThenBy(v => v.Word)
            .ToListAsync(cancellationToken);

        var result = vocabList.Select(v =>
        {
            List<string> collocations = new();
            List<string> synonyms = new();

            try
            {
                if (!string.IsNullOrWhiteSpace(v.CollocationsJson))
                    collocations = JsonSerializer.Deserialize<List<string>>(v.CollocationsJson) ?? new();
            }
            catch { }

            try
            {
                if (!string.IsNullOrWhiteSpace(v.SynonymsJson))
                    synonyms = JsonSerializer.Deserialize<List<string>>(v.SynonymsJson) ?? new();
            }
            catch { }

            return new BandVocabularyDto(
                v.Id,
                v.BandTier.ToString(),
                v.Word,
                v.Phonetic,
                v.Meaning,
                v.PartOfSpeech,
                v.AcademicLevel,
                v.ExampleSentence,
                collocations,
                synonyms);
        }).ToList();

        return Result.Success(result);
    }
}
