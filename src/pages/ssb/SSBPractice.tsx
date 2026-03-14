import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Brain, Send, Clock, Play, RotateCcw, CheckCircle, XCircle, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const SSB_CONFIG: Record<string, { title: string; prompt: string; timeLimit?: number; instructions: string; type: "scenario" | "mcq" | "words" | "chat" }> = {
  oir: {
    title: "OIR PRACTICE",
    prompt: `Generate exactly 10 Officer Intelligence Rating (OIR) questions for SSB. Mix verbal and non-verbal reasoning. Return ONLY a JSON array (no markdown, no code blocks) where each item has: "question" (string), "options" (array of 4 strings), "correct" (number 0-3), "explanation" (string). NDA candidate level.`,
    instructions: "Solve verbal and non-verbal reasoning questions. These test your basic intelligence — speed and accuracy matter.",
    type: "mcq",
  },
  ppdt: {
    title: "PPDT PRACTICE",
    prompt: "Describe a picture scenario for PPDT (Picture Perception and Discussion Test) in SSB. Give a vivid scene description (3-4 lines) that the candidate should write a story about. Include: number of characters visible, mood/atmosphere, and action happening. Be specific about what the characters are doing.",
    instructions: "You'll get a scene description. Write a positive, action-oriented story in 4 minutes showing Officer Like Qualities (OLQs).",
    timeLimit: 240,
    type: "scenario",
  },
  tat: {
    title: "TAT PRACTICE",
    prompt: "For SSB TAT (Thematic Apperception Test), describe a vivid picture/scenario in 3-4 lines. Include characters, setting, and a hint of tension or opportunity. The candidate will write a story showing a hero with positive qualities.",
    instructions: "Look at the scenario and write a story in 4 minutes. Your hero should take positive action and show leadership.",
    timeLimit: 240,
    type: "scenario",
  },
  wat: {
    title: "WAT PRACTICE",
    prompt: `Generate exactly 15 words for SSB WAT (Word Association Test). Return ONLY a JSON array (no markdown, no code blocks) where each item has: "word" (string), "ideal_response" (string showing a positive, action-oriented sentence). Words should range from simple to complex.`,
    instructions: "One word at a time. Write the first positive sentence that comes to mind within 15 seconds per word.",
    timeLimit: 15,
    type: "words",
  },
  srt: {
    title: "SRT PRACTICE",
    prompt: `Generate exactly 8 SSB SRT (Situation Reaction Test) situations. Each should be a practical scenario an NDA officer might face. Return ONLY a JSON array (no markdown, no code blocks) where each item has: "situation" (string), "ideal_response" (string). Situations should test leadership, courage, and practical thinking.`,
    instructions: "Read each situation and write what you would do. Be practical, positive, and show leadership. 30 seconds per situation.",
    type: "scenario",
  },
  sdt: {
    title: "SDT PRACTICE",
    prompt: "Guide the candidate through SSB SDT (Self Description Test). Ask them to describe themselves from 4 perspectives in order. Start by asking: How do your PARENTS see you? After they respond to all 4, give detailed feedback.",
    instructions: "Describe yourself from 4 perspectives: parents, friends, teachers, and yourself. Be honest and positive.",
    type: "chat",
  },
  interview: {
    title: "MOCK SSB INTERVIEW",
    prompt: "You are an SSB interviewing officer. Begin with a warm greeting and ask the first question about the candidate's family background. Ask ONE question at a time. After each response, ask a follow-up or move to next topic (education, hobbies, achievements, why defence, current affairs, situational). Be thorough but supportive. After 8-10 exchanges, provide a detailed evaluation for OLQs.",
    instructions: "This is a mock SSB personal interview. Answer each question honestly and confidently. The AI will ask follow-up questions.",
    type: "chat",
  },
  gd: {
    title: "MOCK GROUP DISCUSSION",
    prompt: "Present a relevant topic for SSB Group Discussion. Then simulate 3 other candidates giving brief opinions (2-3 lines each, with different viewpoints). Ask the candidate to share their views. After the candidate responds, simulate more discussion and then evaluate their contribution.",
    instructions: "A topic will be given with simulated candidates' views. Present your views clearly and try to lead the discussion constructively.",
    type: "scenario",
  },
};

