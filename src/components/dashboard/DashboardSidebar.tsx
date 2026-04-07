"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, BarChart3, Settings, Radar, Crown, ChevronLeft, ChevronRight, LogOut, ArrowRightLeft, Calculator, Zap, Send, CheckCircle2, Loader2, Trophy } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface DashboardSidebarProps {
  isPremium: boolean;
  userInitial?: string;
  userEmail?: string;
  credits?: number;
  telegramJoined?: boolean;
}

export default function DashboardSidebar({ isPremium, userInitial = "U", userEmail = "User", credits = 0, telegramJoined = false }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { data: session } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";

  const handleVerifyJoin = async () => {
    if (!(session as any)?.accessToken) return;
    setIsVerifying(true);
    try {
      await axios.post(`${API_URL}/confirm-telegram-join`, {}, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` }
      });
      setVerificationSuccess(true);
      // Refresh page to update credits globally
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      alert("Verification failed. Please ensure you have joined the group and linked your Telegram account in Settings.");
    } finally {
      setIsVerifying(false);
    }
  };

  const navItems = [
    { name: "Quant Terminal", path: "/dashboard",          icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Slip Tracker",   path: "/dashboard/tracker",   icon: <Radar className="w-4 h-4" />, premiumLock: !isPremium },
    { name: "Code Converter", path: "/dashboard/convert",   icon: <ArrowRightLeft className="w-4 h-4" /> },
    { name: "Bet Calculator", path: "/dashboard/calculator", icon: <Calculator className="w-4 h-4" /> },
    { name: "Analytics",      path: "/dashboard/analytics",  icon: <BarChart3 className="w-4 h-4" /> },
    { name: "Leaderboard",     path: "/dashboard/leaderboard", icon: <Trophy className="w-4 h-4" /> },
    { name: "Settings",       path: "/dashboard/settings",    icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className={`hidden md:flex border-r border-white/5 bg-[#060913] flex-col p-4 space-y-8 h-screen sticky top-0 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0"><img src="/image.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.65]" /></div>
          {!collapsed && <span className="font-bold tracking-tight text-white whitespace-nowrap">Bet Assistant</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/5">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const baseClasses = `relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all group overflow-hidden ${
            isActive ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`;

          return (
            <Link key={item.name} href={item.path} className={baseClasses} title={collapsed ? item.name : undefined}>
              <div className="shrink-0">{item.icon}</div>
              {!collapsed && (
                <span className={`font-medium tracking-tight whitespace-nowrap flex-1 ${isActive ? "text-brand-blue" : ""}`}>{item.name}</span>
              )}
              
              {!collapsed && item.premiumLock && (
                 <Crown className="w-3.5 h-3.5 text-yellow-500 opacity-60 absolute right-4" />
              )}
              {collapsed && item.premiumLock && (
                 <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Credit Counter Tooltip/Widget */}
      {!collapsed && (
        <div className="px-2 space-y-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-teal/20 to-brand-blue/10 border border-brand-teal/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Available Credits</span>
              <Zap className="w-3 h-3 text-brand-teal animate-pulse" />
            </div>
            <div className="text-2xl font-black text-white flex items-baseline gap-1">
              {credits.toLocaleString()} <span className="text-[10px] text-slate-500 font-bold">QTY</span>
            </div>
          </div>
          
          {!telegramJoined && (
            <div className="space-y-2">
              <button 
                onClick={() => window.open("https://t.me/+KKXegSaFc1Y3MTQ0", "_blank")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-background font-black text-[11px] uppercase tracking-wider hover:scale-105 transition-all shadow-[0_10px_20px_rgba(0,198,186,0.1)]"
              >
                <Send className="w-3.5 h-3.5" /> 1. Join Telegram
              </button>
              <button 
                onClick={handleVerifyJoin}
                disabled={isVerifying || verificationSuccess}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-teal/10 border border-brand-teal/30 text-brand-teal font-black text-[11px] uppercase tracking-wider hover:bg-brand-teal/20 transition-all disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : verificationSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                {verificationSuccess ? "Credits Claimed!" : "2. Claim 1,000 Credits"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* User Card (Bottom) */}
      <div className={`mt-auto rounded-2xl bg-white/5 border border-white/10 transition-all overflow-hidden flex flex-col ${collapsed ? "p-2" : "p-4"}`}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{userEmail}</div>
              <div className="text-[10px] uppercase font-black tracking-widest mt-0.5">
                {isPremium ? <span className="text-brand-teal flex items-center gap-1"><Crown className="w-2.5 h-2.5"/> PRO</span> : <span className="text-slate-500">TRIAL</span>}
              </div>
            </div>
          )}
        </div>
        
        {/* Sign Out Button */}
        <div className={`mt-4 border-t border-white/5 pt-3 flex justify-center ${collapsed ? "hidden" : "block"}`}>
          <button 
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-400/70 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> SIGN OUT
          </button>
        </div>
      </div>
    </aside>
  );
}
