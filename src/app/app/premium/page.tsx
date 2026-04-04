import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaywallTracker } from "@/components/premium/paywall-tracker";
import { PremiumPaywall } from "@/components/premium/premium-paywall";

export default async function PremiumPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const pref = await prisma.preference.findUnique({ where: { userId: session.user.id } });
  if (!pref?.onboardingComplete) redirect("/app/onboarding");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isSubscriber = user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing";

  const from = typeof searchParams.from === "string" ? searchParams.from : undefined;

  return (
    <>
      <PaywallTracker from={from} />
      <PremiumPaywall isSubscriber={isSubscriber} />
    </>
  );
}
