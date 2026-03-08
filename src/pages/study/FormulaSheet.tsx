import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Calculator, Atom, Triangle } from "lucide-react";
import { motion } from "framer-motion";

interface Formula {
  title: string;
  formula: string;
  notes?: string;
  category: string;
}

const FORMULAS: Record<string, Formula[]> = {
  algebra: [
    { title: "Quadratic Formula", formula: "x = (-b ± √(b²-4ac)) / 2a", notes: "For ax² + bx + c = 0", category: "algebra" },
    { title: "Sum of AP", formula: "Sₙ = n/2 [2a + (n-1)d]", notes: "a = first term, d = common difference", category: "algebra" },
    { title: "Sum of GP", formula: "Sₙ = a(rⁿ-1)/(r-1)", notes: "a = first term, r = common ratio", category: "algebra" },
    { title: "Binomial Theorem", formula: "(a+b)ⁿ = Σ ⁿCᵣ · aⁿ⁻ʳ · bʳ", category: "algebra" },
    { title: "AM ≥ GM ≥ HM", formula: "(a+b)/2 ≥ √(ab) ≥ 2ab/(a+b)", category: "algebra" },
    { title: "Sum of n natural numbers", formula: "Σn = n(n+1)/2", category: "algebra" },
    { title: "Sum of squares", formula: "Σn² = n(n+1)(2n+1)/6", category: "algebra" },
    { title: "Sum of cubes", formula: "Σn³ = [n(n+1)/2]²", category: "algebra" },
  ],
  trigonometry: [
    { title: "Pythagorean Identity", formula: "sin²θ + cos²θ = 1", category: "trigonometry" },
    { title: "Double Angle (sin)", formula: "sin2θ = 2sinθcosθ", category: "trigonometry" },
    { title: "Double Angle (cos)", formula: "cos2θ = cos²θ - sin²θ = 2cos²θ - 1", category: "trigonometry" },
    { title: "Sine Rule", formula: "a/sinA = b/sinB = c/sinC = 2R", category: "trigonometry" },
    { title: "Cosine Rule", formula: "c² = a² + b² - 2ab·cosC", category: "trigonometry" },
    { title: "tan identity", formula: "1 + tan²θ = sec²θ", category: "trigonometry" },
    { title: "Sum formula (sin)", formula: "sin(A±B) = sinAcosB ± cosAsinB", category: "trigonometry" },
    { title: "Sum formula (cos)", formula: "cos(A±B) = cosAcosB ∓ sinAsinB", category: "trigonometry" },
  ],
  calculus: [
    { title: "Power Rule", formula: "d/dx (xⁿ) = nxⁿ⁻¹", category: "calculus" },
    { title: "Product Rule", formula: "d/dx (uv) = u'v + uv'", category: "calculus" },
    { title: "Chain Rule", formula: "d/dx f(g(x)) = f'(g(x))·g'(x)", category: "calculus" },
    { title: "Integration by Parts", formula: "∫u·dv = uv - ∫v·du", category: "calculus" },
    { title: "∫ xⁿ dx", formula: "xⁿ⁺¹/(n+1) + C, n ≠ -1", category: "calculus" },
    { title: "∫ eˣ dx", formula: "eˣ + C", category: "calculus" },
    { title: "∫ sinx dx", formula: "-cosx + C", category: "calculus" },
    { title: "∫ cosx dx", formula: "sinx + C", category: "calculus" },
  ],
  geometry: [
    { title: "Distance Formula", formula: "d = √[(x₂-x₁)² + (y₂-y₁)²]", category: "geometry" },
    { title: "Section Formula", formula: "(mx₂+nx₁)/(m+n), (my₂+ny₁)/(m+n)", notes: "Internal division", category: "geometry" },
    { title: "Area of Triangle", formula: "½|x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)|", category: "geometry" },
    { title: "Slope", formula: "m = (y₂-y₁)/(x₂-x₁)", category: "geometry" },
    { title: "Circle (general)", formula: "x² + y² + 2gx + 2fy + c = 0", notes: "Centre (-g,-f), r = √(g²+f²-c)", category: "geometry" },
    { title: "Straight line", formula: "y - y₁ = m(x - x₁)", notes: "Point-slope form", category: "geometry" },
  ],
  stats: [
    { title: "Mean", formula: "x̄ = Σxᵢ / n", category: "stats" },
    { title: "Variance", formula: "σ² = Σ(xᵢ - x̄)² / n", category: "stats" },
    { title: "Standard Deviation", formula: "σ = √(Σ(xᵢ - x̄)² / n)", category: "stats" },
    { title: "Permutation", formula: "ⁿPᵣ = n! / (n-r)!", category: "stats" },
    { title: "Combination", formula: "ⁿCᵣ = n! / [r!(n-r)!]", category: "stats" },
    { title: "P(A∪B)", formula: "P(A) + P(B) - P(A∩B)", category: "stats" },
    { title: "Bayes' Theorem", formula: "P(A|B) = P(B|A)·P(A) / P(B)", category: "stats" },
  ],
};

const TAB_ICONS: Record<string, React.ReactNode> = {
  algebra: <Calculator className="h-4 w-4" />,
  trigonometry: <Triangle className="h-4 w-4" />,
  calculus: <Atom className="h-4 w-4" />,
  geometry: <Triangle className="h-4 w-4" />,
  stats: <Calculator className="h-4 w-4" />,
};

export default function FormulaSheet() {
  const [search, setSearch] = useState("");

  const filterFormulas = (formulas: Formula[]) =>
    formulas.filter(f => !search || f.title.toLowerCase().includes(search.toLowerCase()) || f.formula.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-gradient-gold">FORMULA SHEET</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search formulas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <Tabs defaultValue="algebra">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            {Object.keys(FORMULAS).map(key => (
              <TabsTrigger key={key} value={key} className="capitalize text-xs gap-1">
                {TAB_ICONS[key]} {key}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(FORMULAS).map(([key, formulas]) => (
            <TabsContent key={key} value={key} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filterFormulas(formulas).map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="glass-card border-gold hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">{f.title}</p>
                        <p className="font-display text-xl text-foreground mb-1">{f.formula}</p>
                        {f.notes && <p className="text-xs text-muted-foreground">{f.notes}</p>}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {filterFormulas(formulas).length === 0 && (
                  <p className="text-muted-foreground text-sm col-span-2 text-center py-8">No formulas match your search.</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
