import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export async function getAIConfig() {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
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

export async function callAI(aiConfig: any, messages: any[], stream = true) {
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
    
    const reader = response.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    return new ReadableStream({
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
  }
  
  // OpenAI-compatible
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

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
