using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EduSphere.Infrastructure.Data.Seeders;

public static class WritingDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        logger?.LogInformation("Checking IELTS Writing prompts...");

        var existingCount = await context.WritingPrompts.CountAsync();
        if (existingCount > 0)
        {
            logger?.LogInformation("Writing prompts already exist. Skipping seed.");
            return;
        }

        var prompts = new List<WritingPrompt>
        {
            new WritingPrompt(
                taskType: WritingTaskType.Task1,
                title: "Electricity Generation by Fuel Source in France (1980 - 2010)",
                topic: "Energy & Environment",
                promptText: "The line graph below shows electricity generation in France by fuel source between 1980 and 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
                imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
                difficulty: DifficultyLevel.Medium,
                recommendedTimeMinutes: 20,
                minWordCount: 150,
                sampleBand8Answer: @"The line graph illustrates the amount of electricity produced in France from four distinct fuel sources—nuclear, thermal (coal and gas), hydroelectric, and renewables—over a thirty-year period from 1980 to 2010, measured in terawatt-hours (TWh).

Overall, it is immediately evident that nuclear power experienced exponential growth to become the overwhelmingly dominant source of electricity in France. Conversely, thermal power declined significantly, while hydroelectric generation remained broadly stable and renewables emerged only towards the end of the timeline.

In 1980, thermal power was the leading source of electricity, generating approximately 120 TWh, compared to nuclear power at roughly 75 TWh. Hydroelectric power accounted for a steady 65 TWh, while renewables were virtually non-existent. Over the subsequent decade, nuclear generation surged dramatically, surpassing thermal power in 1982 and escalating to almost 400 TWh by 1995. It peaked in 2005 at around 430 TWh before slightly plateauing at 410 TWh in 2010.

In sharp contrast, thermal electricity plummeted to approximately 50 TWh by 1985 and fluctuated between 40 and 60 TWh for the remainder of the period. Hydroelectric power demonstrated negligible variation, maintaining an output consistently around 55–65 TWh throughout the 30 years. Finally, renewable energy sources showed initial progress around 2000, rising modestly to achieve approximately 15 TWh by 2010."
            ),

            new WritingPrompt(
                taskType: WritingTaskType.Task1,
                title: "University Graduates in Canada by Academic Discipline (2020)",
                topic: "Higher Education & Gender Demographics",
                promptText: "The bar chart below compares the proportion of male and female students graduating from Canadian universities across five academic fields in 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
                imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
                difficulty: DifficultyLevel.Medium,
                recommendedTimeMinutes: 20,
                minWordCount: 150,
                sampleBand8Answer: @"The bar chart presents the gender distribution of Canadian university graduates across five different academic disciplines in the year 2020, expressed as percentages of the total cohort in each field.

Overall, female graduates outnumbered their male counterparts in health sciences, education, and humanities, whereas male students maintained a substantial majority in engineering and computer science.

In disciplines characterized by high female participation, Health Sciences exhibited the most pronounced disparity, with women comprising nearly 75% of all graduates compared to just 25% for men. A similar, though less extreme, pattern was visible in Education and Humanities, where females constituted approximately 68% and 62% of graduating cohorts respectively.

Conversely, technical fields remained heavily male-dominated. In Engineering, male graduates represented approximately 78% of the total student body, almost quadrupling the female proportion of 22%. Computer Science followed a corresponding trend, with men making up 72% of graduates and women accounting for only 28%. In summary, while women predominated in care-oriented and humanities subjects, men retained a decisive advantage in STEM disciplines."
            ),

            new WritingPrompt(
                taskType: WritingTaskType.Task2,
                title: "Compulsory Community Service in High School",
                topic: "Education & Youth Civic Responsibility",
                promptText: "Some people believe that unpaid community service should be a compulsory part of high school programmes.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
                difficulty: DifficultyLevel.Medium,
                recommendedTimeMinutes: 40,
                minWordCount: 250,
                sampleBand8Answer: @"In contemporary educational debate, whether mandatory unpaid volunteering should be integrated into secondary school curricula remains contentious. While critics argue that compulsion diminishes genuine altruism, I largely agree that incorporating structured community service offers indispensable developmental benefits for both adolescents and society.

The principal objection to compulsory community service centres on the contradiction inherent in forcing students into voluntary work. Opponents contend that academic pressures are already intense, with high school pupils preparing for rigorous university entrance examinations. Compelling them to allocate valuable hours to community projects could exacerbate academic stress. Furthermore, when participation is mandated, students may view these activities as mere box-ticking obligations rather than developing heartfelt civic empathy.

Notwithstanding these concerns, mandatory engagement is often the only way to expose youth from diverse socioeconomic backgrounds to pressing societal challenges. Adolescence is a formative period during which young people's worldviews are crystallized. By participating in initiatives such as assisting elderly residents, environmental conservation, or food bank distribution, pupils cultivate essential life competencies including teamwork, interpersonal communication, and emotional resilience. For example, educational institutions in Ontario, Canada, requiring forty hours of community involvement prior to graduation, have observed marked increases in civic engagement and subsequent university retention.

Moreover, community service instills a profound sense of civic responsibility that theoretical classroom teaching cannot replicate. In an increasingly digitalized era where adolescents frequently experience social isolation, volunteering connects young individuals directly with their local neighbourhoods, fostering solidarity and social cohesion.

In conclusion, although the mandatory nature of the programme may present logistical hurdles, the overarching benefits—specifically character building, skill acquisition, and community empowerment—far outweigh the drawbacks. Secondary institutions should therefore adopt compulsory service programmes while maintaining flexibility in the types of activities students may pursue."
            ),

            new WritingPrompt(
                taskType: WritingTaskType.Task2,
                title: "The Growing Trend of Solo Living in Modern Society",
                topic: "Sociology & Lifestyle Patterns",
                promptText: "In many countries, an increasing number of people are choosing to live alone.\n\nWhat are the advantages and disadvantages of this trend?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
                difficulty: DifficultyLevel.Hard,
                recommendedTimeMinutes: 40,
                minWordCount: 250,
                sampleBand8Answer: @"Across numerous developed and developing nations, demographic data indicates a notable surge in single-person households. While solo living provides unprecedented autonomy and self-reliance, it also brings significant emotional vulnerabilities and economic inefficiencies that warrant careful consideration.

On the positive side, residing independently fosters exceptional self-sufficiency and personal freedom. An individual living alone possesses total discretion over their domestic environment, schedule, and lifestyle choices without the compromises inevitably required in shared accommodations or family households. This autonomy allows young professionals and creative workers to focus uninterruptedly on career advancement or intellectual pursuits. Additionally, managing household finances, maintenance, and domestic chores independently cultivates maturity, problem-solving skills, and psychological resilience.

However, this phenomenon has distinct disadvantages, most notably social isolation and mental health consequences. Human beings are inherently social creatures, and prolonged periods without regular interpersonal engagement can precipitate feelings of loneliness, anxiety, and depression. Unlike communal living arrangements where emotional support is readily accessible, solo dwellers must actively seek social interaction, which can be challenging after demanding workdays. Furthermore, single living is economically and environmentally inefficient. Solo households consume disproportionately higher amounts of energy, heating, and household appliances per capita compared to shared living spaces, while bearing the entire burden of escalating rental and utility expenses alone.

In conclusion, living alone is a double-edged sword. It offers invaluable independence, privacy, and personal empowerment, yet simultaneously risks social alienation and inflated living expenditures. Ultimately, individuals embracing this lifestyle must proactively maintain robust social networks and sensible financial discipline to mitigate the intrinsic drawbacks."
            )
        };

        await context.WritingPrompts.AddRangeAsync(prompts);
        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded {Count} IELTS Writing prompts successfully.", prompts.Count);
    }
}
