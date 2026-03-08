import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Send, Bot, User, ImagePlus, Loader2, Lock, Sparkles,
  Wrench, Plus, History, Trash2, Check, X, AlertTriangle, Eye, Edit3, FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  toolsExecuted?: string[];
  pendingTools?: PendingTool[];
}

interface PendingTool {
  id: string;
  name: string;
  arguments: any;
}

interface ChatSession {
  id: string;
  conversation_id: string;
  messages: Message[];
  updated_at: string;
  context: { title?: string };
}

// ─── Tool label helper ───
const toolLabel = (name: string) => {
  const map: Record<string, string> = {
    add_topic_questions: "Add Topic Questions",
    add_pyq_questions: "Add PYQ Questions",
    add_current_affairs: "Add Current Affairs",
    add_resources: "Add Resources",
    add_faqs: "Add FAQs",
    broadcast_notification: "Broadcast Notification",
  };
  return map[name] || name;
};

const toolSummary = (tool: PendingTool) => {
  const a = tool.arguments;
  switch (tool.name) {
    case "add_topic_questions":
      return `${a.questions?.length || 0} MCQs (${a.subject || "unknown"})`;
    case "add_pyq_questions":
      return `${a.questions?.length || 0} PYQs — ${a.paper} ${a.year}`;
    case "add_current_affairs":
      return `${a.articles?.length || 0} articles`;
    case "add_resources":
      return `${a.resources?.length || 0} resources`;
    case "add_faqs":
      return `${a.faqs?.length || 0} FAQs`;
    case "broadcast_notification":
      return `"${a.title}"`;
    default:
      return JSON.stringify(a).slice(0, 80);
  }
};

