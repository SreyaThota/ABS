import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLearningStore, type LearnerProfile } from "@/store/learning";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { toast } from "sonner";

const levels: LearnerProfile["level"][] = ["Beginner", "Intermediate", "Advanced"];
const careers = ["AI/ML Engineer", "Software Engineer", "Data Analyst", "Product Manager", "Designer"];
const interestPool = ["Web", "Machine Learning", "Data", "Mobile", "Systems", "Design", "Cloud", "Security"];

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

export const ProfileSheet = ({ open, onOpenChange }: Props) => {
  const profile = useLearningStore((s) => s.profile);
  const setProfile = useLearningStore((s) => s.setProfile);

  const [name, setName] = useState(profile?.name || "");
  const [career, setCareer] = useState(profile?.targetCareer || "AI/ML Engineer");
  const [level, setLevel] = useState<LearnerProfile["level"]>(profile?.level || "Beginner");
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);

  useEffect(() => {
    if (open && profile) {
      setName(profile.name);
      setCareer(profile.targetCareer);
      setLevel(profile.level);
      setInterests(profile.interests);
    }
  }, [open, profile]);

  const toggle = (i: string) =>
    setInterests((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length < 3 ? [...p, i] : p));

  const save = () => {
    if (!profile) return;
    setProfile({ ...profile, name: name.trim() || profile.name, targetCareer: career, level, interests });
    toast.success("Profile updated — future AI outputs are personalized");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Edit profile</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 mt-4 pb-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 mt-2 rounded-2xl" />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Target career</p>
            <div className="flex flex-wrap gap-2">
              {careers.map((c) => (
                <button
                  key={c}
                  onClick={() => setCareer(c)}
                  className={cn(
                    "px-3.5 h-10 rounded-full text-sm font-medium border-2 transition-all abs-tap",
                    career === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Level</p>
            <div className="grid grid-cols-3 gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "h-11 rounded-2xl text-sm font-medium border-2 abs-tap",
                    level === l ? "border-primary bg-primary-soft text-primary" : "border-border bg-card"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {interestPool.map((i) => {
                const active = interests.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggle(i)}
                    className={cn(
                      "px-3.5 h-10 rounded-full text-sm font-medium border-2 flex items-center gap-1.5 abs-tap",
                      active ? "border-success bg-success-soft text-success" : "border-border bg-card"
                    )}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    {i}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={save} className="w-full h-13 rounded-2xl shadow-lg shadow-primary/20">
            Save changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
