using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Features.Reading.Models;
using EduSphere.Application.Features.Reading.Queries.GetReadingHint;
using FluentAssertions;
using Moq;
using Xunit;

namespace EduSphere.UnitTests.Features.Reading;

public class GetReadingHintQueryHandlerTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(5)]
    [InlineData(-1)]
    public async Task Handle_InvalidStep_ReturnsFailureWithoutTouchingDatabase(int step)
    {
        var context = new Mock<IApplicationDbContext>(MockBehavior.Strict);
        var tutor = new Mock<IReadingAITutorService>(MockBehavior.Strict);
        var sut = new GetReadingHintQueryHandler(context.Object, tutor.Object);

        var result = await sut.Handle(new GetReadingHintQuery(Guid.NewGuid(), Guid.NewGuid(), step), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Reading.InvalidHintStep");
    }
}
