import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BillingPageClient from "./BillingPageClient";

export default async function BillingPage() {
  const session = await auth();
  if (!session || !session.user) redirect("/auth/login");

  const user = session.user as any;

  return (
    <BillingPageClient
      user={{
        email:           user.email,
        is_premium:      !!user.is_premium,
        trial_ends_at:   user.trial_ends_at ?? null,
      }}
      accessToken={(session as any).accessToken ?? ""}
    />
  );
}
