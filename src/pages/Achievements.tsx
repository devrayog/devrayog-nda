import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAchievements } from "@/hooks/useAchievements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Trophy, Flame, Target, Brain, Shield, Swords, FileText, Star,
  BookOpen, Bookmark, StickyNote, MessageSquare, Crown, Crosshair,
  GraduationCap, Medal, UserCheck, LogIn, Lock, HelpCircle
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy, flame: Flame, target: Target, brain: Brain,
  shield: Shield, swords: Swords, "file-text": FileText, star: Star,
  "book-open": BookOpen, bookmark: Bookmark, "sticky-note": StickyNote,
  "message-square": MessageSquare, crown: Crown, crosshair: Crosshair,
  "graduation-cap": GraduationCap, medal: Medal, "user-check": UserCheck,
  "log-in": LogIn,
};

const categoryLabels: Record<string, string> = {
  general: "General", tests: "Tests", streaks: "Streaks",
  practice: "Practice", ai: "AI", dna: "DNA Score",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function Achievements() {
  const { achievements, loading, isUnlocked, unlocked } = useAchievements();

  const unlockedCount = unlocked.length;
  const totalVisible = achievements.filter((a) => !a.hidden).length;

  // Group by category
  const grouped = achievements.reduce<Record<string, typeof achievements>>((acc, a) => {
    (acc[a.category] = acc[a.category] || []).push(a);
    return acc;
  }, {});

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
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
            <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
            <h1 className="font-display text-3xl text-gradient-gold mb-2">Achievements</h1>
            <p className="text-muted-foreground">
              <span className="text-primary font-bold text-2xl">{unlockedCount}</span>
              <span className="text-sm"> / {totalVisible} unlocked</span>
              {achievements.some((a) => a.hidden) && (
                <span className="text-xs text-muted-foreground ml-2">+ hidden surprises</span>
              )}
            </p>
            {/* Progress bar */}
            <div className="mt-4 max-w-md mx-auto h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${totalVisible > 0 ? (unlockedCount / totalVisible) * 100 : 0}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        {Object.entries(grouped).map(([category, items], ci) => (
          <motion.div key={category} initial="hidden" animate="visible" variants={fadeUp} custom={ci + 1}>
            <h2 className="font-display text-lg text-gradient-gold mb-3 flex items-center gap-2">
              {categoryLabels[category] || category}
              <Badge variant="secondary" className="text-xs">{items.filter((a) => isUnlocked(a.id)).length}/{items.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((ach, i) => {
                const achieved = isUnlocked(ach.id);
                const isHidden = ach.hidden && !achieved;
                const Icon = isHidden ? HelpCircle : (iconMap[ach.icon] || Trophy);
                const unlockedAt = unlocked.find((u) => u.achievement_id === ach.id)?.unlocked_at;

                return (
                  <motion.div key={ach.id} variants={fadeUp} custom={i} initial="hidden" animate="visible">
                    <Card
                      className={`glass-card border-gold relative overflow-hidden transition-all ${
                        achieved
                          ? "ring-1 ring-primary/40 shadow-lg shadow-primary/10"
                          : isHidden
                          ? "opacity-60"
                          : "opacity-75 grayscale-[40%]"
                      }`}
                    >
                      {!achieved && !isHidden && (
                        <div className="absolute top-2 right-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <CardContent className="p-5 flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl shrink-0 ${
                            achieved
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {isHidden ? "???" : ach.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isHidden ? "Complete a hidden challenge to reveal this achievement" : ach.description}
                          </p>
                          {achieved && unlockedAt && (
                            <p className="text-[10px] text-primary mt-1 font-mono">
                              ✓ Unlocked {new Date(unlockedAt).toLocaleDateString("en-IN")}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
