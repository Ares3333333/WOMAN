import type { SubscriptionStatus } from "@prisma/client";

export function canAccessPremiumSession(
  status: SubscriptionStatus,
  sessionFreeTier: boolean
): boolean {
  if (sessionFreeTier) return true;
  return status === "active" || status === "trialing";
}

export function subscriptionLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "active":
      return "Premium active";
    case "trialing":
      return "Trial";
    case "canceled":
      return "Canceled";
    default:
      return "Free";
  }
}
