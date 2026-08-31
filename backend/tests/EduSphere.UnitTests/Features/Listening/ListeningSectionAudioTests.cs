using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace EduSphere.UnitTests.Features.Listening;

public class ListeningSectionAudioTests
{
    [Fact]
    public void ListeningTest_ShouldSupport_SectionAudios_Collection()
    {
        // Arrange
        var test = new ListeningTest(
            title: "Cambridge IELTS 18 Test 1",
            topic: "Urban Living & Ecology",
            difficulty: DifficultyLevel.Hard,
            sectionType: ListeningSectionType.FullTest_4Sections,
            sectionNumber: 0,
            audioUrl: "/audio/full.mp3",
            durationSeconds: 1800,
            accent: ListeningAccent.Mixed,
            sourceType: PassageSourceType.OfficialCambridge);

        var section1 = new ListeningSectionAudio(test.Id, 1, "/audio/sec1.mp3", 450, "Section 1: Dialogue");
        var section2 = new ListeningSectionAudio(test.Id, 2, "/audio/sec2.mp3", 420, "Section 2: Monologue");
        var section3 = new ListeningSectionAudio(test.Id, 3, "/audio/sec3.mp3", 480, "Section 3: Discussion");
        var section4 = new ListeningSectionAudio(test.Id, 4, "/audio/sec4.mp3", 450, "Section 4: Lecture");

        // Act
        test.AddSectionAudio(section1);
        test.AddSectionAudio(section2);
        test.AddSectionAudio(section3);
        test.AddSectionAudio(section4);

        // Assert
        test.SectionAudios.Should().HaveCount(4);
        test.SectionAudios.Should().Contain(s => s.SectionNumber == 1 && s.AudioUrl == "/audio/sec1.mp3");
        test.SectionAudios.Should().Contain(s => s.SectionNumber == 4 && s.DurationSeconds == 450);
    }

    [Fact]
    public void ListeningSectionAudio_ShouldInitialize_Correctly()
    {
        // Arrange & Act
        var testId = Guid.NewGuid();
        var audio = new ListeningSectionAudio(testId, 2, "/audio/section2.mp3", 380, "Visitor Center Tour");

        // Assert
        audio.ListeningTestId.Should().Be(testId);
        audio.SectionNumber.Should().Be(2);
        audio.AudioUrl.Should().Be("/audio/section2.mp3");
        audio.DurationSeconds.Should().Be(380);
        audio.SectionTitle.Should().Be("Visitor Center Tour");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void ListeningSectionAudio_ShouldThrow_WhenAudioUrlEmpty(string invalidUrl)
    {
        // Arrange & Act
        var act = () => new ListeningSectionAudio(Guid.NewGuid(), 1, invalidUrl, 300);

        // Assert
        act.Should().Throw<ArgumentException>().WithMessage("*Audio URL cannot be empty*");
    }
}
