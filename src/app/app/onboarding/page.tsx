import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "./ui";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const pref = await prisma.preference.findUnique({ where: { userId: session.user.id } });
  if (pref?.onboardingComplete) redirect("/app");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });
  const givenName = user?.name?.trim().split(/\s+/)[0] ?? null;

  return (
    <div className="pb-20 pt-2">
      <OnboardingForm givenName={givenName} />
    </div>
  );
}
