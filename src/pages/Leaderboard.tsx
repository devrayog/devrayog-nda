import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Crown, Flame, Target, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  dna_score: number | null;
  streak: number | null;
  total_questions_solved: number | null;
  accuracy: number | null;
  state: string | null;
  service: string | null;
}

type SortBy = "dna_score" | "streak" | "total_questions_solved" | "accuracy";

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("dna_score");
  const [filterState, setFilterState] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, username, avatar_url, dna_score, streak, total_questions_solved, accuracy, state, service, target_exam")
        .not("dna_score", "is", null)
        .order(sortBy, { ascending: false, nullsFirst: false })
        .limit(100);
      if (data) setEntries(data as unknown as LeaderboardEntry[]);
      setLoading(false);
    };
    load();
  }, [sortBy]);

  const states = [...new Set(entries.map(e => e.state).filter(Boolean))].sort();
  const filtered = filterState === "all" ? entries : entries.filter(e => e.state === filterState);
  const myRank = filtered.findIndex(e => e.user_id === user?.id) + 1;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-warning" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-accent" />;
    return <span className="text-xs font-mono text-muted-foreground w-5 text-center">#{rank}</span>;
  };

  const sortOptions: { key: SortBy; label: string; icon: any }[] = [
    { key: "dna_score", label: "DNA Score", icon: Target },
    { key: "streak", label: "Streak", icon: Flame },
    { key: "total_questions_solved", label: "Questions", icon: TrendingUp },
    { key: "accuracy", label: "Accuracy", icon: Trophy },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-gradient-to-br from-warning/20 to-accent/20">
              <Trophy className="h-7 w-7 text-warning" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-gradient-gold">LEADERBOARD</h1>
              <p className="text-muted-foreground text-xs">{entries.length} cadets ranked</p>
            </div>
          </div>
        </motion.div>

        {/* My Rank Card */}
        {myRank > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card className="glass-card border-gold ring-1 ring-primary/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center font-display text-xl text-primary-foreground">
                  #{myRank}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Your Rank</p>
                  <p className="text-xs text-muted-foreground">
                    {sortBy === "dna_score" ? "DNA Score" : sortBy === "streak" ? "Streak" : sortBy === "accuracy" ? "Accuracy" : "Questions Solved"}: {
                      filtered[myRank - 1]?.[sortBy] ?? 0
                    }{sortBy === "dna_score" || sortBy === "accuracy" ? "%" : sortBy === "streak" ? " days" : ""}
                  </p>
                </div>
                <Flame className="h-5 w-5 text-primary" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sort & Filter */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="flex flex-wrap gap-2">
          {sortOptions.map(opt => (
            <Button key={opt.key} size="sm" variant={sortBy === opt.key ? "default" : "outline"}
              onClick={() => setSortBy(opt.key)}
              className={sortBy === opt.key ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
              <opt.icon className="h-3 w-3 mr-1" /> {opt.label}
            </Button>
          ))}
          {states.length > 1 && (
            <select value={filterState} onChange={e => setFilterState(e.target.value)}
              className="text-xs bg-card border border-border rounded-md px-2 py-1 ml-auto">
              <option value="all">All States</option>
              {states.map(s => <option key={s} value={s!}>{s}</option>)}
            </select>
          )}
        </motion.div>

        {/* Leaderboard List */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {/* Top 3 podium */}
            {filtered.length >= 3 && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="grid grid-cols-3 gap-3 mb-4">
                {[1, 0, 2].map(idx => {
                  const e = filtered[idx];
                  if (!e) return null;
                  const rank = idx + 1;
                  const isFirst = rank === 1;
                  return (
                    <motion.div key={e.user_id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.15 }}>
                      <Card className={`glass-card border-gold text-center ${isFirst ? "ring-2 ring-yellow-500/30 -mt-4" : ""}`}>
                        <CardContent className="p-4">
                          <div className="mb-2">{getRankIcon(rank)}</div>
                          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-display text-lg text-primary-foreground ${
                            isFirst ? "bg-gradient-to-br from-yellow-400 to-amber-500 w-14 h-14" : "bg-gradient-gold"
                          }`}>
                            {e.avatar_url ? <img src={e.avatar_url} className="w-full h-full rounded-full object-cover" /> : (e.full_name || "C")[0].toUpperCase()}
                          </div>
                          <p className="font-bold text-xs mt-2 truncate">{e.full_name || e.username || "Cadet"}</p>
                          <p className="font-display text-xl text-gradient-gold">{e[sortBy] ?? 0}{sortBy === "dna_score" || sortBy === "accuracy" ? "%" : ""}</p>
                          <p className="text-[9px] text-muted-foreground font-mono uppercase">{e.state || "India"}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Rest of the list */}
            {filtered.slice(3).map((e, i) => {
              const rank = i + 4;
              const isMe = e.user_id === user?.id;
              return (
                <motion.div key={e.user_id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 4}>
                  <Card className={`glass-card border-gold ${isMe ? "ring-1 ring-primary/30 bg-primary/5" : ""}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-8 text-center">#{rank}</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                        {e.avatar_url ? <img src={e.avatar_url} className="w-full h-full rounded-full object-cover" /> : (e.full_name || "C")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{e.full_name || e.username || "Cadet"} {isMe && <span className="text-primary text-[10px]">(You)</span>}</p>
                        <p className="text-[10px] text-muted-foreground">{e.state || "India"} • 🔥{e.streak || 0} streak</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-lg text-gradient-gold">{e[sortBy] ?? 0}{sortBy === "dna_score" || sortBy === "accuracy" ? "%" : ""}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <Card className="glass-card border-gold">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">No cadets on the leaderboard yet. Complete tests to get ranked!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
