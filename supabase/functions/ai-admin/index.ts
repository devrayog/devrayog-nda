import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");
    
    // Check admin role
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roleData || roleData.length === 0) throw new Error("Admin access required");

    const { messages, action } = await req.json();

    // If action is "execute_tools" — AI already decided, we execute
    if (action === "execute_tools") {
      const results = [];
      for (const tool of messages) {
        try {
          const r = await executeTool(adminClient, tool.name, tool.arguments);
          results.push({ tool: tool.name, success: true, result: r });
        } catch (e) {
          results.push({ tool: tool.name, success: false, error: e.message });
        }
      }
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Regular chat with tool-calling
    const systemPrompt = `You are DNA Admin AI — the backend automation assistant for Devrayog NDA AI platform. You have FULL admin access.

YOUR CAPABILITIES:
1. **Add MCQ Questions** — Extract questions from images/PDFs/text and add to topic_questions or pyq_questions tables
2. **Add Current Affairs** — Create current affairs articles from text/images/web content
3. **Add Resources** — Add books, videos, downloads, formulas
4. **Add FAQs** — Create FAQ entries
5. **Add SSB Sets** — Create SSB practice sets (PPDT/TAT/WAT/SRT/SDT)
6. **Add Success Stories** — Add cadet success stories
7. **Send Notifications** — Broadcast announcements to all users
8. **Review Feedback** — Check and summarize user feedback
9. **View Stats** — Get platform statistics

RULES:
- When extracting MCQs from images/text, ALWAYS use the add_topic_questions or add_pyq_questions tool
- For current affairs, use add_current_affairs tool
- Be proactive — if you see content that should be added, add it immediately
- Always confirm what you did after executing
- Format responses in markdown
- When given an image of a question paper, extract ALL questions with options and correct answers
- If you're unsure about correct answers, mark them and mention uncertainty`;

    const tools = [
      {
        type: "function",
        function: {
          name: "add_topic_questions",
          description: "Add MCQ questions to a study topic. Use when admin shares question images/text for Maths/GAT/English topics.",
          parameters: {
            type: "object",
            properties: {
              topic_id: { type: "string", description: "UUID of the study topic" },
              subject: { type: "string", enum: ["maths", "gat", "english"], description: "Subject for the questions" },
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
          description: "Add Previous Year Questions. Use when admin shares PYQ papers.",
          parameters: {
            type: "object",
            properties: {
              year: { type: "number", description: "Year of the paper" },
              paper: { type: "string", description: "Paper name like 'NDA 1' or 'NDA 2'" },
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
          description: "Add current affairs articles to the platform.",
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
          description: "Add resources like books, videos, downloads, formulas.",
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
          description: "Get current platform statistics — user count, tests, feedback, etc.",
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
          description: "List all study topics with their IDs. Use before adding questions to find the right topic_id.",
          parameters: {
            type: "object",
            properties: { subject: { type: "string", enum: ["maths", "gat", "english"] } },
            required: [],
          },
        },
      },
    ];

    // First AI call
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
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

    // Check if AI wants to call tools
    if (choice.finish_reason === "tool_calls" || choice.message?.tool_calls) {
      const toolCalls = choice.message.tool_calls || [];
      const toolResults: any[] = [];

      for (const tc of toolCalls) {
        const args = JSON.parse(tc.function.arguments);
        try {
          const result = await executeTool(adminClient, tc.function.name, args);
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });
        } catch (e) {
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify({ error: e.message }),
          });
        }
      }

      // Second AI call with tool results
      const followUp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            ...aiMessages,
            choice.message,
            ...toolResults,
          ],
        }),
      });

      if (!followUp.ok) throw new Error("AI follow-up error");
      const followData = await followUp.json();
      const content = followData.choices?.[0]?.message?.content || "Done! Actions executed.";
      
      return new Response(JSON.stringify({
        content,
        tools_executed: toolCalls.map((tc: any) => tc.function.name),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Regular text response
    return new Response(JSON.stringify({
      content: choice.message?.content || "I'm ready. Send me questions, images, or tell me what to do.",
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
    case "add_topic_questions": {
      // If no topic_id, find or create one
      let topicId = args.topic_id;
      if (!topicId && args.subject) {
        const { data: topics } = await client.from("study_topics").select("id").eq("subject", args.subject).limit(1);
        if (topics && topics.length > 0) topicId = topics[0].id;
      }
      if (!topicId) return { error: "No topic found. Please specify a topic_id or create a topic first." };
      
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
      return { added: data?.length || 0, message: `Added ${data?.length} questions to topic` };
    }

    case "add_pyq_questions": {
      const rows = args.questions.map((q: any) => ({
        year: args.year,
        paper: args.paper,
        subject: args.subject,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option || "a",
        topic: q.topic || "",
        difficulty: q.difficulty || "medium",
        explanation: q.explanation || "",
        is_active: true,
      }));
      const { data, error } = await client.from("pyq_questions").insert(rows).select("id");
      if (error) throw new Error(error.message);
      return { added: data?.length || 0, message: `Added ${data?.length} PYQ questions` };
    }

    case "add_current_affairs": {
      const rows = args.articles.map((a: any) => ({
        title: a.title,
        body: a.body || "",
        category: a.category || "national",
        link: a.link || null,
        is_featured: a.is_featured || false,
        is_active: true,
      }));
      const { data, error } = await client.from("current_affairs").insert(rows).select("id");
      if (error) throw new Error(error.message);
      return { added: data?.length || 0, message: `Added ${data?.length} current affairs articles` };
    }

    case "add_resources": {
      const rows = args.resources.map((r: any) => ({
        title: r.title,
        type: r.type || "book",
        body: r.body || "",
        category: r.category || "general",
        link: r.link || "",
        image_url: r.image_url || null,
        is_active: true,
      }));
      const { data, error } = await client.from("resources").insert(rows).select("id");
      if (error) throw new Error(error.message);
      return { added: data?.length || 0, message: `Added ${data?.length} resources` };
    }

    case "add_faqs": {
      const rows = args.faqs.map((f: any) => ({
        question: f.question,
        answer: f.answer,
        category: f.category || "general",
        is_active: true,
      }));
      const { data, error } = await client.from("faqs").insert(rows).select("id");
      if (error) throw new Error(error.message);
      return { added: data?.length || 0, message: `Added ${data?.length} FAQs` };
    }

    case "broadcast_notification": {
      const { data: profiles } = await client.from("profiles").select("user_id");
      if (!profiles || profiles.length === 0) return { sent: 0 };
      
      const rows = profiles.map((p: any) => ({
        user_id: p.user_id,
        title: args.title,
        message: args.message,
        type: args.type || "announcement",
        read: false,
      }));
      
      // Insert in batches of 100
      let total = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { data, error } = await client.from("notifications").insert(batch);
        if (error) console.error("Notification batch error:", error);
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
        total_users: users.count || 0,
        total_tests: tests.count || 0,
        pending_feedback: fb.count || 0,
        ai_chats: chats.count || 0,
      };
    }

    case "get_pending_feedback": {
      const { data, error } = await client.from("feedback")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(args.limit || 10);
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
