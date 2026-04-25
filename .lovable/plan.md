## Goal

Make the app look great on **both mobile and desktop** without rewriting every page. Today everything is hard-locked to a 440px column (`MobileShell`), so on a laptop the app shows as a thin phone-sized strip in the middle of a white screen.

## Approach

Keep the mobile UX exactly as it is. On `md+` screens (≥768px) switch to a desktop layout:
- A left **side rail** with the same nav items (replaces the floating bottom pill).
- A wider **content column** (max ~720px) so cards aren't cramped.
- A right **context panel** (only on `lg+`, ≥1024px) that shows a quick "Your stats" card (readiness ring, streak, quizzes passed) so the desktop view feels intentional, not just stretched.

No page logic changes — only layout/CSS shell + a couple of grid tweaks on the busiest pages.

## Changes

### 1. `src/components/MobileShell.tsx` — responsive shell

Rewrite to render two layouts driven by Tailwind breakpoints, no JS device detection:

```text
< md (mobile)               md+ (tablet/desktop)
┌──────────────┐            ┌────┬───────────────┬─────────┐
│              │            │side│   content     │ context │
│   content    │            │rail│   (max-720)   │ (lg+)   │
│              │            │    │               │         │
│ [bottom nav] │            │    │               │         │
└──────────────┘            └────┴───────────────┴─────────┘
```

- Keep current floating bottom nav, but hide it `md:hidden`.
- Add a new `<aside>` side rail (`hidden md:flex`) with the same 5 tab items: vertical icon buttons + labels, sticky, ~76px wide on `md`, ~220px wide with full labels on `lg`.
- Logo/wordmark "CareerOS" at top of the rail.
- Content column: `mx-auto w-full max-w-[440px] md:max-w-[680px] lg:max-w-[720px]`.
- Right context panel: `hidden lg:block w-[300px]` — renders a small `<DesktopContextPanel />` (new tiny component) showing `readiness`, `entries.length`, `quizzesPassed`. Hidden on `/result/*`, `/quiz/*`, `/chat`, `/onboarding`.
- The existing `hideNav` logic for `/result`, `/quiz`, `/chat` keeps working — on desktop the side rail still shows (so users can navigate away), only the bottom mobile nav is hidden.

### 2. New `src/components/DesktopContextPanel.tsx`

Small read-only sidebar widget pulling from `useLearningStore`:
- Mini readiness ring + percentage
- "Concepts learned: N"
- "Quizzes passed: N"
- "Day streak" (if available, otherwise omit)
- A subtle "Tip" card with a rotating hint (e.g. "Upload a PDF to earn +5 readiness")

Pure presentation, no new data.

### 3. Page-level responsive polish (small, surgical)

Most pages already work at 680px because they're vertical card stacks. Two pages benefit from a 2-column grid on `md+`:

- **`src/pages/Home.tsx`**: wrap the "Today's tasks" card and the "Insight + Recent learnings" stack in a `grid md:grid-cols-2 gap-4` so the dashboard feels like a dashboard on desktop. Header stays full-width above the grid.
- **`src/pages/Result.tsx`**: wrap the lower sections (Career mapping, Resume bullet, Next learning step) in `grid md:grid-cols-2 gap-3`. Summary deck, key concepts, action tasks, and the final Quiz CTA stay full-width for emphasis.

That's it — no other page rewrites. `Career`, `Resume`, `Quiz`, `Chat`, `Upload`, `Onboarding` already read fine in a 720px column.

### 4. Page top padding

Pages currently use `pt-12` (designed for mobile status-bar spacing). On desktop the side rail handles spacing, so add `md:pt-8` where it matters: Home, Result, Career, Resume, Upload, Chat. One-line tweaks each.

## Technical notes

- Pure Tailwind responsive classes — no new dependencies, no `useMediaQuery`, no JS branching for layout.
- Breakpoints: `md` = 768px (tablet+), `lg` = 1024px (desktop with context panel).
- Background stays `bg-background`; the desktop layout uses the same tokens so light/dark mode keep working.
- Bottom nav stays untouched on mobile — same component, just gated behind `md:hidden`.
- All existing `abs-card`, `animate-*`, and gradient styles work unchanged.
- No store, route, or edge function changes.

## Out of scope

- Different page layouts per device beyond the two grid tweaks above.
- Resizing/repositioning the streaming chat composer (already works fine wider).
- A separate "desktop-only" landing page.

Approve to build.