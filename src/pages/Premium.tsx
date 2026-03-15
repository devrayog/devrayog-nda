import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, ArrowRight, Check, X, Crown, Zap, MessageCircle, Clock, Rocket, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumGate } from "@/hooks/usePremiumGate";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const UPCOMING_FEATURES = [
  { icon: Zap, title: "Full AI Personalization", desc: "Unlimited AI-powered study plans, adaptive difficulty, exam readiness prediction" },
  { icon: Shield, title: "Complete SSB Prep", desc: "Full TAT, WAT, SRT, SDT, PPDT practice with AI mock interviews" },
  { icon: Crown, title: "Unlimited Mock Tests", desc: "No limits on subject-wise or full-length mock tests" },
  { icon: Star, title: "15 Years PYQ Bank", desc: "Complete previous year papers with detailed solutions" },
  { icon: Rocket, title: "Mentor 1-on-1 Sessions", desc: "Direct connect with ex-NDA officers and defence mentors" },
  { icon: Sparkles, title: "Gold Premium Badge", desc: "Stand out on leaderboard with exclusive premium badge" },
];

const COMPARISON = [
  { section: "📝 Mock Tests" },
  { feat: "Full mock tests per month", free: "2 only", premium: "UNLIMITED" },
  { feat: "Subject wise mini tests", free: "5/month", premium: "UNLIMITED" },
  { feat: "Previous year papers", free: "Last 2 years", premium: "15 years" },
  { feat: "Daily quiz", free: true, premium: true },
  { feat: "Video solutions", free: false, premium: true },
  { section: "🧠 AI Personalization" },
  { feat: "Basic AI suggestions", free: "3/day", premium: "UNLIMITED" },
  { feat: "Full DNA Score", free: false, premium: true },
  { feat: "Daily personalized study plan", free: false, premium: true },
  { feat: "Adaptive difficulty", free: false, premium: true },
  { feat: "Exam readiness prediction", free: false, premium: true },
  { section: "🪖 SSB Preparation" },
  { feat: "OIR practice sets", free: "5 sets", premium: "20 sets" },
  { feat: "PPDT practice", free: "3 images", premium: "FULL SETS" },
  { feat: "TAT, WAT, SRT, SDT", free: "Basic info", premium: "FULL PRACTICE" },
  { feat: "AI mock interview", free: false, premium: true },
  { section: "👥 Community" },
  { feat: "Forum access", free: true, premium: true },
  { feat: "Accountability partner", free: false, premium: true },
  { feat: "Mentor connect (1 on 1)", free: false, premium: true },
  { section: "⭐ Profile" },
  { feat: "Gold PREMIUM badge", free: false, premium: true },
  { feat: "Highlighted leaderboard", free: false, premium: true },
];

