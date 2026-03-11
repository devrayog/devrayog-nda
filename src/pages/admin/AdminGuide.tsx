import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Lock, BookOpen, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminGuide() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [editing, setEditing] = useState<Partial<GuideSection> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
      if (data && data.length > 0) setIsAdmin(true);
      setChecking(false);
    });
  }, [user]);

  const load = async () => {
    const { data } = await supabase.from("guide_sections").select("*").order("sort_order");
    if (data) setSections(data as any);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const handleSave = async () => {
    if (!editing?.title || !editing?.content) return;
    setSaving(true);
    try {
      if ((editing as GuideSection).id) {
        const { id, ...rest } = editing as GuideSection;
        await supabase.from("guide_sections").update(rest).eq("id", id);
        toast({ title: "Section updated" });
      } else {
        await supabase.from("guide_sections").insert({ ...editing, sort_order: sections.length } as any);
        toast({ title: "Section added" });
      }
      setDialogOpen(false);
      setEditing(null);
      load();
    } catch { toast({ title: "Error", variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this guide section?")) return;
    await supabase.from("guide_sections").delete().eq("id", id);
    toast({ title: "Section deleted" });
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("guide_sections").update({ is_active: active }).eq("id", id);
    load();
  };

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 max-w-md mx-auto mt-20"><Card className="glass-card border-gold"><CardContent className="p-8 text-center"><Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" /><h1 className="font-display text-3xl text-gradient-gold mb-2">ADMIN ACCESS</h1></CardContent></Card></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-display text-3xl text-gradient-gold">GUIDE EDITOR</h1>
              <p className="text-muted-foreground text-sm">{sections.length} sections</p>
            </div>
          </div>
          <Button onClick={() => { setEditing({ title: "", icon: "BookOpen", content: "", is_active: true }); setDialogOpen(true); }} className="bg-gradient-gold text-primary-foreground font-bold">
            <Plus className="h-4 w-4 mr-2" /> Add Section
          </Button>
        </div>

        <div className="grid gap-3">
          {sections.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`glass-card border-gold ${!s.is_active ? "opacity-50" : ""}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.content.slice(0, 100)}...</p>
                  </div>
                  <Switch checked={s.is_active} onCheckedChange={v => toggleActive(s.id, v)} />
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(s); setDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3 w-3" /></Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {sections.length === 0 && (
            <Card className="glass-card border-gold">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h2 className="font-display text-xl text-gradient-gold mb-2">NO GUIDE SECTIONS</h2>
                <p className="text-muted-foreground text-sm">Add sections to build the platform guide.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-gradient-gold">{(editing as GuideSection)?.id ? "Edit Section" : "New Section"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Title</label>
                <Input value={editing?.title || ""} onChange={e => setEditing(ed => ({ ...ed!, title: e.target.value }))} placeholder="Section title" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Icon name (e.g. BookOpen, Brain, Shield)</label>
                <Input value={editing?.icon || ""} onChange={e => setEditing(ed => ({ ...ed!, icon: e.target.value }))} placeholder="BookOpen" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Content (supports **bold** and markdown-like formatting)</label>
                <Textarea value={editing?.content || ""} onChange={e => setEditing(ed => ({ ...ed!, content: e.target.value }))} placeholder="Write guide content here..." rows={12} />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">
                {saving ? "Saving..." : "Save Section"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
