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
    const daysLeft = ctx.examDate ? Math.max(0, Math.ceil((new Date(ctx.examDate).getTime() - Date.now()) / 86400000)) : 120;

    const systemPrompt = `You are the AI Study Planner of Devrayog NDA AI (DNA) platform.

STUDENT PROFILE:
- Name: ${ctx.name || "Student"}
- Attempt: ${ctx.attempt || "1st"} attempt
- Target Exam: ${ctx.targetExam || "NDA 2026"}
- Service: ${ctx.service || "Army"}
- Medium: ${ctx.medium || "english"}
- Daily Study Time: ${ctx.studyTime || "3-4"} hours
- Biggest Challenge: ${ctx.challenge || "Not specified"}
- DNA Score: ${ctx.dnaScore || 42}/100
- Current Streak: ${ctx.streak || 0} days
- Days Until Exam: ${daysLeft}
- Weak Areas: ${ctx.weakAreas || "Not yet identified"}
- Last Test Score: ${ctx.lastTestScore || "No tests taken yet"}
- Total Questions Solved: ${ctx.totalQuestionsSolved || 0}

INSTRUCTIONS:
- Generate a detailed daily study plan for today.
- Prioritize weak areas but don't ignore strong subjects completely.
- Include specific topics with time allocation.
- For ${ctx.attempt === "1st" ? "first attempt" : ctx.attempt === "4th+" ? "experienced" : "repeat"} students, adjust depth accordingly.
- Include breaks and revision slots.
- Add 1-2 motivational lines personalized to the student.
- Format with clear sections: Morning, Afternoon, Evening, Night.
- Each slot: Subject > Topic > What to do > Time duration.
- End with "Tomorrow's Focus" preview.
- Respond in ${lang}.
- Be specific — no generic advice like "study maths". Say exactly which chapter and what to practice.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate my personalized study plan for today." },
        ],
        stream: true,
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("study-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
