"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Zap, Globe, Clock, Calculator } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Prediction {
  match: string;
  market: string;
  odds: number;
  ev_edge: number;
  model_prob: number;
  commence_time: string;
  profiles?: string[];
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
}

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
const InteractiveScanResult = ({ data, onBuildSlips }: { data: any, onBuildSlips: (picks: any[]) => void }) => {
  const allBets: Prediction[] = data?.bets || [];
  const [activeTab, setActiveTab] = useState<string>(data?.default_tab || "moderate");

  const PROFILE_TABS = [
    { id: "high",     label: "High-Stake", style: "border-yellow-400/20 text-yellow-300",  bg: "bg-yellow-400/10", activeBg: "bg-yellow-400", dot: "bg-yellow-400" },
    { id: "moderate", label: "Moderate",   style: "border-brand-teal/20 text-brand-teal",  bg: "bg-brand-teal/10", activeBg: "bg-brand-teal", dot: "bg-brand-teal" },
    { id: "low",      label: "Spread",     style: "border-purple-400/20 text-purple-300",  bg: "bg-purple-400/10", activeBg: "bg-purple-400", dot: "bg-purple-400" },
  ];

  // Filter bets based on their backend-annotated profiles list
  // Sort High-Stake by Confidence first; Moderate/Spread by EV first
  const filteredBets = allBets
    .filter(b => b.profiles?.includes(activeTab))
    .sort((a, b) => activeTab === "high" ? (b.model_prob - a.model_prob) : (b.ev_edge - a.ev_edge));

  // Cap picks correctly client-side
  const maxPicks = activeTab === "high" ? 7 : activeTab === "moderate" ? 20 : 40;
  const slicedBets = filteredBets.slice(0, maxPicks);

  return (
    <div className="mt-4 flex flex-col gap-3">
      {/* Risk Profile Selector Tabs */}
      <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
        {PROFILE_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const count = allBets.filter(b => b.profiles?.includes(tab.id)).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="text-[10px] text-slate-400 capitalize whitespace-nowrap">{bet.market} @ {bet.odds}</div>
                      <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                      <div className="text-[10px] text-slate-500 font-mono italic truncate">
                        {bet.commence_time ? new Date(bet.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5 shrink-0">
                    <div className="text-[10px] font-bold text-green-400">+{bet.ev_edge}% EV</div>
                    <div className="text-[10px] text-brand-blue font-mono">{bet.model_prob}% Conf</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => onBuildSlips(slicedBets)}
            className={`w-full mt-2 py-2.5 rounded-lg border text-[10px] font-bold transition-all uppercase tracking-widest ${
              PROFILE_TABS.find(t => t.id === activeTab)?.bg
            } ${PROFILE_TABS.find(t => t.id === activeTab)?.style.replace('text-', 'border-').replace('/20', '/40')} hover:brightness-125`}
          >
            Generate Booking Codes
          </button>
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

export default function AssistantChat({ accessToken }: AssistantChatProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 **Welcome to Quant Assistant** — your institutional-grade betting AI.\nType a command below or click **QUICK ACTIONS** to get started.",
      type: "onboarding"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
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

        // Remove the risk keyword, then parse remaining args
        const remaining = parts.slice(1).filter(p => !RISK_KEYWORDS[p.toLowerCase()]);

        if (remaining[0] === "upcoming" || remaining[0] === "weekend") {
          dateArg = remaining[0];
        } else if (remaining[0] && remaining[0].match(/\d{4}-\d{2}-\d{2}/)) {
          dateArg = remaining[0];
        } else if (remaining.length > 0) {
          leagueArg = remaining.join("_").toLowerCase();
        }

        const res = await axios.get(`${API_URL}/scan`, {
          params: { date: dateArg, league: leagueArg, risk: riskProfile },
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const totalBets = res.data.bets?.length ?? 0;
        const scope = leagueArg ? leagueArg.replace(/_/g, " ") : "Global Markets";
        const window = dateArg || "Next 24h";

        setMessages(prev => [...prev, {
          role: "assistant",
          content: `🔍 **Market Scan Complete!** Found **${totalBets} +EV picks** from ${scope} (${window}). Select a risk profile below to filter and build your slip.`,
          type: "scan",
          data: { bets: res.data.bets, default_tab: riskProfile, total_matches: res.data.total_matches }
        }]);
      } else if (userMsg.toLowerCase().startsWith("/checkslip")) {
        const parts = userMsg.split(" ");
        const platform = parts[1] || "sportybet";
        const code = parts[2] || "";
        const res = await axios.post(`${API_URL}/check-slip`, { platform, code, history: chatHistory }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: res.data.analysis,
          type: "slip",
          data: res.data.data
        }]);
      } else {
        const res = await axios.post(`${API_URL}/chat`, { message: userMsg, history: chatHistory }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail === "TRIAL_EXPIRED"
        ? "🚨 Your 7-day trial has expired. Upgrade to Premium to continue scanning!"
        : "⚠️ Sorry, I encountered an error processing that request.";
      setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildSlip = async (selections: Selection[], singlePlatform?: string) => {
    setIsLoading(true);
    const platforms = singlePlatform
      ? [singlePlatform]
      : ["sportybet", "bet9ja", "1xbet", "betway", "betwinner", "msport", "22bet"];
    try {
      const results = await Promise.all(
        platforms.map(p =>
          axios.post(`${API_URL}/generate-multi-code`, { platform: p, selections }, {
            headers: { Authorization: `Bearer ${accessToken}` }
          }).then(r => ({ platform: p, code: r.data.code as string }))
            .catch(() => ({ platform: p, code: "[Match Error]" }))
        )
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
    }
  };

  const handleBuildAllSlips = async (selections: any[]) => {
    await handleBuildSlip(selections); // reuse the same multi-platform logic
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
    <div className="flex flex-col h-[75vh] md:h-[600px] w-full max-w-4xl mx-auto bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
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
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${isMenuOpen ? "bg-brand-teal text-background" : "bg-white/5 text-slate-400 hover:text-white"}`}
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
                <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4 scrollbar-hide">

                  {/* SCAN GROUP */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-3 h-3 text-brand-teal" />
                      <span className="text-[9px] font-black text-brand-teal uppercase tracking-[0.2em]">Market Scan</span>
                    </div>

                    {/* High-Stake */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                        <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">High-Stake · 5–7 picks</span>
                      </div>
                      <div className="grid gap-1">
                        {[
                          { cmd: "/scan high",          label: "Today (High-Stake)",   desc: "Tight odds · 75%+ confidence" },
                          { cmd: "/scan high weekend",  label: "Weekend High-Stake",   desc: "Sat & Sun · big stake picks" },
                          { cmd: "/scan high upcoming", label: "72h High-Stake",       desc: "Next 3 days · safest picks" },
                        ].map((a, i) => (
                          <button key={i} onClick={() => { setInput(a.cmd); setIsMenuOpen(false); }}
                            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-yellow-400/5 text-left transition-all group border border-transparent hover:border-yellow-400/20">
                            <code className="text-[9px] font-black text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-md shrink-0 font-mono whitespace-nowrap">{a.cmd}</code>
                            <div className="min-w-0">
                              <div className="text-[9px] font-bold text-white group-hover:text-yellow-300 transition-colors truncate">{a.label}</div>
                              <div className="text-[8px] text-slate-600 truncate">{a.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Moderate */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                        <span className="text-[8px] font-black text-brand-teal uppercase tracking-widest">Moderate · 8–20 picks</span>
                      </div>
                      <div className="grid gap-1">
                        {[
                          { cmd: "/scan moderate",           label: "Today (Moderate)",      desc: "Balanced odds & confidence" },
                          { cmd: "/scan moderate weekend",   label: "Weekend Moderate",      desc: "Sat & Sun · balanced picks" },
                          { cmd: "/scan moderate bundesliga",label: "Bundesliga Moderate",   desc: "German league edges" },
                          { cmd: "/scan moderate premier league", label: "EPL Moderate",     desc: "Premier League edges" },
                        ].map((a, i) => (
                          <button key={i} onClick={() => { setInput(a.cmd); setIsMenuOpen(false); }}
                            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-brand-teal/5 text-left transition-all group border border-transparent hover:border-brand-teal/20">
                            <code className="text-[9px] font-black text-brand-teal bg-brand-teal/10 px-1.5 py-0.5 rounded-md shrink-0 font-mono whitespace-nowrap">{a.cmd}</code>
                            <div className="min-w-0">
                              <div className="text-[9px] font-bold text-white group-hover:text-brand-teal transition-colors truncate">{a.label}</div>
                              <div className="text-[8px] text-slate-600 truncate">{a.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spread */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                        <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Spread · 20–40 picks</span>
                      </div>
                      <div className="grid gap-1">
                        {[
                          { cmd: "/scan spread",            label: "Today (Spread)",        desc: "Wide odds · max coverage" },
                          { cmd: "/scan spread upcoming",   label: "72h Spread",            desc: "Next 3 days · large selection" },
                          { cmd: "/scan spread champions_league", label: "UCL Spread",      desc: "Champions League · all edges" },
                        ].map((a, i) => (
                          <button key={i} onClick={() => { setInput(a.cmd); setIsMenuOpen(false); }}
                            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-purple-400/5 text-left transition-all group border border-transparent hover:border-purple-400/20">
                            <code className="text-[9px] font-black text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded-md shrink-0 font-mono whitespace-nowrap">{a.cmd}</code>
                            <div className="min-w-0">
                              <div className="text-[9px] font-bold text-white group-hover:text-purple-300 transition-colors truncate">{a.label}</div>
                              <div className="text-[8px] text-slate-600 truncate">{a.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* SLIP TOOLS GROUP */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-brand-blue" />
                      <span className="text-[9px] font-black text-brand-blue uppercase tracking-[0.2em]">Slip Tools</span>
                    </div>
                    <div className="grid gap-1.5">
                      {[
                        { cmd: "/checkslip sportybet ",  label: "Check SportyBet Slip",  desc: "Paste your booking code after the space" },
                        { cmd: "/checkslip bet9ja ",     label: "Check Bet9ja Slip",     desc: "AI EV + confidence per game" },
                        { cmd: "/checkslip betway ",     label: "Check Betway Slip",     desc: "Full slip analysis with edge score" },
                        { cmd: "/checkslip 1xbet ",      label: "Check 1xBet Slip",      desc: "Cashout vs hold recommendation" },
                      ].map((a, i) => (
                        <button key={i} onClick={() => { setInput(a.cmd); setIsMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-all group">
                          <code className="text-[9px] font-black text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-lg shrink-0 font-mono whitespace-nowrap">{a.cmd.trim()}</code>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-white group-hover:text-brand-blue transition-colors">{a.label}</div>
                            <div className="text-[9px] text-slate-600 truncate">{a.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* CONVERT GROUP */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-3 h-3 text-purple-400" />
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em]">Convert Slip</span>
                    </div>
                    <div className="grid gap-1.5">
                      {[
                        { cmd: "/convert sportybet bet9ja ",  label: "SportyBet → Bet9ja",   desc: "Convert and paste your code" },
                        { cmd: "/convert bet9ja sportybet ",  label: "Bet9ja → SportyBet",   desc: "" },
                        { cmd: "/convert sportybet betway ",  label: "SportyBet → Betway",   desc: "" },
                        { cmd: "/convert sportybet 1xbet ",   label: "SportyBet → 1xBet",    desc: "" },
                      ].map((a, i) => (
                        <button key={i} onClick={() => { setInput(a.cmd); setIsMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-all group">
                          <code className="text-[9px] font-black text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-lg shrink-0 font-mono whitespace-nowrap">{a.cmd.trim()}</code>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-white group-hover:text-purple-400 transition-colors">{a.label}</div>
                            {a.desc && <div className="text-[9px] text-slate-600 truncate">{a.desc}</div>}
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
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
                <div className={`max-w-[80%] rounded-2xl p-4 text-slate-200 ${m.role === "assistant" ? "bg-white/5 border border-white/10" : "bg-brand-blue/80 text-white"}`}>
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${m.role === "assistant" ? "prose-invert markdown-content" : ""}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanContent}</ReactMarkdown>
                  </div>

                  {/* Onboarding / Help Card */}
                  {m.type === "onboarding" && (
                    <div className="mt-3 space-y-4">

                      {/* Scan commands */}
                      <div className="p-4 rounded-2xl bg-brand-teal/5 border border-brand-teal/15 space-y-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-brand-teal" />
                          <span className="text-[10px] font-black text-brand-teal uppercase tracking-wider">Market Scan</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { cmd: "/scan",                 desc: "Global +EV edges — next 24 hours" },
                            { cmd: "/scan weekend",         desc: "Saturday & Sunday fixtures" },
                            { cmd: "/scan upcoming",        desc: "All fixtures in the next 72 hours" },
                            { cmd: "/scan 2026-04-05",      desc: "Specific date (YYYY-MM-DD)" },
                            { cmd: "/scan premier league",  desc: "Filter by league name" },
                            { cmd: "/scan champions_league",desc: "Champions League only" },
                          ].map((c, ci) => (
                            <button key={ci} onClick={() => setInput(c.cmd)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20 hover:bg-brand-teal/10 border border-transparent hover:border-brand-teal/30 text-left transition-all group">
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
                            { cmd: "/checkslip betway CODE",     desc: "Betway slip EV + cashout advice" },
                            { cmd: "/checkslip 1xbet CODE",      desc: "1xBet slip breakdown" },
                          ].map((c, ci) => (
                            <button key={ci} onClick={() => setInput(c.cmd)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20 hover:bg-brand-blue/10 border border-transparent hover:border-brand-blue/30 text-left transition-all group">
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
                            { cmd: "/convert sportybet betway CODE",  desc: "SportyBet → Betway" },
                            { cmd: "/convert sportybet 1xbet CODE",   desc: "SportyBet → 1xBet" },
                          ].map((c, ci) => (
                            <button key={ci} onClick={() => setInput(c.cmd)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 text-left transition-all group">
                              <code className="text-[10px] font-black text-purple-400 font-mono shrink-0 whitespace-nowrap">{c.cmd}</code>
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
                          onClick={() => handleBuildSlip(curated, "sportybet")}
                          className="py-2 bg-brand-teal text-background text-[10px] font-bold rounded-lg hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,198,186,0.3)]"
                        >
                          SportyBet Only
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
                    <InteractiveScanResult data={m.data} onBuildSlips={handleBuildAllSlips} />
                  )}

                  {/* BOOKING CODES card — used by both scan and AI chat slip generation */}
                  {m.type === "codes" && m.data && (
                    <div className="mt-3 space-y-2">
                      <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-3">Booking Codes</div>
                      {(m.data as { platform: string; code: string }[]).map((r, ri) => {
                        const isError = r.code.startsWith("[");
                        const label = r.platform.charAt(0).toUpperCase() + r.platform.slice(1);
                        return (
                          <div key={ri} className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border text-xs ${
                            isError
                              ? "bg-red-400/5 border-red-400/10 text-slate-500"
                              : "bg-white/4 border-white/8 hover:border-brand-teal/20 transition-all"
                          }`}>
                            <span className="font-bold text-slate-300 w-20 shrink-0">{label}</span>
                            <span className={`font-mono flex-1 truncate ${ isError ? "text-red-400/60 text-[10px]" : "text-brand-teal font-bold" }`}>
                              {r.code}
                            </span>
                            {!isError && (
                              <button
                                onClick={() => navigator.clipboard.writeText(r.code)}
                                className="text-[9px] text-slate-500 hover:text-white px-2 py-1 bg-white/5 rounded-lg transition-all shrink-0"
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
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 italic text-xs animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Assistant is computing...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 md:p-6 bg-white/5 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to /scan markets, or type /checkslip sportybet CODE..."
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
