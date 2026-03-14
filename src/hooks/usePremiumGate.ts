import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePremiumGate() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      // Check if premium mode is enabled globally
      const { data: setting } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "premium_enabled")
        .single();
      
      const enabled = setting?.value === "true";
      setPremiumEnabled(enabled);

      if (user && enabled) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_premium")
          .eq("user_id", user.id)
          .single();
        setIsPremium(!!(profile as any)?.is_premium);
      }
      setLoading(false);
    };
    check();
  }, [user]);

  // Returns true if user can access the feature (premium not enabled OR user is premium)
  const canAccess = !premiumEnabled || isPremium;

  return { isPremium, premiumEnabled, canAccess, loading };
}
