using EduSphere.Application.Features.Admin.Models;
using EduSphere.Application.Features.Admin.Queries.GetAdminDashboardStats;
using EduSphere.Application.Features.Admin.Queries.GetAdminExamBankOverview;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/dashboard")]
public class AdminDashboardController : ApiControllerBase
{
    /// <summary>
    /// Get aggregated KPIs, submission statistics, and recent activities
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(AdminDashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardStats(CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetAdminDashboardStatsQuery(), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Get high-level overview of total exam bank content counts across 3 skills
    /// </summary>
    [HttpGet("exam-bank/overview")]
    [ProducesResponseType(typeof(AdminExamBankOverviewDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExamBankOverview(CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetAdminExamBankOverviewQuery(), ct);
        return HandleResult(result);
    }
}
