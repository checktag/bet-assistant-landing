"use client";

import React from "react";
import { CalcWrapper } from "@/components/calculator/CalculatorComponents";
import { Calculator, ShieldCheck } from "lucide-react";

export default function CalculatorPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Bet <span className="text-gradient">Calculator</span></h1>
          <p className="text-slate-400 mt-2">Professional-grade mathematical tools for variance management.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" /> Variance Safe
        </div>
      </div>

      <div className="bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
        <CalcWrapper />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Calculator className="w-4 h-4 text-brand-teal" /> Kelly Criterion</h4>
          <p className="text-sm text-slate-500 leading-relaxed">The Kelly Criterion is an institutional betting formula that calculates the mathematically optimal stake size based on your perceived edge over the market. Using it correctly minimizes the risk of ruin while maximizing long-term bankroll growth.</p>
        </div>
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-blue" /> Streak Analyzer</h4>
          <p className="text-sm text-slate-500 leading-relaxed">Drifts in market odds (variance) can indicate sharp money or insider updates. Our Streak Analyzer compares historical averages to today's lines to ensure you're not betting into a collapsing market.</p>
        </div>
      </div>
    </div>
  );
}
