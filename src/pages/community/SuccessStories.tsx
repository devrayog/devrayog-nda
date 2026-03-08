import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) };

interface Story { name: string; branch: string; batch: string; state: string; quote: string; tips: string[]; attempts: number; highlight: string; }

export default function SuccessStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("success_stories").select("*").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => { setStories((data as Story[]) || []); setLoading(false); });
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-warning" />
            <h1 className="font-display text-4xl text-gradient-gold">SUCCESS STORIES</h1>
          </div>
          <p className="text-muted-foreground text-sm">Real NDA selection stories added by admin. Get inspired by those who made it.</p>
        </motion.div>

        {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}

        {!loading && stories.length === 0 && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-primary/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No success stories yet. Admin will add real NDA selection stories soon!</p>
            </CardContent>
          </Card>
        )}

        {stories.map((story, i) => (
          <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
            <Card className="glass-card border-gold overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-xl">{story.name}</h3>
                      <Badge className="bg-primary/20 text-primary text-[9px]">{story.branch}</Badge>
                    </div>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span>{story.batch}</span><span>•</span><span>{story.state}</span><span>•</span>
                      <span>{story.attempts === 1 ? "1st attempt" : `${story.attempts} attempts`}</span>
                    </div>
                  </div>
                  <Badge className="bg-success/20 text-success text-[9px]">{story.highlight}</Badge>
                </div>
                {story.quote && (
                  <div className="flex gap-3 p-4 bg-muted/30 rounded-lg">
                    <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm italic">{story.quote}</p>
                  </div>
                )}
                {story.tips && story.tips.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2">KEY STRATEGIES</p>
                    <div className="space-y-1.5">
                      {story.tips.map((tip, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Star className="h-3 w-3 text-warning mt-0.5 shrink-0" /><p className="text-xs">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
