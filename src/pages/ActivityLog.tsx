import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Clock, FileText, Brain, BookOpen, MessageSquare, Target, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const actionIcons: Record<string, React.ElementType> = {
  page_visit: Clock,
  test_complete: FileText,
  test_start: Target,
  ai_chat: MessageSquare,
  note_created: BookOpen,
  bookmark_added: BookOpen,
  study: Brain,
};

const actionColors: Record<string, string> = {
  page_visit: "bg-muted text-muted-foreground",
  test_complete: "bg-primary/20 text-primary",
  test_start: "bg-accent/20 text-accent",
  ai_chat: "bg-primary/20 text-primary",
  note_created: "bg-success/20 text-success",
  bookmark_added: "bg-warning/20 text-warning",
  study: "bg-primary/20 text-primary",
};

export default function ActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    let query = supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (filter !== "all") {
      query = query.eq("action_type", filter);
    }

    query.then(({ data }) => {
      setActivities(data || []);
      setLoading(false);
    });
  }, [user, filter]);

  // Group by date
  const grouped = activities.reduce<Record<string, any[]>>((acc, a) => {
    const day = new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    (acc[day] = acc[day] || []).push(a);
    return acc;
  }, {});

  const totalTime = activities
    .filter((a) => a.duration_seconds)
    .reduce((sum, a) => sum + (a.duration_seconds || 0), 0);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-accent" />
            <div>
              <h1 className="font-display text-3xl text-gradient-gold">Activity Log</h1>
              <p className="text-xs text-muted-foreground font-mono tracking-wider">
                {activities.length} activities • {Math.round(totalTime / 60)} min total
              </p>
            </div>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44 bg-card border-border">
              <Filter className="h-3 w-3 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity</SelectItem>
              <SelectItem value="page_visit">Page Visits</SelectItem>
              <SelectItem value="test_complete">Tests</SelectItem>
              <SelectItem value="ai_chat">AI Chats</SelectItem>
              <SelectItem value="note_created">Notes</SelectItem>
              <SelectItem value="bookmark_added">Bookmarks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && activities.length === 0 && (
          <Card className="glass-card border-border">
            <CardContent className="p-8 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No activity logged yet. Start studying!</p>
            </CardContent>
          </Card>
        )}

        {/* Grouped by date */}
        {Object.entries(grouped).map(([date, items], gi) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.05 }}
          >
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2">{date}</p>
            <div className="space-y-2">
              {items.map((a: any, i: number) => {
                const Icon = actionIcons[a.action_type] || Clock;
                const colorClass = actionColors[a.action_type] || "bg-muted text-muted-foreground";
                return (
                  <Card key={i} className="glass-card border-border">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate capitalize">
                          {a.action_type.replace(/_/g, " ")}
                          {a.page && <span className="text-muted-foreground font-normal"> — {a.page}</span>}
                        </p>
                        {a.topic && <p className="text-[10px] text-muted-foreground truncate">{a.topic}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        {a.duration_seconds && a.duration_seconds > 0 && (
                          <Badge variant="secondary" className="text-[10px] mb-0.5">
                            {a.duration_seconds >= 60 ? `${Math.round(a.duration_seconds / 60)}m` : `${a.duration_seconds}s`}
                          </Badge>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(a.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
