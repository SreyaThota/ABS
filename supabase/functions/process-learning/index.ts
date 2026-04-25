import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const tool = {
  type: "function",
  function: {
    name: "structure_learning",
    description: "Convert learning material into a structured career-oriented breakdown.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short title for this learning entry (max 6 words)." },
        summary: { type: "string", description: "2-3 sentence student-friendly summary." },
        keyConcepts: {
          type: "array",
          items: { type: "string" },
          description: "3-6 must-know concepts as short bullet phrases.",
        },
        actionTasks: {
          type: "array",
          items: { type: "string" },
          description: "3-5 concrete next-step study tasks (actionable verbs).",
        },
        skills: {
          type: "array",
          items: { type: "string" },
          description: "2-5 specific skills built (e.g. 'SQL Joins', 'Linear Regression').",
        },
        careerRoles: {
          type: "array",
          items: { type: "string" },
          description: "2-4 real job roles this learning maps to.",
        },
        resumeBullet: {
          type: "string",
          description: "One polished resume bullet (action verb + skill + outcome).",
        },
        nextStep: { type: "string", description: "One sentence: what to learn next." },
        readinessDelta: {
          type: "number",
          description: "Estimated career readiness increase, 1-8.",
        },
      },
      required: [
        "title", "summary", "keyConcepts", "actionTasks",
        "skills", "careerRoles", "resumeBullet", "nextStep", "readinessDelta",
      ],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "content required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are CareerOS AI — a career GPS for students. Convert any learning material into a structured, action-oriented breakdown that connects study to real careers. Use simple language. Be concise, direct, and student-friendly. Always prioritize 'what to do next' and real-world career relevance.",
          },
          { role: "user", content: content.slice(0, 12000) },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "structure_learning" } },
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

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-learning error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
