import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Clock, Play, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const VIDEOS: Record<string, { title: string; channel: string; duration: string; topics: string; free: boolean }[]> = {
  maths: [
    { title: "Complete NDA Maths in 100 Hours", channel: "Unacademy NDA", duration: "100 hrs", topics: "All chapters from algebra to calculus", free: false },
    { title: "NCERT Maths Class 11 — Full Course", channel: "Khan Academy India", duration: "40 hrs", topics: "Sets, Relations, Trigonometry, Statistics", free: true },
    { title: "NCERT Maths Class 12 — Full Course", channel: "Khan Academy India", duration: "45 hrs", topics: "Matrices, Calculus, Probability, Vectors", free: true },
    { title: "NDA Maths PYQ Solutions (2019-2024)", channel: "Defence Adda", duration: "20 hrs", topics: "Year-wise PYQ solutions with shortcuts", free: true },
    { title: "Coordinate Geometry Crash Course", channel: "Vedantu NDA", duration: "8 hrs", topics: "Lines, circles, conics — exam focused", free: false },
  ],
  gat: [
    { title: "Complete History for NDA", channel: "Study IQ", duration: "30 hrs", topics: "Ancient, Medieval, Modern India, World History", free: true },
    { title: "Indian Geography — NDA Special", channel: "Unacademy NDA", duration: "25 hrs", topics: "Physical, economic, human geography", free: false },
    { title: "Indian Polity Simplified", channel: "Drishti IAS", duration: "20 hrs", topics: "Constitution, governance, current issues", free: true },
    { title: "General Science for Defence Exams", channel: "Defence Adda", duration: "15 hrs", topics: "Physics, Chemistry, Biology basics", free: true },
    { title: "Current Affairs Monthly Digest", channel: "Current Affairs Today", duration: "4 hrs/month", topics: "Monthly compilation of important events", free: true },
  ],
  english: [
    { title: "English Grammar Masterclass", channel: "English with Lucy", duration: "15 hrs", topics: "Tenses, voice, narration, articles", free: true },
    { title: "NDA English — Complete Course", channel: "Unacademy NDA", duration: "20 hrs", topics: "Grammar, vocab, comprehension, cloze", free: false },
    { title: "Vocabulary Building — 1000 Words", channel: "Vocab Master", duration: "10 hrs", topics: "Most important words for competitive exams", free: true },
    { title: "Comprehension & Cloze Techniques", channel: "Defence Adda", duration: "8 hrs", topics: "Speed reading and passage solving strategies", free: true },
  ],
  ssb: [
    { title: "SSB Interview Complete Guide", channel: "SSB Crack", duration: "12 hrs", topics: "Screening, psychology, GTO, interview, conference", free: true },
    { title: "OIR Practice — 500 Questions", channel: "Defence Guru", duration: "6 hrs", topics: "Verbal and non-verbal reasoning", free: true },
    { title: "TAT/WAT/SRT/SDT — Practice Sessions", channel: "SSB Crack", duration: "8 hrs", topics: "Live psychology test practice with evaluation", free: false },
    { title: "GTO Tasks Explained", channel: "Major Kalshi Classes", duration: "5 hrs", topics: "All GTO tasks with tips and strategies", free: true },
  ],
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

export default function VideoLectures() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Video className="h-8 w-8 text-accent" />
          <h1 className="font-display text-4xl text-gradient-gold">VIDEO LECTURES</h1>
        </div>
        <p className="text-muted-foreground text-sm">Curated video content for each subject. Free and premium resources.</p>

        <Tabs defaultValue="maths">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="maths">Maths</TabsTrigger>
            <TabsTrigger value="gat">GAT</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="ssb">SSB</TabsTrigger>
          </TabsList>

          {Object.entries(VIDEOS).map(([key, videos]) => (
            <TabsContent key={key} value={key} className="mt-4 space-y-3">
              {videos.map((vid, i) => (
                <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <Card className="glass-card border-gold hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                        <Play className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-sm">{vid.title}</h3>
                          <Badge className={`text-[9px] ${vid.free ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                            {vid.free ? "FREE" : "PREMIUM"}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{vid.channel} • {vid.duration}</p>
                        <p className="text-xs text-muted-foreground mt-1">{vid.topics}</p>
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