interface MCQQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  questionImage?: string | null;
  optionImages?: (string | null)[];
}

interface WATWord {
  word: string;
  ideal_response: string;
}

export default function SSBPractice() {
  const location = useLocation();
  const testType = location.pathname.split("/ssb/")[1] || "oir";
  const config = SSB_CONFIG[testType];
  const { user } = useAuth();
  const { language } = useLanguage();
  const meta = user?.user_metadata || {};

  // Common state
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Scenario state
  const [scenario, setScenario] = useState("");
  const [userResponse, setUserResponse] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // MCQ state (OIR)
  const [mcqs, setMcqs] = useState<MCQQuestion[]>([]);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqSelected, setMcqSelected] = useState<number | null>(null);
  const [mcqScore, setMcqScore] = useState({ correct: 0, wrong: 0, answered: 0 });
  const [mcqDone, setMcqDone] = useState(false);

  // WAT state
  const [watWords, setWatWords] = useState<WATWord[]>([]);
  const [watIndex, setWatIndex] = useState(0);
  const [watResponses, setWatResponses] = useState<string[]>([]);
  const [watCurrent, setWatCurrent] = useState("");
  const [watTimer, setWatTimer] = useState(15);
  const [watDone, setWatDone] = useState(false);
  const [watFeedback, setWatFeedback] = useState("");

  // Chat state (Interview/SDT)
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reset on type change
  useEffect(() => {
    resetAll();
  }, [testType]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const resetAll = () => {
    setStarted(false);
    setLoading(false);
    setScenario("");
    setUserResponse("");
    setFeedback("");
    setTimer(0);
    setMcqs([]);
    setMcqIndex(0);
    setMcqSelected(null);
    setMcqScore({ correct: 0, wrong: 0, answered: 0 });
    setMcqDone(false);
    setWatWords([]);
    setWatIndex(0);
    setWatResponses([]);
    setWatCurrent("");
    setWatTimer(15);
    setWatDone(false);
    setWatFeedback("");
    setChatMessages([]);
    setChatInput("");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const streamAI = async (prompt: string, onDelta: (text: string) => void) => {
    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        userContext: { name: meta.full_name, attempt: meta.attempt, medium: meta.medium, language },
      }),
    });
    if (!resp.ok || !resp.body) throw new Error("Failed");
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") continue;
        try {
          const p = JSON.parse(json);
          const c = p.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch {}
      }
    }
  };

  const fetchNonStreaming = async (prompt: string): Promise<string> => {
    let text = "";
    await streamAI(prompt, (delta) => { text += delta; });
    return text;
  };

  // ========== START HANDLERS ==========

  const startMCQ = async () => {
    setStarted(true);
    setLoading(true);
    try {
      // For OIR: try admin-added questions first
      if (testType === "oir") {
        const { data: adminQs } = await supabase
          .from("oir_questions")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");
        
        if (adminQs && adminQs.length > 0) {
          const shuffled = adminQs.sort(() => Math.random() - 0.5).slice(0, 10);
          const mapped: MCQQuestion[] = shuffled.map((q: any) => ({
            question: q.question,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correct: { a: 0, b: 1, c: 2, d: 3 }[q.correct_option as string] ?? 0,
            explanation: q.explanation || "",
            questionImage: q.question_image_url,
            optionImages: [q.option_a_image_url, q.option_b_image_url, q.option_c_image_url, q.option_d_image_url],
          }));
          setMcqs(mapped);
          setLoading(false);
          return;
        }
      }
      // Fallback to AI
      const raw = await fetchNonStreaming(config.prompt);
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as MCQQuestion[];
        setMcqs(parsed);
      }
    } catch (e) {
      console.error("MCQ parse error:", e);
    }
    setLoading(false);
  };

  const startWAT = async () => {
    setStarted(true);
    setLoading(true);
    try {
      const raw = await fetchNonStreaming(config.prompt);
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as WATWord[];
        setWatWords(parsed);
        startWATTimer();
      }
    } catch (e) {
      console.error("WAT parse error:", e);
    }
    setLoading(false);
  };

  const startWATTimer = () => {
    setWatTimer(15);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setWatTimer(t => {
        if (t <= 1) {
          // Auto-submit current word
          submitWATWord();
          return 15;
        }
        return t - 1;
      });
    }, 1000);
  };

  const submitWATWord = () => {
    setWatResponses(prev => [...prev, watCurrent]);
    setWatCurrent("");
    setWatIndex(prev => {
      const next = prev + 1;
      if (next >= watWords.length) {
        setWatDone(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
      return next;
    });
    setWatTimer(15);
  };

  const getWATFeedback = async () => {
    setLoading(true);
    const pairs = watWords.map((w, i) => `Word: ${w.word} → Response: "${watResponses[i] || "(no response)"}"`).join("\n");
    let text = "";
    await streamAI(
      `Evaluate these SSB WAT (Word Association Test) responses for Officer Like Qualities. For each, note if the response is positive, action-oriented, and shows officer-like thinking. Give an overall score out of 10.\n\n${pairs}`,
      (delta) => { text += delta; setWatFeedback(text); }
    );
    setLoading(false);
  };

  const startScenario = async () => {
    setStarted(true);
    setLoading(true);
    setScenario("");
    let text = "";
    await streamAI(config.prompt, (delta) => { text += delta; setScenario(text); });
    setLoading(false);
    if (config.timeLimit) {
      setTimer(config.timeLimit);
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    }
  };

  const startChat = async () => {
    setStarted(true);
    setLoading(true);
    let text = "";
    await streamAI(config.prompt, (delta) => {
      text += delta;
      setChatMessages([{ role: "assistant", content: text }]);
    });
    setLoading(false);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user" as const, content: chatInput };
    const newMsgs = [...chatMessages, userMsg];
    setChatMessages(newMsgs);
    setChatInput("");
    setLoading(true);

    const conversationPrompt = newMsgs.map(m => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`).join("\n\n");
    let text = "";
    await streamAI(
      `Continue this SSB ${testType === "interview" ? "interview" : "SDT"} conversation. You are the interviewing officer. Ask the next question or provide feedback if enough questions have been asked (8-10 exchanges). Here's the conversation so far:\n\n${conversationPrompt}\n\nInterviewer:`,
      (delta) => {
        text += delta;
        setChatMessages([...newMsgs, { role: "assistant", content: text }]);
      }
    );
    setLoading(false);
  };

  const submitScenarioResponse = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    setFeedback("");
    let text = "";
    await streamAI(
      `The student wrote the following response to the SSB ${testType.toUpperCase()} test:\n\nScenario: ${scenario}\n\nStudent's Response: ${userResponse}\n\nEvaluate this response for Officer Like Qualities (OLQs). Give specific feedback on:\n1. Strengths (what was good)\n2. Areas of improvement\n3. OLQ indicators found\n4. Overall score out of 10\n\nBe constructive and encouraging.`,
      (delta) => { text += delta; setFeedback(text); }
    );
    setLoading(false);
  };

  // ========== MCQ HANDLER ==========
  const selectMCQ = (optIndex: number) => {
    if (mcqSelected !== null) return;
    setMcqSelected(optIndex);
    const isCorrect = optIndex === mcqs[mcqIndex]?.correct;
    setMcqScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      answered: prev.answered + 1,
    }));
  };

  const nextMCQ = () => {
    setMcqSelected(null);
    if (mcqIndex + 1 >= mcqs.length) {
      setMcqDone(true);
    } else {
      setMcqIndex(prev => prev + 1);
    }
  };

  // ========== START ==========
  const handleStart = () => {
    if (config.type === "mcq") startMCQ();
    else if (config.type === "words") startWAT();
    else if (config.type === "chat") startChat();
    else startScenario();
  };

  if (!config) return null;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-4xl text-gradient-gold">{config.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{config.instructions}</p>
        </div>

        {/* START SCREEN */}
        {!started && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">AI will generate a practice {config.type === "mcq" ? "quiz" : config.type === "words" ? "word set" : config.type === "chat" ? "conversation" : "scenario"} for you.</p>
              <Button onClick={handleStart} className="bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                <Play className="h-4 w-4 mr-2" /> Start Practice
              </Button>
            </CardContent>
          </Card>
        )}

        {/* LOADING */}
        {loading && !scenario && !mcqs.length && !watWords.length && chatMessages.length === 0 && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <div className="flex gap-1 justify-center mb-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-xs text-muted-foreground">AI is preparing your practice...</p>
            </CardContent>
          </Card>
        )}

        {/* ========== MCQ MODE (OIR) ========== */}
        {config.type === "mcq" && started && mcqs.length > 0 && !mcqDone && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-mono">Q {mcqIndex + 1} / {mcqs.length}</Badge>
              <div className="flex gap-3 text-sm font-mono">
                <span className="text-success">✓ {mcqScore.correct}</span>
                <span className="text-destructive">✗ {mcqScore.wrong}</span>
              </div>
            </div>
            <Progress value={((mcqIndex + 1) / mcqs.length) * 100} className="h-1.5" />
            <AnimatePresence mode="wait">
              <motion.div key={mcqIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium mb-4">{mcqs[mcqIndex]?.question}</p>
                    <div className="grid gap-2">
                      {mcqs[mcqIndex]?.options.map((opt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className={`text-left justify-start h-auto py-3 px-4 border-border ${
                            mcqSelected !== null
                              ? i === mcqs[mcqIndex].correct ? "bg-success/20 border-success text-success" 
                                : i === mcqSelected ? "bg-destructive/20 border-destructive text-destructive" : "opacity-50"
                              : "hover:bg-primary/10"
                          }`}
                          onClick={() => selectMCQ(i)}
                          disabled={mcqSelected !== null}
                        >
                          <span className="font-mono text-xs mr-3">{String.fromCharCode(65 + i)}</span>
                          {opt}
                        </Button>
                      ))}
                    </div>
                    {mcqSelected !== null && mcqs[mcqIndex]?.explanation && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">{mcqs[mcqIndex].explanation}</p>
                      </motion.div>
                    )}
                    {mcqSelected !== null && (
                      <Button onClick={nextMCQ} className="mt-4 w-full">
                        {mcqIndex + 1 >= mcqs.length ? "See Results" : "Next Question"} <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* MCQ RESULTS */}
        {config.type === "mcq" && mcqDone && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="font-display text-3xl text-gradient-gold">OIR RESULTS</h2>
              <div className="flex justify-center gap-8">
                <div>
                  <p className="font-display text-4xl text-success">{mcqScore.correct}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div>
                  <p className="font-display text-4xl text-destructive">{mcqScore.wrong}</p>
                  <p className="text-xs text-muted-foreground">Wrong</p>
                </div>
                <div>
                  <p className="font-display text-4xl">{Math.round((mcqScore.correct / mcqs.length) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
              </div>
              <Progress value={(mcqScore.correct / mcqs.length) * 100} className="h-2" />
              <Button onClick={resetAll} className="bg-gradient-gold text-primary-foreground font-bold">
                <RotateCcw className="h-4 w-4 mr-2" /> Practice Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ========== WAT MODE ========== */}
        {config.type === "words" && started && watWords.length > 0 && !watDone && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-mono">Word {watIndex + 1} / {watWords.length}</Badge>
              <div className="flex items-center gap-2 text-sm font-mono text-primary">
                <Clock className="h-4 w-4" /> {watTimer}s
              </div>
            </div>
            <Progress value={(watTimer / 15) * 100} className={`h-1.5 ${watTimer <= 5 ? "[&>div]:bg-destructive" : ""}`} />
            <AnimatePresence mode="wait">
              <motion.div key={watIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-8 text-center">
                    <p className="text-xs text-muted-foreground mb-2">Write a sentence using this word:</p>
                    <h2 className="font-display text-5xl text-gradient-gold mb-6">{watWords[watIndex]?.word}</h2>
                    <div className="flex gap-2">
                      <Textarea
                        value={watCurrent}
                        onChange={(e) => setWatCurrent(e.target.value)}
                        placeholder="Write your sentence..."
                        className="min-h-[60px] bg-card border-border"
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitWATWord(); } }}
                      />
                    </div>
                    <Button onClick={submitWATWord} className="mt-3 w-full">
                      Next Word <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* WAT RESULTS */}
        {config.type === "words" && watDone && (
          <div className="space-y-4">
            <Card className="glass-card border-gold">
              <CardContent className="p-6 space-y-3">
                <h2 className="font-display text-xl text-gradient-gold">YOUR RESPONSES</h2>
                {watWords.map((w, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">{w.word}</Badge>
                    <div className="flex-1">
                      <p className="text-sm">{watResponses[i] || <span className="text-muted-foreground italic">No response</span>}</p>
                      <p className="text-[10px] text-success mt-0.5">Ideal: {w.ideal_response}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {!watFeedback && (
              <Button onClick={getWATFeedback} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-bold">
                <Sparkles className="h-4 w-4 mr-2" /> Get AI Evaluation
              </Button>
            )}
            {watFeedback && (
              <Card className="glass-card border-accent/30">
                <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{watFeedback}</ReactMarkdown>
                </CardContent>
              </Card>
            )}
            <Button onClick={resetAll} variant="outline" className="w-full border-primary/30">
              <RotateCcw className="h-4 w-4 mr-2" /> Practice Again
            </Button>
          </div>
        )}

        {/* ========== CHAT MODE (Interview/SDT) ========== */}
        {config.type === "chat" && started && chatMessages.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {chatMessages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`${msg.role === "assistant" ? "glass-card border-gold" : "bg-primary/10 border-primary/30"} border`}>
                    <CardContent className="p-4">
                      <p className="text-[10px] font-mono text-muted-foreground mb-1">
                        {msg.role === "assistant" ? "🎖️ INTERVIEWER" : "👤 YOU"}
                      </p>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your response..."
                className="min-h-[60px] bg-card border-border flex-1"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              />
              <Button onClick={sendChat} disabled={loading || !chatInput.trim()} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={resetAll} variant="outline" className="w-full border-primary/30">
              <RotateCcw className="h-4 w-4 mr-2" /> Start Over
            </Button>
          </div>
        )}

        {/* ========== SCENARIO MODE (PPDT/TAT/SRT/GD) ========== */}
        {config.type === "scenario" && started && scenario && (
          <>
            <Card className="glass-card border-gold">
              <CardContent className="p-6">
                {timer > 0 && (
                  <div className={`flex items-center gap-2 mb-3 text-sm font-mono ${timer <= 30 ? "text-destructive" : "text-primary"}`}>
                    <Clock className="h-4 w-4" /> {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  <ReactMarkdown>{scenario}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {!feedback && (
              <div className="space-y-3">
                <Textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Write your response here..."
                  className="min-h-[150px] bg-card border-border"
                />
                <Button onClick={submitScenarioResponse} disabled={!userResponse.trim() || loading} className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                  <Send className="h-4 w-4 mr-2" /> Submit for AI Evaluation
                </Button>
              </div>
            )}

            {feedback && (
              <>
                <Card className="glass-card border-accent/30">
                  <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
                    <h3 className="font-display text-lg text-gradient-gold mb-3">AI FEEDBACK</h3>
                    <ReactMarkdown>{feedback}</ReactMarkdown>
                  </CardContent>
                </Card>
                <Button onClick={resetAll} className="w-full bg-gradient-gold text-primary-foreground font-bold">
                  <RotateCcw className="h-4 w-4 mr-2" /> Practice Again
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
