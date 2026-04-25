import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLearningStore, type LearnerProfile } from "@/store/learning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const stages: LearnerProfile["stage"][] = ["High school", "Undergrad", "Postgrad", "Working pro"];
const levels: LearnerProfile["level"][] = ["Beginner", "Intermediate", "Advanced"];
const careers = ["AI/ML Engineer", "Software Engineer", "Data Analyst", "Product Manager", "Designer", "Other"];
const interestPool = ["Web", "Machine Learning", "Data", "Mobile", "Systems", "Design", "Cloud", "Security"];

const Onboarding = () => {
  const navigate = useNavigate();
  const setProfile = useLearningStore((s) => s.setProfile);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [stage, setStage] = useState<LearnerProfile["stage"]>("Undergrad");
  const [careerChoice, setCareerChoice] = useState("AI/ML Engineer");
  const [customCareer, setCustomCareer] = useState("");
  const [level, setLevel] = useState<LearnerProfile["level"]>("Beginner");
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : prev.length < 3 ? [...prev, i] : prev));

  const canNext =
    (step === 0 && name.trim().length > 0) ||
    (step === 1 && (careerChoice !== "Other" || customCareer.trim().length > 0)) ||
    (step === 2 && interests.length > 0);

  const finish = () => {
    setProfile({
      name: name.trim(),
      stage,
      targetCareer: careerChoice === "Other" ? customCareer.trim() : careerChoice,
      level,
      interests,
    });
    navigate("/", { replace: true });
  };

  const next = () => (step < 2 ? setStep(step + 1) : finish());

  return (
    <div className="min-h-screen flex flex-col px-5 pt-14 pb-8 animate-fade-in" style={{ background: "var(--gradient-hero)" }}>
      {/* progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === step ? "bg-primary w-8" : i < step ? "bg-primary/50 w-4" : "bg-muted w-4"
            )}
          />
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{step + 1} of 3</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
          <Sparkles className="w-4.5 h-4.5" />
        </div>
        <p className="text-sm font-semibold tracking-tight">ABS</p>
      </div>

      {step === 0 && (
        <div className="animate-slide-up flex-1">
          <h1 className="text-3xl font-semibold tracking-tight mt-2">Hi there 👋</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">Let's personalize your career GPS.</p>

          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your name</label>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anya"
            className="h-14 mt-2 mb-6 text-base rounded-2xl bg-card"
          />

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">I'm currently a…</p>
          <div className="grid grid-cols-2 gap-2">
            {stages.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={cn(
                  "h-14 rounded-2xl text-sm font-medium border-2 transition-all abs-tap",
                  stage === s ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-foreground/70"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-slide-up flex-1">
          <h1 className="text-3xl font-semibold tracking-tight mt-2">Your target career</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">We'll map every learning to this goal.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {careers.map((c) => (
              <button
                key={c}
                onClick={() => setCareerChoice(c)}
                className={cn(
                  "px-4 h-11 rounded-full text-sm font-medium border-2 transition-all abs-tap",
                  careerChoice === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/70"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          {careerChoice === "Other" && (
            <Input
              autoFocus
              value={customCareer}
              onChange={(e) => setCustomCareer(e.target.value)}
              placeholder="e.g. Robotics Engineer"
              className="h-14 text-base rounded-2xl bg-card animate-fade-in"
            />
          )}
        </div>
      )}

      {step === 2 && (
        <div className="animate-slide-up flex-1">
          <h1 className="text-3xl font-semibold tracking-tight mt-2">Your level + focus</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">So our AI matches your depth.</p>

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Skill level</p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={cn(
                  "h-12 rounded-2xl text-sm font-medium border-2 transition-all abs-tap",
                  level === l ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-foreground/70"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Interests <span className="normal-case text-muted-foreground/70">(pick up to 3)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {interestPool.map((i) => {
              const active = interests.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={cn(
                    "px-3.5 h-10 rounded-full text-sm font-medium border-2 flex items-center gap-1.5 transition-all abs-tap",
                    active ? "border-success bg-success-soft text-success" : "border-border bg-card text-foreground/70"
                  )}
                >
                  {active && <Check className="w-3.5 h-3.5" />}
                  {i}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-6">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep(step - 1)} className="h-14 rounded-2xl px-5">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <Button
          disabled={!canNext}
          onClick={next}
          className="flex-1 h-14 rounded-2xl text-base font-medium shadow-lg shadow-primary/20 abs-tap disabled:opacity-40"
        >
          {step < 2 ? "Continue" : "Start learning"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
