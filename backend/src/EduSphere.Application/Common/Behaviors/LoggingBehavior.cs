using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace EduSphere.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<TRequest> _logger;

    public LoggingBehavior(ILogger<TRequest> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var stopwatch = Stopwatch.StartNew();

        _logger.LogInformation("Handling request: {RequestName}", requestName);

        var response = await next();

        stopwatch.Stop();
        var elapsedMilliseconds = stopwatch.ElapsedMilliseconds;

        if (elapsedMilliseconds > 500)
        {
            _logger.LogWarning("Long running request detected: {RequestName} took {ElapsedMilliseconds} ms",
                requestName, elapsedMilliseconds);
        }
        else
        {
            _logger.LogInformation("Handled request: {RequestName} completed in {ElapsedMilliseconds} ms",
                requestName, elapsedMilliseconds);
        }

        return response;
    }
}
