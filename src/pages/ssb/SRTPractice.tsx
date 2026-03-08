import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Play, Shield, Clock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SSBSet { id: string; title: string; }
interface SSBItem { id: string; content_text: string | null; image_url: string | null; sort_order: number | null; }

type Phase = "list" | "rules" | "active" | "done";

export default function SRTPractice() {
  const [sets, setSets] = useState<SSBSet[]>([]);
  const [items, setItems] = useState<SSBItem[]>([]);
  const [phase, setPhase] = useState<Phase>("list");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timer, setTimer] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    supabase.from("ssb_sets").select("id, title").eq("type", "srt").eq("is_active", true)
      .then(({ data }) => setSets((data as SSBSet[]) || []));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startSet = async (set: SSBSet) => {
    const { data } = await supabase.from("ssb_set_items").select("*").eq("set_id", set.id).order("sort_order");
    setItems((data as SSBItem[]) || []);
    setCurrentIdx(0);
    setPhase("rules");
  };

  const beginSRT = () => {
    setPhase("active");
    setCurrentIdx(0);
    startSRTTimer(0);
  };

  const startSRTTimer = (idx: number) => {
    setTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          const next = idx + 1;
          if (next >= items.length) { setPhase("done"); return 0; }
          setCurrentIdx(next);
          startSRTTimer(next);
          return 30;
        }
        return t - 1;
      });
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Zap className="h-7 w-7 text-primary" />
          <div>
            <h1 className="font-display text-3xl text-gradient-gold">SRT PRACTICE</h1>
            <p className="text-muted-foreground text-xs">Situation Reaction Test — 60 situations, 30 seconds each</p>
          </div>
        </div>

        {phase === "list" && (
          <div className="space-y-3">
            {sets.length === 0 && <p className="text-muted-foreground text-sm text-center py-12">No SRT sets available. Admin needs to add sets.</p>}
            {sets.map((set, i) => (
              <motion.div key={set.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer" onClick={() => startSet(set)}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div><p className="font-bold">{set.title}</p><p className="text-xs text-muted-foreground">60 situations • 30s each</p></div>
                    <Play className="h-5 w-5 text-primary" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={phase === "rules"} onOpenChange={() => setPhase("list")}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-display text-xl text-gradient-gold">SRT RULES</DialogTitle></DialogHeader>
            <div className="space-y-2 text-sm">
              <p>1. You'll see <strong>60 situations</strong>, one at a time.</p>
              <p>2. Each situation is shown for <strong>30 seconds</strong>.</p>
              <p>3. Write what you would do in each situation on paper.</p>
              <p>4. Be practical, positive, and show leadership.</p>
            </div>
            <DialogFooter>
              <Button onClick={beginSRT} className="bg-gradient-gold text-primary-foreground font-bold w-full">I Agree — Start SRT</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {phase === "active" && items[currentIdx] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass-card border-gold">
              <CardContent className="p-6 min-h-[300px] flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-muted-foreground">SRT {currentIdx + 1}/{items.length}</span>
                  <div className="flex items-center gap-1 bg-destructive/10 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 text-destructive" />
                    <span className="font-mono text-lg font-bold text-destructive">{timer}s</span>
                  </div>
                </div>
                <Progress value={(timer / 30) * 100} className="h-1.5 mb-6" />
                {items[currentIdx].image_url && (
                  <img src={items[currentIdx].image_url} alt="SRT" className="max-h-32 mx-auto rounded-lg mb-4" />
                )}
                <AnimatePresence mode="wait">
                  <motion.p key={currentIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="text-base leading-relaxed text-center">
                    {items[currentIdx].content_text}
                  </motion.p>
                </AnimatePresence>
                <p className="text-muted-foreground text-xs mt-4 text-center">Write your response on paper</p>
                <Progress value={((currentIdx + 1) / items.length) * 100} className="h-1 mt-4" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card border-gold">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-success" />
                </div>
                <h2 className="font-display text-2xl text-gradient-gold">SRT COMPLETE!</h2>
                <p className="text-muted-foreground text-sm">All {items.length} situations done!</p>
                <Button onClick={() => { setPhase("list"); setItems([]); }} className="bg-gradient-gold text-primary-foreground font-bold">Practice Another Set</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
