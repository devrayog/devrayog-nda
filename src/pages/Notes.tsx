import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string | null;
  subject: string | null;
  created_at: string;
}

export default function Notes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false })
      .then(({ data }) => { if (data) setNotes(data as Note[]); });
  }, [user]);

  const save = async () => {
    if (!title.trim() || !user) return;
    if (editing) {
      await supabase.from("notes").update({ title, content }).eq("id", editing);
      setNotes(prev => prev.map(n => n.id === editing ? { ...n, title, content } : n));
      setEditing(null);
    } else {
      const { data } = await supabase.from("notes").insert({ user_id: user.id, title, content }).select().single();
      if (data) setNotes(prev => [data as Note, ...prev]);
    }
    setTitle("");
    setContent("");
    toast({ title: "Note saved!" });
  };

  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <StickyNote className="h-8 w-8 text-warning" />
          <h1 className="font-display text-4xl text-gradient-gold">MY NOTES</h1>
        </div>

        <Card className="glass-card border-gold">
          <CardContent className="p-4 space-y-3">
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..." className="bg-card border-gold" />
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note..." className="bg-card border-gold min-h-[100px]" />
            <Button onClick={save} disabled={!title.trim()} className="bg-gradient-gold text-primary-foreground font-bold">
              <Plus className="h-4 w-4 mr-2" /> {editing ? "Update" : "Save"} Note
            </Button>
          </CardContent>
        </Card>

        {notes.map(n => (
          <Card key={n.id} className="glass-card border-gold">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => { setTitle(n.title); setContent(n.content || ""); setEditing(n.id); }}>
                  <h3 className="font-bold text-sm">{n.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteNote(n.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
