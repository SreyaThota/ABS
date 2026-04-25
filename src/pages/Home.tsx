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
    <div className="px-5 md:px-0 pt-12 md:pt-8 pb-6 animate-fade-in">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground tracking-wide uppercase">{greet()}, {firstName}</p>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">Today's impact</h1>
        </div>
        <button
          onClick={() => setProfileOpen(true)}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center text-primary-foreground font-semibold shadow-md abs-tap"
          aria-label="Edit profile"
        >
          {initial}
        </button>
      </header>
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />

      {/* Career ring hero */}
      <section className="abs-card-elevated p-6 mb-4 flex items-center gap-5"
        style={{ background: "var(--gradient-hero)" }}>
        <ReadinessRing value={readiness} />
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Career Impact Engine</p>
          <p className="text-base font-medium leading-snug mt-1">
            Every lecture moves your career forward.
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="flex items-center gap-1.5 text-success font-medium">
              <Flame className="w-3.5 h-3.5" />
              +{entries.reduce((s, e) => s + (e.readinessDelta || 0), 0)} pts
            </span>
            {quizzesPassed > 0 && (
              <span className="text-muted-foreground">· {quizzesPassed} quiz{quizzesPassed === 1 ? "" : "es"} passed</span>
            )}
          </div>
        </div>
      </section>

      {/* Quick upload */}
      <Button
        onClick={() => navigate("/upload")}
        className="w-full h-14 rounded-2xl text-base font-medium shadow-lg shadow-primary/20 mb-4 abs-tap"
      >
        <Upload className="w-5 h-5 mr-2" /> Upload lecture
        <ArrowRight className="w-4 h-4 ml-auto opacity-80" />
      </Button>

      {/* AI insight */}
      <section className="abs-card p-4 mb-4 flex gap-3 items-start">
        <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
          <Sparkles className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-primary mb-0.5">AI insight</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
        </div>
      </section>

      {/* Today's tasks */}
      <section className="mb-4">
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
  );
};

export default Home;
