import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserCheck, Star, Search, Phone } from "lucide-react";
import { motion } from "framer-motion";

const MENTORS = [
  { name: "Lt. Arjun Sharma", branch: "Army (Infantry)", batch: "NDA 148", rating: 4.9, expertise: ["Written Exam Strategy", "SSB Interview", "Physical Fitness"], bio: "Cleared NDA in first attempt. 3 years mentoring experience.", avatar: "🎖️" },
  { name: "Sub Lt. Priya Verma", branch: "Navy", batch: "NDA 149", rating: 4.8, expertise: ["Maths", "GAT", "Girls in NDA"], bio: "Among first women cadets at NDA. Expert in Maths shortcuts.", avatar: "⚓" },
  { name: "Fg Off. Rahul Deshmukh", branch: "Air Force", batch: "NDA 147", rating: 4.7, expertise: ["SSB Psychology", "Current Affairs", "Time Management"], bio: "Cleared SSB on second attempt. Specializes in psychology tests.", avatar: "✈️" },
  { name: "Capt. Meera Singh", branch: "Army (Signals)", batch: "NDA 146", rating: 4.9, expertise: ["English", "Essay Writing", "Communication"], bio: "Topped English in NDA exam. Helps with essay and comprehension.", avatar: "📡" },
  { name: "Lt. Vikram Rathore", branch: "Army (Armoured)", batch: "NDA 150", rating: 4.6, expertise: ["Physical Training", "GTO Tasks", "Leadership"], bio: "National-level athlete. Expert in GTO and physical preparation.", avatar: "🏋️" },
];

const WHATSAPP_NUMBER = "918233801406";

export default function MentorConnect() {
  const [search, setSearch] = useState("");

  const filtered = MENTORS.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.expertise.some(e => e.toLowerCase().includes(search.toLowerCase())) ||
    m.branch.toLowerCase().includes(search.toLowerCase())
  );

  const handleBook = (mentor: typeof MENTORS[0]) => {
    const text = encodeURIComponent(
      `Hi, I am an NDA aspirant and would like to book a mentorship session with ${mentor.name} (${mentor.branch}, ${mentor.batch}). Please help me connect.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">MENTOR CONNECT</h1>
        </div>
        <p className="text-muted-foreground text-sm">Connect with NDA-cleared officers for guidance. Book a session via WhatsApp.</p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, branch, or expertise..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>

        <div className="grid gap-3">
          {filtered.map((mentor, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-gold hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-start gap-4">
                  <span className="text-3xl">{mentor.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm">{mentor.name}</h3>
                      <Badge variant="outline" className="text-[9px]">{mentor.branch}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1"><Star className="h-3 w-3 text-warning fill-warning" /> {mentor.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{mentor.bio}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mentor.expertise.map((e, j) => <Badge key={j} className="text-[9px] bg-primary/10 text-primary">{e}</Badge>)}
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 bg-success/20 text-success hover:bg-success/30 font-bold"
                      onClick={() => handleBook(mentor)}
                    >
                      <Phone className="h-3 w-3 mr-1" /> Book via WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
