# Auto-Quiz + Personalized Career Chat Coach

Two additions to make the app feel like a true career mentor:

## 1. Auto-generate the quiz right after the summary

Right now, after upload → summary, the user has to tap "Take 5-min quiz" and wait for it to generate. We'll generate the quiz **automatically in the background** as soon as the summary is created, so when the user lands on the Result page the quiz is already ready (or finishing up).

**Changes:**
- `src/pages/Upload.tsx` — after `addEntry(...)` succeeds and we have an `entry.id`, fire a non-blocking call to `generate-quiz` and `attachQuiz(entry.id, ...)` when it returns. We still navigate to Result immediately so the user isn't blocked.
- `src/pages/Result.tsx` — quiz CTA card shows three states:
  - **Generating…** (spinner + "Building your quiz…") — disabled, tap is a no-op
  - **Ready** (Brain icon + "Take 5-min quiz · N questions")
  - **Retake** (with best score)
- If the background generation fails silently, the existing on-demand `startQuiz()` still works as a fallback.

## 2. Personalized Career Chat Coach

A new chat screen where the user can ask things like:
- *"Am I a good fit for a Data Scientist role?"*
- *"What should I learn next to become a Security Analyst?"*
- *"Which of my concepts apply to my target career?"*
- *"What's missing from my resume for this role?"*

The coach answers using **(a) the learner's profile** (target career, level, stage, interests) and **(b) every concept they've uploaded** (titles, summaries, skills, careerRoles, quiz pass status). So replies are grounded in *their* actual learning — not generic advice.

### User flow
- New "Coach" tab in the bottom nav (replacing/joining nav as a 5th icon).
- Tap → `/chat` screen: clean message thread (user bubbles right, coach bubbles left), input at bottom, streaming responses with markdown rendering.
- Welcome message suggests 3 starter questions tailored to their profile (e.g. *"Am I ready for {targetCareer}?"*, *"What skills am I missing?"*, *"Pick my next concept"*).
- Conversation persists in memory for the session (not stored in DB — keeps it private + simple).

### Backend (new edge function `career-chat`)
- Streams responses (SSE) from Lovable AI (`google/gemini-2.5-flash`).
- System prompt = **"You are CareerOS Coach"** + injected context block:
  ```
  LEARNER PROFILE: name, stage, target career, level, interests
  LEARNING HISTORY (N concepts):
    1. {title} [{conceptId}] — skills: ..., maps to: ..., quiz: passed/not taken
       summary: ...
    2. ...
  ```
- Coach behavior rules baked in: be honest about gaps, cite specific concept IDs when relevant, give concrete next steps, never make up skills the user doesn't have, calibrate tone to their level.
- Handles 429 / 402 with friendly toast messages on the client.

### Frontend
- New `src/pages/Chat.tsx` — message list + composer, streaming SSE parser (token-by-token rendering), markdown via `react-markdown`.
- New `src/components/ChatMessage.tsx` — bubble styling consistent with the app's card design.
- Add `react-markdown` dependency.
- New route `/chat` in `src/App.tsx`.
- `src/components/MobileShell.tsx` — add "Coach" tab (MessageCircle icon).

## Technical notes

- **Streaming**: client uses `fetch` against `${VITE_SUPABASE_URL}/functions/v1/career-chat` with the publishable key, parses SSE line-by-line, updates the last assistant message progressively.
- **Context size**: cap at last 30 concepts to stay well under model context. For each concept include only title, conceptId, summary, skills, careerRoles, quizPassed — not the full source text.
- **Privacy**: chat history lives in component state only; no DB tables added. Resets on page reload.
- **Background quiz generation**: `Upload.tsx` does `void supabase.functions.invoke("generate-quiz", ...).then(...)` *before* navigating; the `attachQuiz` call hits the persisted store so Result picks it up reactively.

## Out of scope
- Persisting chat across sessions (can add later with a `chat_messages` table if requested).
- Voice input.
- Coach being able to *create* new learning entries from chat.

Approve to build.