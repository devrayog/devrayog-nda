import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { FileText, Clock, Target, Zap, Brain, BarChart3, Shield, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PremiumButton } from "@/components/PremiumGate";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const NDA_TESTS = [
  { id: "nda-maths", title: "NDA Maths Paper", subject: "maths", questions: 120, time: 150, marking: "+2.5 / -0.83", desc: "Full NDA Mathematics paper — 120 MCQs, 2.5 hours", badge: "NDA Standard" },
  { id: "nda-gat-english", title: "GAT — English Section", subject: "english", questions: 50, time: 50, marking: "+4 / -1.33", desc: "50 MCQs: grammar, comprehension, vocabulary", badge: "GAT" },
  { id: "nda-gat-science", title: "GAT — Science Section", subject: "science", questions: 50, time: 50, marking: "+4 / -1.33", desc: "50 MCQs: Physics, Chemistry, Biology", badge: "GAT" },
  { id: "nda-gat-gk", title: "GAT — General Knowledge", subject: "gk", questions: 50, time: 50, marking: "+4 / -1.33", desc: "50 MCQs: History, Geography, Economy, Current Affairs", badge: "GAT" },
  { id: "full-gat", title: "Full GAT Paper (Combined)", subject: "gat", questions: 150, time: 150, marking: "+4 / -1.33", desc: "Complete GAT paper — 150 MCQs, 2.5 hours", badge: "Full Paper" },
];

const AI_TESTS = [
  { id: "quick-maths", title: "AI Maths Test", subject: "maths", questions: 20, time: 25, desc: "AI generates Maths questions based on your weak areas" },
  { id: "quick-english", title: "AI English Test", subject: "english", questions: 20, time: 20, desc: "AI-generated grammar & vocab drill" },
  { id: "quick-gk", title: "AI GK Test", subject: "gk", questions: 20, time: 20, desc: "AI-generated General Knowledge sprint" },
  { id: "adaptive", title: "AI Adaptive Test", subject: "mixed", questions: 25, time: 30, desc: "AI adjusts difficulty to your level" },
];

interface AdminTest { id: string; title: string; body: string; category: string; link: string; }

