import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Send, Bot, User, ImagePlus, Loader2, Lock, Sparkles, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  toolsExecuted?: string[];
}

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
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
      setIsAdmin(data && data.length > 0);
      setChecking(false);
    });
  }, [user]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 20MB", variant: "destructive" });
      return;
    }

    // Upload to storage
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const path = `admin/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("ai-uploads").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("ai-uploads").getPublicUrl(path);
    
    // For non-image files, extract text client-side if possible
    const isImage = file.type.startsWith("image/");
    const isText = ["txt", "csv", "json", "xml", "md"].includes(ext);
    
    if (isText) {
      const text = await file.text();
      setFileText(text.slice(0, 50000)); // limit to 50k chars
      setFileName(file.name);
      setImagePreview(null);
    } else if (isImage) {
      setImagePreview(urlData.publicUrl);
      setFileText(null);
      setFileName(file.name);
    } else {
      // PDF, PPT, Excel — upload URL, AI will analyze the image/description
      setImagePreview(urlData.publicUrl);
      setFileText(null);
      setFileName(file.name);
    }
    
    toast({ title: "File uploaded", description: `${file.name} ready to send` });
  };

  const sendMessage = async () => {
    if (!input.trim() && !imagePreview) return;
    
    // Build content with file context
    let msgContent = input.trim() || "Analyze this file";
    if (fileText) {
      msgContent += `\n\n--- FILE: ${fileName} ---\n${fileText}`;
    } else if (fileName && !imagePreview?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      msgContent += `\n\n[Uploaded file: ${fileName} — URL: ${imagePreview}]`;
    }
    
    const userMsg: Message = {
      role: "user",
      content: msgContent,
      imageUrl: imagePreview?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? imagePreview : undefined,
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setImagePreview(null);
    setFileText(null);
    setFileName(null);
    setIsLoading(true);

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
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
            imageUrl: m.imageUrl,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.content,
        toolsExecuted: data.tools_executed,
      }]);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ Error: ${e.message}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="p-4 border-b border-border/50 flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary" />
            <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="font-display text-xl text-gradient-gold">DNA ADMIN AI</h1>
            <p className="text-[10px] text-muted-foreground font-mono tracking-widest">
              AUTO-PILOT • QUESTIONS • CONTENT • ANALYTICS
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 space-y-6">
              <Bot className="h-16 w-16 text-primary/40 mx-auto" />
              <div>
                <h2 className="font-display text-2xl text-gradient-gold mb-2">YOUR AI ADMIN ASSISTANT</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Send me question papers, PDFs, images — I'll extract questions and add them directly to the database. I can also fetch current affairs, manage content, and send notifications.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  { icon: "🌐", label: "Add today's defence news", desc: "I'll search web & add real news" },
                  { icon: "📝", label: "Send question paper image", desc: "I'll extract & add MCQs" },
                  { icon: "🔗", label: "Scrape this URL for content", desc: "I'll crawl & extract data" },
                  { icon: "📊", label: "Show platform stats", desc: "Users, tests, feedback" },
                ].map((hint, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(hint.label.replace(/"/g, ""))}
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
                    <p className="text-sm">{msg.content}</p>
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
                <span className="text-sm text-muted-foreground">Processing & executing...</span>
              </div>
            </motion.div>
          )}
          <div ref={chatEnd} />
        </div>

        {/* Image Preview */}
        {(imagePreview || fileText || fileName) && (
          <div className="px-4 pb-2">
            <div className="relative inline-block">
              {imagePreview?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-border" />
              ) : (
                <div className="h-20 px-4 rounded-lg border border-border bg-card flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground max-w-[200px] truncate">{fileName}</span>
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileRef.current?.click()}
              className="shrink-0"
              disabled={isLoading}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder="Send question papers, ask to add content, fetch news..."
              className="min-h-[44px] max-h-32 resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !imagePreview && !fileText && !fileName)}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground mt-1 font-mono text-center">
            ADMIN-ONLY • AUTO-EXECUTES DB OPERATIONS • UPLOAD IMAGES/PDFS FOR AUTO-EXTRACTION
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
