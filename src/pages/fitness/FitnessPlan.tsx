import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Dumbbell, Brain, RefreshCw, ChevronRight, Ruler, Activity, Plus, Trash2, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

interface RunLog {
  id: string;
  distance_km: number;
  time_minutes: number;
  date: string;
  notes: string;
}

export default function FitnessPlan() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const meta = user?.user_metadata || {};
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<RunLog[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRun, setNewRun] = useState({ distance_km: "", time_minutes: "", date: new Date().toISOString().split("T")[0], notes: "" });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"plan" | "tracker">("tracker");

  const loadRuns = async () => {
    if (!user) return;
    const { data } = await supabase.from("running_logs").select("*").eq("user_id", user.id).order("date", { ascending: true }).limit(100);
    if (data) setRuns(data as RunLog[]);
  };

  useEffect(() => { loadRuns(); }, [user]);

  const handleAddRun = async () => {
    if (!newRun.distance_km || !newRun.time_minutes || !user) return;
    setSaving(true);
    await supabase.from("running_logs").insert({
      user_id: user.id,
      distance_km: parseFloat(newRun.distance_km),
      time_minutes: parseFloat(newRun.time_minutes),
      date: newRun.date,
      notes: newRun.notes,
    } as any);
    toast({ title: "Run logged! 🏃" });
    setDialogOpen(false);
    setNewRun({ distance_km: "", time_minutes: "", date: new Date().toISOString().split("T")[0], notes: "" });
    loadRuns();
    setSaving(false);
  };

  const handleDeleteRun = async (id: string) => {
    await supabase.from("running_logs").delete().eq("id", id);
    toast({ title: "Run deleted" });
    loadRuns();
  };

  const generate = async () => {
    setLoading(true);
    setPlan("");
    setTab("plan");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate a complete fitness plan for NDA/SSB preparation using markdown formatting with ## headers, bullet points, and bold text. Service preference: ${meta.service || "army"}. Include: daily running schedule (build up to 2.4km in 9 min), push-ups/pull-ups/sit-ups targets, weekly schedule, diet tips. Make it practical for an Indian student.` }],
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

  // Chart data
  const chartData = runs.slice(-30).map(r => ({
    date: new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    distance: Number(r.distance_km),
    pace: r.distance_km > 0 ? Math.round((Number(r.time_minutes) / Number(r.distance_km)) * 10) / 10 : 0,
    time: Number(r.time_minutes),
  }));

  const totalDistance = runs.reduce((s, r) => s + Number(r.distance_km), 0);
  const totalRuns = runs.length;
  const bestPace = runs.length > 0 ? Math.min(...runs.filter(r => Number(r.distance_km) > 0).map(r => Number(r.time_minutes) / Number(r.distance_km))) : 0;
  const latestRun = runs[runs.length - 1];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-accent/20 to-success/20">
              <Dumbbell className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-gradient-gold">FITNESS</h1>
              <p className="text-muted-foreground text-xs">Track runs & get AI fitness plans</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-gold text-primary-foreground font-bold">
                  <Plus className="h-3 w-3 mr-1" /> Log Run
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display text-gradient-gold">Log a Run</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-muted-foreground">Distance (km)</label><Input type="number" step="0.1" value={newRun.distance_km} onChange={e => setNewRun(r => ({ ...r, distance_km: e.target.value }))} placeholder="2.4" /></div>
                    <div><label className="text-xs text-muted-foreground">Time (min)</label><Input type="number" step="0.5" value={newRun.time_minutes} onChange={e => setNewRun(r => ({ ...r, time_minutes: e.target.value }))} placeholder="12" /></div>
                  </div>
                  <div><label className="text-xs text-muted-foreground">Date</label><Input type="date" value={newRun.date} onChange={e => setNewRun(r => ({ ...r, date: e.target.value }))} /></div>
                  <div><label className="text-xs text-muted-foreground">Notes (optional)</label><Input value={newRun.notes} onChange={e => setNewRun(r => ({ ...r, notes: e.target.value }))} placeholder="How did it feel?" /></div>
                  <Button onClick={handleAddRun} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">{saving ? "Saving..." : "Log Run 🏃"}</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={generate} disabled={loading} className="border-gold">
              <Brain className="h-3 w-3 mr-1" /> AI Plan
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Runs", value: totalRuns, icon: Activity },
            { label: "Total Distance", value: `${totalDistance.toFixed(1)} km`, icon: TrendingUp },
            { label: "Best Pace", value: bestPace > 0 ? `${bestPace.toFixed(1)} min/km` : "--", icon: Dumbbell },
            { label: "Last Run", value: latestRun ? `${Number(latestRun.distance_km).toFixed(1)} km` : "--", icon: Activity },
          ].map((s, i) => (
            <Card key={i} className="glass-card border-gold">
              <CardContent className="p-3 text-center">
                <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="font-bold text-sm">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button size="sm" variant={tab === "tracker" ? "default" : "outline"} onClick={() => setTab("tracker")} className={tab === "tracker" ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
            <Activity className="h-3 w-3 mr-1" /> Tracker
          </Button>
          <Button size="sm" variant={tab === "plan" ? "default" : "outline"} onClick={() => setTab("plan")} className={tab === "plan" ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
            <Brain className="h-3 w-3 mr-1" /> AI Plan
          </Button>
        </div>

        {tab === "tracker" && (
          <>
            {/* Chart */}
            {chartData.length >= 2 && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-4">
                    <h3 className="font-display text-sm text-gradient-gold mb-3">DISTANCE PROGRESS</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="distance" stroke="hsl(var(--primary))" fill="url(#distGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {chartData.length >= 2 && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-4">
                    <h3 className="font-display text-sm text-gradient-gold mb-3">PACE TREND (min/km)</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} reversed />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Line type="monotone" dataKey="pace" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Run Log */}
            <div className="space-y-2">
              <h3 className="font-display text-sm text-gradient-gold">RUN HISTORY</h3>
              {runs.length === 0 ? (
                <Card className="glass-card border-gold">
                  <CardContent className="p-8 text-center">
                    <Activity className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">No runs logged yet. Click "Log Run" to start tracking!</p>
                  </CardContent>
                </Card>
              ) : (
                [...runs].reverse().map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="glass-card border-gold">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="text-center flex-shrink-0">
                          <p className="font-display text-lg text-gradient-gold">{Number(r.distance_km).toFixed(1)}</p>
                          <p className="text-[9px] text-muted-foreground font-mono">KM</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{Number(r.time_minutes).toFixed(1)} min</span>
                            {Number(r.distance_km) > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                ({(Number(r.time_minutes) / Number(r.distance_km)).toFixed(1)} min/km)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{r.date}{r.notes ? ` • ${r.notes}` : ""}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteRun(r.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/fitness/running">
                <Card className="glass-card border-gold hover:scale-[1.02] transition-transform cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Activity className="h-5 w-5 text-success" />
                    <span className="font-bold text-xs">Running Tips</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                  </CardContent>
                </Card>
              </Link>
              <Link to="/fitness/medical">
                <Card className="glass-card border-gold hover:scale-[1.02] transition-transform cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Ruler className="h-5 w-5 text-cyan" />
                    <span className="font-bold text-xs">Medical Standards</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        )}

        {tab === "plan" && (
          <>
            {!plan && !loading && (
              <Card className="glass-card border-gold">
                <CardContent className="p-8 text-center">
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                    <Brain className="h-14 w-14 text-primary/30 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-muted-foreground text-sm">Click "AI Plan" to get a personalized fitness plan for {(meta.service || "army").toUpperCase()} preparation.</p>
                </CardContent>
              </Card>
            )}
            {loading && !plan && (
              <Card className="glass-card border-gold">
                <CardContent className="p-8 text-center">
                  <div className="flex gap-1.5 justify-center mb-4">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">Generating your fitness plan...</p>
                </CardContent>
              </Card>
            )}
            {plan && (
              <Card className="glass-card border-gold">
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none text-foreground leading-relaxed prose-headings:font-display prose-headings:text-primary prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2 prose-strong:text-primary prose-li:marker:text-primary">
                    <ReactMarkdown>{plan}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
