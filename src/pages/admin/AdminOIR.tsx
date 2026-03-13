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
import { Plus, Edit2, Trash2, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ImageUploadButton from "@/components/ImageUploadButton";

interface OIRQuestion { id: string; question: string; question_image_url: string | null; option_a: string; option_b: string; option_c: string; option_d: string; option_a_image_url: string | null; option_b_image_url: string | null; option_c_image_url: string | null; option_d_image_url: string | null; correct_option: string; explanation: string; explanation_image_url: string | null; difficulty: string; }

const empty = { question: "", question_image_url: "", option_a: "", option_b: "", option_c: "", option_d: "", option_a_image_url: "", option_b_image_url: "", option_c_image_url: "", option_d_image_url: "", correct_option: "a", explanation: "", explanation_image_url: "", difficulty: "medium" };

export default function AdminOIR() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<OIRQuestion[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<OIRQuestion | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => { const { data } = await supabase.from("oir_questions").select("*").order("sort_order") as any; setQuestions(data || []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.question && !form.question_image_url) return;
    const payload = { ...form, question_image_url: form.question_image_url || null, option_a_image_url: form.option_a_image_url || null, option_b_image_url: form.option_b_image_url || null, option_c_image_url: form.option_c_image_url || null, option_d_image_url: form.option_d_image_url || null, explanation_image_url: form.explanation_image_url || null };
    if (editing) { await supabase.from("oir_questions").update(payload as any).eq("id", editing.id); toast({ title: "Question updated!" }); }
    else { await supabase.from("oir_questions").insert({ ...payload, sort_order: questions.length } as any); toast({ title: "Question added!" }); }
    setShowDialog(false); setEditing(null); setForm(empty); load();
  };

  const remove = async (id: string) => { await supabase.from("oir_questions").delete().eq("id", id); toast({ title: "Question deleted" }); load(); };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Brain className="h-7 w-7 text-accent" /><h1 className="font-display text-3xl text-gradient-gold">OIR QUESTIONS</h1></div>
          <Button onClick={() => { setEditing(null); setForm(empty); setShowDialog(true); }} className="bg-gradient-gold text-primary-foreground font-bold"><Plus className="h-4 w-4 mr-1" /> Add Question</Button>
        </div>
        <p className="text-xs text-muted-foreground">Admin-added OIR questions shown alongside AI-generated ones. Supports image-based questions.</p>
        {questions.length === 0 && <p className="text-center text-muted-foreground py-8">No OIR questions yet.</p>}
        {questions.map((q, i) => (
          <Card key={q.id} className="glass-card border-gold">
            <CardContent className="p-4 flex items-start gap-4">
              <span className="font-mono text-xs text-primary mt-1">Q{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{q.question || "(Image question)"}</p>
                {q.question_image_url && <img src={q.question_image_url} alt="" className="mt-1 max-h-20 rounded" />}
                <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-muted-foreground">
                  {["a", "b", "c", "d"].map(opt => (
                    <span key={opt} className={opt === q.correct_option ? "text-success font-bold" : ""}>
                      {opt.toUpperCase()}: {(q as any)[`option_${opt}`]}
                    </span>
                  ))}
                </div>
                <Badge className={`text-[9px] mt-1 ${q.difficulty === "easy" ? "bg-success/20 text-success" : q.difficulty === "hard" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{q.difficulty}</Badge>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(q); setForm({ question: q.question, question_image_url: q.question_image_url || "", option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, option_a_image_url: q.option_a_image_url || "", option_b_image_url: q.option_b_image_url || "", option_c_image_url: q.option_c_image_url || "", option_d_image_url: q.option_d_image_url || "", correct_option: q.correct_option, explanation: q.explanation, explanation_image_url: q.explanation_image_url || "", difficulty: q.difficulty }); setShowDialog(true); }}><Edit2 className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(q.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit OIR Question" : "Add OIR Question"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Question Text</Label><Textarea value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="What comes next in the series?" /></div>
              <div><Label className="text-xs">Question Image (optional)</Label><div className="flex gap-2"><Input value={form.question_image_url} onChange={e => setForm(p => ({ ...p, question_image_url: e.target.value }))} placeholder="URL" className="flex-1" /><ImageUploadButton bucket="question-images" onUpload={url => setForm(p => ({ ...p, question_image_url: url }))} /></div></div>
              {["a", "b", "c", "d"].map(opt => (
                <div key={opt} className="space-y-1">
                  <Label className="text-xs">Option {opt.toUpperCase()}</Label>
                  <Input value={(form as any)[`option_${opt}`]} onChange={e => setForm(p => ({ ...p, [`option_${opt}`]: e.target.value }))} />
                  <div className="flex gap-2"><Input value={(form as any)[`option_${opt}_image_url`]} onChange={e => setForm(p => ({ ...p, [`option_${opt}_image_url`]: e.target.value }))} placeholder="Image URL (optional)" className="flex-1 text-xs" /><ImageUploadButton bucket="question-images" onUpload={url => setForm(p => ({ ...p, [`option_${opt}_image_url`]: url }))} /></div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Correct Option</Label><Select value={form.correct_option} onValueChange={v => setForm(p => ({ ...p, correct_option: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["a","b","c","d"].map(o => <SelectItem key={o} value={o}>{o.toUpperCase()}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-xs">Difficulty</Label><Select value={form.difficulty} onValueChange={v => setForm(p => ({ ...p, difficulty: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label className="text-xs">Explanation</Label><Textarea value={form.explanation} onChange={e => setForm(p => ({ ...p, explanation: e.target.value }))} /></div>
              <div><Label className="text-xs">Explanation Image</Label><div className="flex gap-2"><Input value={form.explanation_image_url} onChange={e => setForm(p => ({ ...p, explanation_image_url: e.target.value }))} placeholder="URL" className="flex-1" /><ImageUploadButton bucket="question-images" onUpload={url => setForm(p => ({ ...p, explanation_image_url: url }))} /></div></div>
            </div>
            <DialogFooter><Button onClick={save} className="bg-gradient-gold text-primary-foreground font-bold">{editing ? "Update" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
