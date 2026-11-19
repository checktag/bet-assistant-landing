"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * NavigationProgress
 * 
 * A YouTube-style top progress bar that fires on every route change.
 * - Starts at 0%, races to 85% immediately, then snaps to 100% and fades out.
 * - Uses a shimmer effect for a premium feel.
 * - Works with Next.js App Router (client-side navigation via Link).
 */
export default function NavigationProgress() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible]   = useState(false);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(false);

  const start = () => {
    setProgress(0);
    setVisible(true);

    let current = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      // Accelerate to 85% quickly, then slow to a crawl (simulates waiting)
      const increment =
        current < 30 ? 8 :
        current < 60 ? 4 :
        current < 80 ? 2 :
        0.4;
      current = Math.min(current + increment, 85);
      setProgress(current);
      if (current >= 85 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 50);
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => setVisible(false), 400);
    setTimeout(() => setProgress(0), 500);
  };

  // Fire on every navigation change
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return; // skip first mount
    }
    start();
    const t = setTimeout(finish, 600); // typical Next.js page switch is fast
    return () => { clearTimeout(t); if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="nav-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
        >
          {/* Track */}
          <div className="absolute inset-0 bg-white/5" />

          {/* Filled bar */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-teal via-brand-blue to-brand-teal"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.1 }}
          />

          {/* Shimmer overlay */}
          <motion.div
            className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{ left: `${Math.max(0, progress - 15)}%` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />

          {/* Glowing tip */}
          <div
            className="absolute top-0 h-full w-8 rounded-full"
            style={{ left: `calc(${progress}% - 16px)` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
