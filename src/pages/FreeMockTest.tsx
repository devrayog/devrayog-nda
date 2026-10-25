import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Timer, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Target, BookOpen, Globe, Sigma, ChevronLeft, AlertTriangle } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Suspense, lazy } from "react";
const MilitaryParticles = lazy(() => import("@/components/3d/MilitaryParticles"));

interface FreeQuestion {
  id: string;
  subject: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: string;
}

interface SubjectConfig {
  key: string;
  title: string;
  desc: string;
  icon: typeof Sigma;
  marks: number;
  penalty: number;
  minutes: number;
  color: string;
}

const SUBJECTS: SubjectConfig[] = [
  { key: "maths", title: "Mathematics", desc: "Algebra, trigonometry, calculus, probability", icon: Sigma, marks: 2.5, penalty: 0.83, minutes: 15, color: "text-primary" },
  { key: "gat", title: "General Ability (GK & Science)", desc: "Physics, chemistry, history, geography, defence", icon: Globe, marks: 4, penalty: 1.33, minutes: 12, color: "text-accent" },
  { key: "english", title: "English", desc: "Grammar, vocabulary, idioms, comprehension", icon: BookOpen, marks: 4, penalty: 1.33, minutes: 10, color: "text-cyan" },
];

type Phase = "select" | "test" | "result";

interface AttemptResult {
  subject: string;
  score: number;
  maxScore: number;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  date: string;
}

const HISTORY_KEY = "free_mock_history_v1";

