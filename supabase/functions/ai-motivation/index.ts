import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAIConfig, callAI, corsHeaders } from "../_shared/ai-config.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userContext } = await req.json();
    const aiConfig = await getAIConfig();

    const ctx = userContext || {};
    const lang = ctx.language === "hi" ? "Hinglish (mix of Hindi and English)" : "English";
    const hour = new Date().getUTCHours() + 5.5;
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

    // Use a lighter model for motivation to save credits
    const motivationConfig = { ...aiConfig };
    if (aiConfig.provider === "lovable") {
      motivationConfig.model = "google/gemini-2.5-flash-lite";
    }

    const result = await callAI(motivationConfig, [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Give me my personalized motivation for right now." },
    ], false);

    return new Response(JSON.stringify({ motivation: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("motivation error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: e?.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
