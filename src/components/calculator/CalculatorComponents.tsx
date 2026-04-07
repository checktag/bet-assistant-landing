"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, BarChart2, DollarSign, PlusCircle, Trash2 } from "lucide-react";

export const CALC_TABS = [
  { id: "parlay", label: "Parlay Builder", icon: <Calculator className="w-4 h-4" /> },
  { id: "kelly", label: "Kelly Criterion", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "roi", label: "ROI Tracker", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "streak", label: "Streak Analyzer", icon: <DollarSign className="w-4 h-4" /> },
];

interface ParlayLeg { id: number; name: string; odds: string; }
interface BetRecord { id: number; stake: string; result: "won" | "lost"; odds: string; }

export function LandingParlayCalc() {
  const [stake, setStake] = useState("100");
  const [legs, setLegs] = useState<ParlayLeg[]>([
    { id: 1, name: "Man City Win", odds: "1.45" },
    { id: 2, name: "Over 2.5", odds: "1.80" },
    { id: 3, name: "BTTS Yes", odds: "1.65" },
  ]);
  const addLeg = () => setLegs(p => [...p, { id: Date.now(), name: "", odds: "1.50" }]);
  const removeLeg = (id: number) => setLegs(p => p.filter(l => l.id !== id));
  const updateLeg = (id: number, field: keyof ParlayLeg, val: string) =>
    setLegs(p => p.map(l => l.id === id ? { ...l, [field]: val } : l));
  const combined = legs.reduce((a, l) => a * (parseFloat(l.odds) || 1), 1);
  const payout = (parseFloat(stake) || 0) * combined;
  const profit = payout - (parseFloat(stake) || 0);
  const breakEven = (1 / combined) * 100;
  return (
    <div className="space-y-5">
      <div className="p-1 bg-black/30 border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3 px-4 py-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Stake (₦)</span>
          <input type="number" value={stake} onChange={e => setStake(e.target.value)}
            className="flex-1 bg-transparent text-white text-right font-mono text-lg font-bold outline-none" placeholder="100" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selections ({legs.length})</span>
          <button onClick={addLeg} className="flex items-center gap-1 text-xs text-brand-teal hover:text-brand-teal/80 font-bold transition-all cursor-pointer hover:scale-105 active:scale-95">
            <PlusCircle className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <AnimatePresence>
          {legs.map((leg, i) => (
            <motion.div key={leg.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-3 bg-black/30 border border-white/10 rounded-xl">
              <span className="text-[10px] font-black text-slate-600 w-4 shrink-0">#{i + 1}</span>
              <input type="text" value={leg.name} onChange={e => updateLeg(leg.id, "name", e.target.value)}
                placeholder="Selection name..." className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-700 min-w-0" />
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-600">@</span>
                <input type="number" value={leg.odds} onChange={e => updateLeg(leg.id, "odds", e.target.value)}
                  step="0.01" min="1" className="w-14 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-brand-teal font-mono text-right outline-none focus:border-brand-teal/50" />
                <button onClick={() => removeLeg(leg.id)} className="text-slate-700 hover:text-red-400 transition-all cursor-pointer hover:scale-110 active:scale-90">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Combined Odds", value: combined.toFixed(2) + "x", color: "text-white" },
          { label: "Payout", value: "₦" + Math.round(payout).toLocaleString(), color: "text-green-400" },
          { label: "Profit", value: "₦" + Math.round(profit).toLocaleString(), color: profit >= 0 ? "text-green-400" : "text-red-400" },
          { label: "Break-Even Prob", value: breakEven.toFixed(1) + "%", color: "text-brand-blue" },
        ].map((r, i) => (
          <div key={i} className="p-3 bg-black/30 border border-white/10 rounded-xl">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{r.label}</div>
            <div className={`text-lg font-black ${r.color}`}>{r.value}</div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-brand-teal/5 border border-brand-teal/20 rounded-xl text-[11px] text-slate-400 leading-relaxed">
        💡 <strong className="text-brand-teal">Break-even prob</strong> = how often all selections must win for long-run profit.
      </div>
    </div>
  );
}

export function LandingKellyCalc() {
  const [bankroll, setBankroll] = useState("50000");
  const [winProb, setWinProb] = useState("65");
  const [odds, setOdds] = useState("1.80");
  const [fraction, setFraction] = useState("25");
  const b = (parseFloat(odds) || 1) - 1;
  const p = (parseFloat(winProb) || 0) / 100;
  const q = 1 - p;
  const kellyFull = b > 0 ? ((b * p - q) / b) : 0;
  const kellyFraction = kellyFull * (parseFloat(fraction) || 25) / 100;
  const optimalStake = (parseFloat(bankroll) || 0) * Math.max(0, kellyFraction);
  const expectedProfit = optimalStake * b * p - optimalStake * q;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Bankroll (₦)", value: bankroll, set: setBankroll, hint: "Total capital" },
          { label: "Decimal Odds", value: odds, set: setOdds, hint: "Bookmaker price" },
          { label: "Win Probability (%)", value: winProb, set: setWinProb, hint: "Your estimated win chance" },
          { label: "Kelly Fraction (%)", value: fraction, set: setFraction, hint: "25% = Quarter-Kelly" },
        ].map((f, i) => (
          <div key={i} className="p-3 bg-black/30 border border-white/10 rounded-xl">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
            <input type="number" value={f.value} onChange={e => f.set(e.target.value)}
              className="w-full bg-transparent text-xl font-black text-white outline-none font-mono" />
            <div className="text-[10px] text-slate-600 mt-1 italic">{f.hint}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Full Kelly", value: `${(kellyFull * 100).toFixed(2)}%`, color: "text-slate-400" },
          { label: `Optimal Stake (${fraction}% Kelly)`, value: `₦${Math.round(optimalStake).toLocaleString()}`, color: "text-brand-teal" },
          { label: "Expected Profit/Bet", value: `₦${Math.round(expectedProfit).toLocaleString()}`, color: expectedProfit >= 0 ? "text-green-400" : "text-red-400" },
        ].map((r, i) => (
          <div key={i} className="p-3 bg-black/30 border border-white/10 rounded-xl">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{r.label}</div>
            <div className={`text-lg font-black ${r.color}`}>{r.value}</div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-brand-blue/5 border border-brand-blue/20 rounded-xl text-[11px] text-slate-400 leading-relaxed">
        💡 <strong className="text-brand-blue">Kelly Criterion</strong> sizes bets by your mathematical edge. Use <strong>25% (Quarter-Kelly)</strong> to reduce variance.
      </div>
    </div>
  );
}

export function LandingROITracker() {
  const [bets, setBets] = useState<BetRecord[]>([
    { id: 1, stake: "1000", result: "won", odds: "1.80" },
    { id: 2, stake: "500", result: "lost", odds: "2.10" },
    { id: 3, stake: "2000", result: "won", odds: "1.50" },
  ]);
  const [newStake, setNewStake] = useState("1000");
  const [newOdds, setNewOdds] = useState("1.80");
  const [newResult, setNewResult] = useState<"won" | "lost">("won");
  const totalStaked = bets.reduce((s, b) => s + parseFloat(b.stake || "0"), 0);
  const totalReturns = bets.reduce((s, b) => b.result === "won" ? s + parseFloat(b.stake || "0") * parseFloat(b.odds || "1") : s, 0);
  const netProfit = totalReturns - totalStaked;
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  const winRate = bets.length > 0 ? (bets.filter(b => b.result === "won").length / bets.length) * 100 : 0;
  const addBet = () => setBets(p => [...p, { id: Date.now(), stake: newStake, result: newResult, odds: newOdds }]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Staked", value: `₦${totalStaked.toLocaleString()}`, color: "text-white" },
          { label: "Total Returns", value: `₦${Math.round(totalReturns).toLocaleString()}`, color: "text-brand-teal" },
          { label: "Net Profit", value: `₦${Math.round(netProfit).toLocaleString()}`, color: netProfit >= 0 ? "text-green-400" : "text-red-400" },
          { label: "ROI", value: `${roi.toFixed(1)}%`, color: roi >= 0 ? "text-brand-teal" : "text-red-400" },
        ].map((s, i) => (
          <div key={i} className="p-3 bg-black/30 border border-white/10 rounded-xl">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</div>
            <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-black/30 border border-white/10 rounded-xl">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-bold text-slate-400">Win Rate</span>
          <span className="text-xs font-black text-brand-teal">{winRate.toFixed(0)}% ({bets.filter(b => b.result === "won").length}/{bets.length})</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-blue to-brand-teal rounded-full transition-all duration-500" style={{ width: `${winRate}%` }} />
        </div>
      </div>
      <div className="p-3 bg-black/30 border border-white/10 rounded-xl space-y-3">
        <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Add a Bet</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="number" value={newStake} onChange={e => setNewStake(e.target.value)} placeholder="Stake"
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-brand-teal/50" />
          <input type="number" value={newOdds} onChange={e => setNewOdds(e.target.value)} step="0.01" placeholder="Odds"
            className="w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-brand-teal/50" />
          <div className="flex gap-2">
            {(["won", "lost"] as const).map(r => (
              <button key={r} onClick={() => setNewResult(r)}
                className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${newResult === r ? (r === "won" ? "bg-green-400/10 text-green-400 border-green-400/30" : "bg-red-400/10 text-red-400 border-red-400/30") : "bg-white/5 text-slate-500 border-white/10"}`}>
                {r === "won" ? "✅ Won" : "❌ Lost"}
              </button>
            ))}
          </div>
          <button onClick={addBet} className="px-4 py-2.5 bg-brand-teal text-background font-black text-xs rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer">Add</button>
        </div>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">History</div>
        {bets.slice().reverse().map((b, i) => (
          <div key={b.id} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${b.result === "won" ? "bg-green-400/5 border-green-400/10" : "bg-red-400/5 border-red-400/10"}`}>
            <span>{b.result === "won" ? "✅" : "❌"}</span>
            <span className="text-slate-400 flex-1">@{b.odds}</span>
            <span className={`font-bold ${b.result === "won" ? "text-green-400" : "text-red-400"}`}>
              {b.result === "won" ? "+₦" + Math.round(parseFloat(b.stake) * (parseFloat(b.odds) - 1)).toLocaleString() : "-₦" + parseFloat(b.stake).toLocaleString()}
            </span>
            <button onClick={() => setBets(p => p.filter(x => x.id !== b.id))} className="text-slate-700 hover:text-red-400 transition-all cursor-pointer hover:scale-110 active:scale-90 ml-1">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingStreakAnalyzer() {
  const [oddsHistory, setOddsHistory] = useState("1.45, 1.42, 1.47, 1.43, 1.46, 1.50, 1.44");
  const [currentOdds, setCurrentOdds] = useState("1.45");
  const [stakePerBet, setStakePerBet] = useState("1000");
  const [periods, setPeriods] = useState("7");
  const historicalOdds = oddsHistory.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  const avgOdds = historicalOdds.length > 0 ? historicalOdds.reduce((a, b) => a + b, 0) / historicalOdds.length : 0;
  const currentNum = parseFloat(currentOdds) || 0;
  const oddsDeviation = avgOdds > 0 ? ((currentNum - avgOdds) / avgOdds) * 100 : 0;
  const impliedProb = currentNum > 0 ? (1 / currentNum) * 100 : 0;
  const avgImpliedProb = avgOdds > 0 ? (1 / avgOdds) * 100 : 0;
  const edgeVsAvg = impliedProb - avgImpliedProb;
  const variance = historicalOdds.length > 1 ? historicalOdds.reduce((v, o) => v + Math.pow(o - avgOdds, 2), 0) / (historicalOdds.length - 1) : 0;
  const consistency = Math.max(0, 100 - (Math.sqrt(variance) / avgOdds) * 1000);
  const totalStake = parseFloat(stakePerBet) * parseInt(periods);
  const expectedReturn = totalStake * currentNum * (impliedProb / 100);
  return (
    <div className="space-y-4">
      <div className="p-3 bg-black/30 border border-white/10 rounded-xl">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Historical Odds (comma-separated)</label>
        <input type="text" value={oddsHistory} onChange={e => setOddsHistory(e.target.value)}
          placeholder="1.45, 1.42..." className="w-full bg-transparent text-sm text-brand-teal font-mono outline-none placeholder:text-slate-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Current Odds", value: currentOdds, set: setCurrentOdds, hint: "Today's price" },
          { label: "Stake/Bet (₦)", value: stakePerBet, set: setStakePerBet, hint: "Per bet stake" },
          { label: "# Periods (Days)", value: periods, set: setPeriods, hint: "Duration" },
        ].map((f, i) => (
          <div key={i} className="p-3 bg-black/30 border border-white/10 rounded-xl">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
            <input type="text" value={f.value} onChange={e => f.set(e.target.value)}
              className="w-full bg-transparent text-xl font-black text-white outline-none font-mono" />
            <div className="text-[10px] text-slate-600 mt-0.5 italic">{f.hint}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Avg Odds", value: avgOdds.toFixed(2) + "x", color: "text-slate-300" },
          { label: "Odds Deviation", value: `${oddsDeviation >= 0 ? "+" : ""}${oddsDeviation.toFixed(1)}%`, color: Math.abs(oddsDeviation) > 5 ? "text-yellow-400" : "text-brand-teal" },
          { label: "Edge vs Avg", value: `${edgeVsAvg >= 0 ? "+" : ""}${edgeVsAvg.toFixed(2)}%`, color: edgeVsAvg >= 0 ? "text-red-400" : "text-green-400" },
          { label: "Consistency", value: `${consistency.toFixed(0)}/100`, color: consistency > 70 ? "text-green-400" : consistency > 40 ? "text-yellow-400" : "text-red-400" },
          { label: "Total Outlay", value: `₦${totalStake.toLocaleString()}`, color: "text-white" },
          { label: "Expected Return", value: `₦${Math.round(expectedReturn).toLocaleString()}`, color: expectedReturn > totalStake ? "text-green-400" : "text-red-400" },
        ].map((r, i) => (
          <div key={i} className="p-3 bg-black/30 border border-white/10 rounded-xl">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{r.label}</div>
            <div className={`text-lg font-black ${r.color}`}>{r.value}</div>
          </div>
        ))}
      </div>
      {Math.abs(oddsDeviation) > 8 && (
        <div className="p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl text-[11px] text-yellow-400">
          ⚠️ <strong>Odds Drift Detected!</strong> {Math.abs(oddsDeviation).toFixed(1)}% from the {periods}-period average — check for sharps activity.
        </div>
      )}
      <div className="p-3 bg-brand-teal/5 border border-brand-teal/20 rounded-xl text-[11px] text-slate-400">
        💡 <strong className="text-brand-teal">Consistency Score</strong> above 70/100 = stable market. Below 40/100 = sharp money movement — be cautious.
      </div>
    </div>
  );
}

export function CalcWrapper() {
  const [activeCalcTab, setActiveCalcTab] = useState("parlay");
  return (
    <div>
      <div className="flex overflow-x-auto scrollbar-hide border-b border-white/5 bg-black/20 px-4 md:px-8 gap-1 py-3">
        {CALC_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCalcTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all border whitespace-nowrap shrink-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${activeCalcTab === tab.id
                ? "bg-brand-teal text-background border-brand-teal shadow-[0_0_16px_rgba(0,198,186,0.3)]"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCalcTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="p-5 md:p-8"
        >
          <h3 className="text-base md:text-xl font-black text-white mb-5 tracking-tight">
            {CALC_TABS.find(t => t.id === activeCalcTab)?.label}
          </h3>
          {activeCalcTab === "parlay" && <LandingParlayCalc />}
          {activeCalcTab === "kelly" && <LandingKellyCalc />}
          {activeCalcTab === "roi" && <LandingROITracker />}
          {activeCalcTab === "streak" && <LandingStreakAnalyzer />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
