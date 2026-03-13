import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Task { id: string; title: string; description: string; category: string; target_value: number; icon: string; is_active: boolean; }
const empty = { title: "", description: "", category: "study", target_value: 1, icon: "Target" };

export default function AdminDailyTasks() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => { const { data } = await supabase.from("daily_tasks").select("*").order("sort_order") as any; setTasks(data || []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) return;
    if (editing) { await supabase.from("daily_tasks").update(form as any).eq("id", editing.id); toast({ title: "Task updated!" }); }
    else { await supabase.from("daily_tasks").insert({ ...form, sort_order: tasks.length } as any); toast({ title: "Task added!" }); }
    setShowDialog(false); setEditing(null); setForm(empty); load();
  };

  const remove = async (id: string) => { await supabase.from("daily_tasks").delete().eq("id", id); toast({ title: "Task deleted" }); load(); };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Target className="h-7 w-7 text-warning" /><h1 className="font-display text-3xl text-gradient-gold">DAILY TASKS MANAGER</h1></div>
          <Button onClick={() => { setEditing(null); setForm(empty); setShowDialog(true); }} className="bg-gradient-gold text-primary-foreground font-bold"><Plus className="h-4 w-4 mr-1" /> Add Task</Button>
        </div>
        {tasks.length === 0 && <p className="text-center text-muted-foreground py-8">No daily tasks yet. Add tasks that users should complete daily.</p>}
        {tasks.map(t => (
          <Card key={t.id} className="glass-card border-gold">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2"><h3 className="font-bold text-sm">{t.title}</h3><Badge variant="outline" className="text-[9px]">{t.category}</Badge>{!t.is_active && <Badge variant="outline" className="text-[9px] text-destructive">Hidden</Badge>}</div>
                <p className="text-xs text-muted-foreground">{t.description}</p>
                <p className="text-[10px] text-primary mt-1">Target: {t.target_value}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setForm({ title: t.title, description: t.description, category: t.category, target_value: t.target_value, icon: t.icon }); setShowDialog(true); }}><Edit2 className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Task" : "Add Daily Task"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Solve 10 MCQs" /></div>
              <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Practice daily MCQs from any subject" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="study">Study</SelectItem><SelectItem value="fitness">Fitness</SelectItem><SelectItem value="revision">Revision</SelectItem><SelectItem value="current_affairs">Current Affairs</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Target Value</Label><Input type="number" value={form.target_value} onChange={e => setForm(p => ({ ...p, target_value: parseInt(e.target.value) || 1 }))} /></div>
              </div>
              <div><Label className="text-xs">Icon (emoji or name)</Label><Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="📚 or Target" /></div>
            </div>
            <DialogFooter><Button onClick={save} className="bg-gradient-gold text-primary-foreground font-bold">{editing ? "Update" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
