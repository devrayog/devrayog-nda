import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface FreeQuestion {
  id: string;
  subject: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: string;
}

const emptyForm = {
  id: "",
  subject: "maths",
  question_text: "",
  options: ["", "", "", ""],
  correct_index: 0,
  explanation: "",
  difficulty: "medium",
};

export default function AdminFreeMock() {
  const [subject, setSubject] = useState("maths");
  const [questions, setQuestions] = useState<FreeQuestion[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (sub: string) => {
    const { data } = await supabase
      .from("free_mock_questions")
      .select("*")
      .eq("subject", sub)
      .order("created_at", { ascending: true });
    setQuestions((data as unknown as FreeQuestion[]) || []);
  }, []);

  useEffect(() => { load(subject); }, [subject, load]);

  const save = async () => {
    if (!form.question_text.trim() || form.options.some(o => !o.trim())) {
      toast.error("Fill the question and all 4 options.");
      return;
    }
    setLoading(true);
    const payload = {
      subject: form.subject,
      question_text: form.question_text.trim(),
      options: form.options.map(o => o.trim()),
      correct_index: form.correct_index,
      explanation: form.explanation.trim(),
      difficulty: form.difficulty,
    };
    const { error } = editing
      ? await supabase.from("free_mock_questions").update(payload).eq("id", form.id)
      : await supabase.from("free_mock_questions").insert([payload]);
    setLoading(false);
    if (error) { toast.error("Save failed: " + error.message); return; }
    toast.success(editing ? "Question updated." : "Question added.");
    setForm(emptyForm);
    setEditing(false);
    load(subject);
  };

  const edit = (q: FreeQuestion) => {
    setForm({
      id: q.id,
      subject: q.subject,
      question_text: q.question_text,
      options: [...q.options, "", "", "", ""].slice(0, 4),
      correct_index: q.correct_index,
      explanation: q.explanation,
      difficulty: q.difficulty,
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("free_mock_questions").delete().eq("id", id);
    if (error) { toast.error("Delete failed."); return; }
    toast.success("Question deleted.");
    load(subject);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="font-display text-3xl text-gradient-gold">FREE MOCK QUESTIONS</h1>
          <p className="text-xs text-muted-foreground">Questions for the public /free-mock test — visible to everyone, no login needed.</p>
        </div>
      </div>

      <Card className="glass-card border-gold p-6 mb-8">
        <h2 className="font-display text-xl text-gradient-gold mb-4">
          {editing ? "EDIT QUESTION" : "ADD NEW QUESTION"}
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-mono tracking-widest text-primary">SUBJECT</Label>
            <Select value={form.subject} onValueChange={(v) => setForm(f => ({ ...f, subject: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="maths">Mathematics</SelectItem>
                <SelectItem value="gat">GAT (GK & Science)</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-mono tracking-widest text-primary">DIFFICULTY</Label>
            <Select value={form.difficulty} onValueChange={(v) => setForm(f => ({ ...f, difficulty: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5 mb-4">
          <Label className="text-xs font-mono tracking-widest text-primary">QUESTION *</Label>
          <Input value={form.question_text} onChange={(e) => setForm(f => ({ ...f, question_text: e.target.value }))} placeholder="Question text" />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {form.options.map((opt, i) => (
            <div key={i} className="space-y-1.5">
              <Label className="text-xs font-mono tracking-widest text-primary">
                OPTION {String.fromCharCode(65 + i)} {form.correct_index === i && <Badge className="ml-1 bg-success/20 text-success border-success/40 text-[9px]">CORRECT</Badge>}
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, correct_index: i }))}
                  className={`w-8 h-9 rounded-md border font-mono text-xs ${form.correct_index === i ? "border-success bg-success/20 text-success" : "border-border text-muted-foreground"}`}
                  title="Mark as correct answer"
                >✓</button>
                <Input value={opt} onChange={(e) => setForm(f => ({ ...f, options: f.options.map((o, oi) => (oi === i ? e.target.value : o)) }))} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 mb-4">
          <Label className="text-xs font-mono tracking-widest text-primary">EXPLANATION / SOLUTION</Label>
          <Input value={form.explanation} onChange={(e) => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Shown to the cadet after the test" />
        </div>
        <div className="flex gap-3">
          <Button className="bg-gradient-gold text-primary-foreground font-bold tracking-wider" onClick={save} disabled={loading}>
            <Save className="h-4 w-4 mr-2" /> {editing ? "UPDATE" : "SAVE"} QUESTION
          </Button>
          {editing && (
            <Button variant="outline" onClick={() => { setForm(emptyForm); setEditing(false); }}>Cancel</Button>
          )}
        </div>
      </Card>

      <div className="flex items-center gap-3 mb-4">
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="maths">Mathematics</SelectItem>
            <SelectItem value="gat">GAT (GK & Science)</SelectItem>
            <SelectItem value="english">English</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="border-primary/30 text-primary font-mono">{questions.length} QUESTIONS</Badge>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <Card key={q.id} className="glass-card border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-primary">Q{i + 1}</span>
                  <Badge variant="outline" className="border-border text-muted-foreground font-mono text-[9px] uppercase">{q.difficulty}</Badge>
                </div>
                <p className="text-sm font-medium truncate">{q.question_text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Correct: <span className="text-success">{q.options[q.correct_index]}</span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => edit(q)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {questions.length === 0 && (
          <Card className="glass-card border-border p-8 text-center text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2 text-primary" /> No questions yet for this subject.
          </Card>
        )}
      </div>
    </div>
  );
}
