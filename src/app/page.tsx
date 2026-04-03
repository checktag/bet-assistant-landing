"use client";

import { motion, useScroll, useTransform, Variants, AnimatePresence } from "framer-motion";
import { ArrowRight, Bot, Zap, Calculator, TerminalSquare, Activity, Globe, Lock, CheckCircle2, ShieldCheck, Banknote, CircleDollarSign, Coins, TrendingDown, AlertOctagon, TrendingUp, Shield, Cpu, Network, ChevronDown, Star, MessageSquare, PlusCircle, Trash2, BarChart2, DollarSign } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import Link from "next/link";

// Smooth Animation Variants that satisfy strict TypeScript typing
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Bet Calculator Sub-Components (embedded inline on landing page) ──────────
const CALC_TABS = [
  { id: "parlay",  label: "Parlay Builder",  icon: <Calculator className="w-4 h-4" /> },
  { id: "kelly",   label: "Kelly Criterion",  icon: <TrendingUp className="w-4 h-4" /> },
  { id: "roi",     label: "ROI Tracker",      icon: <BarChart2  className="w-4 h-4" /> },
  { id: "streak",  label: "Streak Analyzer",  icon: <DollarSign className="w-4 h-4" /> },
];

interface ParlayLeg  { id: number; name: string; odds: string; }
interface BetRecord  { id: number; stake: string; result: "won" | "lost"; odds: string; }

