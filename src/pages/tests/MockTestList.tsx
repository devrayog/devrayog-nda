import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Clock, Target, Zap, Brain, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const TESTS = [
  { id: "full-maths", title: "Full Maths Test", subject: "maths", questions: 30, time: 45, desc: "Complete NDA-level Maths paper" },
  { id: "full-gat", title: "Full GAT Test", subject: "gat", questions: 50, time: 60, desc: "Complete General Ability Test" },
  { id: "full-english", title: "Full English Test", subject: "english", questions: 25, time: 30, desc: "NDA English paper simulation" },
  { id: "mixed-quick", title: "Quick Mixed Test", subject: "mixed", questions: 15, time: 15, desc: "Quick test across all subjects" },
  { id: "adaptive", title: "Adaptive Practice", subject: "adaptive", questions: 20, time: 30, desc: "AI adjusts difficulty based on your performance" },
];

export default function MockTestList() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl text-gradient-gold">MOCK TESTS</h1>
          </div>
          <p className="text-muted-foreground text-sm">AI-generated NDA-level tests with timer and negative marking.</p>
        </motion.div>

        <div className="grid gap-4">
          {TESTS.map((test, i) => (
            <motion.div key={test.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <Card className="glass-card border-gold hover:scale-[1.01] transition-transform">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center">
                    {test.subject === "adaptive" ? <Brain className="h-6 w-6 text-primary-foreground" /> : <FileText className="h-6 w-6 text-primary-foreground" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{test.title}</h3>
                    <p className="text-xs text-muted-foreground">{test.desc}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[10px] font-mono text-primary flex items-center gap-1"><Target className="h-3 w-3" /> {test.questions} Qs</span>
                      <span className="text-[10px] font-mono text-primary flex items-center gap-1"><Clock className="h-3 w-3" /> {test.time} min</span>
                      <span className="text-[10px] font-mono text-destructive flex items-center gap-1"><Zap className="h-3 w-3" /> -1/3 marking</span>
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

        <div className="grid grid-cols-2 gap-3">
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
