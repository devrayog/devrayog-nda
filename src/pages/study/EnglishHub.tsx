import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, FileText, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const TOPICS = [
  { id: "grammar-basics", name: "Grammar Fundamentals", sub: "Parts of Speech, Tenses, Articles, Prepositions", emoji: "📖" },
  { id: "sentence-correction", name: "Sentence Correction", sub: "Error Spotting, Fill in Blanks, Sentence Improvement", emoji: "✏️" },
  { id: "vocabulary", name: "Vocabulary", sub: "Synonyms, Antonyms, One Word Substitution, Idioms", emoji: "📚" },
  { id: "comprehension", name: "Reading Comprehension", sub: "Passage-based Questions, Inference, Main Idea", emoji: "📝" },
  { id: "cloze-test", name: "Cloze Test", sub: "Fill in context-based blanks in passages", emoji: "🔤" },
  { id: "ordering", name: "Sentence Ordering", sub: "Para Jumbles, Sentence Rearrangement", emoji: "🔀" },
  { id: "active-passive", name: "Active & Passive Voice", sub: "Voice conversion rules and practice", emoji: "🔁" },
  { id: "direct-indirect", name: "Direct & Indirect Speech", sub: "Narration changes and rules", emoji: "💬" },
];

export default function EnglishHub() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-cyan" />
            <h1 className="font-display text-4xl text-gradient-gold">ENGLISH HUB</h1>
          </div>
          <p className="text-muted-foreground text-sm">Grammar, Vocabulary, Comprehension — improve your English score.</p>
        </motion.div>

        <div className="grid gap-3">
          {TOPICS.map((topic, i) => (
            <motion.div key={topic.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <Link to={`/study/topic/${topic.id}`}>
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
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link to="/ai-tutor" className="flex-1">
            <Button className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider">
              <Brain className="h-4 w-4 mr-2" /> Ask AI About English
            </Button>
          </Link>
          <Link to="/vocabulary" className="flex-1">
            <Button variant="outline" className="w-full border-gold font-bold tracking-wider">
              Vocabulary Builder
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
