import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronRight, Trophy } from "lucide-react";

const DIAGNOSTIC_QUESTIONS = [
  { id: 1, subject: "maths", question: "If x² - 5x + 6 = 0, what are the values of x?", options: ["2 and 3", "1 and 6", "-2 and -3", "3 and -2"], correct: 0 },
  { id: 2, subject: "maths", question: "The derivative of sin(x) is:", options: ["cos(x)", "-cos(x)", "tan(x)", "-sin(x)"], correct: 0 },
  { id: 3, subject: "maths", question: "What is the value of log₁₀(1000)?", options: ["2", "3", "4", "10"], correct: 1 },
  { id: 4, subject: "maths", question: "If a triangle has sides 3, 4, 5, it is:", options: ["Equilateral", "Isosceles", "Right-angled", "Obtuse"], correct: 2 },
  { id: 5, subject: "maths", question: "The sum of first 10 natural numbers is:", options: ["45", "55", "50", "60"], correct: 1 },
  { id: 6, subject: "english", question: "Choose the correct synonym of 'Benevolent':", options: ["Cruel", "Kind", "Angry", "Lazy"], correct: 1 },
  { id: 7, subject: "english", question: "Identify the correct sentence:", options: ["He don't know.", "He doesn't knows.", "He doesn't know.", "He not know."], correct: 2 },
  { id: 8, subject: "english", question: "The antonym of 'Meticulous' is:", options: ["Careful", "Careless", "Precise", "Accurate"], correct: 1 },
  { id: 9, subject: "gk", question: "Who is the Supreme Commander of Indian Armed Forces?", options: ["Prime Minister", "President", "Defence Minister", "Army Chief"], correct: 1 },
  { id: 10, subject: "gk", question: "NDA is located in:", options: ["Dehradun", "Pune (Khadakwasla)", "Chennai", "Delhi"], correct: 1 },
  { id: 11, subject: "gk", question: "Which article of the Indian Constitution abolishes untouchability?", options: ["Article 14", "Article 15", "Article 17", "Article 21"], correct: 2 },
  { id: 12, subject: "science", question: "The SI unit of force is:", options: ["Joule", "Watt", "Newton", "Pascal"], correct: 2 },
  { id: 13, subject: "science", question: "Photosynthesis occurs in:", options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"], correct: 1 },
  { id: 14, subject: "science", question: "The chemical formula of water is:", options: ["H₂O₂", "H₂O", "HO", "H₃O"], correct: 1 },
  { id: 15, subject: "gk", question: "The largest ocean on Earth is:", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correct: 2 },
];

export default function DiagnosticTest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(15).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [dnaScore, setDnaScore] = useState(0);
  const [saving, setSaving] = useState(false);

  const q = DIAGNOSTIC_QUESTIONS[current];
  const progress = ((current + 1) / DIAGNOSTIC_QUESTIONS.length) * 100;

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setSelected(null);

    if (current < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrent(current + 1);
    } else {
      finishTest(newAnswers);
    }
  };

  const finishTest = async (finalAnswers: (number | null)[]) => {
    setSaving(true);
    let correct = 0;
    const questionsData = DIAGNOSTIC_QUESTIONS.map((q, i) => ({
      ...q,
      userAnswer: finalAnswers[i],
      isCorrect: finalAnswers[i] === q.correct,
    }));
    questionsData.forEach((q) => { if (q.isCorrect) correct++; });

    const scorePercent = Math.round((correct / DIAGNOSTIC_QUESTIONS.length) * 100);
    // Map to DNA score: min 15, max 85 from diagnostic
    const mappedDna = Math.round(15 + (scorePercent / 100) * 70);
    setDnaScore(mappedDna);

    if (user) {
      await Promise.all([
        supabase.from("test_results").insert({
          user_id: user.id,
          test_type: "diagnostic",
          subject: "mixed",
          total_questions: 15,
          correct_answers: correct,
          wrong_answers: 15 - correct,
          score: scorePercent,
          questions_data: questionsData as any,
        }),
        supabase.from("profiles").update({
          dna_score: mappedDna,
          accuracy: scorePercent,
          total_questions_solved: 15,
        }).eq("user_id", user.id),
      ]);
    }

    setSaving(false);
    setFinished(true);
  };

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-display text-4xl text-gradient-gold mb-2">Diagnostic Complete!</h1>
          <p className="text-muted-foreground mb-6">Your initial DNA Score has been calculated</p>
          <div className="glass-card rounded-xl p-8 mb-8">
            <p className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase mb-2">Initial DNA Score</p>
            <motion.p
              className="font-display text-7xl text-gradient-gold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
            >
              {dnaScore}%
            </motion.p>
            <p className="text-xs text-muted-foreground mt-3">This will update as you study and take tests</p>
          </div>
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="bg-gradient-gold text-primary-foreground font-bold tracking-widest px-8 py-6"
          >
            Go to Dashboard <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl text-gradient-gold">DNA Diagnostic Test</h1>
          </div>
          <p className="text-sm text-muted-foreground">15 quick questions to assess your starting level</p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>Question {current + 1} of {DIAGNOSTIC_QUESTIONS.length}</span>
            <span className="uppercase">{q.subject}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="glass-card border-gold">
              <CardContent className="p-6 space-y-5">
                <p className="text-lg font-semibold">{q.question}</p>
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(i)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selected === i
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <span className="font-mono text-xs text-muted-foreground mr-3">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <Button
          onClick={handleNext}
          disabled={selected === null || saving}
          className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-widest py-5"
        >
          {saving ? "Saving..." : current < DIAGNOSTIC_QUESTIONS.length - 1 ? "Next Question" : "Finish Test"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
