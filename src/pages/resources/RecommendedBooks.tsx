import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Star, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const BOOKS: Record<string, { title: string; author: string; desc: string; rating: number; essential: boolean }[]> = {
  maths: [
    { title: "Mathematics for NDA/NA", author: "R.S. Aggarwal", desc: "Comprehensive coverage of all NDA Maths topics with solved examples.", rating: 4.7, essential: true },
    { title: "NCERT Maths (Class 11 & 12)", author: "NCERT", desc: "Foundation book. Most NDA questions are based on NCERT concepts.", rating: 4.9, essential: true },
    { title: "Objective Mathematics", author: "R.D. Sharma", desc: "Advanced practice for competitive exam level questions.", rating: 4.5, essential: false },
    { title: "Maths Tricks & Shortcuts", author: "Various", desc: "Speed calculation techniques for competitive exams.", rating: 4.2, essential: false },
  ],
  gat: [
    { title: "General Knowledge 2025", author: "Lucent's", desc: "Most comprehensive GK book. Covers history, geography, science, polity.", rating: 4.8, essential: true },
    { title: "NCERT History (6-12)", author: "NCERT", desc: "Complete Indian history from ancient to modern. Must-read for NDA.", rating: 4.9, essential: true },
    { title: "Indian Polity", author: "M. Laxmikanth", desc: "Best book for understanding Indian Constitution and governance.", rating: 4.7, essential: true },
    { title: "Certificate Physical Geography", author: "G.C. Leong", desc: "Standard reference for physical geography concepts.", rating: 4.5, essential: false },
  ],
  english: [
    { title: "Wren & Martin", author: "P.C. Wren", desc: "The definitive English grammar reference. Every NDA aspirant needs this.", rating: 4.8, essential: true },
    { title: "Word Power Made Easy", author: "Norman Lewis", desc: "Build vocabulary systematically. Essential for comprehension and cloze.", rating: 4.7, essential: true },
    { title: "Objective General English", author: "S.P. Bakshi", desc: "Practice questions in NDA exam format.", rating: 4.4, essential: false },
    { title: "The Hindu Newspaper", author: "Daily Reading", desc: "Best way to improve reading speed, vocabulary, and current affairs.", rating: 4.9, essential: true },
  ],
  ssb: [
    { title: "Let's Crack SSB Interview", author: "Dr. N.K. Natarajan", desc: "Complete SSB guide with psychology tests, GTO, and interview tips.", rating: 4.6, essential: true },
    { title: "SSB Interview: The Complete Guide", author: "Dr. Arihant", desc: "Practical guide with real SSB examples and practice sets.", rating: 4.5, essential: false },
    { title: "Verbal & Non-Verbal Reasoning", author: "R.S. Aggarwal", desc: "Essential for OIR practice in SSB screening.", rating: 4.7, essential: true },
  ],
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

export default function RecommendedBooks() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">RECOMMENDED BOOKS</h1>
        </div>
        <p className="text-muted-foreground text-sm">Curated reading list for NDA preparation. Focus on essentials first.</p>

        <Tabs defaultValue="maths">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="maths">Maths</TabsTrigger>
            <TabsTrigger value="gat">GAT</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="ssb">SSB</TabsTrigger>
          </TabsList>

          {Object.entries(BOOKS).map(([key, books]) => (
            <TabsContent key={key} value={key} className="mt-4 space-y-3">
              {books.map((book, i) => (
                <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <Card className={`glass-card ${book.essential ? "border-primary/50" : "border-gold"}`}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center text-2xl shrink-0">📖</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-sm">{book.title}</h3>
                          {book.essential && <Badge className="bg-primary/20 text-primary text-[9px]">ESSENTIAL</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-1">by {book.author}</p>
                        <p className="text-xs text-muted-foreground">{book.desc}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-3 w-3 text-warning fill-warning" />
                          <span className="text-xs">{book.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
