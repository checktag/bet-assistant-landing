"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, RefreshCw, Loader2, Bot, Crown, Link as LinkIcon, CheckCircle2, XCircle, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TrackedSlip {
  id: number;
  booking_code: string;
  platform: string;
  status: "active" | "won" | "lost" | "cashedout";
  last_analysis: string | null;
  tracked_at: string;
  resolved_at: string | null;
}

interface SlipTrackerProps {
  accessToken: string;
  telegramLinked: boolean;
  isPremium: boolean;
}

const statusConfig = {
  active: { label: "Active", color: "text-brand-teal", bg: "bg-brand-teal/10", border: "border-brand-teal/20" },
  won: { label: "Won ✅", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  lost: { label: "Lost ❌", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  cashedout: { label: "Cashed Out 💰", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
};

const platformEmoji: Record<string, string> = {
  sportybet: "🏆",
  bet9ja: "🇳🇬",
  "1xbet": "🌍",
  betway: "⚡",
  betwinner: "🎯",
  msport: "⚽",
  "22bet": "🎰",
};

export default function SlipTracker({ accessToken, telegramLinked, isPremium }: SlipTrackerProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
  const [slips, setSlips] = useState<TrackedSlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newPlatform, setNewPlatform] = useState("sportybet");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const { data: session, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    const initPage = async () => {
      // Force session update on mount to recalibrate PRO status
      await update();
      await fetchSlips();
    };
    initPage();
  }, []);

  const fetchSlips = async () => {
    try {
      const res = await axios.get(`${API_URL}/my-tracked-slips`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSlips(res.data);
    } catch (e) {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setIsAdding(true);
    setError("");
    try {
      await axios.post(`${API_URL}/track-slip`, {
        platform: newPlatform,
        booking_code: newCode.trim().toUpperCase()
      }, { headers: { Authorization: `Bearer ${accessToken}` } });
      setNewCode("");
      await fetchSlips();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add slip. Check the code and try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`${API_URL}/track-slip/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    setSlips(prev => prev.filter(s => s.id !== id));
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    await axios.patch(`${API_URL}/track-slip/${id}`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    setSlips(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as TrackedSlip["status"] } : s));
  };

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6">
          <Crown className="w-10 h-10 text-yellow-400" />
        </div>
        <h3 className="text-xl font-black text-white mb-3">Premium Feature</h3>
        <p className="text-slate-400 text-sm max-w-xs mb-8">
          Slip Tracking with live AI advisories and Telegram push notifications is exclusively available to Premium members.
        </p>
        <a href="/billing" className="px-6 py-3 bg-yellow-400 text-black font-black rounded-xl hover:scale-105 transition-all text-sm uppercase tracking-wider">
          Upgrade to Premium
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Telegram Link Banner */}
      {!telegramLinked && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center shrink-0">
            <LinkIcon className="w-5 h-5 text-brand-blue" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">PRO Identity: Neural Sync Required</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Identity handshake detected as **INACTIVE**. Activate push notifications in settings to receive AI cashout alerts.
            </div>
          </div>
          <Link
            href="/dashboard/settings"
            className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            START HANDSHAKE
          </Link>
        </motion.div>
      )}

      {/* Add New Slip */}
      <div className="p-5 rounded-2xl bg-[#0A0F1C]/80 border border-white/10 backdrop-blur-xl">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-brand-teal" /> Track a New Slip
        </h3>
        <form onSubmit={handleAddSlip} className="flex flex-col sm:flex-row gap-3">
          <select
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            className="bg-[#03060E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-teal/50 shrink-0"
          >
            {["sportybet", "bet9ja", "msport", "betika"].map(p => (
              <option key={p} value={p}>{platformEmoji[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Enter booking code (e.g. BC-9JA-8X)..."
            className="flex-1 bg-[#03060E] border border-white/10 rounded-xl px-4 py-3 text-[16px] md:text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-teal/50"
          />
          <button
            type="submit"
            disabled={isAdding || !newCode.trim()}
            className="px-5 py-3 bg-brand-teal text-background font-black text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            Track Slip
          </button>
        </form>
        {error && <p className="text-xs text-red-400 mt-3 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
      </div>

      {/* Slips List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading your tracked slips...
        </div>
      ) : slips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="w-12 h-12 text-slate-700 mb-4" />
          <p className="text-slate-500 font-medium">No slips tracked yet.</p>
          <p className="text-slate-600 text-sm mt-1">Add a booking code above to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{slips.filter(s => s.status === "active").length} Active · {slips.length} Total</span>
            <button onClick={fetchSlips} className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-teal transition-colors cursor-pointer group">
              <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" /> Refresh
            </button>
          </div>
          <AnimatePresence>
            {slips.map((slip) => {
              const cfg = statusConfig[slip.status] || statusConfig.active;
              const isExpanded = expandedId === slip.id;
              return (
                <motion.div
                  key={slip.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
                >
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : slip.id)}
                  >
                    <div className="text-2xl shrink-0">{platformEmoji[slip.platform] || "🎰"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-white text-sm">{slip.booking_code}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                        {slip.platform} · Tracked {new Date(slip.tracked_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {slip.last_analysis && (
                        <div className="flex items-center gap-1 text-[10px] text-brand-blue">
                          <Bot className="w-3 h-3" /> AI Ready
                        </div>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5"
                      >
                        <div className="p-4 space-y-4">
                          {slip.last_analysis && (
                            <div className="p-3 bg-black/30 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Bot className="w-4 h-4 text-brand-blue" />
                                <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">AI Advisory</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{slip.last_analysis}</p>
                            </div>
                          )}

                          {slip.status === "active" && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-[10px] text-slate-500 self-center mr-1">Mark as:</span>
                              {[
                                { s: "won", label: "Won", icon: <CheckCircle2 className="w-3 h-3" />, cls: "bg-green-400/10 text-green-400 border-green-400/20" },
                                { s: "lost", label: "Lost", icon: <XCircle className="w-3 h-3" />, cls: "bg-red-400/10 text-red-400 border-red-400/20" },
                                { s: "cashedout", label: "Cashed Out", icon: <DollarSign className="w-3 h-3" />, cls: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
                              ].map(opt => (
                                <button
                                  key={opt.s}
                                  onClick={() => handleStatusUpdate(slip.id, opt.s)}
                                  className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer hover:scale-105 active:scale-95 ${opt.cls}`}
                                >
                                  {opt.icon} {opt.label}
                                </button>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => handleDelete(slip.id)}
                            className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-red-400 transition-colors cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <Trash2 className="w-3 h-3" /> Remove from tracker
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
