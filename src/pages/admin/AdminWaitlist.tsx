import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Search, Lock, Phone, Mail, MapPin, User, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  from_location: string;
  current_attempt: string;
  target_exam: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminWaitlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); setChecking(false); });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    loadEntries();
  }, [isAdmin]);

  const loadEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load waitlist", description: error.message, variant: "destructive" });
    } else {
      setEntries((data as WaitlistEntry[]) || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("waitlist").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Status updated to ${newStatus}` });
      setEntries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    }
  };

  const filtered = entries.filter(e =>
    !search ||
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.phone?.includes(search) ||
    e.whatsapp?.includes(search) ||
    e.location?.toLowerCase().includes(search.toLowerCase()) ||
    e.from_location?.toLowerCase().includes(search.toLowerCase()) ||
    e.current_attempt?.toLowerCase().includes(search.toLowerCase()) ||
    e.target_exam?.toLowerCase().includes(search.toLowerCase())
  );

  if (checking) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-md mx-auto mt-20">
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <h1 className="font-display text-3xl text-gradient-gold mb-2">ADMIN ACCESS</h1>
              <p className="text-muted-foreground text-sm">You need admin privileges to access this panel.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-warning/20 text-warning",
    contacted: "bg-cyan/20 text-cyan",
    approved: "bg-success/20 text-success",
    rejected: "bg-destructive/20 text-destructive",
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-7 w-7 text-primary" />
            <h1 className="font-display text-3xl text-gradient-gold">WAITLIST</h1>
          </div>
          <Badge className="text-xs">{entries.length} entries</Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, location, attempt, target exam..."
            className="pl-10"
          />
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-muted-foreground text-sm">No waitlist entries found.</p>
        )}

        <div className="space-y-3">
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              <Card className="glass-card border-gold">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm">{entry.name}</span>
                    </div>
                    <Badge className={`text-[10px] ${statusColors[entry.status] || "bg-muted text-muted-foreground"}`}>
                      {entry.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{entry.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{entry.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-success" />
                      <span className="text-muted-foreground">WA: {entry.whatsapp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{entry.location} (from {entry.from_location})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Attempt: {entry.current_attempt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Target: {entry.target_exam}</span>
                    </div>
                  </div>

                  {entry.notes && (
                    <p className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded">{entry.notes}</p>
                  )}

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      Joined {new Date(entry.created_at).toLocaleDateString()} at {new Date(entry.created_at).toLocaleTimeString()}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => updateStatus(entry.id, "contacted")}>Contacted</Button>
                      <Button size="sm" variant="default" className="text-[10px] h-7 bg-success text-success-foreground" onClick={() => updateStatus(entry.id, "approved")}>Approved</Button>
                      <Button size="sm" variant="destructive" className="text-[10px] h-7" onClick={() => updateStatus(entry.id, "rejected")}>Reject</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
