import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Play, Shield, Clock, Upload, Brain, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface SSBSet { id: string; title: string; type: string; }
interface SSBItem { id: string; image_url: string | null; content_text: string | null; sort_order: number | null; }

type Phase = "list" | "rules" | "photo" | "writing" | "upload" | "analyzing" | "result";

export default function PPDTPractice() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sets, setSets] = useState<SSBSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<SSBSet | null>(null);
  const [items, setItems] = useState<SSBItem[]>([]);
  const [phase, setPhase] = useState<Phase>("list");
  const [timer, setTimer] = useState(0);
  const [analysis, setAnalysis] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("ssb_sets").select("id, title, type").eq("type", "ppdt").eq("is_active", true)
      .then(({ data }) => setSets((data as SSBSet[]) || []));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startSet = async (set: SSBSet) => {
    setSelectedSet(set);
    const { data } = await supabase.from("ssb_set_items").select("*").eq("set_id", set.id).order("sort_order");
    setItems((data as SSBItem[]) || []);
    setPhase("rules");
  };

  const startTimer = (seconds: number, onEnd: () => void) => {
    setTimer(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current!); onEnd(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const beginPPDT = () => {
    setPhase("photo");
    startTimer(30, () => {
      setPhase("writing");
      startTimer(240, () => setPhase("upload"));
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const submitForAnalysis = async () => {
    if (!uploadedFile || !items[0]) return;
    setPhase("analyzing");
    try {
      // Upload story photo
      const ext = uploadedFile.name.split(".").pop();
      const path = `ppdt/${user?.id}/${Date.now()}.${ext}`;
      await supabase.storage.from("ai-uploads").upload(path, uploadedFile);
      const { data: urlData } = supabase.storage.from("ai-uploads").getPublicUrl(path);

      // AI analysis
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: `You are an SSB PPDT evaluator. The candidate saw a PPDT photo and wrote a story in 4 minutes. The PPDT photo is at: ${items[0].image_url || "no photo available"}. The candidate's handwritten story photo is at: ${urlData.publicUrl}. Analyze the story for:\n1. Whether it's original or pre-written\n2. Story quality & coherence (out of 10)\n3. OLQ indicators (Officer Like Qualities)\n4. Positivity and action-orientation\n5. Character development\n6. Overall rating out of 10\n\nBe constructive and specific.` }],
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("AI error");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "", content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") continue;
          try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content; if (c) { content += c; setAnalysis(content); } } catch {}
        }
      }
      setPhase("result");
    } catch {
      toast({ title: "Analysis failed", variant: "destructive" });
      setPhase("upload");
    }
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <div>
            <h1 className="font-display text-3xl text-gradient-gold">PPDT PRACTICE</h1>
            <p className="text-muted-foreground text-xs">Picture Perception & Discussion Test</p>
          </div>
        </div>

        {/* SET LIST */}
        {phase === "list" && (
          <div className="space-y-3">
            {sets.length === 0 && <p className="text-muted-foreground text-sm text-center py-12">No PPDT sets available yet. Admin needs to add sets.</p>}
            {sets.map((set, i) => (
              <motion.div key={set.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer" onClick={() => startSet(set)}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{set.title}</p>
                      <p className="text-xs text-muted-foreground">Tap to start PPDT practice</p>
                    </div>
                    <Play className="h-5 w-5 text-primary" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* RULES DIALOG */}
        <Dialog open={phase === "rules"} onOpenChange={() => setPhase("list")}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-gradient-gold">PPDT RULES</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p>1. A hazy photo will be shown for <strong>30 seconds</strong>.</p>
              <p>2. Observe carefully — note characters, mood, action.</p>
              <p>3. After 30 seconds, you get <strong>4 minutes</strong> to write a story.</p>
              <p>4. Write on paper. After 4 minutes, upload a photo of your story.</p>
              <p>5. AI will analyze your story for OLQs and originality.</p>
            </div>
            <DialogFooter>
              <Button onClick={beginPPDT} className="bg-gradient-gold text-primary-foreground font-bold w-full">
                I Agree — Start PPDT
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PHOTO PHASE - 30 seconds */}
        {phase === "photo" && items[0] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass-card border-gold overflow-hidden">
              <CardContent className="p-0 relative">
                <div className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2">
                  <Clock className="h-4 w-4 text-destructive" />
                  <span className="font-mono text-lg font-bold text-destructive">{fmtTime(timer)}</span>
                </div>
                {items[0].image_url ? (
                  <img src={items[0].image_url} alt="PPDT" className="w-full h-[400px] object-contain bg-muted" />
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">{items[0].content_text || "No photo available"}</p>
                  </div>
                )}
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground font-mono">OBSERVE THE PHOTO CAREFULLY — {timer}s remaining</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* WRITING PHASE - 4 minutes */}
        {phase === "writing" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass-card border-gold overflow-hidden">
              <CardContent className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center relative">
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-mono text-lg font-bold text-primary">{fmtTime(timer)}</span>
                </div>
                {/* Animated 3D sphere */}
                <div className="relative w-32 h-32 mb-6">
                  <motion.div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl"
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }} transition={{ duration: 6, repeat: Infinity }} />
                  <motion.div className="absolute inset-4 rounded-full border-2 border-primary/30"
                    animate={{ rotateX: [0, 360], rotateY: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ transformStyle: "preserve-3d" }} />
                  <motion.div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                    animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Shield className="h-8 w-8 text-primary-foreground" />
                  </motion.div>
                </div>
                <h2 className="font-display text-2xl text-gradient-gold mb-2">WRITE YOUR STORY</h2>
                <p className="text-muted-foreground text-sm max-w-sm">Write a positive, action-oriented story on paper. Show leadership & OLQs. You have {fmtTime(timer)} remaining.</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* UPLOAD PHASE */}
        {phase === "upload" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-gold">
              <CardContent className="p-8 text-center space-y-4">
                <Upload className="h-12 w-12 text-primary mx-auto" />
                <h2 className="font-display text-2xl text-gradient-gold">UPLOAD YOUR STORY</h2>
                <p className="text-muted-foreground text-sm">Take a clear photo of your handwritten story and upload it for AI analysis.</p>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                {previewUrl && <img src={previewUrl} alt="Story" className="max-h-48 mx-auto rounded-lg border border-border" />}
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => fileRef.current?.click()} className="border-gold">
                    <Upload className="h-4 w-4 mr-2" /> {uploadedFile ? "Change Photo" : "Select Photo"}
                  </Button>
                  {uploadedFile && (
                    <Button onClick={submitForAnalysis} className="bg-gradient-gold text-primary-foreground font-bold">
                      <Brain className="h-4 w-4 mr-2" /> Analyze Story
                    </Button>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setPhase("list"); setUploadedFile(null); setPreviewUrl(""); }}>
                  Skip Analysis
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ANALYZING */}
        {phase === "analyzing" && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <div className="flex gap-2 justify-center mb-4">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-3 h-3 rounded-full bg-primary"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
              <Sparkles className="h-6 w-6 text-primary mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">AI is analyzing your PPDT story...</p>
              {analysis && (
                <div className="mt-4 text-left prose prose-sm max-w-none text-foreground prose-headings:text-primary">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* RESULT */}
        {phase === "result" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-gold overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <h2 className="font-display text-xl text-gradient-gold">PPDT ANALYSIS</h2>
                </div>
                <div className="prose prose-sm max-w-none text-foreground prose-headings:text-primary prose-strong:text-primary">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
                <Button onClick={() => { setPhase("list"); setAnalysis(""); setUploadedFile(null); setPreviewUrl(""); }}
                  className="mt-6 bg-gradient-gold text-primary-foreground font-bold w-full">
                  Practice Another Set
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
