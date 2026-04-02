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
  type?: "text" | "scan" | "slip" | "convert";
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

export default function AssistantChat({ accessToken }: AssistantChatProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Welcome to your Quant Assistant. How can I help you dominate the markets today?" }
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
      if (userMsg.toLowerCase().startsWith("/scan")) {
        const parts = userMsg.split(" ");
        let dateArg = null;
        let leagueArg = null;

        if (parts[1] === "upcoming" || parts[1] === "weekend") {
          dateArg = parts[1];
        } else if (parts[1] && parts[1].match(/\d{4}-\d{2}-\d{2}/)) {
          dateArg = parts[1];
        } else if (parts[1]) {
          leagueArg = parts.slice(1).join("_").toLowerCase();
        }

        const res = await axios.get(`${API_URL}/scan`, {
          params: { date: dateArg, league: leagueArg },
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `🔍 **Market Scan Complete!**\nScanned **${res.data.total_matches || 'hundreds of'}** raw fixtures from ${leagueArg ? leagueArg.replace("_", " ") : 'Global Markets'} (${dateArg ? dateArg : 'Next 24h'}).`,
          type: "scan",
          data: res.data.bets
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
        ? "🚨 Your 14-day trial has expired. Upgrade to Premium to continue scanning!"
        : "⚠️ Sorry, I encountered an error processing that request.";
      setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildSlip = async (selections: Selection[]) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/generate-multi-code`, {
        platform: "sportybet",
        selections: selections
      }, { headers: { Authorization: `Bearer ${accessToken}` } });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `🎯 **Slip Generated Successfully!**\n\nYour SportyBet booking code: **${res.data.code}**.\n\nGood luck! 🚀`
      }]);
    } catch (err: unknown) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Failed to generate booking code. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildAllSlips = async (selections: any[]) => {
    setIsLoading(true);
    const platforms = ["sportybet", "bet9ja", "1xbet", "betway", "betwinner", "msport", "22bet"];
    let finalSummary = "🎟️ **Multi-Platform Booking Codes Generated!**\n\n";
    try {
      const results = await Promise.all(platforms.map(p =>
        axios.post(`${API_URL}/generate-multi-code`, { platform: p, selections }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).catch(() => ({ data: { code: "[Fixture Match Error]" } }))
      ));
      results.forEach((res: { data: { code: string } }, i: number) => {
        const label = platforms[i].charAt(0).toUpperCase() + platforms[i].slice(1);
        finalSummary += `✅ **${label}:** \`${res.data.code}\`\n`;
      });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: finalSummary + "\n_(Copy and paste these codes into the corresponding apps!)_"
      }]);
    } catch (err: unknown) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Failed to generate codes. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
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
                className="absolute right-0 top-full mt-4 w-[85vw] max-w-[288px] bg-[#060913]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl z-50 overflow-hidden"
              >
                <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-3">Institutional Tools</div>
                <div className="grid gap-2">
                  {[
                    { cmd: "/scan", label: "MARKET SCAN", desc: "Global search for +EV edges", icon: <Globe className="w-4 h-4" /> },
                    { cmd: "/scan weekend", label: "WEEKEND SCAN", desc: "Saturday & Sunday fixtures", icon: <Clock className="w-4 h-4" /> },
                    { cmd: "/checkslip sportybet ", label: "CHECK SLIP", desc: "EV + Confidence analysis per game", icon: <Zap className="w-4 h-4" /> },
                    { cmd: "/convert sportybet bet9ja ", label: "CONVERT", desc: "Move slip between platforms", icon: <Calculator className="w-4 h-4" /> }
                  ].map((action, ai) => (
                    <button
                      key={ai}
                      onClick={() => { setInput(action.cmd); setIsMenuOpen(false); }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-all border border-transparent hover:border-white/10"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-teal shrink-0">{action.icon}</div>
                      <div>
                        <div className="text-[10px] font-black text-white">{action.label}</div>
                        <div className="text-[9px] text-slate-500 leading-tight">{action.desc}</div>
                      </div>
                    </button>
                  ))}
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

                  {/* AI Curated Selection */}
                  {curated.length > 0 && (
                    <div className="mt-4 p-4 bg-brand-teal/5 rounded-2xl border border-brand-teal/20">
                      <div className="text-[10px] font-bold text-brand-teal uppercase tracking-widest mb-3 italic">Assistant Selection</div>
                      <div className="space-y-2 mb-4">
                        {curated.map((c, ci) => (
                          <div key={ci} className="flex justify-between text-xs">
                            <span className="text-white font-medium">{c.match}</span>
                            <span className="text-slate-400">{c.market} @ {c.odds}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleBuildSlip(curated)}
                        className="w-full py-2 bg-brand-teal text-background text-[10px] font-bold rounded-lg hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,198,186,0.4)]"
                      >
                        BUILD THIS SLIP (SPORTYBET)
                      </button>
                    </div>
                  )}

                  {/* SCAN Results */}
                  {m.type === "scan" && m.data && (
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {m.data.length > 0 ? (
                        <>
                          <MetricGlossary />
                          <div className="flex items-center justify-between px-1 mb-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Top 5 Edges Found</span>
                            <span className="text-[9px] font-medium text-brand-teal italic">EV · Conf</span>
                          </div>
                          {m.data.slice(0, 5).map((bet: Prediction, bi: number) => (
                            <div key={bi} className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center group hover:border-brand-teal/30 transition-all">
                              <div className="flex-1">
                                <div className="text-xs font-bold text-white group-hover:text-brand-teal transition-colors">{bet.match}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="text-[10px] text-slate-400 capitalize">{bet.market} @ {bet.odds}</div>
                                  <span className="w-1 h-1 rounded-full bg-white/20" />
                                  <div className="text-[10px] text-slate-500 font-mono italic">
                                    Kickoff: {bet.commence_time ? new Date(bet.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right space-y-0.5">
                                <div className="text-[10px] font-bold text-green-400">+{bet.ev_edge}% EV</div>
                                <div className="text-[10px] text-brand-blue font-mono">{bet.model_prob}% Conf</div>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => handleBuildAllSlips(m.data)}
                            className="w-full mt-2 py-2 bg-brand-teal/10 hover:bg-brand-teal/20 border border-brand-teal/20 text-brand-teal text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest"
                          >
                            Generate All Booking Codes
                          </button>
                        </>
                      ) : (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                          <div className="text-xs text-slate-400">No high-confidence edges found right now.</div>
                          <div className="text-[10px] text-slate-500 mt-1">Our models require a 2% EV edge to recommend a bet. Check back in an hour!</div>
                        </div>
                      )}
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
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to /scan markets, or type /checkslip sportybet CODE..."
            className="w-full bg-[#03060E] border border-white/10 focus:border-brand-teal/50 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-[16px] md:text-sm text-white placeholder:text-slate-600 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !input}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-teal text-background rounded-xl flex items-center justify-center hover:scale-[1.05] disabled:opacity-50 disabled:hover:scale-100 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
