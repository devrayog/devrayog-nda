import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, ChevronRight, Flag, Brain, CheckCircle, XCircle, Bookmark, Eye, AlertTriangle, BookmarkPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BookmarkButton from "@/components/BookmarkButton";
import QuestionReportButton from "@/components/QuestionReportButton";
import { motion } from "framer-motion";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
  questionImage?: string;
  optionImages?: string[];
  explanationImage?: string;
}

type Phase = "generating" | "test" | "results";

export default function MockTestEngine() {
  const [params] = useSearchParams();
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const subject = params.get("subject") || "maths";
  const numQ = parseInt(params.get("questions") || "15");
  const timeMins = parseInt(params.get("time") || "20");

  const isAdminTest = testId?.startsWith("admin-");
  const adminTestId = isAdminTest ? testId!.replace("admin-", "") : null;

  const isMaths = subject === "maths";
  const correctMarks = isMaths ? 2.5 : 4;
  const negativeMarks = isMaths ? 2.5 / 3 : 4 / 3;

  const [phase, setPhase] = useState<Phase>("generating");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timeMins * 60);
  const [score, setScore] = useState({ correct: 0, wrong: 0, unattempted: 0, total: 0, marks: 0, maxMarks: 0 });

  const meta = user?.user_metadata || {};

  useEffect(() => {
    if (isAdminTest && adminTestId) {
      loadAdminQuestions();
    } else {
      generateAIQuestions();
    }
  }, []);

  const loadAdminQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("mock_test_questions")
        .select("*")
        .eq("test_id", adminTestId!)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ title: "No questions found", description: "Admin hasn't added questions to this test yet.", variant: "destructive" });
        setTimeout(() => navigate("/tests"), 2000);
        return;
      }

      const mapped: Question[] = data.map((q: any, i: number) => {
        const optMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
        return {
          id: i + 1,
          question: q.question,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correct: optMap[q.correct_option] ?? 0,
          explanation: q.explanation || "",
          topic: q.difficulty || "General",
          questionImage: q.question_image_url,
          optionImages: [q.option_a_image_url, q.option_b_image_url, q.option_c_image_url, q.option_d_image_url],
          explanationImage: q.explanation_image_url,
        };
      });

      setQuestions(mapped);
      setTimeLeft(Math.max(mapped.length * 1.5, timeMins) * 60);
      setPhase("test");
    } catch (e) {
      toast({ title: "Failed to load questions", variant: "destructive" });
      setTimeout(() => navigate("/tests"), 2000);
    }
  };

  const generateAIQuestions = async () => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate exactly ${numQ} NDA-level multiple choice questions for subject: ${subject}. Return ONLY a valid JSON array. Each object must have: "id": number (1 to ${numQ}), "question": string, "options": array of exactly 4 strings, "correct": number (0-3), "explanation": string, "topic": string. NDA exam difficulty. No markdown.` }],
          userContext: { name: meta.full_name, attempt: meta.attempt, medium: meta.medium, language },
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("Failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", fullText = "";
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
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) fullText += c; } catch {}
        }
      }
      const jsonMatch = fullText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON");
      const parsed = JSON.parse(jsonMatch[0]) as Question[];
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid");
      setQuestions(parsed.slice(0, numQ));
      setPhase("test");
    } catch {
      toast({ title: "Failed to generate questions. Retrying...", variant: "destructive" });
      setTimeout(() => navigate("/tests"), 2000);
    }
  };

  useEffect(() => {
    if (phase !== "test") return;
    const timer = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(timer); submitTest(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const submitTest = useCallback(async () => {
    const correct = questions.filter((q) => answers[q.id] === q.correct).length;
    const attempted = Object.keys(answers).length;
    const wrong = attempted - correct;
    const unattempted = questions.length - attempted;
    const totalMarks = Math.max(0, correct * correctMarks - wrong * negativeMarks);
    const maxMarks = questions.length * correctMarks;
    const percentage = Math.round((totalMarks / maxMarks) * 100);
    setScore({ correct, wrong, unattempted, total: percentage, marks: Math.round(totalMarks * 100) / 100, maxMarks });
    setPhase("results");
    if (user) {
      await supabase.from("test_results").insert({
        user_id: user.id, test_type: subject, subject, total_questions: questions.length,
        correct_answers: correct, wrong_answers: wrong, score: percentage,
        time_taken_seconds: timeMins * 60 - timeLeft,
        questions_data: questions.map(q => ({ ...q, userAnswer: answers[q.id] ?? -1 })),
      });
      questions.forEach(q => {
        if (answers[q.id] !== undefined && answers[q.id] !== q.correct) {
          supabase.from("error_log").insert({
            user_id: user.id, question: q.question, user_answer: q.options[answers[q.id]],
            correct_answer: q.options[q.correct], explanation: q.explanation, subject, topic: q.topic, source: isAdminTest ? "admin_mock_test" : "mock_test",
          });
        }
      });
    }
  }, [questions, answers, user, timeLeft]);

  const toggleReview = (qId: number) => {
    setMarkedForReview(prev => { const next = new Set(prev); if (next.has(qId)) next.delete(qId); else next.add(qId); return next; });
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (phase === "generating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Brain className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <h1 className="font-display text-3xl text-gradient-gold mb-2">{isAdminTest ? "LOADING TEST" : "GENERATING TEST"}</h1>
          <p className="text-muted-foreground text-sm">{isAdminTest ? "Loading admin-added questions..." : `AI is creating ${numQ} personalized ${subject} questions...`}</p>
          <p className="text-xs text-muted-foreground mt-1">Marking: +{correctMarks} correct / -{negativeMarks.toFixed(2)} wrong</p>
          <div className="flex gap-1 justify-center mt-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="font-display text-4xl text-gradient-gold mb-2">TEST RESULTS</h1>
            <p className="font-display text-6xl text-gradient-gold">{score.total}%</p>
            <p className="text-sm text-muted-foreground mt-1">Marks: {score.marks} / {score.maxMarks}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Card className="glass-card border-gold"><CardContent className="p-4 text-center"><CheckCircle className="h-6 w-6 text-success mx-auto mb-1" /><p className="font-display text-2xl">{score.correct}</p><p className="text-[9px] font-mono text-muted-foreground tracking-widest">CORRECT</p></CardContent></Card>
            <Card className="glass-card border-gold"><CardContent className="p-4 text-center"><XCircle className="h-6 w-6 text-destructive mx-auto mb-1" /><p className="font-display text-2xl">{score.wrong}</p><p className="text-[9px] font-mono text-muted-foreground tracking-widest">WRONG</p></CardContent></Card>
            <Card className="glass-card border-gold"><CardContent className="p-4 text-center"><Flag className="h-6 w-6 text-muted-foreground mx-auto mb-1" /><p className="font-display text-2xl">{score.unattempted}</p><p className="text-[9px] font-mono text-muted-foreground tracking-widest">SKIPPED</p></CardContent></Card>
          </div>
          <h2 className="font-display text-xl text-gradient-gold">QUESTION REVIEW</h2>
          {questions.map((q, i) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correct;
            return (
              <Card key={i} className={`glass-card ${userAns === undefined ? "border-gold" : isCorrect ? "border-success/50" : "border-destructive/50"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-sm">Q{i + 1}. {q.question}</p>
                      {q.questionImage && <img src={q.questionImage} alt="" className="mt-2 max-h-40 rounded-lg" />}
                    </div>
                    <div className="flex items-center gap-1">
                      <QuestionReportButton questionText={q.question} options={{ a: q.options[0], b: q.options[1], c: q.options[2], d: q.options[3] }} correctAnswer={String.fromCharCode(97 + q.correct)} userAnswer={userAns !== undefined ? String.fromCharCode(97 + userAns) : ""} explanation={q.explanation} source={isAdminTest ? "admin_mock_test" : "mock_test"} />
                      <BookmarkButton itemId={`mock-${q.id}`} itemType="mock_question" title={q.question} />
                      {userAns !== undefined && userAns !== q.correct && user && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" title="Add to Error Log"
                          onClick={async () => { await supabase.from("error_log").insert({ user_id: user.id, question: q.question, user_answer: q.options[userAns], correct_answer: q.options[q.correct], explanation: q.explanation, subject, topic: q.topic, source: "mock_test_manual" }); toast({ title: "Added to Error Log" }); }}>
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1 mb-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`text-xs p-2 rounded ${oi === q.correct ? "bg-success/20 text-success font-bold" : oi === userAns && oi !== q.correct ? "bg-destructive/20 text-destructive" : "text-muted-foreground"}`}>
                        {String.fromCharCode(65 + oi)}. {opt} {oi === q.correct && " ✓"} {oi === userAns && oi !== q.correct && " ✗"}
                        {q.optionImages?.[oi] && <img src={q.optionImages[oi]} alt="" className="mt-1 max-h-24 rounded" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded"><span className="font-bold">Explanation:</span> {q.explanation}</p>
                  {q.explanationImage && <img src={q.explanationImage} alt="" className="mt-2 max-h-32 rounded" />}
                </CardContent>
              </Card>
            );
          })}
          <div className="flex gap-3">
            <Button onClick={() => navigate("/tests")} variant="outline" className="flex-1 border-gold">Back to Tests</Button>
            <Button onClick={() => navigate("/ai-tutor")} className="flex-1 bg-gradient-gold text-primary-foreground font-bold"><Brain className="h-4 w-4 mr-2" /> Discuss with AI</Button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-background/95 backdrop-blur-xl border-b border-gold">
        <span className="font-mono text-xs text-primary">Q {current + 1}/{questions.length}</span>
        <span className={`font-mono text-sm font-bold ${timeLeft < 60 ? "text-destructive animate-pulse" : "text-primary"}`}><Clock className="h-4 w-4 inline mr-1" />{formatTime(timeLeft)}</span>
        <Button size="sm" variant="destructive" onClick={submitTest} className="font-bold text-xs"><Flag className="h-3 w-3 mr-1" /> Submit</Button>
      </div>
      <div className="fixed top-14 left-0 right-0 z-40 p-2 bg-background/90 border-b border-gold overflow-x-auto">
        <div className="flex gap-1 justify-center">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-7 h-7 rounded-full text-[10px] font-bold transition-all ${i === current ? "bg-gradient-gold text-primary-foreground scale-110" : markedForReview.has(questions[i]?.id) ? "bg-warning/30 text-warning ring-1 ring-warning" : answers[questions[i]?.id] !== undefined ? "bg-success/30 text-success" : "bg-muted text-muted-foreground"}`}>{i + 1}</button>
          ))}
        </div>
      </div>
      <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto">
        <Card className="glass-card border-gold">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[10px] text-primary tracking-widest">{q.topic?.toUpperCase()}</p>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleReview(q.id)}>
                  <Eye className={`h-4 w-4 ${markedForReview.has(q.id) ? "text-warning" : "text-muted-foreground"}`} />
                </Button>
                <QuestionReportButton questionText={q.question} options={{ a: q.options[0], b: q.options[1], c: q.options[2], d: q.options[3] }} correctAnswer={String.fromCharCode(97 + q.correct)} explanation={q.explanation} source={isAdminTest ? "admin_mock_test" : "mock_test"} />
                <BookmarkButton itemId={`mock-${q.id}`} itemType="mock_question" title={q.question} size="icon" />
              </div>
            </div>
            <p className="font-bold text-base mb-4 leading-relaxed">{q.question}</p>
            {q.questionImage && <img src={q.questionImage} alt="" className="mb-4 max-h-48 rounded-lg mx-auto" />}
            <div className="space-y-3">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))} className={`w-full text-left p-4 rounded-lg border transition-all text-sm ${answers[q.id] === oi ? "border-primary bg-primary/10 font-bold" : "border-gold hover:border-primary hover:bg-primary/5"}`}>
                  <span className="font-mono text-xs text-primary mr-2">{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                  {q.optionImages?.[oi] && <img src={q.optionImages[oi]} alt="" className="mt-2 max-h-24 rounded" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 bg-background/95 backdrop-blur-xl border-t border-gold">
        <Button variant="outline" size="sm" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} className="border-gold"><ChevronLeft className="h-4 w-4 mr-1" /> Prev</Button>
        <div className="text-center">
          <span className="font-mono text-[10px] text-muted-foreground block">{Object.keys(answers).length}/{questions.length} answered</span>
          {markedForReview.size > 0 && <span className="font-mono text-[9px] text-warning">{markedForReview.size} marked</span>}
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))} disabled={current === questions.length - 1} className="border-gold">Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
      </div>
    </div>
  );
}
