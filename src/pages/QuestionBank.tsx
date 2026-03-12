import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, CheckCircle, XCircle, Brain, RotateCcw, Trophy, ChevronRight, BookmarkPlus } from "lucide-react";
import QuestionReportButton from "@/components/QuestionReportButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

interface Topic { id: string; subject: string; name: string; slug: string; emoji: string; }
interface Question {
  id: string; topic_id: string; question: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: string; explanation: string; difficulty: string;
}

export default function QuestionBank() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"browse" | "practice">("browse");
  const [filterSubject, setFilterSubject] = useState("all");

  useEffect(() => {
    supabase.from("study_topics").select("id, subject, name, slug, emoji").eq("is_active", true).order("subject").order("sort_order")
      .then(({ data }) => { if (data) setTopics(data as unknown as Topic[]); });
  }, []);

  const loadQuestions = async (topicId: string) => {
    setLoading(true);
    setSelectedTopic(topicId);
    setCurrentIdx(0);
    setAnswers({});
    setRevealed(new Set());
    const { data } = await supabase.from("topic_questions").select("*").eq("topic_id", topicId).eq("is_active", true);
    if (data) setQuestions(data as unknown as Question[]);
    setLoading(false);
    setMode("practice");
  };

  const handleAnswer = (qId: string, opt: string) => {
    if (revealed.has(qId)) return;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
    setRevealed(prev => new Set(prev).add(qId));

    // Add wrong answers to error log
    const q = questions.find(q => q.id === qId);
    if (q && opt !== q.correct_option && user) {
      const topic = topics.find(t => t.id === q.topic_id);
      supabase.from("error_log").insert({
        user_id: user.id,
        question: q.question,
        user_answer: q[`option_${opt}` as keyof Question] as string,
        correct_answer: q[`option_${q.correct_option}` as keyof Question] as string,
        explanation: q.explanation || "",
        subject: topic?.subject || "",
        topic: topic?.name || "",
        source: "question_bank",
      } as any);
    }
  };

  const stats = {
    total: questions.length,
    attempted: revealed.size,
    correct: [...revealed].filter(id => {
      const q = questions.find(q => q.id === id);
      return q && answers[id] === q.correct_option;
    }).length,
  };

  const filteredTopics = filterSubject === "all" ? topics : topics.filter(t => t.subject === filterSubject);
  const currentQ = questions[currentIdx];
  const topicName = topics.find(t => t.id === selectedTopic)?.name || "";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-gradient-gold">QUESTION BANK</h1>
              <p className="text-muted-foreground text-xs">Practice topic-wise MCQs</p>
            </div>
          </div>
        </motion.div>

        {mode === "browse" && (
          <>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex gap-2">
              {["all", "maths", "english", "gat"].map(s => (
                <Button key={s} size="sm" variant={filterSubject === s ? "default" : "outline"} onClick={() => setFilterSubject(s)}
                  className={filterSubject === s ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </motion.div>

            <div className="grid gap-3">
              {filteredTopics.map((topic, i) => (
                <motion.div key={topic.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
                  <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer" onClick={() => loadQuestions(topic.id)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="text-2xl">{topic.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{topic.name}</h3>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">{topic.subject}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {filteredTopics.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No topics available.</p>}
            </div>
          </>
        )}

        {mode === "practice" && (
          <>
            <div className="flex items-center justify-between">
              <Button size="sm" variant="ghost" onClick={() => setMode("browse")} className="text-muted-foreground">
                ← Back to Topics
              </Button>
              <h2 className="font-display text-lg text-gradient-gold">{topicName}</h2>
            </div>

            {/* Progress */}
            {stats.attempted > 0 && (
              <Card className="glass-card border-gold">
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-bold">{stats.correct}/{stats.attempted}</span>
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-gold rounded-full transition-all" style={{ width: `${(stats.attempted / stats.total) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{stats.attempted}/{stats.total}</span>
                  <span className="text-sm font-bold text-primary">{stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0}%</span>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
            ) : questions.length === 0 ? (
              <Card className="glass-card border-gold">
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                  <h2 className="font-display text-xl text-gradient-gold mb-2">NO QUESTIONS</h2>
                  <p className="text-muted-foreground text-sm">No MCQs available for this topic yet. Admins can add questions.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Question Card */}
                <AnimatePresence mode="wait">
                  {currentQ && (
                    <motion.div key={currentQ.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <Card className={`glass-card border-gold ${revealed.has(currentQ.id) ? (answers[currentQ.id] === currentQ.correct_option ? "ring-1 ring-success/30" : "ring-1 ring-destructive/30") : ""}`}>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-mono text-muted-foreground">Q{currentIdx + 1}/{questions.length}</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                              currentQ.difficulty === "easy" ? "bg-success/20 text-success" : currentQ.difficulty === "hard" ? "bg-destructive/20 text-destructive" : "bg-accent/20 text-accent"
                            }`}>{currentQ.difficulty}</span>
                          </div>
                          <p className="text-sm font-medium mb-4">{currentQ.question}</p>
                          <div className="space-y-2">
                            {(["a", "b", "c", "d"] as const).map(opt => {
                              const text = currentQ[`option_${opt}` as keyof Question] as string;
                              const isRevealed = revealed.has(currentQ.id);
                              const isSelected = answers[currentQ.id] === opt;
                              const isCorrectOpt = currentQ.correct_option === opt;
                              let cls = "w-full p-3 rounded-lg border text-left text-sm transition-all ";
                              if (!isRevealed) {
                                cls += "border-border hover:border-primary hover:bg-primary/5 cursor-pointer";
                              } else if (isCorrectOpt) {
                                cls += "border-success bg-success/10 font-bold";
                              } else if (isSelected) {
                                cls += "border-destructive bg-destructive/10";
                              } else {
                                cls += "border-border opacity-50";
                              }
                              return (
                                <button key={opt} onClick={() => handleAnswer(currentQ.id, opt)} className={cls} disabled={isRevealed}>
                                  <span className="font-bold mr-2 text-primary">{opt.toUpperCase()}.</span> {text}
                                  {isRevealed && isCorrectOpt && <CheckCircle className="h-4 w-4 inline ml-2 text-success" />}
                                  {isRevealed && isSelected && !isCorrectOpt && <XCircle className="h-4 w-4 inline ml-2 text-destructive" />}
                                </button>
                              );
                            })}
                          </div>
                          {revealed.has(currentQ.id) && currentQ.explanation && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">💡 {currentQ.explanation}</p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex gap-3 justify-between">
                  <Button size="sm" variant="outline" className="border-gold" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}>
                    ← Previous
                  </Button>
                  <div className="flex gap-1 overflow-x-auto">
                    {questions.map((q, i) => (
                      <button key={q.id} onClick={() => setCurrentIdx(i)}
                        className={`w-7 h-7 rounded-md text-[10px] font-mono transition-all flex-shrink-0 ${
                          i === currentIdx ? "bg-gradient-gold text-primary-foreground" :
                          revealed.has(q.id) ? (answers[q.id] === q.correct_option ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive") :
                          "bg-muted text-muted-foreground"
                        }`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="border-gold" disabled={currentIdx >= questions.length - 1} onClick={() => setCurrentIdx(i => i + 1)}>
                    Next →
                  </Button>
                </div>

                {/* Completion */}
                {stats.attempted === stats.total && stats.total > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="glass-card border-gold ring-1 ring-primary/20">
                      <CardContent className="p-6 text-center">
                        <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
                        <h3 className="font-display text-2xl text-gradient-gold mb-1">COMPLETED!</h3>
                        <p className="text-sm">Score: <span className="font-bold text-primary">{stats.correct}/{stats.total}</span> ({Math.round((stats.correct / stats.total) * 100)}%)</p>
                        <div className="flex gap-3 justify-center mt-4">
                          <Button size="sm" variant="outline" className="border-gold" onClick={() => { setAnswers({}); setRevealed(new Set()); setCurrentIdx(0); }}>
                            <RotateCcw className="h-3 w-3 mr-1" /> Retry
                          </Button>
                          <Button size="sm" onClick={() => setMode("browse")} className="bg-gradient-gold text-primary-foreground font-bold">
                            More Topics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
