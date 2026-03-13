import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FitnessStd { id: string; key: string; label: string; value: string; icon: string; description: string; category: string; sort_order: number; }
const empty = { key: "", label: "", value: "", icon: "💪", description: "", category: "minimum" };

export default function AdminFitness() {
  const { toast } = useToast();
  const [items, setItems] = useState<FitnessStd[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<FitnessStd | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => { const { data } = await supabase.from("fitness_standards").select("*").order("sort_order") as any; setItems(data || []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.label || !form.value) return;
    const payload = { ...form, key: form.key || form.label.toLowerCase().replace(/\s+/g, "_") };
    if (editing) { await supabase.from("fitness_standards").update(payload as any).eq("id", editing.id); toast({ title: "Updated!" }); }
    else { await supabase.from("fitness_standards").insert({ ...payload, sort_order: items.length } as any); toast({ title: "Added!" }); }
    setShowDialog(false); setEditing(null); setForm(empty); load();
  };

  const remove = async (id: string) => { await supabase.from("fitness_standards").delete().eq("id", id); toast({ title: "Deleted" }); load(); };

  const minimums = items.filter(i => i.category === "minimum");
  const cards = items.filter(i => i.category === "card");

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Dumbbell className="h-7 w-7 text-accent" /><h1 className="font-display text-3xl text-gradient-gold">FITNESS STANDARDS</h1></div>
          <Button onClick={() => { setEditing(null); setForm(empty); setShowDialog(true); }} className="bg-gradient-gold text-primary-foreground font-bold"><Plus className="h-4 w-4 mr-1" /> Add Standard</Button>
        </div>
        <p className="text-xs text-muted-foreground">Set minimum fitness requirements and info cards shown to users on the fitness page.</p>

        {minimums.length > 0 && <h2 className="font-display text-lg text-gradient-gold">MINIMUMS (Eligibility Check)</h2>}
        {minimums.map(item => (
          <Card key={item.id} className="glass-card border-gold">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{item.label}</h3>
                <p className="text-xs text-primary">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(item); setForm({ key: item.key, label: item.label, value: item.value, icon: item.icon, description: item.description, category: item.category }); setShowDialog(true); }}><Edit2 className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {cards.length > 0 && <h2 className="font-display text-lg text-gradient-gold mt-4">INFO CARDS</h2>}
        {cards.map(item => (
          <Card key={item.id} className="glass-card border-gold">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{item.label}</h3>
                <p className="text-xs text-primary">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(item); setForm({ key: item.key, label: item.label, value: item.value, icon: item.icon, description: item.description, category: item.category }); setShowDialog(true); }}><Edit2 className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && <p className="text-center text-muted-foreground py-8">No fitness standards yet. Add minimums (run time, pushups, etc.) and info cards.</p>}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Standard" : "Add Fitness Standard"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="minimum">Minimum (Eligibility Check)</SelectItem><SelectItem value="card">Info Card</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Label</Label><Input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="1.6km Run Time" /></div>
              <div><Label className="text-xs">Value</Label><Input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="7:30 min" /></div>
              <div><Label className="text-xs">Icon (emoji)</Label><Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="🏃" /></div>
              <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Must complete 1.6km within 7 min 30 sec" /></div>
              <div><Label className="text-xs">Key (auto-generated if empty)</Label><Input value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} placeholder="run_time_seconds" /></div>
            </div>
            <DialogFooter><Button onClick={save} className="bg-gradient-gold text-primary-foreground font-bold">{editing ? "Update" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
