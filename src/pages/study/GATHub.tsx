import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export default function GATHub() {
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("study_topics").select("*").eq("subject", "gat").eq("is_active", true).order("sort_order")
      .then(({ data }) => { if (data) setTopics(data); });
  }, []);

  // Group by category
  const sections: { category: string; topics: any[] }[] = [];
  topics.forEach(t => {
    const cat = t.category || "General";
    const existing = sections.find(s => s.category === cat);
    if (existing) existing.topics.push(t);
    else sections.push({ category: cat, topics: [t] });
  });

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl text-gradient-gold">GAT / GK HUB</h1>
          </div>
          <p className="text-muted-foreground text-sm">History, Geography, Science, Polity — organized by NDA weightage.</p>
        </motion.div>

        {sections.map((section, si) => (
          <motion.div key={section.category} initial="hidden" animate="visible" variants={fadeUp} custom={si + 1}>
            <h2 className="font-display text-xl text-primary mb-3">{section.category.toUpperCase()}</h2>
            <div className="grid gap-3 mb-6">
              {section.topics.map((topic) => (
                <Link key={topic.id} to={`/study/topic/${topic.slug}`}>
                  <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="text-3xl">{topic.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{topic.name}</h3>
                        <p className="text-xs text-muted-foreground">{topic.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="flex gap-3">
          <Link to="/ai-tutor" className="flex-1">
            <Button className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider">
              <Brain className="h-4 w-4 mr-2" /> Ask AI About GK
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
