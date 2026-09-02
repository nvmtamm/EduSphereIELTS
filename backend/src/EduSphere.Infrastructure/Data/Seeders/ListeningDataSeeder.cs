using System.Text.Json;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Data.Seeders;

public static class ListeningDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Check if database already has the updated full 70-question dataset
        var existingTestCount = await context.ListeningTests.CountAsync();
        var existingQuestionCount = await context.ListeningQuestions.CountAsync();
        if (existingTestCount == 4 && existingQuestionCount >= 70)
        {
            return;
        }

        // Wipe old incomplete seed records to refresh with full audio & full 40/10 questions
        if (existingTestCount > 0)
        {
            var oldAnswers = await context.ListeningSubmissionAnswers.ToListAsync();
            context.ListeningSubmissionAnswers.RemoveRange(oldAnswers);

            var oldSubmissions = await context.ListeningSubmissions.ToListAsync();
            context.ListeningSubmissions.RemoveRange(oldSubmissions);

            var oldTranscripts = await context.ListeningTranscripts.ToListAsync();
            context.ListeningTranscripts.RemoveRange(oldTranscripts);

            var oldQuestions = await context.ListeningQuestions.ToListAsync();
            context.ListeningQuestions.RemoveRange(oldQuestions);

            var oldSectionAudios = await context.ListeningSectionAudios.ToListAsync();
            context.ListeningSectionAudios.RemoveRange(oldSectionAudios);

            var oldTests = await context.ListeningTests.ToListAsync();
            context.ListeningTests.RemoveRange(oldTests);

            await context.SaveChangesAsync();
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
            audioUrl: "https://edusphere-nvmtamm-2026.s3.ap-southeast-1.amazonaws.com/audio/cambridge18-test1-full.mp3",
            durationSeconds: 1800,
            accent: ListeningAccent.Mixed,
            sourceType: PassageSourceType.OfficialCambridge,
            collectionName: "Cambridge IELTS 18 Academic",
            targetBandTier: TargetBandTier.Band7_0_7_5,
            instructions: "Answer all 40 questions across 4 sections. You will hear each recording ONCE only. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for completion questions.",
            audioFileSize: 1572864);

        fullTest1.AddSectionAudio(new ListeningSectionAudio(fullTest1.Id, 1, "https://edusphere-nvmtamm-2026.s3.ap-southeast-1.amazonaws.com/audio/cambridge18-test1-full.mp3", 450, "Section 1: Transport & Moving Services"));
        fullTest1.AddSectionAudio(new ListeningSectionAudio(fullTest1.Id, 2, "https://edusphere-nvmtamm-2026.s3.ap-southeast-1.amazonaws.com/audio/cambridge18-test1-full.mp3", 420, "Section 2: Community Volunteering Scheme"));
        fullTest1.AddSectionAudio(new ListeningSectionAudio(fullTest1.Id, 3, "https://edusphere-nvmtamm-2026.s3.ap-southeast-1.amazonaws.com/audio/cambridge18-test1-full.mp3", 480, "Section 3: Ocean Clean-up Project"));
        fullTest1.AddSectionAudio(new ListeningSectionAudio(fullTest1.Id, 4, "https://edusphere-nvmtamm-2026.s3.ap-southeast-1.amazonaws.com/audio/cambridge18-test1-full.mp3", 450, "Section 4: Environmental Acoustics"));

        AddSection1Questions(fullTest1);
        AddSection1Transcripts(fullTest1);

        AddSection2Questions(fullTest1);
        AddSection2Transcripts(fullTest1);

        AddSection3Questions(fullTest1);
        AddSection3Transcripts(fullTest1);

        AddSection4Questions(fullTest1);
        AddSection4Transcripts(fullTest1);

        // ==========================================
        // 2. SECTION 1 FOCUS: CUSTOMER SUPPORT & BIKE RENTAL (British Accent - 10 Questions)
        // ==========================================
        var section1Test = new ListeningTest(
            title: "Cambridge IELTS 17 — Section 1: Riverside Bicycle Rental",
            topic: "Transport & Leisure Activities",
            difficulty: DifficultyLevel.Easy,
            sectionType: ListeningSectionType.Section1_SocialDialogue,
            sectionNumber: 1,
            audioUrl: "https://edusphere-nvmtamm-2026.s3.ap-southeast-1.amazonaws.com/audio/cambridge17-test2-sec1.mp3",
            durationSeconds: 380,
            accent: ListeningAccent.British,
            sourceType: PassageSourceType.OfficialCambridge,
            collectionName: "Cambridge IELTS 17 Academic",
            targetBandTier: TargetBandTier.Band5_0_5_5,
            instructions: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.");

        AddStandAloneSection1Questions(section1Test);
        AddStandAloneSection1Transcripts(section1Test);

        // ==========================================
        // 3. SECTION 2 FOCUS: BOTANICAL GARDENS MAP (Australian Accent - 10 Questions)
        // ==========================================
        var section2Test = new ListeningTest(
            title: "Cambridge IELTS 16 — Section 2: Botanical Gardens Visitor Guide",
            topic: "Tourism & Public Amenities",
            difficulty: DifficultyLevel.Medium,
            sectionType: ListeningSectionType.Section2_SocialMonologue,
            sectionNumber: 2,
            audioUrl: "https://edusphere-nvmtamm-2026.s3.ap-southeast-1.amazonaws.com/audio/cambridge16-test3-sec2.mp3",
            durationSeconds: 420,
            accent: ListeningAccent.Australian,
            sourceType: PassageSourceType.OfficialCambridge,
            collectionName: "Cambridge IELTS 16 Academic",
            targetBandTier: TargetBandTier.Band6_0_6_5,
            instructions: "Label the plan below. Choose the correct letter, A-H, for questions 11-18. Choose the correct letter A, B, or C for questions 19-20.");

        AddStandAloneSection2Questions(section2Test);
        AddStandAloneSection2Transcripts(section2Test);

        // ==========================================
        // 4. SECTION 4 FOCUS: GEOTHERMAL ENERGY HARNESSING (American Accent - 10 Questions)
        // ==========================================
        var section4Test = new ListeningTest(
            title: "Cambridge IELTS 19 — Section 4: Geothermal Subsea Innovations",
            topic: "Renewable Energy & Geophysics",
            difficulty: DifficultyLevel.Hard,
            sectionType: ListeningSectionType.Section4_AcademicLecture,
            sectionNumber: 4,
            audioUrl: "https://edusphere-nvmtamm-2026.s3.ap-southeast-1.amazonaws.com/audio/cambridge19-test4-sec4.mp3",
            durationSeconds: 480,
            accent: ListeningAccent.American,
            sourceType: PassageSourceType.OfficialCambridge,
            collectionName: "Cambridge IELTS 19 Academic",
            targetBandTier: TargetBandTier.Band8_0_Plus,
            instructions: "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.");

        AddStandAloneSection4Questions(section4Test);
        AddStandAloneSection4Transcripts(section4Test);

        await context.ListeningTests.AddRangeAsync(fullTest1, section1Test, section2Test, section4Test);
        await context.SaveChangesAsync();
    }

    #region Full Test Helper Methods

    private static void AddSection1Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 1, QuestionType.FormCompletion, "Customer Name: Arthur _______", "[]", "Harrison", "Speaker Arthur explicitly spells his surname Harrison.", 35));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 2, QuestionType.FormCompletion, "Contact telephone: 07700 _______", "[]", "900451", "Telephone number is given as 07700 900451.", 48));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 3, QuestionType.NoteCompletion, "Preferred bike type: Electric _______ bicycle", "[]", "cargo", "Customer requests an electric cargo bike.", 68));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 4, QuestionType.FormCompletion, "Rental start date: _______ 14th", "[]", "August", "Arthur specifies Saturday August 14th.", 82));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 5, QuestionType.FormCompletion, "Duration of hire: _______ days", "[]", "3 / three", "Booking is for three consecutive days.", 95));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 6, QuestionType.FormCompletion, "Pickup location: _______ Depot", "[]", "Harbor / Harbour", "Customer will collect the bike from the Harbor Depot.", 112));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 7, QuestionType.NoteCompletion, "Included accessory: Puncture repair _______", "[]", "kit", "Standard rental includes puncture repair kit.", 130));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 8, QuestionType.NoteCompletion, "Daily insurance cost: £_______ per bicycle", "[]", "5 / five", "Optional daily collision insurance is 5 pounds.", 145));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 9, QuestionType.FormCompletion, "Security deposit amount: £_______", "[]", "50 / fifty", "Refundable security deposit is 50 pounds.", 160));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 10, QuestionType.NoteCompletion, "Return cutoff time: before _______ PM", "[]", "6:30 / 6.30 / six thirty", "All bikes must be returned before 6:30 PM.", 175));
    }

    private static void AddSection1Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 0, 20, "Agent", "Good morning! Welcome to Riverside Bicycle Hire. How can I help you today?"));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 21, 45, "Customer", "Hello! My name is Arthur Harrison. I would like to reserve a bicycle for this weekend.", 1));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 46, 60, "Agent", "Certainly, Mr. Harrison. Could I take your mobile number first? It is 07700 900451.", 2));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 61, 80, "Customer", "Yes, and I'd like an electric cargo bicycle if you have one available.", 3));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 81, 105, "Agent", "We do. We will book that for August 14th for a duration of three days.", 4));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 106, 135, "Agent", "You can pick it up at our Harbor Depot, and it comes with a helmet and puncture repair kit.", 6));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 136, 165, "Customer", "Great. Is insurance included, and how much is the security deposit?", 8));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 166, 190, "Agent", "Insurance is £5 per day, with a refundable £50 deposit. Please return it before 6:30 PM.", 9));
    }

    private static void AddSection2Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 11, QuestionType.MapLabelling, "Heritage Rose Garden location marker", "[]", "A", "Rose garden is directly to the left of the main entrance (Marker A).", 210));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 12, QuestionType.MapLabelling, "Orchid Pavilion location marker", "[]", "B", "Orchid pavilion is located along the central palm walkway (Marker B).", 230));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 13, QuestionType.MapLabelling, "Japanese Zen Rock Garden location marker", "[]", "C", "Zen garden is situated behind the glasshouse to the north (Marker C).", 250));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 14, QuestionType.MapLabelling, "Woodland Canopy Trail entrance marker", "[]", "D", "Woodland canopy trail begins to the far east (Marker D).", 270));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 15, QuestionType.MapLabelling, "Interactive Butterfly House marker", "[]", "E", "Butterfly house is near the eastern lake (Marker E).", 290));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 16, QuestionType.MapLabelling, "Palm Court Cafe location marker", "[]", "F", "Cafe is situated adjacent to the west terrace (Marker F).", 310));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 17, QuestionType.MapLabelling, "Medicinal Herbs Terrace marker", "[]", "G", "Herbs terrace is on the northwest corner (Marker G).", 330));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 18, QuestionType.MapLabelling, "Educational Lecture Theatre marker", "[]", "H", "Lecture theatre is located at Marker H.", 350));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 19, QuestionType.MultipleChoice, "Guided canopy tours depart:",
            JsonSerializer.Serialize(new[] { "A. Every 15 minutes", "B. Every hour on the half hour", "C. Twice daily at noon" }),
            "B", "Speaker specifies that guided canopy tours depart every hour on the half hour.", 370));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 20, QuestionType.MultipleChoice, "Photographic permits can be collected at:",
            JsonSerializer.Serialize(new[] { "A. The Main South Gate", "B. The Orchid Pavilion", "C. The Palm Court Cafe" }),
            "A", "Photographic passes are issued at the Main South Gate.", 390));
    }

    private static void AddSection2Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 200, 240, "Tour Guide", "Welcome to the Royal Botanical Conservatory. Look at your visitor plan. Location A is our Heritage Rose Garden, and Location B is the Orchid Pavilion.", 11));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 241, 300, "Tour Guide", "Location C is the Japanese Zen Rock Garden, and Marker D marks the Canopy Trail. Marker E is the Butterfly House.", 13));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 301, 360, "Tour Guide", "Location F is the Palm Court Cafe, G is the Medicinal Herbs terrace, and H is the Lecture Theatre.", 16));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 361, 400, "Tour Guide", "Guided canopy tours depart every hour on the half hour, and camera permits are available at the Main South Gate.", 19));
    }

    private static void AddSection3Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(test.Id, 3, 21, QuestionType.Matching, "Primary research focus of the kelp forest assignment",
            JsonSerializer.Serialize(new[] { "A. Nutrient absorption rates", "B. Acoustic sensor tracking of marine fauna", "C. Temperature fluctuation resistance" }),
            "B", "Students agree to focus their research on acoustic sensor tracking of marine fauna.", 420));
        test.AddQuestion(new ListeningQuestion(test.Id, 3, 22, QuestionType.MultipleChoice, "Why was the southern coastal reef chosen?",
            JsonSerializer.Serialize(new[] { "A. It has lower water salinity", "B. It is closest to the university lab", "C. It contains intact canopy growth" }),
            "C", "The southern reef was selected because it has preserved intact canopy growth.", 445));
        test.AddQuestion(new ListeningQuestion(test.Id, 3, 23, QuestionType.MultipleChoice, "What software tool will be used for acoustic signal processing?",
            JsonSerializer.Serialize(new[] { "A. OceanWave Pro", "B. SoundScope V3", "C. EcoSonar Lab" }),
            "A", "The group agrees to use OceanWave Pro for telemetry analysis.", 470));
        test.AddQuestion(new ListeningQuestion(test.Id, 3, 24, QuestionType.Matching, "Role assigned to Marcus for data collection",
            JsonSerializer.Serialize(new[] { "A. Calibrating hydrophone arrays", "B. Writing literature review", "C. Statistical regression analysis" }),
            "A", "Marcus is responsible for calibrating hydrophone arrays.", 495));
        test.AddQuestion(new ListeningQuestion(test.Id, 3, 25, QuestionType.Matching, "Role assigned to Elena",
            JsonSerializer.Serialize(new[] { "A. Calibrating hydrophone arrays", "B. Writing literature review", "C. Statistical regression analysis" }),
            "B", "Elena will complete the literature review.", 515));
        test.AddQuestion(new ListeningQuestion(test.Id, 3, 26, QuestionType.TableCompletion,
            JsonSerializer.Serialize(new {
                headers = new[] { "Telemetry Parameter", "Recording Frequency", "Sensor Enclosure" },
                rows = new[] {
                    new[] { "Water _______ levels", "Every 15 minutes", "Titanium casing" },
                    new[] { "Acoustic frequency", "Continuous", "Waterproof aluminum case" }
                },
                instruction = "Complete the research apparatus table below."
            }),
            "[]", "salinity", "Sensors measure ocean water salinity.", 540));
        test.AddQuestion(new ListeningQuestion(test.Id, 3, 27, QuestionType.TableCompletion,
            JsonSerializer.Serialize(new {
                headers = new[] { "Apparatus Component", "Housing Material", "Deployment Target" },
                rows = new[] {
                    new[] { "Battery power packs", "Waterproof _______ cases", "Kelp forest canopy" },
                    new[] { "Hydrophone nodes", "Reinforced polycarbonate", "Seafloor baseline" }
                },
                instruction = "Complete the apparatus housing specification table."
            }),
            "[]", "aluminum / aluminium", "Housed in waterproof aluminum cases.", 565));
        test.AddQuestion(new ListeningQuestion(test.Id, 3, 28, QuestionType.NoteCompletion, "Draft report submission deadline is _______ 28th.", "[]", "November", "Deadline is November 28th.", 590));
        test.AddQuestion(new ListeningQuestion(test.Id, 3, 29, QuestionType.NoteCompletion, "Minimum word count for final analysis section: _______ words", "[]", "2000 / 2,000 / two thousand", "Analysis section must be at least 2000 words.", 615));
        test.AddQuestion(new ListeningQuestion(test.Id, 3, 30, QuestionType.MultipleChoice, "Professor Hughes recommends including:",
            JsonSerializer.Serialize(new[] { "A. A comparative matrix of regional reefs", "B. Satellite imagery overlays", "C. Video interview transcripts" }),
            "A", "Professor Hughes explicitly recommended a comparative matrix.", 640));
    }

    private static void AddSection3Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 410, 480, "Marcus", "Elena, for our marine biology assignment, we agreed to focus on acoustic sensor tracking in the kelp forest.", 21));
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 481, 530, "Elena", "Yes, the southern reef has intact canopy growth. I will do the literature review while you calibrate the hydrophones.", 22));
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 531, 600, "Marcus", "Our sensors will record water salinity every 15 minutes, powered by waterproof aluminum battery cases before the November 28th deadline.", 26));
        test.AddTranscript(new ListeningTranscript(test.Id, 3, 601, 650, "Elena", "And remember Professor Hughes suggested a comparative matrix of regional reefs in our 2000-word analysis.", 29));
    }

    private static void AddSection4Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 31, QuestionType.NoteCompletion, "Subsea geothermal vents produce water temperatures exceeding _______ degrees Celsius.", "[]", "350 / three hundred and fifty", "Hydrothermal vents produce water over 350 degrees Celsius.", 665));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 32, QuestionType.NoteCompletion, "High mineral concentrations of _______ create deep-sea black smoker chimneys.", "[]", "copper / sulfides / copper and iron", "Black smokers are rich in copper, zinc, and iron sulfides.", 690));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 33, QuestionType.NoteCompletion, "Thermoelectric generators convert temperature differentials into _______ power directly.", "[]", "electrical / clean electrical", "Converts temperature differentials into electrical power directly.", 715));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 34, QuestionType.NoteCompletion, "Heat exchangers are constructed from high-grade _______ alloy to resist extreme pressure.", "[]", "titanium", "Constructed from titanium alloy.", 740));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 35, QuestionType.NoteCompletion, "Operational depth of experimental geothermal turbines exceeds _______ meters.", "[]", "3000 / 3,000 / three thousand", "Turbines operate at depths exceeding 3000 meters.", 765));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 36, QuestionType.NoteCompletion, "Autonomous underwater drones are equipped with _______ optic sensors to transmit telemetry.", "[]", "fiber / fibre", "Equipped with fiber optic sensors.", 790));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 37, QuestionType.NoteCompletion, "Sensor telemetry measures fluid velocity and mineral _______ rates.", "[]", "precipitation / deposit", "Telemetry records mineral precipitation rates.", 815));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 38, QuestionType.NoteCompletion, "Primary engineering challenge is corrosion caused by acidic hydrogen _______ plumes.", "[]", "sulfide / sulphide", "Caused by hydrogen sulfide plumes.", 840));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 39, QuestionType.NoteCompletion, "Turbine blades are protected with specialized _______ nano-coatings.", "[]", "ceramic", "Protected by ceramic nano-coatings.", 865));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 40, QuestionType.NoteCompletion, "Offshore subsea geothermal clusters provide continuous _______ energy without carbon emissions.", "[]", "baseload", "Delivers continuous baseload energy without emissions.", 890));
    }

    private static void AddSection4Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 660, 720, "Lecturer", "Good morning. Subsea geothermal vents along oceanic ridges produce water exceeding 350 degrees Celsius, forming black smokers rich in copper and sulfides.", 31));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 721, 780, "Lecturer", "Thermoelectric generators convert these thermal differentials into electrical power using titanium alloy exchangers at depths over 3000 meters.", 33));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 781, 840, "Lecturer", "Autonomous drones with fiber optic sensors monitor mineral precipitation rates, while ceramic coatings protect against hydrogen sulfide corrosion.", 36));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 841, 900, "Lecturer", "These innovative offshore subsea clusters can deliver clean, continuous baseload energy to power future green grids.", 40));
    }

    #endregion

    #region Standalone Section Focus Methods (10 Questions each)

    private static void AddStandAloneSection1Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 1, QuestionType.FormCompletion, "Rental price for an electric cargo bicycle: £_______ per day.", "[]", "35 / thirty-five", "Electric cargo bike rental is £35 per day.", 15));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 2, QuestionType.FormCompletion, "Daily rate for standard touring bicycle: £_______", "[]", "20 / twenty", "Standard touring bike costs £20 per day.", 25));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 3, QuestionType.FormCompletion, "Maximum cargo compartment weight limit: _______ kilograms", "[]", "45 / forty-five", "Weight limit is 45 kilograms.", 35));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 4, QuestionType.NoteCompletion, "Complimentary accessories provided: helmets and puncture _______ kits.", "[]", "repair", "Complimentary puncture repair kits are included.", 45));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 5, QuestionType.FormCompletion, "Main pick-up depot is located on _______ Lane.", "[]", "Mill", "Depot is located on Mill Lane.", 55));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 6, QuestionType.FormCompletion, "Refundable security deposit required: £_______", "[]", "50 / fifty", "Security deposit is £50.", 65));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 7, QuestionType.NoteCompletion, "All bicycles must be returned before _______ in the evening.", "[]", "6:30 / 6.30 / six thirty", "Return cutoff time is 6:30 PM.", 75));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 8, QuestionType.FormCompletion, "Customer reservation phone number: 01865 _______", "[]", "4928", "Phone number suffix is 4928.", 85));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 9, QuestionType.NoteCompletion, "Bookings exceeding 3 days receive a _______ discount.", "[]", "10% / ten percent", "10% discount on multi-day rentals.", 95));
        test.AddQuestion(new ListeningQuestion(test.Id, 1, 10, QuestionType.NoteCompletion, "Payment at collection counter is accepted by _______ only.", "[]", "card / credit card", "Card payment accepted at counter.", 105));
    }

    private static void AddStandAloneSection1Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 0, 20, "Agent", "Good morning, Riverside Bicycle Rental and Customer Support. How can I help you today?"));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 21, 40, "Customer", "Hello! What is the rental price for an electric cargo bike and a standard touring bike?", 1));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 41, 60, "Agent", "An electric cargo bike is thirty-five pounds per day, and touring bikes are twenty pounds. The cargo hold carries forty-five kilograms.", 2));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 61, 80, "Customer", "Great. Where is your depot and do you provide repair kits?", 4));
        test.AddTranscript(new ListeningTranscript(test.Id, 1, 81, 110, "Agent", "Yes, repair kits and helmets are free. We are located on Mill Lane next to the station. Security deposit is fifty pounds, and return time is six thirty PM. Call us at zero one eight six five, four nine two eight.", 5));
    }

    private static void AddStandAloneSection2Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 11, QuestionType.MapLabelling, "Heritage Rose Garden location marker", "[]", "A", "Rose garden is marked with location A.", 18));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 12, QuestionType.MapLabelling, "Orchid Pavilion location marker", "[]", "B", "Orchid pavilion is at marker B.", 30));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 13, QuestionType.MapLabelling, "Japanese Zen Rock Garden location marker", "[]", "C", "Zen rock garden is at marker C.", 42));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 14, QuestionType.MapLabelling, "Woodland Canopy Trail entrance marker", "[]", "D", "Canopy trail is at marker D.", 54));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 15, QuestionType.MapLabelling, "Interactive Butterfly House marker", "[]", "E", "Butterfly house is at marker E.", 66));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 16, QuestionType.MapLabelling, "Palm Court Cafe & Bakery marker", "[]", "F", "Cafe is at marker F.", 78));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 17, QuestionType.MapLabelling, "Medicinal Herbs Terrace marker", "[]", "G", "Herbs terrace is at marker G.", 90));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 18, QuestionType.MapLabelling, "Educational Lecture Theatre marker", "[]", "H", "Lecture theatre is at marker H.", 102));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 19, QuestionType.MultipleChoice, "Guided canopy tours depart:",
            JsonSerializer.Serialize(new[] { "A. Every 15 minutes", "B. Every hour on the half hour", "C. Twice daily at noon" }),
            "B", "Guided canopy tours depart every hour on the half hour.", 115));
        test.AddQuestion(new ListeningQuestion(test.Id, 2, 20, QuestionType.MultipleChoice, "The Heritage Gardens were first established in:",
            JsonSerializer.Serialize(new[] { "A. 1824", "B. 1856", "C. 1888" }),
            "C", "The conservatory gardens were founded in 1888.", 130));
    }

    private static void AddStandAloneSection2Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 0, 30, "Karen", "Good afternoon! Welcome to the Royal Botanical Conservatory. Look at your visitor map. Marker A is the Heritage Rose Garden, and B is the Orchid Pavilion.", 11));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 31, 70, "Karen", "Marker C is the Japanese Zen Rock Garden, D is the Canopy Trail, and E is the Butterfly House.", 13));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 71, 110, "Karen", "Marker F is the Palm Court Cafe, G is the Medicinal Herbs terrace, and H is the Lecture Theatre.", 16));
        test.AddTranscript(new ListeningTranscript(test.Id, 2, 111, 140, "Karen", "Guided canopy tours depart every hour on the half hour. Enjoy your visit!", 19));
    }

    private static void AddStandAloneSection4Questions(ListeningTest test)
    {
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 31, QuestionType.NoteCompletion, "Subsea geothermal vents produce water temperatures exceeding _______ degrees Celsius.", "[]", "350 / three hundred and fifty", "Temperatures exceed 350 degrees Celsius.", 15));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 32, QuestionType.NoteCompletion, "High mineral concentrations of _______ create deep-sea black smoker chimneys.", "[]", "copper / sulfides / copper and iron", "Black smokers are rich in copper, zinc, and iron sulfides.", 28));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 33, QuestionType.NoteCompletion, "Thermoelectric generators convert temperature differentials into _______ power directly.", "[]", "electrical / clean electrical", "Converts temperature differentials into electrical power.", 42));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 34, QuestionType.NoteCompletion, "Heat exchangers are constructed from high-grade _______ alloy to resist extreme pressure.", "[]", "titanium", "Constructed from titanium alloy.", 56));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 35, QuestionType.NoteCompletion, "Operational depth of experimental geothermal turbines exceeds _______ meters.", "[]", "3000 / 3,000 / three thousand", "Depths exceeding 3000 meters.", 70));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 36, QuestionType.NoteCompletion, "Autonomous underwater drones are equipped with _______ optic sensors to transmit telemetry.", "[]", "fiber / fibre", "Equipped with fiber optic sensors.", 84));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 37, QuestionType.NoteCompletion, "Sensor telemetry measures fluid velocity and mineral _______ rates.", "[]", "precipitation / deposit", "Telemetry records mineral precipitation rates.", 98));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 38, QuestionType.NoteCompletion, "Primary engineering challenge is corrosion caused by acidic hydrogen _______ plumes.", "[]", "sulfide / sulphide", "Caused by acidic hydrogen sulfide plumes.", 112));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 39, QuestionType.NoteCompletion, "Turbine blades are protected with specialized _______ nano-coatings.", "[]", "ceramic", "Protected by ceramic nano-coatings.", 126));
        test.AddQuestion(new ListeningQuestion(test.Id, 4, 40, QuestionType.NoteCompletion, "Offshore subsea geothermal clusters provide continuous _______ energy without carbon emissions.", "[]", "baseload", "Delivers continuous baseload energy without emissions.", 140));
    }

    private static void AddStandAloneSection4Transcripts(ListeningTest test)
    {
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 0, 35, "Samantha", "Good morning. Hydrothermal vents along oceanic ridges produce water exceeding 350 degrees Celsius, forming mineral-rich black smoker chimneys.", 31));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 36, 75, "Samantha", "Thermoelectric generators convert these thermal gradients into electrical power using titanium alloy heat exchangers at depths over 3000 meters.", 33));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 76, 115, "Samantha", "Autonomous underwater drones with fiber optic sensors transmit telemetry on fluid velocity and mineral precipitation rates, while ceramic nano-coatings mitigate hydrogen sulfide corrosion.", 36));
        test.AddTranscript(new ListeningTranscript(test.Id, 4, 116, 150, "Samantha", "Offshore subsea geothermal clusters deliver continuous baseload energy with zero carbon emissions.", 40));
    }

    #endregion
}
