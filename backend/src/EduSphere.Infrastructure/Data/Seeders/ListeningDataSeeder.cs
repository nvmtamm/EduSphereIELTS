using System.Text.Json;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Data.Seeders;

public static class ListeningDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.ListeningTests.AnyAsync())
        {
            return;
        }

        // ==========================================
        // 1. CAMBRIDGE IELTS 18 - FULL LISTENING TEST 1 (40 Questions, 4 Parts)
        // ==========================================
        var fullTest1 = new ListeningTest(
            title: "Cambridge IELTS 18 — Full Listening Practice Test 1",
            topic: "Urban Living, Marine Ecology & Environmental Acoustics",
            difficulty: DifficultyLevel.Hard,
            sectionType: ListeningSectionType.FullTest_4Sections,
            sectionNumber: 0,
            audioUrl: "https://ia801503.us.archive.org/15/items/ielts-listening-audio-samples/cambridge18-test1-full.mp3",
            durationSeconds: 1800, // 30 mins
            accent: ListeningAccent.Mixed,
            sourceType: PassageSourceType.OfficialCambridge,
            collectionName: "Cambridge IELTS 18 Academic",
            targetBandTier: TargetBandTier.Band7_0_7_5,
            instructions: "Answer all 40 questions across 4 sections. You will hear each recording ONCE only. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for completion questions.",
            audioFileSize: 28400000);

        // Section 1: Questions 1 - 10 (Form & Note Completion)
        AddSection1Questions(fullTest1);
        AddSection1Transcripts(fullTest1);

        // Section 2: Questions 11 - 20 (Multiple Choice & Map Labelling)
        AddSection2Questions(fullTest1);
        AddSection2Transcripts(fullTest1);

        // Section 3: Questions 21 - 30 (Academic Discussion & Matching)
        AddSection3Questions(fullTest1);
        AddSection3Transcripts(fullTest1);

        // Section 4: Questions 31 - 40 (Urban Acoustic Architecture Lecture)
        AddSection4Questions(fullTest1);
        AddSection4Transcripts(fullTest1);

        // ==========================================
        // 2. SECTION 1 FOCUS: CUSTOMER SUPPORT & BIKE RENTAL (British Accent)
        // ==========================================
        var section1Test = new ListeningTest(
            title: "Cambridge IELTS 17 — Section 1: Riverside Bicycle Rental",
            topic: "Transport & Leisure Activities",
            difficulty: DifficultyLevel.Easy,
            sectionType: ListeningSectionType.Section1_SocialDialogue,
            sectionNumber: 1,
            audioUrl: "https://ia801503.us.archive.org/15/items/ielts-listening-audio-samples/cambridge17-test2-sec1.mp3",
            durationSeconds: 380,
            accent: ListeningAccent.British,
            sourceType: PassageSourceType.OfficialCambridge,
            collectionName: "Cambridge IELTS 17 Academic",
            targetBandTier: TargetBandTier.Band5_0_5_5,
            instructions: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.");

        AddStandAloneSection1Questions(section1Test);
        AddStandAloneSection1Transcripts(section1Test);

        // ==========================================
        // 3. SECTION 2 FOCUS: BOTANICAL GARDENS MAP (Australian Accent)
        // ==========================================
        var section2Test = new ListeningTest(
            title: "Cambridge IELTS 16 — Section 2: Botanical Gardens Visitor Guide",
            topic: "Tourism & Public Amenities",
            difficulty: DifficultyLevel.Medium,
            sectionType: ListeningSectionType.Section2_SocialMonologue,
            sectionNumber: 2,
            audioUrl: "https://ia801503.us.archive.org/15/items/ielts-listening-audio-samples/cambridge16-test3-sec2.mp3",
            durationSeconds: 420,
            accent: ListeningAccent.Australian,
            sourceType: PassageSourceType.OfficialCambridge,
            collectionName: "Cambridge IELTS 16 Academic",
            targetBandTier: TargetBandTier.Band6_0_6_5,
            instructions: "Label the plan below. Choose the correct letter, A-H, for questions 11-15. Choose the correct letter A, B, or C for questions 16-20.");

        AddStandAloneSection2Questions(section2Test);
        AddStandAloneSection2Transcripts(section2Test);

        // ==========================================
        // 4. SECTION 4 FOCUS: GEOTHERMAL ENERGY HARNESSING (American Accent)
        // ==========================================
        var section4Test = new ListeningTest(
            title: "Cambridge IELTS 19 — Section 4: Geothermal Subsea Innovations",
            topic: "Renewable Energy & Geophysics",
            difficulty: DifficultyLevel.Hard,
            sectionType: ListeningSectionType.Section4_AcademicLecture,
            sectionNumber: 4,
            audioUrl: "https://ia801503.us.archive.org/15/items/ielts-listening-audio-samples/cambridge19-test4-sec4.mp3",
            durationSeconds: 480,
            accent: ListeningAccent.American,
            sourceType: PassageSourceType.OfficialCambridge,
            collectionName: "Cambridge IELTS 19 Academic",
            targetBandTier: TargetBandTier.Band8_0_Plus,
            instructions: "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.");

        AddStandAloneSection4Questions(section4Test);
        AddStandAloneSection4Transcripts(section4Test);

        context.ListeningTests.AddRange(fullTest1, section1Test, section2Test, section4Test);
        await context.SaveChangesAsync();
    }

    #region Full Test 1 Data Helper Methods

    private static void AddSection1Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(
            test.Id, 1, 1, QuestionType.FormCompletion,
            "Customer full name: Sarah _______",
            "[]", "Hemmings", "The caller spells her surname: H-E-M-M-I-N-G-S.", 35.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 1, 2, QuestionType.FormCompletion,
            "Address: 24 _______ Street, Southwark",
            "[]", "Greengrove / Green Grove", "Address given as 24 Greengrove Street.", 52.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 1, 3, QuestionType.FormCompletion,
            "Preferred bicycle model: _______ bike with front basket",
            "[]", "hybrid / Hybrid", "She specifies wanting a hybrid model suitable for asphalt and gravel paths.", 78.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 1, 4, QuestionType.FormCompletion,
            "Rental duration: _______ days",
            "[]", "3 / three", "She intends to rent for the entire 3-day weekend.", 102.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 1, 5, QuestionType.FormCompletion,
            "Mandatory safety accessory included: _______",
            "[]", "helmet", "The clerk mentions helmets are compulsory and supplied free of charge.", 124.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 1, 6, QuestionType.NoteCompletion,
            "Deposit amount required: £_______",
            "[]", "50 / fifty", "A refundable £50 security deposit is taken on credit card.", 155.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 1, 7, QuestionType.NoteCompletion,
            "Collection point: Beside the public _______",
            "[]", "library", "Pick-up point is situated right next to the central library.", 185.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 1, 8, QuestionType.NoteCompletion,
            "Early morning return slot starts at: _______ am",
            "[]", "7:30 / 7.30 / seven thirty", "Returns open early at 7:30 am.", 212.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 1, 9, QuestionType.FormCompletion,
            "Payment method: _______ card",
            "[]", "credit", "She chooses to settle the bill by credit card.", 240.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 1, 10, QuestionType.FormCompletion,
            "Special requirement: Needs a rear _______ for toddler",
            "[]", "seat / child seat", "She requests a rear child seat attached to the frame.", 268.0));
    }

    private static void AddSection1Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 0.0, 18.0, "Narrator", "Section 1. You will hear a telephone conversation between a customer and an assistant at a city bike rental service. First you have some time to look at questions 1 to 5."));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 19.0, 30.0, "Clerk", "Good morning, City Pedal Hire! How may I assist you today?"));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 31.0, 48.0, "Sarah", "Hello, I'd like to book bike rental for this upcoming weekend. My name is Sarah Hemmings, that's H-E-M-M-I-N-G-S.", 1));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 49.0, 65.0, "Clerk", "Thank you Sarah. And could I take your local residential address for registration?"));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 66.0, 75.0, "Sarah", "Sure, it's 24 Greengrove Street in Southwark.", 2));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 76.0, 95.0, "Clerk", "Splendid. We have road bikes, mountain bikes, and hybrids available. Which would you prefer?"));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 96.0, 115.0, "Sarah", "A hybrid bike will be ideal since we plan to ride along the riverside promenade for 3 days.", 3));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 116.0, 140.0, "Clerk", "Noted. All rentals come with a high-visibility lock and a safety helmet at no extra cost.", 5));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 141.0, 170.0, "Clerk", "Regarding the deposit, we authorize a refundable £50 charge on your credit card on collection.", 6));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 171.0, 205.0, "Sarah", "Where exactly is the collection booth located?"));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 206.0, 235.0, "Clerk", "Directly beside Southwark Public Library, just opposite the fountain.", 7));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 236.0, 275.0, "Sarah", "Great! And I will need a rear child seat for my three-year-old daughter.", 10));
    }

    private static void AddSection2Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(
            test.Id, 2, 11, QuestionType.MultipleChoice,
            "What is the primary aim of the Green Meadows Volunteer Program?",
            JsonSerializer.Serialize(new[] { "A. Restoring historic watermills", "B. Enhancing local biodiversity and community gardens", "C. Constructing commercial cafe facilities" }),
            "B", "Speaker highlights enhancing biodiversity and pollinator habitats as the core mission.", 310.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 2, 12, QuestionType.MultipleChoice,
            "New volunteers must attend orientation on:",
            JsonSerializer.Serialize(new[] { "A. Every Tuesday morning", "B. The first Saturday of every month", "C. Alternate Thursday evenings" }),
            "B", "Orientation is scheduled on the first Saturday of each month at 9:00 am.", 340.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 2, 13, QuestionType.MultipleChoice,
            "What equipment is provided free for all tree planting activities?",
            JsonSerializer.Serialize(new[] { "A. Waterproof boots", "B. Heavy-duty gloves and spades", "C. Portable rain shelters" }),
            "B", "Gloves and spades are provided on site.", 375.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 2, 14, QuestionType.MapLabelling,
            "Map Location 14: Wildlife Observation Hide is located at letter _______",
            JsonSerializer.Serialize(new[] { "A", "B", "C", "D", "E", "F", "G", "H" }),
            "D", "North-east corner overlooking the wetland pond.", 410.0, null, "/images/listening/green-meadows-map.svg"));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 2, 15, QuestionType.MapLabelling,
            "Map Location 15: The Organic Herb Nursery is located at letter _______",
            JsonSerializer.Serialize(new[] { "A", "B", "C", "D", "E", "F", "G", "H" }),
            "A", "Immediately to the left of the main southern entrance gate.", 440.0, null, "/images/listening/green-meadows-map.svg"));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 2, 16, QuestionType.MapLabelling,
            "Map Location 16: The Tool Storage Barn is located at letter _______",
            JsonSerializer.Serialize(new[] { "A", "B", "C", "D", "E", "F", "G", "H" }),
            "F", "Behind the windmill adjacent to the western service track.", 470.0, null, "/images/listening/green-meadows-map.svg"));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 2, 17, QuestionType.Matching,
            "Volunteer Role: Wetland Monitor — Primary Responsibility: _______",
            JsonSerializer.Serialize(new[] { "A. Recording amphibian populations", "B. Pruning fruit trees", "C. Leading guided school tours", "D. Managing compost digestion" }),
            "A", "Wetland monitors record frog and newt populations weekly.", 505.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 2, 18, QuestionType.Matching,
            "Volunteer Role: Orchard Custodian — Primary Responsibility: _______",
            JsonSerializer.Serialize(new[] { "A. Recording amphibian populations", "B. Pruning fruit trees", "C. Leading guided school tours", "D. Managing compost digestion" }),
            "B", "Orchard custodians maintain and prune heirloom apple trees.", 535.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 2, 19, QuestionType.Matching,
            "Volunteer Role: Education Docent — Primary Responsibility: _______",
            JsonSerializer.Serialize(new[] { "A. Recording amphibian populations", "B. Pruning fruit trees", "C. Leading guided school tours", "D. Managing compost digestion" }),
            "C", "Education docents guide school visits and explain flora.", 565.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 2, 20, QuestionType.Matching,
            "Volunteer Role: Soil Recycling Specialist — Primary Responsibility: _______",
            JsonSerializer.Serialize(new[] { "A. Recording amphibian populations", "B. Pruning fruit trees", "C. Leading guided school tours", "D. Managing compost digestion" }),
            "D", "Supervises organic composting units across sectors.", 595.0));
    }

    private static void AddSection2Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 280.0, 305.0, "Narrator", "Section 2. You will hear a coordinator introducing the Green Meadows Community Park volunteer project. First you have some time to look at questions 11 to 16."));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 306.0, 335.0, "Coordinator", "Welcome everyone! Over the past five years, our park's primary mission has evolved from basic upkeep to actively enhancing local biodiversity and creating sanctuaries for native wildlife.", 11));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 336.0, 365.0, "Coordinator", "If you are joining us for the first time, our compulsory induction session takes place on the first Saturday of every month at 9:00 am.", 12));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 366.0, 400.0, "Coordinator", "Do not worry about tools; we supply all necessary spades, shears, and heavy-duty gloves on arrival.", 13));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 401.0, 435.0, "Coordinator", "Now let's examine the site map. If you look at the northeastern wetland pool, point D marks our Wildlife Observation Hide.", 14));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 436.0, 465.0, "Coordinator", "Just as you enter through the main southern archway, on your immediate left at point A is the Organic Herb Nursery.", 15));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 466.0, 500.0, "Coordinator", "Finally, behind the restored timber windmill on the western boundary, point F is where we house the Tool Storage Barn.", 16));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 501.0, 600.0, "Coordinator", "Regarding specialist roles: Wetland monitors focus exclusively on recording amphibian counts; Orchard custodians prune trees; Education docents guide youth tours; and Soil specialists manage composting.", 17));
    }

    private static void AddSection3Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(
            test.Id, 3, 21, QuestionType.MultipleChoice,
            "Why did Jack and Emma choose the temperate kelp forest as their research subject?",
            JsonSerializer.Serialize(new[] { "A. It was recommended by their laboratory tutor", "B. Its carbon sequestration rate is significantly faster than terrestrial forests", "C. Funding grants were readily available" }),
            "B", "Emma points out that kelp absorbs carbon dioxide twenty times faster than rainforests.", 650.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 3, 22, QuestionType.MultipleChoice,
            "What methodological challenge did they encounter during sensor deployment?",
            JsonSerializer.Serialize(new[] { "A. Battery depletion due to cold marine temperatures", "B. Tidal wave turbulence damaging acoustic telemetry tags", "C. Sediment accumulation on solar collectors" }),
            "B", "Jack explains strong wave surges repeatedly sheared the acoustic sensor mountings.", 690.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 3, 23, QuestionType.MultipleChoiceMulti,
            "Which TWO factors caused the decline in local sea otter populations? (Select 2 answers)",
            JsonSerializer.Serialize(new[] { "A. Commercial overfishing of sea urchins", "B. Toxic industrial runoff", "C. Increased predation by transient orcas", "D. Warming ocean surface temperatures", "E. Habitat fragmentation by coastal marinas" }),
            "C,D / D,C", "The conversation identifies orca predation and surface warming temperatures.", 735.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 3, 24, QuestionType.MultipleChoiceMulti,
            "Which TWO factors caused the decline in local sea otter populations? (Second answer)",
            JsonSerializer.Serialize(new[] { "A. Commercial overfishing of sea urchins", "B. Toxic industrial runoff", "C. Increased predation by transient orcas", "D. Warming ocean surface temperatures", "E. Habitat fragmentation by coastal marinas" }),
            "C,D / D,C", "Orca predation and warm water anomalies.", 735.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 3, 25, QuestionType.Matching,
            "Research Phase: Satellite Multispectral Imaging — Assigned Student: _______",
            JsonSerializer.Serialize(new[] { "A. Jack only", "B. Emma only", "C. Both Jack and Emma" }),
            "B", "Emma will handle satellite spectral index analysis.", 780.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 3, 26, QuestionType.Matching,
            "Research Phase: Underwater Drone Photogrammetry — Assigned Student: _______",
            JsonSerializer.Serialize(new[] { "A. Jack only", "B. Emma only", "C. Both Jack and Emma" }),
            "A", "Jack holds the ROV drone piloting license.", 810.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 3, 27, QuestionType.Matching,
            "Research Phase: Statistical Regression Modelling — Assigned Student: _______",
            JsonSerializer.Serialize(new[] { "A. Jack only", "B. Emma only", "C. Both Jack and Emma" }),
            "C", "They agree to co-author and validate the regression models together.", 840.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 3, 28, QuestionType.SentenceCompletion,
            "The kelp canopy height decreased by _______ percent during the August heatwave.",
            "[]", "35 / thirty-five / 35%", "Sensor data confirmed a 35% reduction in canopy coverage.", 875.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 3, 29, QuestionType.SentenceCompletion,
            "The team used specialized _______ algorithms to filter out background noise from acoustic tags.",
            "[]", "machine learning / AI", "Machine learning filtering algorithms removed water turbulence artifacts.", 910.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 3, 30, QuestionType.SentenceCompletion,
            "Final dissertation submission is scheduled for the _______ of November.",
            "[]", "18th / 18 / eighteenth", "Deadline confirmed by tutor as November 18th.", 945.0));
    }

    private static void AddSection3Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 610.0, 640.0, "Narrator", "Section 3. You will hear two marine ecology students, Jack and Emma, discussing their collaborative research dissertation on coastal kelp ecosystems."));
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 641.0, 680.0, "Emma", "Jack, looking at our initial literature review, kelp beds capture carbon up to twenty times faster per hectare than mature rainforests. That is why this topic is so compelling.", 21));
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 681.0, 720.0, "Jack", "Agreed. Though when we deployed the acoustic telemetry tags last month, turbulent swells repeatedly sheared the underwater brackets.", 22));
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 721.0, 770.0, "Emma", "Also, the ecological chain reaction is striking: rising ocean surface temperatures combined with apex orca predation drove down otter numbers, allowing urchins to overgraze the kelp.", 23));
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 771.0, 830.0, "Jack", "For the division of tasks: I'll pilot the underwater ROV drone for 3D photogrammetry, while you process the multispectral satellite imagery.", 25));
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 831.0, 900.0, "Emma", "And we will construct the statistical regression models together. Remember that our data showed a 35 percent canopy drop during the El Niño spike.", 27));
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 901.0, 960.0, "Jack", "Right! We applied machine learning algorithms to clean the audio frequencies. Let's aim for the November 18th draft deadline.", 29));
    }

    private static void AddSection4Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(
            test.Id, 4, 31, QuestionType.SentenceCompletion,
            "Ancient Greek amphitheaters utilized _______ stone seating to reflect vocal harmonics.",
            "[]", "limestone", "Limestone was chosen because its surface density acts as a natural high-pass filter.", 1010.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 4, 32, QuestionType.SentenceCompletion,
            "19th-century concert halls achieved warm reverberation through porous _______ plastering.",
            "[]", "lime / plaster", "Thick porous lime plaster applied on interior masonry.", 1050.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 4, 33, QuestionType.NoteCompletion,
            "Key Metric: Optimum Reverberation Time (RT60) for orchestral symphony: _______ seconds",
            "[]", "1.8 to 2.2 / 1.8-2.2 / 2", "Optimal symphony halls require an RT60 between 1.8 and 2.2 seconds.", 1095.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 4, 34, QuestionType.NoteCompletion,
            "Major defect in flat parallel glass facades: _______ echo phenomenon",
            "[]", "flutter / flutter echo", "Sound bouncing between rigid parallel planes causes flutter echo.", 1140.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 4, 35, QuestionType.TableCompletion,
            "Acoustic Material: Perforated Timber Panels — Mechanism: Traps low-frequency _______",
            "[]", "resonance / bass", "Perforated Helmholtz resonators absorb troublesome low-frequency bass.", 1180.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 4, 36, QuestionType.TableCompletion,
            "Acoustic Material: Quadratic Residue Diffusers — Mechanism: Scatters sound across _______ directions",
            "[]", "multiple / various / random", "Diffusers scatter specular reflections evenly in multiple angles.", 1220.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 4, 37, QuestionType.NoteCompletion,
            "Modern urban skyscrapers incorporate sound-dampening _______ on exterior air ventilation shafts.",
            "[]", "baffles / silencers", "Acoustic baffles line exterior intake louvers.", 1260.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 4, 38, QuestionType.SentenceCompletion,
            "City noise pollution above _______ decibels has been clinically linked to chronic cardiovascular distress.",
            "[]", "65 / sixty-five / 65 dB", "WHO reports document risks starting above 65 decibels.", 1300.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 4, 39, QuestionType.SentenceCompletion,
            "Green sound barriers made of dense _______ vegetation reduce street-level noise by up to 8 dB.",
            "[]", "evergreen / shrub", "Evergreen shrubs provide year-round acoustic scattering.", 1340.0));

        test.AddQuestion(new ListeningQuestion(
            test.Id, 4, 40, QuestionType.SentenceCompletion,
            "Future architecture will rely on _______ metamaterials capable of active acoustic cloaking.",
            "[]", "acoustic / smart", "Acoustic metamaterials manipulate sound wave trajectories dynamically.", 1380.0));
    }

    private static void AddSection4Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 980.0, 1005.0, "Narrator", "Section 4. You will hear an architectural engineering professor delivering a lecture on historical and contemporary acoustic design in urban environments."));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 1006.0, 1045.0, "Professor", "Good afternoon. When examining antiquity, the Greek amphitheater at Epidaurus remains remarkable: tiers of carved limestone seating act as passive acoustic filters, filtering low ambient wind noise while amplifying higher speech frequencies.", 31));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 1046.0, 1090.0, "Professor", "By the 19th century, European concert architects employed dense, porous lime plaster over brick to achieve lush acoustic resonance.", 32));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 1091.0, 1135.0, "Professor", "In modern physics, the gold standard for orchestral spaces is an RT60 reverberation time resting precisely between 1.8 and 2.2 seconds.", 33));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 1136.0, 1175.0, "Professor", "However, contemporary glass architecture introduces severe defects, particularly flutter echo created by reflection between parallel glass panels.", 34));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 1176.0, 1255.0, "Professor", "To mitigate this, engineers employ perforated timber Helmholtz resonators to trap low-frequency bass, combined with Quadratic Residue Diffusers that scatter sound evenly in multiple directions.", 35));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 1256.0, 1335.0, "Professor", "At the urban scale, intake ventilation shafts in skyscrapers are fitted with acoustic baffles. Research shows prolonged exposure above 65 decibels significantly elevates arterial hypertension.", 37));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 1336.0, 1400.0, "Professor", "Living acoustic barriers of evergreen vegetation mitigate road noise by up to 8 decibels, paving the way for revolutionary acoustic metamaterials with negative refractive indices.", 39));
    }

    #endregion

    #region Standalone Section Helper Methods

    private static void AddStandAloneSection1Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 1, QuestionType.FormCompletion, "Customer Name: Mark _______", "[]", "Vanderbilt", "Spelled V-A-N-D-E-R-B-I-L-T", 30.0));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 2, QuestionType.FormCompletion, "Contact number: 07892 _______", "[]", "445190", "Phone number provided", 55.0));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 3, QuestionType.FormCompletion, "Bicycle Type: Electric _______ bike", "[]", "cargo", "Requests electric cargo bike", 80.0));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 4, QuestionType.NoteCompletion, "Battery range on full charge: _______ km", "[]", "75 / seventy five", "Range is 75 km", 110.0));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 5, QuestionType.NoteCompletion, "Delivery fee: £_______", "[]", "12 / twelve", "Delivery cost £12", 145.0));
    }

    private static void AddStandAloneSection1Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 0.0, 25.0, "Narrator", "Section 1. You will hear an enquiry regarding electric cargo bike hire."));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 26.0, 60.0, "Agent", "Good afternoon, Riverside E-Bikes. My name is Claire.", 1));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 61.0, 120.0, "Mark", "Hi Claire, I am Mark Vanderbilt, calling about renting an electric cargo bike for a 75 km tour.", 3));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 121.0, 180.0, "Agent", "Certainly Mark! Delivery directly to your hotel will be £12.", 5));
    }

    private static void AddStandAloneSection2Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 1, QuestionType.MapLabelling, "Fern Gully Canopy Walk is located at letter _______", JsonSerializer.Serialize(new[] { "A", "B", "C", "D", "E" }), "C", "Central valley walk", 45.0));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 2, QuestionType.MapLabelling, "The Rainforest Greenhouse is located at letter _______", JsonSerializer.Serialize(new[] { "A", "B", "C", "D", "E" }), "A", "Western heated conservatory", 85.0));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 3, QuestionType.MultipleChoice, "What is the recommended footwear?", JsonSerializer.Serialize(new[] { "A. Open sandals", "B. Sturdy non-slip walking shoes", "C. Rubber boots" }), "B", "Sturdy non-slip footwear is required", 130.0));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 4, QuestionType.MultipleChoice, "Admission fee includes:", JsonSerializer.Serialize(new[] { "A. Free botanical booklet & audio guide", "B. Restaurant lunch voucher", "C. Seedling sample" }), "A", "Complimentary audio headset and booklet", 175.0));
    }

    private static void AddStandAloneSection2Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 0.0, 30.0, "Narrator", "Section 2. You will hear a tour guide welcoming visitors to the Royal Botanical Conservatory."));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 31.0, 100.0, "Guide", "G'day everyone! Looking at your trail map, point C in the central valley leads to the Fern Gully Canopy Walk.", 1));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 101.0, 160.0, "Guide", "Because path surfaces can be wet, sturdy non-slip walking shoes are highly recommended.", 3));
    }

    private static void AddStandAloneSection4Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 1, QuestionType.SentenceCompletion, "Subsea geothermal vents produce water temperatures exceeding _______ degrees Celsius.", "[]", "350 / three hundred and fifty", "Hydrothermal plumes exceed 350 degrees", 40.0));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 2, QuestionType.SentenceCompletion, "High mineral concentrations of _______ create deep-sea black smoker chimneys.", "[]", "iron sulfide / iron sulphide", "Iron sulfide precipitates create chimney spires", 90.0));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 3, QuestionType.NoteCompletion, "Thermoelectric generators convert temperature differentials into _______ power directly.", "[]", "electrical / clean", "Converts heat difference into electrical current", 140.0));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 4, QuestionType.NoteCompletion, "Current deep-sea drilling operations face extreme hydrostatic _______ of up to 400 atmospheres.", "[]", "pressure", "Hydrostatic pressure reaches 400 atm", 195.0));
    }

    private static void AddStandAloneSection4Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 0.0, 35.0, "Narrator", "Section 4. You will hear a lecture on deep ocean geothermal technology."));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 36.0, 110.0, "Lecturer", "Supercritical fluids expelled from oceanic hydrothermal vents consistently surpass 350 degrees Celsius, depositing rich iron sulfide minerals.", 1));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 111.0, 200.0, "Lecturer", "Thermoelectric solid-state modules convert this thermal differential directly into electrical energy despite 400 atmospheres of hydrostatic pressure.", 3));
    }

    #endregion
}
