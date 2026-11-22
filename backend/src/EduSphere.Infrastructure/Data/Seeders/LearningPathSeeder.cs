using System.Text.Json;
using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Data.Seeders;

/// <summary>Seeds the original-content self-study Learning Path: 3 stages x 9 lessons.</summary>
public static class LearningPathSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.ExecuteSqlRawAsync(
            "UPDATE ReadingQuestions SET Prompt = REPLACE(Prompt, 'ONE WORD AND ONE WORD', 'NO MORE THAN TWO WORDS') WHERE Prompt LIKE '%ONE WORD AND ONE WORD%'");

        if (await context.LearningLessons.AnyAsync())
        {
            await LinkLessonsToTestsAsync(context);
            return;
        }

        var stages = new (int No, string Title, string Prefix, string Skill, (string Title, string Summary)[] Lessons)[]
        {
            (1, "Stage 1 — Listening & Speaking", "SL", "Listening", new[]
            {
                ("Predicting answers before the audio", "Read the questions during the preview time. Decide the **word class** (noun, number, adjective) and the **topic** of each blank so you know what to listen for."),
                ("Form & note completion", "Answers follow the order of the audio. Write exactly what you hear, check spelling of names (often spelled out) and numbers (dates, phone numbers, prices)."),
                ("Multiple choice in Listening", "Speakers often mention all options. Listen for the **final decision** or correction, not the first idea you hear."),
                ("Map & diagram labelling", "Study the layout first: find the starting point and the direction words (opposite, next to, along, behind)."),
                ("Speaking Part 1 — personal answers", "Answer directly, then add a reason and a short example. Aim for 2–3 sentences, not one word and not a speech."),
                ("Speaking Part 2 — the cue card", "Use the 1-minute preparation to note one keyword per bullet. Tell a story: when, who, what happened, how you felt."),
                ("Speaking Part 3 — abstract discussion", "Give an opinion, a reason, and a comparison (past vs present, young vs old). Use hedging: *it tends to*, *in many cases*."),
                ("Paraphrase & synonyms", "Audio rarely repeats the question words. Build a habit of matching **meaning**, not words."),
                ("Review & timed practice", "Do a full section under test conditions, then review every mistake: was it spelling, prediction, or paraphrase?"),
            }),
            (2, "Stage 2 — Writing", "W", "Writing", new[]
            {
                ("Sentence building blocks", "Every sentence needs a subject and a verb. Practise joining ideas with *because*, *although*, *which*."),
                ("Paragraph structure (PEEL)", "Point, Evidence, Explain, Link. One main idea per paragraph."),
                ("Task 1 — describing trends", "Open with an overview of the **main** trends. Group data; do not list every number."),
                ("Task 1 — comparing data", "Use comparatives and superlatives; compare categories, not only single values."),
                ("Task 2 — understanding the question", "Underline the task words (discuss, to what extent, causes and solutions) and answer **every** part."),
                ("Task 2 — introductions & conclusions", "Paraphrase the prompt, state your position, and mirror it in the conclusion without new ideas."),
                ("Cohesion without over-linking", "Reference words (this, such, these) beat repeated *Firstly/Secondly*. Use a link only where the logic needs it."),
                ("Vocabulary: collocations", "Learn word partners: *pose a threat*, *raise awareness*, *a steady decline*."),
                ("Editing your own essay", "Check in this order: task answered, paragraphing, grammar range, word choice, spelling. Reserve 3 minutes."),
            }),
            (3, "Stage 3 — Reading", "R", "Reading", new[]
            {
                ("Skimming & scanning", "Skim for the topic of each paragraph first; scan for names, numbers and capitalised words when a question names them."),
                ("True / False / Not Given", "**Linear method:** 1) read the statement, 2) locate the evidence, 3) read it closely, 4) compare meaning. *False* = contradicts; *Not Given* = no information."),
                ("Yes / No / Not Given", "Same steps as TFNG but about the **writer's views**. Do not use your own knowledge or opinion."),
                ("Matching Headings", "Read the heading list first, then find the **main idea** of each paragraph. Beware headings that mention a detail, not the main point."),
                ("Matching Information", "Questions are not in text order. Scan for the specific detail (example, reason, comparison) and remember a paragraph can be used more than once."),
                ("Summary & sentence completion", "Check the word limit and the grammar of the gap. The answer is copied from the text, in the same form."),
                ("Multiple choice & multiple select", "Eliminate options that are too extreme or only partly true. For *choose TWO*, each answer needs its own evidence."),
                ("Short-answer questions", "Underline the question word (who, which, how many) and the word limit; copy the exact words from the passage."),
                ("Full passage under time", "Allow about 20 minutes per passage. Skip a hard question after one minute and return at the end."),
            }),
        };

        foreach (var stage in stages)
        {
            for (var i = 0; i < stage.Lessons.Length; i++)
            {
                var (title, summary) = stage.Lessons[i];
                var skillRoute = stage.Skill == "Listening" ? "/listening" : "/reading";
                var items = new List<object>();
                if (stage.Skill != "Writing")
                {
                    items.Add(new { type = "exercise", title = $"Practice exercises — {title}", route = skillRoute });
                    items.Add(new { type = "test", title = "Online practice test", route = skillRoute });
                }
                else
                {
                    items.Add(new { type = "exercise", title = "Writing practice (coming with the Writing module)", route = "" });
                }

                context.LearningLessons.Add(new LearningLesson(
                    stage.No, stage.Title, $"{stage.Prefix}{i + 1}", i + 1, title, stage.Skill,
                    $"## {title}\n\n{summary}\n\n**Remember:** finish the lesson exercises, then take the online test and review each mistake.",
                    JsonSerializer.Serialize(items)));
            }
        }

        await context.SaveChangesAsync();
    }

    /// <summary>Points specific lessons at the seeded practice tests that train that exact question type.</summary>
    private static async Task LinkLessonsToTestsAsync(ApplicationDbContext context)
    {
        var passages = await context.ReadingPassages.AsNoTracking()
            .Where(p => p.Title.Contains("Waggle") || p.Title.Contains("Antikythera") || p.Title.Contains("Urban Agriculture"))
            .Select(p => new { p.Id, p.Title }).ToListAsync();
        Guid? Id(string key) => passages.FirstOrDefault(p => p.Title.Contains(key))?.Id;

        var map = new Dictionary<string, (string Key, string Label)>
        {
            ["R2"] = ("Urban Agriculture", "True / False / Not Given test"),
            ["R4"] = ("Antikythera", "Matching Headings test"),
            ["R5"] = ("Waggle", "Matching Information test"),
            ["R7"] = ("Waggle", "Multiple select test"),
            ["R8"] = ("Waggle", "Short-answer test"),
        };

        var writingLinks = new Dictionary<string, (string Search, string Label)>
        {
            ["W3"] = ("Household spending", "Task 1 table practice"),
            ["W4"] = ("Internet users", "Task 1 comparison practice"),
            ["W5"] = ("Remote work", "Task 2 opinion essay"),
            ["W6"] = ("University", "Task 2 introduction & conclusion practice"),
            ["W7"] = ("Fast food", "Task 2 cohesion practice"),
            ["W9"] = ("Children and technology", "Self-edit a full essay"),
        };
        var wp = await context.WritingPrompts.AsNoTracking().Select(p => new { p.Id, p.Title }).ToListAsync();
        var wLessons = await context.LearningLessons.Where(l => writingLinks.Keys.Contains(l.Code)).ToListAsync();
        foreach (var lesson in wLessons)
        {
            var (search, label) = writingLinks[lesson.Code];
            var target = wp.FirstOrDefault(p => p.Title.Contains(search));
            if (target is null) continue;
            lesson.SetItems(JsonSerializer.Serialize(new object[]
            {
                new { type = "test", title = label, route = $"/writing/write/{target.Id}" },
                new { type = "exercise", title = "More Writing prompts", route = "/writing" },
            }));
        }

        var lessons = await context.LearningLessons.Where(l => map.Keys.Contains(l.Code)).ToListAsync();
        foreach (var lesson in lessons)
        {
            var (key, label) = map[lesson.Code];
            var id = Id(key);
            if (id is null) continue;
            var items = new object[]
            {
                new { type = "test", title = label, route = $"/reading/exam/{id}" },
                new { type = "exercise", title = "More Reading practice", route = "/reading" },
            };
            lesson.SetItems(JsonSerializer.Serialize(items));
        }
        await context.SaveChangesAsync();
    }
}
