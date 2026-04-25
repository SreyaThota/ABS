## Goal

Make the Result page feel like a "visual study deck" — turn the summary into bite-sized animated slides/bullets, ensure it covers all key points, and move the Quiz CTA to the very bottom of the page.

## Changes

### 1. Reorder Result page (`src/pages/Result.tsx`)

New section order, top → bottom:
1. Header (back + readiness pill)
2. Concept ID + Title
3. **Summary Deck** (new visual component — replaces the plain summary card)
4. Key concepts
5. Action tasks
6. Career mapping + Skills
7. Resume bullet
8. Next learning step
9. **Quiz CTA** (moved here — last card on the page)
10. "See career impact" button

Remove the Quiz CTA from its current position right under the title.

### 2. New Summary Deck component (`src/components/SummaryDeck.tsx`)

A swipeable mini-slide deck that turns the summary into a visual, presentation-style breakdown covering all points — not a wall of text.

Structure: 4 auto-built slides from existing entry data, no new AI call needed.

```text
┌─────────────────────────┐
│  ●○○○         Slide 1/4 │
│                         │
│   [icon]                │
│   The Big Idea          │
│   {summary sentence 1}  │
│                         │
│   ◀  swipe / tap  ▶     │
└─────────────────────────┘
```

Slides generated client-side from `entry`:
- **Slide 1 — The Big Idea**: first sentence of `summary` + Sparkles icon, gradient bg
- **Slide 2 — How it works**: remaining summary sentences as 2–3 short bullets (split on `. `), Lightbulb icon
- **Slide 3 — Must-know**: all `keyConcepts` as animated bullet list (staggered fade-in), Brain icon
- **Slide 4 — Why it matters**: top `careerRoles` + first `skills` as chips, plus `nextStep` as a one-liner, Rocket icon

Interactions:
- Swipe left/right (touch) + left/right arrow buttons + dot indicators (tap to jump)
- Each slide animates in with `animate-fade-in` + `animate-scale-in`
- Bullets inside Slide 3 stagger using `style={{ animationDelay: ... }}`
- Auto-height card; fixed min-height ~280px so transitions feel stable
- "View as text" toggle at the bottom expands a plain `<p>` of the full summary for accessibility / users who prefer text

This gives the "PPT slide / animation" feel the user asked for, while guaranteeing all points are covered (summary + key concepts + career + next step are all surfaced across the 4 slides).

### 3. Quiz CTA — relocate, keep behavior

Move the existing Quiz button JSX block to just above the "See career impact" button. No logic changes — `startQuiz`, `quizPreparing`, `generatingQuiz`, and the three states (Generating / Ready / Retake) all stay identical. Just a new position + a small section label above it: "Test yourself".

## Technical notes

- Pure client-side; no edge function or DB changes.
- Sentence splitting uses a simple regex `/(?<=[.!?])\s+/` with a fallback if summary has only one sentence (then Slide 2 becomes a "Quick recap" of `keyConcepts.slice(0,2)`).
- Swipe handled via `onTouchStart` / `onTouchEnd` deltas; no extra dependency.
- All animation classes (`animate-fade-in`, `animate-scale-in`, `animate-slide-up`) already exist in the Tailwind config.
- No changes to store, routes, edge functions, or other pages.

## Out of scope

- Generating a separate AI "slide script" (current entry data already covers all points).
- Persisting deck state.
- Auto-advancing slides.

Approve to build.