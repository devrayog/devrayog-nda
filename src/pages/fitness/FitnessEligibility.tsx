import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertTriangle, Dumbbell, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

const MOTIVATION_QUOTES = [
  "Pain is temporary. Pride is forever. — Marines",
  "The only easy day was yesterday. — Navy SEALs",
  "Sweat saves blood. — Erwin Rommel",
  "Physical fitness is not only the key to a healthy body, it is the basis of dynamic and creative intellectual activity.",
  "The harder you train, the luckier you get.",
  "Don't count the days. Make the days count.",
];

const DEFAULT_CARDS = [
  { icon: "🏃", label: "1.6km Run", value: "7:30", description: "Must complete 1.6km within 7 min 30 sec. Target under 7 min." },
  { icon: "💪", label: "Push-ups", value: "20+", description: "Minimum 20 push-ups in one go. Target 40+ for SSB." },
  { icon: "🏋️", label: "Pull-ups", value: "8+", description: "Minimum 8 pull-ups. Target 12+ for SSB obstacle tasks." },
  { icon: "🧘", label: "Sit-ups", value: "30+", description: "30 sit-ups in 2 minutes minimum. Target 50+." },
  { icon: "⚖️", label: "BMI", value: "Normal", description: "BMI between 18.5–24.9. Obese candidates are rejected." },
  { icon: "🏊", label: "Swimming (Navy)", value: "Required", description: "Basic swimming ability required for Naval Academy cadets." },
];

const RUNNING_TABLE = [
  { time: "Under 6:00 min", level: "Excellent", eligible: true, action: "Maintain and focus on studies" },
  { time: "6:00 – 6:30 min", level: "Very Good", eligible: true, action: "Keep training, improve further" },
  { time: "6:30 – 7:00 min", level: "Good", eligible: true, action: "Train 3–4 times per week" },
  { time: "7:00 – 7:30 min", level: "Average", eligible: null, action: "Increase running intensity now" },
  { time: "7:30 – 8:30 min", level: "Below Avg", eligible: false, action: "Daily running — urgent improvement needed" },
  { time: "Above 8:30 min", level: "Poor", eligible: false, action: "Immediate intensive training required" },
];

interface FitnessStd { key: string; label: string; value: string; icon: string; description: string; category: string; }

export default function FitnessEligibility() {
  const [standards, setStandards] = useState<FitnessStd[]>([]);
  const [runTime, setRunTime] = useState("");
  const [pushups, setPushups] = useState("");
  const [pullups, setPullups] = useState("");
  const [situps, setSitups] = useState("");
  const [result, setResult] = useState<{ areas: string[]; passed: boolean; quote: string } | null>(null);

  useEffect(() => {
    supabase.from("fitness_standards").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setStandards((data as any[]) || []));
  }, []);

  const minimums = standards.filter(s => s.category === "minimum");
  const cards = standards.filter(s => s.category === "card");
  const displayCards = cards.length > 0 ? cards : DEFAULT_CARDS;

  const getMinimum = (key: string, fallback: number) => {
    const found = minimums.find(m => m.key === key);
    return found ? parseFloat(found.value) : fallback;
  };

  const checkFitness = () => {
    const areas: string[] = [];
    const minRun = getMinimum("run_time_seconds", 450); // 7:30
    const minPushups = getMinimum("pushups", 20);
    const minPullups = getMinimum("pullups", 8);
    const minSitups = getMinimum("situps", 30);

    const runSec = parseFloat(runTime) || 0;
    const pu = parseInt(pushups) || 0;
    const pl = parseInt(pullups) || 0;
    const su = parseInt(situps) || 0;

    if (runSec > minRun) areas.push(`Running needs urgent work — target under ${Math.floor(minRun / 60)}:${(minRun % 60).toString().padStart(2, "0")} min`);
    if (pu < minPushups) areas.push(`Increase push-ups — minimum ${minPushups} required`);
    if (pl < minPullups) areas.push(`Build pull-up strength — minimum ${minPullups} required`);
    if (su < minSitups) areas.push(`Improve sit-ups — minimum ${minSitups} required`);

    const quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    setResult({ areas, passed: areas.length === 0, quote });
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl text-gradient-gold">AM I PHYSICALLY ELIGIBLE?</h1>
          </div>
          <p className="text-muted-foreground text-sm">Check if you meet NDA physical fitness standards</p>
        </motion.div>

        {/* Fitness Check Form */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-gold">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-display text-lg text-gradient-gold">CHECK YOUR FITNESS LEVEL</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">1.6km Run Time (seconds)</Label><Input type="number" value={runTime} onChange={e => setRunTime(e.target.value)} placeholder="e.g. 450 (7:30)" /></div>
                <div><Label className="text-xs">Push-ups (count)</Label><Input type="number" value={pushups} onChange={e => setPushups(e.target.value)} placeholder="e.g. 25" /></div>
                <div><Label className="text-xs">Pull-ups (count)</Label><Input type="number" value={pullups} onChange={e => setPullups(e.target.value)} placeholder="e.g. 10" /></div>
                <div><Label className="text-xs">Sit-ups (count in 2 min)</Label><Input type="number" value={situps} onChange={e => setSitups(e.target.value)} placeholder="e.g. 35" /></div>
              </div>
              <Button onClick={checkFitness} className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                <Zap className="h-4 w-4 mr-2" /> CHECK MY FITNESS LEVEL →
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className={`glass-card ${result.passed ? "border-success/50 bg-success/5" : "border-destructive/50 bg-destructive/5"}`}>
              <CardContent className="p-6">
                {result.passed ? (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                    <h2 className="font-display text-2xl text-success mb-2">YOU'RE FIT! ✅</h2>
                    <p className="text-sm text-muted-foreground">You meet all minimum fitness requirements for NDA. Keep training to stay ahead!</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                      <h2 className="font-display text-xl text-destructive">AREAS TO IMPROVE</h2>
                    </div>
                    {result.areas.map((area, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm">{area}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
                  <p className="text-sm italic text-primary font-medium">"{result.quote}"</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Fitness Cards */}
        <h2 className="font-display text-lg text-gradient-gold">FITNESS STANDARDS</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {displayCards.map((card, i) => (
            <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
              <Card className="glass-card border-gold h-full">
                <CardContent className="p-4 text-center">
                  <span className="text-3xl">{card.icon}</span>
                  <p className="font-display text-2xl text-gradient-gold mt-2">{card.value}</p>
                  <p className="font-bold text-xs mt-1">{card.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Running Time Table */}
        <h2 className="font-display text-lg text-gradient-gold">1.6KM RUNNING STANDARDS</h2>
        <Card className="glass-card border-gold">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead className="text-xs">Time (1.6km)</TableHead><TableHead className="text-xs">Level</TableHead><TableHead className="text-xs">NDA Eligibility</TableHead><TableHead className="text-xs">Action</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {RUNNING_TABLE.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium">{row.time}</TableCell>
                    <TableCell className="text-xs">{row.level}</TableCell>
                    <TableCell>
                      {row.eligible === true && <Badge className="bg-success/20 text-success text-[9px]">✓ Pass</Badge>}
                      {row.eligible === false && <Badge className="bg-destructive/20 text-destructive text-[9px]">✗ Fail</Badge>}
                      {row.eligible === null && <Badge className="bg-warning/20 text-warning text-[9px]">⚠ Borderline</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
