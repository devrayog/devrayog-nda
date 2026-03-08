import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Brain, MessageSquare, Eye, Pencil, AlertTriangle, UserCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense, lazy } from "react";

const FloatingBadge = lazy(() => import("@/components/3d/FloatingBadge"));

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const SSB_SECTIONS = [
  { href: "/ssb/oir", icon: Brain, title: "OIR Practice", desc: "Officer Intelligence Rating verbal & non-verbal", color: "text-primary", day: "Screening" },
  { href: "/ssb/ppdt", icon: Eye, title: "PPDT Practice", desc: "Picture Perception & Discussion Test", color: "text-accent", day: "Screening" },
  { href: "/ssb/tat", icon: Pencil, title: "TAT Practice", desc: "Thematic Apperception Test — story writing", color: "text-cyan", day: "Day 2" },
  { href: "/ssb/wat", icon: MessageSquare, title: "WAT Practice", desc: "Word Association Test — 15 sec per word", color: "text-success", day: "Day 2" },
  { href: "/ssb/srt", icon: AlertTriangle, title: "SRT Practice", desc: "Situation Reaction Test — practical responses", color: "text-warning", day: "Day 2" },
  { href: "/ssb/sdt", icon: UserCheck, title: "SDT Practice", desc: "Self Description Test — know yourself", color: "text-primary", day: "Day 2" },
  { href: "/ssb/interview", icon: MessageSquare, title: "Mock Interview", desc: "AI conducts SSB-style personal interview", color: "text-accent", day: "Day 4" },
  { href: "/ssb/gd", icon: MessageSquare, title: "Mock GD", desc: "AI-simulated Group Discussion", color: "text-cyan", day: "Day 3" },
  { href: "/ssb/personality", icon: UserCheck, title: "Personality Tips", desc: "OLQs, body language, communication", color: "text-success", day: "Tips" },
  { href: "/ssb/screenout", icon: AlertTriangle, title: "Screen-out Analysis", desc: "Why people fail — real experience", color: "text-destructive", day: "Analysis" },
];

export default function SSBOverview() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Hero with 3D */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1579912009826-c0570be40a1f?w=800&q=60"
              alt="SSB"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
            <div className="relative z-10 flex items-center gap-6">
              <Suspense fallback={<div className="w-32 h-32" />}>
                <FloatingBadge className="w-32 h-32 hidden md:block" />
              </Suspense>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-8 w-8 text-accent" />
                  <h1 className="font-display text-4xl text-gradient-gold">SSB PREPARATION</h1>
                </div>
                <p className="text-muted-foreground text-sm max-w-lg">
                  Complete SSB interview preparation — from screening to conference. AI-powered practice for every stage.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 5-Day Process */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-gold">
            <CardContent className="p-6">
              <h2 className="font-display text-xl text-gradient-gold mb-4">SSB PROCESS — 5 DAYS</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { day: "Day 1", label: "Screening", sub: "OIR + PPDT", color: "from-primary/20 to-primary/5" },
                  { day: "Day 2", label: "Psychology", sub: "TAT, WAT, SRT, SDT", color: "from-accent/20 to-accent/5" },
                  { day: "Day 3", label: "GTO-1", sub: "GD, GPE, PGT", color: "from-cyan/20 to-cyan/5" },
                  { day: "Day 4", label: "GTO-2 + Interview", sub: "Lecturette, Command Task", color: "from-success/20 to-success/5" },
                  { day: "Day 5", label: "Conference", sub: "Final Board", color: "from-warning/20 to-warning/5" },
                ].map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`p-3 rounded-xl bg-gradient-to-b ${d.color} text-center border border-border`}
                  >
                    <p className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">{d.day}</p>
                    <p className="font-display text-sm mt-1">{d.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{d.sub}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SSB Sections */}
        <div className="grid gap-3">
          {SSB_SECTIONS.map((section, i) => (
            <motion.div key={section.href} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
              <Link to={section.href}>
                <Card className="glass-card border-gold hover:scale-[1.01] hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-background to-muted group-hover:scale-110 transition-transform`}>
                      <section.icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm">{section.title}</h3>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-primary/10 text-primary tracking-wider">{section.day}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{section.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
