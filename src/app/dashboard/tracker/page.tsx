"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SlipTracker from "@/components/dashboard/SlipTracker";
import { Crown, Info, Loader2, Radar, Zap, ShieldCheck, ArrowRightLeft } from "lucide-react";

export default function TrackerPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

  useEffect(() => {
    const initPage = async () => {
      if ((session as any)?.accessToken) {
        try {
          // Force session update on mount to recalibrate PRO status
          await update();

          const res = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${(session as any).accessToken}` }
          });
          setUserData(res.data);
        } catch (e) { } finally {
          setIsLoading(false);
        }
      }
    };
    initPage();
  }, [session, API_URL, update]);

  if (!session) return null;

  const isPremium = userData?.is_premium || false;

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 md:py-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Slip <span className="text-gradient">Tracker</span></h1>
          <p className="text-slate-400 mt-2">Active AI-monitoring and cashout advisories for your bet slips.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[400px] flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </motion.div>
        ) : isPremium ? (
          <motion.div
            key="tracker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A0F1C]/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl"
          >
            <SlipTracker
              accessToken={(session as any).accessToken as string}
              telegramLinked={userData?.telegram_linked || false}
              isPremium={true}
            />
          </motion.div>
        ) : (
          <motion.div
            key="gate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden group"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-teal/10 opacity-50 blur-3xl pointer-events-none" />

            <div className="relative bg-[#0A0F1C]/60 border border-white/10 rounded-[2.5rem] p-8 md:p-16 backdrop-blur-2xl text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 mb-8 shadow-[0_0_50px_rgba(250,204,21,0.15)]">
                <Crown className="w-10 h-10" />
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
                Premium Access <span className="text-gradient">Required</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base max-w-lg mb-12 font-medium leading-relaxed">
                The AI Slip Tracker is a premium utility that continuously monitors the live data-flow of your matches. Access is restricted to Premium accounts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-12 text-left">
                {[
                  { icon: <Radar className="w-4 h-4" />, title: "24/7 AI Sentry", desc: "Automated monitoring of live momentum" },
                  { icon: <Zap className="w-4 h-4" />, title: "Neural Alerts", desc: "Instant Hold/Cashout signals via Telegram" },
                  { icon: <ShieldCheck className="w-4 h-4" />, title: "Registry Priority", desc: "Deeper analysis using the Global Registry" }
                ].map((feat, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <div className="text-brand-blue">{feat.icon}</div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-wider">{feat.title}</div>
                      <div className="text-[10px] text-slate-500 font-bold mt-1 leading-relaxed">{feat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/billing")}
                className="group relative px-10 py-5 bg-white text-background font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-[0_15px_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-teal opacity-0 group-hover:opacity-10 transition-opacity" />
                UPGRADE TO PREMIUM
                <ArrowRightLeft className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-brand-blue" />
        </div>
        <div className="text-sm text-slate-400 leading-relaxed">
          <strong className="text-white block mb-1">How it works:</strong>
          Add your SportyBet or Bet9ja booking code to the tracker. Our AI engine will continuously monitor the live statistics and momentum of your matches. If the mathematical probability of your slip winning drops significantly, you'll receive an instant <strong>Cashout Alert</strong> via Telegram.
        </div>
      </div>
    </div>
  );
}
