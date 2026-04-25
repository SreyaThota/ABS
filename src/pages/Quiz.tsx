import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLearningStore, type QuizQuestion } from "@/store/learning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const norm = (s: string) => s.toLowerCase().trim().replace(/[.,!?;:'"`]/g, "");

const isCorrect = (q: QuizQuestion, given: string | number): boolean => {
  if (q.type === "mcq") return Number(given) === q.correctIndex;
  const a = norm(q.answer);
  const g = norm(String(given));
  if (!g) return false;
  if (g === a) return true;
  // tiny fuzzy: accept if one is contained in the other and length diff <= 2
  if (a.includes(g) || g.includes(a)) return Math.abs(a.length - g.length) <= 3;
  return false;
};

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const entry = useLearningStore((s) => s.entries.find((e) => e.id === id));
  const recordQuizScore = useLearningStore((s) => s.recordQuizScore);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(string | number)[]>([]);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const questions = entry?.quiz?.questions || [];
  const total = questions.length;
  const q = questions[idx];

  const score = useMemo(() => {
    let c = 0;
    answers.forEach((a, i) => {
      if (questions[i] && isCorrect(questions[i], a)) c++;
    });
    return c;
  }, [answers, questions]);

  const scorePct = total ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    if (done && entry && !recorded) {
      const { firstPass } = recordQuizScore(entry.id, scorePct);
      setRecorded(true);
      if (firstPass) toast.success("Quiz passed! +5 readiness pts");
    }
  }, [done, entry, recorded, scorePct, recordQuizScore]);

  if (!entry || !entry.quiz || total === 0) {
    return (
      <div className="px-5 pt-20 text-center">
        <p className="text-muted-foreground mb-4">Quiz not ready.</p>
        <Button onClick={() => navigate(`/result/${id}`)}>Back</Button>
      </div>
    );
  }

  const submit = () => {
    if (!q) return;
    const given: string | number = q.type === "mcq" ? Number(input) : input;
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = given;
      return copy;
    });
    setRevealed(true);
  };

  const next = () => {
    setRevealed(false);
    setInput("");
    if (idx + 1 >= total) setDone(true);
    else setIdx(idx + 1);
  };

  const restart = () => {
    setIdx(0); setAnswers([]); setInput(""); setRevealed(false); setDone(false); setRecorded(false);
  };

  if (done) {
    const passed = scorePct >= 70;
    return (
      <div className="px-5 pt-12 pb-12 animate-fade-in">
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(`/result/${id}`)} className="flex items-center gap-1 text-sm text-muted-foreground abs-tap">
            <ArrowLeft className="w-4 h-4" /> Concept
          </button>
          <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-secondary">{entry.conceptId}</span>
        </header>

        <div className="abs-card-elevated p-8 text-center" style={{ background: "var(--gradient-hero)" }}>
          <div className={cn("w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-md mb-4", passed ? "bg-success-soft" : "bg-warning-soft")}>
            <Trophy className={cn("w-7 h-7", passed ? "text-success" : "text-warning")} />
          </div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Your score</p>
          <h1 className="text-5xl font-semibold tracking-tight mt-2">{scorePct}%</h1>
          <p className="text-sm text-muted-foreground mt-2">{score} of {total} correct</p>
          {passed ? (
            <p className="text-sm text-success font-medium mt-3">Concept mastered ✓</p>
          ) : (
            <p className="text-sm text-foreground/70 mt-3">Almost there — review and retry.</p>
          )}
        </div>

        <div className="space-y-2 mt-6">
          {questions.map((qq, i) => {
            const ok = isCorrect(qq, answers[i] ?? "");
            return (
              <div key={i} className="abs-card p-3 flex gap-3 items-start">
                {ok ? <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />}
                <div className="text-xs">
                  <p className="text-foreground/85 leading-snug">{qq.prompt}</p>
                  {!ok && (
                    <p className="text-muted-foreground mt-1">
                      Answer: <span className="text-foreground font-medium">
                        {qq.type === "mcq" ? qq.options[qq.correctIndex] : qq.answer}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={restart} className="flex-1 h-12 rounded-2xl">
            <RotateCcw className="w-4 h-4 mr-2" /> Retry
          </Button>
          <Button onClick={() => navigate(`/result/${id}`)} className="flex-1 h-12 rounded-2xl">
            Done
          </Button>
        </div>
      </div>
    );
  }

  const correct = revealed && isCorrect(q, q.type === "mcq" ? Number(input) : input);

  return (
    <div className="px-5 pt-12 pb-12 animate-fade-in">
      <header className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(`/result/${id}`)} className="flex items-center gap-1 text-sm text-muted-foreground abs-tap">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-secondary">{entry.conceptId}</span>
      </header>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
          <span>Question {idx + 1} of {total}</span>
          <span>{q.type === "mcq" ? "Multiple choice" : "Fill the blank"}</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${((idx) / total) * 100}%` }} />
        </div>
      </div>

      <div className="abs-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-primary-soft flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Question</p>
        </div>
        <p className="text-base font-medium leading-relaxed text-foreground">{q.prompt}</p>
      </div>

      {q.type === "mcq" ? (
        <div className="space-y-2 mb-4">
          {q.options.map((opt, i) => {
            const selected = String(input) === String(i);
            const isAns = i === q.correctIndex;
            const showState = revealed && (selected || isAns);
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => setInput(String(i))}
                className={cn(
                  "w-full abs-card p-4 text-left abs-tap flex items-center gap-3 transition-all",
                  selected && !revealed && "ring-2 ring-primary",
                  showState && isAns && "ring-2 ring-success bg-success-soft",
                  showState && selected && !isAns && "ring-2 ring-danger bg-danger-soft"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0",
                  selected || (showState && isAns) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"
                )}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-sm leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="abs-card p-4 mb-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your answer…"
            disabled={revealed}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim() && !revealed) submit(); }}
            className={cn(
              "h-12 text-base",
              revealed && correct && "border-success ring-2 ring-success",
              revealed && !correct && "border-danger ring-2 ring-danger"
            )}
          />
          {revealed && !correct && (
            <p className="text-xs text-muted-foreground mt-2">
              Answer: <span className="text-foreground font-medium">{q.answer}</span>
            </p>
          )}
        </div>
      )}

      {revealed && q.explanation && (
        <div className={cn("abs-card p-3 mb-4 text-xs leading-relaxed", correct ? "bg-success-soft text-success" : "bg-warning-soft text-warning")}>
          <p className="text-foreground/85">{q.explanation}</p>
        </div>
      )}

      {!revealed ? (
        <Button
          onClick={submit}
          disabled={input === "" || input === undefined}
          className="w-full h-13 rounded-2xl"
          size="lg"
        >
          Check answer
        </Button>
      ) : (
        <Button onClick={next} className="w-full h-13 rounded-2xl" size="lg">
          {idx + 1 >= total ? "See results" : "Next question"}
        </Button>
      )}
    </div>
  );
};

export default Quiz;
