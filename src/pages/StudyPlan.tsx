import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, RefreshCw, Clock, BookOpen, Dumbbell, Coffee } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Generate a detailed daily study plan for today and a weekly overview for NDA preparation. Use markdown formatting with headers (##), bullet points, bold text, and tables where appropriate. Consider: target exam ${meta.target_exam || "NDA 1 2026"}, ${meta.attempt || "1st"} attempt, biggest challenge: ${meta.challenge || "general preparation"}, available study time: ${meta.study_time || "3-4"} hours per day, service: ${meta.service || "army"}. Include specific topics, time slots, and break suggestions. Make it actionable.`
          }],
          userContext: { name: meta.full_name, attempt: meta.attempt, medium: meta.medium, language },
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
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
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl text-gradient-gold">STUDY PLAN</h1>
                <p className="text-muted-foreground text-xs mt-0.5">AI-generated daily & weekly plans</p>
              </div>
            </div>
          </div>
          <Button onClick={generatePlan} disabled={loading} className="bg-gradient-gold text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-shadow">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {plan ? "Regenerate" : "Generate"}
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickStats.map((stat, i) => (
            <motion.div key={stat.key} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <Card className="glass-card border-gold">
                <CardContent className="p-3 text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="font-bold text-sm">{(meta[stat.key] || stat.fallback) + stat.suffix}</p>
                  <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        <AnimatePresence mode="wait">
          {!plan && !loading && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card border-gold overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <div className="relative">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Brain className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                    </motion.div>
                    <h2 className="font-display text-2xl text-gradient-gold mb-2">YOUR PERSONAL STUDY PLAN</h2>
                    <p className="text-muted-foreground text-sm mb-2 max-w-md mx-auto">
                      Click "Generate" and AI will create a tailored plan based on your profile.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {[
                        { icon: Clock, text: "Time-slotted schedule" },
                        { icon: BookOpen, text: "Topic priorities" },
                        { icon: Coffee, text: "Break suggestions" },
                      ].map((item, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + i * 0.15 }}
                          className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full"
                        >
                          <item.icon className="h-3 w-3" /> {item.text}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Loading */}
          {loading && !plan && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="glass-card border-gold">
                <CardContent className="p-8 text-center">
                  <div className="flex gap-1.5 justify-center mb-4">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-primary"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">AI is crafting your personalized plan...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Plan Content */}
          {plan && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card border-gold">
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
