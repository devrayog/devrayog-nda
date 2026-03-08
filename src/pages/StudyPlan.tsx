import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

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
            content: `Generate a detailed daily study plan for today and a weekly overview for NDA preparation. Consider: target exam ${meta.target_exam || "NDA 1 2026"}, ${meta.attempt || "1st"} attempt, biggest challenge: ${meta.challenge || "general preparation"}, available study time: ${meta.study_time || "3-4"} hours per day, service: ${meta.service || "army"}. Include specific topics, time slots, and break suggestions. Make it actionable.`
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
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-success" />
              <h1 className="font-display text-4xl text-gradient-gold">STUDY PLAN</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">AI-generated daily and weekly plans based on your profile.</p>
          </div>
          <Button onClick={generatePlan} disabled={loading} className="bg-gradient-gold text-primary-foreground font-bold">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {plan ? "Regenerate" : "Generate Plan"}
          </Button>
        </div>

        {!plan && !loading && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <h2 className="font-display text-2xl text-gradient-gold mb-2">YOUR PERSONAL STUDY PLAN</h2>
              <p className="text-muted-foreground text-sm mb-6">Click "Generate Plan" and AI will create a plan based on your target exam ({meta.target_exam || "NDA 1 2026"}), challenge ({meta.challenge || "preparation"}), and available study time ({meta.study_time || "3-4"} hours).</p>
            </CardContent>
          </Card>
        )}

        {plan && (
          <Card className="glass-card border-gold">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">{plan}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
