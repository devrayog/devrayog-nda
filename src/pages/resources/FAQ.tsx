import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const STATIC_FAQS = [
  { q: "What is NDA exam?", a: "NDA (National Defence Academy) exam is conducted by UPSC twice a year. Paper I: Maths (300 marks), Paper II: GAT (600 marks)." },
  { q: "Who is eligible for NDA?", a: "Unmarried candidates aged 16.5-19.5 who have passed/appearing in 10+2. For Air Force/Navy, 12th with Physics and Maths required." },
  { q: "Can girls apply for NDA?", a: "Yes! Since 2022, girls can apply for NDA." },
  { q: "What is the exam pattern?", a: "Paper I: Maths (120 Qs, 300 marks). Paper II: GAT (150 Qs, 600 marks). 2.5 hours each. 1/3 negative marking." },
  { q: "What is SSB Interview?", a: "5-day selection process: Day 1 Screening, Day 2 Psychology, Day 3-4 GTO + Interview, Day 5 Conference. Total: 900 marks." },
  { q: "What is DNA Score?", a: "Our proprietary metric measuring your NDA readiness based on study consistency, test performance, accuracy, and activity." },
];

export default function FAQPage() {
  const [dbFaqs, setDbFaqs] = useState<{ id: string; question: string; answer: string }[]>([]);

  useEffect(() => {
    supabase.from("faqs").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setDbFaqs((data as any[]) || []));
  }, []);

  const allFaqs = [...dbFaqs.map(f => ({ q: f.question, a: f.answer })), ...STATIC_FAQS];

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
              {allFaqs.map((faq, i) => (
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
