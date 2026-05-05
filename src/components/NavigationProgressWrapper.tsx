"use client";

import { Suspense } from "react";
import NavigationProgress from "@/components/NavigationProgress";

/**
 * Wrap NavigationProgress in Suspense because useSearchParams()
 * requires it in Next.js App Router to avoid build-time errors.
 */
export default function NavigationProgressWrapper() {
  return (
    <Suspense fallback={null}>
      <NavigationProgress />
    </Suspense>
  );
}
