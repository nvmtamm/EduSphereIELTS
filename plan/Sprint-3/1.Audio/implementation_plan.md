# Plan: Fix IELTS Listening Audio Playback & Complete 40-Question Datasets

## Problem Summary
1. **No Audio Playing:** The external Archive.org audio URLs (`https://ia801503.us.archive.org/...`) return HTTP 404 (dead links), preventing `wavesurfer.js` from decoding and playing the audio.
2. **Incomplete Questions:** Single-section practice tests in `ListeningDataSeeder.cs` (e.g. Cambridge 19 Section 4) only have 4–5 sample questions instead of the standard **10 questions per section**, and the database currently holds the old seed records.

---

## User Review Required

> [!IMPORTANT]
> **Key Decisions & Proposed Fixes:**
> 1. **Self-Hosted Audio Files (Zero Dead Links & Fast Streaming):**
>    - Generate native high-clarity spoken audio recordings for all 4 Cambridge Listening tests using authentic native accents:
>      - 🇬🇧 British Accent (`Daniel`, en_GB) for Section 1 (Riverside Bike Rental) & Section 3.
>      - 🇦🇺 Australian Accent (`Karen`, en_AU) for Section 2 (Botanical Gardens Guide).
>      - 🇺🇸 American Accent (`Samantha`, en_US) for Section 4 (Geothermal Energy Lecture).
>      - 🌐 Mixed Accents for the Full 40-Question Exam (Cambridge 18 Test 1).
>    - Convert to web-standard `.mp3` / `.wav` audio files and host directly under `frontend/public/audio/` and `backend/src/EduSphere.API/wwwroot/audio/`.
> 2. **Complete 100% Official Question Sets in Backend Seeder:**
>    - **Cambridge IELTS 18 Test 1:** Full 40-Question Exam (Questions 1–40 across Part 1, Part 2, Part 3, Part 4).
>    - **Cambridge IELTS 17 Section 1:** Complete 10 Questions (Questions 1–10: Form & Note Completion).
>    - **Cambridge IELTS 16 Section 2:** Complete 10 Questions (Questions 11–20: Map Labelling & Multiple Choice).
>    - **Cambridge IELTS 19 Section 4:** Complete 10 Questions (Questions 31–40: Sentence & Table Completion).
> 3. **Database Re-Seeding:**
>    - Wipe and re-seed `ListeningTests`, `ListeningQuestions`, and `ListeningTranscripts` in SQL Server so the full questions and working audio URLs immediately appear on the frontend.

---

## Proposed Changes

### 1. Audio Generation & Local Hosting

#### [NEW] [frontend/public/audio/cambridge18-test1-full.mp3](file:///Users/nguyenvanminhtam/EduSphere/frontend/public/audio/cambridge18-test1-full.mp3)
- Full 4-part simulation audio with mixed British, Australian, and American voices.

#### [NEW] [frontend/public/audio/cambridge17-test2-sec1.mp3](file:///Users/nguyenvanminhtam/EduSphere/frontend/public/audio/cambridge17-test2-sec1.mp3)
- Part 1 dialogue (British accent).

#### [NEW] [frontend/public/audio/cambridge16-test3-sec2.mp3](file:///Users/nguyenvanminhtam/EduSphere/frontend/public/audio/cambridge16-test3-sec2.mp3)
- Part 2 monologue (Australian accent).

#### [NEW] [frontend/public/audio/cambridge19-test4-sec4.mp3](file:///Users/nguyenvanminhtam/EduSphere/frontend/public/audio/cambridge19-test4-sec4.mp3)
- Part 4 academic lecture (American accent).

---

### 2. Backend Seeder (`EduSphere.Infrastructure`)

#### [MODIFY] [ListeningDataSeeder.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Infrastructure/Data/Seeders/ListeningDataSeeder.cs)
- Expand `AddStandAloneSection1Questions`: 10 full questions (Q1–10) + transcripts.
- Expand `AddStandAloneSection2Questions`: 10 full questions (Q11–20) + transcripts.
- Expand `AddStandAloneSection4Questions`: 10 full questions (Q31–40) + transcripts.
- Update all `AudioUrl` values to `/audio/cambridge...mp3`.
- Add auto-cleanup logic to overwrite and refresh old incomplete seed records in SQL Server.

---

### 3. Frontend Audio Player & Exam Page (`frontend/src/features/listening`)

#### [MODIFY] [AudioWaveformPlayer.tsx](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/components/AudioWaveformPlayer.tsx)
- Ensure relative audio URLs (`/audio/...`) load cleanly in both local dev server and production.
- Add error recovery and auto-retry for audio decoding.

---

## Verification Plan

### Automated Tests
- Run `dotnet test backend/EduSphere.sln` to ensure all 84 unit tests pass.
- Run `npm run build` in `frontend/` to ensure zero compilation errors.

### Manual / Browser Verification
1. Restart Backend and Frontend.
2. Check `GET http://localhost:5005/api/listening/tests` returns all tests with 10 questions per section and 40 questions for full test.
3. Open `http://localhost:5173/listening/exam/:id`:
   - Verify the audio waveform renders and wavesurfer displays sound peaks.
   - Click Play and verify audio sounds clearly with British / Australian / American speech.
   - Verify question palette shows all 10 (or 40) questions.
   - Verify transcript highlights synchronized with audio playback.
