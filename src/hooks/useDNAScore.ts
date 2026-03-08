import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DNABreakdown {
  testPerformance: number;
  streak: number;
  topicsCovered: number;
  accuracyTrend: number;
  consistency: number;
  overall: number;
}

export function useDNAScore() {
  const { user } = useAuth();
  const [score, setScore] = useState<number>(42);
  const [breakdown, setBreakdown] = useState<DNABreakdown>({
    testPerformance: 0, streak: 0, topicsCovered: 0, accuracyTrend: 0, consistency: 0, overall: 42,
  });
  const [loading, setLoading] = useState(true);

  const calculate = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: profile }, { data: tests }, { data: activities }] = await Promise.all([
      supabase.from("profiles").select("streak, accuracy, total_questions_solved, dna_score").eq("user_id", user.id).single(),
      supabase.from("test_results").select("score, total_questions, correct_answers, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("user_activity").select("action_type, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
    ]);

    // 1. Test performance (40%) — avg score across recent tests
    let testPerf = 0;
    if (tests && tests.length > 0) {
      const avgScore = tests.reduce((sum, t) => {
        const pct = t.total_questions && t.total_questions > 0
          ? ((t.correct_answers || 0) / t.total_questions) * 100
          : (t.score || 0);
        return sum + pct;
      }, 0) / tests.length;
      testPerf = Math.min(100, avgScore);
    }

    // 2. Streak (15%) — max 100 at 30-day streak
    const streakVal = Math.min(100, ((profile?.streak || 0) / 30) * 100);

    // 3. Topics covered (20%) — based on questions solved, max at 500
    const questionsSolved = profile?.total_questions_solved || 0;
    const topicsVal = Math.min(100, (questionsSolved / 500) * 100);

    // 4. Accuracy trend (15%)
    const accuracyVal = Math.min(100, profile?.accuracy || 0);

    // 5. Consistency (10%) — unique active days in last 30 days
    let consistencyVal = 0;
    if (activities && activities.length > 0) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const uniqueDays = new Set(
        activities
          .filter((a) => new Date(a.created_at) >= thirtyDaysAgo)
          .map((a) => new Date(a.created_at).toDateString())
      );
      consistencyVal = Math.min(100, (uniqueDays.size / 30) * 100);
    }

    const overall = Math.round(
      testPerf * 0.4 +
      streakVal * 0.15 +
      topicsVal * 0.2 +
      accuracyVal * 0.15 +
      consistencyVal * 0.1
    );

    const newBreakdown = {
      testPerformance: Math.round(testPerf),
      streak: Math.round(streakVal),
      topicsCovered: Math.round(topicsVal),
      accuracyTrend: Math.round(accuracyVal),
      consistency: Math.round(consistencyVal),
      overall: Math.max(1, overall),
    };

    setBreakdown(newBreakdown);
    setScore(newBreakdown.overall);

    // Update profile with new DNA score
    if (profile && profile.dna_score !== newBreakdown.overall) {
      await supabase
        .from("profiles")
        .update({ dna_score: newBreakdown.overall })
        .eq("user_id", user.id);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  return { score, breakdown, loading, recalculate: calculate };
}
