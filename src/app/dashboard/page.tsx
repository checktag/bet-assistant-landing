import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AssistantChat from "@/components/chat/AssistantChat";
import SlipTracker from "@/components/dashboard/SlipTracker";
import { Crown, Clock, LogOut, LayoutDashboard, Settings, BarChart3, Radar } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;
  const now = new Date();
  
  const trialEnds = new Date(user.trial_ends_at || (new Date(user.created_at || now).getTime() + 14 * 86400000));
  const daysLeft = Math.max(0, Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-[#03060E] text-slate-200 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Top Navigation */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#060913]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20 text-brand-teal font-bold">{user.email[0].toUpperCase()}</div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-white text-sm">Bet Assistant</span>
            {user.is_premium ? (
              <span className="text-[9px] text-brand-teal font-bold flex items-center gap-1"><Crown className="w-2.5 h-2.5" /> PREMIUM</span>
            ) : (
              <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {daysLeft}D LEFT</span>
            )}
          </div>
        </div>
        <form action={async () => { "use server"; await signOut(); }}>
          <button className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20">
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 border-r border-white/5 bg-[#060913] flex-col p-6 space-y-8 h-screen sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 overflow-hidden rounded-lg"><img src="/image.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.65]" /></div>
          <span className="font-bold tracking-tight text-white">Bet Assistant</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-teal/10 text-brand-teal font-medium border border-brand-teal/20">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/dashboard?tab=tracker" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${user.is_premium ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'text-slate-600 cursor-not-allowed'}`}>
            <Radar className="w-4 h-4" />
            <span>Slip Tracker</span>
            {!user.is_premium && <Crown className="w-3 h-3 text-yellow-500 ml-auto" />}
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <BarChart3 className="w-4 h-4" /> Analytics
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <Settings className="w-4 h-4" /> Settings
          </Link>
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
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden min-h-[calc(100vh-72px)] md:min-h-screen">
        {/* Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand-teal/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-brand-blue/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-5xl space-y-6 md:space-y-8 z-10 flex flex-col h-full md:h-auto justify-center">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-none mb-1 md:mb-2">Quant Terminal</h1>
              <p className="text-xs md:text-sm text-slate-400">Institutional-grade betting advisor.</p>
            </div>
            {!user.is_premium && (
               <Link href="/billing" className="px-5 py-2.5 bg-brand-teal text-background font-black text-xs rounded-lg hover:scale-[1.05] transition-all shadow-[0_0_20px_rgba(0,198,186,0.2)] flex items-center gap-2">
                 <Crown className="w-3 h-3" /> UPGRADE TO PREMIUM
               </Link>
            )}
          </header>

          <AssistantChat accessToken={(session as any).accessToken} />

          {/* Slip Tracker Section */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <Radar className="w-5 h-5 text-brand-teal" />
              <h2 className="text-lg font-black text-white tracking-tight">Slip Tracker</h2>
              {user.is_premium ? (
                <span className="text-[10px] font-bold text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-2 py-0.5 rounded-full">Premium</span>
              ) : (
                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5" /> Upgrade Required
                </span>
              )}
            </div>
            <SlipTracker
              accessToken={(session as any).accessToken}
              telegramLinked={user.telegram_linked}
              isPremium={user.is_premium}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
