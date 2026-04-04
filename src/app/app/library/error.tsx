"use client";

import { RouteErrorPanel } from "@/components/states/route-error-panel";

export default function LibraryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorPanel error={error} reset={reset} homeHref="/app" homeLabelKey="common.home" />;
}
