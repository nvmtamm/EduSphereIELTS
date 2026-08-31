# Sprint 3 Critical Features — Implementation Task List

## F-01 · Single-Play Audio Constraint ✅ COMPLETED
- [x] **Frontend** — `AudioWaveformPlayer.tsx`: added `singlePlayMode`, `hasFinished` state + locked controls and warning overlay on `finish`
- [x] **Frontend** — `ListeningExamPage.tsx`: passed `singlePlayMode={test.isOfficialExamMode}` to `AudioWaveformPlayer`
- [x] **Backend** — `ListeningTestDetailDto.cs`: added `IsOfficialExamMode` field
- [x] **Backend** — `GetListeningTestByIdQuery.cs`: mapped `IsOfficialExamMode` field (true for OfficialCambridge tests)
- [x] **Frontend** — `listening.ts`: added `isOfficialExamMode` to `ListeningTestDetail`

## F-02 · Exam Session Persistence (Reload-Safe) ✅ COMPLETED
- [x] **Frontend (NEW)** — `hooks/useListeningSessionPersist.ts`: serialize/deserialize full exam state (answers, markedQuestions, timer, question index)
- [x] **Frontend** — `ListeningExamTimer.tsx`: added `initialSecondsRemaining` and `onTick` callback props to support seamless resuming
- [x] **Frontend** — `ListeningExamPage.tsx`: integrated session persistence hook, added "Resume Session" top banner, and auto-cleaned up on submit

## F-03 · TableCompletionRenderer ✅ COMPLETED
- [x] **Frontend (NEW)** — `renderers/TableCompletionRenderer.tsx`: parses JSON structured table prompts with headers, rows, and inline input blanks `___`, with active question cell highlighting
- [x] **Frontend** — `ListeningExamPage.tsx`: added `TableCompletion` case to question renderer switch
- [x] **Backend** — `ListeningDataSeeder.cs`: seeded sample TableCompletion questions for Section 3

## F-04 · Multi-Audio Full Test (4 Section Audios) ✅ COMPLETED
- [x] **Backend (NEW)** — `Domain/Entities/ListeningSectionAudio.cs`: created entity with test relation, section number, audio URL, duration
- [x] **Backend** — `ListeningTest.cs`: added `SectionAudios` collection + `AddSectionAudio` domain method
- [x] **Backend (NEW)** — `Infrastructure/Configurations/ListeningSectionAudioConfiguration.cs`: EF Core table mapping and index configuration
- [x] **Backend** — `ListeningConfigurations.cs`: added `HasMany(t => t.SectionAudios)` relationship
- [x] **Backend** — `ApplicationDbContext.cs` & `IApplicationDbContext.cs`: added `ListeningSectionAudios` DbSet
- [x] **Backend** — `ListeningTestDetailDto.cs`: added `SectionAudios` list + `ListeningSectionAudioDto` record
- [x] **Backend** — `GetListeningTestByIdQuery.cs`: included `.Include(t => t.SectionAudios)` and mapped in DTO
- [x] **Backend** — `ListeningDataSeeder.cs`: seeded 4 section audio files for Cambridge 18 Test 1
- [x] **Frontend** — `listening.ts`: added `ListeningSectionAudio` interface + updated `ListeningTestDetail`
- [x] **Frontend** — `AudioWaveformPlayer.tsx`: added multi-audio URL support with auto-advance and section tabs (S1–S4)
- [x] **Frontend** — `ListeningExamPage.tsx`: passed multi-audio URLs array to `AudioWaveformPlayer`
- [x] **Tests** — `ListeningSectionAudioTests.cs`: added 4 new unit tests covering domain entity and collection (88/88 tests passed)

