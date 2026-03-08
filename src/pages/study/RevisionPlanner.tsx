import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Brain, Sparkles, CheckCircle, Clock, AlertTriangle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface RevisionItem {
  id: string;
  question: string;
  subject: string;
  topic: string;
  next_review_at: string;
  review_count: number;
  mastered: boolean;
}

export default function RevisionPlanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPlan, setAiPlan] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [filter, setFilter] = useState<"due" | "all" | "mastered">("due");

  useEffect(() => {
    if (!user) return;
    loadItems();
  }, [user]);

  const loadItems = async () => {
    const { data } = await supabase
      .from("error_log")
      .select("id, question, subject, topic, next_review_at, review_count, mastered")
      .eq("user_id", user!.id)
      .order("next_review_at", { ascending: true });
    setItems((data as RevisionItem[]) || []);
    setLoading(false);
  };

  const dueItems = items.filter(i => !i.mastered && new Date(i.next_review_at) <= new Date());
  const activeItems = items.filter(i => !i.mastered);
  const masteredItems = items.filter(i => i.mastered);

  const filteredItems = filter === "due" ? dueItems : filter === "mastered" ? masteredItems : activeItems;

  const markReviewed = async (item: RevisionItem) => {
    const nextCount = item.review_count + 1;
    const intervals = [1, 3, 7, 14, 30];
    const days = intervals[Math.min(nextCount, intervals.length - 1)];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    const isMastered = nextCount >= 5;

    await supabase
      .from("error_log")
      .update({
        review_count: nextCount,
        next_review_at: nextReview.toISOString(),
        mastered: isMastered,
      })
      .eq("id", item.id);

    toast({ title: isMastered ? "Topic Mastered! 🎉" : "Reviewed!", description: isMastered ? "This item won't appear again." : `Next review in ${days} days.` });
    loadItems();
  };

  const generateAIPlan = async () => {
    setLoadingAI(true);
    try {
      const subjectBreakdown = activeItems.reduce((acc, i) => {
        acc[i.subject || "General"] = (acc[i.subject || "General"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [{
            role: "user",
            content: `I'm preparing for NDA exam. Based on my error log analysis:
- Total items to revise: ${activeItems.length}
- Due now: ${dueItems.length}
- Subject breakdown: ${JSON.stringify(subjectBreakdown)}
- Weakest topics: ${[...new Set(dueItems.slice(0, 5).map(i => i.topic))].join(", ")}

Create a detailed 7-day revision plan with specific time slots (morning, afternoon, evening). Prioritize items due for review. Include short breaks and tips. Format with markdown headers and bullet points.`
          }],
        },
      });
      if (error) throw error;
      setAiPlan(data?.response || data?.message || "Could not generate plan.");
    } catch {
      toast({ title: "Error", description: "Failed to generate AI plan.", variant: "destructive" });
    }
    setLoadingAI(false);
  };

  const subjectStats = activeItems.reduce((acc, i) => {
    const s = i.subject || "General";
    if (!acc[s]) acc[s] = { total: 0, due: 0 };
    acc[s].total++;
    if (new Date(i.next_review_at) <= new Date()) acc[s].due++;
    return acc;
  }, {} as Record<string, { total: number; due: number }>);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-gradient-gold">REVISION PLANNER</h1>
          </div>
          <Button onClick={generateAIPlan} disabled={loadingAI} variant="outline" className="border-primary/30">
            <Sparkles className="h-4 w-4 mr-2" />
            {loadingAI ? "Generating..." : "AI Study Plan"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: AlertTriangle, label: "Due Now", value: dueItems.length, color: "text-warning" },
            { icon: Clock, label: "Active", value: activeItems.length, color: "text-accent" },
            { icon: CheckCircle, label: "Mastered", value: masteredItems.length, color: "text-success" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card border-gold">
                <CardContent className="p-4 text-center">
                  <s.icon className={`h-5 w-5 ${s.color} mx-auto mb-1`} />
                  <p className="font-display text-2xl">{s.value}</p>
                  <p className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Subject Breakdown */}
        {Object.keys(subjectStats).length > 0 && (
          <Card className="glass-card border-gold">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Subject Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(subjectStats).map(([subject, stat]) => (
                <div key={subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{subject}</span>
                    <span className="text-muted-foreground">{stat.due} due / {stat.total} total</span>
                  </div>
                  <Progress value={(stat.due / Math.max(stat.total, 1)) * 100} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* AI Plan */}
        {aiPlan && (
          <Card className="glass-card border-accent/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> AI Revision Plan</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{aiPlan}</ReactMarkdown>
            </CardContent>
          </Card>
        )}

        {/* Filter + Items */}
        <div className="flex gap-2">
          {(["due", "all", "mastered"] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className={filter !== f ? "border-primary/20" : ""}>
              {f === "due" ? `Due (${dueItems.length})` : f === "all" ? `Active (${activeItems.length})` : `Mastered (${masteredItems.length})`}
            </Button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-primary/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {filter === "due" ? "No items due for review! Great job staying on top." : filter === "mastered" ? "No mastered items yet. Keep reviewing!" : "No active revision items. Take some quizzes to populate your error log."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, i) => {
              const isDue = new Date(item.next_review_at) <= new Date();
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className={`glass-card ${isDue ? "border-warning/50" : "border-gold"}`}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {item.subject && <Badge variant="outline" className="text-[9px] capitalize">{item.subject}</Badge>}
                          {item.topic && <Badge variant="outline" className="text-[9px]">{item.topic}</Badge>}
                          <span className="text-[9px] text-muted-foreground">Review #{item.review_count}</span>
                        </div>
                        <p className="text-sm truncate">{item.question}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {item.mastered ? "✅ Mastered" : isDue ? "⚠️ Due now" : `Next: ${new Date(item.next_review_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      {!item.mastered && (
                        <Button size="sm" variant="outline" onClick={() => markReviewed(item)} className="border-primary/30 shrink-0">
                          <RotateCcw className="h-3 w-3 mr-1" /> Reviewed
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
