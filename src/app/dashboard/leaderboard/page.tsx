"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Crown, Zap, TrendingUp, Loader2, Medal, ShieldCheck,
  Plus, CheckCircle2, XCircle, Clock, Star, ChevronRight, Eye, Send,
} from "lucide-react";
import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LeaderEntry {
  user_id: number;
  username: string;
  total: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_odds: number;
  roi: number;
}

interface FeedPick {
  id: number;
  username: string;
  match: string;
  market: string;
  odds: number;
  confidence: number | null;
  note: string | null;
  posted_at: string;
}

interface MyPick {
  id: number;
  match: string;
  market: string;
  odds: number;
  confidence: number | null;
  outcome: "pending" | "won" | "lost";
  created_at: string;
}

type Tab = "leaderboard" | "feed" | "my-picks";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rankColor = (i: number) =>
  i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-500" : "text-slate-500";

const rankBg = (i: number) =>
  i === 0 ? "bg-yellow-400/10" : i === 1 ? "bg-slate-300/10" : i === 2 ? "bg-amber-500/10" : "bg-white/5";

const outcomeStyle = (o: string) =>
  o === "won"
    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
    : o === "lost"
    ? "text-red-400 bg-red-400/10 border-red-400/20"
    : "text-slate-400 bg-white/5 border-white/10";

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [feed, setFeed] = useState<FeedPick[]>([]);
  const [myPicks, setMyPicks] = useState<MyPick[]>([]);
  const [loading, setLoading] = useState(false);

  // Share pick form
  const [shareForm, setShareForm] = useState({ match: "", market: "", odds: "", note: "" });
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  // Resolve pick
  const [resolving, setResolving] = useState<number | null>(null);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tipster/leaderboard`);
      setLeaders(res.data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tipster/feed`);
      setFeed(res.data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  const fetchMyPicks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tipster/my-picks`, { headers: authHeader });
      setMyPicks(res.data);
    } catch { /* silent */ } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (activeTab === "leaderboard") fetchLeaderboard();
    else if (activeTab === "feed") fetchFeed();
    else fetchMyPicks();
  }, [activeTab, fetchLeaderboard, fetchFeed, fetchMyPicks]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSharing(true); setShareMsg("");
    try {
      await axios.post(`${API_URL}/tipster/share`, {
        match: shareForm.match,
        market: shareForm.market,
        odds: parseFloat(shareForm.odds),
        note: shareForm.note || undefined,
      }, { headers: authHeader });
      setShareMsg("✅ Pick shared to the leaderboard!");
      setShareForm({ match: "", market: "", odds: "", note: "" });
      fetchMyPicks();
    } catch (err: any) {
      setShareMsg(`❌ ${err?.response?.data?.detail || "Failed to share pick."}`);
    } finally { setSharing(false); }
  };

  const handleResolve = async (pickId: number, outcome: "won" | "lost") => {
    if (!token) return;
    setResolving(pickId);
    try {
      await axios.post(`${API_URL}/tipster/resolve`, { pick_id: pickId, outcome }, { headers: authHeader });
      setMyPicks(prev => prev.map(p => p.id === pickId ? { ...p, outcome } : p));
    } catch { /* silent */ } finally { setResolving(null); }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: "feed",        label: "Copy Feed",   icon: <Eye className="w-3.5 h-3.5" /> },
    { id: "my-picks",   label: "My Picks",    icon: <Star className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-0 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Copy-Betting Arena</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">
            Top <span className="text-gradient">Tipsters</span>
          </h1>
          <p className="text-sm text-slate-400">Share picks publicly · Copy winners · Build your reputation.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4" /> Live Performance Data
        </div>
      </header>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-black/40 rounded-2xl border border-white/5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === t.id
                ? "bg-brand-teal text-background shadow-[0_0_20px_rgba(0,198,186,0.25)]"
                : "text-slate-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── LEADERBOARD TAB ────────────────────────────────────────────────── */}
      {activeTab === "leaderboard" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-teal" />
                <p className="text-sm font-medium">Ranking tipsters...</p>
              </div>
            ) : leaders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                <Trophy className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">No ranked tipsters yet.</p>
                <p className="text-xs mt-1">Share 3+ picks to appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2">
                      {["Rank", "Tipster", "Win Rate", "ROI", "Picks", "Avg Odds"].map(h => (
                        <th key={h} className="px-4 md:px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {leaders.map((u, i) => (
                        <motion.tr
                          key={u.user_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 md:px-6 py-5">
                            {i < 3 ? (
                              <Medal className={`w-5 h-5 ${rankColor(i)}`} />
                            ) : (
                              <span className="text-slate-500 font-mono text-sm">#{i + 1}</span>
                            )}
                          </td>
                          <td className="px-4 md:px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${rankBg(i)} ${rankColor(i)}`}>
                                {u.username[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white group-hover:text-brand-teal transition-colors">{u.username}</div>
                                <div className="text-[10px] text-slate-500">{u.wins}W / {u.losses}L</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-brand-blue to-brand-teal rounded-full" style={{ width: `${u.win_rate}%` }} />
                              </div>
                              <span className="text-sm font-black text-white">{u.win_rate}%</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-5">
                            <span className={`text-sm font-black ${u.roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {u.roi >= 0 ? "+" : ""}{u.roi}%
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-5">
                            <span className="text-sm font-mono text-slate-300">{u.total}</span>
                          </td>
                          <td className="px-4 md:px-6 py-5">
                            <span className="text-sm font-mono text-slate-300">{u.avg_odds.toFixed(2)}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center shrink-0">
                <Medal className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Seasonal Rewards</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Top 3 tipsters each month receive credit boosts and exclusive AI market signals.</p>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-brand-blue" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Verified Performance</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Every ranking is verified by the Bet Assistant tracking engine for absolute integrity.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── COPY FEED TAB ──────────────────────────────────────────────────── */}
      {activeTab === "feed" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-20 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
            </div>
          ) : feed.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-slate-500">
              <Eye className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">No live picks right now.</p>
            </div>
          ) : (
            feed.map(pick => (
              <motion.div
                key={pick.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-[#0A0F1C]/80 border border-white/8 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center text-[10px] font-black shrink-0">
                      {pick.username[0]?.toUpperCase()}
                    </div>
                    <span className="text-[11px] font-bold text-brand-teal">{pick.username}</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500">{new Date(pick.posted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-sm font-bold text-white truncate">{pick.match}</p>
                  <p className="text-[11px] text-slate-400">{pick.market}</p>
                  {pick.note && <p className="text-[10px] text-slate-500 italic mt-1 truncate">"{pick.note}"</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-brand-teal">{pick.odds.toFixed(2)}</div>
                  {pick.confidence && (
                    <div className="text-[10px] text-slate-500">{pick.confidence}% conf.</div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* ── MY PICKS TAB ───────────────────────────────────────────────────── */}
      {activeTab === "my-picks" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Share a Pick form */}
          {token && (
            <div className="p-5 rounded-2xl bg-[#0A0F1C]/80 border border-brand-teal/20 space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-teal" />
                <span className="text-[11px] font-black text-brand-teal uppercase tracking-widest">Share a Pick</span>
              </div>
              <form onSubmit={handleShare} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="col-span-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-teal/50 transition-colors"
                  placeholder="Match (e.g. Arsenal vs Chelsea)"
                  value={shareForm.match}
                  onChange={e => setShareForm(f => ({ ...f, match: e.target.value }))}
                  required
                />
                <input
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-teal/50 transition-colors"
                  placeholder="Market (e.g. Home or Draw)"
                  value={shareForm.market}
                  onChange={e => setShareForm(f => ({ ...f, market: e.target.value }))}
                  required
                />
                <input
                  type="number" step="0.01" min="1.01" max="50"
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-teal/50 transition-colors"
                  placeholder="Odds (e.g. 1.75)"
                  value={shareForm.odds}
                  onChange={e => setShareForm(f => ({ ...f, odds: e.target.value }))}
                  required
                />
                <input
                  className="col-span-full sm:col-span-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-teal/50 transition-colors"
                  placeholder="Optional note (reasoning…)"
                  value={shareForm.note}
                  onChange={e => setShareForm(f => ({ ...f, note: e.target.value }))}
                />
                <button
                  type="submit"
                  disabled={sharing}
                  className="col-span-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-teal text-background font-black text-xs uppercase tracking-widest hover:scale-[1.02] disabled:opacity-50 transition-all"
                >
                  {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sharing ? "Sharing…" : "Share Pick"}
                </button>
              </form>
              {shareMsg && (
                <p className={`text-xs text-center ${shareMsg.startsWith("✅") ? "text-emerald-400" : "text-red-400"}`}>{shareMsg}</p>
              )}
            </div>
          )}

          {/* My picks list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
            </div>
          ) : myPicks.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-500">
              <Star className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">No picks shared yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPicks.map(pick => (
                <div key={pick.id} className="p-4 rounded-2xl bg-[#0A0F1C]/80 border border-white/8 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{pick.match}</p>
                    <p className="text-[11px] text-slate-400">{pick.market} <span className="text-brand-teal font-bold">@ {pick.odds.toFixed(2)}</span></p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{new Date(pick.created_at).toLocaleDateString()}</p>
                  </div>
                  {pick.outcome === "pending" ? (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleResolve(pick.id, "won")}
                        disabled={resolving === pick.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-400/20 transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Won
                      </button>
                      <button
                        onClick={() => handleResolve(pick.id, "lost")}
                        disabled={resolving === pick.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] font-bold hover:bg-red-400/20 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Lost
                      </button>
                    </div>
                  ) : (
                    <span className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase ${outcomeStyle(pick.outcome)}`}>
                      {pick.outcome === "won" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {pick.outcome}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
