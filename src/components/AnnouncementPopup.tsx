import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function AnnouncementPopup() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [announcement, setAnnouncement] = useState<{ title: string; body: string; image_url: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    const key = `announcement_seen_${new Date().toDateString()}`;
    if (localStorage.getItem(key)) return;

    supabase.from("admin_settings").select("value").eq("key", "announcement_active").single()
      .then(({ data }) => {
        if (data?.value !== "true") return;
        Promise.all([
          supabase.from("admin_settings").select("value").eq("key", "announcement_title").single(),
          supabase.from("admin_settings").select("value").eq("key", "announcement_body").single(),
          supabase.from("admin_settings").select("value").eq("key", "announcement_image").single(),
        ]).then(([t, b, i]) => {
          if (t.data?.value) {
            setAnnouncement({ title: t.data.value, body: b.data?.value || "", image_url: i.data?.value || null });
            setTimeout(() => setShow(true), 2000);
          }
        });
      });
  }, [user]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(`announcement_seen_${new Date().toDateString()}`, "1");
  };

  return (
    <AnimatePresence>
      {show && announcement && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
            className="bg-card border border-primary/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={dismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl text-gradient-gold">{announcement.title}</h2>
            </div>
            {announcement.image_url && (
              <img src={announcement.image_url} alt="announcement" className="w-full rounded-lg mb-3 max-h-48 object-cover" />
            )}
            <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">{announcement.body}</p>
            <Button onClick={dismiss} className="w-full bg-gradient-gold text-primary-foreground font-bold">Got it!</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
