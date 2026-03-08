import { useAchievements } from "@/hooks/useAchievements";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Trophy, Lock, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

export default function AchievementsSummary() {
  const { achievements, unlocked, loading, isUnlocked } = useAchievements();

  if (loading || achievements.length === 0) return null;

  const recent = achievements.slice(0, 6);
  const unlockedCount = unlocked.length;
  const total = achievements.filter((a) => !a.hidden).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-gradient-gold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" /> Achievements
        </h2>
        <Link to="/achievements" className="text-xs text-primary hover:underline font-mono tracking-wider">
          {unlockedCount}/{total} — VIEW ALL →
        </Link>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {recent.map((ach, i) => {
          const achieved = isUnlocked(ach.id);
          const isHidden = ach.hidden && !achieved;
          return (
            <motion.div key={ach.id} variants={fadeUp} custom={i} initial="hidden" animate="visible">
              <Link to="/achievements">
                <Card
                  className={`glass-card border-gold hover:scale-105 transition-transform cursor-pointer ${
                    achieved ? "ring-1 ring-primary/30" : isHidden ? "opacity-50" : "opacity-60 grayscale-[40%]"
                  }`}
                >
                  <CardContent className="p-3 text-center">
                    <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center ${achieved ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {isHidden ? <HelpCircle className="h-4 w-4" /> : achieved ? <Trophy className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </div>
                    <p className="text-[10px] font-semibold mt-1.5 truncate">
                      {isHidden ? "???" : ach.title}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
