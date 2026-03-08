import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Send, Users, Globe, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMsg {
  id: string;
  channel: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

export default function RealtimeChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [channel, setChannel] = useState("global");
  const [profiles, setProfiles] = useState<Map<string, string>>(new Map());
  const [dmUsers, setDmUsers] = useState<{ user_id: string; name: string }[]>([]);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfiles();
    loadDMUsers();
  }, []);

  useEffect(() => {
    loadMessages();
    const sub = supabase
      .channel(`chat-${channel}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `channel=eq.${channel}` },
        (payload) => {
          const msg = payload.new as ChatMsg;
          msg.author_name = profiles.get(msg.user_id) || "Cadet";
          setMessages(prev => [...prev, msg]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [channel, profiles]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadProfiles = async () => {
    const { data } = await supabase.from("profiles").select("user_id, full_name, username");
    const map = new Map<string, string>();
    (data || []).forEach((p: any) => map.set(p.user_id, p.full_name || p.username || "Cadet"));
    setProfiles(map);
  };

  const loadDMUsers = async () => {
    const { data } = await supabase.from("profiles").select("user_id, full_name, username").neq("user_id", user?.id || "").limit(20);
    setDmUsers((data || []).map((p: any) => ({ user_id: p.user_id, name: p.full_name || p.username || "Cadet" })));
  };

  const loadMessages = async () => {
    const { data } = await supabase.from("chat_messages").select("*").eq("channel", channel).order("created_at", { ascending: true }).limit(100);
    const msgs = (data || []).map((m: any) => ({ ...m, author_name: profiles.get(m.user_id) || "Cadet" }));
    setMessages(msgs as ChatMsg[]);
  };

  const getDMChannel = (otherUserId: string) => {
    const sorted = [user?.id || "", otherUserId].sort().join("_");
    return `dm:${sorted}`;
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || sending) return;
    setSending(true);
    await supabase.from("chat_messages").insert({ channel, user_id: user.id, content: input.trim() } as any);
    setInput("");
    setSending(false);
  };

  const timeStr = (d: string) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto flex gap-4 h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <Card className="glass-card border-gold w-60 shrink-0 overflow-auto hidden md:block">
          <CardContent className="p-3 space-y-2">
            <h3 className="font-display text-sm text-gradient-gold">CHANNELS</h3>
            <Button variant={channel === "global" ? "default" : "ghost"} size="sm" className={`w-full justify-start ${channel === "global" ? "bg-gradient-gold text-primary-foreground" : ""}`}
              onClick={() => setChannel("global")}>
              <Globe className="h-4 w-4 mr-2" /> Global Chat
            </Button>

            <h3 className="font-display text-sm text-gradient-gold mt-4">DIRECT MESSAGES</h3>
            {dmUsers.map(u => {
              const dmCh = getDMChannel(u.user_id);
              return (
                <Button key={u.user_id} variant={channel === dmCh ? "default" : "ghost"} size="sm"
                  className={`w-full justify-start text-xs ${channel === dmCh ? "bg-gradient-gold text-primary-foreground" : ""}`}
                  onClick={() => setChannel(dmCh)}>
                  <User className="h-3 w-3 mr-2" /> {u.name}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="glass-card border-gold flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-border flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm">{channel === "global" ? "Global Chat" : channel.startsWith("dm:") ? "Direct Message" : channel}</span>
              <Badge variant="outline" className="text-[9px] ml-auto">{messages.length} messages</Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.user_id === user?.id ? "flex-row-reverse" : ""}`}>
                    <div className={`max-w-[70%] rounded-xl px-3 py-2 ${msg.user_id === user?.id ? "bg-primary/20 text-foreground" : "bg-muted/50"}`}>
                      <p className="text-[10px] font-bold text-primary mb-0.5">{msg.user_id === user?.id ? "You" : msg.author_name}</p>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 text-right">{timeStr(msg.created_at)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
                className="bg-card border-border" onKeyDown={e => e.key === "Enter" && sendMessage()} />
              <Button onClick={sendMessage} disabled={sending || !input.trim()} className="bg-gradient-gold text-primary-foreground">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Mobile channel selector */}
          <div className="flex gap-2 mt-2 md:hidden overflow-auto">
            <Button size="sm" variant={channel === "global" ? "default" : "outline"} onClick={() => setChannel("global")}
              className={channel === "global" ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
              <Globe className="h-3 w-3 mr-1" /> Global
            </Button>
            {dmUsers.slice(0, 5).map(u => {
              const dmCh = getDMChannel(u.user_id);
              return (
                <Button key={u.user_id} size="sm" variant={channel === dmCh ? "default" : "outline"}
                  className={`text-xs ${channel === dmCh ? "bg-gradient-gold text-primary-foreground" : "border-gold"}`}
                  onClick={() => setChannel(dmCh)}>
                  {u.name.split(" ")[0]}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
