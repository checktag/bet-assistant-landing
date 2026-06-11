"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Zap } from "lucide-react";

const STORAGE_KEY = "wc2026_banner_dismissed";

export default function WorldCupBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not previously dismissed
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scaleY: 0.9 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: -20, scaleY: 0.9 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full overflow-hidden rounded-2xl border border-yellow-500/30 shadow-[0_0_60px_rgba(234,179,8,0.15)] mb-6"
          style={{
            background:
              "linear-gradient(135deg, #0f0a00 0%, #1a1000 30%, #0d1a00 60%, #001a0a 100%)",
          }}
        >
          {/* Animated ambient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -left-8 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -right-8 w-48 h-48 bg-green-500/15 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-0 right-1/3 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl"
            />
          </div>

          {/* Floating decorative balls */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { top: "15%", left: "5%", size: "w-5 h-5", delay: 0, dur: 4 },
              { top: "60%", left: "12%", size: "w-3 h-3", delay: 1, dur: 5 },
              { top: "20%", right: "8%", size: "w-4 h-4", delay: 0.5, dur: 3.5 },
              { top: "70%", right: "15%", size: "w-2 h-2", delay: 2, dur: 6 },
            ].map((ball, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -12, 0], rotate: [0, 180, 360] }}
                transition={{ duration: ball.dur, repeat: Infinity, ease: "easeInOut", delay: ball.delay }}
                className={`absolute ${ball.size} opacity-20`}
                style={{ top: ball.top, left: (ball as any).left, right: (ball as any).right }}
              >
                ⚽
              </motion.div>
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
            {/* Left: Trophy + Text */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Trophy Icon with pulse rings */}
              <div className="relative shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #b45309, #d97706, #f59e0b)",
                    boxShadow: "0 0 25px rgba(245,158,11,0.4)",
                  }}
                >
                  <Trophy className="w-6 h-6 text-white" />
                </motion.div>
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-2xl border border-yellow-400/40 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="absolute -inset-1 rounded-2xl border border-yellow-400/20 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span
                    className="text-sm md:text-base font-black tracking-tight"
                    style={{
                      background: "linear-gradient(90deg, #f59e0b, #fbbf24, #84cc16, #22c55e)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    🏆 FIFA World Cup 2026 Is Here!
                  </span>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[9px] font-black uppercase tracking-widest bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full"
                  >
                    LIVE NOW
                  </motion.span>
                </div>
                <p className="text-xs text-slate-400 leading-tight max-w-sm">
                  Generate AI-powered World Cup bet codes instantly. Scan today&apos;s WC fixtures, build multi-platform slips and win big.
                </p>
              </div>
            </div>

            {/* Right: CTA buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/premiumquant"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-background transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                style={{
                  background: "linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)",
                }}
              >
                <Zap className="w-3.5 h-3.5" />
                Generate WC Codes
              </Link>

              {/* Dismiss */}
              <button
                onClick={dismiss}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom shimmer line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{
              background:
                "linear-gradient(90deg, transparent, #f59e0b, #84cc16, #22c55e, transparent)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
