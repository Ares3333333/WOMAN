"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function PaywallTracker({ from }: { from?: string }) {
  useEffect(() => {
    trackEvent("paywall_viewed", { surface: from ?? "premium_page" });
  }, [from]);
  return null;
}
