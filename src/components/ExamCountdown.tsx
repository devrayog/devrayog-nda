import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

// Default fallback: NDA 1 2026 — April 12, 2026, 10:00 AM IST
const DEFAULT_EXAM_DATE = new Date("2026-04-12T04:30:00Z");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-secondary text-secondary-foreground font-display text-2xl md:text-4xl w-14 md:w-20 h-14 md:h-20 rounded-xl flex items-center justify-center shadow-lg border border-border"
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground tracking-[3px] uppercase mt-2">
        {label}
      </span>
    </div>
  );
}

export default function ExamCountdown({ compact = false }: { compact?: boolean }) {
  const [target, setTarget] = useState<Date>(DEFAULT_EXAM_DATE);
  const [time, setTime] = useState(() => calcTimeLeft(DEFAULT_EXAM_DATE));

  useEffect(() => {
    supabase.from("admin_settings").select("value").eq("key", "exam_countdown_datetime").maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const d = new Date(data.value);
          if (!isNaN(d.getTime())) setTarget(d);
        }
      });
  }, []);

  useEffect(() => {
    setTime(calcTimeLeft(target));
    const id = setInterval(() => setTime(calcTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (compact) {
    return (
      <div className="flex items-center gap-1 font-mono text-sm tabular-nums">
        <span className="text-primary font-bold">{time.days}</span>
        <span className="text-muted-foreground">d</span>
        <span className="text-primary font-bold">{String(time.hours).padStart(2, "0")}</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-primary font-bold">{String(time.minutes).padStart(2, "0")}</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-primary font-bold">{String(time.seconds).padStart(2, "0")}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 md:gap-4">
      <Digit value={time.days} label="Days" />
      <span className="font-display text-3xl text-primary animate-pulse">:</span>
      <Digit value={time.hours} label="Hours" />
      <span className="font-display text-3xl text-primary animate-pulse">:</span>
      <Digit value={time.minutes} label="Mins" />
      <span className="font-display text-3xl text-primary animate-pulse">:</span>
      <Digit value={time.seconds} label="Secs" />
    </div>
  );
}
