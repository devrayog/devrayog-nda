import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getAIConfig() {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  // Check for custom admin API key with provider selection
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);
    
    const [keyRes, providerRes, urlRes, modelRes] = await Promise.all([
      sb.from("admin_settings").select("value").eq("key", "custom_ai_api_key").single(),
      sb.from("admin_settings").select("value").eq("key", "custom_ai_provider").single(),
      sb.from("admin_settings").select("value").eq("key", "custom_ai_base_url").single(),
      sb.from("admin_settings").select("value").eq("key", "custom_ai_model").single(),
    ]);
    
    const apiKey = keyRes.data?.value?.trim();
    const provider = providerRes.data?.value?.trim();
    const baseUrl = urlRes.data?.value?.trim();
    const model = modelRes.data?.value?.trim();
    
    if (apiKey && baseUrl && model) {
      // Claude uses a different API format
      if (provider === "claude") {
        return { apiKey, url: baseUrl, model, provider: "claude" };
      }
      return { apiKey, url: baseUrl, model, provider: provider || "openai" };
    }
  } catch (e) {
    console.log("No custom key, using default:", e);
  }
  
  if (!LOVABLE_API_KEY) throw new Error("No AI API key configured");
  return { apiKey: LOVABLE_API_KEY, url: "https://ai.gateway.lovable.dev/v1/chat/completions", model: "google/gemini-3-flash-preview", provider: "lovable" };
}

async function callAI(aiConfig: any, messages: any[], stream = true) {
  // Claude uses a different API format
  if (aiConfig.provider === "claude") {
    const systemMsg = messages.find((m: any) => m.role === "system");
    const nonSystemMsgs = messages.filter((m: any) => m.role !== "system");
    
    const body: any = {
      model: aiConfig.model,
      max_tokens: 4096,
      stream,
      messages: nonSystemMsgs,
    };
    if (systemMsg) body.system = systemMsg.content;
    
    const response = await fetch(aiConfig.url, {
      method: "POST",
      headers: {
        "x-api-key": aiConfig.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const t = await response.text();
      console.error("Claude API error:", response.status, t);
      throw new Error(`Claude API error: ${response.status}`);
    }
    
    if (!stream) {
      const data = await response.json();
      return data.content?.[0]?.text || "";
    }
    
    // Transform Claude SSE stream to OpenAI format for client compatibility
    const reader = response.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const transformedStream = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }
          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                const openaiChunk = { choices: [{ delta: { content: parsed.delta.text } }] };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`));
              }
            } catch {}
          }
        }
      }
    });
    
    return transformedStream;
  }
  
  // OpenAI-compatible (OpenAI, Gemini, Groq, Together, Sarvam, OpenRouter, Lovable)
  const response = await fetch(aiConfig.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${aiConfig.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: aiConfig.model, messages, stream }),
  });
  
  if (!response.ok) {
    if (response.status === 429) throw { status: 429, message: "Rate limit exceeded" };
    if (response.status === 402) throw { status: 402, message: "AI usage limit reached" };
    const t = await response.text();
    console.error("AI gateway error:", response.status, t);
    throw new Error(`AI service error: ${response.status}`);
  }
  
  if (!stream) {
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
  
  return response.body;
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

    const streamBody = await callAI(aiConfig, aiMessages, true);

    return new Response(streamBody, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    console.error("chat error:", e);
    const status = e?.status || 500;
    const message = e?.message || (e instanceof Error ? e.message : "Unknown error");
    return new Response(JSON.stringify({ error: message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
