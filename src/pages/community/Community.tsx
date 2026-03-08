import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, MessageSquare, Award, UserPlus, ChevronRight, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const SECTIONS = [
  { href: "/mentors", icon: Award, title: "Mentor Connect", desc: "Connect with NDA-cleared officers for guidance", color: "text-primary" },
  { href: "/study-partner", icon: UserPlus, title: "Study Partner", desc: "Find accountability partners by state and attempt", color: "text-accent" },
  { href: "/success-stories", icon: Trophy, title: "Success Stories", desc: "Real NDA selection stories and strategies", color: "text-success" },
  { href: "/leaderboard", icon: Trophy, title: "Leaderboard", desc: "See how you rank among fellow aspirants", color: "text-warning" },
];

export default function Community() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl text-gradient-gold">COMMUNITY</h1>
          </div>
          <p className="text-muted-foreground text-sm">Connect with fellow NDA aspirants, ask questions, and share strategies.</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-gold">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-10 w-10 text-primary/30 mx-auto mb-3" />
              <h2 className="font-display text-xl text-gradient-gold mb-2">COMMUNITY FEED</h2>
              <p className="text-muted-foreground text-sm mb-4">Community features are being built. In the meantime, use the AI Tutor for any doubts!</p>
              <Link to="/ai-tutor">
                <Button className="bg-gradient-gold text-primary-foreground font-bold">Ask AI Tutor Instead</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-3">
          {SECTIONS.map((section, i) => (
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
