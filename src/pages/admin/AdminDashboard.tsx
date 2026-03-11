import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, MessageSquare, BarChart3, Lock, Megaphone, BookOpen, HelpCircle, Newspaper, FolderOpen, FileText, Video, Download, Star, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AdminBroadcast from "@/components/admin/AdminBroadcast";

function AdminAPIKeySettings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("admin_settings").select("value").eq("key", "custom_ai_api_key").single()
      .then(({ data }) => { if (data?.value) { setSavedKey(data.value); setApiKey(data.value); } });
  }, []);

  const saveKey = async () => {
    setSaving(true);
    const { data: existing } = await supabase.from("admin_settings").select("id").eq("key", "custom_ai_api_key").single();
    if (existing) {
      await supabase.from("admin_settings").update({ value: apiKey }).eq("key", "custom_ai_api_key");
    } else {
      await supabase.from("admin_settings").insert({ key: "custom_ai_api_key", value: apiKey });
    }
    setSavedKey(apiKey);
    setSaving(false);
    toast({ title: apiKey ? "AI API key saved! Platform will use your custom key." : "Custom key removed. Using default." });
  };

  const removeKey = async () => {
    setSaving(true);
    await supabase.from("admin_settings").update({ value: "" }).eq("key", "custom_ai_api_key");
    setApiKey("");
    setSavedKey("");
    setSaving(false);
    toast({ title: "Custom API key removed. Using default AI." });
  };

  return (
    <Card className="glass-card border-gold">
      <CardHeader><CardTitle className="text-sm">🔑 Custom AI API Key</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          By default, the platform uses the built-in AI. If you add your own API key (OpenAI, Gemini, etc.), 
          all AI features across the platform will use YOUR key instead.
        </p>
        <div className="flex gap-2">
          <Input 
            type="password" 
            value={apiKey} 
            onChange={e => setApiKey(e.target.value)} 
            placeholder="sk-... or AIza..." 
            className="font-mono text-xs"
          />
          <Button onClick={saveKey} disabled={saving} className="bg-gradient-gold text-primary-foreground font-bold shrink-0">
            {saving ? "..." : "Save"}
          </Button>
        </div>
        {savedKey && (
          <div className="flex items-center justify-between bg-success/10 p-2 rounded text-xs">
            <span className="text-success font-bold">✓ Custom key active: {savedKey.slice(0, 8)}...</span>
            <Button size="sm" variant="ghost" className="text-destructive text-xs h-6" onClick={removeKey}>Remove</Button>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground">
          Supported: OpenAI (sk-...), Google Gemini (AIza...). The key is stored securely in admin settings.
        </p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState({ users: 0, tests: 0, feedback: 0, chats: 0 });
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (data && data.length > 0) setIsAdmin(true);
      setChecking(false);
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const [profiles, tests, fb, chats] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("test_results").select("id", { count: "exact", head: true }),
        supabase.from("feedback").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("chat_history").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        users: profiles.count || 0,
        tests: tests.count || 0,
        feedback: fb.data?.length || 0,
        chats: chats.count || 0,
      });
      setFeedbackList(fb.data || []);
    };
    load();
  }, [isAdmin]);

  if (checking) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-md mx-auto mt-20">
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <h1 className="font-display text-3xl text-gradient-gold mb-2">ADMIN ACCESS</h1>
              <p className="text-muted-foreground text-sm mb-6">You need admin privileges to access this panel. Contact the platform administrator.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const adminLinks = [
    { href: "/admin/ai", icon: Bot, title: "🤖 AI Assistant", desc: "Auto-add questions, content, analytics", color: "text-success" },
    { href: "/admin/topics", icon: BookOpen, title: "Topics & MCQs", desc: "Add/edit study topics & questions", color: "text-primary" },
    { href: "/admin/current-affairs", icon: Newspaper, title: "Current Affairs", desc: "Publish & manage news articles", color: "text-success" },
    { href: "/admin/pyq", icon: FolderOpen, title: "PYQ Management", desc: "Add previous year questions & PDFs", color: "text-warning" },
    { href: "/admin/resources", icon: BookOpen, title: "Books / Videos / Downloads", desc: "Manage all resources", color: "text-primary" },
    { href: "/admin/faq", icon: HelpCircle, title: "FAQ Management", desc: "Add frequently asked questions", color: "text-warning" },
    { href: "/admin/ssb", icon: Shield, title: "SSB Sets", desc: "Manage PPDT/TAT/WAT/SRT/SDT sets", color: "text-accent" },
    { href: "/admin/success-stories", icon: Star, title: "Success Stories", desc: "Add real NDA selection stories", color: "text-success" },
    { href: "/ssb/personality", icon: Users, title: "Personality Tips", desc: "Edit OLQ & communication tips", color: "text-cyan" },
    { href: "/mentors", icon: Users, title: "Mentors", desc: "Add & manage mentor profiles", color: "text-primary" },
    { href: "/tests", icon: FileText, title: "Mock Tests", desc: "Add admin mock test sets", color: "text-accent" },
    { href: "/formulas", icon: BookOpen, title: "Formulas", desc: "Add formulas with categories", color: "text-warning" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">ADMIN PANEL</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total Users", value: stats.users, color: "text-primary" },
            { icon: BarChart3, label: "Tests Taken", value: stats.tests, color: "text-accent" },
            { icon: MessageSquare, label: "Feedback", value: stats.feedback, color: "text-cyan" },
            { icon: MessageSquare, label: "AI Chats", value: stats.chats, color: "text-success" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card border-gold">
                <CardContent className="p-4 text-center">
                  <s.icon className={`h-6 w-6 ${s.color} mx-auto mb-2`} />
                  <p className="font-display text-3xl">{s.value}</p>
                  <p className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Admin Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {adminLinks.map((link, i) => (
            <Link key={i} to={link.href}>
              <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <link.icon className={`h-6 w-6 ${link.color}`} />
                  <p className="font-bold text-sm">{link.title}</p>
                  <p className="text-[10px] text-muted-foreground">{link.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Tabs defaultValue="broadcast">
          <TabsList className="bg-card border border-gold">
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="broadcast" className="mt-4">
            <AdminBroadcast />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-3 mt-4">
            <h2 className="font-display text-xl text-gradient-gold">USER FEEDBACK</h2>
            {feedbackList.length === 0 && <p className="text-muted-foreground text-sm">No feedback yet.</p>}
            {feedbackList.map((fb: any) => (
              <Card key={fb.id} className="glass-card border-gold">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      fb.type === "bug" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                    }`}>{fb.type}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      fb.status === "resolved" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                    }`}>{fb.status}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{new Date(fb.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm">{fb.message}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <h2 className="font-display text-xl text-gradient-gold">ADMIN SETTINGS</h2>
            <AdminAPIKeySettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
