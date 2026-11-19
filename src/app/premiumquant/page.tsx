import { redirect } from "next/navigation";

// The Quant tier now lives in the main dashboard (the deeper model is selected there).
export default function PremiumQuantPage() {
  redirect("/dashboard");
}
