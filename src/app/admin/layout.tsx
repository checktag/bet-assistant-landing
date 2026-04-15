import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

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

  return (
    <div className="flex h-screen bg-[#03060E] overflow-hidden">
      <AdminSidebar 
        userEmail={user.email}
        username={user.username}
      />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </main>
    </div>
  );
}
