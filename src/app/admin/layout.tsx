import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import MobileNav from "@/components/dashboard/MobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 🛡 Server-Side Guard
  // Verify authenticated session and administrative credentials
  const user = session?.user as any;
  const SUPER_ADMINS = ["official@ctts.io", "chinazhirno@gmail.com"];
  const isAuthorized = user && (user.is_admin || SUPER_ADMINS.includes(user.email));

  if (!isAuthorized) {
    redirect("/dashboard");
  }

  const displayName = user.username || user.email;
  const userInitial = displayName ? displayName[0].toUpperCase() : "A";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#03060E] overflow-hidden">
      <MobileNav 
        isPremium={user.is_premium || user.is_active_sub} 
        userInitial={userInitial} 
        userEmail={user.email} 
        username={user.username}
        credits={user.credits || 0}
        totalReferrals={user.total_referrals || 0}
        telegramJoined={user.telegram_linked || false}
      />

      <AdminSidebar 
        userEmail={user.email}
        username={user.username}
      />
      <main className="flex-1 overflow-y-auto h-[calc(100vh-72px)] md:h-screen scrollbar-thin">
        {children}
      </main>
    </div>
  );
}
