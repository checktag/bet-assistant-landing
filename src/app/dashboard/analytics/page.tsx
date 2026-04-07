"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Zap, Target, Activity,
  ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, TrendingUp
} from "lucide-react";

// Simulated stat data — in production wire to /api/my-stats
const SAMPLE_STATS = {
  totalScans: 38,
  totalSlipsChecked: 15,
  totalBetsTracked: 9,
  winRate: 61,
  avgEV: 7.4,
  bestEV: 22.1,
  totalProfit: 48200,
  totalStaked: 112000,
  roi: 43.0,
  activeSlips: 2,
  wonSlips: 5,
  lostSlips: 2,
};

const WEEKLY_SCANS = [4, 7, 5, 9, 6, 4, 8]; // last 7 days
const EV_HISTORY   = [5.2, 8.1, 6.4, 11.2, 7.0, 9.8, 12.5, 7.4, 8.9, 10.1, 6.2, 7.4];
const MARKET_DIST  = [
  { label: "Home Win",  pct: 42, color: "bg-brand-teal" },
  { label: "Over 2.5",  pct: 28, color: "bg-brand-blue" },
  { label: "BTTS Yes",  pct: 18, color: "bg-purple-400" },
  { label: "Away Win",  pct: 8,  color: "bg-yellow-400" },
  { label: "Draw",      pct: 4,  color: "bg-slate-500" },
];
const TOP_LEAGUES = [
  { name: "Premier League", count: 11, ev: 8.9 },
  { name: "Serie A",        count: 8,  ev: 9.4 },
  { name: "La Liga",        count: 7,  ev: 7.2 },
  { name: "Bundesliga",     count: 6,  ev: 11.0 },
  { name: "Ligue 1",        count: 6,  ev: 6.8 },
];
const RECENT_ACTIVITY = [
  { type: "scan",  label: "Weekend Market Scan",         time: "2h ago",   ev: "+9.2%" },
  { type: "slip",  label: "SportyBet — BC-SAT-MRC",      time: "5h ago",   ev: "+EV" },
  { type: "win",   label: "Slip WON — BC-FRI-ADE",       time: "Yesterday",ev: "+₦14,200" },
  { type: "scan",  label: "Serie A Deep Scan",           time: "2 days ago",ev: "+11.2%" },
  { type: "loss",  label: "Slip LOST — BC-THU-GQ",       time: "3 days ago",ev: "-₦5,000" },
  { type: "slip",  label: "Bet9ja — BC-WED-QUANT",       time: "4 days ago",ev: "+EV" },
];

