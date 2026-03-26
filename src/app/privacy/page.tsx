import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-black text-white mb-8 tracking-tight">Privacy Policy</h1>
          <div className="space-y-8 text-slate-400 leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-white mb-3">1. Data Collection</h2>
              <p>Bet Assistant does not collect or store your personal identification documents. We only process Telegram usernames and betting codes provided by you to perform mathematical analysis and provide real-time updates.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">2. How We Use Information</h2>
              <p>Your data is used strictly for generating betting advice and sending automated alerts. We do not sell, trade, or otherwise transfer your information to third parties.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">3. Security</h2>
              <p>All analysis is performed in secured, encrypted environments. Betting codes are processed instantly and are not stored in permanent databases after the match lifecycle ends.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
              <p>We use external APIs for market data and AI reasoning. These services only receive anonymized mathematical queries and do not have access to your Telegram profile.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
