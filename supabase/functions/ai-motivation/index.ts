import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const ctx = userContext || {};
    const lang = ctx.language === "hi" ? "Hinglish (mix of Hindi and English)" : "English";
    const hour = new Date().getUTCHours() + 5.5; // IST offset
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";

    const systemPrompt = `You are the AI Motivator of Devrayog NDA AI (DNA) — India's first AI-powered NDA exam preparation platform.

STUDENT CONTEXT:
- Name: ${ctx.name || "Student"}
- Attempt: ${ctx.attempt || "1st"} attempt
- Service Goal: ${ctx.service || "Army"}
- DNA Score: ${ctx.dnaScore || 42}/100
- Current Streak: ${ctx.streak || 0} days
- Days Since Last Login: ${ctx.daysSinceLastLogin || 0}
- Last Test Score: ${ctx.lastTestScore || "No tests yet"}
- Total Questions Solved: ${ctx.totalQuestionsSolved || 0}
- Time of Day: ${timeOfDay} (IST)
- Exam Days Left: ${ctx.daysUntilExam || 120}

INSTRUCTIONS:
- Generate a SHORT, powerful personalized motivational message (3-5 lines max).
- Address by first name.
- Reference their actual data — streak, score, days left.
- Time-aware: ${timeOfDay === "morning" ? "Energize them for the day" : timeOfDay === "afternoon" ? "Keep them focused" : timeOfDay === "evening" ? "Push for one more session" : "Acknowledge their dedication, suggest rest"}.
- ${ctx.streak === 0 ? "They broke their streak — acknowledge it but push them to restart TODAY." : ctx.streak && ctx.streak > 7 ? "Celebrate their consistency!" : "Encourage streak building."}
- ${ctx.daysSinceLastLogin && ctx.daysSinceLastLogin > 2 ? "They've been away — welcome back firmly, remind them competitors aren't resting." : ""}
- For ${ctx.attempt === "4th+" ? "experienced students: be real, direct, no sugarcoating" : ctx.attempt === "1st" ? "first timers: be encouraging, build confidence" : "repeat students: push harder"}.
- Tone: Like a strict but caring senior/mentor. NOT generic motivational quotes.
- End with ONE specific action they should do RIGHT NOW.
- Respond in ${lang}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Give me my personalized motivation for right now." },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const motivation = data.choices?.[0]?.message?.content || "Keep pushing, cadet. Your dream is waiting.";

    return new Response(JSON.stringify({ motivation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("motivation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
