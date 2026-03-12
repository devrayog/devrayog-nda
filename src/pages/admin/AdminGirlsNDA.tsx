import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus, Trash2, Save, Lock, Pencil, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUploadButton from "@/components/ImageUploadButton";

interface GirlsContent {
  id: string; type: string; title: string; body: string; image_url: string | null;
  link: string; icon: string; sort_order: number; is_active: boolean;
}

const emptyItem: Partial<GirlsContent> = {
  type: "card", title: "", body: "", image_url: null, link: "", icon: "Heart", sort_order: 0, is_active: true,
};

export default function AdminGirlsNDA() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState<GirlsContent[]>([]);
  const [editing, setEditing] = useState<Partial<GirlsContent> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => { setIsAdmin(!!(data && data.length > 0)); setChecking(false); });
  }, [user]);

  const load = async () => {
    const { data } = await supabase.from("girls_nda_content").select("*").order("sort_order") as any;
    setItems(data || []);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const handleSave = async () => {
    if (!editing?.title) return;
    setSaving(true);
    try {
      if ((editing as GirlsContent).id) {
        const { id, ...rest } = editing as GirlsContent;
        await supabase.from("girls_nda_content").update(rest as any).eq("id", id);
        toast({ title: "Updated!" });
      } else {
        await supabase.from("girls_nda_content").insert({ ...editing, sort_order: items.length } as any);
        toast({ title: "Added!" });
      }
      setDialogOpen(false); setEditing(null); load();
    } catch { toast({ title: "Error", variant: "destructive" }); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this?")) return;
    await supabase.from("girls_nda_content").delete().eq("id", id);
    toast({ title: "Deleted" }); load();
  };

  if (checking) return <DashboardLayout><div className="p-6 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 max-w-md mx-auto mt-20"><Card className="glass-card border-gold"><CardContent className="p-8 text-center"><Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" /><h1 className="font-display text-3xl text-gradient-gold">ADMIN ONLY</h1></CardContent></Card></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-pink-400" />
            <h1 className="font-display text-3xl text-gradient-gold">GIRLS NDA EDITOR</h1>
          </div>
          <Button onClick={() => { setEditing({ ...emptyItem, sort_order: items.length }); setDialogOpen(true); }} className="bg-gradient-gold text-primary-foreground font-bold">
            <Plus className="h-4 w-4 mr-2" /> Add Content
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">Manage cards, hero sections, facts, and links shown on the Girls NDA page. Types: <strong>hero</strong> (banner), <strong>card</strong> (navigation card), <strong>fact</strong> (key fact), <strong>quote</strong> (motivational quote).</p>

        <div className="grid gap-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="glass-card border-gold">
                <CardContent className="p-4 flex items-start gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                  {item.image_url && <img src={item.image_url} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        item.type === "hero" ? "bg-pink-500/20 text-pink-400" :
                        item.type === "fact" ? "bg-warning/20 text-warning" :
                        item.type === "quote" ? "bg-accent/20 text-accent" :
                        "bg-primary/20 text-primary"
                      }`}>{item.type}</span>
                      {!item.is_active && <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Hidden</span>}
                    </div>
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    {item.body && <p className="text-xs text-muted-foreground line-clamp-2">{item.body}</p>}
                    {item.link && <p className="text-[10px] text-primary truncate">{item.link}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(item); setDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {items.length === 0 && (
            <Card className="glass-card border-gold"><CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-pink-400/30 mx-auto mb-4" />
              <h2 className="font-display text-xl text-gradient-gold mb-2">NO CONTENT YET</h2>
              <p className="text-muted-foreground text-sm">Add cards, facts, and sections for the Girls NDA page.</p>
            </CardContent></Card>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-gradient-gold">{(editing as GirlsContent)?.id ? "Edit Content" : "New Content"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Type</label>
                <Select value={editing?.type || "card"} onValueChange={v => setEditing(e => ({ ...e!, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero Banner</SelectItem>
                    <SelectItem value="card">Navigation Card</SelectItem>
                    <SelectItem value="fact">Key Fact</SelectItem>
                    <SelectItem value="quote">Motivational Quote</SelectItem>
                    <SelectItem value="section">Content Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Title</label>
                <Input value={editing?.title || ""} onChange={e => setEditing(ed => ({ ...ed!, title: e.target.value }))} placeholder="Title" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Body / Description</label>
                <Textarea value={editing?.body || ""} onChange={e => setEditing(ed => ({ ...ed!, body: e.target.value }))} placeholder="Content body..." rows={4} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Image</label>
                <div className="mt-1">
                  <ImageUploadButton value={editing?.image_url} onChange={url => setEditing(e => ({ ...e!, image_url: url }))} folder="girls-nda" />
                </div>
                <Input value={editing?.image_url || ""} onChange={e => setEditing(ed => ({ ...ed!, image_url: e.target.value }))} placeholder="Or paste image URL" className="mt-2 text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Link (optional)</label>
                <Input value={editing?.link || ""} onChange={e => setEditing(ed => ({ ...ed!, link: e.target.value }))} placeholder="/study-plan or https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Icon Name</label>
                  <Input value={editing?.icon || ""} onChange={e => setEditing(ed => ({ ...ed!, icon: e.target.value }))} placeholder="Heart, Shield, Trophy..." />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sort Order</label>
                  <Input type="number" value={editing?.sort_order || 0} onChange={e => setEditing(ed => ({ ...ed!, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-gold text-primary-foreground font-bold">
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
