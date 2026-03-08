import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FolderOpen, BookOpen, Video, Download, HelpCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
};

const ITEMS = [
  { href: "/resources/books", icon: BookOpen, title: "Recommended Books", desc: "AI-curated reading list for NDA", color: "text-primary" },
  { href: "/resources/videos", icon: Video, title: "Video Lectures", desc: "Curated video content per subject", color: "text-accent" },
  { href: "/resources/downloads", icon: Download, title: "Downloads", desc: "PDFs, formula sheets, references", color: "text-success" },
  { href: "/faq", icon: HelpCircle, title: "FAQ", desc: "Common NDA exam questions", color: "text-warning" },
];

export default function Resources() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">RESOURCES</h1>
        </div>

        <div className="grid gap-3">
          {ITEMS.map((item, i) => (
            <motion.div key={item.href} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
              <Link to={item.href}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                    <div className="flex-1">
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
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
