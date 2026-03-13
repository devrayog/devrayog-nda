import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertTriangle, HeartPulse, Eye, Ruler, Weight, Ear, Stethoscope, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

const HEIGHT_WEIGHT_TABLE = [
  { height: 152, minW: 42, maxW: 54 }, { height: 155, minW: 44, maxW: 57 }, { height: 157, minW: 46, maxW: 59 },
  { height: 160, minW: 48, maxW: 61 }, { height: 163, minW: 50, maxW: 64 }, { height: 165, minW: 52, maxW: 66 },
  { height: 168, minW: 54, maxW: 69 }, { height: 170, minW: 56, maxW: 71 }, { height: 173, minW: 58, maxW: 74 },
  { height: 175, minW: 60, maxW: 77 }, { height: 178, minW: 62, maxW: 80 }, { height: 180, minW: 65, maxW: 83 },
];

const VISION_TABLE = [
  { service: "Army", better: "6/6 or 6/9", worse: "6/36", glasses: "Allowed (max ±3.5D)" },
  { service: "Navy", better: "6/6 or 6/9", worse: "6/18", glasses: "Not allowed (must correct)" },
  { service: "Air Force", better: "6/6", worse: "6/6", glasses: "NOT allowed" },
];

const GENERAL_HEALTH = [
  { criteria: "Blood Pressure", requirement: "Normal range — 120/80 approx", fail: "Rejected" },
  { criteria: "Flat Foot", requirement: "Not allowed — Grade I may be acceptable", fail: "Rejected (Grade II+)" },
  { criteria: "Knock Knee", requirement: "Must be within normal limits", fail: "Rejected" },
  { criteria: "Varicose Veins", requirement: "Not allowed", fail: "Rejected" },
  { criteria: "Squint", requirement: "Not allowed — Surgery can help", fail: "Rejected if uncorrected" },
  { criteria: "Dental", requirement: "No decayed teeth, good oral hygiene", fail: "Deferred — fix before medical" },
  { criteria: "Tattoo", requirement: "Only on areas covered by uniform", fail: "Rejected if visible" },
  { criteria: "Skin Diseases", requirement: "No active chronic skin conditions", fail: "Rejected" },
  { criteria: "BMI", requirement: "Normal range — not obese", fail: "Rejected if obese" },
  { criteria: "Hernia", requirement: "Not allowed — surgery required", fail: "Rejected if present" },
];

const REJECTION_REASONS = [
  { icon: "👁️", title: "Poor Eyesight / High Power", desc: "High myopia (above ±3.5D) or colour blindness. Check your power well in advance and explore LASIK if eligible." },
  { icon: "⚖️", title: "Underweight or Overweight", desc: "Not fitting the height-weight chart. Start working on it 3-6 months before medical." },
  { icon: "🦶", title: "Flat Foot (Grade II or III)", desc: "Second most common rejection. Check your arch early — treatment available." },
  { icon: "🦷", title: "Dental Issues", desc: "Decayed teeth or poor dental hygiene leads to deferment. Get a dental checkup." },
  { icon: "🩸", title: "Blood Pressure Issues", desc: "Nervousness can spike BP. Practice staying calm. Don't drink caffeine before medical." },
  { icon: "🎨", title: "Visible Tattoo", desc: "Tattoos on hands, neck, face — consult before applying." },
];

const PREP_TIPS = [
  { when: "6 Months Before", tip: "Full medical checkup. Check eyesight. Start height-weight correction. Fix flat foot. Visit dentist." },
  { when: "3 Months Before", tip: "Maintain correct BMI. Avoid risky activities. No new tattoos. Complete dental work." },
  { when: "1 Month Before", tip: "Clean ears. Good sleep. No alcohol. Light activity. Practice staying calm." },
  { when: "Day of Medical", tip: "No caffeine. Eat light breakfast. Drink water. Arrive early. Stay calm." },
];

