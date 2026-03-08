import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface ProfileEntry {
  full_name: string | null;
  username: string | null;
  dna_score: number | null;
  streak: number | null;
  state: string | null;
  total_questions_solved: number | null;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileEntry[]>([]);

  useEffect(() => {
    // Note: we can only see our own profile due to RLS
    // This shows a placeholder leaderboard concept
    const load = async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("full_name, username, dna_score, streak, state, total_questions_solved").eq("user_id", user.id);
      if (data) setProfiles(data);
    };
    load();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-warning" />
          <h1 className="font-display text-4xl text-gradient-gold">LEADERBOARD</h1>
        </div>

        <Card className="glass-card border-gold">
          <CardContent className="p-6 text-center">
            <Medal className="h-10 w-10 text-primary/30 mx-auto mb-3" />
            <h2 className="font-display text-xl text-gradient-gold mb-2">YOUR RANKING</h2>
            <p className="text-muted-foreground text-sm mb-4">Complete more tests and maintain your streak to climb the leaderboard!</p>
            
            {profiles.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center font-display text-xl text-primary-foreground">
                  {(p.full_name || "C")[0].toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-sm">{p.full_name || "Cadet"}</p>
                  <p className="text-[10px] text-muted-foreground">{p.state || "India"} • {p.total_questions_solved || 0} questions solved</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-gradient-gold">{p.dna_score || 42}%</p>
                  <p className="text-[9px] font-mono text-muted-foreground">DNA SCORE</p>
                </div>
              </div>
            ))}

            <p className="text-xs text-muted-foreground mt-4">
              <Star className="h-3 w-3 inline text-primary" /> Full leaderboard coming soon with state-wise and batch-wise rankings!
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
