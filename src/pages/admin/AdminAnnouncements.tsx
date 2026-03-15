import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Lock } from "lucide-react";
import ImageUploadButton from "@/components/ImageUploadButton";

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [active, setActive] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); setChecking(false); });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("admin_settings").select("value").eq("key", "announcement_active").single(),
      supabase.from("admin_settings").select("value").eq("key", "announcement_title").single(),
      supabase.from("admin_settings").select("value").eq("key", "announcement_body").single(),
      supabase.from("admin_settings").select("value").eq("key", "announcement_image").single(),
    ]).then(([a, t, b, i]) => {
      if (a.data?.value) setActive(a.data.value === "true");
      if (t.data?.value) setTitle(t.data.value);
      if (b.data?.value) setBody(b.data.value);
      if (i.data?.value) setImageUrl(i.data.value);
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
      upsert("announcement_active", String(active)),
      upsert("announcement_title", title),
      upsert("announcement_body", body),
      upsert("announcement_image", imageUrl),
    ]);
    setSaving(false);
    toast({ title: "Announcement saved!" });
  };

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 text-center mt-20"><Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p>Admin access required</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Megaphone className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl text-gradient-gold">ANNOUNCEMENTS</h1>
        </div>
        <p className="text-xs text-muted-foreground">This popup shows once per day to logged-in users.</p>

        <Card className="glass-card border-gold">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Active</p>
                <p className="text-xs text-muted-foreground">Show popup to users</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="🎉 New Update!" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Body</label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="What's new..." rows={4} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Image (optional)</label>
              <div className="flex items-center gap-2">
                <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://... or upload" className="flex-1" />
                <ImageUploadButton bucket="question-images" onUpload={setImageUrl} />
              </div>
              {imageUrl && <img src={imageUrl} alt="preview" className="mt-2 rounded-lg max-h-32 object-cover" />}
            </div>
            <Button onClick={saveAll} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">
              {saving ? "Saving..." : "Save Announcement"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
