import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Shield, Trophy, Brain, Users } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export default function GirlsNDA() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl text-gradient-gold">GIRLS NDA SECTION</h1>
          </div>
          <p className="text-muted-foreground text-sm">Dedicated space for girl NDA candidates — guidance, community, and success stories.</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-gold bg-gradient-military">
            <CardContent className="p-6">
              <h2 className="font-display text-xl text-gradient-gold mb-3">GIRLS IN NDA — MAKING HISTORY</h2>
              <p className="text-sm leading-relaxed">Since 2022, girls can join NDA. You're part of a historic batch of women who will serve the nation as officers. The preparation is the same — Maths, GAT, English, SSB. But the journey has its unique challenges and this section is for YOU.</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-3">
          {[
            { icon: Shield, title: "Preparation Guide", desc: "Same exam, specific tips for girl candidates", color: "text-primary" },
            { icon: Users, title: "Girls Community", desc: "Connect with other girl NDA aspirants", color: "text-accent" },
            { icon: Trophy, title: "Success Stories", desc: "Women who made it through NDA", color: "text-success" },
          ].map((item, i) => (
            <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
              <Card className="glass-card border-gold">
                <CardContent className="p-5 flex items-center gap-4">
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                  <div>
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Link to="/ai-tutor">
          <Button className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider">
            <Brain className="h-4 w-4 mr-2" /> Ask AI Tutor — Girl-Specific Queries
          </Button>
        </Link>
      </div>
    </DashboardLayout>
  );
}
