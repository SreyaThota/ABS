## Goal

Re-skin the app with a **distinctive, non-blue palette** that reads as classy and editorial — something a senior designer would ship for a Gen-Z learning product. No indigo, no Google colors, no generic "AI app" purple either.

## The new palette

A warm, confident system anchored in **deep plum** with a **chartreuse-lime** energy accent. The kind of pairing you see on Loops.so, Vercel's brand work, Cash App, and high-end editorial sites — looks expensive, photographs well, and stands out in a sea of blue apps.

| Role         | Color             | HSL                | Why |
|--------------|-------------------|--------------------|-----|
| Brand        | Deep plum / wine  | `340 65% 28%`      | Confident, "premium", no one else uses it |
| Brand-on-dk  | Dusty rose        | `340 60% 65%`      | Brand color when on dark surfaces |
| Energy       | Chartreuse-lime   | `75 85% 55%`       | The "pop" — used on CTAs, progress, active states |
| Success      | Forest moss       | `155 50% 32%`      | Reads as success without being kindergarten green |
| Highlight    | Tangerine         | `22 95% 58%`       | Warm, energetic — for tips/notable items |
| Danger       | Brick red         | `8 75% 48%`        | Saturated but earthy, not coral candy |
| Surface      | Warm cream        | `36 30% 97%`       | "Off-white paper" feel, not cold gray |
| Ink          | Charcoal-plum     | `340 18% 12%`      | Body text — warmer than slate, more refined |

Combination logic (60 / 30 / 10):
- **60% warm cream** surfaces with charcoal-plum text — feels like a beautifully printed magazine.
- **30% deep plum** brand presence (active nav, brand mark, primary text accents, links).
- **10% chartreuse-lime** energy on the *primary* CTA + readiness progress + "live" indicators. This is the Gen-Z signal — that single bright lime against warm cream is what makes the app instantly recognizable.
- Tangerine / forest / brick used **only** for semantic moments (tip, success, error). Never decorative.

CTAs become **plum body + lime underline glow**, not a gradient — much more "fashion brand" than "SaaS template."

### Dark mode

Inverts beautifully:
- Background → `340 18% 8%` (deep wine-ink, not pure black).
- Brand → dusty rose for legibility.
- Lime stays lime (it pops harder on dark, like Vercel's accent).
- Cream surface tones become warm `340 12% 14%` cards.

## Files updated

### 1. `src/index.css` — full token swap

Replace `:root` and `.dark` blocks with the palette above. Update gradients:
- `--gradient-cta`: solid `hsl(340 65% 28%)` (no gradient — flat plum reads more premium). The "lime energy" comes from a 2px bottom border / underline on the button, not the fill.
- `--gradient-progress`: `linear-gradient(90deg, hsl(340 65% 35%) 0%, hsl(75 85% 55%) 100%)` — plum to lime.
- `--gradient-brand`: `linear-gradient(135deg, hsl(340 65% 28%), hsl(340 50% 18%))` — for the brand mark.
- `--gradient-hero`: `linear-gradient(135deg, hsl(36 50% 97%), hsl(340 30% 96%))` — cream → blush.
- `--shadow-ring`: 3px lime at 25% alpha — accessible focus halo that *also* doubles as the brand's pop signal.

Keep all surface/typography/radius/animation tokens — only colors change.

### 2. `src/components/ui/button.tsx` — primary variant

Switch the `default` variant from gradient to solid plum + a 2px lime bottom-edge accent that lights up on hover:
```tsx
default: "bg-[hsl(var(--primary))] text-primary-foreground border-b-2 border-[hsl(75_85%_55%)] hover:brightness-110 hover:border-b-[3px] shadow-[var(--shadow-card)]"
```
This single detail is what makes the buttons look hand-designed.

### 3. `src/components/MobileShell.tsx` — BrandMark recolor

Drop the 4-dot Google nod entirely (it doesn't fit a plum/lime brand). Replace with a single bold **"a"** glyph in cream on a deep-plum tile, with a tiny lime dot in the upper-right corner — feels like a real fashion/media brand mark.

```tsx
<div className="abs-brand-mark relative">
  <span className="text-cream font-serif text-[18px] italic font-bold leading-none">a</span>
  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[hsl(75_85%_55%)] shadow-[0_0_6px_hsl(75_85%_55%/0.7)]" />
</div>
```

The "v1.0" footer dot becomes lime (live indicator) instead of green.

### 4. `src/pages/Home.tsx` — small tweaks

- Avatar: switch from `bg-primary-soft text-primary` to `bg-[hsl(var(--primary))] text-primary-foreground` — solid plum disc with cream initial. Looks like an editorial author byline.
- Hero card radial wash recolored to plum tint (`hsl(var(--primary) / 0.10)`).
- `+pts` chip stays sage success; quizzes count stays muted.

### 5. `src/components/DesktopContextPanel.tsx`

The thin progress bar already uses `--gradient-progress` → automatically becomes plum→lime. No code change.

### 6. `src/components/SummaryDeck.tsx` — slide tints repalette

- Slide 1 — plum tint (brand intro)
- Slide 2 — tangerine tint (highlight)
- Slide 3 — cream tint with plum text (must-know)
- Slide 4 — moss-green tint (career outcome)

Lime is reserved for the deck's *progress segments* (the dot indicators), tying it to the global progress motif.

### 7. Sanity sweep

`rg` for `from-primary`, `via-`, `bg-blue`, `text-blue`, `bg-indigo`, etc. — replace with semantic tokens or remove.

## What stays the same

- Component utilities (`.abs-card`, `.abs-chip`, `.t-display`...), type scale, spacing, shadows, radii, animations, layouts, routing, store, edge functions.
- 60/30/10 discipline introduced last pass.

## Why this works for Gen-Z + senior-designer feel

- Plum + lime is **polarizing in the right way** — instantly memorable, photographs well, screenshots well on social.
- Cream background reads as "considered" rather than the default gray-50 every other AI tool ships.
- Flat plum CTA with a glowing lime edge = unmistakable signature detail (the kind of thing that gets reverse-engineered on Twitter).
- Italic serif "a" mark = fashion-brand gravitas in a category drowning in geometric sans logos.

Approve to apply.