export default function Premium() {
  const { isPremium, premiumEnabled } = usePremiumGate();
  const { user } = useAuth();
  const [monthlyPrice, setMonthlyPrice] = useState("11");
  const [annualPrice, setAnnualPrice] = useState("108");
  const [whatsappNumber, setWhatsappNumber] = useState("8233801406");

  useEffect(() => {
    Promise.all([
      supabase.from("admin_settings").select("value").eq("key", "premium_monthly_price").single(),
      supabase.from("admin_settings").select("value").eq("key", "premium_annual_price").single(),
      supabase.from("admin_settings").select("value").eq("key", "premium_whatsapp_number").single(),
    ]).then(([monthly, annual, wa]) => {
      if (monthly.data?.value) setMonthlyPrice(monthly.data.value);
      if (annual.data?.value) setAnnualPrice(annual.data.value);
      if (wa.data?.value) setWhatsappNumber(wa.data.value);
    });
  }, []);

  const waLink = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`Hi! I'm interested in DNA Premium plan. My email: ${user?.email || ""}. Please share details.`)}`;
  const customWaLink = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent("Hi! I want to discuss a custom plan/requirement for Devrayog NDA AI.")}`;
  const annualSaving = (parseInt(monthlyPrice) * 12 - parseInt(annualPrice)).toString();

  if (isPremium && premiumEnabled) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="relative min-h-[60vh] flex items-center justify-center pt-20">
          <div className="relative z-10 text-center px-6">
            <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-5xl md:text-7xl text-gradient-gold mb-4">YOU'RE PREMIUM</h1>
            <p className="text-muted-foreground text-lg mb-6">All AI features are unlocked. Keep pushing, warrior! 💪</p>
            <Link to="/dashboard"><Button className="bg-gradient-gold text-primary-foreground font-bold">Go to Dashboard →</Button></Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px] animate-pulse" />
        <div className="relative z-10 text-center px-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] tracking-[3px] mb-6">
              <Crown className="h-3 w-3 mr-1.5" /> PREMIUM
            </Badge>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="font-display text-5xl md:text-8xl text-gradient-gold leading-none mb-4">
            UNLOCK<br />YOUR POTENTIAL
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-lg mx-auto mb-3">
            Get unlimited AI, complete SSB prep, and everything you need — for less than a chai.
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-gradient-gold mb-2">WHAT YOU GET</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {UPCOMING_FEATURES.map((f, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className="glass-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors">
              <f.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display text-lg mb-1.5">{f.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="glass-card rounded-xl p-8 border border-border">
            <p className="font-mono text-[10px] tracking-[4px] text-muted-foreground uppercase mb-4">Free Plan</p>
            <p className="font-display text-6xl mb-1">₹0</p>
            <p className="font-mono text-xs text-muted-foreground tracking-widest mb-2">FOREVER FREE</p>
            <p className="text-sm text-muted-foreground mb-6 pb-6 border-b border-border">Core study material, daily quiz, and community access.</p>
            <Link to="/signup"><Button variant="outline" className="w-full border-gold text-primary font-bold tracking-wider">Start Free →</Button></Link>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="glass-card rounded-xl p-8 border border-primary/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-gold animate-shimmer" />
            <Badge className="absolute top-4 right-4 bg-primary/10 text-primary font-mono text-[9px] tracking-widest border border-primary/20">
              <Crown className="h-3 w-3 mr-1" /> BEST VALUE
            </Badge>
            <p className="font-mono text-[10px] tracking-[4px] text-primary uppercase mb-4">Premium Plan</p>
            <p className="font-display text-6xl text-gradient-gold mb-1">₹{monthlyPrice}</p>
            <p className="font-mono text-xs text-muted-foreground tracking-widest mb-2">PER MONTH</p>
            <Badge variant="outline" className="border-success/30 text-success font-mono text-[9px] tracking-widest mb-4">
              ₹{annualPrice}/YEAR — SAVE ₹{annualSaving}
            </Badge>
            <p className="text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              Full AI, unlimited tests, complete SSB prep, fitness plan, and the gold premium badge.
            </p>
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-[#25D366] hover:bg-[#1DAA54] text-white font-bold tracking-wider">
                <MessageCircle className="h-4 w-4 mr-2" /> Get Premium via WhatsApp →
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 px-6">
        <h2 className="font-display text-4xl md:text-5xl text-center text-gradient-gold mb-8">FULL COMPARISON</h2>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
            <thead><tr className="bg-secondary">
              <th className="text-left p-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase w-1/2">Feature</th>
              <th className="p-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase text-center">FREE</th>
              <th className="p-4 font-mono text-[10px] tracking-widest text-primary uppercase text-center">PREMIUM</th>
            </tr></thead>
            <tbody>
              {COMPARISON.map((row, i) => {
                if ('section' in row) return <tr key={i} className="bg-primary/5"><td colSpan={3} className="p-3 font-mono text-[10px] tracking-widest text-primary uppercase">{row.section}</td></tr>;
                return (
                  <tr key={i} className="border-b border-border/30 hover:bg-primary/[0.02]">
                    <td className="p-3 text-sm font-medium">{row.feat}</td>
                    <td className="p-3 text-center">{row.free === true ? <Check className="h-4 w-4 text-success mx-auto" /> : row.free === false ? <X className="h-4 w-4 text-destructive/50 mx-auto" /> : <span className="font-mono text-[11px] text-muted-foreground">{row.free}</span>}</td>
                    <td className="p-3 text-center">{row.premium === true ? <Check className="h-4 w-4 text-success mx-auto" /> : <span className="font-mono text-[11px] text-primary font-semibold">{row.premium}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="glass-card rounded-2xl p-8 text-center border border-primary/20">
            <Rocket className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-display text-2xl text-gradient-gold mb-2">GET PREMIUM</h3>
            <p className="text-muted-foreground text-sm mb-6">Message us on WhatsApp to subscribe. Instant activation!</p>
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-[#25D366] hover:bg-[#1DAA54] text-white font-bold tracking-wider">
                <MessageCircle className="h-4 w-4 mr-2" /> Subscribe Now →
              </Button>
            </a>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="glass-card rounded-2xl p-8 text-center border border-border">
            <Crown className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-display text-2xl mb-2">CUSTOM PLAN</h3>
            <p className="text-muted-foreground text-sm mb-6">Need something specific? Custom coaching, bulk pricing for institutes? Let's talk.</p>
            <a href={customWaLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full border-gold text-primary font-bold tracking-wider">
                <MessageCircle className="h-4 w-4 mr-2" /> Discuss Custom Plan →
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 px-6 text-center">
        <p className="font-mono text-[9px] text-muted-foreground/50 tracking-[4px] uppercase">
          ALL CURRENT FEATURES ARE 100% FREE • PREMIUM IS OPTIONAL • NO HIDDEN CHARGES
        </p>
      </section>
      <Footer />
    </div>
  );
}
