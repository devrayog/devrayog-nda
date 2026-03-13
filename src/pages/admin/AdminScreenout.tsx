import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";

interface ScreenoutItem { id: string; title: string; description: string; fix: string; type: string; sort_order: number; is_active: boolean; }
const empty = { title: "", description: "", fix: "", type: "reason" };

export default function AdminScreenout() {
  const { toast } = useToast();
  const [items, setItems] = useState<ScreenoutItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<ScreenoutItem | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => { const { data } = await supabase.from("screenout_content").select("*").order("sort_order") as any; setItems(data || []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) return;
    if (editing) { await supabase.from("screenout_content").update(form as any).eq("id", editing.id); toast({ title: "Updated!" }); }
    else { await supabase.from("screenout_content").insert({ ...form, sort_order: items.length } as any); toast({ title: "Added!" }); }
    setShowDialog(false); setEditing(null); setForm(empty); load();
  };

  const remove = async (id: string) => { await supabase.from("screenout_content").delete().eq("id", id); toast({ title: "Deleted" }); load(); };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><AlertTriangle className="h-7 w-7 text-destructive" /><h1 className="font-display text-3xl text-gradient-gold">SCREENOUT EDITOR</h1></div>
          <Button onClick={() => { setEditing(null); setForm(empty); setShowDialog(true); }} className="bg-gradient-gold text-primary-foreground font-bold"><Plus className="h-4 w-4 mr-1" /> Add Reason</Button>
        </div>
        {items.length === 0 && <p className="text-center text-muted-foreground py-8">No screenout content yet. Hardcoded defaults will be shown.</p>}
        {items.map((item, i) => (
          <Card key={item.id} className="glass-card border-gold">
            <CardContent className="p-4 flex items-start gap-4">
              <span className="font-mono text-xs text-destructive mt-1">{i + 1}</span>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <p className="text-xs text-success mt-1">Fix: {item.fix}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(item); setForm({ title: item.title, description: item.description, fix: item.fix, type: item.type }); setShowDialog(true); }}><Edit2 className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add Screenout Reason"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Negative Body Language" /></div>
              <div><Label className="text-xs">Description (Why it causes screenout)</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Slouching, no eye contact..." /></div>
              <div><Label className="text-xs">How to Fix</Label><Textarea value={form.fix} onChange={e => setForm(p => ({ ...p, fix: e.target.value }))} placeholder="Practice standing straight..." /></div>
            </div>
            <DialogFooter><Button onClick={save} className="bg-gradient-gold text-primary-foreground font-bold">{editing ? "Update" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
