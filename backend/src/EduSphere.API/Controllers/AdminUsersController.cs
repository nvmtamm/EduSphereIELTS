using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Admin.Commands.ToggleUserStatus;
using EduSphere.Application.Features.Admin.Commands.UpdateUserRole;
using EduSphere.Application.Features.Admin.Models;
using EduSphere.Application.Features.Admin.Queries.GetUserDetailById;
using EduSphere.Application.Features.Admin.Queries.GetUsersPaged;
using EduSphere.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController : ApiControllerBase
{
    /// <summary>
    /// Get paginated list of users with search, role, and active status filters for TanStack Table
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedList<AdminUserListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search = null,
        [FromQuery] UserRole? role = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetUsersPagedQuery(search, role, isActive, pageNumber, pageSize), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Get detailed learner profile and submission history by User Id
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AdminUserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetUserById(Guid id, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetUserDetailByIdQuery(id), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Update user role (Promote to Admin / Demote to Student)
    /// </summary>
    [HttpPut("{id:guid}/role")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new UpdateUserRoleCommand(id, request.Role), ct);
        return HandleResult(result);
    }

    /// <summary>
    /// Toggle user active status (Lock / Unlock account)
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ToggleStatus(Guid id, [FromBody] ToggleStatusRequest request, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new ToggleUserStatusCommand(id, request.IsActive), ct);
        return HandleResult(result);
    }
}

public record UpdateRoleRequest(UserRole Role);
public record ToggleStatusRequest(bool IsActive);
