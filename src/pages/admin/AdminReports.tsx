import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lock, AlertTriangle, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Report {
  id: string;
  user_id: string;
  question_text: string;
  options: any;
  correct_answer: string;
  user_answer: string;
  explanation: string;
  source: string;
  issue_type: string;
  issue_description: string;
  status: string;
  admin_notes: string;
  created_at: string;
}

export default function AdminReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("pending");

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
      if (data && data.length > 0) setIsAdmin(true);
      setChecking(false);
    });
  }, [user]);

  const load = async () => {
    const { data } = await supabase.from("question_reports").select("*").order("created_at", { ascending: false });
    if (data) setReports(data as any);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const updateReport = async () => {
    if (!selected) return;
    await supabase.from("question_reports").update({ status: statusUpdate, admin_notes: adminNotes }).eq("id", selected.id);
    toast({ title: "Report updated" });
    setSelected(null);
    load();
  };

  if (checking) return <DashboardLayout><div className="p-6 flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 max-w-md mx-auto mt-20"><Card className="glass-card border-gold"><CardContent className="p-8 text-center"><Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" /><h1 className="font-display text-3xl text-gradient-gold mb-2">ADMIN ACCESS</h1></CardContent></Card></div></DashboardLayout>;

  const statusIcon = (s: string) => s === "resolved" ? <CheckCircle className="h-4 w-4 text-success" /> : s === "reviewing" ? <Clock className="h-4 w-4 text-warning" /> : <AlertTriangle className="h-4 w-4 text-destructive" />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-warning" />
          <div>
            <h1 className="font-display text-3xl text-gradient-gold">QUESTION REPORTS</h1>
            <p className="text-muted-foreground text-sm">{reports.length} report{reports.length !== 1 ? "s" : ""} from users</p>
          </div>
        </div>

        <div className="grid gap-3">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="glass-card border-gold cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => { setSelected(r); setAdminNotes(r.admin_notes || ""); setStatusUpdate(r.status); }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {statusIcon(r.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1 line-clamp-2">{r.question_text}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px]">{r.issue_type}</Badge>
                        <Badge variant="outline" className="text-[9px]">{r.source}</Badge>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                          r.status === "resolved" ? "bg-success/20 text-success" :
                          r.status === "reviewing" ? "bg-warning/20 text-warning" :
                          "bg-destructive/20 text-destructive"
                        }`}>{r.status}</span>
                        <span className="text-[9px] text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.issue_description && <p className="text-xs text-muted-foreground mt-1">"{r.issue_description}"</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {reports.length === 0 && (
            <Card className="glass-card border-gold">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h2 className="font-display text-xl text-gradient-gold mb-2">NO REPORTS</h2>
                <p className="text-muted-foreground text-sm">No question reports from users yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-gradient-gold">Report Details</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-bold">Question</label>
                  <p className="text-sm bg-muted/50 p-3 rounded">{selected.question_text}</p>
                </div>
                {selected.options && Object.keys(selected.options).length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground font-bold">Options</label>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(selected.options).map(([k, v]) => (
                        <span key={k} className={`px-2 py-1 rounded ${k === selected.correct_answer ? "bg-success/20 text-success font-bold" : k === selected.user_answer ? "bg-destructive/20 text-destructive" : "text-muted-foreground"}`}>
                          {k.toUpperCase()}: {v as string}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selected.explanation && (
                  <div>
                    <label className="text-xs text-muted-foreground font-bold">Given Explanation</label>
                    <p className="text-xs bg-muted/50 p-2 rounded">{selected.explanation}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground font-bold">User's Issue</label>
                  <p className="text-sm bg-warning/10 p-3 rounded border border-warning/20">{selected.issue_description || "No description"}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold">Status</label>
                  <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold">Admin Notes</label>
                  <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add notes about this report..." rows={3} />
                </div>
                <Button onClick={updateReport} className="w-full bg-gradient-gold text-primary-foreground font-bold">Update Report</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