export default function MockTestList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adminTests, setAdminTests] = useState<AdminTest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "maths", link: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("resources").select("*").eq("type", "mock_test").eq("is_active", true).order("sort_order")
      .then(({ data }) => setAdminTests((data as AdminTest[]) || []));
    if (user) {
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
        .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); });
    }
  }, [user]);

  const addTest = async () => {
    if (!form.title) return;
    setSaving(true);
    const { error } = await supabase.from("resources").insert({ title: form.title, body: form.body, category: form.category, link: form.link, type: "mock_test", sort_order: adminTests.length });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Mock test added!" });
      setShowAdd(false); setForm({ title: "", body: "", category: "maths", link: "" });
      const { data } = await supabase.from("resources").select("*").eq("type", "mock_test").eq("is_active", true).order("sort_order");
      setAdminTests((data as AdminTest[]) || []);
    }
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <h1 className="font-display text-4xl text-gradient-gold">MOCK TESTS</h1>
                <p className="text-muted-foreground text-sm">NDA-standard tests with proper marking scheme</p>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowAdd(true)} size="sm" className="bg-gradient-gold text-primary-foreground font-bold">
                <Plus className="h-4 w-4 mr-1" /> Add Mock Test
              </Button>
            )}
          </div>
        </motion.div>

        <Tabs defaultValue="nda">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="nda">📝 NDA Standard</TabsTrigger>
            <TabsTrigger value="admin">🎯 Admin Mock Sets</TabsTrigger>
            <TabsTrigger value="ai">🤖 AI Generated</TabsTrigger>
          </TabsList>

          {/* NDA Standard */}
          <TabsContent value="nda" className="space-y-4 mt-4">
            <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> NDA Standard Papers</h2>
            {NDA_TESTS.map((test, i) => (
              <motion.div key={test.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center"><FileText className="h-6 w-6 text-primary-foreground" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5"><h3 className="font-bold">{test.title}</h3><Badge className="text-[9px] bg-primary/20 text-primary">{test.badge}</Badge></div>
                      <p className="text-xs text-muted-foreground">{test.desc}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[10px] font-mono text-primary flex items-center gap-1"><Target className="h-3 w-3" /> {test.questions} Qs</span>
                        <span className="text-[10px] font-mono text-primary flex items-center gap-1"><Clock className="h-3 w-3" /> {test.time} min</span>
                        <span className="text-[10px] font-mono text-destructive flex items-center gap-1"><Zap className="h-3 w-3" /> {test.marking}</span>
                      </div>
                    </div>
                    <PremiumButton onClick={() => window.location.href = `/tests/take/${test.id}?subject=${test.subject}&questions=${test.questions}&time=${test.time}`} feature="NDA Standard Mock Test" className="bg-gradient-gold text-primary-foreground font-bold tracking-wider">Start Test</PremiumButton>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Admin Mock Sets */}
          <TabsContent value="admin" className="space-y-4 mt-4">
            <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2"><FileText className="h-5 w-5 text-accent" /> Admin-Added Mock Tests</h2>
            {adminTests.length === 0 && <p className="text-center text-muted-foreground py-8">No admin mock tests yet.</p>}
            {adminTests.map((test, i) => (
              <motion.div key={test.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{test.title}</h3>
                      <p className="text-xs text-muted-foreground">{test.body}</p>
                      <Badge variant="outline" className="text-[9px] mt-1">{test.category}</Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link to={`/tests/take/admin-${test.id}?subject=${test.category}&questions=50&time=60`}>
                        <Button size="sm" className="bg-gradient-gold text-primary-foreground font-bold w-full">Start</Button>
                      </Link>
                      {isAdmin && (
                        <Link to={`/admin/mock-questions/${test.id}`}>
                          <Button size="sm" variant="outline" className="border-gold text-xs w-full">
                            <Plus className="h-3 w-3 mr-1" /> Questions
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* AI Generated */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> AI Generated Tests</h2>
            <p className="text-xs text-muted-foreground">These tests are dynamically generated by AI based on your weak areas.</p>
            <div className="grid gap-3 md:grid-cols-2">
              {AI_TESTS.map((test, i) => (
                <motion.div key={test.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                  <Card className="glass-card border-gold hover:scale-[1.01] transition-transform">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center"><Brain className="h-5 w-5 text-accent" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><h3 className="font-bold text-sm">{test.title}</h3><Badge className="text-[8px] bg-accent/20 text-accent">AI</Badge></div>
                        <p className="text-[10px] text-muted-foreground">{test.desc}</p>
                        <div className="flex gap-3 mt-0.5"><span className="text-[9px] font-mono text-primary">{test.questions} Qs</span><span className="text-[9px] font-mono text-primary">{test.time} min</span></div>
                      </div>
                      <Link to={`/tests/take/${test.id}?subject=${test.subject}&questions=${test.questions}&time=${test.time}`}>
                        <Button size="sm" variant="outline" className="border-gold font-bold">Start</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link to="/daily-challenge"><Card className="glass-card border-gold hover:scale-[1.02] transition-transform cursor-pointer"><CardContent className="p-4 text-center"><Zap className="h-6 w-6 text-warning mx-auto mb-2" /><p className="font-bold text-sm">Daily Challenge</p></CardContent></Card></Link>
          <Link to="/error-log"><Card className="glass-card border-gold hover:scale-[1.02] transition-transform cursor-pointer"><CardContent className="p-4 text-center"><BarChart3 className="h-6 w-6 text-destructive mx-auto mb-2" /><p className="font-bold text-sm">Error Log</p></CardContent></Card></Link>
        </div>

        {/* Add Mock Test Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Admin Mock Test</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Maths Mock Test 1" /></div>
              <div><Label className="text-xs">Description</Label><Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="50 questions, NDA standard" /></div>
              <div><Label className="text-xs">Subject</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="maths">Maths</SelectItem><SelectItem value="english">English</SelectItem><SelectItem value="gat">GAT</SelectItem><SelectItem value="science">Science</SelectItem><SelectItem value="gk">GK</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addTest} disabled={saving} className="bg-gradient-gold text-primary-foreground font-bold">{saving ? "Saving..." : "Add Test"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
