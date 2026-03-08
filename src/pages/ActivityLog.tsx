import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_activity").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setActivities(data); });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-accent" />
          <h1 className="font-display text-4xl text-gradient-gold">ACTIVITY LOG</h1>
        </div>

        {activities.length === 0 && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Clock className="h-10 w-10 text-primary/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No activity logged yet. Start studying and your history will appear here!</p>
            </CardContent>
          </Card>
        )}

        {activities.map((a, i) => (
          <Card key={i} className="glass-card border-gold">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{a.action_type} {a.page && `— ${a.page}`}</p>
                {a.topic && <p className="text-[10px] text-muted-foreground">{a.topic}</p>}
              </div>
              <span className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
