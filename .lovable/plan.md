# Personalized AI Structuring

Right now the LLM produces the same breakdown for everyone. We'll add a **learner profile** so the same lecture produces different career mappings for an "AI/ML aspirant, 2nd-year, beginner" vs a "Data Analyst, working pro, intermediate".

## What you'll get

A first-launch onboarding that captures who the learner is, then every AI output (summary, tasks, skills, resume bullet, next step) is tailored to that profile — without changing the clean UI you already have.

## 1. Onboarding screen (new)

Shown once on first open. Soft, minimal, 3 quick steps with progress dots.

- **Step 1 — Who you are**: name + education stage (High school / Undergrad / Postgrad / Working pro)
- **Step 2 — Target career**: chip selection (AI/ML Engineer, Software Engineer, Data Analyst, Product Manager, Designer, Other → free text)
- **Step 3 — Your level + interests**: skill level (Beginner / Intermediate / Advanced) + 2-3 interest chips (Web, ML, Data, Mobile, Systems, Design…)

Saved locally in the same Zustand store. Editable later from a small "Profile" sheet on Home (avatar tap).

## 2. Personalized AI behavior

The edge function (`process-learning`) will accept a `profile` object alongside `content` and inject it into the system prompt so the LLM:

- **Summary** — written at the user's level (simpler for beginners, denser for advanced)
- **Action tasks** — recommend resources/exercises matching their stage
- **Career mapping** — prioritize roles aligned with their target career first
- **Resume bullet** — phrased for the role they're targeting
- **Next step** — points toward the next gap in *their* path, not a generic one
- **Readiness delta** — weighted higher when the learning maps to their target role

## 3. Home dashboard tweaks

- Greeting uses their name ("Good evening, Anya")
- AI insight card mentions their target career ("3 more skills until you're match-ready for AI/ML Engineer")
- Career Tracker highlights their chosen target role first with a "Your path" badge

## 4. Profile editor

Tap the avatar on Home → bottom sheet to update target career, level, interests. Re-personalizes future AI outputs immediately.

---

## Technical details

**Store** (`src/store/learning.ts`)
- Add `profile: { name, stage, targetCareer, level, interests[] } | null` and `setProfile()`
- Add `hasOnboarded` flag

**New files**
- `src/pages/Onboarding.tsx` — 3-step flow, redirects to `/` when done
- `src/components/ProfileSheet.tsx` — bottom sheet editor (uses existing shadcn `Sheet`)

**Routing** — `App.tsx` wraps routes with a check: if `!hasOnboarded`, redirect to `/onboarding`.

**Edge function** (`supabase/functions/process-learning/index.ts`)
- Accept `{ content, profile }` in body
- Inject profile into system prompt:
  ```
  Learner profile:
  - Name: {name}
  - Stage: {stage}
  - Target career: {targetCareer}
  - Skill level: {level}
  - Interests: {interests}
  Tailor every section to this learner. Prioritize {targetCareer} mapping. Match vocabulary to {level}.
  ```
- Tool schema unchanged (output stays clean and structured)

**Upload page** — pulls `profile` from store and passes it in the `invoke` body.

**Home + Career pages** — read profile, show name/target-career-aware copy and reorder suggested roles to put the user's target first.

No DB changes. No new dependencies. Minimal, focused diff.
