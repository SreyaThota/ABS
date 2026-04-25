import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLearningStore } from "@/store/learning";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Briefcase, CheckCircle2, Lightbulb, Rocket, Target, FileText, Brain, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SummaryDeck } from "@/components/SummaryDeck";

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
  const attachQuiz = useLearningStore((s) => s.attachQuiz);
  const profile = useLearningStore((s) => s.profile);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Background quiz from Upload may still be in flight — show "preparing" state until it lands.
  const justCreated = entry ? Date.now() - entry.createdAt < 60_000 : false;
  const quizPreparing = !!entry && !entry.quiz && justCreated && !generatingQuiz;

  const startQuiz = async () => {
    if (!entry) return;
    if (entry.quiz?.questions?.length) {
      navigate(`/quiz/${entry.id}`);
      return;
    }
    if (quizPreparing) return; // wait for background gen
    setGeneratingQuiz(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: {
          content: entry.summary + "\n\n" + entry.keyConcepts.join("\n") + "\n\n" + entry.sourcePreview,
          title: entry.title,
          keyConcepts: entry.keyConcepts,
          profile,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const questions = data?.questions || [];
      if (questions.length === 0) throw new Error("No questions generated");
      attachQuiz(entry.id, { questions, createdAt: Date.now() });
      navigate(`/quiz/${entry.id}`);
    } catch (e: any) {
      toast.error(e.message || "Couldn't build quiz");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (!entry) {
    return (
      <div className="px-5 pt-20 text-center">
        <p className="text-muted-foreground mb-4">Entry not found.</p>
        <Button onClick={() => navigate("/")}>Back to home</Button>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-0 pt-12 md:pt-8 pb-12 animate-fade-in space-y-3">
      <header className="flex items-center justify-between mb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground abs-tap">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs px-2.5 py-1 rounded-full bg-success-soft text-success font-medium">
          +{entry.readinessDelta} career pts
        </span>
      </header>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Concept</p>
          <button
            onClick={() => { navigator.clipboard.writeText(entry.conceptId); toast.success("Concept ID copied"); }}
            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-foreground/70 abs-tap inline-flex items-center gap-1"
            aria-label="Copy concept ID"
          >
            {entry.conceptId} <Copy className="w-2.5 h-2.5" />
          </button>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1 leading-tight">{entry.title}</h1>
      </div>

      <SummaryDeck entry={entry} />

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

      {/* Quiz CTA — last card */}
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-2 px-1">
        Test yourself
      </p>
      <button
        onClick={startQuiz}
        disabled={generatingQuiz || quizPreparing}
        className="w-full abs-card-elevated p-4 flex items-center gap-3 abs-tap text-left disabled:opacity-80"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="w-11 h-11 rounded-2xl bg-card flex items-center justify-center shadow-sm shrink-0">
          {generatingQuiz || quizPreparing ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Brain className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">
            {quizPreparing
              ? "Preparing your quiz…"
              : generatingQuiz
              ? "Building your quiz…"
              : entry.quiz
              ? entry.quizPassed ? "Retake quiz" : "Take 5-min quiz"
              : "Take 5-min quiz"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {quizPreparing
              ? "Personalized questions, ~10s"
              : generatingQuiz
              ? "Personalized questions, ~10s"
              : entry.quiz
              ? `${entry.quiz.questions.length} questions${entry.quizBestScore != null ? ` · best ${entry.quizBestScore}%` : ""}`
              : "Mixed fill-blanks + MCQs · earn +5 readiness"}
          </p>
        </div>
        {entry.quizPassed && (
          <span className="text-[10px] font-medium text-success bg-success-soft px-2 py-1 rounded-full">Passed</span>
        )}
      </button>

      <Button onClick={() => navigate("/career")} className="w-full h-13 rounded-2xl mt-2 abs-tap" size="lg">
        <Target className="w-4 h-4 mr-2" /> See career impact
      </Button>
    </div>
  );
};

export default Result;
