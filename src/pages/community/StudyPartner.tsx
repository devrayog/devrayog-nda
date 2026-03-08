import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, MapPin, Target, BookOpen, Filter } from "lucide-react";
import { motion } from "framer-motion";

const STATES = ["All States", "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"];

export default function StudyPartner() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("All States");
  const [attemptFilter, setAttemptFilter] = useState("all");

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, username, state, attempt, target_exam, service, streak, dna_score, avatar_url")
      .neq("user_id", user?.id || "")
      .order("dna_score", { ascending: false })
      .limit(50);
    setProfiles(data || []);
    setLoading(false);
  };

  const filtered = profiles.filter(p => {
    if (stateFilter !== "All States" && p.state !== stateFilter) return false;
    if (attemptFilter !== "all" && p.attempt !== attemptFilter) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-accent" />
          <h1 className="font-display text-4xl text-gradient-gold">STUDY PARTNER</h1>
        </div>
        <p className="text-muted-foreground text-sm">Find accountability partners by state and attempt. Study together, grow together.</p>

        <Card className="glass-card border-gold">
          <CardContent className="p-4 flex flex-wrap gap-3 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[180px] bg-card border-border"><SelectValue /></SelectTrigger>
              <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={attemptFilter} onValueChange={setAttemptFilter}>
              <SelectTrigger className="w-[150px] bg-card border-border"><SelectValue placeholder="Attempt" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attempts</SelectItem>
                <SelectItem value="1st">1st Attempt</SelectItem>
                <SelectItem value="2nd">2nd Attempt</SelectItem>
                <SelectItem value="3rd">3rd Attempt</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} candidates found</span>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-primary/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No study partners found with these filters. Try broadening your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((p, i) => (
              <motion.div key={p.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card border-gold hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                      {p.full_name?.[0] || p.username?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{p.full_name || p.username || "Anonymous"}</h3>
                        {p.state && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {p.state}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.target_exam && <Badge variant="outline" className="text-[9px]">{p.target_exam}</Badge>}
                        {p.attempt && <Badge variant="outline" className="text-[9px]">Attempt: {p.attempt}</Badge>}
                        {p.service && <Badge variant="outline" className="text-[9px] capitalize">{p.service}</Badge>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-lg">{p.dna_score || 0}</p>
                      <p className="text-[9px] text-muted-foreground">DNA Score</p>
                      {p.streak > 0 && <p className="text-[10px] text-success">🔥 {p.streak} day streak</p>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
