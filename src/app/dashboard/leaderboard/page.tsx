"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Zap, TrendingUp, Loader2, Award, Medal, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";

interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  won_count: number;
  is_premium: boolean;
  credits: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${API_URL}/leaderboard`);
        setLeaderboard(res.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [API_URL]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return <Medal className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-slate-300" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-slate-500 font-mono text-sm">#{rank}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-0 space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Global Ranking</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">Top <span className="text-gradient">Quants</span></h1>
          <p className="text-sm text-slate-400">Institutional performance leaderboard based on accuracy and edge.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-widest flex items-center gap-2">
           <Zap className="w-4 h-4" /> Live Performance Data
        </div>
      </header>

      {/* Main Table Container */}
      <div className="bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-teal" />
            <p className="text-sm font-medium tracking-wide">Calculating global performance...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Participant</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency Score</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Won Slips</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {leaderboard.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`group border-b border-white/5 hover:bg-white/[0.02] transition-colors ${idx < 3 ? "bg-white/[0.01]" : ""}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {getRankBadge(idx + 1)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            idx === 0 ? "bg-yellow-500/20 text-yellow-500" : 
                            idx === 1 ? "bg-slate-300/20 text-slate-300" :
                            idx === 2 ? "bg-amber-600/20 text-amber-600" :
                            "bg-brand-blue/10 text-brand-blue"
                          }`}>
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-brand-teal transition-colors">{user.username}</div>
                            <div className="text-[10px] text-slate-500 font-mono">ID: {user.id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <TrendingUp className="w-3.5 h-3.5 text-brand-teal" />
                           <span className="text-base font-black text-white">{user.score.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-mono font-bold text-slate-300">{user.won_count}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {user.is_premium ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-[10px] font-black text-brand-teal uppercase">
                            <Crown className="w-3 h-3" /> Institutional
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-500 uppercase">
                            Commercial
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center shrink-0">
             <Medal className="w-6 h-6 text-brand-teal" />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Seasonal Rewards</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Top 3 Quants at the end of each month receive complimentary credit boosts and exclusive AI market signals.</p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center shrink-0">
             <ShieldCheck className="w-6 h-6 text-brand-blue" />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Verified Performance</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Every ranking on this leaderboard is verified by the Bet Assistant proprietary tracking engine to ensure absolute integrity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
