import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Swords, Brain, CheckCircle, XCircle, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface ChallengeQ {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function DailyChallenge() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [challenge, setChallenge] = useState<ChallengeQ | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const meta = user?.user_metadata || {};

  const generateChallenge = async () => {
    setLoading(true);
    setSelected(null);
    setRevealed(false);
    setChallenge(null);

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
            content: `Generate 1 challenging NDA exam question. Return ONLY valid JSON with: "question" (string), "options" (array of 4 strings), "correct" (0-3), "explanation" (string). No markdown.`
          }],
          userContext: { name: meta.full_name, attempt: meta.attempt, medium: meta.medium, language },
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

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
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) fullText += c; } catch {}
        }
      }

      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) setChallenge(JSON.parse(jsonMatch[0]));
    } catch {
      setChallenge({ question: "Failed to generate. Try again!", options: [], correct: 0, explanation: "" });
    }
    setLoading(false);
  };

  useEffect(() => { generateChallenge(); }, []);

  const handleAnswer = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Swords className="h-8 w-8 text-warning" />
            <h1 className="font-display text-4xl text-gradient-gold">DAILY CHALLENGE</h1>
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Flame className="h-4 w-4 text-destructive" /> Complete daily to maintain your streak!
          </p>
        </motion.div>

        {loading && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-primary/30 mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Generating today's challenge...</p>
            </CardContent>
          </Card>
        )}

        {challenge && challenge.options.length > 0 && (
          <Card className="glass-card border-gold">
            <CardContent className="p-6">
              <p className="font-bold mb-6 leading-relaxed">{challenge.question}</p>
              <div className="space-y-3">
                {challenge.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`w-full text-left p-4 rounded-lg border transition-all text-sm flex items-center gap-3 ${
                      revealed && i === challenge.correct ? "border-success bg-success/10" :
                      revealed && i === selected && i !== challenge.correct ? "border-destructive bg-destructive/10" :
                      selected === i ? "border-primary bg-primary/10" :
                      "border-gold hover:border-primary"
                    }`}
                  >
                    <span className="font-mono text-xs text-primary">{String.fromCharCode(65 + i)}.</span>
                    <span className="flex-1">{opt}</span>
                    {revealed && i === challenge.correct && <CheckCircle className="h-4 w-4 text-success" />}
                    {revealed && i === selected && i !== challenge.correct && <XCircle className="h-4 w-4 text-destructive" />}
                  </button>
                ))}
              </div>

              {revealed && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground"><span className="font-bold">Explanation:</span> {challenge.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {revealed && (
          <Button onClick={generateChallenge} className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider">
            Next Challenge →
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
}
