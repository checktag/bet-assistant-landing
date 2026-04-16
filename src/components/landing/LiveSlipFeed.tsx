"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface Slip {
  booking_code: string;
  platform: string;
  odds: number;
  time: string;
}

export default function LiveSlipFeed() {
  const [slips, setSlips] = useState<Slip[]>([]);

  useEffect(() => {
    const fetchSlips = async () => {
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io").replace(/\/$/, "");
        const res = await axios.get(`${API_URL}/public/live-slips`);
        setSlips(res.data.slips || []);
      } catch (e) {
        console.error("Failed to fetch live slips", e);
      }
    };
    fetchSlips();
    
    const interval = setInterval(fetchSlips, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (slips.length === 0) return null;

  return (
    <div className="w-full bg-[#03060E]/50 border-y border-white/5 py-4 overflow-hidden relative z-20 backdrop-blur-sm">
      {/* Vignetters for fade effect */}
      <div className="absolute left-0 top-0 w-16 md:w-32 h-full bg-gradient-to-r from-[#03060E] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 w-16 md:w-32 h-full bg-gradient-to-l from-[#03060E] to-transparent z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 mb-3">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <p className="text-xs font-semibold tracking-widest uppercase text-slate-500">Live Slip Feed</p>
        </div>
      </div>

      <div className="flex overflow-hidden whitespace-nowrap">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="flex items-center gap-4 hover:[animation-play-state:paused]"
        >
          {/* Duplicate list twice for the infinite loop illusion */}
          {[...slips, ...slips].map((slip, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl border border-white/10 shrink-0 shadow-[0_0_15px_rgba(0,198,186,0.05)] cursor-default hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">{slip.platform}</span>
                  <span className="text-xs text-brand-teal font-mono tracking-widest">{slip.booking_code}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Odds:</span>
                  <span className="text-[11px] font-black text-white">{slip.odds}x</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
