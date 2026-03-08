import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface DBResource { id: string; title: string; body: string; link: string; category: string; }

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }) };

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DBResource[]>([]);

  useEffect(() => {
    supabase.from("resources").select("*").eq("type", "download").eq("is_active", true).order("sort_order")
      .then(({ data }) => setDownloads((data as DBResource[]) || []));
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Download className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">DOWNLOADS</h1>
        </div>
        <p className="text-muted-foreground text-sm">PDFs, formula sheets, and quick references for NDA preparation.</p>

        {downloads.length === 0 ? (
          <Card className="glass-card border-gold"><CardContent className="p-8 text-center">
            <Download className="h-12 w-12 text-primary/30 mx-auto mb-4" />
            <h2 className="font-display text-xl text-gradient-gold mb-2">NO DOWNLOADS YET</h2>
            <p className="text-muted-foreground text-sm">Admin will add downloadable resources soon.</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {downloads.map((item, i) => (
              <motion.div key={item.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="glass-card border-gold hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{item.title}</h3>
                      {item.body && <p className="text-xs text-muted-foreground">{item.body}</p>}
                    </div>
                    <Badge className="text-[9px] bg-primary/20 text-primary capitalize mr-2">{item.category}</Badge>
                    {item.link ? (
                      <a href={item.link} target="_blank"><Button size="sm" variant="outline" className="border-primary/30 shrink-0"><Download className="h-3 w-3 mr-1" /> Download</Button></a>
                    ) : (
                      <Button size="sm" variant="outline" className="border-primary/30 shrink-0 opacity-50" disabled>Soon</Button>
                    )}
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
