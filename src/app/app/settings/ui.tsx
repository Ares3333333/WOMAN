"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function SettingsClient() {
  useEffect(() => {
    trackEvent("paywall_viewed", { surface: "settings" });
  }, []);
  return null;
}
