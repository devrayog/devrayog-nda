import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const QUOTES = [
  "The best leaders are those most interested in surrounding themselves with assistants and associates smarter than they are.",
  "A leader is one who knows the way, goes the way, and shows the way.",
  "Courage is not the absence of fear, but the triumph over it.",
  "The only way to do great work is to love what you do.",
  "Officers are not born, they are made — through hard work and determination.",
];

export default function SSBComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  const testType = location.pathname.split("/ssb/")[1]?.toUpperCase() || "TEST";
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(t => {
        if (t <= 1) { clearInterval(id); navigate("/dashboard"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-lg mx-auto mt-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Card className="glass-card border-gold overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardContent className="p-8 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <motion.div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl"
                  animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity }} />
                <motion.div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                  animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </motion.div>
              </div>
              <h1 className="font-display text-3xl text-gradient-gold">{testType} — COMING SOON</h1>
              <p className="text-muted-foreground text-sm italic">"{quote}"</p>
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <ArrowRight className="h-4 w-4" />
                <span>Redirecting to dashboard in <strong className="text-primary">{countdown}s</strong></span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
