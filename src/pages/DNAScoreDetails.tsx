import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Brain, Target, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function DNAScoreDetails() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const dnaScore = profile?.dna_score || 42;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">DNA SCORE DETAILS</h1>
        </div>

        <Card className="glass-card border-gold">
          <CardContent className="p-8 text-center">
            <p className="font-display text-8xl text-gradient-gold">{dnaScore}%</p>
            <p className="font-mono text-xs text-muted-foreground tracking-widest mt-2">YOUR NDA READINESS SCORE</p>
          </CardContent>
        </Card>

        <h2 className="font-display text-xl text-gradient-gold">SCORE BREAKDOWN</h2>

        {[
          { label: "Maths", value: 35, icon: "📐" },
          { label: "GAT / GK", value: 45, icon: "📚" },
          { label: "English", value: 50, icon: "📝" },
          { label: "Consistency", value: profile?.streak ? Math.min(100, profile.streak * 10) : 10, icon: "🔥" },
          { label: "Test Performance", value: profile?.accuracy || 0, icon: "🎯" },
        ].map((item, i) => (
          <Card key={i} className="glass-card border-gold">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold flex items-center gap-2"><span>{item.icon}</span> {item.label}</span>
                <span className="font-mono text-xs text-primary">{item.value}%</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </CardContent>
          </Card>
        ))}

        <Card className="glass-card border-gold">
          <CardContent className="p-4 flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-bold">How to improve your DNA Score</p>
              <p className="text-xs text-muted-foreground mt-1">Take more tests, maintain your streak, focus on weak areas. AI automatically recalculates your score based on your performance patterns.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
