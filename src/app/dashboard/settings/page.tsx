import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SettingsPageClient from "@/components/dashboard/SettingsPageClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session || !session.user) redirect("/auth/login");

  const user = session.user as any;

  return (
    <SettingsPageClient
      user={{
        email:           user.email,
        is_premium:      !!user.is_premium,
        telegram_linked: !!user.telegram_linked,
        telegram_id:     user.telegram_id ?? null,
        link_code:       user.link_code ?? null,
        created_at:      user.created_at ?? null,
      }}
      accessToken={(session as any).accessToken ?? ""}
    />
  );
}
