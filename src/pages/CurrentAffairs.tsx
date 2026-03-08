import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Brain, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CurrentAffairs() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const meta = user?.user_metadata || {};
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setContent("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Generate today's current affairs for NDA exam preparation. Include: National news, International news, Defence news, Science & Tech, Sports. For each item give a one-liner and why it matters for NDA. Include 2-3 quick quiz questions at the end." }],
          userContext: { name: meta.full_name, medium: meta.medium, language },
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
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) { text += c; setContent(text); } } catch {}
        }
      }
    } catch { setContent("Failed to load current affairs. Please try again."); }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-gradient-gold">CURRENT AFFAIRS</h1>
          </div>
          <Button onClick={generate} disabled={loading} className="bg-gradient-gold text-primary-foreground font-bold">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {content ? "Refresh" : "Load Today's News"}
          </Button>
        </div>

        {!content && !loading && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <h2 className="font-display text-2xl text-gradient-gold mb-2">AI-CURATED NEWS</h2>
              <p className="text-muted-foreground text-sm">Click "Load Today's News" to get AI-curated current affairs relevant to NDA exam.</p>
            </CardContent>
          </Card>
        )}

        {content && (
          <Card className="glass-card border-gold">
            <CardContent className="p-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
