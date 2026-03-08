import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { testResult, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
          { role: "user", content: "Analyze my test results and give me a detailed breakdown with recovery plan." },
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
    console.error("test-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
