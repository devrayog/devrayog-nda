import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const SECTIONS = [
  {
    category: "History",
    topics: [
      { id: "indian-history", name: "Indian History", sub: "Ancient, Medieval, Modern India", emoji: "🏛️" },
      { id: "freedom-struggle", name: "Freedom Struggle", sub: "1857 to Independence, Leaders & Movements", emoji: "🇮🇳" },
      { id: "world-history", name: "World History", sub: "World Wars, Renaissance, Cold War", emoji: "🌍" },
    ]
  },
  {
    category: "Geography",
    topics: [
      { id: "indian-geography", name: "Indian Geography", sub: "Rivers, Mountains, Climate, States", emoji: "🗺️" },
      { id: "world-geography", name: "World Geography", sub: "Continents, Oceans, International Boundaries", emoji: "🌏" },
      { id: "physical-geography", name: "Physical Geography", sub: "Atmosphere, Lithosphere, Hydrosphere", emoji: "⛰️" },
    ]
  },
  {
    category: "Science",
    topics: [
      { id: "physics-gat", name: "Physics (GAT)", sub: "Mechanics, Light, Sound, Electricity basics", emoji: "⚡" },
      { id: "chemistry-gat", name: "Chemistry (GAT)", sub: "Elements, Compounds, Everyday Chemistry", emoji: "🧪" },
      { id: "biology-gat", name: "Biology", sub: "Human Body, Diseases, Plants", emoji: "🧬" },
    ]
  },
  {
    category: "Polity & Economy",
    topics: [
      { id: "polity", name: "Indian Polity", sub: "Constitution, Parliament, Amendments", emoji: "⚖️" },
      { id: "economy", name: "Indian Economy", sub: "Budget, GDP, Banking, Policies", emoji: "💰" },
      { id: "defence", name: "Defence & Current Affairs", sub: "Exercises, Weapons, Defence News", emoji: "🎖️" },
    ]
  },
];

export default function GATHub() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl text-gradient-gold">GAT / GK HUB</h1>
          </div>
          <p className="text-muted-foreground text-sm">History, Geography, Science, Polity — organized by NDA weightage.</p>
        </motion.div>

        {SECTIONS.map((section, si) => (
          <motion.div key={section.category} initial="hidden" animate="visible" variants={fadeUp} custom={si + 1}>
            <h2 className="font-display text-xl text-primary mb-3">{section.category.toUpperCase()}</h2>
            <div className="grid gap-3 mb-6">
              {section.topics.map((topic) => (
                <Link key={topic.id} to={`/study/topic/${topic.id}`}>
                  <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="text-3xl">{topic.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{topic.name}</h3>
                        <p className="text-xs text-muted-foreground">{topic.sub}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="flex gap-3">
          <Link to="/ai-tutor" className="flex-1">
            <Button className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider">
              <Brain className="h-4 w-4 mr-2" /> Ask AI About GK
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
