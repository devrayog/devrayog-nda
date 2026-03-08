import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, MessageSquare, BarChart3, Settings, Lock, Megaphone, BookOpen, HelpCircle, Newspaper, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AdminBroadcast from "@/components/admin/AdminBroadcast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState({ users: 0, tests: 0, feedback: 0, chats: 0 });
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

  // Check admin role from database
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (data && data.length > 0) setIsAdmin(true);
      setChecking(false);
    };
    checkAdmin();
  }, [user]);

  // Load admin data
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

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/topics">
            <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-bold text-sm">Topic Management</p>
                  <p className="text-[10px] text-muted-foreground">Add/edit study topics & MCQs</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/topics">
            <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-accent" />
                <div>
                  <p className="font-bold text-sm">Question Bank</p>
                  <p className="text-[10px] text-muted-foreground">Manage MCQ questions per topic</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/current-affairs">
            <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Newspaper className="h-6 w-6 text-success" />
                <div>
                  <p className="font-bold text-sm">Current Affairs</p>
                  <p className="text-[10px] text-muted-foreground">Publish & manage news articles</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/pyq">
            <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <FolderOpen className="h-6 w-6 text-warning" />
                <div>
                  <p className="font-bold text-sm">PYQ Management</p>
                  <p className="text-[10px] text-muted-foreground">Add previous year questions</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Tabs defaultValue="feedback">
          <TabsList className="bg-card border border-gold">
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

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

          <TabsContent value="broadcast" className="mt-4">
            <AdminBroadcast />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <h2 className="font-display text-xl text-gradient-gold">ADMIN SETTINGS</h2>
            <Card className="glass-card border-gold">
              <CardHeader><CardTitle className="text-sm">API Key Configuration</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">Custom AI API key for future integrations. Currently using Lovable AI Gateway.</p>
                <Input placeholder="Enter custom API key (optional)" className="bg-card border-gold" disabled />
                <p className="text-[10px] text-muted-foreground mt-1">This field will be enabled in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
