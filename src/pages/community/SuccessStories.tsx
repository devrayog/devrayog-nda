import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Quote, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const STORIES = [
  {
    name: "Aditya Kumar", branch: "Army", batch: "NDA 149", state: "Bihar",
    quote: "I failed my first SSB. Instead of giving up, I analyzed every mistake. The second time, I went in with a plan and got recommended.",
    tips: ["Focus on NCERT for basics before anything else", "Give at least 3 mock tests every week", "Physical fitness is non-negotiable — run daily"],
    attempts: 2, highlight: "Topped his SSB batch",
  },
  {
    name: "Sneha Patel", branch: "Air Force", batch: "NDA 150", state: "Gujarat",
    quote: "Being a girl preparing for NDA was lonely at first. But the community and consistent practice made all the difference.",
    tips: ["Don't let anyone tell you girls can't crack NDA", "English is the scoring subject — master it", "Join a study group for accountability"],
    attempts: 1, highlight: "First attempt selection",
  },
  {
    name: "Rohit Chauhan", branch: "Navy", batch: "NDA 148", state: "Haryana",
    quote: "I was an average student. What changed was my daily routine — 6 hours focused study, 1 hour fitness, and consistent revision.",
    tips: ["Consistency beats intensity — study every single day", "Error log is your secret weapon", "Practice mental math for speed"],
    attempts: 3, highlight: "Cleared after 3 attempts",
  },
  {
    name: "Kavya Nair", branch: "Army", batch: "NDA 151", state: "Kerala",
    quote: "Current affairs was my weakest area. I started reading The Hindu daily and within 3 months it became my strongest section.",
    tips: ["Read one newspaper thoroughly every day", "Make short notes of important events weekly", "Link current affairs to static GK topics"],
    attempts: 1, highlight: "Scored 98% in GAT",
  },
  {
    name: "Manish Tiwari", branch: "Air Force", batch: "NDA 147", state: "UP",
    quote: "SSB is not about acting confident — it's about being genuine. I stopped trying to impress and started being myself.",
    tips: ["Be yourself in SSB — they catch fakers instantly", "Practice OIR daily for at least 30 minutes", "Group tasks need cooperation, not domination"],
    attempts: 2, highlight: "Recommended with highest OLQ score",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function SuccessStories() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-warning" />
            <h1 className="font-display text-4xl text-gradient-gold">SUCCESS STORIES</h1>
          </div>
          <p className="text-muted-foreground text-sm">Real NDA selection stories and strategies that worked. Get inspired by those who made it.</p>
        </motion.div>

        {STORIES.map((story, i) => (
          <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
            <Card className="glass-card border-gold overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-xl">{story.name}</h3>
                      <Badge className="bg-primary/20 text-primary text-[9px]">{story.branch}</Badge>
                    </div>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span>{story.batch}</span>
                      <span>•</span>
                      <span>{story.state}</span>
                      <span>•</span>
                      <span>{story.attempts === 1 ? "1st attempt" : `${story.attempts} attempts`}</span>
                    </div>
                  </div>
                  <Badge className="bg-success/20 text-success text-[9px]">{story.highlight}</Badge>
                </div>

                <div className="flex gap-3 p-4 bg-muted/30 rounded-lg">
                  <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm italic">{story.quote}</p>
                </div>

                <div>
                  <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2">KEY STRATEGIES</p>
                  <div className="space-y-1.5">
                    {story.tips.map((tip, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <Star className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                        <p className="text-xs">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