// Render a pretty preview of tool arguments
const renderToolPreview = (tool: PendingTool) => {
  const a = tool.arguments;
  switch (tool.name) {
    case "add_topic_questions":
    case "add_pyq_questions": {
      const questions = a.questions || [];
      return (
        <div className="space-y-3">
          {a.subject && <p className="text-xs text-muted-foreground">Subject: <strong>{a.subject}</strong></p>}
          {a.year && <p className="text-xs text-muted-foreground">Paper: {a.paper} {a.year}</p>}
          {questions.map((q: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-1">
              <p className="text-sm font-medium">Q{i + 1}: {q.question}</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {["a", "b", "c", "d"].map(opt => (
                  <p key={opt} className={`px-2 py-1 rounded ${q.correct_option === opt ? "bg-green-500/20 text-green-700 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>
                    {opt.toUpperCase()}) {q[`option_${opt}`]}
                  </p>
                ))}
              </div>
              {q.explanation && <p className="text-[11px] text-muted-foreground italic">💡 {q.explanation}</p>}
            </div>
          ))}
        </div>
      );
    }
    case "add_current_affairs": {
      const articles = a.articles || [];
      return (
        <div className="space-y-3">
          {articles.map((art: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase font-mono">{art.category}</span>
                {art.is_featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600">⭐ Featured</span>}
              </div>
              <p className="text-sm font-medium">{art.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-3">{art.body}</p>
              {art.link && <p className="text-[10px] text-primary truncate">🔗 {art.link}</p>}
            </div>
          ))}
        </div>
      );
    }
    case "add_resources": {
      const resources = a.resources || [];
      return (
        <div className="space-y-2">
          {resources.map((r: any, i: number) => (
            <div key={i} className="p-2 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-sm font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.type} • {r.category}</p>
            </div>
          ))}
        </div>
      );
    }
    case "add_faqs": {
      const faqs = a.faqs || [];
      return (
        <div className="space-y-2">
          {faqs.map((f: any, i: number) => (
            <div key={i} className="p-2 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-sm font-medium">Q: {f.question}</p>
              <p className="text-xs text-muted-foreground">A: {f.answer}</p>
            </div>
          ))}
        </div>
      );
    }
    case "broadcast_notification":
      return (
        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
          <p className="text-sm font-medium">📢 {a.title}</p>
          <p className="text-xs text-muted-foreground">{a.message}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Type: {a.type || "announcement"}</p>
        </div>
      );
    default:
      return <pre className="text-xs overflow-auto">{JSON.stringify(a, null, 2)}</pre>;
  }
};

export default function AdminAI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  // Chat history
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTools, setPendingTools] = useState<PendingTool[]>([]);
  const [editableTools, setEditableTools] = useState<PendingTool[]>([]);
  const [confirmSummary, setConfirmSummary] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editJson, setEditJson] = useState<Record<string, string>>({});

  // ─── Admin check ───
  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
      setIsAdmin(data && data.length > 0);
      setChecking(false);
    });
  }, [user]);

  // ─── Load chat sessions ───
  useEffect(() => {
    if (!user || !isAdmin) return;
    loadSessions();
  }, [user, isAdmin]);

  const loadSessions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);
    if (data) {
      const sessions = data
        .filter((d: any) => {
          const ctx = d.context as any;
          return ctx?.type === "admin_ai";
        })
        .map((d: any) => ({
          id: d.id,
          conversation_id: d.conversation_id,
          messages: (d.messages as any[]) || [],
          updated_at: d.updated_at,
          context: (d.context as any) || {},
        }));
      setChatSessions(sessions);
    }
  };

  // ─── Auto-save current session ───
  const saveSession = useCallback(async (msgs: Message[], sessionId?: string) => {
    if (!user || msgs.length === 0) return;
    const title = msgs[0]?.content?.slice(0, 50) || "Admin AI Chat";
    const context = { type: "admin_ai", title };

    if (sessionId) {
      await supabase.from("chat_history").update({
        messages: msgs as any,
        context: context as any,
        updated_at: new Date().toISOString(),
      }).eq("id", sessionId);
    } else {
      const { data } = await supabase.from("chat_history").insert({
        user_id: user.id,
        messages: msgs as any,
        context: context as any,
      }).select("id, conversation_id").single();
      if (data) {
        setCurrentSessionId(data.id);
        loadSessions();
        return data.id;
      }
    }
    return sessionId;
  }, [user]);

  // ─── Scroll to bottom ───
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── File upload with PDF extraction ───
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 20MB", variant: "destructive" });
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const path = `admin/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("ai-uploads").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("ai-uploads").getPublicUrl(path);
    const isImage = file.type.startsWith("image/");
    const isText = ["txt", "csv", "json", "xml", "md"].includes(ext);
    const isPdf = ext === "pdf";
    const isDoc = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext);

    if (isText) {
      const text = await file.text();
      setFileText(text.slice(0, 50000));
      setFileName(file.name);
      setImagePreview(null);
    } else if (isPdf || isDoc) {
      // Extract text from PDF/Doc using Firecrawl scrape on the public URL
      setFileName(file.name);
      setImagePreview(null);
      setIsExtractingPdf(true);
      toast({ title: "Extracting content...", description: `Reading ${file.name} via AI...` });

      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-admin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            action: "extract_file",
            url: urlData.publicUrl,
          }),
        });
        const result = await res.json();
        if (result.content) {
          setFileText(result.content.slice(0, 50000));
          toast({ title: "Content extracted!", description: `${result.content.length} characters from ${file.name}` });
        } else {
          // Fallback: just send URL
          setFileText(`[PDF File: ${file.name}]\nURL: ${urlData.publicUrl}\n\n(Content extraction failed - AI will try to read via URL)`);
          toast({ title: "Extraction partial", description: "AI will try to read the file via URL", variant: "destructive" });
        }
      } catch (err) {
        setFileText(`[PDF File: ${file.name}]\nURL: ${urlData.publicUrl}\n\n(Content extraction failed)`);
      } finally {
        setIsExtractingPdf(false);
      }
    } else {
      setImagePreview(isImage ? urlData.publicUrl : urlData.publicUrl);
      setFileText(null);
      setFileName(file.name);
    }
    toast({ title: "File uploaded", description: `${file.name} ready` });
  };

  // ─── API call helper ───
  const callAdminAI = async (body: any) => {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed");
    }
    return res.json();
  };

  // ─── Send message ───
  const sendMessage = async () => {
    if (!input.trim() && !imagePreview && !fileText) return;
    let msgContent = input.trim() || "Analyze this file";
    if (fileText) msgContent += `\n\n--- FILE: ${fileName} ---\n${fileText}`;
    else if (fileName && !imagePreview?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
      msgContent += `\n\n[Uploaded file: ${fileName} — URL: ${imagePreview}]`;

    const userMsg: Message = {
      role: "user",
      content: msgContent,
      imageUrl: imagePreview?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? imagePreview ?? undefined : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setImagePreview(null);
    setFileText(null);
    setFileName(null);
    setIsLoading(true);

    try {
      const data = await callAdminAI({
        messages: newMessages.map(m => ({
          role: m.role,
          content: m.content,
          imageUrl: m.imageUrl,
        })),
      });

      if (data.requires_confirmation && data.pending_tools?.length > 0) {
        setPendingTools(data.pending_tools);
        setEditableTools(JSON.parse(JSON.stringify(data.pending_tools)));
        setConfirmSummary(data.content);
        setEditMode(false);
        setEditJson({});
        setConfirmOpen(true);
        const assistantMsg: Message = {
          role: "assistant",
          content: data.content + "\n\n⏳ **Awaiting your confirmation...**",
          toolsExecuted: data.tools_executed,
          pendingTools: data.pending_tools,
        };
        const updatedMsgs = [...newMessages, assistantMsg];
        setMessages(updatedMsgs);
        const sid = await saveSession(updatedMsgs, currentSessionId || undefined);
        if (sid) setCurrentSessionId(sid);
      } else {
        const assistantMsg: Message = {
          role: "assistant",
          content: data.content,
          toolsExecuted: data.tools_executed,
        };
        const updatedMsgs = [...newMessages, assistantMsg];
        setMessages(updatedMsgs);
        const sid = await saveSession(updatedMsgs, currentSessionId || undefined);
        if (sid) setCurrentSessionId(sid);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      const errMsgs = [...newMessages, { role: "assistant" as const, content: `❌ Error: ${e.message}` }];
      setMessages(errMsgs);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Switch to edit mode ───
  const enterEditMode = () => {
    const jsonMap: Record<string, string> = {};
    editableTools.forEach((tool, i) => {
      jsonMap[`${i}`] = JSON.stringify(tool.arguments, null, 2);
    });
    setEditJson(jsonMap);
    setEditMode(true);
  };

  // ─── Apply edits ───
  const applyEdits = () => {
    try {
      const updated = editableTools.map((tool, i) => ({
        ...tool,
        arguments: JSON.parse(editJson[`${i}`] || JSON.stringify(tool.arguments)),
      }));
      setEditableTools(updated);
      setEditMode(false);
      toast({ title: "Edits applied", description: "Preview updated with your changes" });
    } catch (err) {
      toast({ title: "Invalid JSON", description: "Please fix the JSON syntax and try again", variant: "destructive" });
    }
  };

  // ─── Confirm execution ───
  const handleConfirm = async () => {
    setConfirmOpen(false);
    setIsLoading(true);
    try {
      const data = await callAdminAI({
        action: "execute_confirmed",
        tools: editableTools,
        messages: [],
      });

      const resultText = (data.results || [])
        .map((r: any) => r.success ? `✅ ${r.tool}: ${JSON.stringify(r.result)}` : `❌ ${r.tool}: ${r.error}`)
        .join("\n");

      const confirmMsg: Message = {
        role: "assistant",
        content: `### ✅ Changes Applied\n\n${resultText}`,
        toolsExecuted: editableTools.map(t => t.name),
      };
      const updatedMsgs = [...messages, confirmMsg];
      setMessages(updatedMsgs);
      await saveSession(updatedMsgs, currentSessionId || undefined);
      setPendingTools([]);
      setEditableTools([]);
    } catch (e: any) {
      toast({ title: "Execution failed", description: e.message, variant: "destructive" });
      const errMsgs = [...messages, { role: "assistant" as const, content: `❌ Execution failed: ${e.message}` }];
      setMessages(errMsgs);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Reject execution ───
  const handleReject = () => {
    setConfirmOpen(false);
    setPendingTools([]);
    setEditableTools([]);
    const rejectMsg: Message = {
      role: "assistant",
      content: "🚫 **Changes rejected.** No modifications were made to the database.",
    };
    const updatedMsgs = [...messages, rejectMsg];
    setMessages(updatedMsgs);
    saveSession(updatedMsgs, currentSessionId || undefined);
  };

  // ─── Chat session management ───
  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  const loadChat = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setShowHistory(false);
  };

  const deleteChat = async (id: string) => {
    await supabase.from("chat_history").delete().eq("id", id);
    setChatSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) startNewChat();
  };

  // ─── Loading state ───
  if (checking) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-md mx-auto mt-20">
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <h1 className="font-display text-3xl text-gradient-gold mb-2">RESTRICTED</h1>
              <p className="text-muted-foreground text-sm">Admin AI Assistant is only available to administrators.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary" />
              <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="font-display text-xl text-gradient-gold">DNA ADMIN AI</h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest">
                CONFIRMATION-GATED • WEB SEARCH • PDF READER • AUTO-PILOT
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4 mr-1" /> History
            </Button>
            <Button variant="outline" size="sm" onClick={startNewChat}>
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </div>
        </div>

        {/* History sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-border/50 overflow-hidden"
            >
              <div className="p-3 max-h-48 overflow-y-auto space-y-1">
                {chatSessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No chat history yet</p>
                ) : (
                  chatSessions.map(s => (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                        currentSessionId === s.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex-1 min-w-0" onClick={() => loadChat(s)}>
                        <p className="truncate font-medium text-xs">{s.context?.title || "Untitled"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(s.updated_at).toLocaleDateString()} · {s.messages.length} msgs
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => { e.stopPropagation(); deleteChat(s.id); }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 space-y-6">
              <Bot className="h-16 w-16 text-primary/40 mx-auto" />
              <div>
                <h2 className="font-display text-2xl text-gradient-gold mb-2">YOUR AI ADMIN ASSISTANT</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Web search, URL scraping, PDF reading, content creation — all with confirmation & edit before any DB changes.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  { icon: "🌐", label: "Add today's defence news", desc: "Web search → preview → approve" },
                  { icon: "📝", label: "Generate 10 MCQs on Indian History", desc: "AI creates → edit → approve" },
                  { icon: "📄", label: "Upload PDF & extract questions", desc: "Reads PDF content directly" },
                  { icon: "📊", label: "Show platform stats", desc: "Users, tests, feedback" },
                ].map((hint, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(hint.label)}
                    className="text-left p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
                  >
                    <span className="text-lg">{hint.icon}</span>
                    <p className="text-xs font-medium mt-1">{hint.label}</p>
                    <p className="text-[10px] text-muted-foreground">{hint.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl p-4 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/50"
                }`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Uploaded" className="max-w-full max-h-48 rounded-lg mb-2 object-contain" />
                  )}
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/30">
                      <Wrench className="h-3 w-3 text-muted-foreground" />
                      {msg.toolsExecuted.map((t, j) => (
                        <span key={j} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            </motion.div>
          )}
          <div ref={chatEnd} />
        </div>

        {/* File Preview */}
        {(imagePreview || fileText || fileName) && (
          <div className="px-4 pb-2">
            <div className="relative inline-block">
              {imagePreview?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-border" />
              ) : (
                <div className="h-20 px-4 rounded-lg border border-border bg-card flex items-center gap-2">
                  {isExtractingPdf ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <FileText className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <span className="text-xs font-mono text-muted-foreground max-w-[200px] truncate block">{fileName}</span>
                    {fileText && <span className="text-[10px] text-green-600">✓ Content extracted ({fileText.length} chars)</span>}
                  </div>
                </div>
              )}
              <button
                onClick={() => { setImagePreview(null); setFileText(null); setFileName(null); }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
              >×</button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2 items-end">
            <input
              type="file"
              ref={fileRef}
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx,.json,.xml,.md"
              className="hidden"
            />
            <Button variant="outline" size="icon" onClick={() => fileRef.current?.click()} className="shrink-0" disabled={isLoading || isExtractingPdf}>
              <ImagePlus className="h-4 w-4" />
            </Button>
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything... upload PDFs, images — changes require your approval"
              className="min-h-[44px] max-h-32 resize-none"
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading || isExtractingPdf || (!input.trim() && !imagePreview && !fileText && !fileName)} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground mt-1 font-mono text-center">
            🔒 ALL DB WRITES REQUIRE CONFIRMATION • 📄 PDF READER • 🌐 WEB SEARCH • CHAT HISTORY
          </p>
        </div>
      </div>

      {/* Confirmation Dialog with Preview & Edit */}
      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!open) handleReject(); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Review & Confirm Changes
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="preview" className="flex-1 min-h-0 flex flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="preview" className="flex-1">
                <Eye className="h-4 w-4 mr-1" /> Preview
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex-1" onClick={() => { if (!editMode) enterEditMode(); }}>
                <Edit3 className="h-4 w-4 mr-1" /> Edit JSON
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex-1">
                <FileText className="h-4 w-4 mr-1" /> Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 min-h-0">
              <ScrollArea className="h-[50vh]">
                <div className="space-y-4 p-1">
                  {editableTools.map((tool, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm font-semibold">{toolLabel(tool.name)}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {toolSummary(tool)}
                        </span>
                      </div>
                      {renderToolPreview(tool)}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="edit" className="flex-1 min-h-0">
              <ScrollArea className="h-[50vh]">
                <div className="space-y-4 p-1">
                  {editableTools.map((tool, i) => (
                    <div key={i} className="space-y-2">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" />
                        {toolLabel(tool.name)}
                      </p>
                      <Textarea
                        value={editJson[`${i}`] || JSON.stringify(tool.arguments, null, 2)}
                        onChange={e => setEditJson(prev => ({ ...prev, [`${i}`]: e.target.value }))}
                        className="font-mono text-xs min-h-[200px] bg-muted/30"
                      />
                    </div>
                  ))}
                  <Button size="sm" onClick={applyEdits} className="w-full">
                    <Check className="h-4 w-4 mr-1" /> Apply Edits & Update Preview
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="summary" className="flex-1 min-h-0">
              <ScrollArea className="h-[50vh]">
                <div className="p-3 text-sm prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{confirmSummary}</ReactMarkdown>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex gap-2 pt-2 border-t border-border/50">
            <Button variant="outline" onClick={handleReject} className="flex-1">
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Check className="h-4 w-4 mr-1" /> Approve & Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
