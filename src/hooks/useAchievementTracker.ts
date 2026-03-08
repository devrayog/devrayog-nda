import { useState, useCallback, useEffect, useRef } from "react";
import { useAchievements } from "./useAchievements";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that checks achievements on Dashboard mount and after key actions.
 * Returns the latest unlocked achievement for celebration UI.
 */
export function useAchievementTracker() {
  const { user } = useAuth();
  const { achievements, unlocked, isUnlocked, checkAndUnlock, refetch } = useAchievements();
  const [celebration, setCelebration] = useState<{ title: string; description: string; icon: string } | null>(null);
  const prevUnlocked = useRef<Set<string>>(new Set());

  // Track previously unlocked to detect new ones
  useEffect(() => {
    prevUnlocked.current = new Set(unlocked.map(u => u.achievement_id));
  }, [unlocked]);

  const checkAchievements = useCallback(async () => {
    if (!user || achievements.length === 0) return;

    // Gather context from DB
    const [profileRes, testsRes, notesRes, bookmarksRes, chatsRes] = await Promise.all([
      supabase.from("profiles").select("streak, total_questions_solved, accuracy, dna_score").eq("user_id", user.id).maybeSingle(),
      supabase.from("test_results").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("chat_history").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

    const p = profileRes.data;
    const ctx = {
      streak: p?.streak || 0,
      questionsCount: p?.total_questions_solved || 0,
      testCount: testsRes.count || 0,
      accuracy: Number(p?.accuracy) || 0,
      dnaScore: p?.dna_score || 0,
      notesCount: notesRes.count || 0,
      bookmarksCount: bookmarksRes.count || 0,
      aiChats: chatsRes.count || 0,
    };

    await checkAndUnlock(ctx);
    await refetch();
  }, [user, achievements, checkAndUnlock, refetch]);

  // After refetch, detect newly unlocked
  useEffect(() => {
    const newlyUnlocked = unlocked.filter(u => !prevUnlocked.current.has(u.achievement_id));
    if (newlyUnlocked.length > 0) {
      const ach = achievements.find(a => a.id === newlyUnlocked[0].achievement_id);
      if (ach) {
        setCelebration({ title: ach.title, description: ach.description, icon: ach.icon });
      }
    }
  }, [unlocked, achievements]);

  return { checkAchievements, celebration, clearCelebration: () => setCelebration(null) };
}
