import { useMemo, useState, useRef } from "react";
import { Sparkles, Lightbulb, Brain, Rocket, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LearningEntry } from "@/store/learning";

type Slide = {
  key: string;
  label: string;
  title: string;
  icon: any;
  color: string;
  bullets?: string[];
  body?: string;
  chips?: { text: string; tone: "primary" | "success" }[];
};

const splitSentences = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

export const SummaryDeck = ({ entry }: { entry: LearningEntry }) => {
  const [i, setI] = useState(0);
  const [showText, setShowText] = useState(false);
  const touchX = useRef<number | null>(null);

  const slides: Slide[] = useMemo(() => {
    const sents = splitSentences(entry.summary);
    const big = sents[0] || entry.summary;
    const rest = sents.slice(1);
    const slide2Bullets =
      rest.length > 0 ? rest.slice(0, 3) : entry.keyConcepts.slice(0, 2);

    return [
      {
        key: "big",
        label: "The big idea",
        title: entry.title,
        icon: Sparkles,
        color: "bg-primary-soft text-primary",
        body: big,
      },
      {
        key: "how",
        label: rest.length > 0 ? "How it works" : "Quick recap",
        title: "In short",
        icon: Lightbulb,
        color: "bg-warning-soft text-warning",
        bullets: slide2Bullets,
      },
      {
        key: "must",
        label: "Must-know",
        title: "Key concepts",
        icon: Brain,
        color: "bg-primary-soft text-primary",
        bullets: entry.keyConcepts,
      },
      {
        key: "why",
        label: "Why it matters",
        title: "For your career",
        icon: Rocket,
        color: "bg-success-soft text-success",
        chips: [
          ...entry.careerRoles.slice(0, 3).map((t) => ({ text: t, tone: "primary" as const })),
          ...entry.skills.slice(0, 4).map((t) => ({ text: t, tone: "success" as const })),
        ],
        body: entry.nextStep,
      },
    ];
  }, [entry]);

  const total = slides.length;
  const go = (n: number) => setI(((n % total) + total) % total);
  const next = () => go(i + 1);
  const prev = () => go(i - 1);

  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    touchX.current = null;
  };

  const s = slides[i];
  const Icon = s.icon;

  return (
    <section className="abs-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", s.color)}>
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight">Summary</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => go(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all abs-tap",
                idx === i ? "w-5 bg-primary" : "w-1.5 bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <div
        className="relative min-h-[240px] rounded-2xl overflow-hidden"
        style={{ background: "var(--gradient-hero, hsl(var(--secondary)))" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div key={s.key} className="p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center animate-scale-in", s.color)}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              {s.label}
            </span>
          </div>

          <h3 className="text-base font-semibold leading-snug mb-2 text-foreground">
            {s.title}
          </h3>

          {s.body && (
            <p className="text-sm text-foreground/80 leading-relaxed animate-fade-in">
              {s.body}
            </p>
          )}

          {s.bullets && (
            <ul className="space-y-2 mt-1">
              {s.bullets.map((b, idx) => (
                <li
                  key={idx}
                  className="flex gap-2.5 text-sm animate-fade-in opacity-0"
                  style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "forwards" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-foreground/85 leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          )}

          {s.chips && (
            <>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {s.chips.map((c, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg font-medium animate-fade-in opacity-0",
                      c.tone === "primary"
                        ? "bg-primary-soft text-primary"
                        : "bg-success-soft text-success"
                    )}
                    style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "forwards" }}
                  >
                    {c.text}
                  </span>
                ))}
              </div>
              {s.body && (
                <p className="text-xs text-foreground/75 leading-relaxed mt-3 italic">
                  Next: {s.body}
                </p>
              )}
            </>
          )}
        </div>

        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center abs-tap shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center abs-tap shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <span className="absolute bottom-2 right-3 text-[10px] font-mono text-muted-foreground">
          {i + 1}/{total}
        </span>
      </div>

      <button
        onClick={() => setShowText((v) => !v)}
        className="mt-3 text-xs text-primary font-medium abs-tap"
      >
        {showText ? "Hide full text" : "View as text"}
      </button>
      {showText && (
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed animate-fade-in">
          {entry.summary}
        </p>
      )}
    </section>
  );
};
