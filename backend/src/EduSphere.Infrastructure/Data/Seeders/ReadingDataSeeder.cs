using System.Text.Json;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EduSphere.Infrastructure.Data.Seeders;

public static class ReadingDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        if (await context.ReadingPassages.AnyAsync())
        {
            return;
        }

        logger?.LogInformation("Seeding authentic IELTS Reading passages and question banks...");

        // 1. Passage 1: The Secret History of the Antikythera Mechanism
        var passage1 = new ReadingPassage(
            title: "The Secret History of the Antikythera Mechanism",
            topic: "History & Technology",
            difficulty: DifficultyLevel.Medium,
            content: @"### Paragraph A
In the spring of 1900, a group of Greek sponge divers was forced by a sudden storm to take shelter near the tiny island of Antikythera, located between Crete and mainland Greece. When the storm subsided, diver Elias Stadiatis plunged into the depths to search for sponges. Instead, at a depth of about 45 metres, he encountered the eerie remnants of a 2,000-year-old Roman shipwreck strewn across the seabed. Among the marble statues, bronze coins, and glassware brought to the surface was an unassuming, corroded lump of bronze and wood that would puzzle scientists for the next century.

### Paragraph B
Initially overshadowed by the dazzling artistic treasures, the bronze fragment was moved to the National Archaeological Museum in Athens. In 1902, archaeologist Valerios Stais noticed a gear wheel embedded in the calcified rock. The discovery startled the academic community; according to prevailing historical consensus, complex geared mechanisms did not exist in the Greco-Roman world and only re-emerged in 14th-century medieval Europe. Early sceptics claimed the artefact was an astrolabe or perhaps a modern navigational instrument dropped onto the ancient wreck by coincidence.

### Paragraph C
It was not until the 1950s that British science historian Derek de Solla Price began systematic radiographic analysis of the mechanism. Price spent over two decades examining the 82 surviving fragments using gamma-ray and X-ray imaging. In 1974, he published a landmark monograph titled *Gears from the Greeks*, concluding that the device was an ancient analogue computer capable of calculating the astronomical positions of the Sun, Moon, and known planets with remarkable mathematical precision.

### Paragraph D
The true sophistication of the Antikythera Mechanism was unlocked in 2005 by the international Antikythera Mechanism Research Project (AMRP). Utilising cutting-edge 3D micro-focus X-ray computed tomography (CT), researchers deciphered thousands of tiny Greek inscriptions on the interior plates, acting as a user manual. The scans revealed at least 30 intricately meshed bronze gears with triangular teeth. The mechanism accurately modelled the Moon's irregular elliptical orbit—an anomaly described mathematically by Hipparchus—by employing an ingenious pin-and-slot gear system.

### Paragraph E
Beyond astronomical mapping, the reverse side of the device featured calendars tracking the 19-year Metonic cycle, the 76-year Callippic cycle, and the 223-month Saros cycle used to predict solar and lunar eclipses, even indicating the expected colour and hour of each eclipse. Most remarkably, a four-year dial synchronized the cycles of the panhellenic games, including the ancient Olympic Games, the Pythian Games, and the Isthmian Games, highlighting the cultural and civic importance of the apparatus.",
            estimatedTimeMinutes: 20);

        // Questions for Passage 1 (13 Questions)
        // Q1-Q5: Matching Headings
        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 1, QuestionType.MatchingHeadings,
            "Which paragraph describes the initial discovery of the shipwreck by sponge divers?",
            JsonSerializer.Serialize(new[] { "Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E" }),
            "Paragraph A",
            "Paragraph A explicitly describes Elias Stadiatis diving off the island of Antikythera in 1900 and finding the Roman shipwreck."));

        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 2, QuestionType.MatchingHeadings,
            "Which paragraph discusses early academic scepticism and confusion over the gear fragment?",
            JsonSerializer.Serialize(new[] { "Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E" }),
            "Paragraph B",
            "Paragraph B highlights how Valerios Stais found the gear and scholars doubted complex gears existed in antiquity."));

        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 3, QuestionType.MatchingHeadings,
            "Which paragraph outlines decades of radiographic studies led by a British historian?",
            JsonSerializer.Serialize(new[] { "Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E" }),
            "Paragraph C",
            "Paragraph C details Derek de Solla Price's 20-year radiographic and X-ray analysis culminating in 'Gears from the Greeks'."));

        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 4, QuestionType.MatchingHeadings,
            "Which paragraph explains the breakthrough 3D CT scans revealing the internal pin-and-slot lunar gearing?",
            JsonSerializer.Serialize(new[] { "Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E" }),
            "Paragraph D",
            "Paragraph D details the 2005 3D micro-focus X-ray CT scans showing 30 gears and the pin-and-slot lunar mechanism."));

        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 5, QuestionType.MatchingHeadings,
            "Which paragraph notes the mechanism's role in tracking eclipse cycles and athletic competitions?",
            JsonSerializer.Serialize(new[] { "Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E" }),
            "Paragraph E",
            "Paragraph E mentions the Saros eclipse cycle and the 4-year dial for ancient Olympic and Pythian games."));

        // Q6-Q9: True / False / Not Given
        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 6, QuestionType.TrueFalseNotGiven,
            "Elias Stadiatis was searching specifically for ancient archaeological relics when he dived.",
            JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
            "FALSE",
            "Paragraph A states he plunged into the depths to 'search for sponges', not archaeological relics."));

        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 7, QuestionType.TrueFalseNotGiven,
            "Historians in 1902 generally believed complex geared technology was common in ancient Greece.",
            JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
            "FALSE",
            "Paragraph B states prevailing historical consensus was that complex geared mechanisms did NOT exist in the Greco-Roman world."));

        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 8, QuestionType.TrueFalseNotGiven,
            "Derek de Solla Price was funded by the Greek government throughout his research.",
            JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
            "NOT GIVEN",
            "Paragraph C mentions Price's work and his publication, but does not provide information about his financial funding source."));

        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 9, QuestionType.TrueFalseNotGiven,
            "The 2005 research project discovered Greek text inscriptions acting as an instruction guide.",
            JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
            "TRUE",
            "Paragraph D states researchers deciphered thousands of tiny Greek inscriptions on the interior plates acting as a user manual."));

        // Q10-Q13: Summary / Sentence Completion
        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 10, QuestionType.SummaryCompletion,
            "The Roman shipwreck was situated at an approximate depth of ______ metres.",
            JsonSerializer.Serialize(new string[] { }),
            "45 / forty-five",
            "Paragraph A specifies: 'at a depth of about 45 metres'."));

        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 11, QuestionType.SummaryCompletion,
            "In 1974, Price published a seminal monograph titled ______.",
            JsonSerializer.Serialize(new string[] { }),
            "Gears from the Greeks",
            "Paragraph C states: 'In 1974, he published a landmark monograph titled Gears from the Greeks'."));

        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 12, QuestionType.SummaryCompletion,
            "The Moon's elliptical orbit was mechanically simulated using a pin-and-slot ______ system.",
            JsonSerializer.Serialize(new string[] { }),
            "gear",
            "Paragraph D states: 'employing an ingenious pin-and-slot gear system'."));

        passage1.AddQuestion(new ReadingQuestion(
            passage1.Id, 13, QuestionType.SummaryCompletion,
            "The 223-month Saros cycle on the reverse side was utilized by the device to predict ______.",
            JsonSerializer.Serialize(new string[] { }),
            "eclipses / solar and lunar eclipses",
            "Paragraph E mentions: 'the 223-month Saros cycle used to predict solar and lunar eclipses'."));

        // 2. Passage 2: Urban Agriculture and the Future of Food Supply
        var passage2 = new ReadingPassage(
            title: "Urban Agriculture and the Future of Food Supply",
            topic: "Environment & Urban Planning",
            difficulty: DifficultyLevel.Hard,
            content: @"### Paragraph A
By 2050, the global human population is projected to surpass 9.7 billion, with approximately 68% residing in metropolitan urban areas. Traditional rural agriculture, constrained by arable land depletion, climate instability, and massive freshwater consumption, faces unprecedented pressure to feed expanding cities. In response, architects, agronomists, and urban planners are pioneering urban agriculture—transforming abandoned warehouses, rooftops, and purpose-built vertical towers into hyper-efficient food cultivation hubs.

### Paragraph B
Among the most promising technological paradigms is controlled-environment agriculture (CEA), encompassing hydroponics, aeroponics, and aquaponics. Hydroponic systems cultivate crops in mineral-rich aqueous solutions without soil, while aeroponics suspends plant roots in enclosed chambers misted periodically with nutrient droplets. These closed-loop systems consume up to 95% less water than conventional outdoor farming because moisture is continuously captured, filtered, and recirculated through internal HVAC dehumidifiers.

### Paragraph C
Vertical farming also significantly mitigates agricultural carbon footprints by eliminating the thousands of 'food miles' required to transport produce from rural farmlands to urban supermarkets. Furthermore, by isolating crops inside hermetically sealed indoor environments with customized LED photosynthetic lighting spectra, growers eradicate the need for chemical pesticides and synthetic herbicides. Crops can be harvested 365 days a year without susceptibility to seasonal droughts, hailstorms, or pest epidemics.

### Paragraph D
Despite these compelling advantages, major economic and energetic hurdles remain. Indoor vertical farms demand substantial capital expenditure (CapEx) for real estate, sensor automation, and high-intensity LED installations. More critically, their continuous electrical consumption for lighting and thermal regulation can render their operational carbon footprint substantial unless powered entirely by decentralized renewable energy sources such as solar photovoltaic arrays or wind turbines.

### Paragraph E
In conclusion, urban agriculture is unlikely to entirely supplant extensive broadacre farming for staple grains such as wheat and rice. However, for high-value perishable crops including leafy greens, herbs, berries, and tomatoes, urban indoor farms provide an indispensable, resilient, and sustainable pillar of 21st-century food security.",
            estimatedTimeMinutes: 20);

        // Questions for Passage 2 (13 Questions)
        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 1, QuestionType.MultipleChoice,
            "According to Paragraph A, what percentage of the world's population is predicted to live in urban areas by 2050?",
            JsonSerializer.Serialize(new[] { "A. 50%", "B. 68%", "C. 75%", "D. 97%" }),
            "B. 68%",
            "Paragraph A explicitly notes 'with approximately 68% residing in metropolitan urban areas'."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 2, QuestionType.MultipleChoice,
            "Why do closed-loop aeroponic and hydroponic systems use up to 95% less water?",
            JsonSerializer.Serialize(new[] {
                "A. They rely solely on rainwater collection",
                "B. Moisture is captured, filtered, and recirculated internally",
                "C. Plants absorb less water in indoor conditions",
                "D. Soil absorbs all unused moisture"
            }),
            "B. Moisture is captured, filtered, and recirculated internally",
            "Paragraph B states moisture is continuously captured, filtered, and recirculated through internal dehumidifiers."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 3, QuestionType.MultipleChoice,
            "What major benefit is achieved by growing crops inside hermetically sealed environments?",
            JsonSerializer.Serialize(new[] {
                "A. Completely eliminates the need for chemical pesticides",
                "B. Halves the required electrical power",
                "C. Allows wheat and corn to grow in days",
                "D. Makes LED lighting unnecessary"
            }),
            "A. Completely eliminates the need for chemical pesticides",
            "Paragraph C states growers eradicate the need for chemical pesticides and synthetic herbicides."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 4, QuestionType.TrueFalseNotGiven,
            "Vertical farming completely replaces traditional rural agriculture for all grain crops.",
            JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
            "FALSE",
            "Paragraph E explains that urban agriculture is unlikely to entirely supplant extensive broadacre farming for staple grains like wheat and rice."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 5, QuestionType.TrueFalseNotGiven,
            "High electrical power consumption is one of the chief operational challenges for indoor farms.",
            JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
            "TRUE",
            "Paragraph D points out continuous electrical consumption for lighting and thermal regulation as a major hurdle."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 6, QuestionType.TrueFalseNotGiven,
            "The cost of LED lighting has dropped by 80% over the last five years.",
            JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
            "NOT GIVEN",
            "The text mentions LED lighting installations but provides no specific cost reduction percentage over 5 years."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 7, QuestionType.SummaryCompletion,
            "Hydroponic systems cultivate plants in mineral-rich solutions without the use of ______.",
            JsonSerializer.Serialize(new string[] { }),
            "soil",
            "Paragraph B states: 'cultivate crops in mineral-rich aqueous solutions without soil'."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 8, QuestionType.SummaryCompletion,
            "Aeroponic systems deliver nutrients by misting roots inside enclosed ______.",
            JsonSerializer.Serialize(new string[] { }),
            "chambers",
            "Paragraph B states: 'suspends plant roots in enclosed chambers misted periodically'."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 9, QuestionType.SummaryCompletion,
            "Vertical farming reduces greenhouse gas emissions by eliminating thousands of food ______.",
            JsonSerializer.Serialize(new string[] { }),
            "miles",
            "Paragraph C mentions: 'eliminating the thousands of food miles'."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 10, QuestionType.SummaryCompletion,
            "Indoor facilities must be powered by decentralized ______ energy to minimize their operational carbon footprint.",
            JsonSerializer.Serialize(new string[] { }),
            "renewable",
            "Paragraph D specifies: 'unless powered entirely by decentralized renewable energy sources'."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 11, QuestionType.SummaryCompletion,
            "Leafy greens, berries, and ______ are exemplary high-value perishable crops for urban farming.",
            JsonSerializer.Serialize(new string[] { }),
            "tomatoes",
            "Paragraph E mentions: 'leafy greens, herbs, berries, and tomatoes'."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 12, QuestionType.TrueFalseNotGiven,
            "Urban indoor crops can be harvested throughout all 365 days of the year.",
            JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
            "TRUE",
            "Paragraph C states: 'Crops can be harvested 365 days a year without susceptibility to seasonal droughts'."));

        passage2.AddQuestion(new ReadingQuestion(
            passage2.Id, 13, QuestionType.TrueFalseNotGiven,
            "Most urban vertical farms are currently profitable without government subsidies.",
            JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
            "NOT GIVEN",
            "Paragraph D discusses capital expenditure and electricity hurdles, but does not provide data on government subsidies."));

        context.ReadingPassages.AddRange(passage1, passage2);
        await context.SaveChangesAsync();

        logger.LogInformation("Successfully seeded 2 Cambridge IELTS Reading passages with 26 questions.");
    }
}
