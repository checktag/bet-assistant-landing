import Link from "next/link";
import { ArrowLeft, MessageCircle, FileText, CheckCircle, BellRing } from "lucide-react";

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
             <div className="w-8 h-8 overflow-hidden rounded-md flex items-center justify-center"><img src="/image.jpg" alt="Bet Assistant" className="w-full h-full object-cover scale-[1.65]" /></div>
             <span className="text-sm font-bold tracking-wide text-white">Bet Assistant</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-40 pb-20 px-6 border-b border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">How to Use <span className="text-gradient">Bet Assistant</span></h1>
          <p className="text-xl text-slate-400 leading-relaxed font-light">
            We built Bet Assistant to make smart betting as easy as texting a friend. 
            No confusing math or complex settings—just send a message, get expert advice, and start winning.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          
          <div className="pl-8 border-l-2 border-brand-blue/30 relative">
            <div className="absolute -left-[25px] top-0 w-12 h-12 bg-[#0A0F1C] border border-brand-blue/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,113,206,0.3)]">
              <MessageCircle className="w-5 h-5 text-brand-blue" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide mt-2">1. Start the Chat</h3>
            <p className="text-lg text-slate-400 leading-relaxed mb-4">
              Open Telegram and search for <strong>@BetAssistant_AI_bot</strong> (or just click any of the Launch buttons on our site). Press <strong>Start</strong> to wake up the assistant. It's fully ready 24/7.
            </p>
          </div>

          <div className="pl-8 border-l-2 border-brand-teal/30 relative">
            <div className="absolute -left-[25px] top-0 w-12 h-12 bg-[#0A0F1C] border border-brand-teal/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,198,186,0.3)]">
              <FileText className="w-5 h-5 text-brand-teal" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide mt-2">2. Send Your Betslip</h3>
            <p className="text-lg text-slate-400 leading-relaxed mb-4">
              Got a booking code or an idea for a game? Just send it to the bot like you're texting a friend. For example: <br/><br/>
              <span className="italic text-slate-300">"Hey, what do you think about Arsenal winning today?"</span> <br/>
              or <br/>
              <span className="italic text-slate-300">"Here is my booking code: BC-9XY-ZZ. Is this safe?"</span>
            </p>
          </div>

          <div className="pl-8 border-l-2 border-purple-500/30 relative">
            <div className="absolute -left-[25px] top-0 w-12 h-12 bg-[#0A0F1C] border border-purple-500/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide mt-2">3. Get Simple Advice</h3>
            <p className="text-lg text-slate-400 leading-relaxed mb-4">
              The AI does all the heavy math behind the scenes. It checks the live odds, team momentum, and statistics, then replies to you in plain English. It will clearly tell you if your bet is genuinely a highly profitable idea, or if you're walking into a trap set by the bookies. 
            </p>
          </div>

          <div className="pl-8 border-l-2 border-green-500/30 relative">
            <div className="absolute -left-[25px] top-0 w-12 h-12 bg-[#0A0F1C] border border-green-500/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <BellRing className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide mt-2">4. Live Cashout Alerts</h3>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Once your games kick off, the assistant stays awake for you. If a team suddenly loses momentum or a surprise injury happens, the bot will instantly send you an alert advising you to Cashout and take your money safely to the bank.
            </p>
            <a href="https://t.me/BetAssistant_AI_bot" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-gradient-to-r from-brand-blue to-brand-teal text-background font-bold text-lg rounded-full shadow-[0_0_30px_rgba(0,198,186,0.2)] hover:scale-105 transition-transform">
              Try the Assistant Now
            </a>
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
          <p className="text-slate-600 text-sm">© 2026 Checktag Platform. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}
