"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, BarChart2, ArrowLeft, PlusCircle, Trash2, RefreshCw } from "lucide-react";
import Link from "next/link";

const TABS = [
  { id: "parlay", label: "Parlay Builder", icon: <Calculator className="w-4 h-4" /> },
  { id: "kelly", label: "Kelly Criterion", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "roi", label: "ROI Tracker", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "streak", label: "Streak Analyzer", icon: <DollarSign className="w-4 h-4" /> },
];

// ─── Parlay Calculator ────────────────────────────────────────────────────────
interface ParlayLeg { id: number; name: string; odds: string; }

function ParlayCalculator() {
  const [stake, setStake] = useState("100");
  const [legs, setLegs] = useState<ParlayLeg[]>([
    { id: 1, name: "Man City Win", odds: "1.45" },
    { id: 2, name: "Over 2.5", odds: "1.80" },
    { id: 3, name: "BTTS Yes", odds: "1.65" },
  ]);

  const addLeg = () => setLegs(prev => [...prev, { id: Date.now(), name: "", odds: "1.50" }]);
  const removeLeg = (id: number) => setLegs(prev => prev.filter(l => l.id !== id));
  const updateLeg = (id: number, field: keyof ParlayLeg, value: string) =>
    setLegs(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

  const combined = legs.reduce((acc, l) => acc * (parseFloat(l.odds) || 1), 1);
  const payout = (parseFloat(stake) || 0) * combined;
  const profit = payout - (parseFloat(stake) || 0);
  const breakEven = (1 / combined) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3 p-1 bg-[#0A0F1C] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Stake (₦)</span>
            <input
              type="number"
              value={stake}
              onChange={e => setStake(e.target.value)}
              className="flex-1 bg-transparent text-white text-right font-mono text-lg font-bold outline-none"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selections ({legs.length})</span>
          <button onClick={addLeg} className="flex items-center gap-1 text-xs text-brand-teal hover:text-brand-teal/80 font-bold transition-colors">
            <PlusCircle className="w-3.5 h-3.5" /> Add Selection
          </button>
        </div>
        <AnimatePresence>
          {legs.map((leg, i) => (
            <motion.div
              key={leg.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-3 bg-[#0A0F1C] border border-white/10 rounded-xl group"
            >
              <span className="text-[10px] font-black text-slate-600 w-5 shrink-0">#{i + 1}</span>
              <input
                type="text"
                value={leg.name}
                onChange={e => updateLeg(leg.id, "name", e.target.value)}
                placeholder="Selection name..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-700"
              />
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-600">@</span>
                <input
                  type="number"
                  value={leg.odds}
                  onChange={e => updateLeg(leg.id, "odds", e.target.value)}
                  step="0.01"
                  min="1"
                  className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-sm text-brand-teal font-mono text-right outline-none focus:border-brand-teal/50"
                />
                <button onClick={() => removeLeg(leg.id)} className="text-slate-700 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Combined Odds", value: combined.toFixed(2) + "x", color: "text-white" },
          { label: "Potential Payout", value: "₦" + Math.round(payout).toLocaleString(), color: "text-green-400" },
          { label: "Potential Profit", value: "₦" + Math.round(profit).toLocaleString(), color: profit >= 0 ? "text-green-400" : "text-red-400" },
          { label: "Break-Even Prob", value: breakEven.toFixed(1) + "%", color: "text-brand-blue" },
        ].map((r, i) => (
          <div key={i} className="p-4 bg-[#0A0F1C] border border-white/10 rounded-2xl">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{r.label}</div>
            <div className={`text-xl font-black ${r.color}`}>{r.value}</div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-2xl text-xs text-slate-400 leading-relaxed">
        💡 <strong className="text-brand-teal">Break-even probability</strong> is how often ALL your picks must win for this bet to pay off over time. The lower it is compared with the real chance of your picks, the better the price.
      </div>
    </div>
  );
}

// ─── Kelly Criterion Calculator ───────────────────────────────────────────────
function KellyCalculator() {
  const [bankroll, setBankroll] = useState("50000");
  const [winProb, setWinProb] = useState("65");
  const [odds, setOdds] = useState("1.80");
  const [fraction, setFraction] = useState("25"); // Quarter-Kelly

  const b = (parseFloat(odds) || 1) - 1;
  const p = (parseFloat(winProb) || 0) / 100;
  const q = 1 - p;
  const kellyFull = b > 0 ? ((b * p - q) / b) : 0;
  const kellyFraction = kellyFull * (parseFloat(fraction) || 25) / 100;
  const optimalStake = (parseFloat(bankroll) || 0) * Math.max(0, kellyFraction);
  const expectedProfit = optimalStake * b * p - optimalStake * q;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Bankroll (₦)", value: bankroll, set: setBankroll, hint: "Total betting capital" },
          { label: "Decimal Odds", value: odds, set: setOdds, hint: "Bookmaker's odds for the bet" },
          { label: "Win Probability (%)", value: winProb, set: setWinProb, hint: "Your estimated chance of winning" },
          { label: "Kelly Fraction (%)", value: fraction, set: setFraction, hint: "25% = Quarter-Kelly (recommended)" },
        ].map((f, i) => (
          <div key={i} className="p-4 bg-[#0A0F1C] border border-white/10 rounded-2xl">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
            <input
              type="number"
              value={f.value}
              onChange={e => f.set(e.target.value)}
              className="w-full bg-transparent text-xl font-black text-white outline-none font-mono"
            />
            <div className="text-[10px] text-slate-600 mt-1 italic">{f.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Full Kelly Stake", value: `${(kellyFull * 100).toFixed(2)}% of bankroll`, color: "text-slate-400" },
          { label: `Optimal Stake (${fraction}% Kelly)`, value: `₦${Math.round(optimalStake).toLocaleString()}`, color: "text-brand-teal" },
          { label: "Expected Profit/Bet", value: `₦${Math.round(expectedProfit).toLocaleString()}`, color: expectedProfit >= 0 ? "text-green-400" : "text-red-400" },
        ].map((r, i) => (
          <div key={i} className="p-5 bg-[#0A0F1C] border border-white/10 rounded-2xl">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{r.label}</div>
            <div className={`text-2xl font-black ${r.color}`}>{r.value}</div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-2xl text-xs text-slate-400 leading-relaxed">
        💡 <strong className="text-brand-blue">Kelly Criterion</strong> maximizes long-run bankroll growth by sizing bets proportionally to your edge. Using <strong>Quarter-Kelly (25%)</strong> significantly reduces variance and drawdown risk — ideal for bettors starting out.
      </div>
    </div>
  );
}

// ─── ROI Tracker ──────────────────────────────────────────────────────────────
interface BetRecord { id: number; stake: string; result: "won" | "lost"; odds: string; }

function ROITracker() {
  const [bets, setBets] = useState<BetRecord[]>([
    { id: 1, stake: "1000", result: "won", odds: "1.80" },
    { id: 2, stake: "500", result: "lost", odds: "2.10" },
    { id: 3, stake: "2000", result: "won", odds: "1.50" },
  ]);
  const [newStake, setNewStake] = useState("1000");
  const [newOdds, setNewOdds] = useState("1.80");
  const [newResult, setNewResult] = useState<"won" | "lost">("won");

  const totalStaked = bets.reduce((s, b) => s + parseFloat(b.stake || "0"), 0);
  const totalReturns = bets.reduce((s, b) => {
    if (b.result === "won") return s + parseFloat(b.stake || "0") * parseFloat(b.odds || "1");
    return s;
  }, 0);
  const netProfit = totalReturns - totalStaked;
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  const winRate = bets.length > 0 ? (bets.filter(b => b.result === "won").length / bets.length) * 100 : 0;

  const addBet = () => {
    setBets(prev => [...prev, { id: Date.now(), stake: newStake, result: newResult, odds: newOdds }]);
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Staked", value: `₦${totalStaked.toLocaleString()}`, color: "text-white" },
          { label: "Total Returns", value: `₦${Math.round(totalReturns).toLocaleString()}`, color: "text-brand-teal" },
          { label: "Net Profit", value: `₦${Math.round(netProfit).toLocaleString()}`, color: netProfit >= 0 ? "text-green-400" : "text-red-400" },
          { label: "ROI", value: `${roi.toFixed(1)}%`, color: roi >= 0 ? "text-brand-teal" : "text-red-400" },
        ].map((s, i) => (
          <div key={i} className="p-4 bg-[#0A0F1C] border border-white/10 rounded-2xl">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</div>
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Win rate bar */}
      <div className="p-4 bg-[#0A0F1C] border border-white/10 rounded-2xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-400">Win Rate</span>
          <span className="text-xs font-black text-brand-teal">{winRate.toFixed(0)}% ({bets.filter(b => b.result === "won").length}/{bets.length} bets)</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-blue to-brand-teal rounded-full transition-all duration-500" style={{ width: `${winRate}%` }} />
        </div>
      </div>

      {/* Add bet */}
      <div className="p-4 bg-[#0A0F1C] border border-white/10 rounded-2xl space-y-3">
        <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Add a Bet</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="number" value={newStake} onChange={e => setNewStake(e.target.value)} placeholder="Stake" className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-teal/50" />
          <input type="number" value={newOdds} onChange={e => setNewOdds(e.target.value)} step="0.01" placeholder="Odds" className="w-28 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-teal/50" />
          <div className="flex gap-2">
            {(["won", "lost"] as const).map(r => (
              <button key={r} onClick={() => setNewResult(r)} className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold border transition-all ${newResult === r ? (r === "won" ? "bg-green-400/10 text-green-400 border-green-400/30" : "bg-red-400/10 text-red-400 border-red-400/30") : "bg-white/5 text-slate-500 border-white/10 hover:bg-white/10"}`}>
                {r === "won" ? "✅ Won" : "❌ Lost"}
              </button>
            ))}
          </div>
          <button onClick={addBet} className="px-5 py-3 bg-brand-teal text-background font-black text-sm rounded-xl hover:scale-[1.02] transition-all">
            Add
          </button>
        </div>
      </div>

      {/* Bet History */}
      <div className="space-y-2">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bet History</div>
        {bets.map((b, i) => (
          <div key={b.id} className={`flex items-center gap-3 p-3 rounded-xl border ${b.result === "won" ? "bg-green-400/5 border-green-400/10" : "bg-red-400/5 border-red-400/10"}`}>
            <span className="text-xs">{b.result === "won" ? "✅" : "❌"}</span>
            <span className="text-xs text-slate-400 flex-1">Bet #{bets.length - i}</span>
            <span className="text-xs font-mono text-slate-300">@{b.odds}</span>
            <span className={`text-xs font-bold ${b.result === "won" ? "text-green-400" : "text-red-400"}`}>
              {b.result === "won" ? `+₦${Math.round(parseFloat(b.stake) * (parseFloat(b.odds) - 1)).toLocaleString()}` : `-₦${parseFloat(b.stake).toLocaleString()}`}
            </span>
            <button onClick={() => setBets(prev => prev.filter(x => x.id !== b.id))} className="text-slate-700 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Streak Analyzer ──────────────────────────────────────────────────────────
function StreakAnalyzer() {
  const [oddsHistory, setOddsHistory] = useState("1.45, 1.42, 1.47, 1.43, 1.46, 1.50, 1.44");
  const [currentOdds, setCurrentOdds] = useState("1.45");
  const [stakePerBet, setStakePerBet] = useState("1000");
  const [periods, setPeriods] = useState("7");

  const historicalOdds = oddsHistory.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  const avgOdds = historicalOdds.length > 0 ? historicalOdds.reduce((a, b) => a + b, 0) / historicalOdds.length : 0;
  const minOdds = historicalOdds.length > 0 ? Math.min(...historicalOdds) : 0;
  const maxOdds = historicalOdds.length > 0 ? Math.max(...historicalOdds) : 0;
  const currentNum = parseFloat(currentOdds) || 0;
  const oddsDeviation = avgOdds > 0 ? ((currentNum - avgOdds) / avgOdds) * 100 : 0;
  const impliedProb = currentNum > 0 ? (1 / currentNum) * 100 : 0;
  const avgImpliedProb = avgOdds > 0 ? (1 / avgOdds) * 100 : 0;
  const edgeVsAvg = impliedProb - avgImpliedProb;

  // Consistency score: how stable have the odds been
  const variance = historicalOdds.length > 1 ? historicalOdds.reduce((v, o) => v + Math.pow(o - avgOdds, 2), 0) / (historicalOdds.length - 1) : 0;
  const consistency = Math.max(0, 100 - (Math.sqrt(variance) / avgOdds) * 1000);

  const totalStake = parseFloat(stakePerBet) * parseInt(periods);
  const expectedReturn = totalStake * currentNum * (impliedProb / 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#0A0F1C] border border-white/10 rounded-2xl md:col-span-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">Historical Odds (comma-separated)</label>
          <input
            type="text"
            value={oddsHistory}
            onChange={e => setOddsHistory(e.target.value)}
            placeholder="1.45, 1.42, 1.47..."
            className="w-full bg-transparent text-sm text-brand-teal font-mono outline-none placeholder:text-slate-700"
          />
          <div className="text-[10px] text-slate-600 mt-1">Enter the odds for this market over recent periods to detect drift</div>
        </div>
        {[
          { label: "Current Odds", value: currentOdds, set: setCurrentOdds, hint: "Today's bookmaker price" },
          { label: "Stake Per Bet (₦)", value: stakePerBet, set: setStakePerBet, hint: "How much you plan to stake each time" },
          { label: "# of Periods (Days)", value: periods, set: setPeriods, hint: "Duration of the consistent bet series" },
        ].map((f, i) => (
          <div key={i} className="p-4 bg-[#0A0F1C] border border-white/10 rounded-2xl">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
            <input type="text" value={f.value} onChange={e => f.set(e.target.value)} className="w-full bg-transparent text-xl font-black text-white outline-none font-mono" />
            <div className="text-[10px] text-slate-600 mt-1 italic">{f.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Avg Historical Odds", value: avgOdds.toFixed(2) + "x", color: "text-slate-300" },
          { label: "Odds Deviation", value: `${oddsDeviation >= 0 ? "+" : ""}${oddsDeviation.toFixed(1)}%`, color: Math.abs(oddsDeviation) > 5 ? "text-yellow-400" : "text-brand-teal" },
          { label: "Edge vs Avg Line", value: `${edgeVsAvg >= 0 ? "+" : ""}${edgeVsAvg.toFixed(2)}%`, color: edgeVsAvg >= 0 ? "text-red-400" : "text-green-400" },
          { label: "Odds Consistency", value: `${consistency.toFixed(0)}/100`, color: consistency > 70 ? "text-green-400" : consistency > 40 ? "text-yellow-400" : "text-red-400" },
          { label: "Total Outlay", value: `₦${totalStake.toLocaleString()}`, color: "text-white" },
          { label: "Expected Return", value: `₦${Math.round(expectedReturn).toLocaleString()}`, color: expectedReturn > totalStake ? "text-green-400" : "text-red-400" },
        ].map((r, i) => (
          <div key={i} className="p-4 bg-[#0A0F1C] border border-white/10 rounded-2xl">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{r.label}</div>
            <div className={`text-xl font-black ${r.color}`}>{r.value}</div>
          </div>
        ))}
      </div>

      {Math.abs(oddsDeviation) > 8 && (
        <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl text-xs text-yellow-400 leading-relaxed">
          ⚠️ <strong>Odds Drift Detected!</strong> The current odds have drifted {Math.abs(oddsDeviation).toFixed(1)}% from the {periods}-period average. This could signal sharp money movement or bookmaker line correction — investigate before staking.
        </div>
      )}

      <div className="p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-2xl text-xs text-slate-400 leading-relaxed">
        💡 <strong className="text-brand-teal">Consistency Score</strong> measures how stable the odds have been over your historical periods. A score above 70/100 indicates a reliable, predictable market. Erratic odds below 40/100 suggest heavy sharps activity or line instability — tread carefully.
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState("parlay");

  return (
    <main className="min-h-screen bg-[#03060E] text-slate-200 relative overflow-hidden">
      {/* Ambient orbs */}

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center">
              <Calculator className="w-7 h-7 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Bet Calculator</h1>
              <p className="text-slate-400 text-sm mt-1">Professional-grade tools to calculate, track, and optimize your betting strategy.</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2 flex-wrap mb-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                activeTab === tab.id
                  ? "bg-brand-teal text-background border-brand-teal"
                  : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl"
          >
            <h2 className="text-xl font-black text-white mb-6 tracking-tight">
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
            {activeTab === "parlay"  && <ParlayCalculator />}
            {activeTab === "kelly"   && <KellyCalculator />}
            {activeTab === "roi"     && <ROITracker />}
            {activeTab === "streak"  && <StreakAnalyzer />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
