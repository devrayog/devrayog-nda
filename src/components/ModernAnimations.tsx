import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/** Spotlight cursor glow — follows mouse with spring physics */
export function SpotlightGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 50, damping: 20 });
  const springY = useSpring(y, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handler = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed z-[100] w-64 h-64 rounded-full blur-[80px] opacity-[0.07]"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%", background: "radial-gradient(circle, hsl(43 55% 54%), transparent)" }}
    />
  );
}

/** Aurora background flow */
export function AuroraFlow({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        className="absolute w-[800px] h-[400px] rounded-full blur-[160px] opacity-[0.06]"
        style={{ background: "linear-gradient(135deg, hsl(43 55% 54%), hsl(170 100% 38%))", top: "-20%", left: "-10%" }}
        animate={{ x: [0, 200, 0], y: [0, 80, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[600px] h-[300px] rounded-full blur-[140px] opacity-[0.04]"
        style={{ background: "linear-gradient(135deg, hsl(187 100% 42%), hsl(43 65% 66%))", bottom: "-10%", right: "-5%" }}
        animate={{ x: [0, -150, 0], y: [0, -60, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}

/** Floating card with tilt-on-hover micro 3D */
export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    rotateX.set((e.clientY - centerY) / 15);
    rotateY.set((centerX - e.clientX) / 15);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 800 }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0); }}
    >
      {children}
    </motion.div>
  );
}

/** Glassmorphism shimmer pass */
export function GlassShimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-inherit ${className}`}>
      <motion.div
        className="absolute top-0 -left-full w-full h-full"
        style={{ background: "linear-gradient(90deg, transparent, hsl(43 55% 54% / 0.08), transparent)", transform: "skewX(-15deg)" }}
        animate={{ left: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />
    </div>
  );
}

/** Gradient border flow */
export function GradientBorderFlow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative p-[1px] rounded-xl overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{ background: "conic-gradient(from 0deg, hsl(43 55% 54%), hsl(170 100% 38%), hsl(187 100% 42%), hsl(43 55% 54%))" }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative bg-card rounded-xl z-10">
        {children}
      </div>
    </div>
  );
}

/** Noise grain overlay */
export function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/** Micro floating particles */
export function FloatingParticles({ count = 15, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            background: `hsl(43 55% ${40 + Math.random() * 30}% / ${0.15 + Math.random() * 0.2})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -(20 + Math.random() * 40), 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
