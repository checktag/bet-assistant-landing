import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AssistantChat from "@/components/chat/AssistantChat";
import SlipTracker from "@/components/dashboard/SlipTracker";
import { Crown, Clock, LogOut, LayoutDashboard, Settings, BarChart3, Radar } from "lucide-react";
import Link from "next/link";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileNav from "@/components/dashboard/MobileNav";
import { signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;
  const now = new Date();
  
  const trialEnds = new Date(user.trial_ends_at || (new Date(user.created_at || now).getTime() + 7 * 86400000));
  const daysLeft = Math.max(0, Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-[#03060E] text-slate-200 flex flex-col md:flex-row overflow-hidden">
      <MobileNav 
        isPremium={user.is_premium} 
        userInitial={user.email[0].toUpperCase()} 
        userEmail={user.email} 
      />

      <DashboardSidebar 
        isPremium={user.is_premium} 
        activePath="/dashboard" 
        userEmail={user.email} 
        userInitial={user.email[0].toUpperCase()} 
        credits={user.credits}
        telegramJoined={user.telegram_joined}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden min-h-[calc(100vh-72px)] md:min-h-screen">
        {/* Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand-teal/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-brand-blue/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-5xl space-y-6 md:space-y-8 z-10 flex flex-col h-full md:h-auto justify-center">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-none mb-1 md:mb-2 text-gradient">Quant Terminal</h1>
              <p className="text-xs md:text-sm text-slate-400">Institutional-grade betting advisor.</p>
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
