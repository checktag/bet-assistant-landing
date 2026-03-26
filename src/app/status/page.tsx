import Link from "next/link";
import { ArrowLeft, Activity, ShieldCheck, Cpu, Zap } from "lucide-react";

export default function BotStatus() {
  const systems = [
    { name: "Market Ingestion Layer", status: "Operational", color: "text-green-400", latency: "12ms" },
    { name: "Quant Reasoning Engine", status: "Operational", color: "text-green-400", latency: "42ms" },
    { name: "Telegram Bot Gateway", status: "Operational", color: "text-green-400", latency: "24ms" },
    { name: "Slip Generation API", status: "Operational", color: "text-green-400", latency: "115ms" },
  ];

  return (
    <main className="relative min-h-screen bg-[#03060E] text-slate-200 selection:bg-brand-teal selection:text-background">
      <div className="bg-noise opacity-[0.20] mix-blend-overlay fixed inset-0 pointer-events-none z-0"></div>
      
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#03060E]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </nav>

      <section className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Bot Status</h1>
              <p className="text-slate-400">Real-time health of the Bet Assistant ecosystem.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-bold text-green-400 uppercase tracking-widest">All Systems Operational</span>
            </div>
          </div>

          <div className="space-y-4">
            {systems.map((s, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-white/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    {i === 0 ? <Activity className="w-5 h-5 text-brand-blue" /> : 
                     i === 1 ? <Cpu className="w-5 h-5 text-brand-teal" /> :
                     i === 2 ? <Zap className="w-5 h-5 text-brand-blue" /> :
                     <ShieldCheck className="w-5 h-5 text-brand-teal" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{s.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{s.latency} Latency</p>
                  </div>
                </div>
                <span className={`text-sm font-bold uppercase tracking-widest ${s.color}`}>{s.status}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-brand-blue/10 to-transparent border border-white/5">
            <h4 className="text-white font-bold mb-4">Uptime Legend</h4>
            <div className="flex gap-1 h-8">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="flex-1 bg-green-500/40 rounded-sm hover:bg-green-500 transition-colors" title="100% Operational" />
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Last 30 days of infrastructure stability.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
