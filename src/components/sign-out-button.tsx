"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useIntl } from "@/components/intl-provider";

export function SignOutButton() {
  const { t } = useIntl();
  return (
    <Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
      {t("app.settings.signOut")}
    </Button>
  );
}
