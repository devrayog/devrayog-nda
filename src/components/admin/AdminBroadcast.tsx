import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Megaphone, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TargetAudience = "all" | "premium" | "free";
type NotifType = "notification" | "announcement" | "warning";

export default function AdminBroadcast() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<TargetAudience>("all");
  const [type, setType] = useState<NotifType>("notification");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Please fill in title and message", variant: "destructive" });
      return;
    }
    if (title.length > 200 || body.length > 1000) {
      toast({ title: "Title max 200 chars, body max 1000 chars", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      // Get all user IDs from profiles
      const { data: profiles, error: profileErr } = await supabase
        .from("profiles")
        .select("user_id");
      if (profileErr) throw profileErr;

      if (!profiles || profiles.length === 0) {
        toast({ title: "No users found" });
        setSending(false);
        return;
      }

      // Build notification rows
      const rows = profiles.map(p => ({
        user_id: p.user_id,
        title: title.trim(),
        message: body.trim(),
        type,
        read: false,
      }));

      // Insert in batches of 500
      for (let i = 0; i < rows.length; i += 500) {
        const batch = rows.slice(i, i + 500);
        const { error } = await supabase.from("notifications").insert(batch);
        if (error) throw error;
      }

      toast({ title: `Broadcast sent to ${profiles.length} users!` });
      setTitle("");
      setBody("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="glass-card border-gold">
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> Broadcast Notification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Message Title</Label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter notification title"
            className="bg-card border-gold"
            maxLength={200}
          />
        </div>
        <div>
          <Label className="text-xs">Message Body</Label>
          <Textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Enter notification message"
            className="bg-card border-gold min-h-[80px]"
            maxLength={1000}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Send To</Label>
            <Select value={target} onValueChange={v => setTarget(v as TargetAudience)}>
              <SelectTrigger className="border-gold"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
                <SelectItem value="free">Free Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={v => setType(v as NotifType)}>
              <SelectTrigger className="border-gold"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="notification">Notification</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider"
        >
          <Send className="h-4 w-4 mr-2" /> {sending ? "Sending..." : "📢 Send Broadcast"}
        </Button>
      </CardContent>
    </Card>
  );
}
