import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";
import { Shield, Mail, Phone, MapPin, Target, CheckCircle2, ArrowRight, Swords } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Suspense, lazy } from "react";
const MilitaryParticles = lazy(() => import("@/components/3d/MilitaryParticles"));

const TARGET_EXAMS = [
  "NDA September 2026",
  "NDA April 2027",
  "NDA September 2027",
  "NDA April 2028",
  "NDA September 2028",
  "NDA April 2029",
  "NDA September 2029",
  "NDA April 2030",
  "NDA September 2030",
];

const ATTEMPTS = ["1st Attempt", "2nd Attempt", "3rd Attempt", "4th Attempt", "5th Attempt or more"];

const schema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  email: z.string().trim().email("Invalid email").max(200),
  phone: z.string().trim().min(7, "Invalid phone").max(20),
  whatsapp: z.string().trim().min(7, "Invalid WhatsApp").max(20),
  location: z.string().trim().min(2, "Required").max(120),
  from_location: z.string().trim().min(2, "Required").max(120),
  current_attempt: z.string().min(1, "Select attempt"),
  target_exam: z.string().min(1, "Select target exam"),
});

export default function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", whatsapp: "",
    location: "", from_location: "",
    current_attempt: "", target_exam: "",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("waitlist").insert(parsed.data);
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.error("Soldier, you've already enlisted with this email.");
      else toast.error("Mission failed. Try again, soldier.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <Suspense fallback={null}>
        <MilitaryParticles className="fixed inset-0 opacity-30 pointer-events-none" />
      </Suspense>

      <section className="relative pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass-card border-primary/40 p-10 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-6"
                >
                  <CheckCircle2 className="h-20 w-20 text-success mx-auto" />
                </motion.div>
                <h1 className="font-display text-3xl md:text-4xl text-gradient-gold mb-4">
                  WELCOME TO THE BATTALION
                </h1>
                <p className="font-mono text-xs text-primary tracking-[4px] mb-6">
                  ENLISTMENT CONFIRMED · OPERATION PENDING
                </p>
                <div className="space-y-3 text-base text-muted-foreground max-w-xl mx-auto">
                  <p className="text-foreground font-semibold">
                    Jai Hind, <span className="text-primary">{form.name.split(" ")[0]}</span>! 🇮🇳
                  </p>
                  <p>
                    Your name has been added to the recruitment register. Within
                    <span className="text-primary font-bold"> 48–72 hours</span>, our command will dispatch your
                    access credentials via <span className="text-primary font-bold">email</span> and
                    <span className="text-primary font-bold"> WhatsApp</span>.
                  </p>
                  <p className="italic text-sm pt-2 border-t border-gold/30 mt-4">
                    "Train hard, fight easy. The uniform is earned, not given."
                  </p>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/">
                    <Button variant="outline" className="border-gold">Back to Base</Button>
                  </Link>
                  <Link to="/guide">
                    <Button className="bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                      Read Mission Briefing <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 mb-6">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono text-[10px] text-primary tracking-[3px]">RECRUITMENT · 2026 BATCH</span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl text-gradient-gold leading-tight mb-4">
                  ENLIST IN THE BATTALION
                </h1>
                <p className="font-mono text-xs text-primary tracking-[4px] mb-6">
                  NDA IN DNA · JOIN THE WAITLIST
                </p>
                <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Soldier, this is not just another signup form — this is your <span className="text-primary font-semibold">Oath of Intent</span>.
                  Fill in your details and within <span className="text-primary font-semibold">48–72 hours</span> our command will issue your
                  personal credentials over email and WhatsApp. Then the real training begins. <span className="text-foreground font-semibold">Bharat Mata Ki Jai.</span>
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="glass-card border-gold p-6 md:p-10">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono tracking-widest text-primary">FULL NAME *</Label>
                        <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Vikram Singh" required maxLength={80} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono tracking-widest text-primary flex items-center gap-1.5"><Mail className="h-3 w-3" /> EMAIL *</Label>
                        <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="soldier@example.com" required maxLength={200} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono tracking-widest text-primary flex items-center gap-1.5"><Phone className="h-3 w-3" /> PHONE *</Label>
                        <Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9XXXXXXXXX" required maxLength={20} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono tracking-widest text-primary flex items-center gap-1.5"><Phone className="h-3 w-3" /> WHATSAPP *</Label>
                        <Input type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+91 9XXXXXXXXX" required maxLength={20} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono tracking-widest text-primary flex items-center gap-1.5"><MapPin className="h-3 w-3" /> CURRENT LOCATION *</Label>
                        <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State" required maxLength={120} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono tracking-widest text-primary flex items-center gap-1.5"><MapPin className="h-3 w-3" /> NATIVE / FROM *</Label>
                        <Input value={form.from_location} onChange={(e) => update("from_location", e.target.value)} placeholder="Hometown, State" required maxLength={120} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono tracking-widest text-primary flex items-center gap-1.5"><Swords className="h-3 w-3" /> WHICH ATTEMPT IS THIS *</Label>
                        <Select value={form.current_attempt} onValueChange={(v) => update("current_attempt", v)}>
                          <SelectTrigger><SelectValue placeholder="Select attempt" /></SelectTrigger>
                          <SelectContent>
                            {ATTEMPTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono tracking-widest text-primary flex items-center gap-1.5"><Target className="h-3 w-3" /> TARGETING EXAM *</Label>
                        <Select value={form.target_exam} onValueChange={(v) => update("target_exam", v)}>
                          <SelectTrigger><SelectValue placeholder="Select target NDA exam" /></SelectTrigger>
                          <SelectContent>
                            {TARGET_EXAMS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-widest text-base py-6 shadow-gold hover:scale-[1.01] transition-transform"
                      >
                        {loading ? "ENLISTING..." : "REPORT FOR DUTY"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-center text-xs text-muted-foreground mt-3">
                        Already received credentials? <Link to="/login" className="text-primary font-semibold hover:underline">Login here</Link>
                      </p>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
