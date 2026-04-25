import { useLearningStore, allSkills } from "@/store/learning";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";

const Resume = () => {
  const { entries } = useLearningStore();
  const skills = allSkills(entries);

  const exportResume = () => {
    const lines: string[] = [];
    lines.push("PROFESSIONAL SUMMARY");
    lines.push(
      `Self-driven learner with hands-on experience across ${skills.length} skill area${skills.length !== 1 ? "s" : ""}, building career-aligned competencies through structured learning.`
    );
    lines.push("");
    lines.push("KEY ACHIEVEMENTS");
    entries.forEach((e) => lines.push(`• ${e.resumeBullet}`));
    lines.push("");
    lines.push("SKILLS");
    lines.push(skills.map((s) => s.name).join(" · "));
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ABS-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resume exported");
  };

  return (
    <div className="px-5 pt-12 animate-fade-in">
      <header className="mb-6">
        <p className="text-xs text-muted-foreground tracking-wide uppercase">Resume Builder</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Your living resume</h1>
        <p className="text-sm text-muted-foreground mt-1">Auto-built from your learning history.</p>
      </header>

      {entries.length === 0 ? (
        <div className="abs-card p-8 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Your resume will grow as you learn.</p>
        </div>
      ) : (
        <>
          <section className="abs-card p-5 mb-4">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s.name} className="text-xs px-2.5 py-1 rounded-lg bg-primary-soft text-primary font-medium">
                  {s.name}
                </span>
              ))}
            </div>
          </section>

          <section className="abs-card p-5 mb-4">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Resume bullets</h2>
            <ul className="space-y-3">
              {entries.map((e) => (
                <li key={e.id} className="flex gap-2.5">
                  <span className="w-1 rounded-full bg-gradient-to-b from-primary to-success shrink-0" />
                  <div>
                    <p className="text-sm leading-relaxed text-foreground/90">{e.resumeBullet}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{e.title}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="abs-card p-5 mb-4">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Learning timeline
            </h2>
            <div className="space-y-3">
              {entries.map((e, i) => (
                <div key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    {i < entries.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3 flex-1">
                    <p className="text-sm font-medium leading-snug">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(e.createdAt).toLocaleDateString()} · {e.skills.length} skill{e.skills.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Button onClick={exportResume} className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20 abs-tap">
            <Download className="w-4 h-4 mr-2" /> Export resume
          </Button>
        </>
      )}
    </div>
  );
};

export default Resume;
