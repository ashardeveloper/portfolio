"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its children into view once, when scrolled to. */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Pulls its child slightly toward the cursor. */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });

  return (
    <motion.div
      className={className ?? "inline-block"}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Counts up to `value` the first time it scrolls into view. */
export function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setN(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

/** Thin gradient bar at the top showing how far the page is scrolled. */
export function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <motion.div
      aria-hidden
      className="bg-accent fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
      style={{ scaleX }}
    />
  );
}

/** True when 3D scenes should run: wide screen, capable device, motion allowed. */
export function useCan3D() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => {
      const cores = navigator.hardwareConcurrency ?? 4;
      setOk(wide.matches && !reduce.matches && cores >= 4);
    };
    check();
    wide.addEventListener("change", check);
    reduce.addEventListener("change", check);
    return () => {
      wide.removeEventListener("change", check);
      reduce.removeEventListener("change", check);
    };
  }, []);
  return ok;
}

/** True while the referenced element is on screen. Used to pause 3D rendering. */
export function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible] as const;
}
