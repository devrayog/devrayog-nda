import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Shield, Trophy, Brain, Users, Star, Sparkles, Target, BookOpen, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const SECTIONS = [
  { icon: Shield, title: "Preparation Guide", desc: "Same exam, tips specific to girl candidates including physical standards", color: "text-pink-400", href: "/study-plan" },
  { icon: Users, title: "Girls Community", desc: "Connect with other girl NDA aspirants in a safe space", color: "text-pink-300", href: "/community" },
  { icon: Trophy, title: "Success Stories", desc: "Women who made it through NDA — be inspired", color: "text-pink-500", href: "/success-stories" },
  { icon: Dumbbell, title: "Fitness Standards", desc: "Physical requirements specific to female candidates", color: "text-pink-400", href: "/fitness/medical" },
  { icon: BookOpen, title: "Study Resources", desc: "Curated resources for NDA preparation", color: "text-pink-300", href: "/resources" },
  { icon: Target, title: "SSB Preparation", desc: "SSB tips and practice for girl candidates", color: "text-pink-500", href: "/ssb" },
];

const FACTS = [
  "Since 2022, girls can join NDA — you're making history!",
  "The written exam is exactly the same for boys and girls",
  "Physical standards are adjusted — but you still need to be fit",
  "SSB evaluation criteria are identical — OLQs matter",
  "Women cadets train at the same NDA campus in Khadakwasla, Pune",
];

export default function GirlsNDA() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header with pink theme */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-300/20">
              <Heart className="h-7 w-7 text-pink-400" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl bg-gradient-to-r from-pink-400 via-pink-300 to-rose-400 bg-clip-text text-transparent">GIRLS NDA SECTION</h1>
              <p className="text-pink-300/60 text-xs mt-0.5">Dedicated space for girl NDA candidates</p>
            </div>
          </div>
        </motion.div>

        {/* Hero Card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="overflow-hidden border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-background to-rose-500/10">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Sparkles className="h-8 w-8 text-pink-400 mb-3" />
              <h2 className="font-display text-2xl bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-3">GIRLS IN NDA — MAKING HISTORY</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Since 2022, girls can join NDA. You're part of a historic batch of women who will serve the nation as officers.
                The preparation is the same — Maths, GAT, English, SSB. But the journey has its unique challenges and this section is for YOU.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Facts */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card className="border-pink-500/20 bg-pink-500/5">
            <CardContent className="p-5">
              <h3 className="font-display text-lg text-pink-400 mb-3">KEY FACTS FOR GIRL CANDIDATES</h3>
              <div className="space-y-2">
                {FACTS.map((fact, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-2">
                    <Star className="h-3 w-3 text-pink-400 mt-1 shrink-0 fill-pink-400" />
                    <p className="text-xs">{fact}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Cards */}
        <div className="grid gap-3 md:grid-cols-2">
          {SECTIONS.map((item, i) => (
            <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 3}>
              <Link to={item.href}>
                <Card className="border-pink-500/20 hover:border-pink-400/50 transition-all hover:scale-[1.01] cursor-pointer bg-gradient-to-br from-pink-500/5 to-transparent">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-pink-500/10">
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={10}>
          <Link to="/ai-tutor">
            <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold tracking-wider shadow-lg hover:shadow-xl transition-shadow">
              <Brain className="h-4 w-4 mr-2" /> Ask AI Tutor — Girl-Specific Queries
            </Button>
          </Link>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={11}>
          <Card className="border-pink-500/20 bg-pink-500/5">
            <CardContent className="p-6 text-center">
              <p className="text-sm italic text-pink-300/80">
                "A woman is like a tea bag — you never know how strong she is until she gets in hot water."
              </p>
              <p className="text-xs text-muted-foreground mt-2">— Eleanor Roosevelt</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
