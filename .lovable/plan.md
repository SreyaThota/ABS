# Add Concept ID + Auto-Generated Quiz

## What you'll get

After processing any learning material, each entry becomes a named **Concept** with a short readable ID (e.g. `ASYM-CRYPTO-7K2`). A **5-min quiz** is auto-generated for it — a mix of fill-in-the-blanks and MCQs — playable right from the Result page, with score tracking.

## User flow

1. Upload notes → AI processes (as today).
2. Result page now shows:
   - **Concept name** (clean title) + **Concept ID** badge (copyable, like `ASYM-CRYPTO-7K2`).
   - New **"Take 5-min Quiz"** card with question count + estimated time.
3. Tap quiz → full-screen quiz player:
   - Mix of ~6–8 questions: fill-in-the-blanks + MCQs.
   - One question per screen, progress bar, instant feedback.
   - Final score screen → "+X readiness pts", retry, back to concept.
4. Home + Career pages show "Quizzes passed" stat; readiness score increases more when you pass quizzes.

## How it works

### 1. Concept ID generation (client)
- Slug from title (first 2 meaningful words, uppercased, max 10 chars) + 3-char base36 hash → e.g. `ASYM-CRYPT-7K2`.
- Stored on `LearningEntry` as `conceptId`.

### 2. Quiz generation (new edge function `generate-quiz`)
- Input: `{ entryId, content, title, keyConcepts, profile }`.
- Calls Lovable AI (`google/gemini-2.5-flash`) with a tool-call schema:
  ```
  {
    questions: [
      { type: "fill_blank", prompt: "RSA uses ___ keys.", answer: "two", hint?: "" },
      { type: "mcq", prompt: "...", options: [4 strings], correctIndex: 0, explanation: "..." }
    ]
  }
  ```
- Generates 6–8 questions, ~50/50 mix, calibrated to learner `level`.
- Returns within ~3–5s.

### 3. State (`src/store/learning.ts`)
- Extend `LearningEntry` with: `conceptId: string`, `quiz?: Quiz`, `quizBestScore?: number`, `quizAttempts?: number`.
- New `Quiz` type with questions array.
- Actions: `attachQuiz(entryId, quiz)`, `recordQuizScore(entryId, score)` (bumps readiness +5 on first pass ≥70%).

### 4. UI changes
- **`src/pages/Result.tsx`**: Add Concept ID pill next to title (tap = copy). Add "Quiz" section card with CTA. Lazy-generate quiz on first open (loading state, then route to player).
- **New `src/pages/Quiz.tsx`**: Full-screen player. Progress bar, one Q per screen, fill-blank uses `<Input>` (case-insensitive trim match, fuzzy for typos), MCQ uses tappable cards. Final score screen.
- **New route** `/quiz/:id` in `src/App.tsx`.
- **`src/pages/Home.tsx`**: Small "Quizzes passed: N" chip.

### 5. Backend file
- New `supabase/functions/generate-quiz/index.ts` (mirrors `process-learning` structure: CORS, tool-calling, 429/402 handling). Auto-deployed.

## Out of scope (for now)
- Spaced repetition scheduling.
- Sharing concept IDs across users / public quiz library.
- Timer countdown (we show estimated time, not a hard timer — keeps it low-pressure).

Approve to build.