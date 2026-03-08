import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserCheck, Star, Eye, MessageSquare, Shield, Heart, Zap, Target, Users, Plus, Trash2, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };

// Static fallback
const STATIC_OLQS = [
  { title: "Effective Intelligence", desc: "Ability to understand the real problem and find practical solutions quickly.", category: "olq" },
  { title: "Reasoning Ability", desc: "Logical and analytical thinking to arrive at sound conclusions.", category: "olq" },
  { title: "Social Adaptability", desc: "Ability to adjust in any social situation and get along with people.", category: "olq" },
  { title: "Cooperation", desc: "Working together as a team member, not just as a leader.", category: "olq" },
  { title: "Self Confidence", desc: "Belief in your own abilities without being arrogant.", category: "olq" },
];

interface Tip { id: string; title: string; body: string; category: string; isStatic?: boolean; }

const CATEGORIES = ["olq", "body_language", "communication", "interview", "general"];

export default function PersonalityTips() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dbTips, setDbTips] = useState<Tip[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "", category: "olq" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("resources").select("*").eq("type", "personality_tip").eq("is_active", true).order("sort_order")
      .then(({ data }) => setDbTips((data as Tip[]) || []));
    if (user) {
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
        .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); });
    }
  }, [user]);

  const allTips: Tip[] = [
    ...dbTips,
    ...STATIC_OLQS.filter(s => !dbTips.some(d => d.title === s.title)).map(s => ({ ...s, id: s.title, body: s.desc, isStatic: true })),
  ];

  const grouped = allTips.reduce<Record<string, Tip[]>>((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t);
    return acc;
  }, {});

  const saveTip = async () => {
    if (!form.title || !form.body) return;
    setSaving(true);
    if (editId) {
      const { error } = await supabase.from("resources").update({ title: form.title, body: form.body, category: form.category }).eq("id", editId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Tip updated!" });
    } else {
      const { error } = await supabase.from("resources").insert({ title: form.title, body: form.body, category: form.category, type: "personality_tip", sort_order: dbTips.length });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Tip added!" });
    }
    setShowForm(false); setEditId(null); setForm({ title: "", body: "", category: "olq" });
    const { data } = await supabase.from("resources").select("*").eq("type", "personality_tip").eq("is_active", true).order("sort_order");
    setDbTips((data as Tip[]) || []);
    setSaving(false);
  };

  const deleteTip = async (id: string) => {
    await supabase.from("resources").update({ is_active: false }).eq("id", id);
    setDbTips(prev => prev.filter(t => t.id !== id));
    toast({ title: "Tip removed" });
  };

  const startEdit = (tip: Tip) => {
    setForm({ title: tip.title, body: tip.body, category: tip.category });
    setEditId(tip.id);
    setShowForm(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="h-8 w-8 text-primary" />
              <h1 className="font-display text-4xl text-gradient-gold">PERSONALITY TIPS</h1>
            </div>
            {isAdmin && (
              <Button onClick={() => { setEditId(null); setForm({ title: "", body: "", category: "olq" }); setShowForm(true); }} size="sm" className="bg-gradient-gold text-primary-foreground font-bold">
                <Plus className="h-4 w-4 mr-1" /> Add Tip
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-sm">Officer Like Qualities, body language, and communication skills for SSB.</p>
        </motion.div>

        {Object.entries(grouped).map(([category, tips], ci) => (
          <motion.div key={category} initial="hidden" animate="visible" variants={fadeUp} custom={ci + 1}>
            <h2 className="font-display text-xl text-gradient-gold mb-3 capitalize">{category.replace("_", " ")}</h2>
            <div className="grid gap-3">
              {tips.map((tip, i) => (
                <Card key={tip.id} className="glass-card border-gold relative">
                  {isAdmin && !tip.isStatic && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => startEdit(tip)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => deleteTip(tip.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h3 className="font-bold text-sm">{tip.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{tip.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ))}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "Add"} Personality Tip</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label className="text-xs">Body / Tips</Label><Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} className="min-h-[100px]" /></div>
              <div><Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveTip} disabled={saving} className="bg-gradient-gold text-primary-foreground font-bold">{saving ? "Saving..." : editId ? "Update" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
