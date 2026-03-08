import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Send } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TopicDetail() {
  const { topicId } = useParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const topicName = (topicId || "topic").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const meta = user?.user_metadata || {};

  const generateExplanation = async () => {
    setLoading(true);
    setExplanation("");
    
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Explain "${topicName}" completely for NDA exam preparation. Cover all important concepts, formulas, and tips. Give examples where needed. Make it comprehensive but easy to understand.` }],
          userContext: {
            name: meta.full_name || "Student",
            attempt: meta.attempt || "1st",
            service: meta.service || "army",
            medium: meta.medium || "english",
            language,
          },
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

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setExplanation(content);
            }
          } catch { break; }
        }
      }
    } catch {
      setExplanation("Failed to generate explanation. Please try again.");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-4xl text-gradient-gold">{topicName}</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-generated explanation personalized for your level</p>
        </div>

        {!explanation && !loading && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <h2 className="font-display text-2xl text-gradient-gold mb-2">AI EXPLANATION</h2>
              <p className="text-muted-foreground text-sm mb-6">Click below and AI will generate a complete explanation of this topic tailored to your NDA preparation level.</p>
              <Button onClick={generateExplanation} className="bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                <Brain className="h-4 w-4 mr-2" /> Generate AI Explanation
              </Button>
            </CardContent>
          </Card>
        )}

        {loading && !explanation && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <div className="flex gap-1 justify-center mb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-muted-foreground text-sm">AI is preparing your explanation...</p>
            </CardContent>
          </Card>
        )}

        {explanation && (
          <Card className="glass-card border-gold">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
                {explanation}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
