import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, BookOpen, Video, Download, Save, Lock } from "lucide-react";
import { motion } from "framer-motion";

type ResourceType = "book" | "video" | "download";

interface Resource {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  image_url: string | null;
  category: string;
  is_active: boolean;
}

export default function AdminResources() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [tab, setTab] = useState<ResourceType>("book");
  const [form, setForm] = useState({ title: "", body: "", link: "", category: "general", image_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      setIsAdmin(!!(data && data.length > 0));
      setChecking(false);
    };
    check();
  }, [user]);

  const load = async () => {
    const { data } = await supabase.from("resources").select("*").order("sort_order").order("created_at", { ascending: false });
    setResources((data as Resource[]) || []);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await supabase.from("resources").insert({
      type: tab, title: form.title.trim(), body: form.body, link: form.link,
      image_url: form.image_url || null, category: form.category, created_by: user?.id,
    } as any);
    setForm({ title: "", body: "", link: "", category: "general", image_url: "" });
    toast({ title: "Resource added!" });
    load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    await supabase.from("resources").delete().eq("id", id);
    toast({ title: "Deleted" });
    load();
  };

  if (checking) return <DashboardLayout><div className="p-6 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 max-w-md mx-auto mt-20"><Card className="glass-card border-gold"><CardContent className="p-8 text-center"><Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" /><h1 className="font-display text-3xl text-gradient-gold">ADMIN ONLY</h1></CardContent></Card></div></DashboardLayout>;

  const filtered = resources.filter(r => r.type === tab);
  const icons: Record<string, any> = { book: BookOpen, video: Video, download: Download };
  const Icon = icons[tab] || BookOpen;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">MANAGE RESOURCES</h1>
        </div>

        <Tabs value={tab} onValueChange={v => setTab(v as ResourceType)}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="book">Books</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="download">Downloads</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4 space-y-4">
            {/* Add Form */}
            <Card className="glass-card border-gold">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Add {tab}</h3>
                <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-card border-border" />
                <Textarea placeholder="Description / Body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className="bg-card border-border" rows={3} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Link (URL)" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className="bg-card border-border" />
                  <Input placeholder="Image URL (optional)" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="bg-card border-border" />
                </div>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger className="border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["general", "maths", "gat", "english", "ssb", "fitness"].map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAdd} disabled={saving} className="bg-gradient-gold text-primary-foreground font-bold">
                    <Save className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* List */}
            {filtered.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{r.title}</h3>
                      {r.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.body}</p>}
                      {r.link && <a href={r.link} target="_blank" className="text-xs text-primary underline">{r.link}</a>}
                      <span className="text-[9px] text-muted-foreground ml-2">{r.category}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No {tab}s added yet.</p>}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
