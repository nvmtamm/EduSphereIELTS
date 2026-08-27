# Rule: 100% English UI & Academic IELTS Standard

## Objective
All student-facing and instructor-facing User Interface (UI) components, pages, forms, modals, tables, badges, placeholders, labels, error messages, toast notifications, and copywriting across the entire EduSphere application MUST BE WRITTEN EXCLUSIVELY IN ENGLISH.

## Principles:
1. **Zero Vietnamese on Frontend UI**:
   - Never write Vietnamese sentences, labels, buttons, or placeholder text in frontend JSX/TSX files or UI templates.
   - All UI text must be in clean, professional, authentic IELTS Academic English.

2. **Pedagogical IELTS Terminology**:
   - Use official IELTS terminology (e.g. *IELTS Academic Standard*, *Band Descriptors*, *Milestone Roadmap*, *Exam Repositories & Vaults*, *Academic Vocabulary*, *AI Reading Coach*, *Target Band Score*, *Past Actual Tests*).
   - Avoid technical internal developer jargon (no `Multi-Agent`, `RAG Vector Ingestion`, `SM-2`, `Harness Core` on user screens).

3. **Consistency Across All Components**:
   - Filter dropdowns: `All Target Bands`, `All Difficulties`, `All Collections`, `Search exams, topics...`
   - Action buttons: `Start Test`, `Take Test`, `Submit Exam`, `Upload Custom Exam`, `Convert & Practice`.
   - Empty & Loading states: `Loading authentic IELTS tests...`, `No matching exams found in this vault.`
