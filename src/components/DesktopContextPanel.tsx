import { useLearningStore } from "@/store/learning";
import { ReadinessRing } from "@/components/ReadinessRing";
import { BookOpen, CheckCircle2, Lightbulb, Target } from "lucide-react";

const tips = [
  "Upload a PDF to earn +5 readiness.",
  "Pass a quiz to lock in a concept.",
  "Ask the Coach: 'Am I a fit for my target role?'",
  "Stack 3 concepts in a week to compound momentum.",
];

export const DesktopContextPanel = () => {
  const { entries, readiness, profile } = useLearningStore();
  const quizzesPassed = entries.filter((e) => e.quizPassed).length;
  const tip = tips[entries.length % tips.length];

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Your snapshot
        </p>
        <h3 className="text-base font-semibold tracking-tight mt-1">
          {profile?.name?.split(" ")[0] || "Learner"}'s progress
        </h3>
      </div>

      <div
        className="abs-card-elevated p-5 flex flex-col items-center text-center gap-3"
        style={{ background: "var(--gradient-hero)" }}
      >
        <ReadinessRing value={readiness} />
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Career readiness
          </p>
          {profile?.targetCareer && (
            <p className="text-xs text-foreground/75 mt-1">
              Target: <span className="font-medium">{profile.targetCareer}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="abs-card p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-semibold">Concepts</span>
          </div>
          <p className="text-xl font-semibold">{entries.length}</p>
        </div>
        <div className="abs-card p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-semibold">Quizzes</span>
          </div>
          <p className="text-xl font-semibold">{quizzesPassed}</p>
        </div>
      </div>

      {profile?.targetCareer && (
        <div className="abs-card p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              On the path to
            </p>
            <p className="text-sm font-medium leading-snug mt-0.5 truncate">
              {profile.targetCareer}
            </p>
          </div>
        </div>
      )}

      <div className="abs-card p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-warning-soft flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4 text-warning" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Tip
          </p>
          <p className="text-sm text-foreground/80 leading-snug mt-0.5">{tip}</p>
        </div>
      </div>
    </div>
  );
};
