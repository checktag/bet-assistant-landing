import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
          <h1 className="text-4xl font-black text-white mb-8 tracking-tight">Terms of Service</h1>
          <div className="space-y-8 text-slate-400 leading-relaxed">
            <div className="p-6 rounded-2xl bg-brand-teal/5 border border-brand-teal/10">
              <p className="text-brand-teal font-bold mb-2 uppercase text-xs tracking-widest">Disclaimer</p>
              <p className="text-white font-medium italic">Betting involves significant risk. Our AI assistant provides mathematical advice, but it does not guarantee profit. Never bet more than you can afford to lose.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">1. Use of Service</h2>
              <p>Bet Assistant is an analytical tool for informational purposes only. By using the bot, you acknowledge that you are over the legal gambling age in your jurisdiction.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">2. No Financial Advice</h2>
              <p>The suggestions provided by the bot are based on statistical variance modeling. They do not constitute financial or professional investment advice.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">3. Limitation of Liability</h2>
              <p>Checktag Platform and Bet Assistant are not responsible for any financial losses incurred while using our service. Final betting decisions rest solely with the user.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">4. Account Termination</h2>
              <p>We reserve the right to terminate access to the bot for users who attempt to reverse-engineer our Quant Engine or engage in fraudulent activities.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
