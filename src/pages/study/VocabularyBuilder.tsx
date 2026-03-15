import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Word { word: string; meaning: string; usage: string; synonym: string; antonym: string; difficulty: "easy" | "medium" | "hard"; }

const STATIC_WORDS: Word[] = [
  { word: "Abate", meaning: "To become less intense or widespread", usage: "The storm began to abate after midnight.", synonym: "Diminish", antonym: "Intensify", difficulty: "medium" },
  { word: "Benevolent", meaning: "Well-meaning and kindly", usage: "The benevolent ruler was loved by all.", synonym: "Kind", antonym: "Malevolent", difficulty: "easy" },
  { word: "Cacophony", meaning: "A harsh, discordant mixture of sounds", usage: "The cacophony of the traffic was unbearable.", synonym: "Discord", antonym: "Harmony", difficulty: "medium" },
  { word: "Ephemeral", meaning: "Lasting for a very short time", usage: "Fame in social media is often ephemeral.", synonym: "Fleeting", antonym: "Permanent", difficulty: "medium" },
  { word: "Gregarious", meaning: "Fond of company; sociable", usage: "She was gregarious and made friends easily.", synonym: "Sociable", antonym: "Introverted", difficulty: "medium" },
];

export default function VocabularyBuilder() {
  const { toast } = useToast();
  const [words, setWords] = useState<Word[]>(STATIC_WORDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [learned, setLearned] = useState<Set<number>>(new Set());
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiWords, setAiWords] = useState<Word[]>([]);

  useEffect(() => {
    // Load admin-added vocab words
    supabase.from("vocabulary_words").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped: Word[] = (data as any[]).map(w => ({
            word: w.word, meaning: w.meaning, usage: w.usage_example || "", synonym: w.synonym || "", antonym: w.antonym || "", difficulty: w.difficulty || "medium",
          }));
          setWords(mapped);
        }
      });
  }, []);

  const currentWord = words[currentIndex];
  const progress = (learned.size / words.length) * 100;

  const generateAIWords = async () => {
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", { body: { messages: [{ role: "user", content: "Generate 5 advanced English vocabulary words for NDA exam. For each: word, meaning, usage (example sentence), synonym, antonym, difficulty (easy/medium/hard). Return ONLY JSON array." }] } });
      if (error) throw error;
      const text = data?.response || data?.message || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) { setAiWords(JSON.parse(jsonMatch[0])); toast({ title: "AI Words Generated!" }); }
    } catch { toast({ title: "Error generating AI words", variant: "destructive" }); }
    setLoadingAI(false);
  };

  const markLearned = () => { setLearned(prev => new Set(prev).add(currentIndex)); nextWord(); };
  const nextWord = () => { setShowMeaning(false); setQuizAnswer(null); setCurrentIndex(prev => (prev + 1) % words.length); };
  const prevWord = () => { setShowMeaning(false); setQuizAnswer(null); setCurrentIndex(prev => (prev - 1 + words.length) % words.length); };
  const checkQuizAnswer = (answer: string) => { setQuizAnswer(answer); if (answer === currentWord.meaning) setScore(p => ({ ...p, correct: p.correct + 1 })); else setScore(p => ({ ...p, wrong: p.wrong + 1 })); };
  const getQuizOptions = () => { if (!currentWord) return []; const correct = currentWord.meaning; const others = words.filter((_, i) => i !== currentIndex).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.meaning); return [correct, ...others].sort(() => Math.random() - 0.5); };
  const diffColor = (d: string) => d === "easy" ? "bg-success/20 text-success" : d === "medium" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><BookOpen className="h-8 w-8 text-primary" /><h1 className="font-display text-4xl text-gradient-gold">VOCABULARY BUILDER</h1></div>
          <PremiumButton onClick={generateAIWords} disabled={loadingAI} variant="outline" feature="AI Vocabulary" className="border-primary/30"><Sparkles className="h-4 w-4 mr-2" />{loadingAI ? "Generating..." : "AI Words"}</PremiumButton>
        </div>
        <Card className="glass-card border-gold"><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><span className="font-mono text-xs text-muted-foreground">WORDS LEARNED</span><span className="font-display text-lg">{learned.size}/{words.length}</span></div><Progress value={progress} className="h-2" /></CardContent></Card>
        <Tabs defaultValue="flashcard">
          <TabsList className="bg-card border border-border"><TabsTrigger value="flashcard">Flashcards</TabsTrigger><TabsTrigger value="quiz">Quiz Mode</TabsTrigger><TabsTrigger value="list">Word List</TabsTrigger></TabsList>
          <TabsContent value="flashcard" className="mt-4">
            <AnimatePresence mode="wait">
              <motion.div key={currentIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                <Card className="glass-card border-gold cursor-pointer min-h-[280px]" onClick={() => setShowMeaning(!showMeaning)}>
                  <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[280px]">
                    <Badge className={`mb-4 ${diffColor(currentWord?.difficulty || "medium")}`}>{currentWord?.difficulty}</Badge>
                    <h2 className="font-display text-5xl text-gradient-gold mb-4">{currentWord?.word}</h2>
                    {showMeaning ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 w-full max-w-md">
                        <p className="text-foreground text-lg">{currentWord?.meaning}</p>
                        <p className="text-muted-foreground text-sm italic">"{currentWord?.usage}"</p>
                        <div className="flex gap-4 justify-center text-xs"><span className="text-success">Synonym: {currentWord?.synonym}</span><span className="text-destructive">Antonym: {currentWord?.antonym}</span></div>
                      </motion.div>
                    ) : <p className="text-muted-foreground text-sm">Tap to reveal meaning</p>}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" onClick={prevWord} className="border-primary/30">← Previous</Button>
              <div className="flex gap-2"><Button variant="outline" onClick={nextWord} className="border-primary/30">Skip <ArrowRight className="h-4 w-4 ml-1" /></Button><Button onClick={markLearned} className="bg-success/20 text-success hover:bg-success/30"><CheckCircle className="h-4 w-4 mr-1" /> Learned</Button></div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">{currentIndex + 1} / {words.length}</p>
          </TabsContent>
          <TabsContent value="quiz" className="mt-4 space-y-4">
            <Card className="glass-card border-gold"><CardContent className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-2">What does this word mean?</p>
              <h2 className="font-display text-4xl text-gradient-gold mb-6">{currentWord?.word}</h2>
              <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
                {getQuizOptions().map((opt, i) => (
                  <Button key={i} variant="outline" className={`text-left justify-start h-auto py-3 px-4 border-primary/20 ${quizAnswer ? opt === currentWord?.meaning ? "bg-success/20 border-success" : opt === quizAnswer ? "bg-destructive/20 border-destructive" : "" : "hover:bg-primary/10"}`} onClick={() => !quizAnswer && checkQuizAnswer(opt)} disabled={!!quizAnswer}>{opt}</Button>
                ))}
              </div>
              {quizAnswer && <Button onClick={nextWord} className="mt-4">Next Word <ArrowRight className="h-4 w-4 ml-1" /></Button>}
            </CardContent></Card>
            <div className="flex justify-center gap-6"><span className="text-success font-mono text-sm">✓ {score.correct}</span><span className="text-destructive font-mono text-sm">✗ {score.wrong}</span></div>
          </TabsContent>
          <TabsContent value="list" className="mt-4 space-y-2">
            {words.map((w, i) => (
              <Card key={i} className={`glass-card border-gold ${learned.has(i) ? "opacity-60" : ""}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div><div className="flex items-center gap-2"><span className="font-display text-lg">{w.word}</span><Badge className={`text-[9px] ${diffColor(w.difficulty)}`}>{w.difficulty}</Badge>{learned.has(i) && <CheckCircle className="h-4 w-4 text-success" />}</div><p className="text-sm text-muted-foreground">{w.meaning}</p></div>
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(i); setShowMeaning(true); }}>View</Button>
                </CardContent>
              </Card>
            ))}
            {aiWords.length > 0 && (<><h3 className="font-display text-lg text-gradient-gold mt-4">AI-GENERATED WORDS</h3>{aiWords.map((w, i) => (<Card key={`ai-${i}`} className="glass-card border-accent/30"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Sparkles className="h-3 w-3 text-accent" /><span className="font-display text-lg">{w.word}</span></div><p className="text-sm text-muted-foreground">{w.meaning}</p><p className="text-xs text-muted-foreground italic mt-1">"{w.usage}"</p></CardContent></Card>))}</>)}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
