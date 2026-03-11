import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function DailyMotivation() {
  const { user } = useAuth();
  const [motivation, setMotivation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Check localStorage cache (valid for 4 hours)
    const cached = localStorage.getItem("dna_motivation");
    if (cached) {
      try {
        const { text, ts } = JSON.parse(cached);
        if (Date.now() - ts < 4 * 60 * 60 * 1000) {
          setMotivation(text);
          setLoading(false);
          return;
        }
      } catch { /* ignore */ }
    }

    const meta = user.user_metadata || {};
    const examDate = new Date("2026-04-12T04:30:00Z");
    const daysUntilExam = Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    supabase.functions.invoke("ai-motivation", {
      body: {
        userContext: {
          name: meta.full_name || "Cadet",
          attempt: meta.attempt || "1st",
          service: meta.service || "army",
          dnaScore: 42,
          streak: 0,
          daysSinceLastLogin: 0,
          totalQuestionsSolved: 0,
          daysUntilExam,
          language: "en",
        },
      },
    }).then(({ data, error }) => {
      const text = data?.motivation || "Keep pushing, cadet. Your dream is waiting. 🎖️";
      if (error) console.error("Motivation error:", error);
      setMotivation(text);
      localStorage.setItem("dna_motivation", JSON.stringify({ text, ts: Date.now() }));
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <Card className="glass-card border-gold">
        <CardContent className="p-6 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary animate-spin" />
          <span className="text-muted-foreground text-sm">AI is crafting your daily motivation...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="glass-card border-gold bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2">Today's Motivation</p>
              <p className="text-sm font-medium leading-relaxed whitespace-pre-line">{motivation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
