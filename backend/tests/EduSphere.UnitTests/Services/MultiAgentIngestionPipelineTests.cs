using System.Net;
using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Infrastructure.HarnessPipeline;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;
using Xunit.Abstractions;

namespace EduSphere.UnitTests.Services;

public class MultiAgentIngestionPipelineTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly List<ReadingPassage> _savedPassages = new();
    private readonly ITestOutputHelper _output;

    public MultiAgentIngestionPipelineTests(ITestOutputHelper output)
    {
        _output = output;
        _mockContext = new Mock<IApplicationDbContext>();
        
        var mockDbSet = CreateMockDbSet(_savedPassages);
        _mockContext.Setup(c => c.ReadingPassages).Returns(mockDbSet.Object);
        _mockContext.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
    }

    [Fact]
    public async Task IngestDocumentAsync_Full40QuestionSample_ProcessesSuccessfully()
    {
        // 1. Arrange Sample IELTS Reading Test 12 Text (3 Passages + 40 Questions)
        var sampleIeltsText = @"http://ieltscuecard.trendinggyan.com/ Page 1
IELTS READING TEST 12 http://ieltscuecard.trendinggyan.com/
Sustainable architecture – lessons from the ant
Africa owes its termite mounds a lot. Trees and shrubs take root in them. Prospectors mine them, looking for specks of gold carried up by termites from hundreds of metres below. And of course, they are a special treat to aardvarks and other insectivores. Now, Africa is paying an offbeat tribute to these towers of mud. The extraordinary Eastgate Building in Harare, Zimbabwe’s capital city, is said to be the only one in the world to use the same cooling and heating principles as the termite mound.

Termites in Zimbabwe build gigantic mounds inside which they farm a fungus that is their primary food source. This must be kept at exactly 30.5°C, while the temperatures on the African veld outside can range from 1.5°C at night only just above freezing to a baking hot 40°C during the day. The termites achieve this remarkable feat by building a system of vents in the mound. Those at the base lead down into chambers cooled by wet mud carried up from water tables far below, and others lead up through a flue to the peak of the mound. By constantly opening and closing these heating and cooling vents over the course of the day the termites succeed in keeping the temperature constant in spite of the wide fluctuations outside.

Architect Mick Pearce used precisely the same strategy when designing the Eastgate Building, which has no air conditioning and virtually no heating. The building the country’s largest commercial and shopping complex uses less than 10% of the energy of a conventional building ns size. These efficiencies translated directly to the bottom line: the Eastgate’s owners saved $3.5 million on a $36 million building because an air- conditioning plant didn’t have to be imported. These savings were also passed on to tenants: rents are 20% lower than in a new building next door. The complex is actually two buildings linked by bridges across a shady, glass-roofed atrium open to the breezes. Fans suck fresh air in from the atrium, blow it upstairs through hollow spaces under the floors and from there into each office through baseboard vents. As it rises and warms, it is drawn out via ceiling vents and finally exits through forty- eight brick chimneys. To keep the harsh, highveld sun from heating the interior, no more than 25% of the outside is glass, and all the windows are screened by cement arches that just out more than a metre.

During summer’s cool nights, big fans flush air through the building seven times an hour to chill the hollow floors. By day, smaller fans blow two changes of air an hour through the building, to circulate the air which has been in contact with the cool floors. For winter days, there are small heaters in the vents. This is all possible only because Harare is 1600 feet above sea level, has cloudless skies, little humidity and rapid temperature swings days as warm as 31°C commonly drop to 14°C at night. ‘You couldn’t do this in New York, with its fantastically hot summers and fantastically cold winters,’ Pearce said. But then his eyes lit up at the challenge.’ Perhaps you could store the summer’s heat in water somehow.

The engineering firm of Ove Amp & Partners, which worked with him on the design, monitors daily temperatures outside, under the floors and at knee, desk and ceiling level. Ove Arup’s graphs show that the temperature of the building has generally stayed between 23″C and 25°C. with the exception of the annual hot spell just before the summer rains in October, and three days in November, when a janitor accidentally switched off the fans at night. The atrium, which funnels the winds through, can be much cooler. And the air is fresh far more so than in air-conditioned buildings, where up to 30% of the air is recycled.

Pearce, disdaining smooth glass skins as ‘igloos in the Sahara’, calls his building, with its exposed girders and pipes, ‘spiky’. The design of the entrances is based on the porcupine-quill headdresses of the local Shona tribe. Elevators are designed to look like the mineshaft cages used in Zimbabwe’s diamond mines. The shape of the fan covers, and the stone used in their construction, are echoes of Great Zimbabwe, the ruins that give the country its name. Standing on a roof catwalk, peering down inside at people as small as termites below. Pearce said he hoped plants would grow wild in the atrium and pigeons and bats would move into it. like that termite fungus, further extending the whole ‘organic machine’ metaphor. The architecture, he says, is a regionalised style that responds to the biosphere, to the ancient traditional stone architecture of Zimbabwe’s past, and to local human resources.

Questions 1-5
Choose the correct answer, A, B, C or D.
1. Why do termite mounds have a system of vents?
A to allow the termites to escape from predators
B to enable the termites to produce food
C to allow the termites to work efficiently
D to enable the termites to survive at night
2. Why was Eastgate cheaper to build than a conventional building?
A Very few materials were imported.
B Its energy consumption was so low.
C Its tenants contributed to the costs.
D No air conditioners were needed.
3. Why would a building like Eastgate not work efficiently in New York?
A Temperature change occurs seasonally rather than daily.
B Pollution affects the storage of heat in the atmosphere.
C Summer and winter temperatures are too extreme.
D Levels of humidity affect cloud coverage.
4. What does Ove Arup’s data suggest about Eastgate’s temperature control system?
A It allows a relatively wide range of temperatures.
B The only problems are due to human error.
C It functions well for most of the year.
D The temperature in the atrium may fall too low
5. Pearce believes that his building would be improved by
A becoming more of a habitat for wildlife.
B even closer links with the history of Zimbabwe.
C giving people more space to interact with nature.
D better protection from harmful organisms.

Questions 6-10
Complete the sentences below with words taken from Reading Passage 1. Use NO MORE THAN THREE WORDS for each answer.
6. Warm air leaves the offices through baseboard vents.
7. The warm air leaves the building through brick chimneys.
8. Heat from the sun is prevented from reaching the windows by cement arches.
9. When the outside temperature drops smaller fans bring air in from outside.
10. On cold days small heaters raise the temperature in the offices.

Questions 11-13
Answer the question below, using NO MORE THAN THREE WORDS from the passage for each answer.
Which three parts of the Eastgate Building reflect important features of Zimbabwe’s history and culture?
11. entrances
12. fan covers
13. stone

Inside the mind of the consumer
A MARKETING people are no longer prepared to take your word for it that you favour one product over another. They want to scan your brain to see which one you really prefer. Using the tools of neuroscientists, such as electroencephalogram (EEG) mapping and functional magnetic-resonance imaging (fMRI), they are trying to learn more about the mental processes behind purchasing decisions. The resulting fusion of neuroscience and marketing is inevitably, being called ‘neuromarketing’.
B The first person to apply brain-imaging technology in this way was Gerry Zaltman of Harvard University, in the late 1990s. The idea remained in obscurity until 2001, when BrightHouse, a marketing consultancy based in Atlanta, Georgia, set up a dedicated neuromarketing arm, BrightHouse Neurostrategies Group.
C Can brain scanning really be applied to marketing? The basic principle is not that different from focus groups and other traditional forms of market research. A volunteer lies in an fMRI machine and is shown images or video clips. In place of an interview or questionnaire, the subject’s response is evaluated by monitoring brain activity.
D At first, it seemed that only companies in Europe were prepared to admit that they used neuromarketing. Two carmakers, DaimlerChrysler in Germany and Ford’s European arm, ran pilot studies in 2003.
E Whether all this is any more than a modern-day version of phrenology, the Victorian obsession with linking lumps and bumps in the skull to personality traits, is unclear.
F That is perhaps where neuromarketing has the most potential. When asked about cola drinks, most people claim to have a favourite brand, but cannot say why they prefer that brand’s taste.
G “People form many unconscious attitudes that are obviously beyond traditional methods that utilise introspection,” says Steven Quartz, a neuroscientist at Caltech who is collaborating with Lieberman Research.
H Consumer advocates are wary. Gary Ruskin of Commercial Alert, a lobby group, thinks existing marketing techniques are powerful enough.
I Dr Quartz counters that neuromarketing techniques could equally be used for benign purposes.
J Another worry is that brain-scanning is an invasion of privacy and that information on the preferences of specific individuals will be misused.

Questions 14-19
Reading Passage 2 has ten paragraphs A-J. Choose the correct heading for Paragraphs B-G from the list of headings below.
14. Paragraph B
15. Paragraph C
16. Paragraph D
17. Paragraph E
18. Paragraph F
19. Paragraph G

Questions 20-22
Look at the following people (Questions 20-22) and the list of opinions below. Match each person with the opinion credited to him.
20. Steven Quartz
21. Gary Ruskin
22. Tim Ambler

Questions 23-26
Complete the summary below using words from the passage. Choose ONE WORD ONLY from the passage for each answer.
23. Neuromarketing can provide valuable information on attitudes to particular products.
24. It may be more reliable than surveys, where people can be untruthful.
25. It also allows researchers to identify the subject’s subconscious thought patterns.
26. However, some people are concerned that it could lead to problems such as an increase in disease among children.

The accidental rainforest
When Peter Osbeck, a Swedish priest, stopped off at the mid-Atlantic island of Ascension in 1752 on his way home from China, he wrote of ‘a heap of ruinous rocks’ with a bare, white mountain in the middle. All it boasted was a couple of dozen species of plant, most of them ferns and some of them unique to the island.
And so it might have remained. But in 1843 British plant collector Joseph Hooker made a brief call on his return from Antarctica. Surveying the bare earth, he concluded that the island had suffered some natural calamity that had denuded it of vegetation and triggered a decline in rainfall that was turning the place into a desert.
In 1845, a naval transport ship from Argentina delivered a batch of seedlings. In the following years, more than 200 species of plant arrived from South Africa, from England came 700 packets of seeds.
Modern ecologists throw up their hands in horror at what they see as Hookers environmental anarchy.
Today’s Green Mountain, says Wilkinson, is ‘a fully functioning man-made tropical cloud forest’ that has grown from scratch.

Questions 27-32
Do the following statements agree with the information given in Reading Passage 3?
27. When Peter Osbeck visited Ascension, he found no inhabitants on the island.
28. The natural vegetation on the island contained some species which were found nowhere else.
29. Joseph Hooker assumed that human activity had caused the decline in the island’s plant life.
30. British sailors on the island took part in a major tree planting project.
31. Hooker sent details of his planting scheme to a number of different countries.
32. The bamboo and prickly pear seeds sent from England were unsuitable for Ascension.

Questions 33-37
Complete each sentence with the correct ending A-G from the list below.
33. The reason for modern conservationists’ concern over Hooker’s tree planting programme is that
34. David Wilkinson says the creation of the rainforest in Ascension is important because it shows that
35. Wilkinson says the existence of Ascension’s rainforest challenges the theory that
36. Alan Gray questions Wilkinson’s theory, claiming that
37. Additional support for Wilkinson’s theory comes from findings that

Questions 38-40
Choose the correct letter, A, B, C or D
38. Wilkinson suggests that conservationists’ concern about the island is misguided because
A it is based on economic rather than environmental principles.
B it is not focusing on the most important question.
C it is encouraging the destruction of endemic species.
D it is not supported by the local authorities.
39. According to Wilkinson, studies of insects on the island could demonstrate
A the possibility of new ecological relationships.
B a future threat to the ecosystem of the island.
C the existence of previously unknown species.
D a chance for the survival of rainforest ecology.
40. Overall, what feature of the Ascension rainforest does the writer stress?
A the conflict of natural and artificial systems
B the unusual nature of its ecological structure
C the harm done by interfering with nature
D the speed and success of its development";

        var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY_INGESTION") 
            ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY") 
            ?? "AIzaSyDummyKeyForTestingOnly";

        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Gemini:ApiKey", apiKey },
            { "Gemini:ChatModel", "gemini-3.6-flash" }
        };
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var service = new DocumentIngestionService(
            _mockContext.Object,
            new HttpClient(),
            configuration,
            NullLogger<DocumentIngestionService>.Instance);

        // 2. Act: Ingest Document through the Multi-Agent Pipeline
        var result = await service.IngestDocumentAsync(
            sampleIeltsText,
            "IELTS_READING_TEST_12.pdf",
            "Personal Test Vault",
            "Band7_0_7_5",
            Guid.NewGuid(),
            true);

        // 3. Output Processing Logs and Schema Details
        _output.WriteLine("================ PROCESSING LOGS ================");
        foreach (var log in result.ProcessingLogs)
        {
            _output.WriteLine(log);
        }

        var savedPassage = _savedPassages[0];
        _output.WriteLine($"\nExam Title: {savedPassage.Title}");
        _output.WriteLine($"Topic: {savedPassage.Topic}");
        _output.WriteLine($"Difficulty: {savedPassage.Difficulty}");
        _output.WriteLine($"Total Questions Saved: {savedPassage.Questions.Count}");

        _output.WriteLine("\n================ QUESTIONS BREAKDOWN ================");
        foreach (var q in savedPassage.Questions)
        {
            _output.WriteLine($"Q{q.QuestionNumber} [{q.QuestionType}]: {q.Prompt}");
            _output.WriteLine($"   Options: {q.OptionsJson}");
            _output.WriteLine($"   Correct Answer: {q.CorrectAnswer}");
        }

        // 4. Assert
        Assert.NotNull(result);
        Assert.True(result.QuestionCount >= 27);
        Assert.Single(_savedPassages);
    }

    private static Mock<DbSet<T>> CreateMockDbSet<T>(List<T> sourceList) where T : class
    {
        var queryable = sourceList.AsQueryable();
        var mockSet = new Mock<DbSet<T>>();
        mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());
        mockSet.Setup(d => d.Add(It.IsAny<T>())).Callback<T>(sourceList.Add);
        return mockSet;
    }
}

