import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Clock, Target, Zap, Brain, BarChart3, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const NDA_TESTS = [
  {
    id: "nda-maths",
    title: "NDA Maths Paper",
    subject: "maths",
    questions: 120,
    time: 150,
    marking: "+2.5 / -0.83",
    desc: "Full NDA Mathematics paper — 120 MCQs, 2.5 hours",
    badge: "NDA Standard",
  },
  {
    id: "nda-gat-english",
    title: "GAT — English Section",
    subject: "english",
    questions: 50,
    time: 50,
    marking: "+4 / -1.33",
    desc: "50 MCQs: grammar, comprehension, vocabulary",
    badge: "GAT",
  },
  {
    id: "nda-gat-science",
    title: "GAT — Science Section",
    subject: "science",
    questions: 50,
    time: 50,
    marking: "+4 / -1.33",
    desc: "50 MCQs: Physics, Chemistry, Biology",
    badge: "GAT",
  },
  {
    id: "nda-gat-gk",
    title: "GAT — General Knowledge",
    subject: "gk",
    questions: 50,
    time: 50,
    marking: "+4 / -1.33",
    desc: "50 MCQs: History, Geography, Economy, Current Affairs",
    badge: "GAT",
  },
  {
    id: "full-gat",
    title: "Full GAT Paper (Combined)",
    subject: "gat",
    questions: 150,
    time: 150,
    marking: "+4 / -1.33",
    desc: "Complete GAT paper — 150 MCQs, 2.5 hours (English + Science + GK)",
    badge: "Full Paper",
  },
];

const QUICK_TESTS = [
  { id: "quick-maths", title: "Quick Maths", subject: "maths", questions: 20, time: 25, desc: "Rapid practice — 20 questions" },
  { id: "quick-english", title: "Quick English", subject: "english", questions: 20, time: 20, desc: "Quick grammar & vocab drill" },
  { id: "quick-gk", title: "Quick GK", subject: "gk", questions: 20, time: 20, desc: "General knowledge sprint" },
  { id: "adaptive", title: "AI Adaptive Test", subject: "mixed", questions: 25, time: 30, desc: "AI adjusts difficulty to your level" },
];

export default function MockTestList() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-accent" />
            <div>
              <h1 className="font-display text-4xl text-gradient-gold">MOCK TESTS</h1>
              <p className="text-muted-foreground text-sm">NDA-standard tests with proper marking scheme</p>
            </div>
          </div>
        </motion.div>

        {/* NDA Standard Tests */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" /> NDA Standard Papers
          </h2>
        </motion.div>

        <div className="grid gap-4">
          {NDA_TESTS.map((test, i) => (
            <motion.div key={test.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
              <Card className="glass-card border-gold hover:scale-[1.01] transition-transform">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold">{test.title}</h3>
                      <Badge className="text-[9px] bg-primary/20 text-primary">{test.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{test.desc}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[10px] font-mono text-primary flex items-center gap-1"><Target className="h-3 w-3" /> {test.questions} Qs</span>
                      <span className="text-[10px] font-mono text-primary flex items-center gap-1"><Clock className="h-3 w-3" /> {test.time} min</span>
                      <span className="text-[10px] font-mono text-destructive flex items-center gap-1"><Zap className="h-3 w-3" /> {test.marking}</span>
                    </div>
                  </div>
                  <Link to={`/tests/take/${test.id}?subject=${test.subject}&questions=${test.questions}&time=${test.time}`}>
                    <Button className="bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                      Start Test
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Practice */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
          <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2 mb-3 mt-4">
            <Brain className="h-5 w-5 text-accent" /> Quick Practice (AI Generated)
          </h2>
        </motion.div>

        <div className="grid gap-3 md:grid-cols-2">
          {QUICK_TESTS.map((test, i) => (
            <motion.div key={test.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 9}>
              <Card className="glass-card border-gold hover:scale-[1.01] transition-transform">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{test.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{test.desc}</p>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-[9px] font-mono text-primary">{test.questions} Qs</span>
                      <span className="text-[9px] font-mono text-primary">{test.time} min</span>
                    </div>
                  </div>
                  <Link to={`/tests/take/${test.id}?subject=${test.subject}&questions=${test.questions}&time=${test.time}`}>
                    <Button size="sm" variant="outline" className="border-gold font-bold">Start</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link to="/daily-challenge">
            <Card className="glass-card border-gold hover:scale-[1.02] transition-transform cursor-pointer">
              <CardContent className="p-4 text-center">
                <Zap className="h-6 w-6 text-warning mx-auto mb-2" />
                <p className="font-bold text-sm">Daily Challenge</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/error-log">
            <Card className="glass-card border-gold hover:scale-[1.02] transition-transform cursor-pointer">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-6 w-6 text-destructive mx-auto mb-2" />
                <p className="font-bold text-sm">Error Log</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
