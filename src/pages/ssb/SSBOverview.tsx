import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Brain, MessageSquare, Eye, Pencil, AlertTriangle, UserCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const SSB_SECTIONS = [
  { href: "/ssb/oir", icon: Brain, title: "OIR Practice", desc: "Officer Intelligence Rating verbal & non-verbal", color: "text-primary" },
  { href: "/ssb/ppdt", icon: Eye, title: "PPDT Practice", desc: "Picture Perception & Discussion Test", color: "text-accent" },
  { href: "/ssb/tat", icon: Pencil, title: "TAT Practice", desc: "Thematic Apperception Test — story writing", color: "text-cyan" },
  { href: "/ssb/wat", icon: MessageSquare, title: "WAT Practice", desc: "Word Association Test — 15 sec per word", color: "text-success" },
  { href: "/ssb/srt", icon: AlertTriangle, title: "SRT Practice", desc: "Situation Reaction Test — practical responses", color: "text-warning" },
  { href: "/ssb/sdt", icon: UserCheck, title: "SDT Practice", desc: "Self Description Test — know yourself", color: "text-primary" },
  { href: "/ssb/interview", icon: MessageSquare, title: "Mock Interview", desc: "AI conducts SSB-style personal interview", color: "text-accent" },
  { href: "/ssb/gd", icon: MessageSquare, title: "Mock GD", desc: "AI-simulated Group Discussion", color: "text-cyan" },
  { href: "/ssb/personality", icon: UserCheck, title: "Personality Tips", desc: "OLQs, body language, communication", color: "text-success" },
  { href: "/ssb/screenout", icon: AlertTriangle, title: "Screen-out Analysis", desc: "Why people fail — real experience", color: "text-destructive" },
];

export default function SSBOverview() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl text-gradient-gold">SSB PREPARATION</h1>
          </div>
          <p className="text-muted-foreground text-sm">Complete SSB interview preparation — from screening to conference. AI-powered practice for every stage.</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-gold bg-gradient-military">
            <CardContent className="p-6">
              <h2 className="font-display text-xl text-gradient-gold mb-3">SSB PROCESS — 5 DAYS</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center">
                {["Day 1: Screening", "Day 2: Psychology", "Day 3: GTO-1", "Day 4: GTO-2 + Interview", "Day 5: Conference"].map((d, i) => (
                  <div key={i} className="p-2 rounded bg-background/50 text-xs font-bold">{d}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-3">
          {SSB_SECTIONS.map((section, i) => (
            <motion.div key={section.href} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
              <Link to={section.href}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{section.title}</h3>
                      <p className="text-xs text-muted-foreground">{section.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
