"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useIntl } from "@/components/intl-provider";

export function RouteErrorPanel({
  error,
  reset,
  homeHref = "/app",
  homeLabelKey = "common.home",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref?: string;
  /** Dot path in messages JSON, e.g. common.home, app.nav.library */
  homeLabelKey?: string;
}) {
  const { t } = useIntl();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-display text-xl font-medium text-foreground">{t("errors.routeTitle")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("errors.routeBody")}</p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button type="button" onClick={() => reset()}>
          {t("common.tryAgain")}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={homeHref}>{t(homeLabelKey)}</Link>
        </Button>
      </div>
    </div>
  );
}
