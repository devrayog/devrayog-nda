import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Crown, Lock, MessageCircle } from "lucide-react";

export default function AdminPremiumSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState("11");
  const [annualPrice, setAnnualPrice] = useState("108");
  const [whatsappNumber, setWhatsappNumber] = useState("8233801406");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); setChecking(false); });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("admin_settings").select("value").eq("key", "premium_enabled").single(),
      supabase.from("admin_settings").select("value").eq("key", "premium_monthly_price").single(),
      supabase.from("admin_settings").select("value").eq("key", "premium_annual_price").single(),
      supabase.from("admin_settings").select("value").eq("key", "premium_whatsapp_number").single(),
    ]).then(([en, mo, an, wa]) => {
      if (en.data?.value) setPremiumEnabled(en.data.value === "true");
      if (mo.data?.value) setMonthlyPrice(mo.data.value);
      if (an.data?.value) setAnnualPrice(an.data.value);
      if (wa.data?.value) setWhatsappNumber(wa.data.value);
    });
  }, [isAdmin]);

  const upsert = async (key: string, value: string) => {
    const { data } = await supabase.from("admin_settings").select("id").eq("key", key).single();
    if (data) await supabase.from("admin_settings").update({ value } as any).eq("key", key);
    else await supabase.from("admin_settings").insert({ key, value } as any);
  };

  const saveAll = async () => {
    setSaving(true);
    await Promise.all([
      upsert("premium_enabled", String(premiumEnabled)),
      upsert("premium_monthly_price", monthlyPrice),
      upsert("premium_annual_price", annualPrice),
      upsert("premium_whatsapp_number", whatsappNumber),
    ]);
    setSaving(false);
    toast({ title: "Premium settings saved!" });
  };

  const togglePremium = async () => {
    const newVal = !premiumEnabled;
    setPremiumEnabled(newVal);
    await upsert("premium_enabled", String(newVal));
    toast({ title: newVal ? "Premium mode ENABLED — Free users will be gated" : "Premium mode DISABLED — All features free" });
  };

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 text-center mt-20"><Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p>Admin access required</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Crown className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl text-gradient-gold">PREMIUM SETTINGS</h1>
        </div>

        <Card className="glass-card border-gold">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Premium Mode</p>
                <p className="text-xs text-muted-foreground">When ON, AI features require Premium membership</p>
              </div>
              <Switch checked={premiumEnabled} onCheckedChange={togglePremium} />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Monthly Price (₹)</label>
                <Input value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} placeholder="11" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Annual Price (₹)</label>
                <Input value={annualPrice} onChange={e => setAnnualPrice(e.target.value)} placeholder="108" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1"><MessageCircle className="h-3 w-3" /> WhatsApp Number (without +91)</label>
                <Input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="8233801406" />
              </div>
            </div>

            <Button onClick={saveAll} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-gold">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Gated features when Premium ON:</strong> Study Plan (AI generate), Topic AI Tests, Current Affairs (AI generate), PYQ AI Analysis, Vocab AI Words, Mock Test (NDA Standard + AI Generated start buttons).
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