function LandingParlayCalc() {
  const [stake, setStake] = useState("100");
  const [legs, setLegs] = useState<ParlayLeg[]>([
    { id: 1, name: "Man City Win", odds: "1.45" },
    { id: 2, name: "Over 2.5",     odds: "1.80" },
    { id: 3, name: "BTTS Yes",     odds: "1.65" },
  ]);
  const addLeg    = () => setLegs(p => [...p, { id: Date.now(), name: "", odds: "1.50" }]);
  const removeLeg = (id: number) => setLegs(p => p.filter(l => l.id !== id));
  const updateLeg = (id: number, field: keyof ParlayLeg, val: string) =>
    setLegs(p => p.map(l => l.id === id ? { ...l, [field]: val } : l));
  const combined  = legs.reduce((a, l) => a * (parseFloat(l.odds) || 1), 1);
  const payout    = (parseFloat(stake) || 0) * combined;
  const profit    = payout - (parseFloat(stake) || 0);
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
          <button onClick={addLeg} className="flex items-center gap-1 text-xs text-brand-teal hover:text-brand-teal/80 font-bold transition-colors">
            <PlusCircle className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <AnimatePresence>
          {legs.map((leg, i) => (
            <motion.div key={leg.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-3 bg-black/30 border border-white/10 rounded-xl">
              <span className="text-[10px] font-black text-slate-600 w-4 shrink-0">#{i+1}</span>
              <input type="text" value={leg.name} onChange={e => updateLeg(leg.id, "name", e.target.value)}
                placeholder="Selection name..." className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-700 min-w-0" />
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-600">@</span>
                <input type="number" value={leg.odds} onChange={e => updateLeg(leg.id, "odds", e.target.value)}
                  step="0.01" min="1" className="w-14 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-brand-teal font-mono text-right outline-none focus:border-brand-teal/50" />
                <button onClick={() => removeLeg(leg.id)} className="text-slate-700 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Combined Odds",   value: combined.toFixed(2)+"x",                             color: "text-white" },
          { label: "Payout",          value: "₦"+Math.round(payout).toLocaleString(),              color: "text-green-400" },
          { label: "Profit",          value: "₦"+Math.round(profit).toLocaleString(),              color: profit >= 0 ? "text-green-400" : "text-red-400" },
          { label: "Break-Even Prob", value: breakEven.toFixed(1)+"%",                            color: "text-brand-blue" },
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

function LandingKellyCalc() {
  const [bankroll, setBankroll] = useState("50000");
  const [winProb,  setWinProb]  = useState("65");
  const [odds,     setOdds]     = useState("1.80");
  const [fraction, setFraction] = useState("25");
  const b = (parseFloat(odds) || 1) - 1;
  const p = (parseFloat(winProb) || 0) / 100;
  const q = 1 - p;
  const kellyFull     = b > 0 ? ((b * p - q) / b) : 0;
  const kellyFraction = kellyFull * (parseFloat(fraction) || 25) / 100;
  const optimalStake  = (parseFloat(bankroll) || 0) * Math.max(0, kellyFraction);
  const expectedProfit = optimalStake * b * p - optimalStake * q;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Bankroll (₦)",        value: bankroll,  set: setBankroll,  hint: "Total capital" },
          { label: "Decimal Odds",         value: odds,      set: setOdds,      hint: "Bookmaker price" },
          { label: "Win Probability (%)",  value: winProb,   set: setWinProb,   hint: "Your estimated win chance" },
          { label: "Kelly Fraction (%)",   value: fraction,  set: setFraction,  hint: "25% = Quarter-Kelly" },
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
          { label: "Full Kelly",                            value: `${(kellyFull*100).toFixed(2)}%`,             color: "text-slate-400" },
          { label: `Optimal Stake (${fraction}% Kelly)`,    value: `₦${Math.round(optimalStake).toLocaleString()}`, color: "text-brand-teal" },
          { label: "Expected Profit/Bet",                   value: `₦${Math.round(expectedProfit).toLocaleString()}`, color: expectedProfit >= 0 ? "text-green-400" : "text-red-400" },
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

function LandingROITracker() {
  const [bets, setBets]         = useState<BetRecord[]>([
    { id: 1, stake: "1000", result: "won",  odds: "1.80" },
    { id: 2, stake: "500",  result: "lost", odds: "2.10" },
    { id: 3, stake: "2000", result: "won",  odds: "1.50" },
  ]);
  const [newStake,  setNewStake]  = useState("1000");
  const [newOdds,   setNewOdds]   = useState("1.80");
  const [newResult, setNewResult] = useState<"won"|"lost">("won");
  const totalStaked  = bets.reduce((s, b) => s + parseFloat(b.stake||"0"), 0);
  const totalReturns = bets.reduce((s, b) => b.result==="won" ? s + parseFloat(b.stake||"0")*parseFloat(b.odds||"1") : s, 0);
  const netProfit    = totalReturns - totalStaked;
  const roi          = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  const winRate      = bets.length > 0 ? (bets.filter(b => b.result==="won").length / bets.length) * 100 : 0;
  const addBet = () => setBets(p => [...p, { id: Date.now(), stake: newStake, result: newResult, odds: newOdds }]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Staked",   value: `₦${totalStaked.toLocaleString()}`,              color: "text-white" },
          { label: "Total Returns",  value: `₦${Math.round(totalReturns).toLocaleString()}`,  color: "text-brand-teal" },
          { label: "Net Profit",     value: `₦${Math.round(netProfit).toLocaleString()}`,     color: netProfit >= 0 ? "text-green-400" : "text-red-400" },
          { label: "ROI",            value: `${roi.toFixed(1)}%`,                             color: roi >= 0 ? "text-brand-teal" : "text-red-400" },
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
          <span className="text-xs font-black text-brand-teal">{winRate.toFixed(0)}% ({bets.filter(b=>b.result==="won").length}/{bets.length})</span>
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
            {(["won","lost"] as const).map(r => (
              <button key={r} onClick={() => setNewResult(r)}
                className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${newResult===r?(r==="won"?"bg-green-400/10 text-green-400 border-green-400/30":"bg-red-400/10 text-red-400 border-red-400/30"):"bg-white/5 text-slate-500 border-white/10"}`}>
                {r==="won"?"✅ Won":"❌ Lost"}
              </button>
            ))}
          </div>
          <button onClick={addBet} className="px-4 py-2.5 bg-brand-teal text-background font-black text-xs rounded-xl hover:scale-105 transition-all">Add</button>
        </div>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">History</div>
        {bets.slice().reverse().map((b, i) => (
          <div key={b.id} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${b.result==="won"?"bg-green-400/5 border-green-400/10":"bg-red-400/5 border-red-400/10"}`}>
            <span>{b.result==="won"?"✅":"❌"}</span>
            <span className="text-slate-400 flex-1">@{b.odds}</span>
            <span className={`font-bold ${b.result==="won"?"text-green-400":"text-red-400"}`}>
              {b.result==="won"?"+₦"+Math.round(parseFloat(b.stake)*(parseFloat(b.odds)-1)).toLocaleString():"-₦"+parseFloat(b.stake).toLocaleString()}
            </span>
            <button onClick={() => setBets(p => p.filter(x => x.id !== b.id))} className="text-slate-700 hover:text-red-400 transition-colors ml-1">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LandingStreakAnalyzer() {
  const [oddsHistory,  setOddsHistory]  = useState("1.45, 1.42, 1.47, 1.43, 1.46, 1.50, 1.44");
  const [currentOdds,  setCurrentOdds]  = useState("1.45");
  const [stakePerBet,  setStakePerBet]  = useState("1000");
  const [periods,      setPeriods]      = useState("7");
  const historicalOdds = oddsHistory.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  const avgOdds        = historicalOdds.length > 0 ? historicalOdds.reduce((a,b)=>a+b,0)/historicalOdds.length : 0;
  const currentNum     = parseFloat(currentOdds)||0;
  const oddsDeviation  = avgOdds > 0 ? ((currentNum-avgOdds)/avgOdds)*100 : 0;
  const impliedProb    = currentNum > 0 ? (1/currentNum)*100 : 0;
  const avgImpliedProb = avgOdds > 0 ? (1/avgOdds)*100 : 0;
  const edgeVsAvg      = impliedProb - avgImpliedProb;
  const variance       = historicalOdds.length>1 ? historicalOdds.reduce((v,o)=>v+Math.pow(o-avgOdds,2),0)/(historicalOdds.length-1) : 0;
  const consistency    = Math.max(0, 100-(Math.sqrt(variance)/avgOdds)*1000);
  const totalStake     = parseFloat(stakePerBet)*parseInt(periods);
  const expectedReturn = totalStake*currentNum*(impliedProb/100);
  return (
    <div className="space-y-4">
      <div className="p-3 bg-black/30 border border-white/10 rounded-xl">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Historical Odds (comma-separated)</label>
        <input type="text" value={oddsHistory} onChange={e => setOddsHistory(e.target.value)}
          placeholder="1.45, 1.42..." className="w-full bg-transparent text-sm text-brand-teal font-mono outline-none placeholder:text-slate-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Current Odds",     value: currentOdds, set: setCurrentOdds, hint: "Today's price" },
          { label: "Stake/Bet (₦)",   value: stakePerBet, set: setStakePerBet, hint: "Per bet stake" },
          { label: "# Periods (Days)", value: periods,     set: setPeriods,     hint: "Duration" },
        ].map((f,i) => (
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
          { label: "Avg Odds",        value: avgOdds.toFixed(2)+"x",                                               color: "text-slate-300" },
          { label: "Odds Deviation",  value: `${oddsDeviation>=0?"+":""}${oddsDeviation.toFixed(1)}%`,             color: Math.abs(oddsDeviation)>5?"text-yellow-400":"text-brand-teal" },
          { label: "Edge vs Avg",     value: `${edgeVsAvg>=0?"+":""}${edgeVsAvg.toFixed(2)}%`,                     color: edgeVsAvg>=0?"text-red-400":"text-green-400" },
          { label: "Consistency",     value: `${consistency.toFixed(0)}/100`,                                       color: consistency>70?"text-green-400":consistency>40?"text-yellow-400":"text-red-400" },
          { label: "Total Outlay",    value: `₦${totalStake.toLocaleString()}`,                                     color: "text-white" },
          { label: "Expected Return", value: `₦${Math.round(expectedReturn).toLocaleString()}`,                     color: expectedReturn>totalStake?"text-green-400":"text-red-400" },
        ].map((r,i) => (
          <div key={i} className="p-3 bg-black/30 border border-white/10 rounded-xl">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{r.label}</div>
            <div className={`text-lg font-black ${r.color}`}>{r.value}</div>
          </div>
        ))}
      </div>
      {Math.abs(oddsDeviation)>8 && (
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
// ─────────────────────────────────────────────────────────────────────────────
function CalcWrapper() {
  const [activeCalcTab, setActiveCalcTab] = useState("parlay");
  return (
    <div>
      {/* Tab bar — horizontally scrollable on mobile */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-white/5 bg-black/20 px-4 md:px-8 gap-1 py-3">
        {CALC_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCalcTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all border whitespace-nowrap shrink-0 ${
              activeCalcTab === tab.id
                ? "bg-brand-teal text-background border-brand-teal shadow-[0_0_16px_rgba(0,198,186,0.3)]"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
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
          {activeCalcTab === "kelly"  && <LandingKellyCalc />}
          {activeCalcTab === "roi"    && <LandingROITracker />}
          {activeCalcTab === "streak" && <LandingStreakAnalyzer />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────


const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-screen bg-[#03060E] text-slate-200 overflow-hidden selection:bg-brand-teal selection:text-background">
      {/* Matured Global Noise Texture */}
      <div className="bg-noise opacity-[0.20] mix-blend-overlay"></div>
      
      {/* Ambient Depth Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] bg-brand-blue/15 blur-[140px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute top-[40%] right-[-20%] w-[50vw] h-[50vw] bg-brand-teal/10 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-brand-blue/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#03060E]/50 backdrop-blur-xl supports-[backdrop-filter]:bg-[#03060E]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 overflow-hidden rounded-xl drop-shadow-[0_0_15px_rgba(0,198,186,0.4)] flex items-center justify-center"><img src="/image.jpg" alt="Bet Assistant" className="w-full h-full object-cover scale-[1.65]" /></div>
             <span className="text-md font-semibold tracking-wide text-white">Bet Assistant</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
             <a href="/#features" className="hover:text-white transition-colors">Architecture</a>
             <a href="/#engine" className="hover:text-white transition-colors">Quant Engine</a>
             <a href="/#workflow" className="hover:text-white transition-colors">Workflow</a>
             <a href="/#faq" className="hover:text-white transition-colors">FAQ</a>
             <a href="/#calculator" className="hover:text-white transition-colors">Calculator</a>
          </div>
          <Link href="/dashboard" className="px-5 py-2 py-2 text-sm bg-brand-teal text-background font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,198,186,0.3)] flex items-center">
            Open Terminal
          </Link>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <motion.section 
        ref={ref}
        style={{ y: yHero, opacity: opacityHero }}
        className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-32 pb-20 z-10"
      >
        {/* Floating Narrative Objects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          
          {/* Aesthetic Floating Currencies */}
          <motion.div animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] right-[15%] opacity-20 hidden lg:block">
            <CircleDollarSign className="w-16 h-16 text-green-400" />
          </motion.div>
          <motion.div animate={{ y: [0, 40, 0], rotate: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[35%] left-[10%] opacity-20 hidden lg:block">
            <Coins className="w-12 h-12 text-brand-teal" />
          </motion.div>
          <motion.div animate={{ y: [0, -20, 0], x: [0, 20, 0], rotate: [0, 5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[45%] left-[8%] opacity-15 hidden lg:block">
            <Banknote className="w-14 h-14 text-green-500" />
          </motion.div>

          {/* Node 1: Math Equation */}
          <motion.div 
            animate={{ y: [0, -30, 0], rotate: [0, 4, 0] }} 
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[28%] left-[22%] hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <Calculator className="w-4 h-4 text-brand-teal" />
            <span className="text-xs font-mono text-slate-300">P(x) = e^(-λ) * λ^x / x!</span>
          </motion.div>

          {/* Node 2: Value Detected */}
          <motion.div 
            animate={{ y: [0, 40, 0], rotate: [0, -4, 0] }} 
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[35%] right-[22%] hidden lg:flex flex-col items-start p-4 bg-brand-blue/10 backdrop-blur-xl rounded-xl border border-brand-blue/20 shadow-[0_0_50px_rgba(0,113,206,0.3)]"
          >
            <span className="text-[10px] text-brand-teal font-bold uppercase mb-1">Detected Edge</span>
            <span className="text-xl font-black text-white">+14.2% EV</span>
          </motion.div>

          {/* Node 3: Slip Creation */}
          <motion.div 
            animate={{ y: [0, -20, 0], x: [0, 15, 0] }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
            className="absolute bottom-[28%] left-[24%] hidden lg:flex items-center gap-3 p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div>
               <div className="text-[10px] uppercase tracking-wider text-slate-400">Auto-Slip Generated</div>
               <div className="text-sm font-mono text-white font-bold tracking-widest">BC-9JA-8X</div>
            </div>
          </motion.div>

          {/* Node 4: AI Cashout Resize to match */}
          <motion.div 
            animate={{ y: [0, -35, 0], x: [0, -15, 0] }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-[60%] right-[24%] hidden lg:flex flex-col p-4 bg-[#0A0F1C]/80 backdrop-blur-xl rounded-xl border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.25)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">AI Match Advisory</span>
            </div>
            <div className="text-sm font-medium text-white mb-1">Momentum shift detected.</div>
            <div className="text-xl font-black text-green-400">💰 Cashout $4,250</div>
          </motion.div>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative flex flex-col items-center text-center max-w-5xl mx-auto z-10"
        >
          <motion.div variants={fadeUp} className="mb-8 px-4 py-2 rounded-full border border-brand-teal/20 bg-brand-teal/5 backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            <span className="text-xs font-medium tracking-widest text-brand-teal uppercase">Engine Now Live</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-8xl font-black tracking-[-0.04em] text-white mb-8 leading-[1.05]">
            Institutional-Grade <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-400 to-brand-teal drop-shadow-sm">
              Quantitative Betting.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl leading-relaxed font-light">
            Unleash the full mathematical power of an AI analysis engine directly inside Telegram. We automatically scan 55+ global leagues to find structurally mispriced, profitable variance edges.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row gap-4 w-full md:w-auto px-4">
            <Link href="/dashboard" className="group relative px-6 md:px-10 py-4 md:py-5 bg-white text-background font-bold text-base md:text-lg rounded-full overflow-hidden transition-all hover:scale-[1.02] shadow-[0_0_40px_rgba(0,198,186,0.3)] inline-flex items-center justify-center w-full md:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                Launch Web Dashboard <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="/docs" className="px-6 md:px-10 py-4 md:py-5 bg-white/5 border border-white/10 text-white text-base md:text-lg font-medium rounded-full hover:bg-white/10 transition-all hover:border-brand-blue/40 backdrop-blur-md inline-flex items-center justify-center w-full md:w-auto whitespace-nowrap">
              How To Use
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Infinite Marquee Section */}
      <section className="relative z-20 py-10 border-y border-white/5 bg-[#03060E]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-slate-500">Natively Scanning Markets Across</p>
        </div>
        <div className="flex overflow-hidden whitespace-nowrap opacity-60">
          <motion.div 
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex items-center gap-16 text-xl md:text-2xl font-bold text-slate-600 tracking-wider"
          >
            <span>PREMIER LEAGUE</span> <span className="text-brand-teal/50">•</span>
            <span>LA LIGA</span> <span className="text-brand-teal/50">•</span>
            <span>CHAMPIONS LEAGUE</span> <span className="text-brand-teal/50">•</span>
            <span>SPORTYBET</span> <span className="text-brand-teal/50">•</span>
            <span>BET9JA</span> <span className="text-brand-teal/50">•</span>
            <span>FIFA WORLD CUP</span> <span className="text-brand-teal/50">•</span>
            {/* Duplicated for smooth loop */}
            <span>PREMIER LEAGUE</span> <span className="text-brand-teal/50">•</span>
            <span>LA LIGA</span> <span className="text-brand-teal/50">•</span>
            <span>CHAMPIONS LEAGUE</span> <span className="text-brand-teal/50">•</span>
            <span>SPORTYBET</span> <span className="text-brand-teal/50">•</span>
            <span>BET9JA</span> <span className="text-brand-teal/50">•</span>
            <span>FIFA WORLD CUP</span> <span className="text-brand-teal/50">•</span>
          </motion.div>
        </div>
      </section>

      {/* Metrics / Statistics Segment */}
      <section id="engine" className="relative z-20 px-6 py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
              <h4 className="text-5xl font-black text-white mb-2 tracking-tight">55<span className="text-brand-teal">+</span></h4>
              <p className="text-slate-400 font-medium">Global Leagues Scanned</p>
           </motion.div>
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
              <h4 className="text-5xl font-black text-white mb-2 tracking-tight">1.30<span className="text-brand-blue">x</span></h4>
              <p className="text-slate-400 font-medium">Strict Minimum Variance Odds</p>
           </motion.div>
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
              <h4 className="text-5xl font-black text-white mb-2 tracking-tight">0<span className="text-brand-teal">ms</span></h4>
              <p className="text-slate-400 font-medium">In-Memory Deep Analysis</p>
           </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="relative z-20 py-24 px-6 border-y border-red-500/10 bg-gradient-to-b from-[#0A0505] to-[#03060E] overflow-hidden">
        {/* Floating Problem Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] left-[10%] opacity-[0.03] hidden lg:block">
            <TrendingDown className="w-40 h-40 text-red-500" />
          </motion.div>
          <motion.div animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute bottom-[15%] right-[8%] opacity-[0.03] hidden lg:block">
            <AlertOctagon className="w-56 h-56 text-red-600" />
          </motion.div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">The <span className="text-red-500">Problem</span> with Modern Betting.</h2>
            <p className="text-xl text-slate-400 font-light max-w-3xl mx-auto">You are playing a game rigged heavily by mathematical variance and speed.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="p-8 rounded-2xl bg-red-500/5 border border-red-500/10">
              <h3 className="text-xl font-bold text-white mb-3">Emotional Tilt</h3>
              <p className="text-slate-400 leading-relaxed">Most players rely purely on gut feelings or team loyalty, leading to impulsive, irrational capital allocation when facing a losing streak. This psychological vulnerability inevitably destroys discipline, causing bettors to chase losses with increasingly reckless stakes instead of adhering strictly to long-term mathematical strategies and structured bankroll mechanics.</p>
            </motion.div>
            <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="p-8 rounded-2xl bg-red-500/5 border border-red-500/10">
              <h3 className="text-xl font-bold text-white mb-3">Negative EV Traps</h3>
              <p className="text-slate-400 leading-relaxed">Bookmakers deliberately bake an excessive overround (or vig) into every market pricing model they release. Without strict algorithmic derivation to uncover true implied probabilities, you are mathematically guaranteed to bleed money over an extended period. The entire system is structurally designed to extract wealth from those betting blindly into negative-value markets.</p>
            </motion.div>
            <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="p-8 rounded-2xl bg-red-500/5 border border-red-500/10">
              <h3 className="text-xl font-bold text-white mb-3">Data Asymmetry</h3>
              <p className="text-slate-400 leading-relaxed">Retail players attempt to analyze four or five matches manually through outdated statistics or media punditry. Meanwhile, institutional syndicates and oddsmakers process 10,000 matches simultaneously via multi-threaded automation, putting you at an immense speed and informational disadvantage that makes long-term manual profitability virtually impossible.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="relative z-20 pt-24 pb-12 px-6 overflow-hidden">
        {/* Floating Solution Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-[30%] right-[10%] opacity-[0.04] hidden lg:block">
            <TrendingUp className="w-56 h-56 text-brand-teal" />
          </motion.div>
          <motion.div animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[-10%] left-[5%] opacity-[0.04] hidden lg:block">
            <Shield className="w-64 h-64 text-brand-blue" />
          </motion.div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">The <span className="text-gradient">Bet Assistant</span> Parity.</h2>
            <p className="text-xl text-slate-400 font-light max-w-3xl mx-auto">Level the playing field instantly with institutional-grade automation.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="p-10 rounded-3xl bg-brand-blue/5 border border-brand-blue/20 shadow-[0_0_30px_rgba(0,113,206,0.1)]">
               <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-6"><Calculator className="w-6 h-6 text-brand-blue" /></div>
               <h3 className="text-2xl font-bold text-white mb-4">Cold Statistical Execution</h3>
               <p className="text-slate-400 text-lg leading-relaxed mb-4">We completely eradicate human emotion, psychological fatigue, and bias from your strategy. The Quant Engine strictly executes upon positive Expected Value (+EV) discrepancies and absolutely rejects everything else, regardless of the media narrative or recent team form.</p>
               <p className="text-slate-400 text-lg leading-relaxed">By enforcing an algorithmic filter that only signals plays when the mathematical edge exceeds a rigid fractional threshold, we mathematically force the odds back into your favor. If the numbers don't validate the investment, the system actively prevents you from betting.</p>
            </motion.div>
            <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="p-10 rounded-3xl bg-brand-teal/5 border border-brand-teal/20 shadow-[0_0_30px_rgba(0,198,186,0.1)]">
               <div className="w-12 h-12 rounded-xl bg-brand-teal/10 flex items-center justify-center mb-6"><Globe className="w-6 h-6 text-brand-teal" /></div>
               <h3 className="text-2xl font-bold text-white mb-4">Total Data Neutralization</h3>
               <p className="text-slate-400 text-lg leading-relaxed mb-4">You no longer waste hours passively scanning disjointed matches on sportsbook applications. The platform concurrently maps identical odds across 55+ global leagues the exact millisecond they are published digitally by interconnected bookmakers.</p>
               <p className="text-slate-400 text-lg leading-relaxed">This instantaneous ingestion layer gives you the exact same computational reach as professional syndicates, providing total data parity. When an opening line is structurally mispriced across the Atlantic, your terminal alerts you instantly before the market inevitably corrects the inefficiency.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Features Bento Grid */}
      <section id="features" className="relative z-20 max-w-7xl mx-auto px-6 pb-12">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Core Quant Engine */}
          <motion.div variants={scaleIn} className="md:col-span-2 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] p-10 border border-white/10 hover:border-brand-teal/30 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe className="w-64 h-64 text-brand-teal" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center mb-8">
                <Calculator className="w-7 h-7 text-brand-teal" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Strict +EV Math Engine</h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-xl mb-6">
                Our architecture heavily analyzes live market odds to calculate pure intrinsic probabilities. We don't guess — we run hard mathematical derivations ensuring you only deploy capital when the true variance is explicitly in your favor.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-5 h-5 text-brand-teal mr-3" /> Live Market Consensus Reversal</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-5 h-5 text-brand-teal mr-3" /> Quantitative Probability Derivations</li>
              </ul>
            </div>
          </motion.div>

          {/* Auto Slip */}
          <motion.div variants={scaleIn} className="bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] p-10 border border-white/10 hover:border-brand-blue/30 transition-colors group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mb-8">
                <Zap className="w-7 h-7 text-brand-blue" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Auto-Slip Generator</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Instantly converts mathematically profitable lines into direct booking codes you can play immediately right inside the chat.
              </p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-brand-teal flex justify-between items-center">
              <span>BC-GENERATED-XY</span>
              <Lock className="w-4 h-4 opacity-50" />
            </div>
          </motion.div>

          {/* Real-Time AI Base */}
          <motion.div variants={scaleIn} className="bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] p-10 border border-white/10 hover:border-brand-teal/30 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8">
              <Bot className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Real-Time AI Advisory</h3>
            <p className="text-slate-400 leading-relaxed">
              Powered securely by advanced analytical logic. Send your dynamic track codes, and our street-smart assistant contextually analyzes the live matches to determine whether to hold or securely cash out.
            </p>
          </motion.div>

          {/* Terminal UI */}
          <motion.div variants={scaleIn} className="md:col-span-2 bg-[#0A0F1C] rounded-[2rem] p-0 border border-white/10 overflow-hidden flex flex-col md:flex-row items-center">
            <div className="p-10 flex-1">
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                 <TerminalSquare className="w-7 h-7 text-white" />
               </div>
               <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Terminal-Grade Response</h3>
               <p className="text-slate-400 text-lg leading-relaxed">
                 Designed directly for sophisticated users. No fluff. Run the physical `/scan` wrapper and intercept 55+ European and FIFA lines concurrently straight to your mobile device.
               </p>
            </div>
            <div className="flex-1 w-full bg-black/50 border-l border-white/5 h-full p-8 font-mono text-sm text-slate-400 relative">
               <div className="absolute top-4 left-4 flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500"/><div className="w-3 h-3 rounded-full bg-yellow-500"/><div className="w-3 h-3 rounded-full bg-green-500"/></div>
               <div className="mt-8 space-y-2">
                 <p className="text-white">$ /scan weekend</p>
                 <p className="text-brand-teal opacity-80">🔍 Spinning up Quant Engine...</p>
                 <p className="text-brand-teal opacity-80">📊 Found 55 live matches. Analyzing edge...</p>
                 <p className="text-green-400 mt-4">🔥 Top +EV Value Bets Found:</p>
                 <p>⚽ Italy vs Northern Ireland</p>
                 <p>🎯 Market: Home @ 1.31</p>
                 <p>📈 Edge (EV): +13.8%</p>
               </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works - Vertical Timeline */}
      <section id="workflow" className="relative z-20 bg-[#060913] border-t border-white/5 py-16 px-6 overflow-hidden">
        {/* Floating Infrastructure Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div animate={{ y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[10%] right-[5%] opacity-[0.02] hidden lg:block">
            <Network className="w-96 h-96 text-brand-blue" />
          </motion.div>
          <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[15%] left-[5%] opacity-[0.02] hidden lg:block">
            <Cpu className="w-80 h-80 text-brand-teal" />
          </motion.div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
             <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Execution <span className="text-gradient">Workflow</span></h2>
             <p className="text-xl text-slate-400 font-light">From data ingestion to live slip generations in zero milliseconds.</p>
           </motion.div>

           <div className="space-y-16">
              {[
                { 
                  step: "01", 
                  title: "API Ingestion & Aggregation", 
                  desc: "The platform securely hooks into global data providers via premium low-latency WebSockets and dedicated GraphQL pipelines. It constantly extracts an expansive, uninterrupted stream of live market pricing, injury updates, weather variables, and momentum swings across 55+ distinct premier and secondary leagues concurrently in the background. It effectively operates as an aggressive high-frequency parsing layer, scanning thousands of endpoints per second to ensure no highly valuable data fragmentation or pricing shift is ever missed.", 
                  icon: <Activity className="w-6 h-6 text-brand-blue" /> 
                },
                { 
                  step: "02", 
                  title: "Mathematical Edge Identification", 
                  desc: "Once the massive volume of data footprint is securely captured locally, our heavily optimized offline Quant Engine springs into action. It maps the incoming bookmaker lines into raw, intrinsic probabilities devoid of the standard house vigorish. Utilizing extremely advanced algebraic modeling, dynamic statistical calculations, and deeply historic Poisson distribution models, it rigorously searches for mathematically mispriced odds—immediately isolating explicit positive Expected Value (+EV) opportunities where the bookmaker's implied probability is fundamentally flawed.", 
                  icon: <Calculator className="w-6 h-6 text-brand-teal" /> 
                },
                { 
                  step: "03", 
                  title: "Intelligent Slip Generation", 
                  desc: "Upon mathematically validating an undeniable statistical edge, the system forcefully filters out the surrounding market noise. It skips the manual drafting process and immediately translates those highly profitable lines into playable configurations. Using automated traversal logic, it directly communicates with major supported bookmaker platforms to generate instant, universally playable 6-digit booking codes right into your interface. You simply copy, paste, and aggressively execute your capital without any friction or hesitation.", 
                  icon: <Zap className="w-6 h-6 text-brand-blue" /> 
                },
                { 
                  step: "04", 
                  title: "Continuous Match Advisory", 
                  desc: "Unlike standard static tools, execution is not the end of the lifecycle. The highly intelligent Bet Assistant continues to act as your autonomous watchdog long after the wager is finalized. Through advanced deep reasoning heuristics, it continuously monitors live scoreboards, tactical substitutions, and real-time momentum swings for every single one of your generated slips. If a sudden variance spike or dangerous momentum shift occurs against your position during play, you receive an instantaneous, actionable push notification strongly advising you to cash out securely in-profit before a late upset ruins the return.", 
                  icon: <ShieldCheck className="w-6 h-6 text-brand-teal" /> 
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex gap-6 md:gap-10 items-start group"
                >
                   <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-brand-teal/50 group-hover:bg-brand-teal/10 transition-all duration-300 shadow-xl">
                        {item.icon}
                      </div>
                      {i !== 3 && <div className="w-px h-24 bg-gradient-to-b from-white/10 to-transparent mt-4" />}
                   </div>
                   <div className="pt-2">
                       <span className="text-brand-teal font-mono text-sm font-bold tracking-widest mb-2 block">PHASE {item.step}</span>
                      <h4 className="text-2xl font-bold text-white mb-3">{item.title}</h4>
                      <p className="text-slate-400 leading-relaxed text-lg">{item.desc}</p>
                   </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      {/* ─── Bet Calculator Section ─── */}
      <section id="calculator" className="relative z-20 py-24 px-6 bg-[#060913] border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[40vw] h-[40vw] bg-brand-blue/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-teal mb-4">Free Tools</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Bet <span className="text-gradient">Calculator</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              Four professional-grade calculators used by quant bettors worldwide. No sign-up required.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <CalcWrapper />
          </motion.div>
        </div>
      </section>

      {/* ─── Partners / Credibility Section ─── */}
      <section className="relative z-20 py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 mb-4">Powered By &amp; Integrated With</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">The Infrastructure Behind <span className="text-gradient">Every Edge</span></h2>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-wrap justify-center gap-6 md:gap-10">
            {[
              { name: "SportyBet", logo: (
                <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
                  <rect width="40" height="40" rx="8" fill="#007a38"/>
                  <text x="20" y="27" textAnchor="middle" fontSize="12" fontWeight="900" fill="white" fontFamily="Arial, sans-serif">SportyBet</text>
                </svg>
              )},
              { name: "Bet9ja", logo: (
                <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
                  <rect width="40" height="40" rx="8" fill="#005880"/>
                  <text x="20" y="27" textAnchor="middle" fontSize="12" fontWeight="900" fill="white" fontFamily="Arial, sans-serif">Bet9ja</text>
                </svg>
              )},
              { name: "1xBet", logo: (
                <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
                  <rect width="40" height="40" rx="8" fill="#1b3566"/>
                  <text x="20" y="27" textAnchor="middle" fontSize="12" fontWeight="900" fill="#f5c518" fontFamily="Arial, sans-serif">1xBet</text>
                </svg>
              )},
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 180, damping: 14 }}
                className="flex flex-col items-center gap-2.5 group cursor-default"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center group-hover:border-brand-teal/40 group-hover:scale-110 group-hover:bg-white/8 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  {p.logo}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-300 transition-colors tracking-wide">{p.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Reviews Section ─── */}
      <section className="relative z-20 py-24 px-6 bg-[#060913] border-t border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vw] bg-brand-teal/4 blur-[130px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-teal mb-4">From The Community</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">What Real Operators Are Saying</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Card 1 — Hero Quote spotlight */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative rounded-3xl overflow-hidden p-8 flex flex-col justify-between min-h-[380px]"
              style={{ background: "linear-gradient(135deg, rgba(0,198,186,0.13) 0%, rgba(0,113,206,0.07) 55%, rgba(3,6,14,1) 100%)" }}
            >
              <div className="absolute inset-0 border border-brand-teal/20 rounded-3xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-teal/10 rounded-full blur-[70px] pointer-events-none" />
              {/* Giant decorative quote */}
              <div className="text-[140px] leading-none font-black text-brand-teal/8 absolute top-0 left-4 select-none pointer-events-none">&ldquo;</div>
              <div className="relative z-10 mt-10">
                <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
                  &ldquo;I ran <span className="text-brand-teal font-black">/scan</span> on a Thursday and hit a{" "}
                  <span className="text-brand-teal font-black">+14% EV edge</span> on a Serie A match I&apos;d have never found manually. Confidence score made me trust it. Won the bet. This is the tool serious bettors need.&rdquo;
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-teal to-brand-blue flex items-center justify-center text-white font-black text-sm shadow-[0_0_20px_rgba(0,198,186,0.3)]">AL</div>
                  <div>
                    <div className="text-sm font-bold text-white">Ade_Lagos</div>
                    <div className="text-[11px] text-slate-400">@ade.sporty · Market Scanner</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => <Star key={si} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
              </div>
            </motion.div>

            {/* Right column */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Card 2 — Stat spotlight */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="rounded-3xl p-7 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(0,113,206,0.12) 0%, rgba(3,6,14,1) 80%)" }}
              >
                <div className="absolute inset-0 border border-brand-blue/20 rounded-3xl pointer-events-none" />
                <div className="shrink-0 relative z-10 text-center md:text-left">
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-brand-blue to-cyan-400 leading-none">40%</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">Less Drawdown</div>
                </div>
                <div className="relative z-10 flex-1">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    &ldquo;Before, I was staking random amounts based on gut feel. The{" "}
                    <span className="text-brand-blue font-bold">Kelly Criterion calculator</span> now tells me the mathematically optimal stake every single week. My drawdowns dropped 40% since I started.&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-5">
                    <div className="w-9 h-9 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-xs font-black text-brand-blue">GQ</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white">GhanaQuant</div>
                      <div className="text-[10px] text-slate-500">@ghana.quant · Bet Calculator</div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => <Star key={si} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 — Terminal-style notification */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.28 }}
                className="rounded-3xl overflow-hidden border border-green-500/15"
              >
                {/* Mac window chrome */}
                <div className="bg-[#0a0f1c] px-5 py-3 flex items-center gap-2 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-3 text-[10px] font-mono text-slate-600">slip_tracker_notification.log</span>
                </div>
                <div className="bg-[#060913] p-6">
                  <div className="font-mono text-sm space-y-1.5 mb-5">
                    <p className="text-green-400 font-bold">✅ SLIP TRACKER — Halftime Update</p>
                    <p className="text-slate-500 text-xs">Code: <span className="text-white">BC-SAT-MRC</span> &nbsp;·&nbsp; Platform: <span className="text-white">SportyBet</span></p>
                    <div className="pt-2" />
                    <p className="text-yellow-400">⚠️  Momentum shift detected · Game 3.</p>
                    <p className="text-slate-300">Recommendation: <span className="text-green-400 font-bold">CASHOUT NOW @ 3.2x</span></p>
                    <p className="text-slate-600 text-xs">— AI Advisory Engine · 17:34 HRS</p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center text-xs font-black text-green-400 shrink-0">MA</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 leading-relaxed">&ldquo;I got this exact notification at halftime and cashed out at 3.2x. The AI called it perfectly — Game 3 lost at full time. That push literally saved my stake.&rdquo;</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-white">Miracle_Abuja</span>
                          <span className="text-[10px] text-slate-500 ml-2">@miracle.tips · Slip Tracker</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, si) => <Star key={si} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>


      {/* ─── FAQ Section ─── */}
      <section id="faq" className="relative z-20 py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-teal mb-4">Got Questions?</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Frequently Asked <span className="text-gradient">Questions</span></h2>
          </motion.div>
          <div className="space-y-3">
            {[
              { q: "What exactly is Expected Value (EV) in simple terms?", a: "EV is your mathematical profit edge over the bookmaker. A bet with +5% EV means that for every ₦100 you stake on that type of bet consistently, you are mathematically expected to get ₦105 back on average. Bookmakers make money by offering bets with negative EV — our engine finds the rare opportunities where the maths tips in YOUR favour." },
              { q: "What does the Confidence percentage mean?", a: "Confidence is the AI's internally calculated probability that the specific outcome will actually happen — based on our Poisson distribution model, historical form, and scoring averages. For example, 78% Confidence on a Home Win means the AI believes there's a 78% chance that team wins. We set minimum confidence floors per market (e.g., 72% for Home/Away, 25% for Draw) before even considering the EV edge." },
              { q: "How does the market scanner work?", a: "Type /scan in the chat (or click Quick Actions). The engine fetches live odds from 55+ global leagues, runs each bet through our Poisson probability model to estimate a 'true' probability, and compares it to the bookmaker's implied probability. Only fixtures with a positive EV above our minimum threshold AND above our confidence floor are shown. We also refine results with real historical team form data." },
              { q: "Is this a Telegram bot or a website?", a: "Both. The core AI engine runs on Telegram for instant mobile notifications and quick commands on the go. The web dashboard gives you a richer interface with market scan results, slip analysis, the bet calculator, and the premium slip tracker. You can link your Telegram account to your web dashboard for seamless push notifications." },
              { q: "How do I link my Telegram account?", a: "Start a conversation with our Telegram bot and it will generate a secure link code for you. Then, on your dashboard, go to Settings and enter the code. Your accounts are merged instantly. Premium subscribers can then receive AI push notifications directly on Telegram whenever an opportunity or cashout signal is detected on their tracked slips." },
              { q: "What platforms are supported for booking codes?", a: "We currently support SportyBet, Bet9ja, 1xBet, Betway, BetWinner, MSport, and 22Bet. You can generate booking codes for all platforms simultaneously with the 'Generate All Booking Codes' button after a scan, or convert a code from one platform to another with the /convert command." },
              { q: "What is the Slip Tracker and who can use it?", a: "The Slip Tracker is a Premium-exclusive feature where you submit your active booking code and the AI continuously monitors your games. When it detects a momentum shift, adverse variance, or a cashout opportunity, it sends you a push notification via Telegram with specific reasons. You can also manually mark slips as Won, Lost, or Cashed Out to keep your records." },
              { q: "What is the difference between the Trial and Premium?", a: "The 7-day free trial gives you full access to market scanning, slip analysis, booking code generation, and AI chat. Premium adds: Slip Tracking with Telegram push notifications, re-analysis of active slips, priority scan access during high-traffic periods, and early access to new features like advanced league filters and sharps tracking." },
              { q: "Does the AI guarantee profits?", a: "No. No betting tool can guarantee profits, and anyone who says otherwise is lying to you. What we do is provide a statistically sound mathematical edge on each bet we recommend. EV betting is a long-run strategy — over hundreds of bets, the mathematics will work in your favour. A single session can still result in a loss. Use proper bankroll management (check our Kelly Criterion Calculator!) and never stake money you can't afford to lose." },
              { q: "How accurate is the Poisson model?", a: "The Poisson distribution model is used by professional bettors and syndicates worldwide. It uses team scoring averages (attack and defence rates) to estimate the probability of every possible scoreline, then derives market probabilities from that. We also layer in real historical form data (last 5 games momentum) and home/away multipliers. No model is 100% accurate — but it is significantly more rigorous than manual guessing or tipster advice." },
            ].map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="border border-white/8 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/3 transition-all"
                >
                  <span className="text-sm font-bold text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-brand-teal shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-slate-400 leading-relaxed px-6 pb-6">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="relative z-20 py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-brand-blue/20 to-brand-teal/10 border border-brand-teal/20 p-12 md:p-20 text-center relative overflow-hidden backdrop-blur-3xl shadow-[0_0_100px_rgba(0,198,186,0.15)]"
        >
           <div className="absolute inset-0 bg-noise opacity-[0.25] mix-blend-overlay"></div>
           <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight relative z-10">Stop guessing. <br/>Start <span className="text-gradient">Executing.</span></h2>
           <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto relative z-10">Deploy the bot to your Telegram infrastructure right now and gain immediate mathematical parity over the market.</p>
           <Link href="/auth/signup" className="relative z-10 px-8 py-4 md:px-12 md:py-6 bg-white text-background font-black text-sm md:text-xl rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,198,186,0.4)] transition-all duration-300 flex items-center justify-center uppercase tracking-widest text-center w-full md:w-auto">
             Start 7-Day Free Trial
           </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 relative z-20 bg-[#03060E]">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 overflow-hidden rounded-md flex items-center justify-center"><img src="/image.jpg" alt="Bet Assistant" className="w-full h-full object-cover scale-[1.65]" /></div>
             <span className="text-slate-300 font-bold tracking-wide">Bet Assistant</span>
          </div>
          <div className="flex gap-8 text-slate-500 text-sm font-medium">
             <Link href="/privacy" className="hover:text-brand-teal transition-colors">Privacy Policy</Link>
             <Link href="/terms" className="hover:text-brand-teal transition-colors">Terms of Service</Link>
             <Link href="/status" className="hover:text-brand-teal transition-colors">Bot Status</Link>
          </div>
          <p className="text-slate-600 text-sm">© 2026 CTTS.</p>
        </div>
      </footer>
    </main>
  );
}
