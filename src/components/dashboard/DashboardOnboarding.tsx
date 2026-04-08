"use client";

import React, { useState, useEffect } from "react";
import OnboardingModal from "./OnboardingModal";
import { useRouter, useSearchParams } from "next/navigation";

interface DashboardOnboardingProps {
  user: {
    credits: number;
    telegram_joined: boolean;
    is_premium: boolean;
  };
  accessToken: string;
}

export default function DashboardOnboarding({ user, accessToken }: DashboardOnboardingProps) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Show modal if user has 0 credits and hasn't joined telegram
    if (user.credits === 0 && !user.telegram_joined) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [user.credits, user.telegram_joined]);

  useEffect(() => {
    // Also show if explicitly triggered via URL param
    if (searchParams.get("onboard") === "true") {
      setShowModal(true);
    }
  }, [searchParams]);

  return (
    <OnboardingModal 
      isOpen={showModal} 
      onClose={() => setShowModal(false)}
      accessToken={accessToken}
      onSuccess={() => {
        // Refresh the page to show new credit balance
        router.refresh();
      }}
    />
  );
}
