import { useLearningStore, allSkills, allRoles } from "@/store/learning";
import { ReadinessRing } from "@/components/ReadinessRing";
import { TrendingUp, Target, AlertCircle } from "lucide-react";

const suggestedRoles = [
  { name: "AI/ML Engineer", required: ["Python", "Machine Learning", "Linear Algebra", "Neural Networks"] },
  { name: "Software Engineer", required: ["Data Structures", "Algorithms", "System Design", "Git"] },
  { name: "Data Analyst", required: ["SQL", "Statistics", "Visualization", "Excel"] },
];

const Career = () => {
  const { entries, readiness } = useLearningStore();
  const skills = allSkills(entries);
  const roles = allRoles(entries);
  const haveSkills = new Set(skills.map((s) => s.name.toLowerCase()));

  return (
    <div className="px-5 pt-12 animate-fade-in">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground tracking-wide uppercase">Career Tracker</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Your trajectory</h1>
      </header>

      {/* Hero readiness */}
      <section
        className="abs-card-elevated p-6 mb-4 flex items-center gap-4"
        style={{ background: "var(--gradient-hero)" }}
      >
        <ReadinessRing value={readiness} size={120} stroke={11} />
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Career readiness</p>
          <p className="text-sm leading-snug mt-1">
            {readiness < 30 ? "Building foundation" : readiness < 60 ? "Gaining traction" : readiness < 85 ? "Job-ready candidate" : "Top tier ready"}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-success font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            {entries.length} learning{entries.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      {/* Skill tree */}
      <section className="abs-card p-5 mb-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Skill tree
        </h2>
        {skills.length === 0 ? (
          <p className="text-xs text-muted-foreground">Process learning to grow your skill graph.</p>
        ) : (
          <div className="relative pt-2">
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => {
                const intensity = Math.min(1, s.count / 3);
                return (
                  <div
                    key={s.name}
                    className="px-3 py-2 rounded-xl bg-primary-soft text-primary text-xs font-medium flex items-center gap-1.5 animate-pop"
                    style={{
                      animationDelay: `${i * 40}ms`,
                      transform: `scale(${0.95 + intensity * 0.15})`,
                    }}
                  >
                    {s.name}
                    {s.count > 1 && <span className="text-[10px] opacity-60">×{s.count}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Suggested roles + gaps */}
      <section className="space-y-3 mb-4">
        <h2 className="text-sm font-semibold px-1">Suggested career paths</h2>
        {suggestedRoles.map((role) => {
          const matched = role.required.filter((r) => haveSkills.has(r.toLowerCase()));
          const missing = role.required.filter((r) => !haveSkills.has(r.toLowerCase()));
          const pct = Math.round((matched.length / role.required.length) * 100);
          const userInterest = roles.find((r) => r.name.toLowerCase() === role.name.toLowerCase());
          return (
            <div key={role.name} className="abs-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">{role.name}</p>
                <span className="text-xs font-medium text-primary">{pct}% match</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: "var(--gradient-progress)" }}
                />
              </div>
              {userInterest && (
                <p className="text-[11px] text-success mb-2">↑ Mentioned in {userInterest.count} learning{userInterest.count > 1 ? "s" : ""}</p>
              )}
              {missing.length > 0 && (
                <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <AlertCircle className="w-3 h-3 mt-0.5 text-warning shrink-0" />
                  <span>Skill gaps: <span className="text-foreground/80">{missing.join(", ")}</span></span>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Career;
