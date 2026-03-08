import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Activity, Plus, TrendingUp, Clock, MapPin, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function RunningTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { if (user) loadLogs(); }, [user]);

  const loadLogs = async () => {
    const { data } = await supabase.from("running_logs").select("*").eq("user_id", user!.id).order("date", { ascending: false }).limit(30);
    setLogs(data || []);
    setLoading(false);
  };

  const addLog = async () => {
    if (!distance || !time) return;
    const { error } = await supabase.from("running_logs").insert({ user_id: user!.id, distance_km: parseFloat(distance), time_minutes: parseFloat(time), notes });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Run Logged! 🏃", description: `${distance} km in ${time} minutes.` });
    setDistance(""); setTime(""); setNotes(""); setShowForm(false);
    loadLogs();
  };

  const chartData = [...logs].reverse().map(l => ({
    date: new Date(l.date).toLocaleDateString("en", { day: "2-digit", month: "short" }),
    distance: Number(l.distance_km),
    pace: Number(l.time_minutes) / Math.max(Number(l.distance_km), 0.1),
  }));

  const totalKm = logs.reduce((s, l) => s + Number(l.distance_km), 0);
  const totalMins = logs.reduce((s, l) => s + Number(l.time_minutes), 0);
  const bestPace = logs.length ? Math.min(...logs.map(l => Number(l.time_minutes) / Math.max(Number(l.distance_km), 0.1))) : 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-success" />
            <h1 className="font-display text-4xl text-gradient-gold">RUNNING TRACKER</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="outline" className="border-primary/30">
            <Plus className="h-4 w-4 mr-2" /> Log Run
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: MapPin, label: "Total Distance", value: `${totalKm.toFixed(1)} km`, color: "text-primary" },
            { icon: Clock, label: "Total Time", value: `${Math.floor(totalMins / 60)}h ${Math.round(totalMins % 60)}m`, color: "text-accent" },
            { icon: Trophy, label: "Best Pace", value: bestPace ? `${bestPace.toFixed(1)} min/km` : "—", color: "text-success" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card border-gold">
                <CardContent className="p-4 text-center">
                  <s.icon className={`h-5 w-5 ${s.color} mx-auto mb-1`} />
                  <p className="font-display text-xl">{s.value}</p>
                  <p className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Card className="glass-card border-primary">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Distance (km)</label>
                    <Input type="number" step="0.1" value={distance} onChange={e => setDistance(e.target.value)} placeholder="2.5" className="bg-card border-border" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Time (minutes)</label>
                    <Input type="number" value={time} onChange={e => setTime(e.target.value)} placeholder="15" className="bg-card border-border" />
                  </div>
                </div>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" className="bg-card border-border min-h-[60px]" />
                <Button onClick={addLog} className="w-full bg-gradient-gold text-primary-foreground font-bold">Save Run</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Charts */}
        {chartData.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-gold">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Distance Progress</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="distance" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="glass-card border-gold">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> Pace Trend (min/km)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="pace" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Log List */}
        <h2 className="font-display text-lg text-gradient-gold">RECENT RUNS</h2>
        {loading ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div> :
          logs.length === 0 ? (
            <Card className="glass-card border-gold"><CardContent className="p-8 text-center"><p className="text-muted-foreground text-sm">No runs logged yet. Start tracking today!</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => (
                <Card key={log.id} className="glass-card border-gold">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{Number(log.distance_km).toFixed(1)} km in {Number(log.time_minutes)} min</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(log.date).toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" })} {log.notes && `• ${log.notes}`}</p>
                    </div>
                    <p className="text-xs text-accent font-mono">{(Number(log.time_minutes) / Math.max(Number(log.distance_km), 0.1)).toFixed(1)} min/km</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}