function loadHistory(): AttemptResult[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function FreeMockTest() {
  const [phase, setPhase] = useState<Phase>("select");
  const [subject, setSubject] = useState<SubjectConfig | null>(null);
  const [questions, setQuestions] = useState<FreeQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AttemptResult[]>(loadHistory());
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  const startTest = async (s: SubjectConfig) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("free_mock_questions")
      .select("*")
      .eq("subject", s.key);
    setLoading(false);
    if (error || !data || data.length === 0) {
      toast.error("Could not load questions. Try again, soldier.");
      return;
    }
    const shuffled = [...(data as unknown as FreeQuestion[])].sort(() => Math.random() - 0.5).slice(0, Math.min(10, data.length));
    setSubject(s);
    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
    setCurrent(0);
    setSecondsLeft(s.minutes * 60);
    setPhase("test");
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current!);
          finishRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finish = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (!subject) return;
    let correct = 0, wrong = 0, skipped = 0;
    questions.forEach((q, i) => {
      if (answers[i] === null) skipped++;
      else if (answers[i] === q.correct_index) correct++;
      else wrong++;
    });
    const score = correct * subject.marks - wrong * subject.penalty;
    const maxScore = questions.length * subject.marks;
    const entry: AttemptResult = {
      subject: subject.key,
      score: Math.round(score * 100) / 100,
      maxScore,
      correct, wrong, skipped,
      total: questions.length,
      date: new Date().toISOString(),
    };
    const next = [entry, ...loadHistory()].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setHistory(next);
    setPhase("result");
    window.scrollTo({ top: 0 });
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  const review = useMemo(() => {
    if (!subject) return null;
    let correct = 0, wrong = 0, skipped = 0;
    questions.forEach((q, i) => {
      if (answers[i] === null) skipped++;
      else if (answers[i] === q.correct_index) correct++;
      else wrong++;
    });
    return { correct, wrong, skipped, score: Math.round((correct * subject.marks - wrong * subject.penalty) * 100) / 100, maxScore: questions.length * subject.marks };
  }, [subject, questions, answers]);

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const bestFor = (key: string) => {
    const rows = history.filter(h => h.subject === key);
    return rows.length ? Math.max(...rows.map(r => r.score)) : null;
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Free NDA Mock Test Online — Maths, GAT, English"
        description="Take a free NDA mock test instantly — no signup. Subject-wise Maths, GAT and English practice with real NDA marking, timer and detailed solutions."
        path="/free-mock"
      />
      <Navbar />
      <Suspense fallback={null}>
        <MilitaryParticles className="fixed inset-0 opacity-20 pointer-events-none" />
      </Suspense>

      <section className="relative pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {phase === "select" && (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 mb-6">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono text-[10px] text-primary tracking-[3px]">NO LOGIN · NO SIGNUP · START NOW</span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl text-gradient-gold leading-tight mb-4">
                  FREE NDA MOCK TEST
                </h1>
                <p className="font-mono text-xs text-primary tracking-[4px] mb-6">
                  TRAIN BEFORE YOU ENLIST
                </p>
                <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Not on the waitlist yet? No problem. Pick a subject and start a timed mini mock
                  with <span className="text-primary font-semibold">real NDA marking</span> (+2.5/−0.83 Maths, +4/−1.33 GAT),
                  instant results and full solutions. Your scores are saved on this device.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-4">
                {SUBJECTS.map((s, i) => {
                  const best = bestFor(s.key);
                  return (
                    <motion.div key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <Card className="glass-card border-gold p-6 h-full flex flex-col">
                        <s.icon className={`h-9 w-9 ${s.color} mb-3`} />
                        <h2 className="font-display text-xl text-gradient-gold mb-1">{s.title}</h2>
                        <p className="text-muted-foreground text-xs mb-4 flex-1">{s.desc}</p>
                        <div className="font-mono text-[10px] text-muted-foreground tracking-widest space-y-1 mb-4">
                          <div>10 QUESTIONS · {s.minutes} MIN</div>
                          <div>+{s.marks} CORRECT · −{s.penalty} WRONG</div>
                          {best !== null && <div className="text-success">BEST: {best}/{10 * s.marks}</div>}
                        </div>
                        <Button
                          className="bg-gradient-gold text-primary-foreground font-bold tracking-wider"
                          disabled={loading}
                          onClick={() => startTest(s)}
                        >
                          {loading ? "LOADING..." : "START TEST"} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {history.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12">
                  <h3 className="font-display text-2xl text-gradient-gold mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" /> YOUR LAST ATTEMPTS
                  </h3>
                  <div className="space-y-2">
                    {history.slice(0, 5).map((h, i) => {
                      const s = SUBJECTS.find(x => x.key === h.subject);
                      return (
                        <div key={i} className="glass-card border border-border/50 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
                          <span className="font-semibold text-sm">{s?.title || h.subject}</span>
                          <span className="font-mono text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString()}</span>
                          <Badge variant="outline" className="border-primary/30 text-primary font-mono">
                            {h.score}/{h.maxScore}
                          </Badge>
                          <span className="font-mono text-xs text-muted-foreground hidden sm:block">
                            ✓{h.correct} ✗{h.wrong} −{h.skipped}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Ready for the full experience? Join the waitlist — credentials in 48–72 hours.
                </p>
                <Link to="/signup">
                  <Button variant="outline" className="border-gold text-primary font-bold tracking-wider">
                    JOIN THE WAITLIST <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}

          {phase === "test" && subject && questions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="sm" onClick={() => { if (timerRef.current) window.clearInterval(timerRef.current); setPhase("select"); }}>
                  <ChevronLeft className="h-4 w-4" /> Exit
                </Button>
                <Badge className={`font-mono tracking-widest ${secondsLeft < 60 ? "bg-destructive/20 text-destructive border-destructive/40" : "bg-primary/10 text-primary border-primary/30"}`}>
                  <Timer className="h-3.5 w-3.5 mr-1" /> {fmtTime(secondsLeft)}
                </Badge>
              </div>

              <Card className="glass-card border-gold p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] text-primary tracking-[3px]">
                    Q {current + 1} / {questions.length} · {subject.title.toUpperCase()}
                  </span>
                  <Badge variant="outline" className="border-border text-muted-foreground font-mono text-[9px] uppercase">
                    {questions[current].difficulty}
                  </Badge>
                </div>
                <p className="text-lg font-medium leading-relaxed mb-6">{questions[current].question_text}</p>
                <div className="space-y-3">
                  {questions[current].options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers(a => a.map((v, i) => (i === current ? oi : v)))}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        answers[current] === oi
                          ? "border-primary bg-primary/10 text-foreground font-semibold"
                          : "border-border hover:border-primary/40 hover:bg-secondary/30"
                      }`}
                    >
                      <span className="font-mono text-xs text-primary mr-2">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </Card>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-9 h-9 rounded-md font-mono text-xs border transition-colors ${
                      i === current ? "border-primary bg-primary/20 text-primary font-bold"
                      : answers[i] !== null ? "border-success/50 bg-success/10 text-success"
                      : "border-border text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between mt-8">
                <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                {current < questions.length - 1 ? (
                  <Button className="bg-gradient-gold text-primary-foreground font-bold tracking-wider" onClick={() => setCurrent(c => c + 1)}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="bg-gradient-gold text-primary-foreground font-bold tracking-wider" onClick={finish}>
                    SUBMIT TEST <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {phase === "result" && subject && review && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-8">
                <Target className="h-14 w-14 text-primary mx-auto mb-4" />
                <h1 className="font-display text-4xl md:text-5xl text-gradient-gold mb-2">MISSION REPORT</h1>
                <p className="font-mono text-xs text-primary tracking-[4px] mb-6">{subject.title.toUpperCase()} · DEBRIEF</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                  <Card className="glass-card border-gold p-4">
                    <div className="font-display text-3xl text-gradient-gold">{review.score}</div>
                    <div className="font-mono text-[9px] text-muted-foreground tracking-widest mt-1">SCORE / {review.maxScore}</div>
                  </Card>
                  <Card className="glass-card border-border p-4">
                    <div className="font-display text-3xl text-success">{review.correct}</div>
                    <div className="font-mono text-[9px] text-muted-foreground tracking-widest mt-1">CORRECT</div>
                  </Card>
                  <Card className="glass-card border-border p-4">
                    <div className="font-display text-3xl text-destructive">{review.wrong}</div>
                    <div className="font-mono text-[9px] text-muted-foreground tracking-widest mt-1">WRONG</div>
                  </Card>
                  <Card className="glass-card border-border p-4">
                    <div className="font-display text-3xl text-muted-foreground">{review.skipped}</div>
                    <div className="font-mono text-[9px] text-muted-foreground tracking-widest mt-1">SKIPPED</div>
                  </Card>
                </div>
              </div>

              <h2 className="font-display text-2xl text-gradient-gold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> SOLUTIONS
              </h2>
              <div className="space-y-4 mb-10">
                {questions.map((q, i) => {
                  const userAns = answers[i];
                  const isCorrect = userAns === q.correct_index;
                  const isSkipped = userAns === null;
                  return (
                    <Card key={q.id} className={`glass-card p-5 border ${isCorrect ? "border-success/40" : isSkipped ? "border-border" : "border-destructive/40"}`}>
                      <div className="flex items-start gap-3 mb-3">
                        {isCorrect ? <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" /> : isSkipped ? <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium leading-relaxed">Q{i + 1}. {q.question_text}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Your answer: <span className={isCorrect ? "text-success" : "text-destructive"}>{isSkipped ? "Not attempted" : q.options[userAns!]}</span>
                            {!isCorrect && <> · Correct: <span className="text-success font-semibold">{q.options[q.correct_index]}</span></>}
                          </p>
                          {q.explanation && (
                            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/40">
                              <span className="text-primary font-mono text-[9px] tracking-widest">SOLUTION · </span>{q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" className="border-gold text-primary font-bold tracking-wider" onClick={() => setPhase("select")}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Try Another Subject
                </Button>
                <Link to="/signup">
                  <Button className="bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                    JOIN THE WAITLIST <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
