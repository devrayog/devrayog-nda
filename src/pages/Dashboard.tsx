import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, FileText, Target, Shield, Swords, BarChart3, Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense, lazy } from "react";
import ExamCountdown from "@/components/ExamCountdown";
import DailyMotivation from "@/components/DailyMotivation";

const DNAHelix = lazy(() => import("@/components/3d/DNAHelix"));

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const name = user?.user_metadata?.full_name || "Cadet";
  const attempt = user?.user_metadata?.attempt || "1st";
  const targetExam = user?.user_metadata?.target_exam || "NDA 1 2026";
  const service = user?.user_metadata?.service || "army";

  const quickActions = [
    { icon: Brain, title: t("nav.ai_tutor"), href: "/ai-tutor", color: "text-primary" },
    { icon: FileText, title: "Mock Test", href: "/tests", color: "text-accent" },
    { icon: Target, title: "Study Plan", href: "/study-plan", color: "text-success" },
    { icon: Shield, title: "SSB Prep", href: "/ssb", color: "text-cyan" },
    { icon: Swords, title: "Daily Challenge", href: "/daily-challenge", color: "text-warning" },
    { icon: BarChart3, title: "Current Affairs", href: "/current-affairs", color: "text-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Greeting */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1579912009826-c0570be40a1f?w=800&q=60"
              alt="NDA"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
            <div className="relative z-10">
              <p className="font-mono text-xs text-primary tracking-widest mb-1">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h1 className="font-display text-3xl md:text-4xl text-gradient-gold mb-2">
                {t("dashboard.welcome")}, {name}! 🎖️
              </h1>
              <p className="text-muted-foreground">
                {attempt} attempt • {targetExam} • {service.charAt(0).toUpperCase() + service.slice(1)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Exam Countdown */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-gold">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                    NDA 1 2026 — April 12 • Maths 10:00 AM • GAT 2:00 PM
                  </p>
                </div>
                <div className="flex justify-center">
                  <ExamCountdown />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily AI Motivation */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <DailyMotivation />
        </motion.div>

        <Suspense fallback={null}>
          <DNAHelix className="h-48 w-full hidden md:block" />
        </Suspense>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: BarChart3, label: t("dashboard.dna_score"), value: "42%", color: "text-primary" },
            { icon: Flame, label: t("dashboard.streak"), value: "0", color: "text-destructive" },
            { icon: Target, label: "Accuracy", value: "--", color: "text-success" },
          ].map((stat, i) => (
            <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 3}>
              <Card className="glass-card border-gold">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                  <p className="font-display text-3xl">{stat.value}</p>
                  <p className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Plan placeholder */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
          <Card className="glass-card border-gold">
            <CardHeader>
              <CardTitle className="font-display text-xl text-gradient-gold flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> {t("dashboard.today_plan")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                AI is building your personalized study plan. Complete your profile and take your first test to get started.
              </p>
              <div className="flex gap-3 mt-4">
                <Link to="/ai-tutor">
                  <Button size="sm" className="bg-gradient-gold text-primary-foreground font-bold tracking-wider">Ask AI Tutor</Button>
                </Link>
                <Link to="/tests">
                  <Button size="sm" variant="outline" className="border-gold">Take First Test</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
          <h2 className="font-display text-xl text-gradient-gold mb-4">{t("dashboard.quick_actions")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.href}>
                <Card className="glass-card border-gold hover:scale-[1.02] transition-transform cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <action.icon className={`h-8 w-8 ${action.color} mx-auto mb-3`} />
                    <p className="font-semibold text-sm">{action.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
