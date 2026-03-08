import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Brain, Target, Flame, TrendingUp, Calendar } from "lucide-react";
import { useDNAScore } from "@/hooks/useDNAScore";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

const breakdownItems = [
  { key: "testPerformance" as const, label: "Test Performance", icon: Target, weight: "40%", emoji: "🎯" },
  { key: "streak" as const, label: "Study Streak", icon: Flame, weight: "15%", emoji: "🔥" },
  { key: "topicsCovered" as const, label: "Topics Covered", icon: Brain, weight: "20%", emoji: "📚" },
  { key: "accuracyTrend" as const, label: "Accuracy Trend", icon: TrendingUp, weight: "15%", emoji: "📈" },
  { key: "consistency" as const, label: "Consistency (30d)", icon: Calendar, weight: "10%", emoji: "📅" },
];

export default function DNAScoreDetails() {
  const { score, breakdown, loading } = useDNAScore();

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
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl text-gradient-gold">DNA Score Details</h1>
          </div>
        </motion.div>

        {/* Big score */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-border">
            <CardContent className="p-8 text-center">
              <motion.p
                className="font-display text-8xl text-gradient-gold"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                {score}%
              </motion.p>
              <p className="font-mono text-xs text-muted-foreground tracking-widest mt-2">YOUR NDA READINESS SCORE</p>
              <Badge variant="secondary" className="mt-3">
                {score >= 80 ? "Excellent" : score >= 60 ? "Good Progress" : score >= 40 ? "Building Up" : "Just Starting"}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <h2 className="font-display text-xl text-gradient-gold">Score Breakdown</h2>
        </motion.div>

        {breakdownItems.map((item, i) => (
          <motion.div key={item.key} initial="hidden" animate="visible" variants={fadeUp} custom={i + 3}>
            <Card className="glass-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold flex items-center gap-2">
                    <span>{item.emoji}</span> {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{item.weight}</Badge>
                    <span className="font-mono text-xs text-primary">{breakdown[item.key]}%</span>
                  </div>
                </div>
                <Progress value={breakdown[item.key]} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
          <Card className="glass-card border-border">
            <CardContent className="p-4 flex items-start gap-3">
              <Brain className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-bold">How to improve your DNA Score</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Take more tests (40% weight), maintain your daily streak (15%), cover more topics (20%),
                  improve accuracy (15%), and study consistently every day (10%). AI recalculates automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
