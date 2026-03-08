import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("bookmarks").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setBookmarks(data); });
  }, [user]);

  const remove = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">BOOKMARKS</h1>
        </div>

        {bookmarks.length === 0 && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Bookmark className="h-10 w-10 text-primary/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No bookmarks yet. Save questions and topics while studying!</p>
            </CardContent>
          </Card>
        )}

        {bookmarks.map(b => (
          <Card key={b.id} className="glass-card border-gold">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-bold text-sm">{b.title || b.item_type}</p>
                <p className="text-[10px] text-muted-foreground">{b.item_type} • {new Date(b.created_at).toLocaleDateString()}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(b.id)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
