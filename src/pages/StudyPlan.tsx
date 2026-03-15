import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PremiumButton } from "@/components/PremiumGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, RefreshCw, Clock, BookOpen, Dumbbell, Coffee, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const quickStats = [
  { icon: Clock, label: "Study Time", key: "study_time", suffix: " hrs/day", fallback: "3-4" },
  { icon: Target, label: "Target", key: "target_exam", suffix: "", fallback: "NDA 1 2026" },
  { icon: BookOpen, label: "Attempt", key: "attempt", suffix: "", fallback: "1st" },
  { icon: Dumbbell, label: "Challenge", key: "challenge", suffix: "", fallback: "General" },
];

export default function StudyPlan() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const meta = user?.user_metadata || {};
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    setPlan("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate a detailed daily study plan for NDA preparation. Use markdown with ##, bullets, bold, tables. Consider: target exam ${meta.target_exam || "NDA 1 2026"}, ${meta.attempt || "1st"} attempt, challenge: ${meta.challenge || "general"}, study time: ${meta.study_time || "3-4"} hrs/day. Include specific topics, time slots, break suggestions.` }],
          userContext: { name: meta.full_name, language },
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("Failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", content = "";
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
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) { content += c; setPlan(content); } } catch {}
        }
      }
    } catch { setPlan("Failed to generate plan. Please try again."); }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-gradient-gold">STUDY PLAN</h1>
              <p className="text-muted-foreground text-xs">AI-generated daily & weekly plans</p>
            </div>
          </div>
          <PremiumButton onClick={generatePlan} disabled={loading} feature="AI Study Plan" className="bg-gradient-gold text-primary-foreground font-bold shadow-lg">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {plan ? "Regenerate" : "Generate"}
          </PremiumButton>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickStats.map((stat, i) => (
            <motion.div key={stat.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="glass-card border-gold">
                <CardContent className="p-3 text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="font-bold text-sm">{(meta[stat.key] || stat.fallback) + stat.suffix}</p>
                  <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!plan && !loading && (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="glass-card border-gold overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <div className="relative">
                    {/* 3D-style animated sphere */}
                    <div className="relative mx-auto w-24 h-24 mb-6">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20"
                        animate={{ rotateY: [0, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        style={{ transformStyle: "preserve-3d" }}
                      />
                      <motion.div
                        className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Brain className="h-8 w-8 text-primary-foreground" />
                      </motion.div>
                    </div>
                    <h2 className="font-display text-2xl text-gradient-gold mb-2">YOUR PERSONAL STUDY PLAN</h2>
                    <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">Click "Generate" for an AI-tailored plan.</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[{ icon: Clock, text: "Time-slotted schedule" }, { icon: BookOpen, text: "Topic priorities" }, { icon: Coffee, text: "Break suggestions" }].map((item, i) => (
                        <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.15 }}
                          className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                          <item.icon className="h-3 w-3" /> {item.text}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {loading && !plan && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="glass-card border-gold">
                <CardContent className="p-8 text-center">
                  {/* Animated loading spheres */}
                  <div className="flex gap-3 justify-center mb-4">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5], y: [0, -10, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                  <Sparkles className="h-6 w-6 text-primary mx-auto mb-2 animate-pulse" />
                  <p className="text-muted-foreground text-sm">AI is crafting your personalized plan...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {plan && (
            <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="glass-card border-gold overflow-hidden">
                {/* Decorative header bar */}
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none text-foreground leading-relaxed
                    prose-headings:font-display prose-headings:text-primary
                    prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                    prose-h3:text-lg prose-h3:mt-4
                    prose-strong:text-primary
                    prose-li:marker:text-primary
                    prose-table:border prose-table:border-border
                    prose-th:bg-muted prose-th:p-2 prose-th:text-left
                    prose-td:p-2 prose-td:border-t prose-td:border-border
                  ">
                    <ReactMarkdown>{plan}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
