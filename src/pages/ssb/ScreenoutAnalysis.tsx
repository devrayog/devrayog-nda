import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }) };

const FALLBACK_REASONS = [
  { title: "Negative Body Language", description: "Slouching, no eye contact, fidgeting. Assessors notice from Day 1.", fix: "Practice standing straight, eye contact, and confident walking." },
  { title: "Poor Communication", description: "Not speaking up in GD, one-word answers, unclear thoughts.", fix: "Practice speaking for 2 minutes on random topics daily." },
  { title: "Copying Stories/Responses", description: "Memorized TAT/WAT/SRT from coaching. Assessors catch this instantly.", fix: "Be original. Genuine responses score better than polished copied ones." },
  { title: "No Practical Thinking", description: "Bookish answers, hero complex, unrealistic solutions.", fix: "Think what you'd ACTUALLY do. Practical > Heroic." },
  { title: "Inconsistency in Self-Image", description: "What you say doesn't match your actions.", fix: "Be honest in SDT. Consistency across all tests is key." },
  { title: "Lack of Current Affairs", description: "Not knowing what's happening. Defence aspirant must be aware.", fix: "Read newspaper daily. Know top 5 news stories of the week." },
  { title: "Group Behavior Issues", description: "Dominating GD, not listening, getting angry, being passive.", fix: "Listen, acknowledge others, then add your perspective constructively." },
  { title: "Physical Fitness Neglect", description: "Getting tired in GTO, poor endurance, BMI issues.", fix: "Run daily, do bodyweight exercises, maintain proper BMI." },
];

interface ScreenoutItem { title: string; description: string; fix: string; }

export default function ScreenoutAnalysis() {
  const [reasons, setReasons] = useState<ScreenoutItem[]>(FALLBACK_REASONS);

  useEffect(() => {
    supabase.from("screenout_content").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => { if (data && data.length > 0) setReasons(data as any[]); });
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <h1 className="font-display text-4xl text-gradient-gold">SCREEN-OUT ANALYSIS</h1>
          </div>
          <p className="text-muted-foreground text-sm">Why people get screened out — based on real SSB experience.</p>
        </motion.div>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-destructive/30 bg-destructive/5">
            <CardContent className="p-6">
              <h2 className="font-display text-xl text-destructive mb-2">HARD TRUTH</h2>
              <p className="text-sm leading-relaxed">In every SSB batch of ~100 candidates, only 15-20 clear screening on Day 1. Of those, only 5-10 get recommended. The screen-out rate is 85-90%.</p>
            </CardContent>
          </Card>
        </motion.div>
        <h2 className="font-display text-xl text-gradient-gold">TOP REASONS FOR SCREEN-OUT</h2>
        {reasons.map((reason, i) => (
          <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
            <Card className="glass-card border-gold">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div><h3 className="font-bold">{reason.title}</h3><p className="text-sm text-muted-foreground mt-1">{reason.description}</p></div>
                </div>
                <div className="flex items-start gap-3 ml-8 p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <p className="text-xs text-success font-medium">{reason.fix}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
