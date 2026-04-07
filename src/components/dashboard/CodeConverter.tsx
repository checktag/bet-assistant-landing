"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, Sparkles, Copy, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface CodeConverterProps {
  accessToken: string;
}

const platforms = [
  { id: "sportybet", name: "SportyBet", emoji: "🏆" },
  { id: "bet9ja",    name: "Bet9ja",    emoji: "🇳🇬" },
  { id: "1xbet",     name: "1xBet",     emoji: "🌍" },
  { id: "betway",    name: "Betway",    emoji: "⚡" },
  { id: "betwinner", name: "BetWinner", emoji: "🎯" },
  { id: "msport",    name: "MSport",    emoji: "⚽" },
  { id: "22bet",     name: "22Bet",     emoji: "🎰" },
];

export default function CodeConverter({ accessToken }: CodeConverterProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
  const [fromPlatform, setFromPlatform] = useState("sportybet");
  const [toPlatform, setToPlatform] = useState("bet9ja");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const res = await axios.post(`${API_URL}/convert`, {
        from_platform: fromPlatform,
        to_platform: toPlatform,
        code: code.trim().toUpperCase()
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (res.data.result) {
        setResult(res.data.result);
      } else {
        setError("Could not convert code. Make sure the source code is still valid.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Conversion failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwap = () => {
    const temp = fromPlatform;
    setFromPlatform(toPlatform);
    setToPlatform(temp);
    setResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleConvert} className="space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* From */}
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-1">Source Platform</label>
            <div className="bg-[#03060E] border border-white/10 rounded-2xl p-1">
              <select
                value={fromPlatform}
                onChange={(e) => { setFromPlatform(e.target.value); setResult(null); }}
                className="w-full bg-transparent text-white px-4 py-3 outline-none appearance-none cursor-pointer text-sm"
              >
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            className="mt-6 p-3 rounded-full bg-white/5 border border-white/10 text-slate-500 hover:text-brand-teal hover:border-brand-teal/30 hover:bg-brand-teal/10 transition-all group"
          >
            <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          {/* To */}
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-1">Target Platform</label>
            <div className="bg-[#03060E] border border-white/10 rounded-2xl p-1">
              <select
                value={toPlatform}
                onChange={(e) => { setToPlatform(e.target.value); setResult(null); }}
                className="w-full bg-transparent text-white px-4 py-3 outline-none appearance-none cursor-pointer text-sm"
              >
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Code Input */}
        <div className="relative group">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-1">Enter Booking Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setResult(null); }}
            placeholder="e.g. BC-9JA-8X"
            className="w-full bg-[#03060E] border border-white/10 rounded-2xl px-6 py-5 text-2xl font-black text-white placeholder:text-slate-700 outline-none focus:border-brand-teal/30 transition-all uppercase tracking-widest text-center"
          />
          <div className="absolute inset-0 rounded-2xl bg-brand-teal/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
        </div>

        <button
          type="submit"
          disabled={isLoading || !code.trim() || fromPlatform === toPlatform}
          className="w-full py-5 bg-brand-teal text-background font-black text-lg rounded-2xl shadow-[0_20px_40px_rgba(0,198,186,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 transition-all cursor-pointer flex items-center justify-center gap-3 uppercase tracking-tighter"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analyze & Convert Code
            </>
          )}
        </button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-teal/20 to-brand-blue/20 border border-brand-teal/30 text-center relative overflow-hidden backdrop-blur-3xl"
            >
              <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
              <div className="relative z-10">
                <span className="text-[11px] font-black text-brand-teal uppercase tracking-[0.4em] mb-4 block">Converted Code</span>
                <div className="text-5xl md:text-6xl font-black text-white tracking-widest mb-8 font-mono select-all">
                  {result}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm uppercase tracking-wide"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                  <button
                    onClick={() => { setCode(""); setResult(null); }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-black rounded-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm uppercase tracking-wide"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Convert Another
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/5 flex gap-4">
        <Sparkles className="w-6 h-6 text-brand-teal shrink-0" />
        <div className="text-sm text-slate-400 leading-relaxed">
          <strong className="text-white">Note:</strong> Conversion is only possible between supported bookmakers. Some markets (e.g. niche alternative lines) may not have a exact match on the target platform; in such cases, the engine will attempt to find the closest statistical equivalent or return an error to prevent mismatched slips.
        </div>
      </div>
    </div>
  );
}
