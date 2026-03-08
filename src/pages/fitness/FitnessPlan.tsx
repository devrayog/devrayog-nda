import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dumbbell, Brain, RefreshCw, ChevronRight, Ruler, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FitnessPlan() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const meta = user?.user_metadata || {};
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setPlan("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate a complete fitness plan for NDA/SSB preparation. Service preference: ${meta.service || "army"}. Include: daily running schedule (build up to 2.4km in 9 min), push-ups/pull-ups/sit-ups targets, weekly schedule, diet tips. Make it practical for an Indian student.` }],
          userContext: { name: meta.full_name, service: meta.service, language },
        }),
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
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) { text += c; setPlan(text); } } catch {}
        }
      }
    } catch { setPlan("Failed to generate. Try again."); }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl text-gradient-gold">FITNESS PLAN</h1>
          </div>
          <Button onClick={generate} disabled={loading} className="bg-gradient-gold text-primary-foreground font-bold">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Generate
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/fitness/running">
            <Card className="glass-card border-gold hover:scale-[1.02] transition-transform cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Activity className="h-5 w-5 text-success" />
                <span className="font-bold text-sm">Running Tracker</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/fitness/medical">
            <Card className="glass-card border-gold hover:scale-[1.02] transition-transform cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Ruler className="h-5 w-5 text-cyan" />
                <span className="font-bold text-sm">Medical Standards</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {!plan && !loading && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Click Generate to get an AI fitness plan for {(meta.service || "army").toUpperCase()} preparation.</p>
            </CardContent>
          </Card>
        )}

        {plan && (
          <Card className="glass-card border-gold">
            <CardContent className="p-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{plan}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
