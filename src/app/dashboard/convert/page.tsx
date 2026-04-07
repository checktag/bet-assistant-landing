"use client";

import React from "react";
import { useSession } from "next-auth/react";
import CodeConverter from "@/components/dashboard/CodeConverter";
import { ArrowRightLeft } from "lucide-react";

export default function ConvertPage() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Code <span className="text-gradient">Converter</span></h1>
          <p className="text-slate-400 mt-2">Instantly move your bet slips across 7+ global bookmaker platforms.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-widest">
          <ArrowRightLeft className="w-4 h-4" /> Multi-Platform Sync
        </div>
      </div>

      <div className="bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
        <CodeConverter accessToken={(session as any).accessToken as string} />
      </div>
    </div>
  );
}