function MiniBar({ values, color = "bg-brand-teal" }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 ${color} rounded-sm opacity-80 transition-all`}
          style={{ height: `${(v / max) * 100}%`, minHeight: "4px" }}
        />
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  const statCards = [
    { label: "Total Scans",      value: SAMPLE_STATS.totalScans,      sub: "last 30 days",   icon: <Zap className="w-5 h-5 text-brand-teal" />,    trend: "up",   color: "brand-teal" },
    { label: "Slips Analysed",   value: SAMPLE_STATS.totalSlipsChecked,sub: "booking codes",  icon: <Target className="w-5 h-5 text-brand-blue" />,  trend: "up",   color: "brand-blue" },
    { label: "Win Rate",         value: `${SAMPLE_STATS.winRate}%`,   sub: "tracked slips",  icon: <TrendingUp className="w-5 h-5 text-green-400" />,trend: "up",   color: "green-400" },
    { label: "Avg EV Edge",      value: `+${SAMPLE_STATS.avgEV}%`,   sub: "per winning bet", icon: <Activity className="w-5 h-5 text-purple-400" />, trend: "up",   color: "purple-400" },
    { label: "Net Profit",       value: `₦${(SAMPLE_STATS.totalProfit/1000).toFixed(1)}k`,sub: "all tracked bets",icon:<CheckCircle2 className="w-5 h-5 text-green-400"/>,trend:"up",color:"green-400"},
    { label: "ROI",              value: `${SAMPLE_STATS.roi}%`,      sub: "return on staked",icon:<TrendingUp className="w-5 h-5 text-brand-teal" />,trend:"up",   color:"brand-teal" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 md:px-0 space-y-8 relative z-10">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-1">Analytics</h1>
            <p className="text-sm text-slate-400">Your full quant edge report — last 30 days.</p>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={loaded ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl bg-[#0A0F1C] border border-white/8 flex flex-col gap-3 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">{s.icon}</div>
                  {s.trend === "up"
                    ? <ArrowUpRight className="w-4 h-4 text-green-400" />
                    : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5 italic">{s.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Weekly Scans Sparkline */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-[#0A0F1C] border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-black text-white">Scans This Week</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Daily Volume</div>
                </div>
                <div className="text-2xl font-black text-brand-teal">{WEEKLY_SCANS.reduce((a,b)=>a+b,0)}</div>
              </div>
              <MiniBar values={WEEKLY_SCANS} color="bg-brand-teal" />
              <div className="flex justify-between mt-2">
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <span key={i} className="text-[9px] text-slate-600 flex-1 text-center">{d}</span>
                ))}
              </div>
            </motion.div>

            {/* EV Trend */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="p-6 rounded-2xl bg-[#0A0F1C] border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-black text-white">EV Edge Trend</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Last 12 Bets</div>
                </div>
                <div className="text-2xl font-black text-green-400">+{SAMPLE_STATS.avgEV}%</div>
              </div>
              <MiniBar values={EV_HISTORY} color="bg-green-400" />
              <div className="flex justify-between mt-2 px-0.5">
                <span className="text-[9px] text-slate-600">12 bets ago</span>
                <span className="text-[9px] text-slate-600">Latest</span>
              </div>
            </motion.div>
          </div>

          {/* Market Distribution + Top Leagues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Market Distribution */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-[#0A0F1C] border border-white/8">
              <div className="text-sm font-black text-white mb-1">Market Distribution</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-5">What markets you bet most</div>
              <div className="space-y-4">
                {MARKET_DIST.map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-slate-300 font-medium">{m.label}</span>
                      <span className="text-xs font-black text-white">{m.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.7 }}
                        className={`h-full ${m.color} rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Leagues */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="p-6 rounded-2xl bg-[#0A0F1C] border border-white/8">
              <div className="text-sm font-black text-white mb-1">Top Leagues by Edge</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-5">Where your best EV came from</div>
              <div className="space-y-3">
                {TOP_LEAGUES.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-brand-teal/10 flex items-center justify-center text-[10px] font-black text-brand-teal shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{l.name}</div>
                      <div className="text-[10px] text-slate-500">{l.count} picks</div>
                    </div>
                    <div className="text-xs font-black text-green-400 shrink-0">+{l.ev}% avg EV</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Slip Summary */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Active Slips",   value: SAMPLE_STATS.activeSlips, color: "text-brand-teal",  border: "border-brand-teal/20",  bg: "bg-brand-teal/5" },
                { label: "Won",            value: SAMPLE_STATS.wonSlips,    color: "text-green-400",   border: "border-green-400/20",   bg: "bg-green-400/5" },
                { label: "Lost",           value: SAMPLE_STATS.lostSlips,   color: "text-red-400",     border: "border-red-400/20",     bg: "bg-red-400/5" },
              ].map((s, i) => (
                <div key={i} className={`p-5 rounded-2xl ${s.bg} border ${s.border} flex flex-col gap-1`}>
                  <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="p-6 rounded-2xl bg-[#0A0F1C] border border-white/8">
            <div className="text-sm font-black text-white mb-5">Recent Activity</div>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((a, i) => {
                const iconMap: Record<string, React.ReactNode> = {
                  scan:  <Zap className="w-4 h-4 text-brand-teal" />,
                  slip:  <Target className="w-4 h-4 text-brand-blue" />,
                  win:   <CheckCircle2 className="w-4 h-4 text-green-400" />,
                  loss:  <AlertCircle className="w-4 h-4 text-red-400" />,
                };
                const evColor = a.ev.startsWith("+") ? "text-green-400" : "text-red-400";
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">{iconMap[a.type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{a.label}</div>
                      <div className="text-[10px] text-slate-500">{a.time}</div>
                    </div>
                    <span className={`text-xs font-black shrink-0 ${evColor}`}>{a.ev}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
  );
}
