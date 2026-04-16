import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AssistantChat from "@/components/chat/AssistantChat";
import { Crown } from "lucide-react";
import Link from "next/link";
import DashboardOnboarding from "@/components/dashboard/DashboardOnboarding";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;
  
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8 flex flex-col justify-center min-h-full py-8 md:py-12 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-none mb-1 md:mb-2 text-gradient">Quant Terminal</h1>
          <p className="text-xs md:text-sm text-slate-400">Institutional-grade betting advisor.</p>
        </div>
        {!user.is_premium && (
           <Link href="/billing" className="px-5 py-2.5 bg-brand-teal text-background font-black text-xs rounded-lg hover:scale-[1.05] transition-all shadow-[0_0_20px_rgba(0,198,186,0.2)] flex items-center gap-2">
             <Crown className="w-3 h-3" /> UPGRADE TO PREMIUM PRO
           </Link>
        )}
      </header>

      <AssistantChat accessToken={(session as any).accessToken} modelVersion="grok-4-1-fast-reasoning" />
      
      <Suspense fallback={null}>
        <DashboardOnboarding user={user} accessToken={(session as any).accessToken} />
      </Suspense>
    </div>
  );
}
