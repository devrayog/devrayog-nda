import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserCheck, Star, Search, Phone, Plus, Trash2, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_NUMBER = "918233801406";

interface Mentor {
  id: string;
  title: string;
  body: string;
  category: string;
  link: string;
  image_url: string | null;
}

export default function MentorConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "", category: "", link: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("resources").select("*").eq("type", "mentor").eq("is_active", true).order("sort_order")
      .then(({ data }) => setMentors((data as Mentor[]) || []));
    if (user) {
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
        .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); });
    }
  }, [user]);

  const filtered = mentors.filter(m =>
    !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.body.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleBook = (mentor: Mentor) => {
    const text = encodeURIComponent(`Hi, I am an NDA aspirant and would like to book a mentorship session with ${mentor.title} (${mentor.category}). Please help me connect.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  const saveMentor = async () => {
    if (!form.title || !form.body) return;
    setSaving(true);
    if (editId) {
      await supabase.from("resources").update({ title: form.title, body: form.body, category: form.category, link: form.link }).eq("id", editId);
      toast({ title: "Mentor updated!" });
    } else {
      await supabase.from("resources").insert({ title: form.title, body: form.body, category: form.category, link: form.link, type: "mentor", sort_order: mentors.length });
      toast({ title: "Mentor added!" });
    }
    setShowForm(false); setEditId(null); setForm({ title: "", body: "", category: "", link: "" });
    const { data } = await supabase.from("resources").select("*").eq("type", "mentor").eq("is_active", true).order("sort_order");
    setMentors((data as Mentor[]) || []);
    setSaving(false);
  };

  const deleteMentor = async (id: string) => {
    await supabase.from("resources").update({ is_active: false }).eq("id", id);
    setMentors(prev => prev.filter(m => m.id !== id));
    toast({ title: "Mentor removed" });
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-gradient-gold">MENTOR CONNECT</h1>
          </div>
          {isAdmin && (
            <Button onClick={() => { setEditId(null); setForm({ title: "", body: "", category: "", link: "" }); setShowForm(true); }} size="sm" className="bg-gradient-gold text-primary-foreground font-bold">
              <Plus className="h-4 w-4 mr-1" /> Add Mentor
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-sm">Connect with NDA-cleared officers for guidance. Book a session via WhatsApp.</p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, branch, or expertise..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>

        {filtered.length === 0 && (
          <Card className="glass-card border-gold"><CardContent className="p-8 text-center">
            <UserCheck className="h-12 w-12 text-primary/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No mentors added yet. Admin will add mentors soon!</p>
          </CardContent></Card>
        )}

        <div className="grid gap-3">
          {filtered.map((mentor, i) => (
            <motion.div key={mentor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-gold hover:border-primary/50 transition-colors relative">
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setForm({ title: mentor.title, body: mentor.body, category: mentor.category, link: mentor.link }); setEditId(mentor.id); setShowForm(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => deleteMentor(mentor.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <CardContent className="p-4 flex items-start gap-4">
                  <span className="text-3xl">🎖️</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm">{mentor.title}</h3>
                      <Badge variant="outline" className="text-[9px]">{mentor.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{mentor.body}</p>
                    {mentor.link && <p className="text-[10px] text-primary mt-1">{mentor.link}</p>}
                    <Button size="sm" className="mt-3 bg-success/20 text-success hover:bg-success/30 font-bold" onClick={() => handleBook(mentor)}>
                      <Phone className="h-3 w-3 mr-1" /> Book via WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "Add"} Mentor</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Name</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label className="text-xs">Bio / Expertise</Label><Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} /></div>
              <div><Label className="text-xs">Branch / Batch</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Army, NDA 148" /></div>
              <div><Label className="text-xs">Expertise Tags (optional)</Label><Input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="SSB, Maths, Fitness" /></div>
            </div>
            <DialogFooter>
              <Button onClick={saveMentor} disabled={saving} className="bg-gradient-gold text-primary-foreground font-bold">{saving ? "Saving..." : editId ? "Update" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
