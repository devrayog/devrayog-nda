import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, ArrowRight, Check, X, Crown, Zap, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const FREE_FEATURES = [
  "Basic study material — all subjects",
  "2 full mock tests per month",
  "Daily quiz — 10 questions",
  "Current affairs — 5 news preview daily",
  "Community forum access",
  "Medical + Physical standards info",
  "Last 3 years previous papers",
  "Basic AI suggestions — 3/day",
];
const FREE_MISSING = [
  "Full AI personalization",
  "SSB complete preparation",
  "Unlimited mock tests",
  "Premium gold badge",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Full AI personalization — unlimited",
  "Complete DNA Score + predictions",
  "Unlimited mock tests",
  "Full 15 years previous papers",
  "Complete SSB preparation — all sections",
  "12-week physical fitness plan",
  "Full daily current affairs + archive + PDF",
  "Accountability partner system",
  "Video solutions — all subjects",
  "Mentor connect — 1 on 1 sessions",
  "Gold ⭐ PREMIUM badge on profile",
  "Girls specific content section",
  "Full analytics — all time history",
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
  const waLink = `https://wa.me/918233801406?text=${encodeURIComponent("Hi! I want to upgrade to DNA Premium (₹11/month). My registered email: ")}`;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(hsl(var(--gold) / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold) / 0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 text-center px-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <p className="font-mono text-[10px] tracking-[4px] text-primary uppercase mb-5">Pricing</p>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="font-display text-5xl md:text-8xl text-gradient-gold leading-none mb-4">
            FREE VS<br />PREMIUM
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-muted-foreground text-lg italic max-w-lg mx-auto">
            Less than the cost of a chai. More than any coaching centre gives you.
          </motion.p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-16 px-6">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="glass-card rounded-xl p-8 border border-border">
            <p className="font-mono text-[10px] tracking-[4px] text-muted-foreground uppercase mb-4">Free Plan</p>
            <p className="font-display text-6xl mb-1">₹0</p>
            <p className="font-mono text-xs text-muted-foreground tracking-widest mb-2">FOREVER FREE</p>
            <p className="text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              Start your NDA journey without spending a rupee. Get access to core study material, daily quiz, and community.
            </p>
            <Link to="/signup">
              <Button variant="outline" className="w-full border-gold text-primary font-bold tracking-wider mb-6">Start Free →</Button>
            </Link>
            <div className="space-y-2.5">
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /><span>{f}</span></div>
              ))}
              {FREE_MISSING.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground"><X className="h-4 w-4 text-destructive/50 shrink-0 mt-0.5" /><span>{f}</span></div>
              ))}
            </div>
          </motion.div>

          {/* Premium */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="glass-card rounded-xl p-8 border border-primary relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-gold animate-shimmer" />
            <Badge className="absolute top-4 right-4 bg-gradient-gold text-primary-foreground font-mono text-[9px] tracking-widest">⭐ RECOMMENDED</Badge>
            <p className="font-mono text-[10px] tracking-[4px] text-primary uppercase mb-4">Premium Plan</p>
            <p className="font-display text-6xl text-gradient-gold mb-1">₹11</p>
            <p className="font-mono text-xs text-muted-foreground tracking-widest mb-2">PER MONTH</p>
            <Badge variant="outline" className="border-success/30 text-success font-mono text-[9px] tracking-widest mb-4">₹108/YEAR — SAVE ₹24</Badge>
            <p className="text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              Everything in free, plus full AI, unlimited tests, complete SSB prep, fitness plan, and the gold premium badge.
            </p>
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-[#25D366] hover:bg-[#1DAA54] text-white font-bold tracking-wider mb-6">
                <MessageCircle className="h-4 w-4 mr-2" /> Get Premium via WhatsApp →
              </Button>
            </a>
            <div className="space-y-2.5">
              {PREMIUM_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /><span>{f}</span></div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          className="font-display text-4xl md:text-5xl text-center text-gradient-gold mb-2">FULL COMPARISON</motion.h2>
        <p className="text-center text-muted-foreground text-sm mb-10">Every single feature compared side by side. No hidden limits.</p>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left p-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase w-1/2">Feature</th>
                <th className="p-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase text-center">FREE</th>
                <th className="p-4 font-mono text-[10px] tracking-widest text-primary uppercase text-center">PREMIUM ⭐</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => {
                if ('section' in row) {
                  return (
                    <tr key={i} className="bg-primary/5">
                      <td colSpan={3} className="p-3 font-mono text-[10px] tracking-widest text-primary uppercase">{row.section}</td>
                    </tr>
                  );
                }
                return (
                  <tr key={i} className="border-b border-border/30 hover:bg-primary/[0.02] transition-colors">
                    <td className="p-3 text-sm font-medium">{row.feat}</td>
                    <td className="p-3 text-center">
                      {row.free === true ? <Check className="h-4 w-4 text-success mx-auto" /> :
                       row.free === false ? <X className="h-4 w-4 text-destructive/50 mx-auto" /> :
                       <span className="font-mono text-[11px] text-muted-foreground">{row.free}</span>}
                    </td>
                    <td className="p-3 text-center">
                      {row.premium === true ? <Check className="h-4 w-4 text-success mx-auto" /> :
                       <span className="font-mono text-[11px] text-primary font-semibold">{row.premium}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          className="glass-card rounded-2xl p-12 max-w-3xl mx-auto text-center border border-primary relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-gold" />
          <p className="font-mono text-[10px] tracking-[4px] text-primary uppercase mb-3">⭐ Get Premium Now</p>
          <h2 className="font-display text-4xl text-gradient-gold mb-2">3 SIMPLE STEPS</h2>
          <p className="text-muted-foreground text-lg mb-8">Just <span className="font-display text-3xl text-gradient-gold">₹11/month</span> or ₹108/year</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            {[
              { num: "1", text: "Click WhatsApp button below" },
              { num: "2", text: "Send your email + payment screenshot" },
              { num: "3", text: "Premium activated within 10 minutes" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="glass-card rounded-lg p-4 text-center min-w-[160px]">
                  <span className="font-display text-3xl text-gradient-gold block">{step.num}</span>
                  <span className="text-xs text-muted-foreground">{step.text}</span>
                </div>
                {i < 2 && <span className="text-primary/30 hidden md:block text-xl">→</span>}
              </div>
            ))}
          </div>

          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-[#25D366] hover:bg-[#1DAA54] text-white font-bold tracking-wider text-lg px-10 py-6">
              <MessageCircle className="h-5 w-5 mr-2" /> Message on WhatsApp →
            </Button>
          </a>
          <p className="font-mono text-[10px] text-muted-foreground tracking-wider mt-4">
            UPI / PAYTM / BANK TRANSFER ACCEPTED<br />INSTANT ACTIVATION • CANCEL ANYTIME
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
