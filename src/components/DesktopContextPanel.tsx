import { useLearningStore } from "@/store/learning";
import { Sparkles } from "lucide-react";

const tips = [
  "Upload a PDF — earn +5 readiness.",
  "Pass a quiz to lock in a concept.",
  "Ask the Coach: 'Am I a fit for my target role?'",
  "Three concepts a week compounds fast.",
];

const Stat = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="py-3">
    <p className="t-micro">{label}</p>
    <div className="flex items-baseline gap-2 mt-1">
      <span className="abs-stat-num">{value}</span>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  </div>
);

export const DesktopContextPanel = () => {
  const { entries, readiness, profile } = useLearningStore();
  const quizzesPassed = entries.filter((e) => e.quizPassed).length;
  const tip = tips[entries.length % tips.length];
  const totalPts = entries.reduce((s, e) => s + (e.readinessDelta || 0), 0);

  return (
    <div className="p-7 animate-fade-in">
      <div className="mb-5">
        <p className="t-micro">Snapshot</p>
        <h3 className="t-h1 mt-1">
          {profile?.name?.split(" ")[0] || "Learner"}
        </h3>
        {profile?.targetCareer && (
          <p className="text-[12px] text-muted-foreground mt-1">
            On the path to <span className="text-foreground/80 font-medium">{profile.targetCareer}</span>
          </p>
        )}
      </div>

      {/* Readiness with thin progress */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="t-micro">Readiness</span>
          <span className="text-[13px] font-semibold tabular-nums">{readiness}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(2, readiness)}%`,
              backgroundImage: "var(--gradient-progress)",
            }}
          />
        </div>
      </div>

      <div className="abs-divider" />

      <Stat label="Concepts" value={entries.length} hint={entries.length === 1 ? "learned" : "learned"} />
      <div className="abs-divider" />
      <Stat label="Quizzes passed" value={quizzesPassed} />
      <div className="abs-divider" />
      <Stat label="Career points" value={`+${totalPts}`} />

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="t-micro">Tip</span>
        </div>
        <p className="text-[13px] leading-relaxed text-foreground/80 italic">
          {tip}
        </p>
      </div>
    </div>
  );
};
