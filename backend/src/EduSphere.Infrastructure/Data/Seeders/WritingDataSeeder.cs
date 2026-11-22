using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Data.Seeders;

/// <summary>Original (EduSphere-authored) IELTS Writing prompts with outlines and model answers.</summary>
public static class WritingDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.WritingPrompts.AnyAsync(p => p.Title == "Fast food and health")) return;

        var existing = await context.WritingPrompts.AnyAsync();
        if (!existing)
        context.WritingPrompts.AddRange(
            new WritingPrompt(WritingTaskType.Task2, "Opinion", "Remote work and productivity", "Work",
                "Some people believe that working from home is more productive than working in an office. To what extent do you agree or disagree?",
                null,
                "Intro: paraphrase + position. Body 1: fewer distractions and no commute. Body 2: limits (collaboration, isolation) but manageable. Conclusion: restate position.",
                "Working from home has become common, and I largely agree that it can raise productivity.\n\nFirst, employees avoid the commute, which often consumes two hours a day. This time can be used for focused work or rest, so people start tasks more alert. In addition, a quiet home environment removes the interruptions of open-plan offices, allowing deeper concentration on complex tasks.\n\nHowever, remote work is not perfect. Teams may find spontaneous collaboration harder, and some workers feel isolated, which can reduce motivation. Nevertheless, video calls and shared documents compensate for most of these problems, provided that companies set clear goals and regular check-ins.\n\nIn conclusion, although collaboration can suffer, the time saved and the calmer setting mean that home working is generally more productive for most office jobs.",
                7.0m),
            new WritingPrompt(WritingTaskType.Task2, "Discussion", "Children and technology", "Education",
                "Some people think that children should learn to use computers at primary school. Others believe they should focus on basic subjects first. Discuss both views and give your own opinion.",
                null,
                "Intro. View 1: digital skills are essential and engaging. View 2: literacy and numeracy form the foundation. Own opinion: balance, technology as a tool. Conclusion.",
                "People disagree about whether young pupils should be taught computing or concentrate on core subjects. This essay examines both views before giving my opinion.\n\nOn the one hand, digital skills are now essential for almost every career, so an early start gives children confidence. Educational software can also make lessons more interactive and enjoyable.\n\nOn the other hand, reading, writing and arithmetic underpin all later learning. If time is given to computers too early, pupils may struggle with these foundations, and excessive screen time can harm concentration.\n\nIn my view, schools should prioritise the basics but introduce technology gradually as a tool that supports them. This balance prepares children for the modern world without weakening their fundamental skills.",
                7.0m),
            new WritingPrompt(WritingTaskType.Task2, "Advantages / Disadvantages", "Cities and public transport", "Environment",
                "Many governments encourage people to use public transport instead of private cars. Do the advantages of this outweigh the disadvantages?",
                null,
                "Intro. Advantages: lower emissions, less congestion, cheaper. Disadvantages: less flexible, crowding, investment cost. Conclusion: advantages outweigh.",
                "Governments increasingly promote buses and trains over private cars. I believe the benefits clearly outweigh the drawbacks.\n\nThe main advantage is environmental: a full train produces far less pollution per passenger than the same number of cars. Public transport also reduces traffic jams, which saves time for everyone and makes cities more pleasant.\n\nAdmittedly, there are disadvantages. Timetables are less flexible than a private car, and rush-hour services can be crowded. Building new lines is also expensive.\n\nNevertheless, these problems can be solved with frequent services and long-term investment, whereas pollution and congestion are harder to fix. Therefore, the advantages of public transport are greater.",
                7.0m),
            new WritingPrompt(WritingTaskType.Task2, "Problem / Solution", "Plastic waste", "Environment",
                "Plastic waste is a growing problem worldwide. What are the main causes of this problem and what measures can be taken to reduce it?",
                null,
                "Intro. Causes: cheap single-use packaging, weak recycling, consumer habits. Solutions: bans/taxes, better recycling, education. Conclusion.",
                "Plastic pollution has reached alarming levels. This essay discusses its causes and suggests practical solutions.\n\nOne cause is that single-use packaging is cheap, so manufacturers prefer it. In addition, recycling systems in many countries are inadequate, meaning that large amounts of plastic end up in landfills or the sea. Finally, consumers often choose convenience over sustainability.\n\nGovernments can respond by taxing or banning items such as plastic bags and straws. Investment in modern recycling facilities would increase the proportion of waste that is reused. Education campaigns could also encourage people to carry reusable bottles and bags.\n\nIn conclusion, cheap packaging, poor recycling and habits create the problem, but regulation, infrastructure and awareness can reduce it significantly.",
                7.0m),
            new WritingPrompt(WritingTaskType.Task1Academic, "Table", "Household spending", "Economy",
                "The table below shows the percentage of household income spent on four categories in one country in 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                "Category | 2000 | 2020\nHousing | 28% | 34%\nFood | 25% | 17%\nTransport | 14% | 15%\nLeisure | 8% | 12%",
                "Intro paraphrase. Overview: housing rose most, food fell most. Body 1: housing and food. Body 2: transport (stable) and leisure.",
                "The table compares how households divided their income among four categories in 2000 and 2020.\n\nOverall, spending on housing and leisure rose, whereas the share spent on food declined noticeably. Transport stayed almost unchanged.\n\nHousing was the largest category in both years, increasing from 28% to 34%. Food, by contrast, fell sharply from 25% to 17%, so it went from the second-largest to a smaller item.\n\nTransport rose only slightly, from 14% to 15%. Leisure grew from 8% to 12%, the biggest proportional increase among the four categories.",
                7.0m),
            new WritingPrompt(WritingTaskType.Task1General, "Letter", "Complaint about a course", "Education",
                "You recently attended an evening course but the teaching did not match the description. Write a letter to the course manager. Explain what the problem was, say what you expected, and suggest what the school should do.",
                null,
                "Greeting (formal). Purpose. Problem details. What you expected. Request/solution. Formal closing.",
                "Dear Sir or Madam,\n\nI am writing to complain about the evening photography course that I completed last month.\n\nThe brochure promised small groups and hands-on practice with professional cameras. However, there were over thirty students in my class, and we mostly watched slides rather than taking photographs.\n\nI had expected personal feedback on my work and regular practical sessions. Unfortunately, neither was provided.\n\nI would therefore be grateful if you could refund part of the fee or allow me to repeat the course in a smaller group.\n\nI look forward to your reply.\n\nYours faithfully,\nA. Student",
                7.0m));

        context.WritingPrompts.AddRange(
            new WritingPrompt(WritingTaskType.Task2, "Two-part question", "Fast food and health", "Health",
                "In many countries, fast food is becoming more popular and people are eating less home-cooked food. Why is this happening? Is it a positive or negative development?",
                null,
                "Intro. Reasons: busy schedules, low price, aggressive marketing. Evaluation: mostly negative (obesity, heart disease) with a minor positive (convenience). Conclusion.",
                "Fast food is replacing home cooking in many societies. This essay explains why and argues that the trend is mostly negative.\n\nThe main reason is lack of time. Long working hours leave little energy for cooking, whereas a burger can be bought in minutes. Fast food is also inexpensive, and constant advertising makes it attractive, especially to young people.\n\nUnfortunately, the consequences are largely harmful. Meals high in sugar, salt and fat are linked to obesity and heart disease, which burden health systems. A positive aspect is convenience for busy families, but this does not outweigh the long-term risks.\n\nIn conclusion, time pressure, low prices and marketing explain the rise of fast food, and I believe it is a negative development.",
                7.0m),
            new WritingPrompt(WritingTaskType.Task2, "Opinion", "University: theory or practice", "Education",
                "Some people think universities should focus on practical skills for employment rather than academic subjects. To what extent do you agree or disagree?",
                null,
                "Intro. Agree partly: employability matters. But academic knowledge builds thinking skills. Balanced position: combine both. Conclusion.",
                "Opinions differ on whether universities should teach job skills instead of academic subjects. I partly agree, but I believe both are needed.\n\nPractical training clearly helps graduates. Employers want candidates who can use software, work in teams and solve real problems, and internships give students this experience.\n\nHowever, academic study develops critical thinking and deep understanding, which remain useful when technology changes. A degree focused only on current tools could quickly become outdated.\n\nTherefore, universities should combine theory with practice, for example through projects and placements. This prepares students for work while keeping their education broad.",
                7.0m),
            new WritingPrompt(WritingTaskType.Task1Academic, "Table", "Internet users by age group", "Technology",
                "The table below shows the percentage of people in three age groups who used the internet daily in 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                "Age group | 2010 | 2020\n16-24 | 78% | 97%\n25-54 | 55% | 91%\n55+ | 14% | 63%",
                "Intro paraphrase. Overview: all groups rose; 55+ rose most; youngest highest in both years. Body 1: 16-24 and 25-54. Body 2: 55+ growth.",
                "The table shows the proportion of three age groups using the internet every day in 2010 and 2020.\n\nOverall, daily use rose in every group, with the oldest group showing the most dramatic growth. Younger people remained the heaviest users throughout.\n\nAmong 16-24 year-olds, usage climbed from 78% to 97%, while the 25-54 group saw a rise from 55% to 91%.\n\nThe 55+ group started far lower at 14% but increased more than fourfold to 63%, narrowing the gap with the other groups.",
                7.0m),
            new WritingPrompt(WritingTaskType.Task1General, "Letter", "Invitation to a colleague", "Work",
                "A colleague is leaving your company. Write a letter to invite other colleagues to a farewell party. Say who is leaving and why, describe the plans for the party, and ask them to contribute to a gift.",
                null,
                "Informal/semi-formal greeting. Who and why. Party details (date, place, food). Gift contribution request. Friendly closing.",
                "Dear all,\n\nI am writing to invite you to a farewell party for Maria, who is leaving the company next month to start a new job in Canada.\n\nWe are planning a small party in the office kitchen on Friday 14th at 5 p.m. There will be snacks and drinks, and we hope everyone can join us.\n\nWe would also like to buy Maria a gift to remember us by. If you can, please contribute five pounds to the collection box on my desk by Wednesday.\n\nI look forward to seeing you there.\n\nBest wishes,\nJohn",
                7.0m));

        await context.SaveChangesAsync();
    }
}
