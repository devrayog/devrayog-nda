import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PageVisibilityContextType {
  isPageVisible: (path: string) => boolean;
  loading: boolean;
}

const PageVisibilityContext = createContext<PageVisibilityContextType>({
  isPageVisible: () => true,
  loading: true,
});

export function usePageVisibility() {
  return useContext(PageVisibilityContext);
}

// Map paths to admin_settings keys
const PATH_TO_KEY: Record<string, string> = {
  "/premium": "page_premium",
  "/study-plan": "page_study_plan",
  "/ai-tutor": "page_ai_tutor",
  "/study/maths": "page_maths",
  "/study/gat": "page_gat",
  "/study/english": "page_english",
  "/current-affairs": "page_current_affairs",
  "/pyq": "page_pyq",
  "/notes": "page_notes",
  "/bookmarks": "page_bookmarks",
  "/revision": "page_revision",
  "/formulas": "page_formulas",
  "/vocabulary": "page_vocabulary",
  "/tests": "page_mock_tests",
  "/daily-challenge": "page_daily_challenge",
  "/error-log": "page_error_log",
  "/question-bank": "page_question_bank",
  "/ssb": "page_ssb",
  "/ssb/oir": "page_ssb_oir",
  "/ssb/ppdt": "page_ssb_ppdt",
  "/ssb/tat": "page_ssb_tat",
  "/ssb/wat": "page_ssb_wat",
  "/ssb/srt": "page_ssb_srt",
  "/ssb/sdt": "page_ssb_sdt",
  "/ssb/gd": "page_ssb_gd",
  "/ssb/interview": "page_ssb_interview",
  "/ssb/personality": "page_ssb_personality",
  "/ssb/screenout": "page_ssb_screenout",
  "/community": "page_community",
  "/community/chat": "page_live_chat",
  "/leaderboard": "page_leaderboard",
  "/mentors": "page_mentors",
  "/study-partner": "page_study_partner",
  "/success-stories": "page_success_stories",
  "/fitness": "page_fitness",
  "/fitness/running": "page_running",
  "/fitness/eligibility": "page_fitness_check",
  "/fitness/medical": "page_medical",
  "/fitness/medical-check": "page_medical_check",
  "/resources": "page_resources",
  "/resources/books": "page_books",
  "/resources/videos": "page_videos",
  "/resources/downloads": "page_downloads",
  "/faq": "page_faq",
  "/girls": "page_girls",
  "/guide": "page_guide",
  "/install": "page_install",
  "/achievements": "page_achievements",
  "/activity": "page_activity",
  "/dna-score": "page_dna_score",
  "/notifications": "page_notifications",
};

export function PageVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [disabledPages, setDisabledPages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_settings").select("key, value").like("key", "page_%");
      const disabled = new Set<string>();
      data?.forEach(d => {
        if (d.value === "false") {
          // Find the path for this key
          const entry = Object.entries(PATH_TO_KEY).find(([, k]) => k === d.key);
          if (entry) disabled.add(entry[0]);
        }
      });
      setDisabledPages(disabled);
      setLoading(false);
    };
    load();
  }, []);

  const isPageVisible = (path: string) => {
    return !disabledPages.has(path);
  };

  return (
    <PageVisibilityContext.Provider value={{ isPageVisible, loading }}>
      {children}
    </PageVisibilityContext.Provider>
  );
}
