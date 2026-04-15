"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, Zap, LayoutDashboard, Settings, 
  Shield, ChevronLeft, ChevronRight, LogOut 
} from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  userEmail: string;
  username?: string;
}

export default function AdminSidebar({ userEmail, username }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "User Registry", path: "/admin", icon: <Users className="w-4 h-4" /> },
    { name: "Terminal Stats", path: "/admin/stats", icon: <Shield className="w-4 h-4" /> },
    { name: "Return to Quant", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4 text-brand-teal" /> },
  ];

  return (
    <aside className={`hidden md:flex border-r border-white/5 bg-[#060913] flex-col p-4 space-y-8 h-screen sticky top-0 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      
      {/* Header */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between px-2"}`}>
        <div className="flex items-center gap-3 overflow-hidden transition-all text-ellipsis">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-lg border border-white/10">
            <img src="/image.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.65]" />
          </div>
          {!collapsed && <span className="font-black tracking-tight text-white whitespace-nowrap">ADMIN PANEL</span>}
        </div>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/5 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {collapsed && (
        <button 
          onClick={() => setCollapsed(false)} 
          className="mx-auto w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.name} 
              href={item.path} 
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all group overflow-hidden ${
                isActive ? "bg-brand-teal/10 text-brand-teal border border-brand-teal/20" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              {!collapsed && <span className="font-bold tracking-tight whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Admin Info */}
      <div className={`mt-auto rounded-2xl bg-brand-teal/5 border border-brand-teal/10 p-4 transition-all overflow-hidden flex flex-col items-center gap-3 ${collapsed ? "items-center" : ""}`}>
        <div className="flex items-center gap-3 w-full">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal font-bold shadow-[0_0_15px_rgba(0,198,186,0.2)]">
            A
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{username || userEmail}</div>
              <div className="text-[10px] uppercase font-black tracking-widest text-brand-teal mt-0.5 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> SUPER ADMIN
              </div>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <button 
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full mt-2 flex items-center justify-center gap-2 text-[10px] font-black tracking-wider text-red-500/70 hover:text-red-500 transition-colors uppercase py-2 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10"
          >
            <LogOut className="w-3 h-3" /> Terminate Session
          </button>
        )}
      </div>
    </aside>
  );
}
