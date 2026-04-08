"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, BarChart3, Settings, Radar, Menu, X, Crown, LogOut, ArrowRightLeft, Calculator, Trophy, Send, Zap, Loader2, CheckCircle2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import AuthOverlay from "@/components/auth/AuthOverlay";

interface MobileNavProps {
  isPremium: boolean;
  userInitial: string;
  userEmail: string;
  username?: string;
  credits?: number;
  telegramJoined?: boolean;
}

export default function MobileNav({ isPremium, userInitial, userEmail, username, credits = 0, telegramJoined = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    setIsDisconnecting(true);
    setTimeout(() => {
      signOut({ callbackUrl: "/auth/login" });
    }, 1500);
  };

  const navItems = [
    { name: "Quant Terminal", path: "/dashboard",          icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Slip Tracker",   path: "/dashboard/tracker",   icon: <Radar className="w-5 h-5" />, premiumLock: !isPremium },
    { name: "Code Converter", path: "/dashboard/convert",   icon: <ArrowRightLeft className="w-5 h-5" /> },
    { name: "Bet Calculator", path: "/dashboard/calculator", icon: <Calculator className="w-5 h-5" /> },
    { name: "Analytics",      path: "/dashboard/analytics",  icon: <BarChart3 className="w-5 h-5" /> },
    { name: "Leaderboard",     path: "/dashboard/leaderboard", icon: <Trophy className="w-5 h-5" /> },
    { name: "Settings",       path: "/dashboard/settings",    icon: <Settings className="w-5 h-5" /> },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      <AuthOverlay 
        isVisible={isDisconnecting} 
        message="Disconnecting Node..." 
        subMessage="Terminating mobile quant link and clearing terminal cache..." 
      />
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#060913] backdrop-blur-xl sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
            <img src="/image.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.65]" />
          </div>
          <span className="font-bold tracking-tight text-white text-sm">Bet Assistant</span>
        </div>
        
        <button 
          onClick={toggleMenu}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white transition-all active:scale-95"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[90] bg-[#03060E] pt-20 px-6 flex flex-col overflow-y-auto pb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Navigation</p>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              
              return (
                <Link 
                  key={item.name} 
                  href={item.premiumLock ? "#" : item.path}
                  onClick={(e) => {
                    if (item.premiumLock) {
                      e.preventDefault();
                      return;
                    }
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all border ${
                    item.premiumLock ? "cursor-not-allowed opacity-50 bg-white/[0.02] border-white/5" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  } ${
                    isActive && !item.premiumLock
                      ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" 
                      : !item.premiumLock ? "bg-white/5 border-white/5 text-slate-300" : "text-slate-600"
                  }`}
                >
                  <div className={`${isActive && !item.premiumLock ? "text-brand-blue" : "text-slate-500"}`}>
                    {item.icon}
                  </div>
                  <span className="font-bold flex-1">{item.name}</span>
                  {item.premiumLock && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span className="text-[8px] font-black text-yellow-500 tracking-tighter">PRO</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-10 mb-8 space-y-6">
            {!telegramJoined && (
              <div className="space-y-3 px-2">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-teal/20 to-brand-blue/10 border border-brand-teal/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Available Credits</span>
                    <Zap className="w-3 h-3 text-brand-teal animate-pulse" />
                  </div>
                  <div className="text-xl font-black text-white flex items-baseline gap-1">
                    {credits.toLocaleString()} <span className="text-[10px] text-slate-500 font-bold">QTY</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => window.open("https://t.me/+KKXegSaFc1Y3MTQ0", "_blank")}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-background font-black text-xs uppercase tracking-wider hover:scale-105 transition-all"
                >
                  <Send className="w-4 h-4" /> 1. Join Telegram
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/dashboard?onboard=true");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 text-brand-teal font-black text-xs uppercase tracking-wider transition-all"
                >
                  <Zap className="w-4 h-4" /> Claim 1,000 Credits
                </button>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{username || userEmail}</div>
                <div className="text-[10px] uppercase font-black tracking-widest mt-0.5">
                  {isPremium ? <span className="text-brand-teal flex items-center gap-1"><Crown className="w-2.5 h-2.5"/> PRO</span> : <span className="text-slate-500">TRIAL</span>}
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" /> SIGN OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
