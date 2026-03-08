import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementCelebrationProps {
  achievement: { title: string; description: string; icon: string } | null;
  onClose: () => void;
}

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 300 - 150,
  y: Math.random() * -300 - 50,
  rotate: Math.random() * 720 - 360,
  scale: Math.random() * 0.5 + 0.5,
  delay: Math.random() * 0.3,
  color: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "#FFD700", "#FFA500"][Math.floor(Math.random() * 5)],
}));

export default function AchievementCelebration({ achievement, onClose }: AchievementCelebrationProps) {
  if (!achievement) return null;

  return (
    <Dialog open={!!achievement} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm border-primary/50 bg-background/95 backdrop-blur-xl overflow-hidden">
        {/* Confetti particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: p.scale, rotate: p.rotate }}
              transition={{ duration: 1.5, delay: p.delay, ease: "easeOut" }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center py-4 space-y-4">
          {/* Glow ring */}
          <motion.div
            className="mx-auto w-24 h-24 relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Trophy className="h-10 w-10 text-primary-foreground" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Sparkles className="h-6 w-6 text-warning" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="font-mono text-[10px] tracking-[4px] text-primary uppercase">Achievement Unlocked</p>
            <h2 className="font-display text-2xl text-gradient-gold mt-1">{achievement.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{achievement.description}</p>
          </motion.div>

          <motion.div
            className="flex justify-center gap-1 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
              >
                <Star className="h-5 w-5 text-warning fill-warning" />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Button onClick={onClose} className="bg-gradient-gold text-primary-foreground font-bold tracking-wider mt-2">
              Awesome! 🎉
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
