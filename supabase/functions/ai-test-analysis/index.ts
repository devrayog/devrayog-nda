import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAIConfig, callAI, corsHeaders } from "../_shared/ai-config.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { testResult, userContext } = await req.json();
    const aiConfig = await getAIConfig();

    const ctx = userContext || {};
    const test = testResult || {};
    const lang = ctx.language === "hi" ? "Hinglish (mix of Hindi and English)" : "English";

    const systemPrompt = `You are the AI Test Analyzer of Devrayog NDA AI (DNA) platform.

STUDENT PROFILE:
- Name: ${ctx.name || "Student"}
- Attempt: ${ctx.attempt || "1st"} attempt
- Target Exam: ${ctx.targetExam || "NDA 2026"}
- DNA Score: ${ctx.dnaScore || 42}/100
- Streak: ${ctx.streak || 0} days

TEST RESULTS:
- Test Type: ${test.testType || "Mock Test"}
- Subject: ${test.subject || "Mixed"}
- Score: ${test.score || 0}
- Correct: ${test.correct || 0}/${test.total || 0}
- Wrong: ${test.wrong || 0}/${test.total || 0}
- Unattempted: ${(test.total || 0) - (test.correct || 0) - (test.wrong || 0)}
- Time Taken: ${test.timeTaken ? Math.round(test.timeTaken / 60) + " minutes" : "N/A"}
- Questions Data: ${JSON.stringify(test.questionsData || []).slice(0, 2000)}

INSTRUCTIONS:
- Analyze the test performance in detail.
- Identify topic-wise strengths and weaknesses from the questions data.
- Calculate accuracy percentage and compare with NDA cutoff requirements.
- Point out patterns: Which topics had most errors? Time management issues?
- For wrong answers, identify if it's a conceptual gap or careless mistake pattern.
- Give a "Diagnosis" — what's going right and what needs immediate fixing.
- Create a "Recovery Plan" — exactly what to study in the next 3 days based on this test.
- Rate the performance: Critical / Needs Work / Good / Excellent.
- Be honest and direct, especially for ${ctx.attempt === "4th+" ? "experienced" : "newer"} students.
- End with one powerful motivational line.
- Respond in ${lang}.`;

    const streamBody = await callAI(aiConfig, [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Analyze my test results and give me a detailed breakdown with recovery plan." },
    ], true);

    return new Response(streamBody, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    console.error("test-analysis error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: e?.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
