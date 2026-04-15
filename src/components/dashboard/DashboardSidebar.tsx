"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, BarChart3, Settings, Radar, Crown, ChevronLeft, ChevronRight, LogOut, ArrowRightLeft, Calculator, Zap, Send, CheckCircle2, Loader2, Trophy } from "lucide-react";
import axios from "axios";
import AuthOverlay from "@/components/auth/AuthOverlay";

interface DashboardSidebarProps {
  isPremium: boolean;
  userInitial?: string;
  userEmail?: string;
  username?: string;
  credits?: number;
  totalReferrals?: number;
  telegramJoined?: boolean;
}

export default function DashboardSidebar({ 
  isPremium: initialIsPremium, 
  userInitial = "U", 
  userEmail = "User", 
  username: initialUsername, 
  credits: initialCredits = 0, 
  totalReferrals: initialReferrals = 0, 
  telegramJoined: initialTelegramJoined = false 
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  
  // Local reactive state for pulsing
  const [currentCredits, setCurrentCredits] = useState(initialCredits);
  const [currentReferrals, setCurrentReferrals] = useState(initialReferrals);
  const [isPremium, setIsPremium] = useState(initialIsPremium);
  const [telegramJoined, setTelegramJoined] = useState(initialTelegramJoined);
  const [username, setUsername] = useState(initialUsername);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const lastPulseToken = useRef<string | null>(null);

  // Global Pulse Check on Navigation
  useEffect(() => {
    const pulseCheck = async () => {
      const token = (session as any)?.accessToken;
      if (!token || lastPulseToken.current === token + pathname) return;
      
      lastPulseToken.current = token + pathname;
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.betassistant.io";
      try {
        const res = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });
        const fresh = res.data;
        setCurrentCredits(fresh.credits);
        setCurrentReferrals(fresh.total_referrals || 0);
        setIsPremium(fresh.is_premium);
        setTelegramJoined(fresh.telegram_linked);
        setUsername(fresh.username);
        
        // Fetch Notifications unread count
        const notifRes = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` }
        });
        const unread = notifRes.data.filter((n: any) => !n.is_read).length;
        setUnreadNotifs(unread);
      } catch (e) {
        console.error("[Pulse] Sync failed", e);
      }
    };

    pulseCheck();
  }, [pathname, (session as any)?.accessToken]);

  const handleSignOut = async () => {
    setIsDisconnecting(true);
    setTimeout(() => {
      signOut({ callbackUrl: "/auth/login" });
    }, 1500);
  };

  const isQuantRoute = pathname.startsWith("/premiumquant");

  const allNavItems = [
    { name: "Quant Terminal", path: isQuantRoute ? "/premiumquant" : "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Slip Tracker",   path: "/dashboard/tracker",   icon: <Radar className="w-4 h-4" />, premiumLock: !isPremium },
    { name: "Code Converter", path: "/dashboard/convert",   icon: <ArrowRightLeft className="w-4 h-4" /> },
    { name: "Bet Calculator", path: "/dashboard/calculator", icon: <Calculator className="w-4 h-4" /> },
    { name: "Analytics",      path: "/dashboard/analytics",  icon: <BarChart3 className="w-4 h-4" /> },
    { name: "Leaderboard",     path: "/dashboard/leaderboard", icon: <Trophy className="w-4 h-4" /> },
    { 
      name: "Notifications",   
      path: isQuantRoute ? "/premiumquant/settings#notifications" : "/dashboard/settings#notifications",    
      icon: (
        <div className="relative">
          <Send className="w-4 h-4 rotate-90" />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#060913] animate-pulse" />
          )}
        </div>
      ) 
    },
    { name: "Settings",       path: isQuantRoute ? "/premiumquant/settings" : "/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
    { name: "Admin Panel",    path: "/admin",                 icon: <Zap className="w-4 h-4 text-brand-teal" />, adminOnly: true },
  ];

  // Filter items for specialized PremiumQuant view
  let navItems = isQuantRoute 
    ? allNavItems.filter(item => ["Quant Terminal", "Notifications", "Settings", "Admin Panel"].includes(item.name))
    : allNavItems;

  // Filter out admin items for non-admins
  const sessionUser = session?.user as any;
  const SUPER_ADMINS = ["official@ctts.io", "chinazhirno@gmail.com"];
  const isUserAdmin = sessionUser?.is_admin || SUPER_ADMINS.includes(sessionUser?.email);
  
  navItems = navItems.filter(item => !item.adminOnly || isUserAdmin);

  return (
    <aside className={`hidden md:flex border-r border-white/5 bg-[#060913] flex-col p-4 space-y-8 h-screen sticky top-0 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      
      <AuthOverlay 
        isVisible={isDisconnecting} 
        message="Disconnecting Node..." 
        subMessage="Terminating secure quant link and purging local session data..." 
      />

      {/* Header */}
      <div className={`flex items-center transition-all ${collapsed ? "justify-center" : "justify-between px-2"}`}>
        <div className={`flex items-center ${collapsed ? "" : "gap-3"} overflow-hidden transition-all text-ellipsis`}>
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-lg border border-white/10">
            <img src="/image.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.65]" />
          </div>
          {!collapsed && <span className="font-bold tracking-tight text-white whitespace-nowrap animate-in fade-in duration-500">Bet Assistant</span>}
        </div>
        {!collapsed && (
          <button onClick={() => setCollapsed(!collapsed)} className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/5 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {collapsed && (
        <button 
          onClick={() => setCollapsed(false)} 
          className="mx-auto w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const isLocked = item.premiumLock;
          
          const baseClasses = `relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all group overflow-hidden ${
            isLocked ? "cursor-not-allowed opacity-30" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          } ${
            isActive && !isLocked ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`;

          return (
            <Link 
              key={item.name} 
              href={isLocked ? "#" : item.path} 
              className={baseClasses} 
              title={collapsed ? (isLocked ? `${item.name} (PRO Required)` : item.name) : undefined}
              onClick={(e) => {
                if (isLocked) e.preventDefault();
              }}
            >
              <div className={`shrink-0 ${isActive && !isLocked ? "text-brand-blue" : "text-slate-500"}`}>{item.icon}</div>
              {!collapsed && (
                <span className={`font-medium tracking-tight whitespace-nowrap flex-1 ${isActive && !isLocked ? "text-brand-blue" : ""}`}>{item.name}</span>
              )}
              
              {!collapsed && isLocked && (
                 <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 absolute right-4">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    <span className="text-[8px] font-black text-yellow-500 tracking-tighter">PRO</span>
                 </div>
              )}
              {collapsed && isLocked && (
                 <div className="absolute top-1 right-1">
                    <Crown className="w-2.5 h-2.5 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                 </div>
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
              {currentCredits.toLocaleString()} <span className="text-[10px] text-slate-500 font-bold">QTY</span>
            </div>
          </div>
          
          {(!telegramJoined && currentCredits === 0) && (
            <div className="space-y-2">
              <button 
                onClick={() => window.open("https://t.me/+KKXegSaFc1Y3MTQ0", "_blank")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-background font-black text-[11px] uppercase tracking-wider hover:scale-105 transition-all shadow-[0_10px_20px_rgba(0,198,186,0.1)]"
              >
                <Send className="w-3.5 h-3.5" /> 1. Join Telegram
              </button>
              <button 
                onClick={() => router.push("/dashboard?onboard=true")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-teal/10 border border-brand-teal/30 text-brand-teal font-black text-[11px] uppercase tracking-wider hover:bg-brand-teal/20 transition-all"
              >
                <Zap className="w-3.5 h-3.5" /> Claim 100 Credits
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
              <div className="text-xs font-bold text-white truncate">{username || userEmail}</div>
              <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest mt-0.5">
                {isQuantRoute ? (
                  <span className="text-brand-teal flex items-center gap-1"><Crown className="w-2.5 h-2.5"/> QUANT</span>
                ) : isPremium ? (
                  <span className="text-brand-teal flex items-center gap-1"><Crown className="w-2.5 h-2.5"/> PRO</span>
                ) : (
                  <span className="text-slate-500">TRIAL</span>
                )}
                <span className="text-brand-blue flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> REFS: {currentReferrals}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className={`mt-4 border-t border-white/5 pt-3 flex justify-center ${collapsed ? "hidden" : "block"}`}>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-400/70 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> SIGN OUT
          </button>
        </div>
      </div>
    </aside>
  );
}
