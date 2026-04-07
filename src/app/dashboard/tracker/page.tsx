"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import SlipTracker from "@/components/dashboard/SlipTracker";
import { Crown, Info } from "lucide-react";

export default function TrackerPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

  useEffect(() => {
    if ((session as any)?.accessToken) {
      axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` }
      }).then(res => setUserData(res.data)).catch(() => {});
    }
  }, [session]);

  if (!session) return null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Slip <span className="text-gradient">Tracker</span></h1>
          <p className="text-slate-400 mt-2">Active AI-monitoring and cashout advisories for your bet slips.</p>
        </div>
        {!userData?.is_premium && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-widest">
            <Crown className="w-4 h-4" /> Premium Feature
          </div>
        )}
      </div>

      <div className="bg-[#0A0F1C]/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
        <SlipTracker 
          accessToken={(session as any).accessToken as string} 
          telegramLinked={userData?.telegram_linked || false} 
          isPremium={userData?.is_premium || false}
        />
      </div>

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
