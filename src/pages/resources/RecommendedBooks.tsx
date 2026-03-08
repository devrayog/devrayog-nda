import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Star, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const STATIC_BOOKS: Record<string, { title: string; author: string; desc: string; rating: number; essential: boolean }[]> = {
  maths: [
    { title: "Mathematics for NDA/NA", author: "R.S. Aggarwal", desc: "Comprehensive coverage of all NDA Maths topics.", rating: 4.7, essential: true },
    { title: "NCERT Maths (Class 11 & 12)", author: "NCERT", desc: "Foundation book. Most NDA questions are NCERT-based.", rating: 4.9, essential: true },
  ],
  gat: [
    { title: "General Knowledge 2025", author: "Lucent's", desc: "Most comprehensive GK book.", rating: 4.8, essential: true },
    { title: "Indian Polity", author: "M. Laxmikanth", desc: "Best for Constitution and governance.", rating: 4.7, essential: true },
  ],
  english: [
    { title: "Wren & Martin", author: "P.C. Wren", desc: "The definitive English grammar reference.", rating: 4.8, essential: true },
    { title: "Word Power Made Easy", author: "Norman Lewis", desc: "Build vocabulary systematically.", rating: 4.7, essential: true },
  ],
};

interface DBResource { id: string; title: string; body: string; link: string; category: string; image_url: string | null; }

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }) };

export default function RecommendedBooks() {
  const [dbBooks, setDbBooks] = useState<DBResource[]>([]);

  useEffect(() => {
    supabase.from("resources").select("*").eq("type", "book").eq("is_active", true).order("sort_order")
      .then(({ data }) => setDbBooks((data as DBResource[]) || []));
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">RECOMMENDED BOOKS</h1>
        </div>

        {/* Admin-added books */}
        {dbBooks.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display text-lg text-gradient-gold">📚 CURATED BY ADMIN</h2>
            {dbBooks.map((book, i) => (
              <motion.div key={book.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="glass-card border-primary/30">
                  <CardContent className="p-4 flex items-start gap-4">
                    {book.image_url ? <img src={book.image_url} className="w-12 h-16 rounded object-cover" alt="" /> :
                      <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center text-2xl">📖</div>}
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{book.title}</h3>
                      {book.body && <p className="text-xs text-muted-foreground mt-1">{book.body}</p>}
                      {book.link && <a href={book.link} target="_blank" className="text-xs text-primary underline flex items-center gap-1 mt-1"><ExternalLink className="h-3 w-3" /> View</a>}
                    </div>
                    <Badge className="text-[9px] bg-primary/20 text-primary capitalize">{book.category}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Static books */}
        <Tabs defaultValue="maths">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="maths">Maths</TabsTrigger>
            <TabsTrigger value="gat">GAT</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
          </TabsList>
          {Object.entries(STATIC_BOOKS).map(([key, books]) => (
            <TabsContent key={key} value={key} className="mt-4 space-y-3">
              {books.map((book, i) => (
                <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <Card className={`glass-card ${book.essential ? "border-primary/50" : "border-gold"}`}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center text-2xl">📖</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-sm">{book.title}</h3>
                          {book.essential && <Badge className="bg-primary/20 text-primary text-[9px]">ESSENTIAL</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">by {book.author}</p>
                        <p className="text-xs text-muted-foreground mt-1">{book.desc}</p>
                        <div className="flex items-center gap-1 mt-2"><Star className="h-3 w-3 text-warning fill-warning" /><span className="text-xs">{book.rating}</span></div>
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
