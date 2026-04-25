import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingDots } from "@/components/LoadingDots";
import { useLearningStore } from "@/store/learning";
import { supabase } from "@/integrations/supabase/client";
import { extractFileText } from "@/lib/extractText";
import { FileUp, Sparkles, ArrowLeft, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

const loadingPhases = [
  "Reading your material…",
  "Extracting key concepts…",
  "Mapping skills to careers…",
  "Generating your next steps…",
];

const Upload = () => {
  const navigate = useNavigate();
  const addEntry = useLearningStore((s) => s.addEntry);
  const profile = useLearningStore((s) => s.profile);
  const [text, setText] = useState("");
  const [filename, setFilename] = useState<string>("");
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (f: File) => {
    setFilename(f.name);
    setExtracting(true);
    setText("");
    try {
      const extracted = (await extractFileText(f)).trim();
      if (extracted.length < 30) {
        toast.error("Couldn't pull readable text. Scanned PDF? Paste manually below.");
      } else {
        setText(extracted.slice(0, 20000));
        toast.success(`Extracted ${extracted.length.toLocaleString()} characters`);
      }
    } catch (e: any) {
      console.error("extract error:", e);
      toast.error("Couldn't read this file. Try pasting the text manually.");
    } finally {
      setExtracting(false);
    }
  };

  const process = async () => {
    if (text.trim().length < 30) {
      toast.error("Add a bit more content (min ~30 chars)");
      return;
    }
    setLoading(true);
    const interval = setInterval(() => setPhase((p) => (p + 1) % loadingPhases.length), 1100);
    try {
      const { data, error } = await supabase.functions.invoke("process-learning", {
        body: { content: text, profile },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const entry = addEntry({
        title: data.title,
        summary: data.summary,
        keyConcepts: data.keyConcepts || [],
        actionTasks: (data.actionTasks || []).map((t: string) => ({ text: t, done: false })),
        skills: data.skills || [],
        careerRoles: data.careerRoles || [],
        resumeBullet: data.resumeBullet,
        nextStep: data.nextStep,
        readinessDelta: data.readinessDelta || 3,
        sourcePreview: text.slice(0, 200),
      });
      navigate(`/result/${entry.id}`);
    } catch (e: any) {
      toast.error(e.message || "Processing failed");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-5 pt-24 animate-fade-in">
        <div className="abs-card-elevated p-8 text-center" style={{ background: "var(--gradient-hero)" }}>
          <div className="w-14 h-14 rounded-2xl bg-card mx-auto flex items-center justify-center shadow-md mb-5">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Processing with AI</h2>
          <LoadingDots label={loadingPhases[phase]} />
          <p className="text-xs text-muted-foreground">Mapping your learning to career outcomes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 abs-tap">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-semibold tracking-tight">New learning</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Paste notes or upload a file. Any format.</p>

      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full abs-card p-5 flex items-center gap-4 mb-4 abs-tap border-dashed"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary-soft flex items-center justify-center">
          <FileUp className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className="text-sm font-medium">{filename || "Upload file"}</p>
          <p className="text-xs text-muted-foreground truncate">
            {filename ? "Tap to change" : "PDF, txt, md, docx — any format"}
          </p>
        </div>
      </button>

      <div className="abs-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Or paste text</span>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your lecture notes, study material, meeting transcript…"
          className="min-h-[200px] border-0 bg-transparent focus-visible:ring-0 text-sm resize-none p-0"
        />
        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-muted-foreground">{text.length} chars</span>
        </div>
      </div>

      <Button
        onClick={process}
        className="w-full h-14 rounded-2xl text-base font-medium shadow-lg shadow-primary/25 abs-tap"
      >
        <Sparkles className="w-5 h-5 mr-2" /> Process with AI
      </Button>
    </div>
  );
};

export default Upload;
