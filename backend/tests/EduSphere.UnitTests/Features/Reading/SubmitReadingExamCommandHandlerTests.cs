using System.Text.Json;
using EduSphere.Application.Features.Reading.Commands.SubmitReadingExam;
using EduSphere.Application.Features.Reading.Models;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using EduSphere.Infrastructure.Data;
using EduSphere.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace EduSphere.UnitTests.Features.Reading;

public class SubmitReadingExamCommandHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly ReadingScoringService _scoringService;
    private readonly SubmitReadingExamCommandHandler _sut;

    public SubmitReadingExamCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"EduSphere_Reading_Test_{Guid.NewGuid()}")
            .Options;

        _context = new ApplicationDbContext(options);
        _scoringService = new ReadingScoringService();
        _sut = new SubmitReadingExamCommandHandler(_context, _scoringService, NullLogger<SubmitReadingExamCommandHandler>.Instance);
    }

    [Fact]
    public async Task Handle_WithValidAnswers_ShouldScoreAndSaveSubmissionSuccessfully()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var passage = new ReadingPassage(
            title: "Test IELTS Reading Passage",
            topic: "Science",
            difficulty: DifficultyLevel.Medium,
            content: "Sample content...",
            estimatedTimeMinutes: 20);

        var q1 = new ReadingQuestion(passage.Id, 1, QuestionType.TrueFalseNotGiven, "Prompt 1", "[]", "TRUE", "Expl 1");
        var q2 = new ReadingQuestion(passage.Id, 2, QuestionType.SummaryCompletion, "Prompt 2", "[]", "robot", "Expl 2");

        passage.AddQuestion(q1);
        passage.AddQuestion(q2);

        _context.ReadingPassages.Add(passage);
        await _context.SaveChangesAsync();

        var answers = new List<UserAnswerSubmissionDto>
        {
            new(q1.Id, "TRUE"),
            new(q2.Id, "robot")
        };

        var command = new SubmitReadingExamCommand(userId, passage.Id, 600, answers);

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.RawScore.Should().Be(2);
        result.Value.TotalQuestions.Should().Be(2);
        result.Value.AccuracyPercentage.Should().Be(100.0);
        result.Value.BandScore.Should().Be(9.0);
        result.Value.Answers.Should().HaveCount(2);
        result.Value.Answers.All(a => a.IsCorrect).Should().BeTrue();

        var savedSubmission = await _context.ReadingSubmissions.Include(s => s.Answers).FirstOrDefaultAsync();
        savedSubmission.Should().NotBeNull();
        savedSubmission!.RawScore.Should().Be(2);
        savedSubmission.Answers.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_WithNonExistentPassage_ShouldReturnFailureResult()
    {
        // Arrange
        var command = new SubmitReadingExamCommand(Guid.NewGuid(), Guid.NewGuid(), 300, new List<UserAnswerSubmissionDto>());

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Reading.PassageNotFound");
    }
}
