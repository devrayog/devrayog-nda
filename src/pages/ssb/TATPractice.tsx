import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Play, Shield, Clock, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface SSBSet { id: string; title: string; }
interface SSBItem { id: string; image_url: string | null; content_text: string | null; sort_order: number | null; }

type Phase = "list" | "rules" | "photo" | "writing" | "done";

export default function TATPractice() {
  const [sets, setSets] = useState<SSBSet[]>([]);
  const [items, setItems] = useState<SSBItem[]>([]);
  const [phase, setPhase] = useState<Phase>("list");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>("list");
  const idxRef = useRef(0);
  const itemsRef = useRef<SSBItem[]>([]);

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  useEffect(() => {
    supabase.from("ssb_sets").select("id, title").eq("type", "tat").eq("is_active", true)
      .then(({ data }) => setSets((data as SSBSet[]) || []));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startWritingPhase = useCallback((idx: number) => {
    clearTimer();
    setPhase("writing");
    setTimer(240);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearTimer();
          // Move to next photo
          const nextIdx = idx + 1;
          if (nextIdx >= itemsRef.current.length) {
            setPhase("done");
          } else {
            startPhotoPhase(nextIdx);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const startPhotoPhase = useCallback((idx: number) => {
    clearTimer();
    setCurrentIdx(idx);
    setPhase("photo");
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearTimer();
          // Transition to writing phase
          setTimeout(() => startWritingPhase(idx), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, startWritingPhase]);

  const startSet = async (set: SSBSet) => {
    const { data } = await supabase.from("ssb_set_items").select("*").eq("set_id", set.id).order("sort_order");
    const sorted = (data as SSBItem[]) || [];
    setItems(sorted);
    itemsRef.current = sorted;
    setCurrentIdx(0);
    setPhase("rules");
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <div>
            <h1 className="font-display text-3xl text-gradient-gold">TAT PRACTICE</h1>
            <p className="text-muted-foreground text-xs">Thematic Apperception Test — 12 photos, 30s view + 4min writing each</p>
          </div>
        </div>

        {phase === "list" && (
          <div className="space-y-3">
            {sets.length === 0 && <p className="text-muted-foreground text-sm text-center py-12">No TAT sets available. Admin needs to add sets with 12 photos each.</p>}
            {sets.map((set, i) => (
              <motion.div key={set.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer" onClick={() => startSet(set)}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{set.title}</p>
                      <p className="text-xs text-muted-foreground">12 photos • 30s + 4min each</p>
                    </div>
                    <Play className="h-5 w-5 text-primary" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={phase === "rules"} onOpenChange={() => setPhase("list")}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-display text-xl text-gradient-gold">TAT RULES</DialogTitle></DialogHeader>
            <div className="space-y-2 text-sm">
              <p>1. You'll see <strong>12 photos</strong>, one at a time.</p>
              <p>2. Each photo is shown for <strong>30 seconds</strong>.</p>
              <p>3. After each photo, you get <strong>4 minutes</strong> to write a story.</p>
              <p>4. Write on paper. The story should show a hero with positive qualities.</p>
              <p>5. No AI analysis — this simulates the real TAT experience.</p>
            </div>
            <DialogFooter>
              <Button onClick={() => startPhotoPhase(0)} className="bg-gradient-gold text-primary-foreground font-bold w-full">
                I Agree — Start TAT
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {phase === "photo" && items[currentIdx] && (
          <motion.div key={`photo-${currentIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass-card border-gold overflow-hidden">
              <CardContent className="p-0 relative">
                <div className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm">Photo {currentIdx + 1}/{items.length}</span>
                  <Clock className="h-4 w-4 text-destructive ml-2" />
                  <span className="font-mono text-lg font-bold text-destructive">{timer}s</span>
                </div>
                {items[currentIdx].image_url ? (
                  <img src={items[currentIdx].image_url} alt={`TAT ${currentIdx + 1}`} className="w-full h-[400px] object-contain bg-muted" />
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">{items[currentIdx].content_text || "No photo"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === "writing" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass-card border-gold">
              <CardContent className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center relative">
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">Story {currentIdx + 1}/{items.length}</span>
                  <Clock className="h-4 w-4 text-primary ml-2" />
                  <span className="font-mono text-lg font-bold text-primary">{fmtTime(timer)}</span>
                </div>
                <div className="relative w-28 h-28 mb-6">
                  <motion.div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl"
                    animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 4, repeat: Infinity }} />
                  <motion.div className="absolute inset-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                    animate={{ rotateZ: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                </div>
                <h2 className="font-display text-xl text-gradient-gold mb-2">WRITE YOUR STORY — {fmtTime(timer)}</h2>
                <p className="text-muted-foreground text-sm">Write a story on paper showing a hero with positive action & leadership.</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card border-gold">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-success" />
                </div>
                <h2 className="font-display text-2xl text-gradient-gold">TAT COMPLETE!</h2>
                <p className="text-muted-foreground text-sm">You've completed all {items.length} TAT stories. Great practice!</p>
                <Button onClick={() => { clearTimer(); setPhase("list"); setItems([]); }} className="bg-gradient-gold text-primary-foreground font-bold">
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
