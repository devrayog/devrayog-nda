import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Calculator, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const TOPICS = [
  { id: "algebra", name: "Algebra", sub: "Quadratic Equations, Sequences & Series, Complex Numbers", weight: "High", emoji: "📐" },
  { id: "trigonometry", name: "Trigonometry", sub: "Identities, Heights & Distances, Inverse Trig", weight: "High", emoji: "📏" },
  { id: "calculus", name: "Differential Calculus", sub: "Limits, Derivatives, Applications", weight: "Medium", emoji: "∫" },
  { id: "integral-calculus", name: "Integral Calculus", sub: "Definite & Indefinite Integrals, Area", weight: "Medium", emoji: "∑" },
  { id: "coordinate-geometry", name: "Coordinate Geometry", sub: "Straight Lines, Circles, Conics", weight: "High", emoji: "📊" },
  { id: "vectors", name: "Vectors & 3D Geometry", sub: "Dot Product, Cross Product, Lines & Planes", weight: "Medium", emoji: "🎯" },
  { id: "matrices", name: "Matrices & Determinants", sub: "Operations, Inverse, Cramer's Rule", weight: "Medium", emoji: "🔢" },
  { id: "probability", name: "Probability & Statistics", sub: "Conditional Probability, Distributions, Mean/Variance", weight: "High", emoji: "🎲" },
  { id: "sets", name: "Sets & Relations", sub: "Venn Diagrams, Functions, Binary Operations", weight: "Low", emoji: "🔗" },
  { id: "number-system", name: "Number System", sub: "HCF/LCM, Divisibility, Remainders", weight: "Low", emoji: "🔣" },
];

export default function MathsHub() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-gradient-gold">MATHS HUB</h1>
          </div>
          <p className="text-muted-foreground text-sm">AI-recommended topic order based on NDA weightage and your weakness analysis.</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-gold">
            <CardContent className="p-4 flex items-center gap-3">
              <Brain className="h-5 w-5 text-primary" />
              <p className="text-sm"><span className="font-bold text-primary">AI Tip:</span> Start with high-weightage topics first. Your AI tutor will adjust recommendations as you take tests.</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-3">
          {TOPICS.map((topic, i) => (
            <motion.div key={topic.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
              <Link to={`/study/topic/${topic.id}`}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-3xl">{topic.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm">{topic.name}</h3>
                        <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full ${
                          topic.weight === "High" ? "bg-destructive/20 text-destructive" :
                          topic.weight === "Medium" ? "bg-primary/20 text-primary" :
                          "bg-muted text-muted-foreground"
                        }`}>{topic.weight} Weightage</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{topic.sub}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link to="/ai-tutor" className="flex-1">
            <Button className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider">
              <Brain className="h-4 w-4 mr-2" /> Ask AI About Maths
            </Button>
          </Link>
          <Link to="/tests" className="flex-1">
            <Button variant="outline" className="w-full border-gold font-bold tracking-wider">
              Take Maths Test
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