export default function MedicalEligibility() {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [betterEye, setBetterEye] = useState("6/6");
  const [glasses, setGlasses] = useState("none");
  const [result, setResult] = useState<{ issues: string[]; passed: boolean } | null>(null);

  const checkEligibility = () => {
    const issues: string[] = [];
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;
    const minHeight = gender === "male" ? 157 : 152;

    if (h < minHeight) issues.push(`Height ${h} cm is below minimum ${minHeight} cm for ${gender}`);

    const hwRow = HEIGHT_WEIGHT_TABLE.find(r => Math.abs(r.height - h) <= 2);
    if (hwRow && w < hwRow.minW) issues.push(`Weight ${w} kg is underweight for height ${h} cm (min: ${hwRow.minW} kg)`);
    if (hwRow && w > hwRow.maxW) issues.push(`Weight ${w} kg is overweight for height ${h} cm (max: ${hwRow.maxW} kg)`);

    if (betterEye === "6/18" || betterEye === "worse") issues.push("Eyesight below acceptable standards — may need correction or LASIK");
    if (glasses === "high") issues.push("High power glasses (above ±3.5D) — may be rejected for most branches");
    if (glasses === "lasik") issues.push("LASIK accepted for Army & Navy only — NOT for Air Force");

    setResult({ issues, passed: issues.length === 0 });
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <HeartPulse className="h-8 w-8 text-destructive" />
            <h1 className="font-display text-4xl text-gradient-gold">AM I MEDICALLY FIT?</h1>
          </div>
          <p className="text-muted-foreground text-sm">Complete medical eligibility check for NDA</p>
        </motion.div>

        {/* Eligibility Check Form */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-gold">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Gender</Label>
                  <Select value={gender} onValueChange={setGender}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select>
                </div>
                <div><Label className="text-xs">Age (years)</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="18" /></div>
                <div><Label className="text-xs">Height (cm)</Label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" /></div>
                <div><Label className="text-xs">Weight (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="65" /></div>
                <div><Label className="text-xs">Eyesight — Better Eye</Label>
                  <Select value={betterEye} onValueChange={setBetterEye}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="6/6">6/6 (Perfect)</SelectItem><SelectItem value="6/9">6/9</SelectItem><SelectItem value="6/12">6/12</SelectItem><SelectItem value="6/18">6/18</SelectItem><SelectItem value="worse">Worse than 6/18</SelectItem></SelectContent></Select>
                </div>
                <div><Label className="text-xs">Corrective Lenses?</Label>
                  <Select value={glasses} onValueChange={setGlasses}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No glasses/lenses</SelectItem><SelectItem value="mild">Mild power (up to ±3.5)</SelectItem><SelectItem value="high">High power (above ±3.5)</SelectItem><SelectItem value="lasik">Had LASIK surgery</SelectItem></SelectContent></Select>
                </div>
              </div>
              <Button onClick={checkEligibility} className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-wider">
                CHECK MY ELIGIBILITY →
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
                    <h2 className="font-display text-2xl text-success mb-2">LIKELY ELIGIBLE ✅</h2>
                    <p className="text-sm text-muted-foreground">Based on your inputs, you appear to meet basic medical requirements. Get a full checkup to confirm.</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-3"><AlertTriangle className="h-6 w-6 text-destructive" /><h2 className="font-display text-xl text-destructive">POTENTIAL ISSUES</h2></div>
                    {result.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2"><XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><p className="text-sm">{issue}</p></div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-3">⚠️ These are initial indicators only. Consult a military medical specialist for accurate assessment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="height">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="height" className="text-xs gap-1"><Ruler className="h-3 w-3" /> Height & Weight</TabsTrigger>
            <TabsTrigger value="vision" className="text-xs gap-1"><Eye className="h-3 w-3" /> Vision</TabsTrigger>
            <TabsTrigger value="hearing" className="text-xs gap-1"><Ear className="h-3 w-3" /> Hearing</TabsTrigger>
            <TabsTrigger value="general" className="text-xs gap-1"><Stethoscope className="h-3 w-3" /> General</TabsTrigger>
            <TabsTrigger value="rejection" className="text-xs gap-1"><ShieldAlert className="h-3 w-3" /> Rejections</TabsTrigger>
            <TabsTrigger value="prep" className="text-xs gap-1"><CheckCircle className="h-3 w-3" /> Prep Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="height" className="mt-4 space-y-4">
            <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2"><Ruler className="h-5 w-5" /> HEIGHT & WEIGHT STANDARDS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="glass-card border-gold"><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Min Height (Male)</p><p className="font-display text-2xl text-gradient-gold">157</p><p className="text-[10px]">cm minimum for Army</p></CardContent></Card>
              <Card className="glass-card border-gold"><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Min Height (Female)</p><p className="font-display text-2xl text-gradient-gold">152</p><p className="text-[10px]">cm minimum for all arms</p></CardContent></Card>
              <Card className="glass-card border-gold"><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Navy / Air Force</p><p className="font-display text-2xl text-gradient-gold">162.5</p><p className="text-[10px]">cm minimum</p></CardContent></Card>
              <Card className="glass-card border-gold"><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Chest (Male)</p><p className="font-display text-2xl text-gradient-gold">+5</p><p className="text-[10px]">cm expansion required</p></CardContent></Card>
            </div>
            <Card className="glass-card border-gold">
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Height (cm)</TableHead><TableHead className="text-xs">Min Weight (kg)</TableHead><TableHead className="text-xs">Max Weight (kg)</TableHead><TableHead className="text-xs">Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {HEIGHT_WEIGHT_TABLE.map((row, i) => (
                      <TableRow key={i}><TableCell className="text-xs">{row.height}</TableCell><TableCell className="text-xs">{row.minW}</TableCell><TableCell className="text-xs">{row.maxW}</TableCell><TableCell><Badge className="bg-success/20 text-success text-[9px]">✓ Eligible</Badge></TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vision" className="mt-4 space-y-4">
            <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2"><Eye className="h-5 w-5" /> EYESIGHT STANDARDS</h2>
            <Card className="glass-card border-gold">
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Service</TableHead><TableHead className="text-xs">Better Eye</TableHead><TableHead className="text-xs">Worse Eye</TableHead><TableHead className="text-xs">With Glasses</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {VISION_TABLE.map((row, i) => (
                      <TableRow key={i}><TableCell className="text-xs font-medium">{row.service}</TableCell><TableCell className="text-xs">{row.better}</TableCell><TableCell className="text-xs">{row.worse}</TableCell><TableCell className="text-xs">{row.glasses}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Card className="glass-card border-gold"><CardContent className="p-3"><p className="text-xs text-muted-foreground">Max Glasses Power (Army)</p><p className="font-display text-xl text-gradient-gold">±3.5D</p></CardContent></Card>
              <Card className="glass-card border-gold"><CardContent className="p-3"><p className="text-xs text-muted-foreground">Colour Vision</p><p className="font-display text-xl text-gradient-gold">CP-I</p><p className="text-[10px] text-muted-foreground">Required for Air Force</p></CardContent></Card>
              <Card className="glass-card border-gold"><CardContent className="p-3"><p className="text-xs text-muted-foreground">LASIK</p><p className="font-display text-xl text-gradient-gold">Allowed*</p><p className="text-[10px] text-muted-foreground">Army & Navy only. 12+ months post-op.</p></CardContent></Card>
              <Card className="glass-card border-gold"><CardContent className="p-3"><p className="text-xs text-muted-foreground">Air Force LASIK</p><p className="font-display text-xl text-destructive">No</p><p className="text-[10px] text-muted-foreground">Not permitted for AF entry</p></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="hearing" className="mt-4 space-y-4">
            <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2"><Ear className="h-5 w-5" /> HEARING STANDARDS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="glass-card border-gold"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Hearing Test</p><p className="font-display text-xl text-gradient-gold">DD</p><p className="text-[10px]">Each ear tested separately</p></CardContent></Card>
              <Card className="glass-card border-gold"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Hearing Aid</p><p className="font-display text-xl text-destructive">Not Allowed</p></CardContent></Card>
              <Card className="glass-card border-gold"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Speech</p><p className="font-display text-xl text-gradient-gold">Clear</p><p className="text-[10px]">Free from stutter or speech defect</p></CardContent></Card>
            </div>
            <Card className="glass-card border-gold"><CardContent className="p-4 text-sm text-muted-foreground">Candidate must hear a forced whisper at 6 meters distance with each ear separately. Any significant hearing loss leads to rejection.</CardContent></Card>
          </TabsContent>

          <TabsContent value="general" className="mt-4 space-y-4">
            <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2"><Stethoscope className="h-5 w-5" /> GENERAL HEALTH</h2>
            <Card className="glass-card border-gold">
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Criteria</TableHead><TableHead className="text-xs">Requirement</TableHead><TableHead className="text-xs">If Failed</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {GENERAL_HEALTH.map((row, i) => (
                      <TableRow key={i}><TableCell className="text-xs font-medium">{row.criteria}</TableCell><TableCell className="text-xs">{row.requirement}</TableCell><TableCell className="text-xs text-destructive">{row.fail}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejection" className="mt-4 space-y-4">
            <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> TOP REJECTION REASONS</h2>
            {REJECTION_REASONS.map((r, i) => (
              <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-4 flex items-start gap-3">
                    <span className="text-2xl">{r.icon}</span>
                    <div><h3 className="font-bold text-sm">{r.title}</h3><p className="text-xs text-muted-foreground mt-1">{r.desc}</p></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="prep" className="mt-4 space-y-4">
            <h2 className="font-display text-lg text-gradient-gold flex items-center gap-2"><CheckCircle className="h-5 w-5" /> HOW TO PREPARE</h2>
            {PREP_TIPS.map((tip, i) => (
              <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-4">
                    <Badge className="bg-primary/20 text-primary text-[9px] mb-2">{tip.when}</Badge>
                    <p className="text-sm">{tip.tip}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <Card className="glass-card border-warning/30"><CardContent className="p-4 text-sm"><AlertTriangle className="h-4 w-4 text-warning inline mr-1" /><strong>Be Honest:</strong> Never hide medical history. Dishonesty leads to dismissal. Disclose everything upfront.</CardContent></Card>
            <Card className="glass-card border-success/30"><CardContent className="p-4 text-sm"><CheckCircle className="h-4 w-4 text-success inline mr-1" /><strong>Deferment ≠ Rejection:</strong> Deferment means fix the issue and come back. Many conditions are fixable.</CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
