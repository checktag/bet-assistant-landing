"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Users, Crown, Zap, Shield, Search, Filter, 
  MoreHorizontal, Check, X, RefreshCw, Mail,
  TrendingUp, Activity, BadgeCheck, AlertCircle,
  Loader2, ChevronRight, LayoutDashboard
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

interface AdminUser {
  id: number;
  email: string;
  username: string;
  is_verified: boolean;
  is_premium: boolean;
  is_quant: boolean;
  is_admin: boolean;
  credits: number;
  referrals: number;
  created_at: string;
}

export default function AdminPortal() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();
  const hasFetched = useRef(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

  useEffect(() => {
    if (status === "authenticated" && (session as any)?.accessToken && !hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Verify admin status first
      const meRes = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` }
      });
      setMe(meRes.data);
      
      if (!meRes.data.is_admin) {
        console.warn("Unauthorized access attempt. Redirecting to dashboard.");
        router.push("/dashboard");
        return;
      }

      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` }
      });
      setUsers(res.data);
      setFetchError(null);
    } catch (err: any) {
      console.error("Failed to fetch admin data", err);
      setFetchError(err.response?.data?.detail || "Connection to secure registry failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (userId: number, config: Partial<AdminUser>) => {
    const actionId = `update-${userId}-${Object.keys(config)[0]}`;
    setActionLoading(actionId);
    try {
      await axios.patch(`${API_URL}/admin/users/${userId}/config`, config, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` }
      });
      // Refresh local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...config } : u));
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendVerify = async (userId: number) => {
    setActionLoading(`verify-${userId}`);
    try {
      await axios.post(`${API_URL}/admin/users/${userId}/resend-verify`, {}, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` }
      });
      alert("Verification link dispatched successfully.");
    } catch (err) {
      console.error("Resend failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    verified: users.filter(u => u.is_verified).length,
    premium: users.filter(u => u.is_premium).length,
    quant: users.filter(u => u.is_quant).length,
  };

  if (status === "loading" || (loading && !fetchError)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#03060E]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand-teal animate-spin" />
          <p className="text-brand-teal font-black text-xs uppercase tracking-widest animate-pulse">Syncing Admin Node...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#03060E] p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Access Denied</h1>
            <p className="text-slate-400 text-sm">{fetchError}</p>
          </div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
          >
            Return to Terminal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#03060E]">
      <DashboardSidebar 
        isPremium={me?.is_premium || false} 
        username={me?.username}
        credits={me?.credits}
        userEmail={me?.email}
      />
      
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-brand-teal" />
              <span className="text-[10px] font-black text-brand-teal uppercase tracking-[0.2em]">Administrative Command Center</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none mb-2">Central Registry</h1>
            <p className="text-slate-400 text-sm max-w-xl">Monitor tactical identities, manage terminal clearances, and oversee the global Bet Assistant network.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData} 
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Identity Pipeline", val: stats.total, icon: <Users />, color: "from-brand-blue/20" },
            { label: "Verified Operatives", val: stats.verified, icon: <BadgeCheck />, color: "from-brand-teal/20" },
            { label: "PRO Clearances", val: stats.premium, icon: <Crown />, color: "from-yellow-500/10" },
            { label: "QUANT Terminal Active", val: stats.quant, icon: <Zap />, color: "from-purple-500/20" },
          ].map((s, i) => (
            <div key={i} className={`p-5 rounded-3xl bg-gradient-to-br ${s.color} to-transparent border border-white/5 relative overflow-hidden group`}>
              <div className="relative z-10">
                <div className="text-slate-400 mb-1">{s.icon}</div>
                <div className="text-3xl font-black text-white tracking-tighter mb-1">{s.val.toLocaleString()}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-700">
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Table Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-teal transition-colors" />
            <input 
              type="text" 
              placeholder="Search by mission ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-teal/50 focus:ring-4 focus:ring-brand-teal/5 transition-all"
            />
          </div>
          
          <div className="flex gap-2 text-[10px] font-black tracking-widest uppercase">
            <span className="text-slate-500">Filters:</span>
            <button className="text-brand-teal hover:underline underline-offset-4">ALL</button>
            <button className="text-slate-500 hover:text-white">UNVERIFIED</button>
            <button className="text-slate-500 hover:text-white">PREMIUM</button>
          </div>
        </div>

        {/* User Table */}
        <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identiy / Rank</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Clearance</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Resources</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Data</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-black text-sm">
                          {user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-1.5 leading-none mb-1">
                            {user.username}
                            {user.is_admin && <Shield className="w-3 h-3 text-brand-teal" />}
                          </div>
                          <div className="text-[11px] text-slate-500 tracking-tight">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {user.is_verified ? (
                          <span className="px-2 py-0.5 rounded-md bg-brand-teal/10 border border-brand-teal/20 text-[9px] font-black text-brand-teal uppercase tracking-widest">Verified</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-500 uppercase tracking-widest">Pending</span>
                        )}
                        {user.is_quant && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-[9px] font-black text-purple-400 underline decoration-purple-500/50 underline-offset-2 uppercase tracking-widest">Quant</span>
                        )}
                        {user.is_premium && (
                          <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black text-yellow-500 uppercase tracking-widest">PRO</span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <Zap className="w-3 h-3 text-brand-teal" />
                          {user.credits.toLocaleString()} QTY
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                          {user.referrals} RECRUITS
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-xs text-slate-400 font-medium">
                      {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {/* Toggle Tier Buttons */}
                         <button 
                            onClick={() => handleUpdateConfig(user.id, { is_quant: !user.is_quant })}
                            className={`p-2 rounded-lg border transition-all ${user.is_quant ? "bg-purple-500/20 border-purple-500/40 text-purple-400" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                            title="Toggle QUANT"
                         >
                            <Zap className="w-4 h-4" />
                         </button>
                         <button 
                            onClick={() => handleUpdateConfig(user.id, { is_premium: !user.is_premium })}
                            className={`p-2 rounded-lg border transition-all ${user.is_premium ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-500" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                            title="Toggle PRO"
                         >
                            <Crown className="w-4 h-4" />
                         </button>
                         <button 
                            onClick={() => {
                               const req = prompt("Enter new credit balance:", user.credits.toString());
                               if (req !== null) handleUpdateConfig(user.id, { credits: parseInt(req) });
                            }}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
                            title="Adjust Credits"
                         >
                            <Activity className="w-4 h-4" />
                         </button>
                         {!user.is_verified && (
                           <button 
                             onClick={() => handleResendVerify(user.id)}
                             className="p-2 rounded-lg bg-brand-teal/10 border border-brand-teal/20 text-brand-teal hover:bg-brand-teal/20 transition-all"
                             title="Resend Activation Link"
                           >
                             <Mail className="w-4 h-4" />
                           </button>
                         )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold text-xs uppercase tracking-widest">No Identities Match Search Parameters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
