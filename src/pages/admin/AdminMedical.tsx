import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MedicalItem { id: string; section: string; title: string; body: string; type: string; sort_order: number; }
const empty = { section: "height", title: "", body: "", type: "standard" };

export default function AdminMedical() {
  const { toast } = useToast();
  const [items, setItems] = useState<MedicalItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<MedicalItem | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => { const { data } = await supabase.from("medical_content").select("*").order("sort_order") as any; setItems(data || []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) return;
    if (editing) { await supabase.from("medical_content").update(form as any).eq("id", editing.id); toast({ title: "Updated!" }); }
    else { await supabase.from("medical_content").insert({ ...form, sort_order: items.length } as any); toast({ title: "Added!" }); }
    setShowDialog(false); setEditing(null); setForm(empty); load();
  };

  const remove = async (id: string) => { await supabase.from("medical_content").delete().eq("id", id); toast({ title: "Deleted" }); load(); };

  const sections = ["height", "vision", "hearing", "general", "rejection", "prep"];
  const grouped = sections.reduce((acc, s) => { acc[s] = items.filter(i => i.section === s); return acc; }, {} as Record<string, MedicalItem[]>);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><HeartPulse className="h-7 w-7 text-destructive" /><h1 className="font-display text-3xl text-gradient-gold">MEDICAL STANDARDS</h1></div>
          <Button onClick={() => { setEditing(null); setForm(empty); setShowDialog(true); }} className="bg-gradient-gold text-primary-foreground font-bold"><Plus className="h-4 w-4 mr-1" /> Add Content</Button>
        </div>
        {sections.map(section => grouped[section].length > 0 && (
          <div key={section}>
            <h2 className="font-display text-lg text-gradient-gold capitalize mt-4">{section.toUpperCase()}</h2>
            {grouped[section].map(item => (
              <Card key={item.id} className="glass-card border-gold mt-2">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><h3 className="font-bold text-sm">{item.title}</h3><Badge variant="outline" className="text-[9px]">{item.type}</Badge></div>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{item.body}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(item); setForm({ section: item.section, title: item.title, body: item.body, type: item.type }); setShowDialog(true); }}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-8">No medical content yet. Hardcoded defaults shown to users.</p>}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add Medical Content"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Section</Label>
                <Select value={form.section} onValueChange={v => setForm(p => ({ ...p, section: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{sections.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label className="text-xs">Body/Content</Label><Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={4} /></div>
              <div><Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="standard">Standard</SelectItem><SelectItem value="table">Table Row</SelectItem><SelectItem value="tip">Tip</SelectItem><SelectItem value="warning">Warning</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={save} className="bg-gradient-gold text-primary-foreground font-bold">{editing ? "Update" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
