"use client";

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

function CounterNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  // Extract numeric part if string contains numbers
  const numericVal = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const suffix = value.replace(/[0-9]/g, "");

  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    if (inView && numericVal > 0) {
      spring.set(numericVal);
    }
  }, [inView, numericVal, spring]);

  if (!numericVal) {
    return <span>{value}</span>;
  }

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{display}</motion.span>
      <span>{suffix}</span>
    </span>
  );
}

export function AnimatedStats({
  stats,
}: {
  stats: { value: string; label: string; description?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="relative p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md text-center shadow-sm hover:border-primary/40 transition-all group overflow-hidden"
        >
          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient mb-1">
            <CounterNumber value={stat.value} />
          </div>
          <div className="text-xs sm:text-sm font-bold text-foreground tracking-wide">
            {stat.label}
          </div>
          <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
        </motion.div>
      ))}
    </div>
  );
}
