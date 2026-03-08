import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, Trash2, Paperclip, X, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string | null;
  subject: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function Notes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false })
      .then(({ data }) => { if (data) setNotes(data as Note[]); });
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/notes/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("ai-uploads").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("ai-uploads").getPublicUrl(data.path);
      setAttachedFile({ url: urlData.publicUrl, name: file.name });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = async () => {
    if (!title.trim() || !user) return;
    const noteContent = attachedFile
      ? `${content}\n\n📎 Attachment: [${attachedFile.name}](${attachedFile.url})`
      : content;

    if (editing) {
      await supabase.from("notes").update({ title, content: noteContent }).eq("id", editing);
      setNotes(prev => prev.map(n => n.id === editing ? { ...n, title, content: noteContent } : n));
      setEditing(null);
    } else {
      const { data } = await supabase.from("notes").insert({ user_id: user.id, title, content: noteContent }).select().single();
      if (data) setNotes(prev => [data as Note, ...prev]);
    }
    setTitle("");
    setContent("");
    setAttachedFile(null);
    toast({ title: "Note saved!" });
  };

  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const extractAttachment = (content: string | null) => {
    if (!content) return null;
    const match = content.match(/📎 Attachment: \[(.+?)\]\((.+?)\)/);
    return match ? { name: match[1], url: match[2] } : null;
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

            {/* File attachment */}
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
            {attachedFile ? (
              <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-xs">
                <Paperclip className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setAttachedFile(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="border-gold"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                {uploading ? "Uploading..." : "Attach File"}
              </Button>
              <Button onClick={save} disabled={!title.trim()} className="bg-gradient-gold text-primary-foreground font-bold flex-1">
                <Plus className="h-4 w-4 mr-2" /> {editing ? "Update" : "Save"} Note
              </Button>
            </div>
          </CardContent>
        </Card>

        {notes.map(n => {
          const attachment = extractAttachment(n.content);
          return (
            <Card key={n.id} className="glass-card border-gold">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => { setTitle(n.title); setContent(n.content?.replace(/\n\n📎 Attachment:.*$/, "") || ""); setEditing(n.id); }}>
                    <h3 className="font-bold text-sm">{n.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.content?.replace(/\n\n📎 Attachment:.*$/, "")}</p>
                    {attachment && (
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline" onClick={e => e.stopPropagation()}>
                        <Download className="h-3 w-3" /> {attachment.name}
                      </a>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteNote(n.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
