import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AssistantChat from "@/components/chat/AssistantChat";
import { Crown, Clock, LogOut, LayoutDashboard, Settings, HelpCircle, BarChart3, CreditCard } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;
  const now = new Date();
  
  // Use trial_ends_at or created_at + 14d if missing
  const trialEnds = new Date(user.trial_ends_at || (new Date(user.created_at || now).getTime() + 14 * 86400000));
  const daysLeft = Math.max(0, Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-[#03060E] text-slate-200 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#060913] flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 overflow-hidden rounded-lg"><img src="/image.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.65]" /></div>
          <span className="font-bold tracking-tight text-white">Bet Assistant</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-teal/10 text-brand-teal font-medium border border-brand-teal/20">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <BarChart3 className="w-4 h-4" /> Analytics
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <CreditCard className="w-4 h-4" /> Billing
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <Settings className="w-4 h-4" /> Settings
          </a>
        </nav>

        {/* User Card */}
        <div className="mt-auto p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold">
              {user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user.email}</div>
              <div className="flex items-center gap-1">
                {user.is_premium ? (
                  <span className="text-[10px] text-brand-teal font-bold flex items-center gap-1"><Crown className="w-2.5 h-2.5" /> PREMIUM</span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> TRIAL: {daysLeft}D LEFT</span>
                )}
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5">
             <form action={async () => { "use server"; await signOut(); }}>
               <button className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-400/70 hover:text-red-400 transition-colors">
                 <LogOut className="w-3.5 h-3.5" /> SIGN OUT
               </button>
             </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand-teal/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-brand-blue/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-5xl space-y-8 z-10">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">Quant Terminal</h1>
              <p className="text-slate-400">Welcome back, your institutional-grade betting advisor is ready.</p>
            </div>
            {!user.is_premium && (
               <Link href="/billing" className="px-5 py-2.5 bg-brand-teal text-background font-black text-xs rounded-lg hover:scale-[1.05] transition-all shadow-[0_0_20px_rgba(0,198,186,0.2)] flex items-center gap-2">
                 <Crown className="w-3 h-3" /> UPGRADE TO PREMIUM
               </Link>
            )}
          </header>

          <AssistantChat accessToken={(session as any).accessToken} />
        </div>
      </main>
    </div>
  );
}
