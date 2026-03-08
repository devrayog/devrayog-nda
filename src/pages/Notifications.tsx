import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  created_at: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setNotifs(data as Notification[]); });
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">NOTIFICATIONS</h1>
        </div>

        {notifs.length === 0 && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Bell className="h-10 w-10 text-primary/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No notifications yet. Keep studying and AI will send you personalized alerts!</p>
            </CardContent>
          </Card>
        )}

        {notifs.map(n => (
          <Card key={n.id} className={`glass-card ${n.read ? "border-gold opacity-60" : "border-primary"}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${n.read ? "bg-muted" : "bg-primary"}`} />
              <div className="flex-1">
                <p className="font-bold text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.read && (
                <Button size="sm" variant="ghost" onClick={() => markRead(n.id)} className="text-xs">
                  <Check className="h-3 w-3 mr-1" /> Read
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
