import { useState, useEffect } from "react";
import { PremiumButton } from "@/components/PremiumGate";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Brain, RefreshCw, Newspaper, ExternalLink, Calendar, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const CATEGORIES = [
  { value: "all", label: "All", emoji: "📰" },
  { value: "national", label: "National", emoji: "🇮🇳" },
  { value: "international", label: "International", emoji: "🌍" },
  { value: "defence", label: "Defence", emoji: "🎖️" },
  { value: "science", label: "Science", emoji: "🔬" },
  { value: "sports", label: "Sports", emoji: "🏆" },
  { value: "economy", label: "Economy", emoji: "💰" },
  { value: "polity", label: "Polity", emoji: "⚖️" },
];

interface Article {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  link: string | null;
  category: string;
  is_featured: boolean;
  published_at: string;
}

export default function CurrentAffairs() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const meta = user?.user_metadata || {};
  const [articles, setArticles] = useState<Article[]>([]);
  const [aiContent, setAiContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [filterCat, setFilterCat] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("current_affairs").select("*").eq("is_active", true)
      .order("published_at", { ascending: false }).order("is_featured", { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setArticles(data as Article[]); setLoadingArticles(false); });
  }, []);

  const featured = articles.filter(a => a.is_featured);
  const filtered = filterCat === "all" ? articles.filter(a => !a.is_featured) : articles.filter(a => a.category === filterCat && !a.is_featured);

  const generateAI = async () => {
    setLoading(true);
    setAiContent("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Generate today's current affairs for NDA exam preparation using markdown. Include ## headers for: National, International, Defence, Science & Tech, Sports. For each item give a one-liner and why it matters for NDA. Include 2-3 quick quiz questions at the end." }],
          userContext: { name: meta.full_name, medium: meta.medium, language },
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("Failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) { text += c; setAiContent(text); } } catch {}
        }
      }
    } catch { setAiContent("Failed to load current affairs. Please try again."); }
    setLoading(false);
  };

  const catColor = (cat: string) => {
    const map: Record<string, string> = {
      national: "bg-primary/20 text-primary",
      international: "bg-accent/20 text-accent",
      defence: "bg-success/20 text-success",
      science: "bg-cyan/20 text-cyan",
      sports: "bg-warning/20 text-warning",
      economy: "bg-primary/20 text-primary",
      polity: "bg-destructive/20 text-destructive",
    };
    return map[cat] || "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Newspaper className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-gradient-gold">CURRENT AFFAIRS</h1>
              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Featured */}
        {featured.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <div className="grid md:grid-cols-2 gap-4">
              {featured.map((a, i) => (
                <motion.div key={a.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                  <Card className="glass-card border-gold ring-1 ring-primary/20 overflow-hidden group cursor-pointer hover:ring-primary/40 transition-all" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                    {a.image_url && (
                      <div className="h-40 overflow-hidden">
                        <img src={a.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                        <span className="text-[9px] font-mono tracking-wider uppercase text-primary">Featured</span>
                        <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full ${catColor(a.category)}`}>{a.category}</span>
                      </div>
                      <h3 className="font-bold text-base mb-1">{a.title}</h3>
                      <AnimatePresence>
                        {expandedId === a.id ? (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <p className="text-sm text-muted-foreground leading-relaxed mt-2">{a.body}</p>
                            {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-2"><ExternalLink className="h-3 w-3" /> Read more</a>}
                          </motion.div>
                        ) : (
                          <p className="text-xs text-muted-foreground line-clamp-2">{a.body}</p>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Filters */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <Button key={c.value} size="sm" variant={filterCat === c.value ? "default" : "outline"} onClick={() => setFilterCat(c.value)}
              className={filterCat === c.value ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
              <span className="mr-1">{c.emoji}</span> {c.label}
            </Button>
          ))}
        </motion.div>

        {/* Articles List */}
        {loadingArticles ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-3">
            {filtered.map((a, i) => (
              <motion.div key={a.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 3}>
                <Card className="glass-card border-gold hover:scale-[1.005] transition-transform cursor-pointer" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                  <CardContent className="p-4 flex items-start gap-4">
                    {a.image_url && <img src={a.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full ${catColor(a.category)}`}>{a.category}</span>
                        <span className="text-[10px] text-muted-foreground">{a.published_at}</span>
                      </div>
                      <h3 className="font-bold text-sm">{a.title}</h3>
                      <AnimatePresence>
                        {expandedId === a.id ? (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <p className="text-sm text-muted-foreground leading-relaxed mt-2">{a.body}</p>
                            {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-2" onClick={e => e.stopPropagation()}><ExternalLink className="h-3 w-3" /> Source</a>}
                          </motion.div>
                        ) : (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{a.body}</p>
                        )}
                      </AnimatePresence>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform ${expandedId === a.id ? "rotate-90" : ""}`} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : articles.length === 0 ? null : (
          <p className="text-muted-foreground text-sm text-center py-4">No articles in this category.</p>
        )}

        {/* AI Fallback */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <Card className="glass-card border-gold overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg text-gradient-gold">AI-CURATED NEWS</h2>
                </div>
                <Button size="sm" onClick={generateAI} disabled={loading} className="bg-gradient-gold text-primary-foreground font-bold">
                  <RefreshCw className={`h-3 w-3 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                  {aiContent ? "Refresh" : "Generate"}
                </Button>
              </div>
              {!aiContent && !loading && (
                <p className="text-muted-foreground text-sm text-center py-4">Click "Generate" for AI-curated current affairs relevant to NDA.</p>
              )}
              {loading && !aiContent && (
                <div className="flex gap-1.5 justify-center py-6">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
              )}
              {aiContent && (
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed prose-headings:font-display prose-headings:text-primary prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2 prose-strong:text-primary prose-li:marker:text-primary">
                  <ReactMarkdown>{aiContent}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
