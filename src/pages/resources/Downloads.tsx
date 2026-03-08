import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calculator, BookOpen, Map, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const DOWNLOADS = [
  { title: "Complete Maths Formula Sheet", desc: "All NDA Maths formulas organized by chapter. Print-friendly.", icon: Calculator, category: "Maths", link: "/formulas" },
  { title: "Trigonometry Quick Reference", desc: "All trig identities, values, and graphs on one page.", icon: Calculator, category: "Maths", link: "/formulas" },
  { title: "Indian History Timeline", desc: "From Indus Valley to Independence — key dates and events.", icon: BookOpen, category: "GAT", link: null },
  { title: "Geography Map Practice", desc: "Important rivers, mountains, cities for NDA Geography.", icon: Map, category: "GAT", link: null },
  { title: "English Vocabulary — 500 Words", desc: "Most frequently tested words in NDA English paper.", icon: FileText, category: "English", link: "/vocabulary" },
  { title: "Grammar Rules Cheat Sheet", desc: "Tenses, articles, prepositions, voice, narration rules.", icon: FileText, category: "English", link: null },
  { title: "NDA Syllabus (Official)", desc: "Complete UPSC NDA/NA syllabus for Paper I and Paper II.", icon: FileText, category: "General", link: null },
  { title: "SSB Day-by-Day Guide", desc: "What to expect each day of the 5-day SSB process.", icon: Shield, category: "SSB", link: "/ssb" },
  { title: "Physical Fitness Standards", desc: "Height, weight, vision requirements for all branches.", icon: Shield, category: "Fitness", link: "/fitness/medical" },
  { title: "NDA Previous Year Papers (2019-2024)", desc: "All NDA exam papers with answer keys.", icon: FileText, category: "PYQ", link: "/pyq" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
};

const categoryColors: Record<string, string> = {
  Maths: "bg-primary/20 text-primary",
  GAT: "bg-accent/20 text-accent",
  English: "bg-success/20 text-success",
  SSB: "bg-warning/20 text-warning",
  General: "bg-muted text-muted-foreground",
  Fitness: "bg-destructive/20 text-destructive",
  PYQ: "bg-cyan/20 text-cyan",
};

export default function DownloadsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Download className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">DOWNLOADS</h1>
        </div>
        <p className="text-muted-foreground text-sm">PDFs, formula sheets, and quick references for NDA preparation.</p>

        <div className="grid gap-3">
          {DOWNLOADS.map((item, i) => (
            <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
              <Card className="glass-card border-gold hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-sm">{item.title}</h3>
                      <Badge className={`text-[9px] ${categoryColors[item.category] || ""}`}>{item.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  {item.link ? (
                    <Link to={item.link}>
                      <Button size="sm" variant="outline" className="border-primary/30 shrink-0">
                        Open
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="outline" className="border-primary/30 shrink-0 opacity-50" disabled>
                      <Download className="h-3 w-3 mr-1" /> Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
