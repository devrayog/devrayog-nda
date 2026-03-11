import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Lock, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface MockQ {
  id: string;
  test_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  difficulty: string;
  sort_order: number;
  is_active: boolean;
}

const emptyQ = {
  question: "", option_a: "", option_b: "", option_c: "", option_d: "",
  correct_option: "a", explanation: "", difficulty: "medium", is_active: true, sort_order: 0,
};

export default function AdminMockQuestions() {
  const { testId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [testName, setTestName] = useState("");
  const [questions, setQuestions] = useState<MockQ[]>([]);
  const [editing, setEditing] = useState<Partial<MockQ> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
      if (data && data.length > 0) setIsAdmin(true);
      setChecking(false);
    });
  }, [user]);

  const load = async () => {
    if (!testId) return;
    const { data: test } = await supabase.from("resources").select("title").eq("id", testId).single();
    if (test) setTestName((test as any).title);
    const { data } = await supabase.from("mock_test_questions").select("*").eq("test_id", testId).order("sort_order");
    if (data) setQuestions(data as any);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, testId]);

  const handleSave = async () => {
    if (!editing?.question || !editing?.option_a) return;
    setSaving(true);
    try {
      if ((editing as MockQ).id) {
        const { id, ...rest } = editing as MockQ;
        await supabase.from("mock_test_questions").update(rest).eq("id", id);
        toast({ title: "Question updated" });
      } else {
        await supabase.from("mock_test_questions").insert({ ...editing, test_id: testId } as any);
        toast({ title: "Question added" });
      }
      setDialogOpen(false);
      setEditing(null);
      load();
    } catch { toast({ title: "Error", variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await supabase.from("mock_test_questions").delete().eq("id", id);
    toast({ title: "Question deleted" });
    load();
  };

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 max-w-md mx-auto mt-20"><Card className="glass-card border-gold"><CardContent className="p-8 text-center"><Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" /><h1 className="font-display text-3xl text-gradient-gold mb-2">ADMIN ACCESS</h1><p className="text-muted-foreground text-sm">Admin privileges required.</p></CardContent></Card></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/tests" className="flex items-center gap-1 text-muted-foreground text-sm mb-2 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Mock Tests
            </Link>
            <div className="flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h1 className="font-display text-3xl text-gradient-gold">MCQs: {testName}</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">{questions.length} question{questions.length !== 1 ? "s" : ""}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ ...emptyQ, sort_order: questions.length })} className="bg-gradient-gold text-primary-foreground font-bold">
                <Plus className="h-4 w-4 mr-2" /> Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-gradient-gold">{(editing as MockQ)?.id ? "Edit Question" : "New Question"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Question</label>
                  <Textarea value={editing?.question || ""} onChange={e => setEditing(ed => ({ ...ed!, question: e.target.value }))} placeholder="Enter question text" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground">Option A</label><Input value={editing?.option_a || ""} onChange={e => setEditing(ed => ({ ...ed!, option_a: e.target.value }))} /></div>
                  <div><label className="text-xs text-muted-foreground">Option B</label><Input value={editing?.option_b || ""} onChange={e => setEditing(ed => ({ ...ed!, option_b: e.target.value }))} /></div>
                  <div><label className="text-xs text-muted-foreground">Option C</label><Input value={editing?.option_c || ""} onChange={e => setEditing(ed => ({ ...ed!, option_c: e.target.value }))} /></div>
                  <div><label className="text-xs text-muted-foreground">Option D</label><Input value={editing?.option_d || ""} onChange={e => setEditing(ed => ({ ...ed!, option_d: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Correct Option</label>
                    <Select value={editing?.correct_option || "a"} onValueChange={v => setEditing(e => ({ ...e!, correct_option: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a">A</SelectItem>
                        <SelectItem value="b">B</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="d">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Difficulty</label>
                    <Select value={editing?.difficulty || "medium"} onValueChange={v => setEditing(e => ({ ...e!, difficulty: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Explanation</label>
                  <Textarea value={editing?.explanation || ""} onChange={e => setEditing(ed => ({ ...ed!, explanation: e.target.value }))} placeholder="Why this answer is correct" rows={2} />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">
                  {saving ? "Saving..." : "Save Question"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3">
          {questions.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="glass-card border-gold">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-muted-foreground mt-1">Q{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-2">{q.question}</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {["a", "b", "c", "d"].map(opt => (
                          <span key={opt} className={`px-2 py-1 rounded ${q.correct_option === opt ? "bg-success/20 text-success font-bold" : "text-muted-foreground"}`}>
                            {opt.toUpperCase()}: {(q as any)[`option_${opt}`]}
                          </span>
                        ))}
                      </div>
                      {q.explanation && <p className="text-xs text-muted-foreground mt-2 italic">💡 {q.explanation}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        q.difficulty === "easy" ? "bg-success/20 text-success" :
                        q.difficulty === "hard" ? "bg-destructive/20 text-destructive" :
                        "bg-primary/20 text-primary"
                      }`}>{q.difficulty}</span>
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(q); setDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(q.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {questions.length === 0 && (
            <Card className="glass-card border-gold">
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h2 className="font-display text-xl text-gradient-gold mb-2">NO QUESTIONS YET</h2>
                <p className="text-muted-foreground text-sm">Click "Add Question" to add MCQs for this mock test.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
