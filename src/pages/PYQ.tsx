import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, Brain, CheckCircle, XCircle, Download, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import BookmarkButton from "@/components/BookmarkButton";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

interface PYQ {
  id: string; year: number; paper: string; subject: string; topic: string;
  question: string; option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: string; explanation: string; difficulty: string;
}

// Static PDF papers for download
const PYQ_PAPERS = [
  { year: 2024, paper: "NDA 2", label: "NDA 2 2024 Question Paper", url: "#" },
  { year: 2024, paper: "NDA 1", label: "NDA 1 2024 Question Paper", url: "#" },
  { year: 2023, paper: "NDA 2", label: "NDA 2 2023 Question Paper", url: "#" },
  { year: 2023, paper: "NDA 1", label: "NDA 1 2023 Question Paper", url: "#" },
  { year: 2022, paper: "NDA 2", label: "NDA 2 2022 Question Paper", url: "#" },
  { year: 2022, paper: "NDA 1", label: "NDA 1 2022 Question Paper", url: "#" },
];

export default function PYQ() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const meta = user?.user_metadata || {};
  const [questions, setQuestions] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [analysis, setAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    supabase.from("pyq_questions").select("*").eq("is_active", true).order("year", { ascending: false }).order("subject")
      .then(({ data }) => { if (data) setQuestions(data as unknown as PYQ[]); setLoading(false); });
  }, []);

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
    correct: [...revealed].filter(id => {
      const q = questions.find(q => q.id === id);
      return q && answers[id] === q.correct_option;
    }).length,
  };

  const generateAnalysis = async () => {
    setAiLoading(true); setAnalysis("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Analyze NDA previous year question papers (2019-2025) using markdown. Use ## headers for each subject (Maths, GAT, English). List: top 10 most repeated topics, weightage %, chapter-wise question count trend. End with a **Must-do topics** list." }],
          userContext: { name: meta.full_name, medium: meta.medium, language },
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("Failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
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

          {/* Papers Tab */}
          <TabsContent value="papers" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">Download full question papers as PDFs. Admin-managed collection.</p>
            {PYQ_PAPERS.map((paper, i) => (
              <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{paper.label}</h3>
                      <p className="text-[10px] text-muted-foreground">{paper.year} • {paper.paper}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-gold" disabled={paper.url === "#"}>
                      <Download className="h-3 w-3 mr-1" /> {paper.url === "#" ? "Coming Soon" : "Download"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="mt-4 space-y-4">
            {/* Stats */}
            {stats.attempted > 0 && (
              <Card className="glass-card border-gold">
                <CardContent className="p-3 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-bold">{stats.correct}/{stats.attempted}</span>
                    <span className="text-xs text-muted-foreground">correct</span>
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-gold rounded-full transition-all" style={{ width: `${stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0}%` }} />
                  </div>
                  <span className="text-sm font-bold text-primary">{stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0}%</span>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="text-xs bg-card border border-border rounded-md px-2 py-1.5">
                <option value="all">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {["all", "maths", "english", "gat"].map(s => (
                <Button key={s} size="sm" variant={filterSubject === s ? "default" : "outline"} onClick={() => setFilterSubject(s)}
                  className={filterSubject === s ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
              <Button size="sm" variant="outline" onClick={generateAnalysis} disabled={aiLoading} className="border-gold ml-auto">
                <Brain className="h-3 w-3 mr-1" /> AI Analysis
              </Button>
            </div>

            {/* AI Analysis */}
            <AnimatePresence>
              {(analysis || aiLoading) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <Card className="glass-card border-gold">
                    <CardContent className="p-5">
                      <h3 className="font-display text-sm text-gradient-gold mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4" /> AI PYQ ANALYSIS
                      </h3>
                      {aiLoading && !analysis && (
                        <div className="flex gap-1.5 justify-center py-4">
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                          ))}
                        </div>
                      )}
                      {analysis && (
                        <div className="prose prose-sm max-w-none text-foreground leading-relaxed prose-headings:font-display prose-headings:text-primary">
                          <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Questions */}
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
            ) : filtered.length > 0 ? (
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
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ml-auto ${
                              q.difficulty === "easy" ? "bg-success/20 text-success" : q.difficulty === "hard" ? "bg-destructive/20 text-destructive" : "bg-accent/20 text-accent"
                            }`}>{q.difficulty}</span>
                            <BookmarkButton itemId={q.id} itemType="pyq_question" title={q.question} />
                          </div>
                          <p className="text-sm font-medium mb-3">Q{i + 1}. {q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {(["a", "b", "c", "d"] as const).map(opt => {
                              const text = q[`option_${opt}` as keyof PYQ] as string;
                              const isSelected = userAns === opt;
                              const isCorrectOpt = q.correct_option === opt;
                              let cls = "p-2.5 rounded-lg border text-xs cursor-pointer transition-all ";
                              if (!isRevealed) {
                                cls += "border-border hover:border-primary hover:bg-primary/5";
                              } else if (isCorrectOpt) {
                                cls += "border-success bg-success/10 text-success font-bold";
                              } else if (isSelected && !isCorrectOpt) {
                                cls += "border-destructive bg-destructive/10 text-destructive";
                              } else {
                                cls += "border-border opacity-50";
                              }
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
            ) : questions.length === 0 ? (
              <Card className="glass-card border-gold">
                <CardContent className="p-8 text-center">
                  <FolderOpen className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                  <h2 className="font-display text-xl text-gradient-gold mb-2">NO PYQs YET</h2>
                  <p className="text-muted-foreground text-sm mb-4">PYQ questions will be added by admins. Use AI Analysis!</p>
                  <Button onClick={generateAnalysis} disabled={aiLoading} className="bg-gradient-gold text-primary-foreground font-bold">
                    <Brain className="h-4 w-4 mr-2" /> Generate AI PYQ Analysis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No questions match your filters.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
