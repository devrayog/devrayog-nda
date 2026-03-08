import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setShow(false); setTimeout(onComplete, 600); }, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: "hsl(216 55% 7%)" }}
        >
          {/* Aurora background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
              style={{ background: "radial-gradient(circle, hsl(43 55% 54%), transparent)", top: "-20%", left: "-10%" }}
              animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
              style={{ background: "radial-gradient(circle, hsl(170 100% 38%), transparent)", bottom: "-10%", right: "-5%" }}
              animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(hsl(43 55% 54% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(43 55% 54% / 0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />

          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: `hsl(43 55% ${50 + Math.random() * 20}%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30 - Math.random() * 40, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: "easeInOut" }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo with glow */}
            <motion.div
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
              className="relative mb-8"
            >
              <motion.div
                className="absolute inset-0 rounded-2xl blur-2xl"
                style={{ background: "hsl(43 55% 54% / 0.4)" }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <img src="/logo.png" alt="DNA" className="w-24 h-24 md:w-28 md:h-28 rounded-2xl relative z-10" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="font-display text-4xl md:text-6xl tracking-wider mb-2"
              style={{ background: "linear-gradient(135deg, hsl(43 55% 54%), hsl(43 65% 66%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              DEVRAYOG NDA AI
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="font-mono text-xs md:text-sm tracking-[6px] mb-6"
              style={{ color: "hsl(216 20% 60%)" }}
            >
              NDA IN DNA
            </motion.p>

            {/* Loading bar */}
            <motion.div
              className="w-48 h-[2px] rounded-full overflow-hidden"
              style={{ background: "hsl(216 40% 17%)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(43 55% 54%), hsl(43 65% 66%))" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.5, duration: 1.5, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="font-mono text-[10px] tracking-widest mt-3"
              style={{ color: "hsl(216 20% 45%)" }}
            >
              PREPARING YOUR BATTLEFIELD...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
