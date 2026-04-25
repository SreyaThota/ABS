import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ChatMessage";
import { useLearningStore } from "@/store/learning";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const Chat = () => {
  const navigate = useNavigate();
  const profile = useLearningStore((s) => s.profile);
  const entries = useLearningStore((s) => s.entries);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const target = profile?.targetCareer || "your target career";
  const starters =
    entries.length === 0
      ? [
          "How does this app work?",
          `What should I learn first for ${target}?`,
          "How do I track career readiness?",
        ]
      : [
          `Am I a good fit for ${target}?`,
          "What skills am I missing?",
          "Which concept should I learn next?",
        ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-chat`;
      const resp = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next,
          profile,
          entries: entries.map((e) => ({
            title: e.title,
            conceptId: e.conceptId,
            summary: e.summary,
            skills: e.skills,
            careerRoles: e.careerRoles,
            quizPassed: e.quizPassed,
            quizBestScore: e.quizBestScore,
            quizAttempts: e.quizAttempts,
          })),
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Too many requests. Try again in a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Top up to continue.");
        else toast.error("Coach unavailable right now.");
        setMessages((prev) => prev.filter((m) => m !== userMsg));
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error(e);
        toast.error("Connection lost.");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] animate-fade-in">
      <header className="px-5 md:px-0 pt-12 md:pt-8 pb-3 flex items-center gap-3 border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="abs-tap">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold tracking-tight">Career Coach</h1>
          <p className="text-[11px] text-muted-foreground truncate">
            Personalized to your profile · {entries.length} concept{entries.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
        {messages.length === 0 && (
          <>
            <div className="abs-card p-4 mb-2" style={{ background: "var(--gradient-hero)" }}>
              <p className="text-sm font-medium">
                Hey {profile?.name || "there"} 👋
              </p>
              <p className="text-xs text-foreground/75 mt-1 leading-relaxed">
                Ask me anything about your fit for <strong>{target}</strong>, what to learn next,
                or how your uploaded concepts connect to careers.
              </p>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">
              Try asking
            </p>
            {starters.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="w-full abs-card p-3 text-left text-sm abs-tap hover:bg-muted/50"
              >
                {s}
              </button>
            ))}
          </>
        )}

        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}

        {streaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-9">
            <Loader2 className="w-3 h-3 animate-spin" /> Coach is thinking…
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="abs-card-elevated flex items-end gap-2 p-2 rounded-2xl"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask your coach…"
            rows={1}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-sm py-2 px-2 max-h-32 placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || streaming}
            className="rounded-xl h-9 w-9 shrink-0"
          >
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
