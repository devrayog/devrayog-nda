import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calculator, Atom, Triangle, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Static fallback formulas
const STATIC_FORMULAS: Record<string, { title: string; formula: string; notes?: string; category: string }[]> = {
  algebra: [
    { title: "Quadratic Formula", formula: "x = (-b ± √(b²-4ac)) / 2a", notes: "For ax² + bx + c = 0", category: "algebra" },
    { title: "Sum of AP", formula: "Sₙ = n/2 [2a + (n-1)d]", category: "algebra" },
    { title: "Sum of GP", formula: "Sₙ = a(rⁿ-1)/(r-1)", category: "algebra" },
    { title: "Binomial Theorem", formula: "(a+b)ⁿ = Σ ⁿCᵣ · aⁿ⁻ʳ · bʳ", category: "algebra" },
  ],
  trigonometry: [
    { title: "Pythagorean Identity", formula: "sin²θ + cos²θ = 1", category: "trigonometry" },
    { title: "Double Angle (sin)", formula: "sin2θ = 2sinθcosθ", category: "trigonometry" },
    { title: "Sine Rule", formula: "a/sinA = b/sinB = c/sinC = 2R", category: "trigonometry" },
    { title: "Cosine Rule", formula: "c² = a² + b² - 2ab·cosC", category: "trigonometry" },
  ],
  calculus: [
    { title: "Power Rule", formula: "d/dx (xⁿ) = nxⁿ⁻¹", category: "calculus" },
    { title: "Product Rule", formula: "d/dx (uv) = u'v + uv'", category: "calculus" },
    { title: "Chain Rule", formula: "d/dx f(g(x)) = f'(g(x))·g'(x)", category: "calculus" },
    { title: "Integration by Parts", formula: "∫u·dv = uv - ∫v·du", category: "calculus" },
  ],
  geometry: [
    { title: "Distance Formula", formula: "d = √[(x₂-x₁)² + (y₂-y₁)²]", category: "geometry" },
    { title: "Section Formula", formula: "(mx₂+nx₁)/(m+n), (my₂+ny₁)/(m+n)", category: "geometry" },
    { title: "Area of Triangle", formula: "½|x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)|", category: "geometry" },
  ],
};

const SORT_OPTIONS = ["all", "short_tricks", "important", "basics", "advanced"];
const CATEGORY_OPTIONS = ["algebra", "trigonometry", "calculus", "geometry", "stats", "short_tricks", "important"];

interface DBFormula {
  id: string;
  title: string;
  body: string;
  link: string;
  category: string;
  image_url: string | null;
  sort_order: number;
}

export default function FormulaSheet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sortFilter, setSortFilter] = useState("all");
  const [dbFormulas, setDbFormulas] = useState<DBFormula[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "algebra", link: "", image_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("resources").select("*").eq("type", "formula").eq("is_active", true).order("sort_order")
      .then(({ data }) => setDbFormulas((data as DBFormula[]) || []));
    if (user) {
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
        .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); });
    }
  }, [user]);

  const addFormula = async () => {
    if (!form.title || !form.body) return;
    setSaving(true);
    const { error } = await supabase.from("resources").insert({
      title: form.title, body: form.body, category: form.category,
      link: form.link || "", image_url: form.image_url || null,
      type: "formula", sort_order: dbFormulas.length,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Formula added!" });
      setShowAdd(false);
      setForm({ title: "", body: "", category: "algebra", link: "", image_url: "" });
      const { data } = await supabase.from("resources").select("*").eq("type", "formula").eq("is_active", true).order("sort_order");
      setDbFormulas((data as DBFormula[]) || []);
    }
    setSaving(false);
  };

  const deleteFormula = async (id: string) => {
    await supabase.from("resources").update({ is_active: false }).eq("id", id);
    setDbFormulas(prev => prev.filter(f => f.id !== id));
    toast({ title: "Formula removed" });
  };

  // Merge static + DB formulas
  const allCategories = new Set([...Object.keys(STATIC_FORMULAS), ...dbFormulas.map(f => f.category)]);
  const getFormulas = (cat: string) => {
    const staticF = (STATIC_FORMULAS[cat] || []).map(f => ({ ...f, id: f.title, isStatic: true }));
    const dbF = dbFormulas.filter(f => f.category === cat).map(f => ({
      title: f.title, formula: f.body, notes: f.link, category: f.category, id: f.id, isStatic: false, image_url: f.image_url,
    }));
    let merged = [...dbF, ...staticF];
    if (search) merged = merged.filter(f => f.title.toLowerCase().includes(search.toLowerCase()) || f.formula.toLowerCase().includes(search.toLowerCase()));
    if (sortFilter !== "all") merged = merged.filter(f => f.category === sortFilter || f.notes?.includes(sortFilter));
    return merged;
  };

  const categories = [...allCategories];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-gradient-gold">FORMULA SHEET</h1>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowAdd(true)} size="sm" className="bg-gradient-gold text-primary-foreground font-bold">
              <Plus className="h-4 w-4 mr-1" /> Add Formula
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search formulas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
          </div>
          <Select value={sortFilter} onValueChange={setSortFilter}>
            <SelectTrigger className="w-40 border-border"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => <SelectItem key={o} value={o}>{o === "all" ? "All" : o.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue={categories[0] || "algebra"}>
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            {categories.map(key => (
              <TabsTrigger key={key} value={key} className="capitalize text-xs">{key}</TabsTrigger>
            ))}
          </TabsList>

          {categories.map(key => (
            <TabsContent key={key} value={key} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getFormulas(key).map((f: any, i: number) => (
                  <motion.div key={f.id + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="glass-card border-gold hover:border-primary/50 transition-colors relative">
                      {isAdmin && !f.isStatic && (
                        <Button size="sm" variant="ghost" className="absolute top-2 right-2 text-destructive h-6 w-6 p-0" onClick={() => deleteFormula(f.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      <CardContent className="p-4">
                        <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">{f.title}</p>
                        <p className="font-display text-xl text-foreground mb-1">{f.formula}</p>
                        {f.notes && <p className="text-xs text-muted-foreground">{f.notes}</p>}
                        {f.image_url && <img src={f.image_url} alt={f.title} className="mt-2 rounded-lg max-h-32 object-contain" />}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {getFormulas(key).length === 0 && <p className="text-muted-foreground text-sm col-span-2 text-center py-8">No formulas match.</p>}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Add Formula Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Formula</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label className="text-xs">Formula / Content</Label><Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} /></div>
              <div><Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Notes / Tags (optional)</Label><Input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="short_tricks, important..." /></div>
              <div><Label className="text-xs">Image URL (optional)</Label><Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button onClick={addFormula} disabled={saving} className="bg-gradient-gold text-primary-foreground font-bold">{saving ? "Saving..." : "Add Formula"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
