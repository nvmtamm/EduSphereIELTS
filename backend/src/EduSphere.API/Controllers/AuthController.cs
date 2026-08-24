using EduSphere.Application.Features.Auth.Commands.ForgotPassword;
using EduSphere.Application.Features.Auth.Commands.GoogleLogin;
using EduSphere.Application.Features.Auth.Commands.Login;
using EduSphere.Application.Features.Auth.Commands.RefreshToken;
using EduSphere.Application.Features.Auth.Commands.Register;
using EduSphere.Application.Features.Auth.Commands.ResetPassword;
using EduSphere.Application.Features.Auth.Commands.UpdateTargetScore;
using EduSphere.Application.Features.Auth.Models;
using EduSphere.Application.Features.Auth.Queries.GetProfile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.API.Controllers;

public class AuthController : ApiControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command, CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetProfile), new { }, result.Value);
        }

        return HandleResult(result);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }

    [HttpPost("google")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginCommand command, CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command, CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }

    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command, CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }

    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command, CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return HandleResult(result);
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetProfileQuery(CurrentUserId), ct);
        return HandleResult(result);
    }

    [Authorize]
    [HttpPut("target-score")]
    [ProducesResponseType(typeof(float), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateTargetScore([FromBody] UpdateTargetScoreDto dto, CancellationToken ct)
    {
        var result = await Mediator.Send(new UpdateTargetScoreCommand(CurrentUserId, dto.TargetBandScore), ct);
        return HandleResult(result);
    }
}

public record UpdateTargetScoreDto(float TargetBandScore);
