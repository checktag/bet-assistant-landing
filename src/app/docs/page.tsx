import Link from "next/link";
import { ArrowLeft, Zap, TerminalSquare, ShieldCheck, BellRing } from "lucide-react";

export default function Documentation() {
  return (
    <main className="relative min-h-screen bg-[#03060E] text-slate-200 selection:bg-brand-teal selection:text-background">
      <div className="bg-noise opacity-[0.20] mix-blend-overlay fixed inset-0 pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#03060E]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 overflow-hidden rounded-md flex items-center justify-center"><img src="/logo.png" alt="Bet Assistant" className="w-full h-full" /></div>
             <span className="text-sm font-bold tracking-wide text-white">Bet Assistant</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-40 pb-20 px-6 border-b border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">How to Use <span className="text-gradient">Bet Assistant</span></h1>
          <p className="text-xl text-slate-400 leading-relaxed font-light">
            We built Bet Assistant to provide institutional-grade mathematical edges directly to your dashboard and Telegram. Follow this workflow to start executing profitable trades immediately.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          
          <div className="pl-8 border-l-2 border-brand-teal/30 relative">
            <div className="absolute -left-[25px] top-0 w-12 h-12 bg-[#0A0F1C] border border-brand-teal/50 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-teal" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide mt-2">1. Initialize Terminal & Claim Credits</h3>
            <p className="text-lg text-slate-400 leading-relaxed mb-4">
              Bet Assistant operates on a strictly credit-based mathematical execution model. To unlock your Quant Terminal, simply sign up and link your dedicated Telegram account. <strong>Linking your Telegram instantly injects 100 free computational credits</strong> into your balance, allowing you to begin scanning the markets immediately with Standard access.
            </p>
          </div>

          <div className="pl-8 border-l-2 border-brand-blue/30 relative">
            <div className="absolute -left-[25px] top-0 w-12 h-12 bg-[#0A0F1C] border border-brand-blue/50 rounded-full flex items-center justify-center">
              <TerminalSquare className="w-5 h-5 text-brand-blue" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide mt-2">2. Scan for Mathematical Edges</h3>
            <p className="text-lg text-slate-400 leading-relaxed mb-4">
              Forget manual research. Use our built-in terminal commands like <code className="text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">/scan</code>, <code className="text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">/scan basketball</code>, or <code className="text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">/scan weekend</code>. The AI fetches live odds from global leagues, runs deep Poisson & Gaussian distributions, and filters out everything except <strong>Strict Positive Expected Value (+EV)</strong> fixtures. If an edge exists, the system flags it.
            </p>
          </div>

          <div className="pl-8 border-l-2 border-purple-500/30 relative">
            <div className="absolute -left-[25px] top-0 w-12 h-12 bg-[#0A0F1C] border border-purple-500/50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide mt-2">3. Auto-Generate & Analyze Slips</h3>
            <p className="text-lg text-slate-400 leading-relaxed mb-4">
              Found your edges? One click translates the AI's curated picks into a universal <strong>Booking Code</strong> compatible with 7+ platforms (SportyBet, 1xBet, Bet9ja). <br/><br/>If you already have a slip from external sources, run <code className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">/checkslip sportybet [CODE]</code>. The AI will tear the slip down game-by-game to expose any negative-value traps set by bookmakers or calculate the true win probability. You can even use <code className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">/convert</code> to move a code between platforms instantly.
            </p>
          </div>

          <div className="pl-8 border-l-2 border-green-500/30 relative">
            <div className="absolute -left-[25px] top-0 w-12 h-12 bg-[#0A0F1C] border border-green-500/50 rounded-full flex items-center justify-center">
              <BellRing className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide mt-2">4. Live Tracker & Cashout Alerts (PRO)</h3>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Execution isn't the end of the lifecycle. Add your active booking code to the Premium Slip Tracker. The AI watchdog continuously monitors live scoreboards, evaluating momentum shifts. If a sudden risk spike threatens your position, it pushes an instantaneous <strong>Cashout Alert</strong> directly to your linked Telegram account to secure your profits.
            </p>
            <Link href="/dashboard" className="inline-block px-8 py-4 bg-gradient-to-r from-brand-teal to-brand-blue text-background font-bold text-lg rounded-full hover:scale-105 transition-transform uppercase tracking-wider">
              Open Your Terminal
            </Link>
          </div>

        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/5 relative z-20 bg-[#03060E]">
        <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-8 text-slate-500 text-sm font-medium">
             <Link href="/privacy" className="hover:text-brand-teal transition-colors">Privacy Policy</Link>
             <Link href="/terms" className="hover:text-brand-teal transition-colors">Terms of Service</Link>
             <Link href="/status" className="hover:text-brand-teal transition-colors">Bot Status</Link>
          </div>
          <p className="text-slate-600 text-sm">© 2026 CTTS. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}
