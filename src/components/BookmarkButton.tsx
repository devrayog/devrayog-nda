import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BookmarkButtonProps {
  itemId: string;
  itemType: string;
  title: string;
  metadata?: Record<string, any>;
  size?: "sm" | "icon";
}

export default function BookmarkButton({ itemId, itemType, title, metadata, size = "sm" }: BookmarkButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user) return;
    setLoading(true);
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("item_id", itemId).eq("item_type", itemType);
      setBookmarked(false);
      toast({ title: "Bookmark removed" });
    } else {
      await supabase.from("bookmarks").insert({
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        title,
        metadata: metadata as any || {},
      });
      setBookmarked(true);
      toast({ title: "Bookmarked! ⭐" });
    }
    setLoading(false);
  };

  return (
    <Button
      size={size}
      variant="ghost"
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      disabled={loading}
      title={bookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    </Button>
  );
}
