import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Play, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface DBResource { id: string; title: string; body: string; link: string; category: string; image_url: string | null; }

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }) };

export default function VideoLectures() {
  const [videos, setVideos] = useState<DBResource[]>([]);

  useEffect(() => {
    supabase.from("resources").select("*").eq("type", "video").eq("is_active", true).order("sort_order")
      .then(({ data }) => setVideos((data as DBResource[]) || []));
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Video className="h-8 w-8 text-accent" />
          <h1 className="font-display text-4xl text-gradient-gold">VIDEO LECTURES</h1>
        </div>
        <p className="text-muted-foreground text-sm">Curated video content for each subject. Admin can add more from the admin panel.</p>

        {videos.length === 0 ? (
          <Card className="glass-card border-gold"><CardContent className="p-8 text-center">
            <Video className="h-12 w-12 text-primary/30 mx-auto mb-4" />
            <h2 className="font-display text-xl text-gradient-gold mb-2">NO VIDEOS YET</h2>
            <p className="text-muted-foreground text-sm">Admin will add video lectures soon.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {videos.map((vid, i) => (
              <motion.div key={vid.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="glass-card border-gold hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <Play className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{vid.title}</h3>
                      {vid.body && <p className="text-xs text-muted-foreground mt-1">{vid.body}</p>}
                      {vid.link && <a href={vid.link} target="_blank" className="text-xs text-primary underline flex items-center gap-1 mt-1"><ExternalLink className="h-3 w-3" /> Watch</a>}
                    </div>
                    <Badge className="text-[9px] bg-accent/20 text-accent capitalize">{vid.category}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
