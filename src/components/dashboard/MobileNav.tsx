"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, BarChart3, Settings, Radar, Menu, X, Crown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  isPremium: boolean;
  userInitial: string;
  userEmail: string;
}

export default function MobileNav({ isPremium, userInitial, userEmail }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/dashboard",        icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Slip Tracker", path: "/dashboard/tracker", icon: <Radar className="w-5 h-5" />, premiumLock: !isPremium },
    { name: "Analytics",   path: "/dashboard/analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { name: "Settings",    path: "/dashboard/settings",  icon: <Settings className="w-5 h-5" /> },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
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
        <div className="fixed inset-0 z-[90] bg-[#03060E] pt-20 px-6 flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex-1 space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Navigation</p>
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path === "/dashboard/tracker" && pathname === "/dashboard" && typeof window !== "undefined" && window.location.search.includes("tab=tracker"));
              
              return (
                <Link 
                  key={item.name} 
                  href={item.path === "/dashboard/tracker" ? "/dashboard?tab=tracker" : item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all border ${
                    isActive 
                      ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" 
                      : "bg-white/5 border-white/5 text-slate-300"
                  }`}
                >
                  <div className={`${isActive ? "text-brand-blue" : "text-slate-400"}`}>
                    {item.icon}
                  </div>
                  <span className="font-bold flex-1">{item.name}</span>
                  {item.premiumLock && <Crown className="w-4 h-4 text-yellow-500 opacity-60" />}
                </Link>
              );
            })}
          </div>

          <div className="pb-10 space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{userEmail}</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                  {isPremium ? <span className="text-brand-teal">Premium Member</span> : "Free Trial"}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm"
            >
              <LogOut className="w-4 h-4" /> SIGN OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
