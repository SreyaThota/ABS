## Goal

Drop the Google-brand palette completely. Re-skin the app with a sophisticated, "designed by a senior" color system — the kind you see on Linear, Vercel, Arc, Stripe — and apply it with the **60 / 30 / 10** rule so colors feel intentional, not decorative.

## The new palette (no Google colors)

| Role     | Color           | HSL              | Usage |
|----------|-----------------|------------------|-------|
| Brand    | Indigo-violet   | `239 84% 62%`    | Primary actions, active nav, brand mark, links |
| Success  | Sage green      | `160 84% 36%`    | Quiz passed, +pts chips, status dots |
| Highlight| Warm amber      | `38 92% 48%`     | Key-concept icons, "Tip" cards — used sparingly |
| Danger   | Coral red       | `350 89% 58%`    | Errors, "Resume bullet" accent, destructive only |
| Neutrals | Warm slate ramp | hue `240`        | 60% of every screen — backgrounds, text, borders |

Rule applied:
- **60% neutral** (warm-slate surfaces, body text, borders).
- **30% indigo brand** (primary CTA gradient, active nav bar, links, focus ring).
- **10% accents** (sage success, amber highlight, coral danger) — never combined in the same component.

The 4-dot brand mark is recolored: a single solid indigo tile with 4 small dots in **white / sage / amber / coral**, so the four palette colors live together only in that one place. Everywhere else, only one accent appears at a time.

## Files updated

### 1. `src/index.css` — token swap

Replace the entire `:root` and `.dark` blocks with the new palette + a refined gradient set:
- `--gradient-cta`: `linear-gradient(135deg, hsl(239 84% 64%), hsl(252 78% 56%))` (indigo → violet, no rainbow).
- `--gradient-progress`: indigo → sage.
- `--gradient-brand`: indigo → violet (used by the brand mark only).
- `--gradient-hero`: very soft indigo wash on near-white.
- `--shadow-ring` recolored to indigo at 18% alpha for focus halos.

Surface ramp, radii, type utilities, shadows, and animations are kept exactly as the recent senior-pass — only the hue values change.

### 2. `src/components/MobileShell.tsx` — recolor the BrandMark

Update the four small dots inside the brand tile:
```tsx
<span className="bg-white/95" />
<span className="bg-[hsl(350_89%_72%)]" />   {/* coral */}
<span className="bg-[hsl(38_92%_68%)]" />    {/* amber */}
<span className="bg-[hsl(160_84%_60%)]" />   {/* sage  */}
```

The "v1.0 · all systems go" footer dot becomes sage (success), unchanged in semantics.

### 3. `src/pages/Home.tsx` — quiet a 4-color gradient

Replace the avatar's `from-primary via-danger to-warning` gradient with a clean indigo solid tinted with subtle violet ring:
```tsx
className="bg-primary-soft text-primary ring-1 ring-primary/15"
```
(Already done in the previous pass — this just confirms no rainbow remains.)

### 4. `src/pages/Resume.tsx` — recolor the side stripe

Change `bg-gradient-to-b from-primary via-warning to-success` to a single brand wash:
```tsx
className="bg-[image:var(--gradient-brand)]"
```

### 5. `src/components/SummaryDeck.tsx` — slide tints

Per-slide soft tint stays, but uses the new palette so two slides aren't both blue:
- Slide 1 — indigo tint   (brand intro)
- Slide 2 — amber tint    (highlight / "how it works")
- Slide 3 — indigo tint   (must-know)
- Slide 4 — sage tint     (career outcome)

Coral is reserved for errors and never appears in the deck.

### 6. Sanity sweep

`rg` for any remaining hardcoded blue/green/red literal classes (`bg-blue-`, `text-green-`, `from-primary via-danger to-warning`, etc.) and replace with semantic tokens.

## What stays the same

- All component utilities (`.abs-card`, `.abs-chip`, `.t-display`, etc.) — only colors change.
- Type scale, spacing, shadows, radii, animations.
- Button variants, side rail layout, context panel structure.
- All page logic, routes, store, edge functions.

## Result

The whole app reads as an indigo-led product with sage / amber / coral as quiet semantic accents — calmer, more confident, and unmistakably *not* a Google clone. The 4-dot brand mark gives a subtle nod to the 4-color story without leaking it into the rest of the UI.

Approve to apply.