import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Globe, Lock } from "lucide-react";

export default function AdminSEO() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [seoTitle, setSeoTitle] = useState("Devrayog NDA AI — India's #1 AI-Powered NDA Exam Prep");
  const [seoDesc, setSeoDesc] = useState("Free AI-powered NDA exam preparation. Personalized study plans, mock tests, SSB prep, current affairs & more.");
  const [seoKeywords, setSeoKeywords] = useState("NDA preparation, NDA exam 2026, AI tutor NDA, SSB preparation, NDA mock test, defence exam prep, NDA study plan, NDA previous year papers");
  const [ogImage, setOgImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); setChecking(false); });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("admin_settings").select("value").eq("key", "seo_title").single(),
      supabase.from("admin_settings").select("value").eq("key", "seo_description").single(),
      supabase.from("admin_settings").select("value").eq("key", "seo_keywords").single(),
      supabase.from("admin_settings").select("value").eq("key", "seo_og_image").single(),
    ]).then(([t, d, k, i]) => {
      if (t.data?.value) setSeoTitle(t.data.value);
      if (d.data?.value) setSeoDesc(d.data.value);
      if (k.data?.value) setSeoKeywords(k.data.value);
      if (i.data?.value) setOgImage(i.data.value);
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
      upsert("seo_title", seoTitle),
      upsert("seo_description", seoDesc),
      upsert("seo_keywords", seoKeywords),
      upsert("seo_og_image", ogImage),
    ]);
    setSaving(false);
    toast({ title: "SEO settings saved! Note: HTML meta tags update on next deploy." });
  };

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 text-center mt-20"><Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p>Admin access required</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl text-gradient-gold">SEO SETTINGS</h1>
        </div>

        <Card className="glass-card border-gold">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Page Title (60 chars max)</label>
              <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} maxLength={60} />
              <p className="text-[10px] text-muted-foreground mt-1">{seoTitle.length}/60</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Meta Description (160 chars max)</label>
              <Textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} maxLength={160} rows={3} />
              <p className="text-[10px] text-muted-foreground mt-1">{seoDesc.length}/160</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Keywords (comma separated)</label>
              <Textarea value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">OG Image URL</label>
              <Input value={ogImage} onChange={e => setOgImage(e.target.value)} placeholder="https://..." />
            </div>
            <Button onClick={saveAll} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">
              {saving ? "Saving..." : "Save SEO Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-gold">
          <CardContent className="p-4 text-xs text-muted-foreground space-y-2">
            <p><strong>Current sitemap:</strong> /sitemap.xml — auto-generated with all public routes</p>
            <p><strong>Google verification:</strong> Already configured in index.html</p>
            <p><strong>Robots.txt:</strong> /robots.txt — allows all crawlers</p>
            <p><strong>Tip:</strong> Submit sitemap URL to Google Search Console and Bing Webmaster Tools</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
