import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sun, Moon, Globe, Bell, Clock, BookOpen, Flame, Newspaper, MessageSquare, Calendar, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface NotifPrefs {
  daily_study_reminder: boolean;
  study_reminder_time: string;
  mock_test_reminder: boolean;
  streak_reminder: boolean;
  current_affairs_update: boolean;
  news_time: string;
  community_replies: boolean;
  exam_countdown_alerts: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  daily_study_reminder: true,
  study_reminder_time: "08:00",
  mock_test_reminder: true,
  streak_reminder: true,
  current_affairs_update: true,
  news_time: "07:00",
  community_replies: true,
  exam_countdown_alerts: true,
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();

  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPrefs({
            daily_study_reminder: data.daily_study_reminder,
            study_reminder_time: data.study_reminder_time,
            mock_test_reminder: data.mock_test_reminder,
            streak_reminder: data.streak_reminder,
            current_affairs_update: data.current_affairs_update,
            news_time: data.news_time,
            community_replies: data.community_replies,
            exam_countdown_alerts: data.exam_countdown_alerts,
          });
        }
        setLoaded(true);
      });
  }, [user]);

  const savePrefs = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({ user_id: user.id, ...prefs }, { onConflict: "user_id" });
      if (error) throw error;
      toast({ title: "Notification preferences saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggles: { key: keyof NotifPrefs; icon: any; title: string; desc: string }[] = [
    { key: "daily_study_reminder", icon: BookOpen, title: "Daily Study Reminder", desc: "Reminds you to study at your preferred time each day" },
    { key: "mock_test_reminder", icon: Clock, title: "Mock Test Reminder", desc: "Weekly reminder to take a mock test" },
    { key: "streak_reminder", icon: Flame, title: "Streak Reminder", desc: "Alert before your streak breaks at midnight" },
    { key: "current_affairs_update", icon: Newspaper, title: "Current Affairs Update", desc: "Daily morning news digest" },
    { key: "community_replies", icon: MessageSquare, title: "Community Replies", desc: "When someone replies to your posts" },
    { key: "exam_countdown_alerts", icon: Calendar, title: "Exam Countdown Alerts", desc: "30, 14, 7, 3, 1 day alerts before exam" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="font-display text-3xl text-gradient-gold">{t("nav.settings")}</h1>

        {/* Theme */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Card className="glass-card border-gold">
            <CardHeader><CardTitle className="font-display text-xl">{t("settings.theme")}</CardTitle></CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={() => toggleTheme()} variant={theme === "light" ? "default" : "outline"} className="flex-1 border-gold">
                <Sun className="h-4 w-4 mr-2" /> {t("settings.light")}
              </Button>
              <Button onClick={() => toggleTheme()} variant={theme === "dark" ? "default" : "outline"} className="flex-1 border-gold">
                <Moon className="h-4 w-4 mr-2" /> {t("settings.dark")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Language */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-gold">
            <CardHeader><CardTitle className="font-display text-xl">{t("settings.language")}</CardTitle></CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={() => setLanguage("en")} variant={language === "en" ? "default" : "outline"} className="flex-1 border-gold">
                <Globe className="h-4 w-4 mr-2" /> English
              </Button>
              <Button onClick={() => setLanguage("hi")} variant={language === "hi" ? "default" : "outline"} className="flex-1 border-gold">
                <Globe className="h-4 w-4 mr-2" /> हिंदी
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card className="glass-card border-gold">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {toggles.map((item, i) => (
                <div key={item.key} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <item.icon className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs[item.key] as boolean}
                    onCheckedChange={(v) => setPrefs(p => ({ ...p, [item.key]: v }))}
                  />
                </div>
              ))}

              {/* Time pickers */}
              <div className="border-t border-border pt-4 space-y-4">
                <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Reminder Times</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Daily Study Reminder Time</Label>
                    <Input
                      type="time"
                      value={prefs.study_reminder_time}
                      onChange={e => setPrefs(p => ({ ...p, study_reminder_time: e.target.value }))}
                      className="bg-card border-gold"
                      disabled={!prefs.daily_study_reminder}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Best time for your daily study alert</p>
                  </div>
                  <div>
                    <Label className="text-xs">Morning News Time</Label>
                    <Input
                      type="time"
                      value={prefs.news_time}
                      onChange={e => setPrefs(p => ({ ...p, news_time: e.target.value }))}
                      className="bg-card border-gold"
                      disabled={!prefs.current_affairs_update}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Current affairs digest delivery</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={savePrefs}
                disabled={saving}
                className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider"
              >
                <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
