import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getAIConfig() {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  // Check for custom admin API key
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);
    const { data } = await sb.from("admin_settings").select("value").eq("key", "custom_ai_api_key").single();
    if (data?.value && data.value.trim()) {
      // Detect provider from key format
      if (data.value.startsWith("sk-")) {
        return { apiKey: data.value, url: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini" };
      } else if (data.value.startsWith("AIza")) {
        return { apiKey: data.value, url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model: "gemini-2.0-flash" };
      }
      // Default: treat as OpenAI-compatible
      return { apiKey: data.value, url: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini" };
    }
  } catch (e) {
    console.log("No custom key, using default:", e);
  }
  
  if (!LOVABLE_API_KEY) throw new Error("No AI API key configured");
  return { apiKey: LOVABLE_API_KEY, url: "https://ai.gateway.lovable.dev/v1/chat/completions", model: "google/gemini-3-flash-preview" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userContext, imageUrl } = await req.json();
    const aiConfig = await getAIConfig();

    const ctx = userContext || {};
    const lang = ctx.language === "hi" ? "Hinglish (mix of Hindi and English)" : "English";

    const systemPrompt = `You are the AI Tutor of Devrayog NDA AI (DNA) — India's first AI-powered NDA exam preparation platform.

STUDENT CONTEXT:
- Name: ${ctx.name || "Student"}
- Attempt: ${ctx.attempt || "1st"} attempt
- Target Exam: ${ctx.targetExam || "NDA 2026"}
- Preferred Service: ${ctx.service || "Army"}
- Study Medium: ${ctx.medium || "english"}
- Biggest Challenge: ${ctx.challenge || "Not specified"}
- Daily Study Time: ${ctx.studyTime || "3-4"} hours

PERSONALITY:
- You are like a strict but caring senior who genuinely wants this student to clear NDA.
- Address the student by their first name.
- Be direct, practical, and motivating. No generic advice.
- For ${ctx.attempt === "1st" ? "first attempt" : ctx.attempt === "4th+" ? "experienced" : "repeat"} students, adjust your tone: ${ctx.attempt === "1st" ? "encouraging and foundational" : ctx.attempt === "4th+" ? "honest, direct, and strategic" : "supportive but pushing harder"}.
- Respond in ${lang}.
- Keep answers focused on NDA/SSB preparation.
- When asked about Maths, give step-by-step solutions.
- When asked about GK/GAT, give structured answers with key facts.
- For SSB questions, draw from real SSB process knowledge.
- Always end with an actionable next step for the student.

FILE ANALYSIS:
- If the student shares an image or file, analyze it thoroughly.
- For handwritten notes: read and provide feedback.
- For question papers: solve and explain.
- For photos of textbook pages: summarize key points.
- Use markdown formatting for structured answers.`;

    // Build messages with potential image content
    const aiMessages: any[] = [{ role: "system", content: systemPrompt }];

    for (const msg of messages) {
      if (msg.imageUrl) {
        aiMessages.push({
          role: msg.role,
          content: [
            { type: "text", text: msg.content || "Please analyze this image." },
            { type: "image_url", image_url: { url: msg.imageUrl } },
          ],
        });
      } else {
        aiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    const response = await fetch(aiConfig.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: aiMessages,
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
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
