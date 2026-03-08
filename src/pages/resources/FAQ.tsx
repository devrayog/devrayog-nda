import DashboardLayout from "@/components/layout/DashboardLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const FAQS = [
  { q: "What is NDA exam?", a: "NDA (National Defence Academy) exam is conducted by UPSC twice a year to recruit candidates for Army, Navy, and Air Force wings of the NDA. It consists of Paper I (Maths — 300 marks) and Paper II (GAT — 600 marks)." },
  { q: "Who is eligible for NDA?", a: "Unmarried male and female candidates who have passed 10+2 or are appearing in it. Age should be between 16.5 to 19.5 years. For Air Force and Navy, 12th with Physics and Maths is mandatory." },
  { q: "Can girls apply for NDA?", a: "Yes! Since 2022, girls can apply for NDA. The Supreme Court allowed women candidates to appear for the NDA examination. The training and selection process is the same." },
  { q: "What is the NDA exam pattern?", a: "Paper I: Mathematics (120 questions, 300 marks, 2.5 hours). Paper II: General Ability Test (150 questions, 600 marks, 2.5 hours). Total: 900 marks. Negative marking: 1/3 of marks for wrong answers." },
  { q: "What is SSB Interview?", a: "Services Selection Board (SSB) interview is a 5-day selection process after clearing the written exam. It includes: Day 1 — Screening (OIR + PPDT), Day 2 — Psychology Tests, Day 3-4 — GTO Tasks + Interview, Day 5 — Conference. Total SSB marks: 900." },
  { q: "How many attempts are allowed?", a: "You can attempt NDA as many times as you're eligible (age limit: 19.5 years). Most candidates get 3-4 attempts depending on when they start." },
  { q: "What is the cut-off for NDA?", a: "Cut-off varies each year. Typically, written exam cut-off is around 340-370 out of 900 for general category. Final merit (written + SSB) cut-off is around 680-720." },
  { q: "What happens after NDA selection?", a: "Selected candidates join NDA Khadakwasla (Pune) for 3 years of training. After NDA, they join their respective service academy (IMA for Army, INA for Navy, AFA for Air Force) for 1 year." },
  { q: "Is coaching necessary for NDA?", a: "No. Many candidates clear NDA through self-study using NCERT books and practice papers. This app is designed to provide coaching-level preparation for free." },
  { q: "What is the salary after NDA?", a: "During training at NDA, cadets receive a stipend of ₹56,100/month. After commissioning as Lieutenant, starting salary is approximately ₹80,000-90,000/month with allowances." },
  { q: "How to prepare for NDA Maths?", a: "Start with NCERT 11th and 12th. Focus on: Algebra, Trigonometry, Calculus, Coordinate Geometry, and Statistics. Practice PYQs and take mock tests regularly." },
  { q: "What is DNA Score?", a: "DNA Score is our proprietary metric that measures your overall NDA readiness based on: study consistency, test performance, accuracy, topics covered, and activity streaks." },
  { q: "How does the spaced repetition system work?", a: "When you get a question wrong, it goes to your Error Log. The system schedules reviews at increasing intervals (1, 3, 7, 14, 30 days). After 5 successful reviews, the topic is marked as Mastered." },
  { q: "Can I use this app offline?", a: "Currently, the app requires an internet connection for AI features, community, and data sync. We're working on offline support for study materials." },
];

export default function FAQPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-gradient-gold">FAQ</h1>
          </div>
          <p className="text-muted-foreground text-sm">Frequently asked questions about NDA exam and this platform.</p>
        </motion.div>

        <Card className="glass-card border-gold">
          <CardContent className="p-4">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left font-medium hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
