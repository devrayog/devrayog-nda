import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Star, Shield, MessageSquare, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const MENTORS = [
  { name: "Lt. Arjun Sharma", branch: "Army (Infantry)", batch: "NDA 148", rating: 4.9, expertise: ["Written Exam Strategy", "SSB Interview", "Physical Fitness"], bio: "Cleared NDA in first attempt. 3 years mentoring experience.", avatar: "🎖️" },
  { name: "Sub Lt. Priya Verma", branch: "Navy", batch: "NDA 149", rating: 4.8, expertise: ["Maths", "GAT", "Girls in NDA"], bio: "Among first women cadets at NDA. Expert in Maths shortcuts.", avatar: "⚓" },
  { name: "Fg Off. Rahul Deshmukh", branch: "Air Force", batch: "NDA 147", rating: 4.7, expertise: ["SSB Psychology", "Current Affairs", "Time Management"], bio: "Cleared SSB on second attempt. Specializes in psychology tests.", avatar: "✈️" },
  { name: "Capt. Meera Singh", branch: "Army (Signals)", batch: "NDA 146", rating: 4.9, expertise: ["English", "Essay Writing", "Communication"], bio: "Topped English in NDA exam. Helps with essay and comprehension.", avatar: "📡" },
  { name: "Lt. Vikram Rathore", branch: "Army (Armoured)", batch: "NDA 150", rating: 4.6, expertise: ["Physical Training", "GTO Tasks", "Leadership"], bio: "National-level athlete. Expert in GTO and physical preparation.", avatar: "🏋️" },
];

export default function MentorConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<typeof MENTORS[0] | null>(null);
  const [question, setQuestion] = useState("");
  const [aiAdvice, setAiAdvice] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const filtered = MENTORS.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.expertise.some(e => e.toLowerCase().includes(search.toLowerCase())) ||
    m.branch.toLowerCase().includes(search.toLowerCase())
  );

  const askAIMentor = async () => {
    if (!question.trim()) return;
    setLoadingAI(true);
    setAiAdvice("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: `You are an experienced NDA mentor (${selectedMentor?.name || "Senior Officer"}, ${selectedMentor?.branch || "Indian Armed Forces"}). A student asks: "${question}". Give practical, encouraging advice based on real NDA preparation experience. Be specific and actionable.` }] }),
      });
      if (!resp.ok || !resp.body) throw new Error("Failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) { text += c; setAiAdvice(text); } } catch {}
        }
      }
    } catch { toast({ title: "Error", description: "Could not get AI advice.", variant: "destructive" }); }
    setLoadingAI(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">MENTOR CONNECT</h1>
        </div>
        <p className="text-muted-foreground text-sm">Connect with NDA-cleared officers for guidance. Ask questions and get AI-powered mentorship advice.</p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, branch, or expertise..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>

        <div className="grid gap-3">
          {filtered.map((mentor, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`glass-card cursor-pointer transition-all ${selectedMentor?.name === mentor.name ? "border-primary" : "border-gold hover:border-primary/50"}`} onClick={() => setSelectedMentor(mentor)}>
                <CardContent className="p-4 flex items-start gap-4">
                  <span className="text-3xl">{mentor.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm">{mentor.name}</h3>
                      <Badge variant="outline" className="text-[9px]">{mentor.branch}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1"><Star className="h-3 w-3 text-warning fill-warning" /> {mentor.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{mentor.bio}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mentor.expertise.map((e, j) => <Badge key={j} className="text-[9px] bg-primary/10 text-primary">{e}</Badge>)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {selectedMentor && (
          <Card className="glass-card border-primary">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-display text-lg text-gradient-gold">Ask {selectedMentor.name}</h3>
              <Textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Type your question about NDA preparation..." className="bg-card border-border min-h-[80px]" />
              <Button onClick={askAIMentor} disabled={loadingAI || !question.trim()} className="w-full bg-gradient-gold text-primary-foreground font-bold">
                <Sparkles className="h-4 w-4 mr-2" /> {loadingAI ? "Getting Advice..." : "Get AI Mentor Advice"}
              </Button>
              {aiAdvice && (
                <Card className="bg-muted/30 border-accent/30">
                  <CardContent className="p-4 prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{aiAdvice}</ReactMarkdown>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
