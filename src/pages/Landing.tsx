import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Brain, Shield, Globe, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const HERO_BG = "https://images.unsplash.com/photo-1579912009826-c0570be40a1f?w=1920&q=80";
const CADET_IMG = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80";
const NDA_CAMPUS = "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=600&q=80";

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    { icon: Brain, title: t("landing.f1_title"), desc: t("landing.f1_desc"), color: "text-primary" },
    { icon: Shield, title: t("landing.f2_title"), desc: t("landing.f2_desc"), color: "text-accent" },
    { icon: Globe, title: t("landing.f3_title"), desc: t("landing.f3_desc"), color: "text-cyan" },
    { icon: BarChart3, title: t("landing.f4_title"), desc: t("landing.f4_desc"), color: "text-success" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="NDA Campus" className="w-full h-full object-cover opacity-20" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center py-20">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/logo.png" alt="DNA Logo" className="w-16 h-16 md:w-20 md:h-20 rounded-xl animate-pulse-gold" />
            </div>
          </motion.div>

          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-mono text-sm md:text-base text-primary tracking-[6px] mb-4"
          >
            {t("landing.tagline")}
          </motion.p>

          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="font-display text-4xl md:text-7xl lg:text-8xl text-gradient-gold leading-tight mb-6"
          >
            {t("landing.hero_title")}
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium leading-relaxed"
          >
            {t("landing.hero_sub")}
          </motion.p>

          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-gold text-primary-foreground font-bold tracking-widest text-lg px-8 py-6 shadow-gold hover:scale-105 transition-transform">
                {t("landing.cta_start")} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-gold text-primary font-semibold tracking-wider px-8 py-6">
                {t("landing.cta_login")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gold">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: t("landing.stats_students") },
              { value: "50K+", label: t("landing.stats_questions") },
              { value: "200+", label: t("landing.stats_tests") },
              { value: "500+", label: t("landing.stats_selections") },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="text-center"
              >
                <div className="font-display text-4xl md:text-5xl text-gradient-gold">{stat.value}</div>
                <div className="font-mono text-xs text-muted-foreground tracking-widest mt-2 uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={0}
            className="font-display text-3xl md:text-5xl text-center text-gradient-gold mb-16"
          >
            {t("landing.features_title")}
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="glass-card rounded-xl p-8 hover:scale-[1.02] transition-transform"
              >
                <f.icon className={`h-10 w-10 ${f.color} mb-4`} />
                <h3 className="font-display text-2xl mb-2">{f.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Military imagery section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={0}
            >
              <h2 className="font-display text-3xl md:text-5xl text-gradient-gold mb-6">BUILT BY AN NDA ASPIRANT, FOR NDA ASPIRANTS</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                The founder went through the NDA process — written exam, SSB interview, screen-out experiences. Every feature comes from real battlefield knowledge, not textbook theory.
              </p>
              <div className="space-y-3">
                {["Real SSB screen-out analysis", "AI trained on NDA patterns", "Hindi medium fully supported", "₹11/month — affordable for every aspirant"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-semibold">
                    <span className="text-success">✓</span> {item}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={1}
              className="grid grid-cols-2 gap-4"
            >
              <img src={CADET_IMG} alt="Military training" className="rounded-xl w-full h-48 object-cover border border-gold" loading="lazy" />
              <img src={NDA_CAMPUS} alt="Defence academy" className="rounded-xl w-full h-48 object-cover border border-gold mt-8" loading="lazy" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={0}
            className="glass-card rounded-2xl p-12 max-w-2xl mx-auto"
          >
            <h2 className="font-display text-4xl text-gradient-gold mb-4">READY TO JOIN DNA?</h2>
            <p className="text-muted-foreground mb-8">100% free to start. No card needed. AI builds your profile from Day 1.</p>
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-gold text-primary-foreground font-bold tracking-widest text-lg px-10 py-6 shadow-gold">
                START MY NDA JOURNEY <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
