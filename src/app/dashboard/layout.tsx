import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileNav from "@/components/dashboard/MobileNav";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;
  const displayName = user.username || user.email;
  const userInitial = displayName[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#03060E] text-slate-200 flex flex-col md:flex-row overflow-hidden">
      <MobileNav 
        isPremium={user.is_premium} 
        userInitial={userInitial} 
        userEmail={user.email} 
        username={user.username}
        credits={user.credits}
        totalReferrals={user.total_referrals}
        telegramJoined={user.telegram_joined}
      />

      <DashboardSidebar 
        isPremium={user.is_premium} 
        userEmail={user.email} 
        username={user.username}
        userInitial={userInitial} 
        credits={user.credits}
        totalReferrals={user.total_referrals}
        telegramJoined={user.telegram_joined}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto h-[calc(100vh-72px)] md:h-screen scrollbar-hide">
        {/* Persistent Background Orbs */}
        <div className="fixed top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand-teal/5 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-brand-blue/5 blur-[100px] rounded-full pointer-events-none z-0" />
        
        <div className="relative z-10 w-full pb-[calc(72px+env(safe-area-inset-bottom)+20px)] md:pb-0">
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </div>
      </main>
    </div>
  );
}
