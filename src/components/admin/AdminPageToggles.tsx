import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, EyeOff } from "lucide-react";

const ALL_PAGES = [
  { key: "page_premium", label: "Premium Page", path: "/premium" },
  { key: "page_study_plan", label: "Study Plan", path: "/study-plan" },
  { key: "page_ai_tutor", label: "AI Tutor", path: "/ai-tutor" },
  { key: "page_maths", label: "Maths Hub", path: "/study/maths" },
  { key: "page_gat", label: "GAT/GK Hub", path: "/study/gat" },
  { key: "page_english", label: "English Hub", path: "/study/english" },
  { key: "page_current_affairs", label: "Current Affairs", path: "/current-affairs" },
  { key: "page_pyq", label: "PYQ Papers", path: "/pyq" },
  { key: "page_notes", label: "Notes", path: "/notes" },
  { key: "page_bookmarks", label: "Bookmarks", path: "/bookmarks" },
  { key: "page_revision", label: "Revision Planner", path: "/revision" },
  { key: "page_formulas", label: "Formula Sheet", path: "/formulas" },
  { key: "page_vocabulary", label: "Vocabulary", path: "/vocabulary" },
  { key: "page_mock_tests", label: "Mock Tests", path: "/tests" },
  { key: "page_daily_challenge", label: "Daily Challenge", path: "/daily-challenge" },
  { key: "page_error_log", label: "Error Log", path: "/error-log" },
  { key: "page_question_bank", label: "Question Bank", path: "/question-bank" },
  { key: "page_ssb", label: "SSB Overview", path: "/ssb" },
  { key: "page_ssb_oir", label: "OIR Practice", path: "/ssb/oir" },
  { key: "page_ssb_ppdt", label: "PPDT", path: "/ssb/ppdt" },
  { key: "page_ssb_tat", label: "TAT", path: "/ssb/tat" },
  { key: "page_ssb_wat", label: "WAT", path: "/ssb/wat" },
  { key: "page_ssb_srt", label: "SRT", path: "/ssb/srt" },
  { key: "page_ssb_sdt", label: "SDT", path: "/ssb/sdt" },
  { key: "page_ssb_gd", label: "GD Practice", path: "/ssb/gd" },
  { key: "page_ssb_interview", label: "Interview", path: "/ssb/interview" },
  { key: "page_ssb_personality", label: "Personality Tips", path: "/ssb/personality" },
  { key: "page_ssb_screenout", label: "Screenout", path: "/ssb/screenout" },
  { key: "page_community", label: "Community", path: "/community" },
  { key: "page_live_chat", label: "Live Chat", path: "/community/chat" },
  { key: "page_leaderboard", label: "Leaderboard", path: "/leaderboard" },
  { key: "page_mentors", label: "Mentors", path: "/mentors" },
  { key: "page_study_partner", label: "Study Partners", path: "/study-partner" },
  { key: "page_success_stories", label: "Success Stories", path: "/success-stories" },
  { key: "page_fitness", label: "Fitness Plan", path: "/fitness" },
  { key: "page_running", label: "Running Tracker", path: "/fitness/running" },
  { key: "page_fitness_check", label: "Am I Fit?", path: "/fitness/eligibility" },
  { key: "page_medical", label: "Medical Standards", path: "/fitness/medical" },
  { key: "page_medical_check", label: "Am I Medically Fit?", path: "/fitness/medical-check" },
  { key: "page_resources", label: "Resources", path: "/resources" },
  { key: "page_books", label: "Recommended Books", path: "/resources/books" },
  { key: "page_videos", label: "Video Lectures", path: "/resources/videos" },
  { key: "page_downloads", label: "Downloads", path: "/resources/downloads" },
  { key: "page_faq", label: "FAQ", path: "/faq" },
  { key: "page_girls", label: "Girls NDA", path: "/girls" },
  { key: "page_guide", label: "Platform Guide", path: "/guide" },
  { key: "page_install", label: "Install App", path: "/install" },
  { key: "page_achievements", label: "Achievements", path: "/achievements" },
  { key: "page_activity", label: "Activity Log", path: "/activity" },
  { key: "page_dna_score", label: "DNA Score", path: "/dna-score" },
  { key: "page_notifications", label: "Notifications", path: "/notifications" },
];

export { ALL_PAGES };

export default function AdminPageToggles() {
  const { toast } = useToast();
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_settings").select("key, value").like("key", "page_%");
      const map: Record<string, boolean> = {};
      ALL_PAGES.forEach(p => map[p.key] = true); // default all ON
      data?.forEach(d => { map[d.key] = d.value !== "false"; });
      setToggles(map);
      setLoading(false);
    };
    load();
  }, []);

  const toggle = async (key: string) => {
    const newVal = !toggles[key];
    setToggles(prev => ({ ...prev, [key]: newVal }));
    
    const { data } = await supabase.from("admin_settings").select("id").eq("key", key).single();
    if (data) {
      await supabase.from("admin_settings").update({ value: String(newVal) } as any).eq("key", key);
    } else {
      await supabase.from("admin_settings").insert({ key, value: String(newVal) } as any);
    }
    
    const page = ALL_PAGES.find(p => p.key === key);
    toast({ title: `${page?.label || key} ${newVal ? "enabled" : "disabled"}` });
  };

  const filtered = ALL_PAGES.filter(p => 
    p.label.toLowerCase().includes(search.toLowerCase()) || p.path.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages..." className="pl-10" />
      </div>
      <div className="grid gap-2 max-h-[500px] overflow-y-auto pr-1">
        {filtered.map(page => (
          <div key={page.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
            <div className="flex items-center gap-3">
              {toggles[page.key] ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">{page.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{page.path}</p>
              </div>
            </div>
            <Switch checked={toggles[page.key] ?? true} onCheckedChange={() => toggle(page.key)} />
          </div>
        ))}
      </div>
    </div>
  );
}
