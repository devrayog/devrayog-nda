import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FolderOpen, Brain, CheckCircle, XCircle, Download, FileText, Plus, Trash2 } from "lucide-react";
import QuestionReportButton from "@/components/QuestionReportButton";
import { PremiumButton } from "@/components/PremiumGate";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import BookmarkButton from "@/components/BookmarkButton";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };

interface PYQQuestion {
  id: string; year: number; paper: string; subject: string; topic: string;
  question: string; option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: string; explanation: string; difficulty: string;
}

interface PYQPaper { id: string; title: string; body: string; link: string; category: string; }

export default function PYQ() {
  const { user } = useAuth();
  const { toast } = useToast();
  const meta = user?.user_metadata || {};
  const [questions, setQuestions] = useState<PYQQuestion[]>([]);
  const [papers, setPapers] = useState<PYQPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [analysis, setAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddPaper, setShowAddPaper] = useState(false);
  const [paperForm, setPaperForm] = useState({ title: "", link: "", category: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("pyq_questions").select("*").eq("is_active", true).order("year", { ascending: false }).order("subject"),
      supabase.from("resources").select("*").eq("type", "pyq_paper").eq("is_active", true).order("sort_order"),
    ]).then(([qRes, pRes]) => {
      setQuestions((qRes.data as unknown as PYQQuestion[]) || []);
      setPapers((pRes.data as PYQPaper[]) || []);
      setLoading(false);
    });
    if (user) {
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
        .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); });
    }
  }, [user]);

  const years = [...new Set(questions.map(q => q.year))].sort((a, b) => b - a);
  const filtered = questions.filter(q =>
    (filterYear === "all" || q.year === parseInt(filterYear)) &&
    (filterSubject === "all" || q.subject === filterSubject)
  );

  const handleAnswer = (qId: string, opt: string) => {
    if (revealed.has(qId)) return;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
    setRevealed(prev => new Set(prev).add(qId));
  };

  const stats = {
    attempted: revealed.size,
    correct: [...revealed].filter(id => { const q = questions.find(q => q.id === id); return q && answers[id] === q.correct_option; }).length,
  };

  const addPaper = async () => {
    if (!paperForm.title || !paperForm.link) return;
    setSaving(true);
    const { error } = await supabase.from("resources").insert({
      title: paperForm.title, link: paperForm.link, body: "", category: paperForm.category || "NDA",
      type: "pyq_paper", sort_order: papers.length,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Paper link added!" });
      setShowAddPaper(false);
      setPaperForm({ title: "", link: "", category: "" });
      const { data } = await supabase.from("resources").select("*").eq("type", "pyq_paper").eq("is_active", true).order("sort_order");
      setPapers((data as PYQPaper[]) || []);
    }
    setSaving(false);
  };

  const deletePaper = async (id: string) => {
    await supabase.from("resources").update({ is_active: false }).eq("id", id);
    setPapers(prev => prev.filter(p => p.id !== id));
    toast({ title: "Paper removed" });
  };

  const generateAnalysis = async () => {
    setAiLoading(true); setAnalysis("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: "Analyze NDA PYQ papers (2019-2025). List top repeated topics, weightage, must-do topics. Use markdown." }] }),
      });
      if (!resp.ok || !resp.body) throw new Error("Failed");
      const reader = resp.body.getReader(); const decoder = new TextDecoder();
      let buffer = "", text = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) { text += c; setAnalysis(text); } } catch {}
        }
      }
    } catch { setAnalysis("Failed to generate analysis."); }
    setAiLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <FolderOpen className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-gradient-gold">PREVIOUS YEAR PAPERS</h1>
              <p className="text-muted-foreground text-xs">{questions.length} questions from past NDA exams</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="questions">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="questions">MCQ Practice</TabsTrigger>
            <TabsTrigger value="papers">Paper Downloads</TabsTrigger>
          </TabsList>

          <TabsContent value="papers" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Download full question papers. Admin-managed collection.</p>
              {isAdmin && (
                <Button size="sm" onClick={() => setShowAddPaper(true)} className="bg-gradient-gold text-primary-foreground font-bold">
                  <Plus className="h-4 w-4 mr-1" /> Add Paper
                </Button>
              )}
            </div>
            {papers.length === 0 && <p className="text-center text-muted-foreground py-8">No papers added yet.</p>}
            {papers.map((paper, i) => (
              <motion.div key={paper.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{paper.title}</h3>
                      <p className="text-[10px] text-muted-foreground">{paper.category}</p>
                    </div>
                    <a href={paper.link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="border-gold">
                        <Download className="h-3 w-3 mr-1" /> Download
                      </Button>
                    </a>
                    {isAdmin && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePaper(paper.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="questions" className="mt-4 space-y-4">
            {stats.attempted > 0 && (
              <Card className="glass-card border-gold">
                <CardContent className="p-3 flex items-center gap-6">
                  <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /><span className="text-sm font-bold">{stats.correct}/{stats.attempted}</span><span className="text-xs text-muted-foreground">correct</span></div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-gold rounded-full transition-all" style={{ width: `${stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0}%` }} /></div>
                  <span className="text-sm font-bold text-primary">{stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0}%</span>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2 flex-wrap">
              <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="text-xs bg-card border border-border rounded-md px-2 py-1.5">
                <option value="all">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {["all", "maths", "english", "gat"].map(s => (
                <Button key={s} size="sm" variant={filterSubject === s ? "default" : "outline"} onClick={() => setFilterSubject(s)}
                  className={filterSubject === s ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</Button>
              ))}
              <Button size="sm" variant="outline" onClick={generateAnalysis} disabled={aiLoading} className="border-gold ml-auto"><Brain className="h-3 w-3 mr-1" /> AI Analysis</Button>
            </div>

            <AnimatePresence>
              {(analysis || aiLoading) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <Card className="glass-card border-gold">
                    <CardContent className="p-5">
                      <h3 className="font-display text-sm text-gradient-gold mb-3 flex items-center gap-2"><Brain className="h-4 w-4" /> AI PYQ ANALYSIS</h3>
                      {aiLoading && !analysis && <div className="flex gap-1.5 justify-center py-4">{[0, 1, 2].map(i => (<motion.div key={i} className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />))}</div>}
                      {analysis && <div className="prose prose-sm max-w-none text-foreground"><ReactMarkdown>{analysis}</ReactMarkdown></div>}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
            : filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((q, i) => {
                  const isRevealed = revealed.has(q.id);
                  const userAns = answers[q.id];
                  const isCorrect = userAns === q.correct_option;
                  return (
                    <motion.div key={q.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 3}>
                      <Card className={`glass-card border-gold ${isRevealed ? (isCorrect ? "ring-1 ring-success/30" : "ring-1 ring-destructive/30") : ""}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{q.year} {q.paper}</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">{q.subject}</span>
                            {q.topic && <span className="text-[9px] text-muted-foreground">{q.topic}</span>}
                            <div className="ml-auto flex items-center gap-1">
                              <QuestionReportButton
                                questionText={q.question}
                                options={{ a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d }}
                                correctAnswer={q.correct_option}
                                userAnswer={answers[q.id]}
                                explanation={q.explanation}
                                source="pyq"
                              />
                              <BookmarkButton itemId={q.id} itemType="pyq_question" title={q.question} />
                            </div>
                          </div>
                          <p className="text-sm font-medium mb-3">Q{i + 1}. {q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {(["a", "b", "c", "d"] as const).map(opt => {
                              const text = q[`option_${opt}` as keyof PYQQuestion] as string;
                              const isSelected = userAns === opt;
                              const isCorrectOpt = q.correct_option === opt;
                              let cls = "p-2.5 rounded-lg border text-xs cursor-pointer transition-all ";
                              if (!isRevealed) cls += "border-border hover:border-primary hover:bg-primary/5";
                              else if (isCorrectOpt) cls += "border-success bg-success/10 text-success font-bold";
                              else if (isSelected && !isCorrectOpt) cls += "border-destructive bg-destructive/10 text-destructive";
                              else cls += "border-border opacity-50";
                              return (
                                <button key={opt} onClick={() => handleAnswer(q.id, opt)} className={cls} disabled={isRevealed}>
                                  <span className="font-bold mr-2">{opt.toUpperCase()}.</span> {text}
                                  {isRevealed && isCorrectOpt && <CheckCircle className="h-3 w-3 inline ml-2" />}
                                  {isRevealed && isSelected && !isCorrectOpt && <XCircle className="h-3 w-3 inline ml-2" />}
                                </button>
                              );
                            })}
                          </div>
                          {isRevealed && q.explanation && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-2.5 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">💡 {q.explanation}</p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="glass-card border-gold"><CardContent className="p-8 text-center">
                <FolderOpen className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h2 className="font-display text-xl text-gradient-gold mb-2">NO PYQs YET</h2>
                <p className="text-muted-foreground text-sm mb-4">PYQ questions will be added by admins.</p>
                <Button onClick={generateAnalysis} disabled={aiLoading} className="bg-gradient-gold text-primary-foreground font-bold"><Brain className="h-4 w-4 mr-2" /> Generate AI PYQ Analysis</Button>
              </CardContent></Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Paper Dialog */}
        <Dialog open={showAddPaper} onOpenChange={setShowAddPaper}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add PYQ Paper Download Link</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Paper Title</Label><Input value={paperForm.title} onChange={e => setPaperForm(p => ({ ...p, title: e.target.value }))} placeholder="NDA 1 2024 Maths Paper" /></div>
              <div><Label className="text-xs">Download Link (URL)</Label><Input value={paperForm.link} onChange={e => setPaperForm(p => ({ ...p, link: e.target.value }))} placeholder="https://..." /></div>
              <div><Label className="text-xs">Category</Label><Input value={paperForm.category} onChange={e => setPaperForm(p => ({ ...p, category: e.target.value }))} placeholder="NDA 1 2024" /></div>
            </div>
            <DialogFooter>
              <Button onClick={addPaper} disabled={saving} className="bg-gradient-gold text-primary-foreground font-bold">{saving ? "Saving..." : "Add Paper"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
