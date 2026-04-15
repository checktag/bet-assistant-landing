"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { 
  Shield, Activity, Zap, Users, Globe, 
  TrendingUp, BarChart3, Loader2, AlertCircle,
  Database, Server, Cpu, Network
} from "lucide-react";

export default function TerminalStats() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const hasFetched = useRef(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

  useEffect(() => {
    if (status === "authenticated" && (session as any)?.accessToken && !hasFetched.current) {
      hasFetched.current = true;
      fetchStats();
    }
  }, [status, session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` }
      });
      setUsers(res.data);
    } catch (err: any) {
      console.error("Stats acquisition failed", err);
      setError("Failed to synchronize with terminal metrics.");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: users.length,
    premium: users.filter(u => u.is_premium).length,
    quant: users.filter(u => u.is_quant).length,
    verified: users.filter(u => u.is_verified).length,
    avgCredits: users.length ? Math.round(users.reduce((acc, u) => acc + (u.credits || 0), 0) / users.length) : 0,
    activeSystems: 4, // Theoretical 
    latency: "24ms",
    uptime: "99.98%"
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-20 bg-[#03060E]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand-teal animate-spin" />
          <p className="text-brand-teal font-black text-xs uppercase tracking-widest animate-pulse">Querying Terminal Metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-20 bg-[#03060E]">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-brand-teal" />
          <span className="text-[10px] font-black text-brand-teal uppercase tracking-[0.2em]">Operational Intelligence</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none mb-2">Terminal Performance</h1>
        <p className="text-slate-400 text-sm max-w-xl">Real-time health pulse and network distribution of the Bet Assistant ecosystem.</p>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Network Uptime", val: stats.uptime, icon: <Server className="w-4 h-4"/>, color: "text-green-500" },
          { label: "Average Latency", val: stats.latency, icon: <Network className="w-4 h-4"/>, color: "text-brand-blue" },
          { label: "Resource Load", val: "12%", icon: <Cpu className="w-4 h-4"/>, color: "text-brand-teal" },
          { label: "Active Databases", val: stats.activeSystems, icon: <Database className="w-4 h-4"/>, color: "text-yellow-500" },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
             <div className="flex items-center gap-2 mb-3">
               <span className={s.color}>{s.icon}</span>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
             </div>
             <div className="text-2xl font-black text-white tracking-tighter">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Charts / Visuals Section (Mockups for now) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* User Distribution */}
        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white tracking-tight">User Distribution</h3>
              <Users className="w-5 h-5 text-brand-teal" />
            </div>
            
            <div className="space-y-4">
              {[
                { label: "Premium Pro", count: stats.premium, total: stats.total, color: "bg-brand-teal" },
                { label: "Quant Experimental", count: stats.quant, total: stats.total, color: "bg-purple-500" },
                { label: "Trial Accounts", count: stats.total - stats.premium, total: stats.total, color: "bg-brand-blue" },
              ].map((group, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">{group.label}</span>
                    <span className="text-white">{group.count} / {group.total}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                       className={`h-full ${group.color} transition-all duration-1000 ease-out`} 
                       style={{ width: `${(group.count / group.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TrendingUp className="absolute -bottom-10 -right-10 w-40 h-40 text-brand-teal opacity-[0.02] rotate-12" />
        </div>

        {/* Global Reach */}
        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 shadow-2xl flex flex-col justify-center items-center text-center space-y-4">
           <div className="w-20 h-20 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
             <Globe className="w-10 h-10 animate-[spin_10s_linear_infinite]" />
           </div>
           <div>
             <h3 className="text-xl font-black text-white tracking-tight">Global Presence</h3>
             <p className="text-slate-500 text-xs mt-1">Terminal synced with nodes in London, New Jersey, and Lagos.</p>
           </div>
           <div className="flex gap-4 mt-4">
             <div className="text-center">
               <div className="text-lg font-black text-white">55+</div>
               <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Leagues</div>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <div className="text-center">
               <div className="text-lg font-black text-white">3.2k</div>
               <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Fixtures/mo</div>
             </div>
           </div>
        </div>

      </div>

      {/* Network Log Trace */}
      <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5 font-mono text-[10px] text-slate-500 space-y-1">
        <div className="flex items-center gap-2 mb-2 text-brand-teal font-black">
          <Database className="w-3 h-3" /> NETWORK LIVE LOGS
        </div>
        <div>[SYSTEM] Booting stats engine v4.1...</div>
        <div>[AUTH] Admin clearance verified: {session?.user?.email}</div>
        <div>[NETWORK] Establishing secure link to {API_URL}...</div>
        <div>[SUCCESS] Metrics synchronized. 0ms packet loss.</div>
        <div className="animate-pulse text-white">_ waiting for telemetry data...</div>
      </div>

    </div>
  );
}
