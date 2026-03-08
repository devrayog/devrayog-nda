import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Paperclip, Image, X, History, Plus, Trash2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  generatedImages?: string[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const STORAGE_KEY = "dna_chat_history";

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs.slice(0, 50)));
}

export default function AITutor() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = user?.user_metadata || {};

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save current conversation
  const saveCurrentConv = useCallback((msgs: Message[]) => {
    if (msgs.length === 0) return;
    const title = msgs[0]?.content?.slice(0, 40) || "New Chat";
    const id = activeConvId || crypto.randomUUID();
    if (!activeConvId) setActiveConvId(id);
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      const updated = [{ id, title, messages: msgs, updatedAt: new Date().toISOString() }, ...filtered];
      saveConversations(updated);
      return updated;
    });
  }, [activeConvId]);

  // Also persist to database
  const persistToDb = useCallback(async (msgs: Message[]) => {
    if (!user || msgs.length === 0) return;
    const convId = activeConvId || crypto.randomUUID();
    await supabase.from("chat_history").upsert({
      user_id: user.id,
      conversation_id: convId,
      messages: msgs as any,
      context: { userMeta: meta } as any,
      updated_at: new Date().toISOString(),
    }, { onConflict: "conversation_id" });
  }, [user, activeConvId, meta]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Max 10MB allowed", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage.from("ai-uploads").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("ai-uploads").getPublicUrl(data.path);
    setAttachedFile({ url: urlData.publicUrl, name: file.name });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const generateImage = async (prompt: string) => {
    setGeneratingImage(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-image-gen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt }),
      });
      if (!resp.ok) throw new Error("Image generation failed");
      const data = await resp.json();
      const imageUrls = (data.images || []).map((img: any) => img.image_url?.url).filter(Boolean);
      return { text: data.text || "Here's the generated image:", images: imageUrls };
    } catch (e: any) {
      toast({ title: "Image generation failed", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setGeneratingImage(false);
    }
  };

  const send = async () => {
    if ((!input.trim() && !attachedFile) || loading) return;
    const text = input.trim();
    const isImageRequest = /^(generate|create|draw|make|design)\s+(an?\s+)?(image|picture|photo|illustration|diagram)/i.test(text);

    const userMsg: Message = {
      role: "user",
      content: text || (attachedFile ? `Analyze this file: ${attachedFile.name}` : ""),
      imageUrl: attachedFile?.url,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    const currentFile = attachedFile;
    setAttachedFile(null);
    setLoading(true);

    // Handle image generation
    if (isImageRequest) {
      const result = await generateImage(text);
      if (result) {
        const assistantMsg: Message = {
          role: "assistant",
          content: result.text,
          generatedImages: result.images,
        };
        const finalMsgs = [...newMessages, assistantMsg];
        setMessages(finalMsgs);
        saveCurrentConv(finalMsgs);
        persistToDb(finalMsgs);
      }
      setLoading(false);
      return;
    }

    // Stream chat
    let assistantContent = "";
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            ...(m.imageUrl ? { imageUrl: m.imageUrl } : {}),
          })),
          userContext: {
            name: meta.full_name || "Student",
            attempt: meta.attempt || "1st",
            service: meta.service || "army",
            medium: meta.medium || "english",
            challenge: meta.challenge || "",
            studyTime: meta.study_time || "3-4",
            targetExam: meta.target_exam || "NDA 1 2026",
            language,
          },
        }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "AI request failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${e.message}. Please try again.` }]);
    }

    setLoading(false);

    // Save after response complete
    setMessages((prev) => {
      saveCurrentConv(prev);
      persistToDb(prev);
      return prev;
    });
  };

  const newChat = () => {
    setMessages([]);
    setActiveConvId(null);
    setShowHistory(false);
  };

  const loadConversation = (conv: Conversation) => {
    setMessages(conv.messages);
    setActiveConvId(conv.id);
    setShowHistory(false);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveConversations(updated);
      return updated;
    });
    if (activeConvId === id) newChat();
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* History sidebar (mobile toggle) */}
        {showHistory && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm md:relative md:inset-auto md:w-72 md:bg-transparent md:backdrop-blur-none border-r border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-sm text-gradient-gold">Chat History</h3>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={newChat}><Plus className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setShowHistory(false)} className="md:hidden"><X className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
              )}
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors ${
                    activeConvId === conv.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                  onClick={() => loadConversation(conv)}
                >
                  <span className="flex-1 truncate">{conv.title}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button size="icon" variant="ghost" onClick={() => setShowHistory(!showHistory)}>
                <History className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl text-gradient-gold">AI Tutor</h1>
                <p className="font-mono text-[9px] text-muted-foreground tracking-widest">
                  PERSONALIZED FOR {(meta.full_name || "YOU").toUpperCase()}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={newChat}><Plus className="h-4 w-4 mr-1" /> New Chat</Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <Brain className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                <h2 className="font-display text-2xl text-gradient-gold mb-2">Your Personal AI Mentor</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-1">
                  Ask anything about NDA preparation. Attach images of questions, handwritten notes, or textbook pages for analysis.
                </p>
                <p className="text-muted-foreground text-xs max-w-md mx-auto mb-6">
                  Say "generate an image of..." to create diagrams and illustrations.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Explain trigonometry basics", "SSB interview tips", "Analyze my handwriting", "Generate a diagram of solar system"].map((q) => (
                    <Button key={q} variant="outline" size="sm" className="text-xs" onClick={() => setInput(q)}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"
                }`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Attached" className="max-w-[200px] rounded-lg mb-2" />
                  )}
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                  {msg.generatedImages && msg.generatedImages.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.generatedImages.map((img, idx) => (
                        <img key={idx} src={img} alt="Generated" className="max-w-full rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(loading || generatingImage) && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="glass-card rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    {generatingImage && <span className="text-xs text-muted-foreground">Generating image...</span>}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Attached file preview */}
          {attachedFile && (
            <div className="px-4 pt-2">
              <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-xs">
                <Paperclip className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setAttachedFile(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 items-end">
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                title="Attach file"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything or attach a file..."
                className="flex-1 bg-card"
                disabled={loading || generatingImage}
              />
              <Button
                type="submit"
                disabled={loading || generatingImage || (!input.trim() && !attachedFile)}
                className="bg-primary text-primary-foreground"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
