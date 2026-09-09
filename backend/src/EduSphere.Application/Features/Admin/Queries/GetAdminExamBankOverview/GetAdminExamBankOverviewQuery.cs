using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Admin.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Admin.Queries.GetAdminExamBankOverview;

public record GetAdminExamBankOverviewQuery : IRequest<Result<AdminExamBankOverviewDto>>;

public class GetAdminExamBankOverviewQueryHandler : IRequestHandler<GetAdminExamBankOverviewQuery, Result<AdminExamBankOverviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminExamBankOverviewQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AdminExamBankOverviewDto>> Handle(GetAdminExamBankOverviewQuery request, CancellationToken cancellationToken)
    {
        var readingCount = await _context.ReadingPassages.CountAsync(cancellationToken);
        var listeningCount = await _context.ListeningTests.CountAsync(cancellationToken);
        var writingCount = await _context.WritingPrompts.CountAsync(cancellationToken);

        var overview = new AdminExamBankOverviewDto(readingCount, listeningCount, writingCount);
        return Result<AdminExamBankOverviewDto>.Success(overview);
    }
}
