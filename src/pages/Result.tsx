import { useNavigate, useParams } from "react-router-dom";
import { useLearningStore } from "@/store/learning";
import { ArrowLeft, Briefcase, CheckCircle2, Lightbulb, Rocket, Target, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Section = ({ icon: Icon, label, color, children }: any) => (
  <section className="abs-card p-5 animate-slide-up">
    <div className="flex items-center gap-2 mb-3">
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-sm font-semibold tracking-tight">{label}</h2>
    </div>
    {children}
  </section>
);

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const entry = useLearningStore((s) => s.entries.find((e) => e.id === id));
  const toggleTask = useLearningStore((s) => s.toggleTask);

  if (!entry) {
    return (
      <div className="px-5 pt-20 text-center">
        <p className="text-muted-foreground mb-4">Entry not found.</p>
        <Button onClick={() => navigate("/")}>Back to home</Button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pb-12 animate-fade-in space-y-3">
      <header className="flex items-center justify-between mb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground abs-tap">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs px-2.5 py-1 rounded-full bg-success-soft text-success font-medium">
          +{entry.readinessDelta} career pts
        </span>
      </header>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Result</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1 leading-tight">{entry.title}</h1>
      </div>

      <Section icon={Sparkles} label="Summary" color="bg-primary-soft text-primary">
        <p className="text-sm text-foreground/80 leading-relaxed">{entry.summary}</p>
      </Section>

      <Section icon={Lightbulb} label="Key concepts" color="bg-warning-soft text-warning">
        <ul className="space-y-2">
          {entry.keyConcepts.map((k, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
              <span className="text-foreground/85 leading-snug">{k}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={CheckCircle2} label="Action tasks" color="bg-success-soft text-success">
        <div className="space-y-2">
          {entry.actionTasks.map((t, i) => (
            <button
              key={i}
              onClick={() => toggleTask(entry.id, i)}
              className="w-full flex gap-3 items-start text-left abs-tap p-2 rounded-xl hover:bg-muted/50"
            >
              <div className={cn(
                "w-5 h-5 rounded-md border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all",
                t.done ? "bg-success border-success animate-pop" : "border-muted-foreground/40"
              )}>
                {t.done && <CheckCircle2 className="w-3.5 h-3.5 text-success-foreground" />}
              </div>
              <span className={cn("text-sm leading-snug", t.done && "line-through text-muted-foreground")}>
                {t.text}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section icon={Briefcase} label="Career mapping" color="bg-primary-soft text-primary">
        <div className="flex flex-wrap gap-2">
          {entry.careerRoles.map((r) => (
            <span key={r} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground/80 font-medium">
              {r}
            </span>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Skills built</p>
          <div className="flex flex-wrap gap-1.5">
            {entry.skills.map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-success-soft text-success font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section icon={FileText} label="Resume bullet" color="bg-danger-soft text-danger">
        <p className="text-sm font-medium leading-relaxed text-foreground/90 italic">
          "{entry.resumeBullet}"
        </p>
        <button
          onClick={() => { navigator.clipboard.writeText(entry.resumeBullet); toast.success("Copied to clipboard"); }}
          className="mt-3 text-xs text-primary font-medium abs-tap"
        >
          Copy bullet →
        </button>
      </Section>

      <Section icon={Rocket} label="Next learning step" color="bg-warning-soft text-warning">
        <p className="text-sm text-foreground/85 leading-relaxed">{entry.nextStep}</p>
      </Section>

      <Button onClick={() => navigate("/career")} className="w-full h-13 rounded-2xl mt-2 abs-tap" size="lg">
        <Target className="w-4 h-4 mr-2" /> See career impact
      </Button>
    </div>
  );
};

export default Result;
