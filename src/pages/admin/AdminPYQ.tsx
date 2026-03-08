import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lock, Plus, Pencil, Trash2, FolderOpen, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PYQ {
  id: string; year: number; paper: string; subject: string; topic: string;
  question: string; option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: string; explanation: string; difficulty: string; is_active: boolean;
}

const emptyPYQ = {
  year: 2024, paper: "NDA 1", subject: "maths", topic: "",
  question: "", option_a: "", option_b: "", option_c: "", option_d: "",
  correct_option: "a", explanation: "", difficulty: "medium", is_active: true,
};

export default function AdminPYQ() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [questions, setQuestions] = useState<PYQ[]>([]);
  const [editing, setEditing] = useState<Partial<PYQ> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterYear, setFilterYear] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
      if (data && data.length > 0) setIsAdmin(true);
      setChecking(false);
    });
  }, [user]);

  const load = async () => {
    let q = supabase.from("pyq_questions").select("*").order("year", { ascending: false }).order("subject").limit(500);
    const { data } = await q;
    if (data) setQuestions(data as unknown as PYQ[]);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const handleSave = async () => {
    if (!editing?.question || !editing?.option_a) return;
    setSaving(true);
    try {
      if ((editing as PYQ).id) {
        const { id, ...rest } = editing as PYQ;
        await supabase.from("pyq_questions").update(rest as any).eq("id", id);
        toast({ title: "PYQ updated" });
      } else {
        await supabase.from("pyq_questions").insert(editing as any);
        toast({ title: "PYQ added" });
      }
      setDialogOpen(false); setEditing(null); load();
    } catch { toast({ title: "Error", variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this PYQ?")) return;
    await supabase.from("pyq_questions").delete().eq("id", id);
    toast({ title: "PYQ deleted" }); load();
  };

  const years = [...new Set(questions.map(q => q.year))].sort((a, b) => b - a);
  const filtered = questions.filter(q =>
    (filterYear === "all" || q.year === parseInt(filterYear)) &&
    (filterSubject === "all" || q.subject === filterSubject)
  );

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 max-w-md mx-auto mt-20"><Card className="glass-card border-gold"><CardContent className="p-8 text-center"><Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" /><h1 className="font-display text-3xl text-gradient-gold mb-2">ADMIN ACCESS</h1><p className="text-muted-foreground text-sm">Admin privileges required.</p></CardContent></Card></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-display text-3xl text-gradient-gold">PYQ MANAGEMENT</h1>
              <p className="text-muted-foreground text-xs">{questions.length} questions</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ ...emptyPYQ })} className="bg-gradient-gold text-primary-foreground font-bold">
                <Plus className="h-4 w-4 mr-2" /> Add PYQ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-gradient-gold">{(editing as PYQ)?.id ? "Edit PYQ" : "New PYQ"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs text-muted-foreground">Year</label><Input type="number" value={editing?.year || 2024} onChange={e => setEditing(ed => ({ ...ed!, year: parseInt(e.target.value) }))} /></div>
                  <div>
                    <label className="text-xs text-muted-foreground">Paper</label>
                    <Select value={editing?.paper || "NDA 1"} onValueChange={v => setEditing(e => ({ ...e!, paper: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NDA 1">NDA 1</SelectItem>
                        <SelectItem value="NDA 2">NDA 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Subject</label>
                    <Select value={editing?.subject || "maths"} onValueChange={v => setEditing(e => ({ ...e!, subject: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maths">Maths</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="gat">GAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><label className="text-xs text-muted-foreground">Topic</label><Input value={editing?.topic || ""} onChange={e => setEditing(ed => ({ ...ed!, topic: e.target.value }))} placeholder="e.g. Trigonometry" /></div>
                <div><label className="text-xs text-muted-foreground">Question</label><Textarea value={editing?.question || ""} onChange={e => setEditing(ed => ({ ...ed!, question: e.target.value }))} rows={3} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground">A</label><Input value={editing?.option_a || ""} onChange={e => setEditing(ed => ({ ...ed!, option_a: e.target.value }))} /></div>
                  <div><label className="text-xs text-muted-foreground">B</label><Input value={editing?.option_b || ""} onChange={e => setEditing(ed => ({ ...ed!, option_b: e.target.value }))} /></div>
                  <div><label className="text-xs text-muted-foreground">C</label><Input value={editing?.option_c || ""} onChange={e => setEditing(ed => ({ ...ed!, option_c: e.target.value }))} /></div>
                  <div><label className="text-xs text-muted-foreground">D</label><Input value={editing?.option_d || ""} onChange={e => setEditing(ed => ({ ...ed!, option_d: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Correct</label>
                    <Select value={editing?.correct_option || "a"} onValueChange={v => setEditing(e => ({ ...e!, correct_option: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="a">A</SelectItem><SelectItem value="b">B</SelectItem><SelectItem value="c">C</SelectItem><SelectItem value="d">D</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Difficulty</label>
                    <Select value={editing?.difficulty || "medium"} onValueChange={v => setEditing(e => ({ ...e!, difficulty: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div><label className="text-xs text-muted-foreground">Explanation</label><Textarea value={editing?.explanation || ""} onChange={e => setEditing(ed => ({ ...ed!, explanation: e.target.value }))} rows={2} /></div>
                <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">{saving ? "Saving..." : "Save PYQ"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="text-xs bg-card border border-border rounded-md px-2 py-1.5">
            <option value="all">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {["all", "maths", "english", "gat"].map(s => (
            <Button key={s} size="sm" variant={filterSubject === s ? "default" : "outline"} onClick={() => setFilterSubject(s)}
              className={filterSubject === s ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        <div className="grid gap-2">
          {filtered.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className="glass-card border-gold">
                <CardContent className="p-3 flex items-start gap-3">
                  <span className="text-[10px] font-mono text-muted-foreground mt-1">{q.year}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">{q.subject}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-accent/20 text-accent">{q.paper}</span>
                      {q.topic && <span className="text-[9px] text-muted-foreground">{q.topic}</span>}
                    </div>
                    <p className="text-sm">{q.question}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(q); setDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(q.id)}><Trash2 className="h-3 w-3" /></Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No PYQs found. Add some!</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
