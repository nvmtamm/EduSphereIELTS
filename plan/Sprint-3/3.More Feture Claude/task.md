# Sprint 3 Listening Overhaul — Task Tracker

## Phase 1: Design System & Color Overhaul
- [x] Chuẩn hoá `index.css` color tokens theo bảng màu Brand mới
- [x] Cập nhật Listening pages: CTA buttons từ blue → red brand
- [x] Cập nhật typography: JetBrains Mono cho timer/numbers
- [x] `framer-motion` đã có sẵn trong project
- [x] Tạo CSS utilities (card-spotlight, timer-critical, font-mono-exam, page transitions)
- [x] Cross-check: 0 blue references remaining in Listening module
- [x] Fix index.html body selection color → red brand
- [x] Fix PostCSS @import ordering error
- [x] Visual verification: app compiles and serves correctly

## Phase 2: AWS S3 Media Storage
- [x] Lưu AWS credentials vào `.env` backend
- [x] Install `AWSSDK.S3` NuGet package
- [x] Implement `IMediaStorageService` + `S3MediaStorageService`
- [x] Implement `MediaController` (presigned URL endpoints)
- [x] Configure S3 bucket CORS and public media read policy
- [x] Migrate 4 audio files lên S3 (verified HTTP 200 + audio/mpeg)
- [x] Cập nhật Seeder AudioUrl → S3 CDN URL (and updated live DB records)
- [x] Frontend AudioWaveformPlayer hỗ trợ S3 URL + brand red waveform

## Phase 3: Listening UI Premium Redesign
- [x] ListeningListPage → Bento Grid + animated cards + Hero Studio banner
- [x] ListeningExamPage → Authentic IELTS Exam Room (dark toolbar + CBT Question Navigation Dock)
- [x] ListeningResultPage → Animated diagnostics dashboard (smooth counter, confetti, filters)

## Phase 4: AI Features (Sprint 3.5)
- [ ] AI Post-Exam Explainer per wrong answer
- [ ] Smart Transcript-Question bi-directional linking
- [ ] Dictation Mode

## Phase 5: Cross-Sprint Consistency Audit
- [ ] Reading pages sync with new Design System
- [ ] Dashboard Listening metrics update
- [ ] 100% English UI verification
