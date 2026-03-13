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
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VocabWord { id: string; word: string; meaning: string; usage_example: string; synonym: string; antonym: string; difficulty: string; is_active: boolean; sort_order: number; }

const empty = { word: "", meaning: "", usage_example: "", synonym: "", antonym: "", difficulty: "medium" };

export default function AdminVocabulary() {
  const { toast } = useToast();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<VocabWord | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("vocabulary_words").select("*").order("sort_order") as any;
    setWords(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.word || !form.meaning) return;
    if (editing) {
      await supabase.from("vocabulary_words").update(form as any).eq("id", editing.id);
      toast({ title: "Word updated!" });
    } else {
      await supabase.from("vocabulary_words").insert({ ...form, sort_order: words.length } as any);
      toast({ title: "Word added!" });
    }
    setShowDialog(false); setEditing(null); setForm(empty); load();
  };

  const remove = async (id: string) => {
    await supabase.from("vocabulary_words").delete().eq("id", id);
    toast({ title: "Word deleted" }); load();
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><BookOpen className="h-7 w-7 text-primary" /><h1 className="font-display text-3xl text-gradient-gold">VOCABULARY MANAGER</h1></div>
          <Button onClick={() => { setEditing(null); setForm(empty); setShowDialog(true); }} className="bg-gradient-gold text-primary-foreground font-bold"><Plus className="h-4 w-4 mr-1" /> Add Word</Button>
        </div>
        {words.length === 0 && <p className="text-center text-muted-foreground py-8">No vocabulary words yet.</p>}
        {words.map(w => (
          <Card key={w.id} className="glass-card border-gold">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2"><h3 className="font-bold">{w.word}</h3><Badge className={`text-[9px] ${w.difficulty === "easy" ? "bg-success/20 text-success" : w.difficulty === "hard" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{w.difficulty}</Badge>{!w.is_active && <Badge variant="outline" className="text-[9px]">Hidden</Badge>}</div>
                <p className="text-sm text-muted-foreground">{w.meaning}</p>
                {w.synonym && <p className="text-xs text-muted-foreground">Syn: {w.synonym} | Ant: {w.antonym}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(w); setForm({ word: w.word, meaning: w.meaning, usage_example: w.usage_example, synonym: w.synonym, antonym: w.antonym, difficulty: w.difficulty }); setShowDialog(true); }}><Edit2 className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(w.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Word" : "Add Word"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Word</Label><Input value={form.word} onChange={e => setForm(p => ({ ...p, word: e.target.value }))} placeholder="Ephemeral" /></div>
              <div><Label className="text-xs">Meaning</Label><Input value={form.meaning} onChange={e => setForm(p => ({ ...p, meaning: e.target.value }))} placeholder="Lasting for a very short time" /></div>
              <div><Label className="text-xs">Usage Example</Label><Input value={form.usage_example} onChange={e => setForm(p => ({ ...p, usage_example: e.target.value }))} placeholder="Fame is often ephemeral." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Synonym</Label><Input value={form.synonym} onChange={e => setForm(p => ({ ...p, synonym: e.target.value }))} /></div>
                <div><Label className="text-xs">Antonym</Label><Input value={form.antonym} onChange={e => setForm(p => ({ ...p, antonym: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setForm(p => ({ ...p, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
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
