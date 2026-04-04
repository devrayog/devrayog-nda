import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAIConfig, callAI, corsHeaders } from "../_shared/ai-config.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userContext } = await req.json();
    const aiConfig = await getAIConfig();

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

    const streamBody = await callAI(aiConfig, [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate my personalized study plan for today." },
    ], true);

    return new Response(streamBody, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    console.error("study-plan error:", e);
    const status = e?.status || 500;
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
