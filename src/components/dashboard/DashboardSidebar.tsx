"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LayoutDashboard, BarChart3, Settings, Radar, Crown, ChevronLeft, ChevronRight, LogOut } from "lucide-react";

interface DashboardSidebarProps {
  isPremium: boolean;
  activePath: string; // e.g. "/dashboard", "/dashboard/analytics", "/dashboard/settings", "/dashboard/tracker"
  userInitial?: string;
  userEmail?: string;
}

export default function DashboardSidebar({ isPremium, activePath, userInitial = "U", userEmail = "User" }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard",        icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Slip Tracker", path: "/dashboard/tracker", icon: <Radar className="w-4 h-4" />, premiumLock: !isPremium },
    { name: "Analytics",   path: "/dashboard/analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { name: "Settings",    path: "/dashboard/settings",  icon: <Settings className="w-4 h-4" /> },
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
          let isActive = false;
          if (item.path === "/dashboard/tracker") {
            // Note: Dashboard slip tracker might use ?tab=tracker or a different layout. 
            // We use /dashboard?tab=tracker for standardizing tracking route in ui if we want.
            // Let's rely on activePath mapping
            isActive = activePath === "/dashboard/tracker";
          } else {
            isActive = activePath === item.path;
          }

          const baseClasses = `relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all group overflow-hidden ${
            isActive ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`;

          // If tracking URL needs query param compatibility:
          const linkHref = item.path === "/dashboard/tracker" ? "/dashboard?tab=tracker" : item.path;

          return (
            <Link key={item.name} href={linkHref} className={baseClasses} title={collapsed ? item.name : undefined}>
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
