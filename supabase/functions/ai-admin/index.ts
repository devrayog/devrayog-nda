import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tools that READ data (no confirmation needed)
const READ_ONLY_TOOLS = new Set(["web_search", "web_scrape", "get_platform_stats", "get_pending_feedback", "get_study_topics"]);

// Tools that WRITE data (need confirmation)
const WRITE_TOOLS = new Set(["add_topic_questions", "add_pyq_questions", "add_current_affairs", "add_resources", "add_faqs", "broadcast_notification"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");
    
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roleData || roleData.length === 0) throw new Error("Admin access required");

    const { messages, action, tools: pendingTools, url } = await req.json();

    // ACTION: Extract file content (PDF, etc.) via Firecrawl
    if (action === "extract_file") {
      const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Firecrawl not configured", content: null }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
        });

        const data = await response.json();
        const content = data.data?.markdown || data.markdown || "";

        return new Response(JSON.stringify({ content: content.slice(0, 50000) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message, content: null }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ACTION: Execute confirmed tools
    if (action === "execute_confirmed") {
      const results = [];
      for (const tool of pendingTools) {
        try {
          const r = await executeTool(adminClient, tool.name, tool.arguments);
          results.push({ tool: tool.name, success: true, result: r });
        } catch (e) {
          results.push({ tool: tool.name, success: false, error: e.message });
        }
      }
      return new Response(JSON.stringify({ results, action: "executed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Regular chat with tool-calling
    const systemPrompt = `You are DNA Admin AI — the backend automation assistant for Devrayog NDA AI platform. You have FULL admin access.

You are a CONTENT CREATOR with WEB ACCESS. You CREATE content and ADD it to the database using tools. You do NOT ask permission, you do NOT hedge, you do NOT say "I can't access the internet" or "my knowledge has a cutoff." You just DO IT.

🌐 WEB POWERS: You have web_search and web_scrape tools. USE THEM PROACTIVELY:
- When asked about current affairs/news → FIRST use web_search to find REAL latest news, then use add_current_affairs with REAL data
- When asked to add content about a specific topic → web_search for accurate info first
- When given a URL → use web_scrape to extract content from it
- For defence news, use queries like "India defence news today", "Indian military latest", etc.
- ALWAYS search the web first for current affairs — your training data may be outdated

WORKFLOW FOR CURRENT AFFAIRS:
1. Call web_search with relevant query (e.g. "India defence news today 2026")
2. Read the search results
3. Use the REAL information to create accurate current affairs articles
4. Call add_current_affairs with the real data

WHEN THE ADMIN SAYS "add defence news" or "add current affairs" or anything similar:
→ FIRST call web_search to get REAL latest news
→ Then call add_current_affairs with accurate, real articles based on search results
→ DO NOT make up fake news. Use web_search results.

WHEN THE ADMIN SAYS "generate MCQs on [topic]":
→ IMMEDIATELY call add_topic_questions with 5-10 high-quality MCQs
→ Include correct answers and explanations

WHEN THE ADMIN UPLOADS an image/file:
→ Extract ALL questions/content and add to database immediately

WHEN THE ADMIN GIVES A URL:
→ Use web_scrape to extract content from the URL
→ Then process it (add questions, create articles, etc.)

AVAILABLE TOOLS: web_search, web_scrape, add_topic_questions, add_pyq_questions, add_current_affairs, add_resources, add_faqs, broadcast_notification, get_platform_stats, get_pending_feedback, get_study_topics

NOTE: Write operations (add_*, broadcast_*) will be shown to the admin for confirmation before executing. Read operations (web_search, web_scrape, get_*) execute immediately.

ABSOLUTE PROHIBITIONS — NEVER SAY ANY OF THESE:
- "I cannot access external websites"
- "I don't have real-time access"  
- "My knowledge has a cutoff"
- "Please confirm if you'd like me to proceed"
- "I cannot browse the internet"
- "Would you like me to create a hypothetical..."
- Any variation of asking permission or disclaiming capability

YOU ARE AN ACTION-TAKER WITH WEB ACCESS. When told to do something, you DO IT with the tools. No questions, no hedging, no disclaimers. Search the web first for current information.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "web_search",
          description: "Search the web for real-time information. Use this to find latest news, current affairs, facts, and any information needed. ALWAYS use this before creating current affairs articles to get REAL data.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query" },
              limit: { type: "number", description: "Number of results (default 5, max 10)" },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "web_scrape",
          description: "Scrape/crawl a specific URL to extract its content as markdown.",
          parameters: {
            type: "object",
            properties: {
              url: { type: "string", description: "The URL to scrape" },
            },
            required: ["url"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_topic_questions",
          description: "Add MCQ questions to a study topic.",
          parameters: {
            type: "object",
            properties: {
              topic_id: { type: "string", description: "UUID of the study topic" },
              subject: { type: "string", enum: ["maths", "gat", "english"] },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    option_a: { type: "string" },
                    option_b: { type: "string" },
                    option_c: { type: "string" },
                    option_d: { type: "string" },
                    correct_option: { type: "string", enum: ["a", "b", "c", "d"] },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                    explanation: { type: "string" },
                  },
                  required: ["question", "option_a", "option_b", "option_c", "option_d", "correct_option"],
                },
              },
            },
            required: ["questions", "subject"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_pyq_questions",
          description: "Add Previous Year Questions.",
          parameters: {
            type: "object",
            properties: {
              year: { type: "number" },
              paper: { type: "string" },
              subject: { type: "string", enum: ["maths", "gat", "english"] },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    option_a: { type: "string" },
                    option_b: { type: "string" },
                    option_c: { type: "string" },
                    option_d: { type: "string" },
                    correct_option: { type: "string", enum: ["a", "b", "c", "d"] },
                    topic: { type: "string" },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                    explanation: { type: "string" },
                  },
                  required: ["question", "option_a", "option_b", "option_c", "option_d", "correct_option"],
                },
              },
            },
            required: ["year", "paper", "subject", "questions"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_current_affairs",
          description: "Add current affairs articles. Use AFTER web_search for REAL news.",
          parameters: {
            type: "object",
            properties: {
              articles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    body: { type: "string" },
                    category: { type: "string", enum: ["national", "international", "defence", "science", "sports", "economy"] },
                    link: { type: "string" },
                    is_featured: { type: "boolean" },
                  },
                  required: ["title", "body", "category"],
                },
              },
            },
            required: ["articles"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_resources",
          description: "Add resources like books, videos, downloads.",
          parameters: {
            type: "object",
            properties: {
              resources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    type: { type: "string", enum: ["book", "video", "download", "formula"] },
                    body: { type: "string" },
                    category: { type: "string" },
                    link: { type: "string" },
                    image_url: { type: "string" },
                  },
                  required: ["title", "type"],
                },
              },
            },
            required: ["resources"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_faqs",
          description: "Add FAQ entries.",
          parameters: {
            type: "object",
            properties: {
              faqs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" },
                    category: { type: "string" },
                  },
                  required: ["question", "answer"],
                },
              },
            },
            required: ["faqs"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "broadcast_notification",
          description: "Send announcement notification to all users.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              message: { type: "string" },
              type: { type: "string", enum: ["info", "alert", "success", "announcement"] },
            },
            required: ["title", "message"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_platform_stats",
          description: "Get current platform statistics.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "get_pending_feedback",
          description: "Get recent pending feedback from users.",
          parameters: { type: "object", properties: { limit: { type: "number" } }, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "get_study_topics",
          description: "List all study topics with their IDs.",
          parameters: {
            type: "object",
            properties: { subject: { type: "string", enum: ["maths", "gat", "english"] } },
            required: [],
          },
        },
      },
    ];

    // Build AI messages
    const aiMessages: any[] = [{ role: "system", content: systemPrompt }];
    for (const msg of messages) {
      if (msg.imageUrl) {
        aiMessages.push({
          role: msg.role,
          content: [
            { type: "text", text: msg.content || "Analyze this and take appropriate action." },
            { type: "image_url", image_url: { url: msg.imageUrl } },
          ],
        });
      } else {
        aiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    // Multi-round tool calling
    let currentMessages = [...aiMessages];
    let allToolsExecuted: string[] = [];
    let pendingWriteTools: any[] = [];
    let maxRounds = 3;

    for (let round = 0; round < maxRounds; round++) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: currentMessages,
          tools,
          tool_choice: "auto",
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("AI error:", response.status, t);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit. Try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI service error");
      }

      const aiData = await response.json();
      const choice = aiData.choices?.[0];
      if (!choice) throw new Error("No AI response");

      if (choice.finish_reason === "tool_calls" || choice.message?.tool_calls) {
        const toolCalls = choice.message.tool_calls || [];
        const toolResults: any[] = [];
        let hasWriteTools = false;

        for (const tc of toolCalls) {
          const args = JSON.parse(tc.function.arguments);
          const toolName = tc.function.name;

          if (READ_ONLY_TOOLS.has(toolName)) {
            // Execute read tools immediately
            try {
              const result = await executeTool(adminClient, toolName, args);
              toolResults.push({
                role: "tool",
                tool_call_id: tc.id,
                content: JSON.stringify(result),
              });
              allToolsExecuted.push(toolName);
            } catch (e) {
              toolResults.push({
                role: "tool",
                tool_call_id: tc.id,
                content: JSON.stringify({ error: e.message }),
              });
              allToolsExecuted.push(toolName);
            }
          } else if (WRITE_TOOLS.has(toolName)) {
            // Queue write tools for confirmation
            pendingWriteTools.push({
              id: tc.id,
              name: toolName,
              arguments: args,
            });
            // Return a fake "pending" result so AI can continue
            toolResults.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify({ status: "pending_confirmation", message: `${toolName} queued for admin confirmation` }),
            });
            hasWriteTools = true;
          }
        }

        currentMessages.push(choice.message);
        currentMessages.push(...toolResults);

        // If we have write tools pending, break out to return them for confirmation
        if (hasWriteTools) {
          // Get AI's summary of what it wants to do
          const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [...currentMessages, {
                role: "user",
                content: "Summarize what changes you're about to make to the database. Be specific about counts and types of content. Keep it brief."
              }],
            }),
          });
          const summaryData = await summaryResponse.json();
          const summary = summaryData.choices?.[0]?.message?.content || "Database changes pending.";

          return new Response(JSON.stringify({
            content: summary,
            pending_tools: pendingWriteTools,
            tools_executed: allToolsExecuted.length > 0 ? allToolsExecuted : undefined,
            requires_confirmation: true,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        continue;
      }

      // Regular text response
      return new Response(JSON.stringify({
        content: choice.message?.content || "Done!",
        tools_executed: allToolsExecuted.length > 0 ? allToolsExecuted : undefined,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exhausted rounds
    const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: currentMessages,
      }),
    });

    const finalData = await finalResponse.json();
    const finalContent = finalData.choices?.[0]?.message?.content || "Done!";

    return new Response(JSON.stringify({
      content: finalContent,
      tools_executed: allToolsExecuted.length > 0 ? allToolsExecuted : undefined,
      pending_tools: pendingWriteTools.length > 0 ? pendingWriteTools : undefined,
      requires_confirmation: pendingWriteTools.length > 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Admin AI error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function executeTool(client: any, name: string, args: any): Promise<any> {
  switch (name) {
    case "web_search": {
      const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
      if (!apiKey) throw new Error("Firecrawl not configured");

      const response = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: args.query,
          limit: args.limit || 5,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Search failed: ${response.status}`);

      const results = (data.data || []).map((r: any, i: number) => ({
        index: i + 1,
        title: r.title || "Untitled",
        url: r.url || "",
        description: r.description || "",
        content: (r.markdown || "").slice(0, 3000),
      }));

      return { results, total: results.length, query: args.query };
    }

    case "web_scrape": {
      const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
      if (!apiKey) throw new Error("Firecrawl not configured");

      let url = args.url.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;

      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Scrape failed: ${response.status}`);

      const content = data.data?.markdown || data.markdown || "";
      return {
        url,
        title: data.data?.metadata?.title || "Untitled",
        content: content.slice(0, 10000),
      };
    }

    case "add_topic_questions": {
      let topicId = args.topic_id;
      if (!topicId && args.subject) {
        const { data: topics } = await client.from("study_topics").select("id").eq("subject", args.subject).limit(1);
        if (topics && topics.length > 0) topicId = topics[0].id;
      }
      if (!topicId) return { error: "No topic found." };
      
      const rows = args.questions.map((q: any) => ({
        topic_id: topicId,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option || "a",
        difficulty: q.difficulty || "medium",
        explanation: q.explanation || "",
        is_active: true,
      }));
      const { data, error } = await client.from("topic_questions").insert(rows).select("id");
      if (error) throw new Error(error.message);
      return { added: data?.length || 0, message: `Added ${data?.length} questions` };
    }

    case "add_pyq_questions": {
      const rows = args.questions.map((q: any) => ({
        year: args.year, paper: args.paper, subject: args.subject,
        question: q.question, option_a: q.option_a, option_b: q.option_b,
        option_c: q.option_c, option_d: q.option_d,
        correct_option: q.correct_option || "a", topic: q.topic || "",
        difficulty: q.difficulty || "medium", explanation: q.explanation || "",
        is_active: true,
      }));
      const { data, error } = await client.from("pyq_questions").insert(rows).select("id");
      if (error) throw new Error(error.message);
      return { added: data?.length || 0, message: `Added ${data?.length} PYQ questions` };
    }

    case "add_current_affairs": {
      const rows = args.articles.map((a: any) => ({
        title: a.title, body: a.body || "", category: a.category || "national",
        link: a.link || null, is_featured: a.is_featured || false, is_active: true,
      }));
      const { data, error } = await client.from("current_affairs").insert(rows).select("id");
      if (error) throw new Error(error.message);
      return { added: data?.length || 0, message: `Added ${data?.length} articles` };
    }

    case "add_resources": {
      const rows = args.resources.map((r: any) => ({
        title: r.title, type: r.type || "book", body: r.body || "",
        category: r.category || "general", link: r.link || "",
        image_url: r.image_url || null, is_active: true,
      }));
      const { data, error } = await client.from("resources").insert(rows).select("id");
      if (error) throw new Error(error.message);
      return { added: data?.length || 0, message: `Added ${data?.length} resources` };
    }

    case "add_faqs": {
      const rows = args.faqs.map((f: any) => ({
        question: f.question, answer: f.answer, category: f.category || "general", is_active: true,
      }));
      const { data, error } = await client.from("faqs").insert(rows).select("id");
      if (error) throw new Error(error.message);
      return { added: data?.length || 0, message: `Added ${data?.length} FAQs` };
    }

    case "broadcast_notification": {
      const { data: profiles } = await client.from("profiles").select("user_id");
      if (!profiles || profiles.length === 0) return { sent: 0 };
      const rows = profiles.map((p: any) => ({
        user_id: p.user_id, title: args.title, message: args.message,
        type: args.type || "announcement", read: false,
      }));
      let total = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        await client.from("notifications").insert(batch);
        total += batch.length;
      }
      return { sent: total, message: `Broadcast sent to ${total} users` };
    }

    case "get_platform_stats": {
      const [users, tests, fb, chats] = await Promise.all([
        client.from("profiles").select("id", { count: "exact", head: true }),
        client.from("test_results").select("id", { count: "exact", head: true }),
        client.from("feedback").select("id", { count: "exact", head: true }).eq("status", "pending"),
        client.from("chat_history").select("id", { count: "exact", head: true }),
      ]);
      return {
        total_users: users.count || 0, total_tests: tests.count || 0,
        pending_feedback: fb.count || 0, ai_chats: chats.count || 0,
      };
    }

    case "get_pending_feedback": {
      const { data, error } = await client.from("feedback")
        .select("*").eq("status", "pending")
        .order("created_at", { ascending: false }).limit(args.limit || 10);
      if (error) throw new Error(error.message);
      return { feedback: data, count: data?.length || 0 };
    }

    case "get_study_topics": {
      let query = client.from("study_topics").select("id, name, subject, slug").eq("is_active", true);
      if (args.subject) query = query.eq("subject", args.subject);
      const { data, error } = await query.order("sort_order");
      if (error) throw new Error(error.message);
      return { topics: data };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
