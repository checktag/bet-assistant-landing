"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Zap, Globe, Clock, Calculator } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession } from "next-auth/react";
import { createBet9jaCode } from "@/lib/bet9ja";

interface Prediction {
  match: string;
  market: string;
  odds: number;
  ev_edge: number;
  model_prob: number;
  commence_time: string;
  profiles?: string[];
  category?: string;
  top?: boolean;
}

interface Selection {
  match: string;
  market: string;
  odds: number;
  item_date: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "scan" | "slip" | "convert" | "codes" | "onboarding";
  data?: any;
}

interface AssistantChatProps {
  accessToken: string;
  modelVersion?: string;
}

const LinkingRequiredOverlay = ({ onAction }: { onAction: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="absolute inset-0 z-50 bg-[#03060E]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
  >
    <div className="w-20 h-20 rounded-3xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20 mb-6">
      <Send className="w-10 h-10" />
    </div>
    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Identity Sync Required</h3>
    <p className="text-sm text-slate-400 mb-8 max-w-xs leading-relaxed">
      Institutional clearance requires a synced Telegram identity. Link your account to unlock terminal analysis.
    </p>
    <button 
      onClick={onAction}
      className="px-8 py-4 rounded-xl bg-brand-teal text-background font-black text-xs uppercase tracking-widest hover:scale-110 active:scale-95 transition-all"
    >
      Link Telegram Now
    </button>
  </motion.div>
);

// ─── Action-Specific Loaders ─────────────────────────────────────────────────

type LoaderType = "scan" | "checkslip" | "ai" | "codegen" | null;

/** Shared animated progress bar used across loaders */
const ProgressBar = ({ color, duration = 14000 }: { color: string; duration?: number }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let cur = 0;
    const t = setInterval(() => {
      const step = cur < 30 ? 2.5 : cur < 65 ? 1.2 : cur < 85 ? 0.4 : 0.1;
      cur = Math.min(cur + step, 95);
      setProgress(cur);
      if (cur >= 95) clearInterval(t);
    }, duration / 950);
    return () => clearInterval(t);
  }, [duration]);
  return (
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ease-linear ${color}`} style={{ width: `${progress}%`, transitionDuration: "150ms" }} />
    </div>
  );
};

/** Rotating message ticker */
const MessageTicker = ({ messages, interval = 2200, color }: { messages: string[]; interval?: number; color: string }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => Math.min(i + 1, messages.length - 1)), interval);
    return () => clearInterval(t);
  }, [messages.length, interval]);
  return (
    <motion.span key={idx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className={`text-[9px] italic truncate ${color}`}>
      {messages[idx]}
    </motion.span>
  );
};

// ── 1. Market Scan Loader ─────────────────────────────────────────────────────
const ScanLoader = () => (
  <div className="flex flex-col gap-3 p-4 bg-black/25 rounded-2xl border border-brand-teal/15 w-full max-w-[300px]">
    <div className="flex items-center gap-3">
      {/* Radar pulse icon */}
      <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-brand-teal/40 animate-ping" />
        <div className="absolute inset-1 rounded-full border border-brand-teal/20 animate-ping" style={{ animationDelay: "0.3s" }} />
        <Globe className="w-4 h-4 text-brand-teal relative z-10" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[11px] font-black text-white tracking-widest uppercase">Market Scan</span>
        <MessageTicker color="text-brand-teal" messages={[
          "Connecting to global league markets...",
          "Fetching live bookmaker odds...",
          "Running Poisson & Gaussian models...",
          "Calculating EV edges...",
          "Applying Dixon-Coles & spread math...",
          "Filtering high-confidence picks...",
          "Building your risk-tiered output...",
        ]} />
      </div>
      <div className="flex gap-[3px] shrink-0">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="w-[3px] bg-brand-teal rounded-full animate-bounce"
            style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
    <ProgressBar color="bg-gradient-to-r from-brand-teal to-brand-blue" duration={16000} />
    <div className="flex justify-between text-[9px] text-slate-600">
      <span>Global leagues</span><span>Quant + EV model</span><span>Live odds</span>
    </div>
  </div>
);

// ── 2. Check Slip Loader ──────────────────────────────────────────────────────
const CheckSlipLoader = () => (
  <div className="flex flex-col gap-3 p-4 bg-black/25 rounded-2xl border border-brand-blue/15 w-full max-w-[300px]">
    <div className="flex items-center gap-3">
      {/* Magnifier scan icon */}
      <div className="relative w-9 h-9 shrink-0 flex items-center justify-center bg-brand-blue/10 rounded-xl border border-brand-blue/20">
        <Calculator className="w-4 h-4 text-brand-blue" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[11px] font-black text-white tracking-widest uppercase">Slip Analysis</span>
        <MessageTicker color="text-brand-blue" messages={[
          "Decoding booking code...",
          "Fetching fixture data...",
          "Scoring each selection...",
          "Running cashout valuation...",
          "Checking live match status...",
          "Generating AI recommendation...",
        ]} />
      </div>
      {/* Pulsing dots */}
      <div className="flex gap-1 shrink-0">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
    <ProgressBar color="bg-gradient-to-r from-brand-blue to-purple-500" duration={10000} />
    <div className="flex justify-between text-[9px] text-slate-600">
      <span>Multi-bookie decode</span><span>AI scoring</span><span>Live status</span>
    </div>
  </div>
);

// ── 3. AI Chat Loader ─────────────────────────────────────────────────────────
const AILoader = () => {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setDots(d => d < 3 ? d + 1 : 1), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-black/20 rounded-2xl border border-white/5 w-fit">
      <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
        <Zap className="w-3.5 h-3.5 text-purple-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Thinking</span>
        <span className="text-[9px] text-purple-400 font-mono">{"•".repeat(dots)}{"·".repeat(3 - dots)}</span>
      </div>
      {/* Animated waveform */}
      <div className="flex gap-[2px] items-end h-5 shrink-0">
        {[3, 5, 8, 5, 3, 6, 9, 6, 4].map((h, i) => (
          <div key={i} className="w-[2px] bg-purple-400/60 rounded-full animate-pulse"
            style={{ height: `${h}px`, animationDelay: `${i * 0.1}s`, animationDuration: "0.8s" }} />
        ))}
      </div>
    </div>
  );
};

// ── 4. Code Generation Loader ─────────────────────────────────────────────────
const CodeGenLoader = () => (
  <div className="flex flex-col gap-3 p-4 bg-black/25 rounded-2xl border border-yellow-500/15 w-full max-w-[300px]">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-yellow-500/10 rounded-xl border border-yellow-500/20">
        <Clock className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[11px] font-black text-white tracking-widest uppercase">Generating Codes</span>
        <MessageTicker color="text-yellow-400" messages={[
          "Matching fixtures in bookie DB...",
          "Mapping market IDs...",
          "Building multi-platform slip...",
          "Encoding SportyBet code...",
          "Encoding Bet9ja code...",
          "Encoding MSport code...",
          "Finalizing booking codes...",
        ]} />
      </div>
    </div>
    <ProgressBar color="bg-gradient-to-r from-yellow-400 to-amber-500" duration={12000} />
    <div className="flex justify-between text-[9px] text-slate-600">
      <span>SportyBet</span><span>Bet9ja</span><span>MSport</span>
    </div>
  </div>
);

/** Route to the correct loader based on current action */
const ActionLoader = ({ type }: { type: LoaderType }) => {
  if (!type) return null;
  return (
    <div className="flex justify-start my-4">
      {type === "scan"      && <ScanLoader />}
      {type === "checkslip" && <CheckSlipLoader />}
      {type === "ai"        && <AILoader />}
      {type === "codegen"   && <CodeGenLoader />}
    </div>
  );
};


// Plain-English Glossary Card shown on scan/slip results
const MetricGlossary = () => (
  <div className="flex flex-wrap gap-3 mb-3 p-3 rounded-xl border border-white/5 bg-black/20">
    <div className="flex items-start gap-2">
      <span className="w-2 h-2 rounded-full bg-green-400 mt-1 shrink-0" />
      <div>
        <span className="text-[9px] font-black text-green-400 uppercase tracking-wider block">EV (Expected Value)</span>
        <span className="text-[9px] text-slate-500 leading-tight">Your math profit edge. +5% EV = $105 back per $100 bet, long-term.</span>
      </div>
    </div>
    <div className="flex items-start gap-2">
      <span className="w-2 h-2 rounded-full bg-brand-blue mt-1 shrink-0" />
      <div>
        <span className="text-[9px] font-black text-brand-blue uppercase tracking-wider block">Conf (AI Confidence)</span>
        <span className="text-[9px] text-slate-500 leading-tight">AI-calculated probability this outcome happens. Higher = safer bet.</span>
      </div>
    </div>
  </div>
);

// Interactive component to handle client-side profile switching
const InteractiveScanResult = ({ data, onBuildSlips, paid = [], paidCredits = 3 }: { data: any, onBuildSlips: (picks: any[], platform?: string) => void, paid?: string[], paidCredits?: number }) => {
  const allBets: Prediction[] = data?.bets || [];
  const [activeTab, setActiveTab] = useState<string>(data?.default_tab || "moderate");
  // "Mixed" = the single strongest pick of each match, whatever its market; a category shows only that kind
  const [category, setCategory] = useState<string>("Mixed");
  const categories: string[] = ["Mixed", ...Array.from(new Set(allBets.map(b => b.category).filter(Boolean) as string[]))];
  const inCategory = (b: Prediction) => (category === "Mixed" ? b.top !== false : b.category === category);

  const PROFILE_TABS = [
    { id: "high",     label: "High-Stake", style: "border-yellow-400/20 text-yellow-300",  bg: "bg-yellow-400/10", activeBg: "bg-yellow-400", dot: "bg-yellow-400" },
    { id: "moderate", label: "Moderate",   style: "border-brand-teal/20 text-brand-teal",  bg: "bg-brand-teal/10", activeBg: "bg-brand-teal", dot: "bg-brand-teal" },
    { id: "low",      label: "Spread",     style: "border-purple-400/20 text-purple-300",  bg: "bg-purple-400/10", activeBg: "bg-purple-400", dot: "bg-purple-400" },
  ];

  // Filter bets based on their backend-annotated profiles list
  // Sort High-Stake by Confidence first; Moderate/Spread by EV first
  const filteredBets = allBets
    .filter(b => b.profiles?.includes(activeTab) && inCategory(b))
    .sort((a, b) => activeTab === "high" ? (b.model_prob - a.model_prob) : (b.ev_edge - a.ev_edge));

  // Removing artificial limits so all mathematically sound picks are displayed
  const slicedBets = filteredBets;

  return (
    <div className="mt-4 flex flex-col gap-3">
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${category === c ? "bg-white text-background border-white" : "border-white/10 text-slate-400 hover:text-white"}`}>
              {c}
            </button>
          ))}
        </div>
      )}
      {/* Risk Profile Selector Tabs */}
      <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
        {PROFILE_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const count = allBets.filter(b => b.profiles?.includes(tab.id) && inCategory(b)).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all cursor-pointer ${
                isActive ? `${tab.bg} border ${tab.style}` : "hover:bg-white/5 border border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                {isActive && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
                <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? '' : 'text-white'}`}>{tab.label}</span>
              </div>
              <span className={`text-[9px] font-mono ${isActive ? '' : 'text-slate-500'}`}>{count} picks</span>
            </button>
          );
        })}
      </div>

      {slicedBets.length > 0 ? (
        <>
          <MetricGlossary />
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Top Edges in {activeTab}</span>
            <span className="text-[9px] font-medium text-brand-teal italic">EV · Conf</span>
          </div>
          <div className="grid gap-2">
            {slicedBets.map((bet: Prediction, bi: number) => {
              const tabDef = PROFILE_TABS.find(t => t.id === activeTab)!;
              return (
                <div key={bi} className={`p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center group hover:${tabDef.style.split(' ')[0]} transition-all`}>
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="text-xs font-bold text-white group-hover:text-brand-teal transition-colors truncate">{bet.match}</div>
                    <div className="flex flex-wrap items-center gap-x-2 mt-0.5 min-w-0">
                      <div className="text-[10px] text-slate-400 capitalize min-w-0 break-words [overflow-wrap:anywhere]">{bet.market} @ {bet.odds}</div>
                      <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                      <div className="text-[10px] text-slate-500 font-mono italic shrink-0">
                        {bet.commence_time ? new Date(bet.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5 shrink-0">
                    <div className={`text-[10px] font-bold ${bet.ev_edge >= 0 ? "text-green-400" : "text-slate-400"}`}>{bet.ev_edge > 0 ? "+" : ""}{bet.ev_edge}% edge</div>
                    <div className="text-[10px] text-brand-blue font-mono">{bet.model_prob}% Conf</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => onBuildSlips(slicedBets)}
            className={`w-full mt-2 py-2.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest ${
              PROFILE_TABS.find(t => t.id === activeTab)?.bg
            } ${PROFILE_TABS.find(t => t.id === activeTab)?.style.replace('text-', 'border-').replace('/20', '/40')} hover:brightness-125`}
          >
            Generate Booking Codes
          </button>
          {/* Bookmakers reached through a paid conversion: on request only, main markets carry over */}
          {paid.map(p => (
            <button key={p} onClick={() => onBuildSlips(slicedBets, p)}
              className="w-full mt-2 py-2.5 border border-white/15 text-[10px] font-bold uppercase tracking-wider text-slate-200 hover:bg-white/5 cursor-pointer">
              {p.charAt(0).toUpperCase() + p.slice(1)} code · {paidCredits} credits
            </button>
          ))}
        </>
      ) : (
        <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
          <div className="text-xs text-slate-400">No {activeTab} edges found right now.</div>
          <div className="text-[10px] text-slate-500 mt-1">Our models require a strict edge to recommend bets here. Try a different profile.</div>
        </div>
      )}
    </div>
  );
};

export default function AssistantChat({ accessToken, modelVersion = "grok-4.20-0309-non-reasoning" }: AssistantChatProps) {
  const { update, data: session } = useSession();
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io").replace(/\/$/, "");
  // Bookmakers the server can reach right now (the list changes if one refuses our server)
  const [bookies, setBookies] = useState<string[]>(["sportybet", "bet9ja", "msport"]);
  const [browserBookies, setBrowserBookies] = useState<string[]>([]);   // codes created by this browser
  const [paidBookies, setPaidBookies] = useState<string[]>([]);         // codes through the paid conversion service
  const [paidCredits, setPaidCredits] = useState(3);
  useEffect(() => {
    axios.get(`${API_URL}/sports`).then(r => {
      const list = r.data?.available_bookmakers;
      const viaBrowser: string[] = Array.isArray(r.data?.browser_bookmakers) ? r.data.browser_bookmakers : [];
      setBrowserBookies(viaBrowser);
      setPaidBookies(Array.isArray(r.data?.paid_bookmakers) ? r.data.paid_bookmakers : []);
      if (typeof r.data?.paid_code_credits === "number") setPaidCredits(r.data.paid_code_credits);
      if (Array.isArray(list) && list.length) setBookies([...list, ...viaBrowser]);
    }).catch(() => {});
  }, [API_URL]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 **Welcome back, Operative.**\nYour Quant Terminal is active. Type a command or click **QUICK ACTIONS** to begin scanning.",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeLoader, setActiveLoader] = useState<LoaderType>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLinkRequired, setShowLinkRequired] = useState(false);
  const [activeScanSport, setActiveScanSport] = useState<"soccer" | "basketball">("soccer");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view: on every message, while loading, and after entry animations settle
  useEffect(() => {
    const toBottom = () => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    };
    toBottom();
    const t1 = setTimeout(toBottom, 150);
    const t2 = setTimeout(toBottom, 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [messages, activeLoader, isLoading]);

  // Chat history is kept on this device, per account (type /clear to wipe it)
  const historyKey = `ba_chat_${(session?.user as { email?: string } | undefined)?.email || "guest"}`;
  const restoredKey = useRef<string | null>(null);
  useEffect(() => {
    if (restoredKey.current === historyKey) return;
    restoredKey.current = historyKey;
    try {
      const saved = JSON.parse(localStorage.getItem(historyKey) || "null");
      if (Array.isArray(saved) && saved.length) setMessages(saved);
    } catch { /* storage unavailable */ }
  }, [historyKey]);
  useEffect(() => {
    if (restoredKey.current !== historyKey) return;
    try {
      const recent = messages.slice(-40);
      // full scan tables are large: keep them for the latest few messages only
      const light = recent.map((m, i) => (m.type === "scan" && i < recent.length - 4 ? { role: m.role, content: m.content } : m));
      localStorage.setItem(historyKey, JSON.stringify(light));
    } catch { /* quota or private mode */ }
  }, [messages, historyKey]);

  // Quick actions: scans run immediately; templates that need a code are placed in the input
  const runQuick = (cmd: string) => {
    setIsMenuOpen(false);
    if (cmd.trim().toLowerCase().startsWith("/scan")) handleSend(undefined, cmd.trim());
    else setInput(cmd);
  };

  const handleSend = async (e?: React.FormEvent, override?: string) => {
    e?.preventDefault();
    const text = (override ?? input).trim();
    if (!text || isLoading) return;

    const userMsg = text;
    setInput("");
    if (userMsg.toLowerCase() === "/clear") {
      setMessages(prev => prev.slice(0, 1));
      return;
    }
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    const chatHistory = messages.map(m => ({ role: m.role, content: m.content })).slice(-10);

    try {
      // ── /help ─────────────────────────────────────────────────────────────
      if (userMsg.toLowerCase() === "/help") {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "📚 **Command Reference** — everything you can do here.",
          type: "onboarding"
        }]);
        setIsLoading(false);
        return;
      }

      // ── /scan ─────────────────────────────────────────────────────────────
      if (userMsg.toLowerCase().startsWith("/scan")) {
        setActiveLoader("scan");
        const parts = userMsg.split(" ");
        let dateArg = null;
        let leagueArg = null;

        // Extract risk keyword from anywhere in the command
        const RISK_KEYWORDS: Record<string, string> = {
          high: "high", "high-stake": "high", stake: "high",
          moderate: "moderate", balanced: "moderate", mid: "moderate",
          low: "low", spread: "low", many: "low",
        };
        const riskArg = parts.slice(1).find(p => RISK_KEYWORDS[p.toLowerCase()]) || null;
        const riskProfile = riskArg ? RISK_KEYWORDS[riskArg.toLowerCase()] : "moderate";

        // Extract sport keyword from anywhere in the command
        const SPORT_MAP: Record<string, string> = {
          basketball: "basketball", bball: "basketball", nba: "basketball", wnba: "basketball",
          tennis: "tennis", atp: "tennis", wta: "tennis",
          hockey: "ice_hockey", nhl: "ice_hockey",
          handball: "handball", volleyball: "volleyball", baseball: "baseball", mlb: "baseball",
          nfl: "american_football", rugby: "rugby", cricket: "cricket", darts: "darts",
          mma: "mma", ufc: "mma", boxing: "boxing", tabletennis: "table_tennis",
          soccer: "soccer", football: "soccer",
        };
        const SPORT_KEYWORDS = Object.keys(SPORT_MAP);
        const sportKey = parts.slice(1).map(p => p.toLowerCase()).find(p => SPORT_MAP[p]);
        const sportArg = sportKey ? SPORT_MAP[sportKey] : "soccer";

        // Optional market filter: "/scan market:corners" or "/scan nba market:handicap"
        const marketPart = parts.slice(1).find(p => p.toLowerCase().startsWith("market:"));
        const marketArg = marketPart ? marketPart.slice(7).replace(/[-_]/g, " ") : null;

        // Remove the risk and sport keywords, then parse remaining args
        const remaining = parts.slice(1).filter(p => !RISK_KEYWORDS[p.toLowerCase()] && !SPORT_KEYWORDS.includes(p.toLowerCase()) && !p.toLowerCase().startsWith("market:"));

        if (remaining[0] === "upcoming" || remaining[0] === "weekend" || remaining[0] === "tomorrow") {
          dateArg = remaining[0];
        } else if (remaining[0] && remaining[0].match(/\d{4}-\d{2}-\d{2}/)) {
          dateArg = remaining[0];
        } else if (remaining.length > 0) {
          leagueArg = remaining.join("_").toLowerCase();
        }

        const res = await axios.get(`${API_URL}/scan`, {
          params: { date: dateArg, league: leagueArg, risk: riskProfile, sport: sportArg, market: marketArg },
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const totalBets = res.data.bets?.length ?? 0;
        const scope = leagueArg ? leagueArg.replace(/_/g, " ") : "Global Markets";
        const window = dateArg || "Next 24h";

        setMessages(prev => [...prev, {
          role: "assistant",
          content: `🔍 **${sportArg.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())} Market Scan Complete!** Found **${totalBets} picks** from ${scope} (${window}). Select a risk profile below to filter and build your slip.`,
          type: "scan",
          data: { bets: res.data.bets, default_tab: riskProfile, total_matches: res.data.total_matches }
        }]);

        // Sync Credits Pulse
        await update();
      } else if (userMsg.toLowerCase().startsWith("/checkslip")) {
        setActiveLoader("checkslip");
        const parts = userMsg.split(" ");
        const platform = parts[1] || "sportybet";
        const code = parts[2] || "";
        const res = await axios.post(`${API_URL}/check-slip`, { platform, code, history: chatHistory, model_version: modelVersion }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: res.data.analysis,
          type: "slip",
          data: res.data.data
        }]);

        // Sync Credits Pulse
        await update();
      } else {
        setActiveLoader("ai");
        const res = await axios.post(`${API_URL}/chat`, { message: userMsg, history: chatHistory, model_version: modelVersion }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
        
        // Sync Credits Pulse
        await update();
      }
    } catch (error: any) {
      if (error.response?.status === 402) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "🚫 **Insufficient Credits!**\nYou've exhausted your available scan credits. Join our Telegram community to get **100 FREE credits** instantly, or upgrade to Premium for a one-time boost and unlimited Tracking features.",
          type: "onboarding" //Reuse onboarding style for prominent display
        }]);
      } else {
        const detail = error.response?.data?.detail;
        if (detail === "TELEGRAM_LINK_REQUIRED") {
          setShowLinkRequired(true);
        } else {
          const errorMsg = detail === "TRIAL_EXPIRED" || detail === "INSUFFICIENT_CREDITS"
            ? "🚨 Your terminal access is currently restricted. Link Telegram to claim your free credits or upgrade to Pro!"
            : "⚠️ Sorry, I encountered an error processing that request.";
          setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
        }
      }
    } finally {
      setIsLoading(false);
      setActiveLoader(null);
    }
  };

  const handleBuildSlip = async (selections: Selection[], singlePlatform?: string) => {
    setIsLoading(true);
    setActiveLoader("codegen");
    const platforms = singlePlatform
      ? [singlePlatform]
      : bookies.slice(0, 3);
    try {
      const results = await Promise.all(
        platforms.map(async p => {
          const headers = { Authorization: `Bearer ${accessToken}` };
          try {
            if (p === "bet9ja" && browserBookies.includes("bet9ja")) {
              // Bet9ja accepts this browser but not our server: the server prepares, the browser books
              const plan = (await axios.post(`${API_URL}/bet9ja/plan`, { selections }, { headers })).data;
              const res = await createBet9jaCode(plan.legs || []);
              const notes: string[] = [];
              if (res.code && res.added < selections.length) notes.push(`only ${res.added} of ${selections.length} legs available`);
              if (res.code && plan.swapped?.length) notes.push(`${plan.swapped.length} swapped to markets Bet9ja offers`);
              return { platform: p, code: res.code || `[${res.error || plan.error || "Bet9ja code unavailable"}]`, note: notes.join(", ") };
            }
            const r = await axios.post(`${API_URL}/generate-multi-code`, { platform: p, selections }, { headers });
            const partial = typeof r.data.added === "number" && r.data.added < selections.length && !String(r.data.code).startsWith("[");
            return { platform: p, code: r.data.code as string, note: partial ? `only ${r.data.added} of ${selections.length} legs available` : "" };
          } catch {
            return { platform: p, code: "[Match Error]", note: "" };
          }
        })
      );
      // Show the premium codes card
      setMessages(prev => [...prev, {
        role: "assistant",
        content: singlePlatform
          ? `🎯 **${singlePlatform.charAt(0).toUpperCase() + singlePlatform.slice(1)} code generated!**`
          : "🎟️ **Multi-Platform Codes Ready!**",
        type: "codes",
        data: results
      }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Failed to generate booking code. Please try again." }]);
    } finally {
      setIsLoading(false);
      setActiveLoader(null);
    }
  };

  const handleBuildAllSlips = async (selections: any[], platform?: string) => {
    await handleBuildSlip(selections, platform); // reuse the same multi-platform logic
  };

  const parseCuratedSelections = (text: string) => {
    const regex = /\[CURATED_SELECTION:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\]/g;
    const selections = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      selections.push({ match: match[1], market: match[2], odds: parseFloat(match[3]), item_date: match[4] });
    }
    return selections;
  };

  // Derive a rough EV+Confidence for each slip item from its odds
  const estimateSlipItemEV = (oddValue: string) => {
    const odds = parseFloat(oddValue);
    if (isNaN(odds) || odds <= 0) return null;
    const impliedProb = 1 / odds;
    const estimatedTrueProb = impliedProb * 1.05; // ~5% model edge assumption
    const ev = (estimatedTrueProb * odds - 1) * 100;
    return { ev: ev.toFixed(1), conf: (estimatedTrueProb * 100).toFixed(1) };
  };

  return (
    <div className="relative flex flex-col w-full min-w-0 h-[calc(100dvh-272px)] min-h-[380px] md:min-h-0 md:h-[min(650px,calc(100dvh-180px))] bg-[#0A0F1C] rounded-2xl md:rounded-3xl border border-white/8 shadow-2xl overflow-hidden group">
      <AnimatePresence>
        {showLinkRequired && (
          <LinkingRequiredOverlay onAction={() => {
            // Redirect to settings or show onboarding
            window.location.href = "/dashboard/settings";
          }} />
        )}
      </AnimatePresence>
      
      {/* Header */}
      <div className="px-4 md:px-8 py-3 md:py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
            <Bot className="w-6 h-6 text-brand-teal" />
          </div>
          <div>
            <h3 className="text-white font-bold tracking-tight">Live Quant Assistant</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">System Online</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer hover:scale-[1.05] active:scale-[0.95] ${isMenuOpen ? "bg-brand-teal text-background" : "bg-white/5 text-slate-400 hover:text-white"}`}
          >
            <Zap className="w-3.5 h-3.5" /> QUICK ACTIONS
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-3 w-[92vw] max-w-[340px] bg-[#060913]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 custom-scrollbar">

                  {/* SCAN GROUP */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-brand-teal" />
                        <span className="text-[9px] font-black text-brand-teal uppercase tracking-[0.2em]">Market Scan</span>
                      </div>
                    </div>

                    {/* Sport Tabs inside Dropdown */}
                    <div className="grid grid-cols-2 p-0.5 bg-black/40 rounded-xl border border-white/5 mb-3">
                      <button
                        type="button"
                        onClick={() => setActiveScanSport("soccer")}
                        className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                          activeScanSport === "soccer"
                            ? "bg-brand-teal text-background"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        ⚽ Soccer
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScanSport("basketball")}
                        className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                          activeScanSport === "basketball"
                            ? "bg-brand-teal text-background"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        🏀 Basketball
                      </button>
                    </div>

                    <div className="grid gap-1">
                      {activeScanSport === "soccer" ? (
                        [
                          { cmd: "/scan",                 label: "Today's Soccer",    desc: "Top soccer edges (24h)" },
                          { cmd: "/scan upcoming",        label: "Upcoming 72h",      desc: "All upcoming soccer picks" },
                          { cmd: "/scan weekend",         label: "Weekend Fixtures",  desc: "Saturday & Sunday value" },
                          { cmd: "/scan premier league ", label: "Premier League",    desc: "Scan EPL matches" },
                          { cmd: "/scan champions league ",label: "Champions League",  desc: "Scan UEFA CL matches" },
                        ].map((a, i) => (
                          <button key={i} onClick={() => runQuick(a.cmd)}
                            className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl hover:bg-brand-teal/5 text-left transition-all cursor-pointer group border border-transparent hover:border-brand-teal/20 hover:scale-[1.02] active:scale-[0.98]">
                            <code className="text-[10px] font-black text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-lg shrink-0 font-mono whitespace-nowrap">{a.cmd.trim()}</code>
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold text-white group-hover:text-brand-teal transition-colors truncate">{a.label}</div>
                              <div className="text-[9px] text-slate-600 truncate">{a.desc}</div>
                            </div>
                          </button>
                        ))
                      ) : (
                        [
                          { cmd: "/scan basketball",          label: "Today's Basketball", desc: "Top basketball edges (24h)" },
                          { cmd: "/scan nba",                 label: "NBA Scan",           desc: "NBA value picks" },
                          { cmd: "/scan basketball upcoming", label: "Upcoming 72h",       desc: "Next 3 days basketball" },
                          { cmd: "/scan basketball weekend",  label: "Weekend Basketball", desc: "Weekend basketball value" },
                          { cmd: "/scan euroleague ",         label: "Euroleague Scan",    desc: "Scan Euroleague matches" },
                          { cmd: "/scan tennis upcoming ",    label: "Tennis Scan",        desc: "ATP / WTA / Challenger" },
                          { cmd: "/scan hockey upcoming ",    label: "Ice Hockey Scan",    desc: "NHL, KHL and more" },
                          { cmd: "/scan upcoming market:corners ", label: "Corners Market", desc: "Filter any scan by market" },
                        ].map((a, i) => (
                          <button key={i} onClick={() => runQuick(a.cmd)}
                            className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl hover:bg-brand-teal/5 text-left transition-all cursor-pointer group border border-transparent hover:border-brand-teal/20 hover:scale-[1.02] active:scale-[0.98]">
                            <code className="text-[10px] font-black text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-lg shrink-0 font-mono whitespace-nowrap">{a.cmd.trim()}</code>
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold text-white group-hover:text-brand-teal transition-colors truncate">{a.label}</div>
                              <div className="text-[9px] text-slate-600 truncate">{a.desc}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* MORE SPORTS GROUP */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🏆</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ background: "linear-gradient(90deg, #f59e0b, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>More Sports</span>
                      </div>
                      <span className="text-[8px] font-black text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded-full">LIVE</span>
                    </div>
                    <div className="grid gap-1">
                      {[
                        { cmd: "/scan tennis upcoming",     label: "Tennis",          desc: "ATP, WTA and Challenger" },
                        { cmd: "/scan hockey upcoming",     label: "Ice Hockey",      desc: "NHL, KHL and more" },
                        { cmd: "/scan nfl upcoming",        label: "American Football", desc: "NFL and college" },
                        { cmd: "/scan volleyball upcoming", label: "Volleyball",      desc: "Next 3 days" },
                        { cmd: "/scan mma upcoming",        label: "MMA",             desc: "UFC and other cards" },
                      ].map((a, i) => (
                        <button key={i} onClick={() => runQuick(a.cmd)}
                          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer group border border-transparent hover:border-yellow-500/25 hover:scale-[1.02] active:scale-[0.98]"
                          style={{ background: 'transparent' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.04)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <code className="text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 font-mono whitespace-nowrap" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>{a.cmd.trim()}</code>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-white truncate">{a.label}</div>
                            <div className="text-[9px] text-slate-600 truncate">{a.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-brand-blue" />
                      <span className="text-[9px] font-black text-brand-blue uppercase tracking-[0.2em]">Slip Analysis</span>
                    </div>
                    <div className="grid gap-1">
                      {[
                        { cmd: "/checkslip sportybet ",  label: "Check SportyBet",  desc: "Paste your code after space" },
                        { cmd: "/checkslip bet9ja ",     label: "Check Bet9ja",     desc: "AI edge score per game" },
                        { cmd: "/checkslip msport ",      label: "Check MSport",      desc: "Cashout recommendation" },
                      ].map((a, i) => (
                        <button key={i} onClick={() => runQuick(a.cmd)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group">
                          <code className="text-[10px] font-black text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-lg shrink-0 font-mono whitespace-nowrap">{a.cmd.trim()}</code>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-white group-hover:text-brand-blue transition-colors">{a.label}</div>
                            <div className="text-[9px] text-slate-600 truncate">{a.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* HELP */}
                  <button onClick={() => { setInput("/help"); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/3 hover:bg-white/6 border border-white/8 transition-all">
                    <span className="text-[10px] font-black text-slate-400">📖 View Full Command Guide</span>
                  </button>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-3 md:p-6 space-y-4 md:space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            const curated = m.role === "assistant" ? parseCuratedSelections(m.content) : [];
            const cleanContent = m.content.replace(/\[CURATED_SELECTION:.*?\]/g, "");

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex items-start gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === "assistant" ? "bg-brand-blue/20 text-brand-blue" : "bg-white/10 text-white"}`}>
                  {m.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={`min-w-0 max-w-[calc(100%-3rem)] md:max-w-[80%] rounded-2xl p-3 md:p-4 text-slate-200 ${m.role === "assistant" ? "bg-white/5 border border-white/10" : "bg-brand-blue/80 text-white"}`}>
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${m.role === "assistant" ? "prose-invert markdown-content" : ""}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanContent}</ReactMarkdown>
                  </div>

                  {/* Onboarding / Help Card */}
                  {m.type === "onboarding" && (
                    <div className="mt-3 space-y-4">

                      {/* Scan commands */}
                      <div className="p-4 rounded-2xl bg-brand-teal/5 border border-brand-teal/15 space-y-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-brand-teal" />
                          <span className="text-[10px] font-black text-brand-teal uppercase tracking-wider">Market Scan Commands</span>
                        </div>
                        
                        <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">⚽ Soccer Scans</div>
                        <div className="space-y-2">
                          {[
                            { cmd: "/scan",                 desc: "Global +EV edges — top market signals" },
                            { cmd: "/scan weekend",         desc: "Saturday & Sunday fixtures" },
                            { cmd: "/scan upcoming",        desc: "All fixtures in the upcoming window" },
                            { cmd: "/scan premier league",  desc: "Filter by league / tournament" },
                          ].map((c, ci) => (
                            <button key={ci} onClick={() => runQuick(c.cmd)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20 hover:bg-brand-teal/10 border border-transparent hover:border-brand-teal/30 text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group">
                              <code className="text-[10px] font-black text-brand-teal font-mono shrink-0">{c.cmd}</code>
                              <span className="text-[9px] text-slate-500 group-hover:text-slate-300 transition-colors min-w-0 truncate">{c.desc}</span>
                            </button>
                          ))}
                        </div>

                        <div className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wide">🏆 More Sports &amp; Markets</div>
                        <div className="space-y-2">
                          {[
                            { cmd: "/scan tennis upcoming",   desc: "Any of 14 sports: tennis, hockey, nfl, mma, cricket..." },
                            { cmd: "/scan upcoming market:corners", desc: "Filter a scan by market (corners, bookings, handicap...)" },
                            { cmd: "/scan tomorrow",          desc: "Tomorrow's fixtures" },
                            { cmd: "/scan 2026-12-06",        desc: "Fixtures on a specific date (YYYY-MM-DD)" },
                          ].map((c, ci) => (
                            <button key={ci} onClick={() => runQuick(c.cmd)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20 text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group border border-transparent hover:border-yellow-500/25"
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.06)')}
                              onMouseLeave={e => (e.currentTarget.style.background = '')}
                            >
                              <code className="text-[10px] font-black font-mono shrink-0" style={{ color: '#f59e0b' }}>{c.cmd}</code>
                              <span className="text-[9px] text-slate-500 group-hover:text-slate-300 transition-colors min-w-0 truncate">{c.desc}</span>
                            </button>
                          ))}
                        </div>

                        <div className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wide">🏀 Basketball Scans</div>
                        <div className="space-y-2">
                          {[
                            { cmd: "/scan basketball",      desc: "Scan today's basketball / NBA markets" },
                            { cmd: "/scan nba",             desc: "Scan active NBA matches" },
                            { cmd: "/scan nba weekend",     desc: "Weekend NBA value fixtures" },
                            { cmd: "/scan basketball upcoming", desc: "All upcoming basketball games" },
                          ].map((c, ci) => (
                            <button key={ci} onClick={() => runQuick(c.cmd)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20 hover:bg-brand-teal/10 border border-transparent hover:border-brand-teal/30 text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group">
                              <code className="text-[10px] font-black text-brand-teal font-mono shrink-0">{c.cmd}</code>
                              <span className="text-[9px] text-slate-500 group-hover:text-slate-300 transition-colors min-w-0 truncate">{c.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Slip tools */}
                      <div className="p-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/15 space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-brand-blue" />
                          <span className="text-[10px] font-black text-brand-blue uppercase tracking-wider">Slip Analysis</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { cmd: "/checkslip sportybet ABC123", desc: "Decode & analyse a SportyBet slip" },
                            { cmd: "/checkslip bet9ja XYZ789",   desc: "Analyse a Bet9ja booking code" },
                            { cmd: "/checkslip betika CODE",     desc: "Betika slip EV + cashout advice" },
                            { cmd: "/checkslip msport CODE",      desc: "MSport slip breakdown" },
                          ].map((c, ci) => (
                            <button key={ci} onClick={() => runQuick(c.cmd)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20 hover:bg-brand-blue/10 border border-transparent hover:border-brand-blue/30 text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group">
                              <code className="text-[10px] font-black text-brand-blue font-mono shrink-0 whitespace-nowrap">{c.cmd}</code>
                              <span className="text-[9px] text-slate-500 group-hover:text-slate-300 transition-colors">{c.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Convert */}
                      <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 space-y-3">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Convert Slip</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { cmd: "/convert sportybet bet9ja CODE",  desc: "Move a slip from SportyBet to Bet9ja" },
                            { cmd: "/convert bet9ja sportybet CODE",  desc: "Bet9ja → SportyBet" },
                            { cmd: "/convert sportybet msport CODE",  desc: "SportyBet → MSport" },
                            { cmd: "/convert bet9ja betika CODE",    desc: "Bet9ja → Betika" },
                          ].map((c, ci) => (
                            <button key={ci} onClick={() => runQuick(c.cmd)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group">
                              <code className="text-[10px] font-black text-purple-400 font-mono shrink-0 break-all">{c.cmd}</code>
                              <span className="text-[9px] text-slate-500 group-hover:text-slate-300 transition-colors">{c.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* AI Chat tip */}
                      <div className="p-3 rounded-xl bg-white/3 border border-white/8 flex items-start gap-2">
                        <Bot className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          <strong className="text-white">💬 Free-text chat also works!</strong> Ask anything — <em>&ldquo;Which teams are on a win streak today?&rdquo;</em>, <em>&ldquo;Should I cash out my Arsenal slip?&rdquo;</em>, or <em>&ldquo;Give me a 3-game parlay for tonight.&rdquo;</em>
                          The AI will embed clickable selections automatically.
                        </p>
                      </div>

                      <div className="text-[9px] text-slate-600 italic text-center">Click any command above to load it into the input box → then hit Send.</div>
                    </div>
                  )}

                  {curated.length > 0 && (
                    <div className="mt-4 p-4 bg-brand-teal/5 rounded-2xl border border-brand-teal/20">
                      <div className="text-[10px] font-bold text-brand-teal uppercase tracking-widest mb-3 italic">AI Curated Selections ({curated.length})</div>
                      <div className="space-y-2 mb-4">
                        {curated.map((c, ci) => (
                          <div key={ci} className="flex justify-between text-xs p-2 bg-black/20 rounded-lg">
                            <span className="text-white font-medium truncate flex-1">{c.match}</span>
                            <span className="text-slate-400 shrink-0 ml-2">{c.market} @ <span className="text-brand-teal font-bold">{c.odds}</span></span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleBuildSlip(curated, bookies[0])}
                          className="py-2 bg-brand-teal text-background text-[10px] font-bold rounded-lg hover:scale-105 transition-all"
                        >
                          {bookies[0].charAt(0).toUpperCase() + bookies[0].slice(1)} Only
                        </button>
                        <button
                          onClick={() => handleBuildSlip(curated)}
                          className="py-2 bg-white/8 border border-white/10 text-white text-[10px] font-bold rounded-lg hover:bg-white/12 transition-all"
                        >
                          All 7 Platforms
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SCAN Results — Interactive Tab Component */}
                  {m.type === "scan" && m.data && (
                    <InteractiveScanResult data={m.data} onBuildSlips={handleBuildAllSlips} paid={paidBookies} paidCredits={paidCredits} />
                  )}

                  {/* BOOKING CODES card — used by both scan and AI chat slip generation */}
                  {m.type === "codes" && m.data && (
                    <div className="mt-3 space-y-2">
                      <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-3">Booking Codes</div>
                      {(m.data as { platform: string; code: string; note?: string }[]).map((r, ri) => {
                        const isError = r.code.startsWith("[");
                        const label = r.platform.charAt(0).toUpperCase() + r.platform.slice(1);
                        return (
                          <div key={ri} className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border text-xs ${
                            isError
                              ? "bg-red-400/5 border-red-400/10 text-slate-500"
                              : "bg-white/4 border-white/8 hover:border-brand-teal/20 transition-all"
                          }`}>
                            <span className="font-bold text-slate-300 w-20 shrink-0">{label}</span>
                            <span className="flex-1 min-w-0">
                              <span className={`block font-mono ${ isError ? "text-red-400/70 text-[10px] whitespace-normal break-words" : "text-brand-teal font-bold truncate" }`}>
                                {isError ? r.code.replace(/^\[|\]$/g, "") : r.code}
                              </span>
                              {r.note && <span className="block text-[9px] text-yellow-400/80 whitespace-normal">{r.note}</span>}
                            </span>
                            {!isError && (
                              <button
                                onClick={() => navigator.clipboard.writeText(r.code)}
                                className="text-[9px] text-slate-500 hover:text-white px-2 py-1 bg-white/5 rounded-lg transition-all cursor-pointer hover:scale-[1.05] active:scale-[0.95] shrink-0"
                              >
                                Copy
                              </button>
                            )}
                          </div>
                        );
                      })}
                      <div className="text-[9px] text-slate-600 italic mt-1">Copy the code for your preferred bookmaker and load it in-app.</div>
                    </div>
                  )}

                  {/* SLIP Results — Enhanced with EV + Confidence per game */}
                  {m.type === "slip" && m.data && (
                    <div className="mt-4 space-y-2">
                      <MetricGlossary />
                      <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Decoded Slip Analysis</div>
                      {(m.data.lists || []).map((item: { home?: { item_name: string; market_name: string; outcome_name: string; odd_value: string } }, si: number) => {
                        const metrics = estimateSlipItemEV(item.home?.odd_value || "0");
                        const evNum = metrics ? parseFloat(metrics.ev) : 0;
                        const confNum = metrics ? parseFloat(metrics.conf) : 0;
                        return (
                          <div key={si} className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white truncate">{item.home?.item_name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{item.home?.market_name}: <span className="text-slate-300">{item.home?.outcome_name}</span></div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-mono text-brand-teal font-bold">@{item.home?.odd_value}</div>
                                {metrics && (
                                  <div className="flex gap-2 mt-1 justify-end">
                                    <span className={`text-[9px] font-bold ${evNum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {evNum >= 0 ? '+' : ''}{metrics.ev}% EV
                                    </span>
                                    <span className="text-[9px] text-brand-blue font-mono">{metrics.conf}% Conf</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Confidence progress bar */}
                            {metrics && (
                              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${evNum >= 5 ? 'bg-green-400' : evNum >= 0 ? 'bg-brand-teal' : 'bg-red-400'}`}
                                  style={{ width: `${Math.min(100, Math.max(5, confNum))}%` }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isLoading && <ActionLoader type={activeLoader} />}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 md:p-6 bg-white/5 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to /scan markets, /scan basketball, or type /checkslip sportybet CODE..."
            className="flex-1 min-w-0 bg-[#03060E] border border-white/10 focus:border-brand-teal/50 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-[16px] md:text-sm text-white placeholder:text-slate-600 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !input}
            className="shrink-0 w-10 h-10 bg-brand-teal text-background rounded-xl flex items-center justify-center hover:scale-[1.05] disabled:opacity-50 disabled:hover:scale-100 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

    </div>
  );
}
