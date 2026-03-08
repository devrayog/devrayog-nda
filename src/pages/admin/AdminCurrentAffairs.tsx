import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lock, Plus, Pencil, Trash2, Newspaper, Star, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Article {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  link: string | null;
  category: string;
  is_featured: boolean;
  published_at: string;
  is_active: boolean;
}

const CATEGORIES = [
  { value: "national", label: "National" },
  { value: "international", label: "International" },
  { value: "defence", label: "Defence" },
  { value: "science", label: "Science & Tech" },
  { value: "sports", label: "Sports" },
  { value: "economy", label: "Economy" },
  { value: "polity", label: "Polity" },
];

const emptyArticle = {
  title: "", body: "", image_url: "", link: "",
  category: "national", is_featured: false,
  published_at: new Date().toISOString().split("T")[0], is_active: true,
};

export default function AdminCurrentAffairs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Partial<Article> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
      if (data && data.length > 0) setIsAdmin(true);
      setChecking(false);
    });
  }, [user]);

  const load = async () => {
    const { data } = await supabase.from("current_affairs").select("*").order("published_at", { ascending: false }).order("is_featured", { ascending: false }).limit(100);
    if (data) setArticles(data as Article[]);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const handleSave = async () => {
    if (!editing?.title) return;
    setSaving(true);
    const payload = {
      ...editing,
      image_url: editing.image_url || null,
      link: editing.link || null,
      created_by: user?.id,
    };
    try {
      if ((editing as Article).id) {
        const { id, ...rest } = payload as any;
        await supabase.from("current_affairs").update(rest).eq("id", id);
        toast({ title: "Article updated" });
      } else {
        await supabase.from("current_affairs").insert(payload as any);
        toast({ title: "Article published" });
      }
      setDialogOpen(false);
      setEditing(null);
      load();
    } catch { toast({ title: "Error", variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await supabase.from("current_affairs").delete().eq("id", id);
    toast({ title: "Article deleted" });
    load();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("current_affairs").update({ is_featured: !current }).eq("id", id);
    load();
  };

  const filtered = filterCat === "all" ? articles : articles.filter(a => a.category === filterCat);

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 max-w-md mx-auto mt-20"><Card className="glass-card border-gold"><CardContent className="p-8 text-center"><Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" /><h1 className="font-display text-3xl text-gradient-gold mb-2">ADMIN ACCESS</h1><p className="text-muted-foreground text-sm">Admin privileges required.</p></CardContent></Card></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-gradient-gold">CURRENT AFFAIRS</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ ...emptyArticle })} className="bg-gradient-gold text-primary-foreground font-bold">
                <Plus className="h-4 w-4 mr-2" /> Add Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-gradient-gold">{(editing as Article)?.id ? "Edit Article" : "New Article"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input value={editing?.title || ""} onChange={e => setEditing(ed => ({ ...ed!, title: e.target.value }))} placeholder="Article title" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Body</label>
                  <Textarea value={editing?.body || ""} onChange={e => setEditing(ed => ({ ...ed!, body: e.target.value }))} placeholder="Article content (supports markdown)" rows={5} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Category</label>
                    <Select value={editing?.category || "national"} onValueChange={v => setEditing(e => ({ ...e!, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Published Date</label>
                    <Input type="date" value={editing?.published_at || ""} onChange={e => setEditing(ed => ({ ...ed!, published_at: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Image URL (optional)</label>
                  <Input value={editing?.image_url || ""} onChange={e => setEditing(ed => ({ ...ed!, image_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">External Link (optional)</label>
                  <Input value={editing?.link || ""} onChange={e => setEditing(ed => ({ ...ed!, link: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={editing?.is_featured || false} onCheckedChange={v => setEditing(e => ({ ...e!, is_featured: v }))} />
                  <label className="text-sm">Featured article</label>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">
                  {saving ? "Saving..." : "Publish Article"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", ...CATEGORIES.map(c => c.value)].map(f => (
            <Button key={f} size="sm" variant={filterCat === f ? "default" : "outline"} onClick={() => setFilterCat(f)} className={filterCat === f ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
              {f === "all" ? "All" : CATEGORIES.find(c => c.value === f)?.label || f}
            </Button>
          ))}
        </div>

        <div className="grid gap-3">
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`glass-card border-gold ${a.is_featured ? "ring-1 ring-primary/30" : ""}`}>
                <CardContent className="p-4 flex items-start gap-4">
                  {a.image_url && (
                    <img src={a.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {a.is_featured && <Star className="h-3 w-3 text-primary fill-primary" />}
                      <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">{a.category}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{a.published_at}</span>
                    </div>
                    <h3 className="font-bold text-sm">{a.title}</h3>
                    {a.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</p>}
                    {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1"><ExternalLink className="h-3 w-3" /> Source</a>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => toggleFeatured(a.id, a.is_featured)} title="Toggle featured">
                      <Star className={`h-3 w-3 ${a.is_featured ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(a); setDialogOpen(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No articles yet. Click "Add Article" to publish one.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
