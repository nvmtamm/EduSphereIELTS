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
        logger?.LogInformation("Checking Reading passages, 6 Band Roadmaps, and Vocabulary decks...");

        // =========================================================================
        // 1. SEED READING PASSAGES (Across Collections & Band Tiers)
        // =========================================================================
        var existingPassages = await context.ReadingPassages.ToListAsync();

        ReadingPassage? p1 = existingPassages.FirstOrDefault(p => p.Title.Contains("Antikythera"));
        ReadingPassage? p2 = existingPassages.FirstOrDefault(p => p.Title.Contains("Urban Agriculture"));
        ReadingPassage? p3 = existingPassages.FirstOrDefault(p => p.Title.Contains("Community Center"));
        ReadingPassage? p4 = existingPassages.FirstOrDefault(p => p.Title.Contains("Quantum Entanglement"));

        if (p1 == null)
        {
            p1 = new ReadingPassage(
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
                estimatedTimeMinutes: 20,
                sourceType: PassageSourceType.OfficialCambridge,
                collectionName: "Cambridge IELTS 18 Academic",
                targetBandTier: TargetBandTier.Band6_0_6_5);

            p1.AddQuestion(new ReadingQuestion(
                p1.Id, 1, QuestionType.MatchingHeadings,
                "Which paragraph describes the initial discovery of the shipwreck by sponge divers?",
                JsonSerializer.Serialize(new[] { "Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E" }),
                "Paragraph A",
                "Paragraph A explicitly describes Elias Stadiatis diving off the island of Antikythera in 1900 and finding the Roman shipwreck."));

            p1.AddQuestion(new ReadingQuestion(
                p1.Id, 2, QuestionType.TrueFalseNotGiven,
                "Elias Stadiatis was actively searching for ancient Roman artefacts when he found the shipwreck.",
                JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
                "FALSE",
                "Paragraph A states he plunged into the depths to search for sponges, not ancient artefacts."));

            context.ReadingPassages.Add(p1);
        }

        if (p2 == null)
        {
            p2 = new ReadingPassage(
                title: "Urban Agriculture and the Future of Food Supply",
                topic: "Environment & Urban Planning",
                difficulty: DifficultyLevel.Hard,
                content: @"### Paragraph A
By the year 2050, the global human population is projected to swell beyond 9.8 billion individuals, with an estimated 68 percent residing within dense metropolitan areas. Meeting the caloric and nutritional demands of this demographic expansion poses a formidable dilemma: conventional horizontal agriculture currently occupies nearly 38 percent of the Earth's terrestrial landmass and accounts for 70 percent of global freshwater withdrawals. As arable topsoil undergoes accelerated degradation from intensive monoculture and climate disruptions, agronomists and urban planners are pioneering Controlled-Environment Agriculture (CEA), most prominently in the form of vertical indoor farming.

### Paragraph B
Vertical farming departs radically from traditional agrarian methods by stacking crop cultivation shelves vertically inside retrofitted skyscrapers, shipping containers, and purpose-built warehouses. These closed-loop systems leverage hydroponic and aeroponic technologies. Hydroponics cultivates plants in mineral-rich aqueous solutions without soil, while aeroponics suspends plant roots in enclosed chambers misted periodically with nutrient-dense aerosols, consuming up to 95 percent less water than open-field cultivation. Furthermore, by substituting sunlight with solid-state LED fixtures emitting tailored photosynthetic wavelengths, growers can optimize photosynthetic efficiency and accelerate crop maturation cycles.

### Paragraph C
The environmental benefits of CEA extend beyond water conservation. Traditional open-field supply chains are notoriously carbon-intensive, requiring perishable produce to be chilled and transported across transcontinental freight corridors—often dubbed 'food miles'—before reaching consumer tables. By placing vertical farms within urban centres, transportation emissions are drastically curtailed, and post-harvest spoilage is almost entirely mitigated. Additionally, the hermetically sealed environments eliminate the necessity for synthetic chemical pesticides and herbicides, protecting municipal waterways from toxic agricultural run-off.",
                estimatedTimeMinutes: 20,
                sourceType: PassageSourceType.OfficialCambridge,
                collectionName: "Cambridge IELTS 19 Academic",
                targetBandTier: TargetBandTier.Band7_0_7_5);

            p2.AddQuestion(new ReadingQuestion(
                p2.Id, 1, QuestionType.MultipleChoice,
                "According to Paragraph A, what percentage of the world's population is expected to live in cities by 2050?",
                JsonSerializer.Serialize(new[] { "A) 38 percent", "B) 70 percent", "C) 68 percent", "D) 95 percent" }),
                "C) 68 percent",
                "Paragraph A states: 'with an estimated 68 percent residing within dense metropolitan areas'."));

            p2.AddQuestion(new ReadingQuestion(
                p2.Id, 2, QuestionType.TrueFalseNotGiven,
                "Vertical farms require significantly more synthetic pesticides than open-field farms.",
                JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
                "FALSE",
                "Paragraph C states the hermetically sealed environments eliminate the necessity for synthetic chemical pesticides."));

            context.ReadingPassages.Add(p2);
        }

        if (p3 == null)
        {
            p3 = new ReadingPassage(
                title: "Community Center Activities Schedule",
                topic: "Everyday Life & Society",
                difficulty: DifficultyLevel.Easy,
                content: @"### Paragraph A
The Greenhill Community Center offers a variety of educational and recreational programs for residents of all ages. Open seven days a week from 8:00 AM to 9:00 PM, the center features a modern library, swimming pool, art studio, and sports hall.

### Paragraph B
Every Tuesday and Thursday morning, free English language conversation classes are held for international newcomers. On weekends, the center hosts cooking workshops and junior chess tournaments. Members can book rooms online with their library card.",
                estimatedTimeMinutes: 10,
                sourceType: PassageSourceType.PublisherSeries,
                collectionName: "Foundation Beginner Deck",
                targetBandTier: TargetBandTier.PreIelts);

            p3.AddQuestion(new ReadingQuestion(
                p3.Id, 1, QuestionType.MultipleChoice,
                "What time does the Greenhill Community Center open every day?",
                JsonSerializer.Serialize(new[] { "A) 7:00 AM", "B) 8:00 AM", "C) 9:00 AM", "D) 10:00 AM" }),
                "B) 8:00 AM",
                "Paragraph A states: 'Open seven days a week from 8:00 AM to 9:00 PM'."));

            context.ReadingPassages.Add(p3);
        }

        if (p4 == null)
        {
            p4 = new ReadingPassage(
                title: "Quantum Entanglement and Modern Encryption Protocols",
                topic: "Quantum Physics & Cryptography",
                difficulty: DifficultyLevel.Hard,
                content: @"### Paragraph A
Quantum key distribution (QKD) represents an unprecedented paradigm shift in information security. By exploiting the fundamental tenets of quantum mechanics—specifically Heisenberg's uncertainty principle and Einstein-Podolsky-Rosen (EPR) entanglement—cryptographers can generate cryptographic keys whose secrecy is guaranteed by the laws of physics rather than computational intractability.

### Paragraph B
In a typical entangled photon protocol, any eavesdropping attempt inevitably collapses the quantum wave function, introducing detectable perturbations. Consequently, legitimate communicating parties can quantify the quantum bit error rate (QBER) and instantly abort the transmission if anomalous interception is detected.",
                estimatedTimeMinutes: 20,
                sourceType: PassageSourceType.PastActualTest,
                collectionName: "IELTS Past Actual Tests 2025",
                targetBandTier: TargetBandTier.Band8_0_Plus);

            p4.AddQuestion(new ReadingQuestion(
                p4.Id, 1, QuestionType.TrueFalseNotGiven,
                "Quantum key distribution security is established on computational mathematical difficulty.",
                JsonSerializer.Serialize(new[] { "TRUE", "FALSE", "NOT GIVEN" }),
                "FALSE",
                "Paragraph A explains QKD secrecy is guaranteed by the laws of physics, NOT by computational intractability."));

            context.ReadingPassages.Add(p4);
        }

        await context.SaveChangesAsync();

        // =========================================================================
        // 2. SEED 6 BAND ROADMAPS & MILESTONES
        // =========================================================================
        if (!await context.BandRoadmaps.AnyAsync())
        {
            // 1. Pre-IELTS
            var preRoadmap = new BandRoadmap(
                TargetBandTier.PreIelts,
                "Pre-IELTS (Band 0 – 3.5): Essential Foundation",
                "Build sentence comprehension fundamentals, master basic verb tenses, and learn to locate key nouns and verbs in short everyday texts.",
                "Basic S+V+O Syntax, Noun/Verb Keyword Location, Everyday Life Vocabulary (A1-A2)",
                4, 500);
            preRoadmap.AddMilestone(new BandMilestone(preRoadmap.Id, 1, "Everyday Life & Simple Notices", "Locating numbers and proper nouns in short paragraphs", "Reading simple timetables", p3?.Id, 65.0f));
            preRoadmap.AddMilestone(new BandMilestone(preRoadmap.Id, 2, "Basic Chronology & Sequencing", "Understanding time words (first, next, then, finally)", "Sequencing events", null, 70.0f));
            preRoadmap.AddMilestone(new BandMilestone(preRoadmap.Id, 3, "Multiple Choice Fundamentals", "Eliminating obviously wrong single options", "Option elimination", null, 70.0f));
            preRoadmap.AddMilestone(new BandMilestone(preRoadmap.Id, 4, "Foundation Level Assessment", "Comprehensive review test before stepping into Band 4.0", "Pre-IELTS graduation test", null, 75.0f));

            // 2. Band 4.0 - 4.5
            var band4Roadmap = new BandRoadmap(
                TargetBandTier.Band4_0_4_5,
                "Band 4.0 – 4.5: Scanning & Skimming Bootcamp",
                "Master fast skimming for main ideas within 45 seconds and precision scanning for dates, metrics, and names across short academic passages.",
                "Skimming 45s, Scanning Metrics & Dates, Topic Sentence Identification, Basic Synonyms",
                4, 600);
            band4Roadmap.AddMilestone(new BandMilestone(band4Roadmap.Id, 1, "Skimming Topic Sentences", "Finding the primary thesis in Paragraph 1 and concluding remarks", "Skimming fundamentals", null, 70.0f));
            band4Roadmap.AddMilestone(new BandMilestone(band4Roadmap.Id, 2, "Scanning Numbers & Metrics", "Precision eye-tracking for measurement units and country names", "Scanning numerical data", null, 75.0f));
            band4Roadmap.AddMilestone(new BandMilestone(band4Roadmap.Id, 3, "Short Answer Word Limits", "Adhering to 'NO MORE THAN TWO WORDS' constraints", "Short answer practice", null, 75.0f));
            band4Roadmap.AddMilestone(new BandMilestone(band4Roadmap.Id, 4, "Band 4.5 Milestone Benchmark", "Timed 15-minute challenge on a 500-word passage", "Band 4.5 final test", null, 80.0f));

            // 3. Band 5.0 - 5.5
            var band5Roadmap = new BandRoadmap(
                TargetBandTier.Band5_0_5_5,
                "Band 5.0 – 5.5: True / False / Not Given & Paraphrase Anchor",
                "Thoroughly distinguish between FALSE (contradiction) and NOT GIVEN (absence of fact), handle word-class paraphrasing (verb-to-noun), and master Note Completion.",
                "FALSE vs NOT GIVEN Logic, Part-of-speech Transformations, Table/Note Completion",
                5, 800);
            band5Roadmap.AddMilestone(new BandMilestone(band5Roadmap.Id, 1, "Dissecting FALSE vs. NOT GIVEN", "Eliminating false assumptions when textual evidence is absent", "TFNG logic master", p1?.Id, 75.0f));
            band5Roadmap.AddMilestone(new BandMilestone(band5Roadmap.Id, 2, "Paraphrasing Keyword Anchors", "Matching synonyms across environmental and conservation texts", "Synonym anchoring", null, 75.0f));
            band5Roadmap.AddMilestone(new BandMilestone(band5Roadmap.Id, 3, "Note and Diagram Completion", "Transferring exact words from technical diagrams into answer blanks", "Diagram labeling", null, 80.0f));
            band5Roadmap.AddMilestone(new BandMilestone(band5Roadmap.Id, 4, "Summary Completion without a Word Box", "Locating paragraph clusters and grammar agreement in summaries", "Summary filling", null, 80.0f));
            band5Roadmap.AddMilestone(new BandMilestone(band5Roadmap.Id, 5, "Standard Passage 1 Timed Test", "Achieving 11+/13 correct on Cambridge standard Passage 1", "Passage 1 trial", null, 85.0f));

            // 4. Band 6.0 - 6.5
            var band6Roadmap = new BandRoadmap(
                TargetBandTier.Band6_0_6_5,
                "Band 6.0 – 6.5: Matching Headings & Information Traps",
                "Conquer Matching Headings by rejecting superficial keyword distractors, master Summary Completion with a box of synonyms, and optimize pacing to under 18 minutes per passage.",
                "Matching Headings (Central Themes), Eliminating Distractors, Boxed Summary Completion, Speed Pacing",
                5, 1000);
            band6Roadmap.AddMilestone(new BandMilestone(band6Roadmap.Id, 1, "Dissecting Central Paragraph Themes", "Identifying heading summaries vs. isolated paragraph examples", "Headings mastery", p1?.Id, 75.0f));
            band6Roadmap.AddMilestone(new BandMilestone(band6Roadmap.Id, 2, "Matching Information to Paragraphs [A-G]", "Scanning across dispersed paragraphs without reading line-by-line", "Information matching", null, 75.0f));
            band6Roadmap.AddMilestone(new BandMilestone(band6Roadmap.Id, 3, "Summary Completion with Synonyms Box", "Selecting abstract synonyms from a predefined word bank (A-H)", "Box summary", null, 80.0f));
            band6Roadmap.AddMilestone(new BandMilestone(band6Roadmap.Id, 4, "Passage 2 Time Pressure (< 18 mins)", "Completing 13 questions with high accuracy under strict timer", "Timed passage 2", null, 80.0f));
            band6Roadmap.AddMilestone(new BandMilestone(band6Roadmap.Id, 5, "Band 6.5 Mastery Checkpoint", "Full Passage 2 simulation from Cambridge 18 Academic", "Cambridge 18 checkpoint", null, 85.0f));

            // 5. Band 7.0 - 7.5
            var band7Roadmap = new BandRoadmap(
                TargetBandTier.Band7_0_7_5,
                "Band 7.0 – 7.5: Academic Nuances & Speed Mastery",
                "Master multi-clause complex sentences, grammatical inversions, subtle negative traps, and author attitude identification with an optimal reading speed of 250-300 wpm.",
                "Complex Inversions, Author Tone (Critical/Sceptical), Implicit Nuances, Advanced Paraphrasing",
                5, 1200);
            band7Roadmap.AddMilestone(new BandMilestone(band7Roadmap.Id, 1, "Scientific Discourse & Negative Traps", "Overcoming implicit negative modifiers (rarely, seldom, fail to, overlook)", "Negative traps", p2?.Id, 75.0f));
            band7Roadmap.AddMilestone(new BandMilestone(band7Roadmap.Id, 2, "Technological Archaeology & Features Matching", "Matching Features across multi-researcher historical texts", "Features matching", null, 80.0f));
            band7Roadmap.AddMilestone(new BandMilestone(band7Roadmap.Id, 3, "Advanced Yes/No/Not Given Claims", "Differentiating author opinion vs. external empirical evidence", "YNNG claims", null, 80.0f));
            band7Roadmap.AddMilestone(new BandMilestone(band7Roadmap.Id, 4, "Matching Headings under 16 Minutes", "Time pressure optimization & paragraph thesis synthesis", "Fast headings", null, 85.0f));
            band7Roadmap.AddMilestone(new BandMilestone(band7Roadmap.Id, 5, "Full Cambridge Academic Challenge", "Simulated exam conditions (3 passages, 40 questions, Band 7.5+ benchmark)", "Cambridge 19 test", null, 85.0f));

            // 6. Band 8.0 - 8.5+
            var band8Roadmap = new BandRoadmap(
                TargetBandTier.Band8_0_Plus,
                "Band 8.0 – 8.5+: Philosophical Subtexts & 9.0 Perfectionist",
                "Decode highly abstract philosophical and scientific treatises, catch subtle irony and implicit inferences, and achieve 38-40/40 under 50 minutes.",
                "Implicit Inference, Philosophical Abstractions, High-speed Scholarly Analysis, 9.0 Perfection",
                5, 1500);
            band8Roadmap.AddMilestone(new BandMilestone(band8Roadmap.Id, 1, "Epistemological & Philosophical Inferences", "Inferring unstated author beliefs from academic rhetoric", "Epistemological inferences", p4?.Id, 85.0f));
            band8Roadmap.AddMilestone(new BandMilestone(band8Roadmap.Id, 2, "Scientific Complexity in Passage 3", "Navigating quantum computing and relativistic mechanics texts", "Quantum comprehension", null, 85.0f));
            band8Roadmap.AddMilestone(new BandMilestone(band8Roadmap.Id, 3, "Multiple Choice Multi-Select Multi-Distractors", "Dissecting 5-option questions with 2 nuanced correct choices", "Multi-distractor elimination", null, 90.0f));
            band8Roadmap.AddMilestone(new BandMilestone(band8Roadmap.Id, 4, "Past Actual Test Hard Passages (2025/2026)", "Official IDP/British Council hard examination passages", "Past actual tests", null, 90.0f));
            band8Roadmap.AddMilestone(new BandMilestone(band8Roadmap.Id, 5, "The Grand Band 9.0 Perfectionist Challenge", "Complete full 3-passage 40-question exam with 39-40 correct", "9.0 perfection exam", null, 95.0f));

            context.BandRoadmaps.AddRange(preRoadmap, band4Roadmap, band5Roadmap, band6Roadmap, band7Roadmap, band8Roadmap);
            await context.SaveChangesAsync();
        }

        // =========================================================================
        // 3. SEED DEDICATED VOCABULARIES (Across Band Tiers)
        // =========================================================================
        if (!await context.BandVocabularies.AnyAsync())
        {
            var vocabList = new List<BandVocabulary>
            {
                // Pre-IELTS
                new(TargetBandTier.PreIelts, "Routine", "/ruːˈtiːn/", "Thói quen hàng ngày, trình tự công việc cố định.", "Noun", "A1", "My daily morning routine includes exercising.", JsonSerializer.Serialize(new[] { "daily routine", "follow a routine" }), JsonSerializer.Serialize(new[] { "habit", "schedule" })),
                new(TargetBandTier.PreIelts, "Discover", "/dɪˈskʌv.ər/", "Khám phá ra, tìm thấy lần đầu tiên.", "Verb", "A2", "Scientists discovered a new species in the rainforest.", JsonSerializer.Serialize(new[] { "discover new facts", "discover the truth" }), JsonSerializer.Serialize(new[] { "find", "uncover" })),
                new(TargetBandTier.PreIelts, "Pollution", "/pəˈluː.ʃən/", "Sự ô nhiễm môi trường đất, nước hoặc không khí.", "Noun", "A2", "Air pollution is a serious problem in modern big cities.", JsonSerializer.Serialize(new[] { "air pollution", "water pollution" }), JsonSerializer.Serialize(new[] { "contamination", "smog" })),

                // Band 4.0 - 4.5
                new(TargetBandTier.Band4_0_4_5, "Significant", "/sɪɡˈnɪf.ɪ.kənt/", "Quan trọng, có ý nghĩa lớn, đáng chú ý.", "Adjective", "B1", "There has been a significant increase in renewable energy.", JsonSerializer.Serialize(new[] { "significant change", "significant difference" }), JsonSerializer.Serialize(new[] { "important", "notable" })),
                new(TargetBandTier.Band4_0_4_5, "Demonstrate", "/ˈdem.ən.streɪt/", "Chứng minh, chỉ ra rõ ràng qua bằng chứng.", "Verb", "B1", "The experiments demonstrate that the formula is effective.", JsonSerializer.Serialize(new[] { "demonstrate ability", "clearly demonstrate" }), JsonSerializer.Serialize(new[] { "show", "prove" })),

                // Band 5.0 - 5.5
                new(TargetBandTier.Band5_0_5_5, "Conservation", "/ˌkɒn.səˈveɪ.ʃən/", "Sự bảo tồn tài nguyên thiên nhiên hoặc di sản.", "Noun", "B1", "Wildlife conservation projects protect endangered species.", JsonSerializer.Serialize(new[] { "wildlife conservation", "energy conservation" }), JsonSerializer.Serialize(new[] { "preservation", "protection" })),
                new(TargetBandTier.Band5_0_5_5, "Contradict", "/ˌkɒn.trəˈdɪkt/", "Mâu thuẫn, trái ngược trực tiếp (Chìa khóa bẫy FALSE trong TFNG).", "Verb", "B1", "The latest findings contradict earlier assumptions.", JsonSerializer.Serialize(new[] { "directly contradict", "contradict evidence" }), JsonSerializer.Serialize(new[] { "oppose", "conflict with" })),

                // Band 6.0 - 6.5
                new(TargetBandTier.Band6_0_6_5, "Phenomenon", "/fəˈnɒm.ɪ.nən/", "Hiện tượng tự nhiên hoặc xã hội đáng chú ý.", "Noun", "B2", "Urban heat islands represent a meteorological phenomenon.", JsonSerializer.Serialize(new[] { "natural phenomenon", "widespread phenomenon" }), JsonSerializer.Serialize(new[] { "occurrence", "event" })),
                new(TargetBandTier.Band6_0_6_5, "Biomimetic", "/ˌbaɪ.əʊ.mɪˈmet.ɪk/", "Phỏng sinh học (Mô phỏng cơ chế tự nhiên vào robot/kỹ thuật).", "Adjective", "B2", "Engineers developed biomimetic drones inspired by dragonflies.", JsonSerializer.Serialize(new[] { "biomimetic design", "biomimetic robotics" }), JsonSerializer.Serialize(new[] { "nature-inspired", "bionic" })),

                // Band 7.0 - 7.5
                new(TargetBandTier.Band7_0_7_5, "Ubiquitous", "/juːˈbɪk.wɪ.təs/", "Có mặt ở khắp mọi nơi cùng một lúc.", "Adjective", "C1", "Smartphones have become ubiquitous across modern urban society.", JsonSerializer.Serialize(new[] { "ubiquitous presence", "ubiquitous phenomenon" }), JsonSerializer.Serialize(new[] { "omnipresent", "pervasive" })),
                new(TargetBandTier.Band7_0_7_5, "Empirical", "/ɪmˈpɪr.ɪ.kəl/", "Dựa trên thực nghiệm và quan sát thực tế.", "Adjective", "C1", "Researchers gathered empirical evidence to substantiate the hypothesis.", JsonSerializer.Serialize(new[] { "empirical evidence", "empirical study" }), JsonSerializer.Serialize(new[] { "observational", "experimental" })),
                new(TargetBandTier.Band7_0_7_5, "Exacerbate", "/ɪɡˈzæs.ə.beɪt/", "Làm trầm trọng thêm một tình trạng đã tồi tệ.", "Verb", "C1", "Rapid deforestation exacerbates global warming.", JsonSerializer.Serialize(new[] { "exacerbate the problem", "further exacerbate" }), JsonSerializer.Serialize(new[] { "worsen", "aggravate" })),

                // Band 8.0 - 8.5+
                new(TargetBandTier.Band8_0_Plus, "Epistemological", "/ɪˌpɪs.tə.məˈlɒdʒ.ɪ.kəl/", "Thuộc về nhận thức luận (Bản chất và giới hạn của tri thức).", "Adjective", "C2", "Generative AI raises profound epistemological questions.", JsonSerializer.Serialize(new[] { "epistemological framework", "epistemological premise" }), JsonSerializer.Serialize(new[] { "philosophical", "theoretical" })),
                new(TargetBandTier.Band8_0_Plus, "Dichotomy", "/daɪˈkɒt.ə.mi/", "Sự phân đôi, đối lập lưỡng phân hoàn toàn.", "Noun", "C2", "The author challenges the false dichotomy between growth and conservation.", JsonSerializer.Serialize(new[] { "false dichotomy", "sharp dichotomy" }), JsonSerializer.Serialize(new[] { "division", "polarization" })),
                new(TargetBandTier.Band8_0_Plus, "Serendipitous", "/ˌser.ənˈdɪp.ɪ.təs/", "Tình cờ may mắn phát hiện điều tuyệt vời mà không định trước.", "Adjective", "C2", "The discovery of penicillin was a famously serendipitous breakthrough.", JsonSerializer.Serialize(new[] { "serendipitous discovery", "serendipitous event" }), JsonSerializer.Serialize(new[] { "fortuitous", "accidental" }))
            };

            context.BandVocabularies.AddRange(vocabList);
            await context.SaveChangesAsync();
        }

        logger?.LogInformation("Successfully seeded 6 Band Roadmaps, dedicated Vocabulary Decks, and Passages.");
    }
}
