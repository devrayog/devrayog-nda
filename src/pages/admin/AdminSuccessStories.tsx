import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Plus, Trash2, Save, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSuccessStories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stories, setStories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", branch: "", batch: "", state: "", quote: "", tips: "", attempts: "1", highlight: "" });

  useEffect(() => {
    const check = async () => {
      if (!user) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      setIsAdmin(!!(data && data.length > 0));
      setChecking(false);
    };
    check();
  }, [user]);

  const load = async () => {
    const { data } = await supabase.from("success_stories").select("*").order("created_at", { ascending: false });
    setStories(data || []);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    await supabase.from("success_stories").insert({
      name: form.name.trim(), branch: form.branch, batch: form.batch, state: form.state,
      quote: form.quote, tips: form.tips.split("\n").filter(Boolean), attempts: parseInt(form.attempts) || 1, highlight: form.highlight,
    } as any);
    setForm({ name: "", branch: "", batch: "", state: "", quote: "", tips: "", attempts: "1", highlight: "" });
    toast({ title: "Story added!" });
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("success_stories").delete().eq("id", id);
    toast({ title: "Deleted" });
    load();
  };

  if (checking) return <DashboardLayout><div className="p-6 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 max-w-md mx-auto mt-20"><Card className="glass-card border-gold"><CardContent className="p-8 text-center"><Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" /><h1 className="font-display text-3xl text-gradient-gold">ADMIN ONLY</h1></CardContent></Card></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-warning" />
          <h1 className="font-display text-4xl text-gradient-gold">MANAGE SUCCESS STORIES</h1>
        </div>

        <Card className="glass-card border-gold">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Add Story</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-card border-border" />
              <Input placeholder="Branch (Army/Navy/AF)" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="bg-card border-border" />
              <Input placeholder="Batch (NDA 149)" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} className="bg-card border-border" />
              <Input placeholder="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="bg-card border-border" />
              <Input placeholder="Highlight" value={form.highlight} onChange={e => setForm(f => ({ ...f, highlight: e.target.value }))} className="bg-card border-border" />
              <Input placeholder="Attempts" type="number" value={form.attempts} onChange={e => setForm(f => ({ ...f, attempts: e.target.value }))} className="bg-card border-border" />
            </div>
            <Textarea placeholder="Quote" value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} className="bg-card border-border" rows={2} />
            <Textarea placeholder="Tips (one per line)" value={form.tips} onChange={e => setForm(f => ({ ...f, tips: e.target.value }))} className="bg-card border-border" rows={3} />
            <Button onClick={handleAdd} className="bg-gradient-gold text-primary-foreground font-bold">
              <Save className="h-4 w-4 mr-1" /> Add Story
            </Button>
          </CardContent>
        </Card>

        {stories.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="glass-card border-gold">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{s.name} — {s.branch}</h3>
                  <p className="text-xs text-muted-foreground">{s.quote}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
