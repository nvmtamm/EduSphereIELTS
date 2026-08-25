using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Features.Reading.Commands.IngestDocument;
using EduSphere.Application.Features.Reading.Models;
using EduSphere.Application.Features.Reading.Queries.AskReadingAITutor;
using EduSphere.Application.Features.Reading.Queries.GetBandRoadmaps;
using EduSphere.Application.Features.Reading.Queries.GetBandVocabularies;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using EduSphere.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace EduSphere.UnitTests.Features.Reading;

public class RoadmapAndAIQueriesTests
{
    private readonly ApplicationDbContext _context;

    public RoadmapAndAIQueriesTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"EduSphere_Roadmap_Test_{Guid.NewGuid()}")
            .Options;

        _context = new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetBandRoadmapsQuery_ShouldReturnRoadmapsWithUserProgress()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var roadmap = new BandRoadmap(TargetBandTier.Band7_0_7_5, "Band 7.0 - 7.5", "Desc", "Skills", 5, 1200);
        var progress = new UserRoadmapProgress(userId, TargetBandTier.Band7_0_7_5, currentStepNumber: 2, masteryPercentage: 80.0f, completedPassagesCount: 1, earnedBadge: "Silver");

        _context.BandRoadmaps.Add(roadmap);
        _context.UserRoadmapProgresses.Add(progress);
        await _context.SaveChangesAsync();

        var handler = new GetBandRoadmapsQueryHandler(_context);
        var query = new GetBandRoadmapsQuery(userId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].BandTier.Should().Be(TargetBandTier.Band7_0_7_5.ToString());
        result.Value[0].CurrentUserStep.Should().Be(2);
        result.Value[0].EarnedBadge.Should().Be("Silver");
    }

    [Fact]
    public async Task GetBandVocabulariesQuery_ShouldFilterByBandTier()
    {
        // Arrange
        var v1 = new BandVocabulary(TargetBandTier.Band7_0_7_5, "Ubiquitous", "/juːˈbɪk.wɪ.təs/", "Omnipresent", "Adjective", "C1");
        var v2 = new BandVocabulary(TargetBandTier.PreIelts, "Routine", "/ruːˈtiːn/", "Daily habit", "Noun", "A1");

        _context.BandVocabularies.AddRange(v1, v2);
        await _context.SaveChangesAsync();

        var handler = new GetBandVocabulariesQueryHandler(_context);
        var query = new GetBandVocabulariesQuery("Band7_0_7_5");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].Word.Should().Be("Ubiquitous");
    }

    [Fact]
    public async Task AskReadingAITutorQuery_ShouldReturnSocraticHint()
    {
        // Arrange
        var passage = new ReadingPassage("Title", "Topic", DifficultyLevel.Medium, "Content with Paragraph A, B, C");
        _context.ReadingPassages.Add(passage);
        await _context.SaveChangesAsync();

        var mockAITutorService = new Mock<IReadingAITutorService>();
        mockAITutorService.Setup(s => s.AskTutorAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AITutorMessageDto("assistant", "Hint: Look at Paragraph B", "Paragraph B", new List<string> { "keyword" }));

        var handler = new AskReadingAITutorQueryHandler(_context, mockAITutorService.Object);
        var query = new AskReadingAITutorQuery(passage.Id, "Where is the answer to question 1?");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.RelevantParagraph.Should().Be("Paragraph B");
        result.Value.Message.Should().Contain("Paragraph B");
    }

    [Fact]
    public async Task IngestDocumentCommand_ShouldFail_WhenTextIsTooShort()
    {
        // Arrange
        var mockService = new Mock<IDocumentIngestionService>();
        var handler = new IngestDocumentCommandHandler(mockService.Object);
        var command = new IngestDocumentCommand("Short", "test.txt", "Vault", "Band6_0_6_5");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Ingestion.TextTooShort");
    }
}
