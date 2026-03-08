import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Star, Eye, MessageSquare, Shield, Heart, Zap, Target, Users } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const OLQS = [
  { title: "Effective Intelligence", desc: "Ability to understand the real problem and find practical solutions quickly.", tips: ["Practice puzzles and logical reasoning daily", "Read newspaper editorials for analytical thinking", "Solve SRT scenarios with practical approach"], icon: Zap, color: "text-primary" },
  { title: "Reasoning Ability", desc: "Logical and analytical thinking to arrive at sound conclusions.", tips: ["Practice syllogisms and analogies", "Analyze both sides of any argument", "Question assumptions before concluding"], icon: Target, color: "text-accent" },
  { title: "Organizing Ability", desc: "Systematic planning and execution of tasks with available resources.", tips: ["Plan your daily study schedule and follow it", "Lead group activities in college/school", "Practice time management in mock tests"], icon: Shield, color: "text-success" },
  { title: "Social Adaptability", desc: "Ability to adjust in any social situation and get along with people.", tips: ["Interact with people from different backgrounds", "Participate in team sports and group activities", "Be open to different viewpoints and cultures"], icon: Users, color: "text-cyan" },
  { title: "Cooperation", desc: "Working together as a team member, not just as a leader.", tips: ["Listen to others' ideas before presenting yours", "Offer help without being asked", "Give credit to team members"], icon: Heart, color: "text-warning" },
  { title: "Initiative", desc: "Taking the first step without being told. Self-starter quality.", tips: ["Volunteer for tasks in daily life", "Start conversations with strangers", "Take responsibility for group outcomes"], icon: Star, color: "text-primary" },
  { title: "Self Confidence", desc: "Belief in your own abilities without being arrogant.", tips: ["Maintain eye contact during conversations", "Speak clearly and at moderate pace", "Accept failures as learning, not defeat"], icon: Eye, color: "text-accent" },
  { title: "Speed of Decision", desc: "Making quick, effective decisions under pressure.", tips: ["Practice SRT with a 30-second time limit", "Play speed chess or quick decision games", "Trust your first instinct in most situations"], icon: Zap, color: "text-success" },
  { title: "Determination", desc: "Persistence in achieving goals despite obstacles.", tips: ["Set long-term goals and track progress", "Don't skip daily routine even when unmotivated", "Share your goals with someone for accountability"], icon: Target, color: "text-destructive" },
];

const BODY_LANGUAGE_TIPS = [
  { do: "Stand straight with shoulders back", dont: "Slouch or lean against walls" },
  { do: "Maintain natural eye contact", dont: "Stare or look away constantly" },
  { do: "Sit upright, slightly leaning forward", dont: "Cross arms or legs defensively" },
  { do: "Use hand gestures naturally while speaking", dont: "Keep hands in pockets or fidget" },
  { do: "Walk with purpose and confidence", dont: "Drag feet or rush nervously" },
  { do: "Smile genuinely when appropriate", dont: "Have a blank expression or forced smile" },
];

const COMM_TIPS = [
  "Speak in short, clear sentences — avoid complex vocabulary",
  "Think for 2 seconds before answering any question",
  "Use 'I believe', 'In my opinion' instead of 'I think maybe'",
  "Give specific examples from your life, not generic answers",
  "If you don't know something, say 'I'll learn about it' — never bluff",
  "Address the panel/group directly, not the floor or ceiling",
  "Avoid filler words: um, uh, like, basically, actually",
  "End answers decisively — don't trail off",
];

export default function PersonalityTips() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-gradient-gold">PERSONALITY TIPS</h1>
          </div>
          <p className="text-muted-foreground text-sm">Officer Like Qualities, body language, and communication skills for SSB.</p>
        </motion.div>

        {/* 15 OLQs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <h2 className="font-display text-xl text-gradient-gold mb-3">OFFICER LIKE QUALITIES (OLQs)</h2>
          <p className="text-xs text-muted-foreground mb-4">SSB assesses 15 OLQs grouped into 4 factors. Here are the key ones with actionable tips:</p>
        </motion.div>

        <div className="grid gap-3">
          {OLQS.map((olq, i) => (
            <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
              <Card className="glass-card border-gold">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <olq.icon className={`h-5 w-5 ${olq.color} mt-0.5 shrink-0`} />
                    <div>
                      <h3 className="font-bold text-sm">{olq.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{olq.desc}</p>
                    </div>
                  </div>
                  <div className="ml-8 space-y-1.5">
                    {olq.tips.map((tip, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="text-primary text-xs mt-0.5">▸</span>
                        <p className="text-xs">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Body Language */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={12}>
          <h2 className="font-display text-xl text-gradient-gold mb-3 mt-8">BODY LANGUAGE</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BODY_LANGUAGE_TIPS.map((tip, i) => (
            <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 13}>
              <Card className="glass-card border-gold">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge className="bg-success/20 text-success text-[9px] shrink-0">DO</Badge>
                    <p className="text-xs">{tip.do}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-destructive/20 text-destructive text-[9px] shrink-0">DON'T</Badge>
                    <p className="text-xs">{tip.dont}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Communication */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={20}>
          <h2 className="font-display text-xl text-gradient-gold mb-3 mt-8">COMMUNICATION SKILLS</h2>
        </motion.div>

        <Card className="glass-card border-gold">
          <CardContent className="p-5 space-y-2">
            {COMM_TIPS.map((tip, i) => (
              <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 21} className="flex items-start gap-3">
                <MessageSquare className="h-3 w-3 text-accent mt-1 shrink-0" />
                <p className="text-xs">{tip}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
