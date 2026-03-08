import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

export function useActivityTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const startTime = useRef<number>(Date.now());
  const lastPage = useRef<string>("");

  const logActivity = useCallback(
    async (actionType: string, page?: string, topic?: string, metadata?: Record<string, any>) => {
      if (!user) return;
      await supabase.from("user_activity").insert({
        user_id: user.id,
        action_type: actionType,
        page: page || location.pathname,
        topic: topic || null,
        metadata: metadata || {},
      });
    },
    [user, location.pathname]
  );

  // Log page visits and time spent
  useEffect(() => {
    if (!user) return;
    const currentPage = location.pathname;

    // Log time on previous page
    if (lastPage.current && lastPage.current !== currentPage) {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      if (duration > 2) {
        supabase.from("user_activity").insert({
          user_id: user.id,
          action_type: "page_visit",
          page: lastPage.current,
          duration_seconds: duration,
          metadata: {},
        });
      }
    }

    lastPage.current = currentPage;
    startTime.current = Date.now();
  }, [location.pathname, user]);

  // Log on unmount (tab close)
  useEffect(() => {
    if (!user) return;
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      if (duration > 2 && lastPage.current) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_activity`,
          JSON.stringify({
            user_id: user.id,
            action_type: "page_visit",
            page: lastPage.current,
            duration_seconds: duration,
            metadata: {},
          })
        );
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [user]);

  return { logActivity };
}
