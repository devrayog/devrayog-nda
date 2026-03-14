import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Crown, Shield, Eye, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  state: string | null;
  attempt: string | null;
  target_exam: string | null;
  service: string | null;
  medium: string | null;
  challenge: string | null;
  study_time: string | null;
  streak: number | null;
  dna_score: number | null;
  accuracy: number | null;
  total_questions_solved: number | null;
  is_premium: boolean;
  is_girl: boolean | null;
  cleared_written: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [premiumEnabled, setPremiumEnabled] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); setChecking(false); });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
    supabase.from("admin_settings").select("value").eq("key", "premium_enabled").single()
      .then(({ data }) => setPremiumEnabled(data?.value === "true"));
  }, [isAdmin]);

  const loadUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500);
    setUsers((data as any[]) || []);
  };

  const togglePremium = async (userId: string, current: boolean) => {
    await supabase.from("profiles").update({ is_premium: !current } as any).eq("user_id", userId);
    toast({ title: !current ? "User upgraded to Premium" : "User downgraded to Free" });
    loadUsers();
    if (selected?.user_id === userId) setSelected(s => s ? { ...s, is_premium: !current } : null);
  };

  const togglePremiumMode = async () => {
    const newVal = !premiumEnabled;
    const { data } = await supabase.from("admin_settings").select("id").eq("key", "premium_enabled").single();
    if (data) await supabase.from("admin_settings").update({ value: String(newVal) } as any).eq("key", "premium_enabled");
    else await supabase.from("admin_settings").insert({ key: "premium_enabled", value: String(newVal) } as any);
    setPremiumEnabled(newVal);
    toast({ title: newVal ? "Premium mode ENABLED — Free users will be gated" : "Premium mode DISABLED — All features free" });
  };

  const filtered = users.filter(u =>
    !search || 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 text-center mt-20"><Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p>Admin access required</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            <h1 className="font-display text-3xl text-gradient-gold">USER MANAGEMENT</h1>
          </div>
          <Badge className="text-xs">{users.length} users</Badge>
        </div>

        {/* Premium Toggle */}
        <Card className="glass-card border-gold">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-sm">Premium Mode</p>
                <p className="text-[10px] text-muted-foreground">When ON, specific AI features require Premium membership</p>
              </div>
            </div>
            <Switch checked={premiumEnabled} onCheckedChange={togglePremiumMode} />
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, username..." className="pl-10" />
        </div>

        {/* User List */}
        <div className="space-y-2">
          {filtered.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}>
              <Card className="glass-card border-gold hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelected(u)}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {u.avatar_url ? <img src={u.avatar_url} className="w-9 h-9 rounded-full object-cover" /> : (u.full_name?.[0] || "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate">{u.full_name || "Unnamed"}</p>
                      {u.is_premium && <Badge className="text-[8px] bg-primary/20 text-primary"><Crown className="h-2.5 w-2.5 mr-0.5" />PRO</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-mono text-primary">{u.dna_score || 0} DNA</p>
                    <p className="text-[9px] text-muted-foreground">{u.target_exam || "—"}</p>
                  </div>
                  <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* User Detail Dialog */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-gradient-gold">{selected?.full_name || "User"}</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Email", selected.email],
                    ["Username", selected.username],
                    ["State", selected.state],
                    ["Service", selected.service],
                    ["Target Exam", selected.target_exam],
                    ["Attempt", selected.attempt],
                    ["Medium", selected.medium],
                    ["Challenge", selected.challenge],
                    ["Study Time", selected.study_time],
                    ["Cleared Written", selected.cleared_written],
                    ["Is Girl", selected.is_girl ? "Yes" : "No"],
                    ["Joined", new Date(selected.created_at).toLocaleDateString()],
                  ].map(([label, val]) => (
                    <div key={label as string}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="font-medium">{val || "—"}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    ["DNA Score", selected.dna_score],
                    ["Streak", selected.streak],
                    ["Accuracy", `${selected.accuracy || 0}%`],
                    ["Questions", selected.total_questions_solved],
                  ].map(([label, val]) => (
                    <div key={label as string} className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="font-display text-lg">{val ?? 0}</p>
                      <p className="text-[8px] text-muted-foreground uppercase">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-gold">
                  <div className="flex items-center gap-2">
                    <Crown className={`h-5 w-5 ${selected.is_premium ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-bold text-sm">{selected.is_premium ? "Premium Member" : "Free Member"}</span>
                  </div>
                  <Button size="sm" variant={selected.is_premium ? "destructive" : "default"}
                    className={!selected.is_premium ? "bg-gradient-gold text-primary-foreground font-bold" : ""}
                    onClick={() => togglePremium(selected.user_id, selected.is_premium)}>
                    {selected.is_premium ? "Remove Premium" : "Make Premium"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
