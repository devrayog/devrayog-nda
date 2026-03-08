import { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Clock, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const SSB_CONFIG: Record<string, { title: string; prompt: string; timeLimit?: number; instructions: string }> = {
  oir: {
    title: "OIR PRACTICE",
    prompt: "Generate 5 Officer Intelligence Rating (OIR) questions for SSB. Mix verbal and non-verbal reasoning. Return each as JSON array with: question, options (4), correct (0-3), explanation. NDA candidate level.",
    instructions: "Solve verbal and non-verbal reasoning questions as fast as possible. These test your basic intelligence.",
  },
  ppdt: {
    title: "PPDT PRACTICE",
    prompt: "Describe a picture scenario for PPDT (Picture Perception and Discussion Test) in SSB. Give a scene description (2-3 lines) that the candidate should write a story about. Include: number of characters, mood, and action happening. Then after the candidate writes, evaluate their story for OLQs.",
    instructions: "You'll get a scene description. Write a positive, action-oriented story in 4 minutes showing Officer Like Qualities (OLQs).",
    timeLimit: 240,
  },
  tat: {
    title: "TAT PRACTICE",
    prompt: "For SSB TAT (Thematic Apperception Test), describe a picture/scenario in 2-3 lines. The candidate will write a story. Evaluate for: hero's positive actions, officer-like qualities, practical approach, and positive ending.",
    instructions: "Look at the scenario and write a story in 4 minutes. Show a hero with positive qualities taking action.",
    timeLimit: 240,
  },
  wat: {
    title: "WAT PRACTICE",
    prompt: "Generate 15 words for SSB WAT (Word Association Test). For each word, give the word and after the candidate responds, evaluate their response for positive, action-oriented, officer-like thinking. Return as JSON array with: word, ideal_response.",
    instructions: "You'll see one word at a time. Write the first positive sentence that comes to mind within 15 seconds.",
    timeLimit: 15,
  },
  srt: {
    title: "SRT PRACTICE",
    prompt: "Generate 5 SSB SRT (Situation Reaction Test) situations. Each should be a practical scenario an NDA officer might face. Return as JSON array with: situation, ideal_response. Evaluate the candidate's response for practicality, leadership, and officer-like qualities.",
    instructions: "Read each situation and write what you would do. Be practical, positive, and show leadership.",
  },
  sdt: {
    title: "SDT PRACTICE",
    prompt: "Guide the candidate through SSB SDT (Self Description Test). Ask them to write how they think: (1) Their parents see them, (2) Their friends see them, (3) Their teachers see them, (4) They see themselves. Evaluate for consistency and officer-like qualities.",
    instructions: "Describe yourself from 4 perspectives: parents, friends, teachers, and yourself. Be honest and positive.",
  },
  interview: {
    title: "MOCK SSB INTERVIEW",
    prompt: "You are an SSB interviewing officer conducting a personal interview. Ask questions one by one about: family background, education, hobbies, achievements, why defence, awareness of current affairs, and situational questions. Be thorough but supportive. Evaluate responses for OLQs.",
    instructions: "This is a mock SSB personal interview. Answer each question honestly and confidently. The AI will ask follow-up questions.",
  },
  gd: {
    title: "MOCK GROUP DISCUSSION",
    prompt: "Simulate an SSB Group Discussion. Present a topic for GD, then simulate 4 other candidates giving brief opinions. The candidate should participate. Evaluate their contribution for: quality of argument, body language cues, listening, and leadership.",
    instructions: "A topic will be given. Present your views clearly and try to lead the discussion constructively.",
  },
};

export default function SSBPractice() {
  const { type } = useParams<{ type: string }>();
  const config = SSB_CONFIG[type || "oir"];
  const { user } = useAuth();
  const { language } = useLanguage();
  const meta = user?.user_metadata || {};

  const [started, setStarted] = useState(false);
  const [scenario, setScenario] = useState("");
  const [userResponse, setUserResponse] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(config?.timeLimit || 0);

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
        try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) onDelta(c); } catch {}
      }
    }
  };

  const startPractice = async () => {
    setStarted(true);
    setLoading(true);
    setScenario("");
    let text = "";
    await streamAI(config.prompt, (delta) => { text += delta; setScenario(text); });
    setLoading(false);
    if (config.timeLimit) {
      setTimer(config.timeLimit);
      const interval = setInterval(() => {
        setTimer(t => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
      }, 1000);
    }
  };

  const submitResponse = async () => {
    setLoading(true);
    setFeedback("");
    let text = "";
    await streamAI(
      `The student wrote the following response to the SSB ${type?.toUpperCase()} test:\n\nScenario: ${scenario}\n\nStudent's Response: ${userResponse}\n\nEvaluate this response for Officer Like Qualities (OLQs). Give specific feedback on: strengths, areas of improvement, and an overall score out of 10. Be constructive.`,
      (delta) => { text += delta; setFeedback(text); }
    );
    setLoading(false);
  };

  if (!config) return null;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-4xl text-gradient-gold">{config.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{config.instructions}</p>
        </div>

        {!started && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">AI will generate a practice scenario for you. Ready?</p>
              <Button onClick={startPractice} className="bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                <Play className="h-4 w-4 mr-2" /> Start Practice
              </Button>
            </CardContent>
          </Card>
        )}

        {started && scenario && (
          <>
            <Card className="glass-card border-gold">
              <CardContent className="p-6">
                {timer > 0 && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-primary font-mono">
                    <Clock className="h-4 w-4" /> {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{scenario}</div>
              </CardContent>
            </Card>

            {!feedback && (
              <div className="space-y-3">
                <Textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Write your response here..."
                  className="min-h-[150px] bg-card border-gold"
                />
                <Button onClick={submitResponse} disabled={!userResponse.trim() || loading} className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                  <Send className="h-4 w-4 mr-2" /> Submit for AI Evaluation
                </Button>
              </div>
            )}

            {feedback && (
              <Card className="glass-card border-gold">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg text-gradient-gold mb-3">AI FEEDBACK</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{feedback}</div>
                </CardContent>
              </Card>
            )}

            {feedback && (
              <Button onClick={() => { setStarted(false); setScenario(""); setUserResponse(""); setFeedback(""); }} className="w-full bg-gradient-gold text-primary-foreground font-bold">
                Practice Again
              </Button>
            )}
          </>
        )}

        {loading && !scenario && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <div className="flex gap-1 justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
