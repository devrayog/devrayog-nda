import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  hidden: boolean;
  criteria_json: Record<string, any>;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: achData }, { data: uaData }] = await Promise.all([
      supabase.from("achievements").select("*").order("category"),
      supabase.from("user_achievements").select("achievement_id, unlocked_at").eq("user_id", user.id),
    ]);
    setAchievements((achData as Achievement[]) || []);
    setUnlocked((uaData as UserAchievement[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isUnlocked = (achievementId: string) =>
    unlocked.some((u) => u.achievement_id === achievementId);

  const unlock = useCallback(
    async (key: string) => {
      if (!user) return;
      const achievement = achievements.find((a) => a.key === key);
      if (!achievement || isUnlocked(achievement.id)) return;
      const { error } = await supabase
        .from("user_achievements")
        .insert({ user_id: user.id, achievement_id: achievement.id });
      if (!error) {
        setUnlocked((prev) => [
          ...prev,
          { achievement_id: achievement.id, unlocked_at: new Date().toISOString() },
        ]);
      }
    },
    [user, achievements, unlocked]
  );

  const checkAndUnlock = useCallback(
    async (context: { streak?: number; questionsCount?: number; testCount?: number; accuracy?: number; dnaScore?: number; notesCount?: number; bookmarksCount?: number; aiChats?: number }) => {
      if (!user || achievements.length === 0) return;
      for (const ach of achievements) {
        if (isUnlocked(ach.id)) continue;
        const c = ach.criteria_json as Record<string, any>;
        let shouldUnlock = false;
        switch (c.type) {
          case "login":
            shouldUnlock = true; // if called, user has logged in
            break;
          case "streak":
            shouldUnlock = (context.streak ?? 0) >= (c.count ?? 999);
            break;
          case "questions_solved":
            shouldUnlock = (context.questionsCount ?? 0) >= (c.count ?? 999);
            break;
          case "test_complete":
            shouldUnlock = (context.testCount ?? 0) >= (c.count ?? 999);
            break;
          case "accuracy":
            shouldUnlock = (context.accuracy ?? 0) >= (c.threshold ?? 999);
            break;
          case "dna_score":
            shouldUnlock = (context.dnaScore ?? 0) >= (c.threshold ?? 999);
            break;
          case "note_created":
            shouldUnlock = (context.notesCount ?? 0) >= (c.count ?? 999);
            break;
          case "bookmark_created":
            shouldUnlock = (context.bookmarksCount ?? 0) >= (c.count ?? 999);
            break;
          case "ai_chat":
            shouldUnlock = (context.aiChats ?? 0) >= (c.count ?? 999);
            break;
        }
        if (shouldUnlock) {
          await unlock(ach.key);
        }
      }
    },
    [user, achievements, unlocked, unlock]
  );

  return { achievements, unlocked, loading, isUnlocked, unlock, checkAndUnlock, refetch: fetchAll };
}
