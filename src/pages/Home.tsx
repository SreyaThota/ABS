import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLearningStore } from "@/store/learning";
import { ReadinessRing } from "@/components/ReadinessRing";
import { Sparkles, Upload, ArrowRight, CheckCircle2, Flame, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileSheet } from "@/components/ProfileSheet";

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const Home = () => {
  const navigate = useNavigate();
  const { entries, readiness, profile } = useLearningStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const todayTasks = entries
    .flatMap((e) => e.actionTasks.map((t, i) => ({ ...t, entryId: e.id, idx: i, source: e.title })))
    .filter((t) => !t.done)
    .slice(0, 3);

  const todaySkills = new Set(
    entries
      .filter((e) => Date.now() - e.createdAt < 24 * 3600 * 1000)
      .flatMap((e) => e.skills)
  ).size;

  const quizzesPassed = entries.filter((e) => e.quizPassed).length;

  const targetMatches = entries.filter((e) =>
    e.careerRoles.some((r) => r.toLowerCase() === (profile?.targetCareer || "").toLowerCase())
  ).length;

  const insight =
    entries.length === 0
      ? `Upload your first lecture — your path to ${profile?.targetCareer || "your goal"} starts now.`
      : profile
      ? `${targetMatches} of your learnings map to ${profile.targetCareer}. Keep stacking — readiness compounds fast.`
      : `You're building momentum. ${entries.length} learnings processed.`;

  const initial = (profile?.name || "A").charAt(0).toUpperCase();
  const firstName = profile?.name?.split(" ")[0] || "there";

  return (
    <div className="px-5 md:px-0 pt-12 md:pt-10 pb-6 animate-fade-in">
      <header className="flex items-center justify-between mb-7">
        <div>
          <p className="t-micro">{greet()}, {firstName}</p>
          <h1 className="t-display mt-1.5">Today's impact</h1>
        </div>
        <button
          onClick={() => setProfileOpen(true)}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center ring-1 ring-energy/40 abs-tap abs-focus"
          aria-label="Edit profile"
        >
          {initial}
        </button>
      </header>
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />

      {/* Career ring hero — calm, premium */}
      <section className="abs-card-elevated p-6 mb-5 relative overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-60 pointer-events-none"
          style={{ background: "radial-gradient(closest-side, hsl(var(--primary) / 0.12), transparent)" }}
        />
        <div className="relative flex items-center gap-5">
          <ReadinessRing value={readiness} />
          <div className="flex-1 min-w-0">
            <p className="t-micro">Career readiness</p>
            <p className="t-h1 mt-1.5 leading-snug">
              Every lecture moves you forward.
            </p>
            <div className="flex items-center gap-3 mt-3 text-[12px]">
              <span className="inline-flex items-center gap-1.5 text-success font-semibold tabular-nums">
                <Flame className="w-3.5 h-3.5" />
                +{entries.reduce((s, e) => s + (e.readinessDelta || 0), 0)} pts
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-muted-foreground tabular-nums">
                {entries.length} concept{entries.length === 1 ? "" : "s"}
              </span>
              {quizzesPassed > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-muted-foreground tabular-nums">{quizzesPassed} passed</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Primary CTA */}
      <Button
        onClick={() => navigate("/upload")}
        size="lg"
        className="w-full h-14 mb-5"
      >
        <Upload className="w-[18px] h-[18px]" />
        <span>Upload lecture</span>
        <ArrowRight className="w-4 h-4 ml-auto opacity-90" />
      </Button>

      {/* AI insight */}
      <section className="abs-card p-4 mb-5 flex gap-3 items-start">
        <span className="abs-chip bg-primary-soft text-primary mt-0.5">
          <Sparkles className="w-3 h-3" /> AI
        </span>
        <p className="t-body italic text-foreground/85 flex-1">{insight}</p>
      </section>

      <div className="md:grid md:grid-cols-2 md:gap-4">
        {/* Today's tasks */}
        <section className="mb-4 md:mb-0">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-semibold tracking-tight">Tasks for today</h2>
            <span className="text-xs text-muted-foreground">{todayTasks.length} pending</span>
          </div>
          {todayTasks.length === 0 ? (
            <div className="abs-card p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All caught up. Add new learning to grow.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((t) => (
                <div key={t.entryId + t.idx} className="abs-card p-3.5 flex gap-3 items-start abs-tap">
                  <div className="w-5 h-5 rounded-md border-2 border-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{t.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">From · {t.source}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent learnings */}
        {entries.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold tracking-tight mb-3 px-1">Recent learnings</h2>
            <div className="space-y-2">
              {entries.slice(0, 3).map((e) => (
                <button
                  key={e.id}
                  onClick={() => navigate(`/result/${e.id}`)}
                  className="w-full abs-card p-4 flex gap-3 items-center text-left abs-tap"
                >
                  <div className="w-10 h-10 rounded-xl bg-success-soft flex items-center justify-center shrink-0">
                    <BookOpen className="w-4.5 h-4.5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.skills.slice(0, 2).join(" · ")}</p>
                  </div>
                  <span className="text-xs font-medium text-success">+{e.readinessDelta}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
