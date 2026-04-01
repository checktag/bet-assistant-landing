import LayoutDashboard from "@/app/dashboard/page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, CreditCard, Zap, Crown, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function BillingPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const user = session.user as any;

  return (
    <main className="min-h-screen bg-[#03060E] text-slate-200 p-8 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl z-10 space-y-12">
        <header className="text-center space-y-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-white/5">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </Link>
          <h1 className="text-5xl font-black text-white tracking-tight">Upgrade Your <span className="text-gradient">Quant Seat</span></h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-light leading-relaxed">Level up from trial operative to institutional prime status. Instant access to the /scan terminal and live AI advisory.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Current Status */}
          <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-8">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Active Tier</h3>
              <div className="text-3xl font-black text-white flex items-center gap-3">
                {user.is_premium ? "PRO PLATINUM" : "STRICT TRIAL"}
                {!user.is_premium && <span className="text-[10px] bg-brand-blue/20 text-brand-blue px-2 py-1 rounded-md border border-brand-blue/20">14 DAYS</span>}
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Multi-Platform Booking Codes</li>
              <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> AI Betslip Decoding</li>
              <li className={`flex items-center gap-3 text-sm ${user.is_premium ? 'text-slate-400' : 'text-slate-600'}`}><CheckCircle2 className={`w-4 h-4 ${user.is_premium ? 'text-brand-teal' : 'text-slate-800'}`} /> Unlimited /scan Access</li>
            </ul>

            {!user.is_premium && (
               <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
                  <Zap className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-500 leading-relaxed font-bold uppercase tracking-tight">Your terminal access for /scan will expire in {Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - new Date().getTime()) / 86400000))} days.</p>
               </div>
            )}
          </div>

          {/* Upgrade Card */}
          <div className="p-10 rounded-[3rem] bg-gradient-to-br from-brand-blue/20 to-brand-teal/10 border border-brand-teal/30 shadow-[0_0_50px_rgba(0,198,186,0.1)] space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Crown className="w-32 h-32 text-brand-teal" /></div>
            
            <div className="space-y-4 relative z-10">
              <div className="text-brand-teal text-[10px] font-black uppercase tracking-widest bg-brand-teal/10 inline-block px-3 py-1 rounded-full border border-brand-teal/20">Lifetime Selection</div>
              <h3 className="text-4xl font-black text-white">$19.99<span className="text-sm font-normal text-slate-400 ml-2">/ month</span></h3>
              <p className="text-slate-300 text-sm leading-relaxed">Complete data parity, zero latency signals, and cross-platform Telegram sync.</p>
            </div>

            <div className="space-y-4 relative z-10">
               {/* Paystack Placeholder */}
               <button className="w-full py-5 bg-white text-background font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                 <img src="https://paystack.com/favicon.png" className="w-5 h-5" alt="Paystack" />
                 Pay with PAYSTACK
               </button>

               {/* Flutterwave Placeholder */}
               <button className="w-full py-5 bg-[#EF6E0B] text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                 <span className="font-serif italic text-lg">Flutterwave</span>
                 Pay with FLUTTERWAVE
               </button>
            </div>

            <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest relative z-10">Instant Deployment Upon Confirmation</p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs">By upgrading, you agree to our Terms of Service. Secure payments handled by industry leaders.</p>
      </div>
    </main>
  );
}
