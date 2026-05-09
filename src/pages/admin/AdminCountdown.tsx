import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Clock, Lock } from "lucide-react";
import ExamCountdown from "@/components/ExamCountdown";

export default function AdminCountdown() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  // datetime-local value (local time, no TZ)
  const [datetime, setDatetime] = useState("2026-04-12T10:00");
  const [label, setLabel] = useState("NDA 1 2026 — April 12 • Maths 10:00 AM • GAT 2:00 PM");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => { if (data && data.length) setIsAdmin(true); setChecking(false); });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("admin_settings").select("value").eq("key", "exam_countdown_datetime").maybeSingle(),
      supabase.from("admin_settings").select("value").eq("key", "exam_countdown_label").maybeSingle(),
    ]).then(([dt, lb]) => {
      if (dt.data?.value) {
        // stored as ISO UTC; convert to local datetime-local string
        const d = new Date(dt.data.value);
        const pad = (n: number) => String(n).padStart(2, "0");
        setDatetime(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }
      if (lb.data?.value) setLabel(lb.data.value);
    });
  }, [isAdmin]);

  const upsert = async (key: string, value: string) => {
    const { data } = await supabase.from("admin_settings").select("id").eq("key", key).maybeSingle();
    if (data) await supabase.from("admin_settings").update({ value } as any).eq("key", key);
    else await supabase.from("admin_settings").insert({ key, value } as any);
  };

  const save = async () => {
    setSaving(true);
    const iso = new Date(datetime).toISOString();
    await Promise.all([
      upsert("exam_countdown_datetime", iso),
      upsert("exam_countdown_label", label),
    ]);
    setSaving(false);
    toast({ title: "Countdown updated!", description: "Dashboard will reflect the new target." });
  };

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 text-center mt-20"><Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p>Admin access required</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl text-gradient-gold">EXAM COUNTDOWN</h1>
        </div>

        <Card className="glass-card border-gold">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Exam Date & Time (your local time)</label>
              <Input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Label shown above countdown</label>
              <Input value={label} onChange={e => setLabel(e.target.value)} />
            </div>
            <Button onClick={save} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">
              {saving ? "Saving..." : "Save Countdown"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-gold">
          <CardContent className="p-6 text-center space-y-3">
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Live Preview</p>
            <div className="flex justify-center"><ExamCountdown /></div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
