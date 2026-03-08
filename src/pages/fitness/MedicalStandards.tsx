import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeartPulse, Eye, Ruler, Weight, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const HEIGHT_STANDARDS = [
  { branch: "Army", male: "157 cm (5'2\")", female: "152 cm (5'0\")" },
  { branch: "Navy", male: "157 cm (5'2\")", female: "152 cm (5'0\")" },
  { branch: "Air Force", male: "162.5 cm (5'4\")", female: "152 cm (5'0\")" },
  { branch: "Air Force (Pilot)", male: "162.5–193 cm", female: "162.5–193 cm" },
];

const WEIGHT_INFO = [
  "Weight should be proportionate to height and age",
  "BMI should be between 18.5 and 24.9",
  "Underweight candidates may be given a chance to gain weight",
  "Overweight candidates are usually rejected",
];

const VISION_STANDARDS = [
  { branch: "Army", standard: "6/6 in better eye, 6/9 in worse eye (correctable to 6/6)", glasses: "Acceptable within limits" },
  { branch: "Navy", standard: "6/6 both eyes (6/9 correctable to 6/6)", glasses: "Acceptable within limits" },
  { branch: "Air Force (Pilot)", standard: "6/6 both eyes without glasses", glasses: "NOT acceptable for pilots" },
  { branch: "Air Force (Ground)", standard: "6/6 in better eye, 6/18 in worse eye", glasses: "Acceptable" },
];

const COMMON_REJECTIONS = [
  { condition: "Flat Feet (Pes Planus)", desc: "Checked during physical exam. Mild flat feet may be acceptable.", severity: "medium" },
  { condition: "Color Blindness", desc: "Complete color blindness is a disqualification for all branches.", severity: "high" },
  { condition: "Knocked Knees / Bow Legs", desc: "Beyond acceptable limits will lead to rejection.", severity: "medium" },
  { condition: "Dental Issues", desc: "Minimum 14 dental points required. Missing front teeth is a concern.", severity: "low" },
  { condition: "Hearing Problems", desc: "Must pass whisper test and audiometry. Any significant loss is disqualifying.", severity: "high" },
  { condition: "Skin Conditions", desc: "Severe eczema, psoriasis, or tattoos on visible areas may cause rejection.", severity: "medium" },
  { condition: "Varicocele / Hydrocele", desc: "Can be treated before medical. Get checked early.", severity: "medium" },
  { condition: "Nasal Septum Deviation", desc: "If it obstructs breathing, may need correction before medical.", severity: "low" },
];

export default function MedicalStandards() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <HeartPulse className="h-8 w-8 text-destructive" />
            <h1 className="font-display text-4xl text-gradient-gold">MEDICAL STANDARDS</h1>
          </div>
          <p className="text-muted-foreground text-sm">Height, weight, eyesight, and medical requirements for NDA — know before you go.</p>
        </motion.div>

        <Tabs defaultValue="height">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="height" className="text-xs gap-1"><Ruler className="h-3 w-3" /> Height</TabsTrigger>
            <TabsTrigger value="weight" className="text-xs gap-1"><Weight className="h-3 w-3" /> Weight</TabsTrigger>
            <TabsTrigger value="vision" className="text-xs gap-1"><Eye className="h-3 w-3" /> Vision</TabsTrigger>
            <TabsTrigger value="conditions" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" /> Conditions</TabsTrigger>
          </TabsList>

          <TabsContent value="height" className="mt-4 space-y-3">
            <h2 className="font-display text-lg text-gradient-gold">MINIMUM HEIGHT REQUIREMENTS</h2>
            {HEIGHT_STANDARDS.map((h, i) => (
              <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-2">{h.branch}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2"><Badge className="bg-primary/20 text-primary text-[9px]">Male</Badge><span className="text-sm">{h.male}</span></div>
                      <div className="flex items-center gap-2"><Badge className="bg-accent/20 text-accent text-[9px]">Female</Badge><span className="text-sm">{h.female}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <Card className="glass-card border-warning/30">
              <CardContent className="p-4 text-xs text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-warning inline mr-1" />
                Note: Candidates from hilly areas (Gorkhas, Garhwalis, etc.) may get 5 cm relaxation. Tribal candidates may also get relaxation.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weight" className="mt-4 space-y-3">
            <h2 className="font-display text-lg text-gradient-gold">WEIGHT STANDARDS</h2>
            <Card className="glass-card border-gold">
              <CardContent className="p-5 space-y-3">
                {WEIGHT_INFO.map((info, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <p className="text-sm">{info}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-card border-gold">
              <CardContent className="p-5">
                <h3 className="font-bold text-sm mb-3">Ideal Weight Chart (Male, approximate)</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    ["157 cm", "49-54 kg"], ["160 cm", "51-57 kg"], ["165 cm", "54-60 kg"],
                    ["170 cm", "57-64 kg"], ["175 cm", "61-68 kg"], ["180 cm", "65-72 kg"],
                  ].map(([h, w], i) => (
                    <div key={i} className="p-2 bg-muted/30 rounded text-center">
                      <p className="font-bold">{h}</p>
                      <p className="text-muted-foreground">{w}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vision" className="mt-4 space-y-3">
            <h2 className="font-display text-lg text-gradient-gold">VISION STANDARDS</h2>
            {VISION_STANDARDS.map((v, i) => (
              <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-2">{v.branch}</h3>
                    <p className="text-sm mb-1">{v.standard}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Glasses: {v.glasses}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="conditions" className="mt-4 space-y-3">
            <h2 className="font-display text-lg text-gradient-gold">COMMON MEDICAL REJECTIONS</h2>
            {COMMON_REJECTIONS.map((c, i) => (
              <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {c.severity === "high" ? <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" /> : c.severity === "medium" ? <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />}
                      <div>
                        <h3 className="font-bold text-sm">{c.condition}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                      </div>
                      <Badge className={`text-[9px] shrink-0 ${c.severity === "high" ? "bg-destructive/20 text-destructive" : c.severity === "medium" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}`}>
                        {c.severity === "high" ? "High Risk" : c.severity === "medium" ? "Medium" : "Treatable"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
