import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, BookOpen, ChevronRight, Sparkles, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const sections: { category: string; topics: any[] }[] = [];
  topics.forEach(t => {
    const cat = t.category || "General";
    const existing = sections.find(s => s.category === cat);
    if (existing) existing.topics.push(t); else sections.push({ category: cat, topics: [t] });
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

        <Tabs defaultValue="topics" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="topics">📚 Topics</TabsTrigger>
            <TabsTrigger value="ai-test">🤖 AI Generated Test</TabsTrigger>
            <TabsTrigger value="mock-test">📝 Mock Tests (Admin)</TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="ai-test" className="space-y-4">
            <Card className="glass-card border-gold">
              <CardContent className="p-6 text-center space-y-3">
                <Sparkles className="h-10 w-10 text-accent mx-auto" />
                <h3 className="font-display text-xl text-gradient-gold">AI Generated GAT Test</h3>
                <p className="text-sm text-muted-foreground">AI generates questions from History, Geography, Science, Polity & Current Affairs.</p>
                <Link to="/tests/take/quick-gk?subject=gk&questions=20&time=20">
                  <Button className="bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                    <Brain className="h-4 w-4 mr-2" /> Start AI Test
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mock-test" className="space-y-4">
            <Card className="glass-card border-gold">
              <CardContent className="p-6 text-center space-y-3">
                <FileText className="h-10 w-10 text-primary mx-auto" />
                <h3 className="font-display text-xl text-gradient-gold">Admin Mock Tests</h3>
                <p className="text-sm text-muted-foreground">Curated GAT mock tests with NDA-standard questions.</p>
                <Link to="/tests?tab=admin&subject=gat">
                  <Button className="bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                    <FileText className="h-4 w-4 mr-2" /> View Mock Tests
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
