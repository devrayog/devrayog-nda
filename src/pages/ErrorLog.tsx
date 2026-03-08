import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, XCircle, CheckCircle, RotateCcw, Brain, Clock, Flame, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

interface ErrorItem {
  id: string;
  question: string;
  user_answer: string;
  correct_answer: string;
  explanation: string;
  subject: string;
  topic: string;
  source: string;
  review_count: number;
  next_review_at: string;
  mastered: boolean;
  created_at: string;
}

export default function ErrorLog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [legacyErrors, setLegacyErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"due" | "all" | "mastered">("due");
  const [filterSubject, setFilterSubject] = useState("all");

  const loadErrors = async () => {
    if (!user) return;
    // Load from error_log table
    const { data } = await supabase.from("error_log").select("*").eq("user_id", user.id).order("next_review_at", { ascending: true });
    if (data) setErrors(data as unknown as ErrorItem[]);

    // Also load legacy errors from test_results
    const { data: tests } = await supabase.from("test_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    if (tests) {
      const legacy: any[] = [];
      tests.forEach((test: any) => {
        const qd = test.questions_data as any[];
        if (Array.isArray(qd)) {
          qd.filter((q: any) => q.userAnswer !== undefined && q.userAnswer !== q.correct && q.userAnswer !== -1)
            .forEach((q: any) => legacy.push({ ...q, testDate: test.created_at, subject: test.subject }));
        }
      });
      setLegacyErrors(legacy);
    }
    setLoading(false);
  };

  useEffect(() => { loadErrors(); }, [user]);

  const markReviewed = async (id: string, reviewCount: number) => {
    // Spaced repetition: 1d, 3d, 7d, 14d, 30d
    const intervals = [1, 3, 7, 14, 30];
    const nextIdx = Math.min(reviewCount, intervals.length - 1);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervals[nextIdx]);

    await supabase.from("error_log").update({
      review_count: reviewCount + 1,
      next_review_at: nextDate.toISOString(),
    } as any).eq("id", id);
    toast({ title: `Reviewed! Next review in ${intervals[nextIdx]} day${intervals[nextIdx] > 1 ? "s" : ""}` });
    loadErrors();
  };

  const markMastered = async (id: string) => {
    await supabase.from("error_log").update({ mastered: true } as any).eq("id", id);
    toast({ title: "Marked as mastered! 🎉" });
    loadErrors();
  };

  const addToErrorLog = async (q: any) => {
    if (!user) return;
    await supabase.from("error_log").insert({
      user_id: user.id,
      question: q.question,
      user_answer: q.options?.[q.userAnswer] || String(q.userAnswer),
      correct_answer: q.options?.[q.correct] || String(q.correct),
      explanation: q.explanation || "",
      subject: q.subject || "",
      topic: q.topic || "",
      source: "test",
    } as any);
    toast({ title: "Added to spaced repetition!" });
    loadErrors();
  };

  const now = new Date();
  const dueErrors = errors.filter(e => !e.mastered && new Date(e.next_review_at) <= now);
  const allActive = errors.filter(e => !e.mastered);
  const masteredErrors = errors.filter(e => e.mastered);

  const displayed = filter === "due" ? dueErrors : filter === "mastered" ? masteredErrors : allActive;
  const subjectFiltered = filterSubject === "all" ? displayed : displayed.filter(e => e.subject === filterSubject);
  const subjects = [...new Set(errors.map(e => e.subject).filter(Boolean))];

  const timeUntil = (date: string) => {
    const d = new Date(date).getTime() - Date.now();
    if (d <= 0) return "Due now";
    const days = Math.floor(d / 86400000);
    const hours = Math.floor((d % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-destructive/20 to-primary/20">
              <BarChart3 className="h-7 w-7 text-destructive" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-gradient-gold">ERROR LOG</h1>
              <p className="text-muted-foreground text-xs">Spaced repetition for your weak areas</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="grid grid-cols-3 gap-3">
          {[
            { label: "Due Now", value: dueErrors.length, icon: Flame, color: "text-destructive" },
            { label: "Active", value: allActive.length, icon: Clock, color: "text-primary" },
            { label: "Mastered", value: masteredErrors.length, icon: CheckCircle, color: "text-success" },
          ].map((s, i) => (
            <Card key={i} className="glass-card border-gold">
              <CardContent className="p-3 text-center">
                <s.icon className={`h-4 w-4 ${s.color} mx-auto mb-1`} />
                <p className="font-display text-2xl">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="flex gap-2 flex-wrap">
          {([["due", "Due for Review"], ["all", "All Active"], ["mastered", "Mastered"]] as const).map(([key, label]) => (
            <Button key={key} size="sm" variant={filter === key ? "default" : "outline"} onClick={() => setFilter(key)}
              className={filter === key ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
              {label} {key === "due" && dueErrors.length > 0 && <span className="ml-1 bg-destructive/20 text-destructive text-[10px] px-1.5 rounded-full">{dueErrors.length}</span>}
            </Button>
          ))}
          {subjects.length > 1 && (
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="text-xs bg-card border border-border rounded-md px-2 py-1.5 ml-auto">
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </motion.div>

        {/* Error Items */}
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {subjectFiltered.map((err, i) => {
              const isDue = new Date(err.next_review_at) <= now;
              return (
                <motion.div key={err.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 3}>
                  <Card className={`glass-card ${isDue && !err.mastered ? "border-destructive/30" : "border-gold"} ${err.mastered ? "opacity-60" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {err.subject && <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">{err.subject}</span>}
                        {err.topic && <span className="text-[9px] text-muted-foreground">{err.topic}</span>}
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-auto">
                          {err.mastered ? "✅ Mastered" : isDue ? "🔥 Due now" : `⏰ ${timeUntil(err.next_review_at)}`}
                        </span>
                        <span className="text-[9px] text-muted-foreground">×{err.review_count} reviewed</span>
                      </div>
                      <p className="font-bold text-sm mb-2">{err.question}</p>
                      <p className="text-xs text-destructive mb-1">❌ Your answer: {err.user_answer}</p>
                      <p className="text-xs text-success mb-2">✅ Correct: {err.correct_answer}</p>
                      {err.explanation && <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mb-3">💡 {err.explanation}</p>}
                      {!err.mastered && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-gold text-xs" onClick={() => markReviewed(err.id, err.review_count)}>
                            <RotateCcw className="h-3 w-3 mr-1" /> Reviewed
                          </Button>
                          <Button size="sm" variant="outline" className="border-success text-success text-xs" onClick={() => markMastered(err.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Mastered
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {subjectFiltered.length === 0 && errors.length > 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">No errors in this view.</p>
            )}
          </div>
        )}

        {/* Legacy errors from tests (not yet in error_log) */}
        {legacyErrors.length > 0 && errors.length === 0 && (
          <div className="space-y-3">
            <h3 className="font-display text-sm text-gradient-gold">FROM YOUR TESTS</h3>
            <p className="text-xs text-muted-foreground">Click "Add to Review" to start spaced repetition for these errors.</p>
            {legacyErrors.slice(0, 20).map((err, i) => (
              <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="glass-card border-destructive/30">
                  <CardContent className="p-4">
                    <p className="font-bold text-sm mb-2">{err.question}</p>
                    <p className="text-xs text-destructive mb-1">❌ Your answer: {err.options?.[err.userAnswer]}</p>
                    <p className="text-xs text-success mb-2">✅ Correct: {err.options?.[err.correct]}</p>
                    {err.explanation && <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mb-3">💡 {err.explanation}</p>}
                    <Button size="sm" variant="outline" className="border-gold text-xs" onClick={() => addToErrorLog(err)}>
                      <RotateCcw className="h-3 w-3 mr-1" /> Add to Spaced Review
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {errors.length === 0 && legacyErrors.length === 0 && !loading && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <h2 className="font-display text-xl text-gradient-gold mb-2">NO ERRORS YET</h2>
              <p className="text-muted-foreground text-sm">Take tests and wrong answers will appear here with spaced repetition scheduling.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
