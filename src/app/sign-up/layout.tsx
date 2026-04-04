import { redirect } from "next/navigation";
import { hasAgeConfirmation } from "@/app/actions/age-gate";

export default async function SignUpLayout({ children }: { children: React.ReactNode }) {
  const ok = await hasAgeConfirmation();
  if (!ok) redirect("/age-gate");
  return <>{children}</>;
}
