import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Home, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-destructive/5 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-16">
        {/* Animated shield icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-destructive/20">
            <Shield className="w-16 h-16 text-destructive/60" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-destructive/10"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* 404 number */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display text-[120px] md:text-[180px] leading-none text-gradient-gold mb-0"
        >
          404
        </motion.h1>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-10"
        >
          <p className="font-mono text-[10px] tracking-[4px] text-destructive uppercase mb-3">MISSION FAILED</p>
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">Route Not Found, Soldier!</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            The path <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{location.pathname}</span> doesn't exist in our territory. Regroup and head back to base.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link to="/">
            <Button size="lg" className="bg-gradient-gold text-primary-foreground font-bold tracking-wider gap-2">
              <Home className="h-4 w-4" /> Return to Base
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="border-gold text-primary font-bold tracking-wider gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Link to="/dashboard">
            <Button variant="ghost" size="lg" className="text-muted-foreground font-bold tracking-wider gap-2">
              <Compass className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Decorative elements */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="font-mono text-[9px] text-muted-foreground/50 tracking-[6px] uppercase mt-16"
        >
          DEVRAYOG NDA AI • NDA IN DNA
        </motion.p>
      </div>
    </div>
  );
};

export default NotFound;
