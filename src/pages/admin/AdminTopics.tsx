import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Pencil, Trash2, BookOpen, Lock, ChevronRight } from "lucide-react";
import ImageUploadButton from "@/components/ImageUploadButton";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Topic {
  id: string;
  subject: string;
  category: string | null;
  name: string;
  slug: string;
  description: string;
  emoji: string;
  weight: string;
  sort_order: number;
  is_active: boolean;
  image_url: string | null;
}

const emptyTopic = {
  subject: "maths",
  category: "",
  name: "",
  slug: "",
  description: "",
  emoji: "📚",
  weight: "Medium",
  sort_order: 0,
  is_active: true,
};

export default function AdminTopics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Partial<Topic> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
      if (data && data.length > 0) setIsAdmin(true);
      setChecking(false);
    });
  }, [user]);

  const loadTopics = async () => {
    const { data } = await supabase.from("study_topics").select("*").order("subject").order("sort_order");
    if (data) setTopics(data as Topic[]);
  };

  useEffect(() => { if (isAdmin) loadTopics(); }, [isAdmin]);

  const handleSave = async () => {
    if (!editing?.name || !editing?.slug) return;
    setSaving(true);
    try {
      if ((editing as Topic).id) {
        const { id, ...rest } = editing as Topic;
        await supabase.from("study_topics").update(rest).eq("id", id);
        toast({ title: "Topic updated" });
      } else {
        await supabase.from("study_topics").insert(editing as any);
        toast({ title: "Topic created" });
      }
      setDialogOpen(false);
      setEditing(null);
      loadTopics();
    } catch { toast({ title: "Error", variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this topic and all its questions?")) return;
    await supabase.from("study_topics").delete().eq("id", id);
    toast({ title: "Topic deleted" });
    loadTopics();
  };

  const filtered = filter === "all" ? topics : topics.filter(t => t.subject === filter);

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 max-w-md mx-auto mt-20"><Card className="glass-card border-gold"><CardContent className="p-8 text-center"><Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" /><h1 className="font-display text-3xl text-gradient-gold mb-2">ADMIN ACCESS</h1><p className="text-muted-foreground text-sm">Admin privileges required.</p></CardContent></Card></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-gradient-gold">TOPIC MANAGEMENT</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ ...emptyTopic })} className="bg-gradient-gold text-primary-foreground font-bold">
                <Plus className="h-4 w-4 mr-2" /> Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="font-display text-gradient-gold">{(editing as Topic)?.id ? "Edit Topic" : "New Topic"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Subject</label>
                    <Select value={editing?.subject || "maths"} onValueChange={v => setEditing(e => ({ ...e!, subject: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maths">Maths</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="gat">GAT / GK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Weight</label>
                    <Select value={editing?.weight || "Medium"} onValueChange={v => setEditing(e => ({ ...e!, weight: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input value={editing?.name || ""} onChange={e => setEditing(ed => ({ ...ed!, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }))} placeholder="Topic name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Slug</label>
                    <Input value={editing?.slug || ""} onChange={e => setEditing(ed => ({ ...ed!, slug: e.target.value }))} placeholder="url-slug" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Emoji</label>
                    <Input value={editing?.emoji || ""} onChange={e => setEditing(ed => ({ ...ed!, emoji: e.target.value }))} placeholder="📚" />
                  </div>
                </div>
                {editing?.subject === "gat" && (
                  <div>
                    <label className="text-xs text-muted-foreground">Category (GAT only)</label>
                    <Input value={editing?.category || ""} onChange={e => setEditing(ed => ({ ...ed!, category: e.target.value }))} placeholder="History, Geography, Science..." />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground">Description</label>
                  <Input value={editing?.description || ""} onChange={e => setEditing(ed => ({ ...ed!, description: e.target.value }))} placeholder="Brief description" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sort Order</label>
                  <Input type="number" value={editing?.sort_order || 0} onChange={e => setEditing(ed => ({ ...ed!, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">
                  {saving ? "Saving..." : "Save Topic"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          {["all", "maths", "english", "gat"].map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className={filter === f ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        <div className="grid gap-3">
          {filtered.map((topic, i) => (
            <motion.div key={topic.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="glass-card border-gold">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-2xl">{topic.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm">{topic.name}</h3>
                      <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full ${
                        topic.weight === "High" ? "bg-destructive/20 text-destructive" :
                        topic.weight === "Medium" ? "bg-primary/20 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>{topic.weight}</span>
                      <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-accent/20 text-accent">{topic.subject}</span>
                      {!topic.is_active && <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Inactive</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{topic.description}</p>
                  </div>
                  <Link to={`/admin/topics/${topic.id}/questions`}>
                    <Button size="sm" variant="outline" className="border-gold text-xs">
                      MCQs <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(topic); setDialogOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(topic.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No topics found.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
