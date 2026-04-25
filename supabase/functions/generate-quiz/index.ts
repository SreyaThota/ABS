import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const tool = {
  type: "function",
  function: {
    name: "build_quiz",
    description: "Build a short quiz (5-20 min) for a learning concept.",
    parameters: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          description: "6 to 8 questions, roughly half fill_blank and half mcq.",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["fill_blank", "mcq"] },
              prompt: {
                type: "string",
                description:
                  "For fill_blank, use ___ (3 underscores) where the blank goes. For mcq, the question.",
              },
              answer: {
                type: "string",
                description: "fill_blank only: the expected short answer (1-3 words).",
              },
              options: {
                type: "array",
                items: { type: "string" },
                description: "mcq only: exactly 4 options.",
              },
              correctIndex: {
                type: "number",
                description: "mcq only: 0-3 index of correct option.",
              },
              explanation: {
                type: "string",
                description: "1 short sentence explaining the answer.",
              },
            },
            required: ["type", "prompt", "explanation"],
          },
        },
      },
      required: ["questions"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content, title, keyConcepts, profile } = await req.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "content required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const level = profile?.level || "Beginner";
    const target = profile?.targetCareer || "general career";

    const sys = `You are CareerOS Quiz Builder. Build a SHORT quiz (5-20 min, 6-8 questions) to test understanding of one concept.
Rules:
- Mix ~50/50 fill_blank and mcq.
- fill_blank: use exactly "___" (3 underscores) for the blank. Answer must be 1-3 words, unambiguous.
- mcq: exactly 4 options, only 1 correct, plausible distractors.
- Calibrate difficulty to a ${level} learner aiming for ${target}.
- Test real understanding, not trivia. Cover the key concepts.
- Keep prompts under 25 words. Keep explanations under 20 words.
- Concept title: "${title || "Concept"}"
- Key concepts to cover: ${(keyConcepts || []).join("; ") || "derive from content"}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: String(content).slice(0, 12000) },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "build_quiz" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit hit. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (resp.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const t = await resp.text();
      console.error("AI gateway:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("No structured output");
    const parsed = JSON.parse(call.function.arguments);

    // sanitize
    const questions = (parsed.questions || []).filter((q: any) => {
      if (q.type === "fill_blank") return q.prompt && q.answer;
      if (q.type === "mcq")
        return q.prompt && Array.isArray(q.options) && q.options.length === 4 && typeof q.correctIndex === "number";
      return false;
    });

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
