"use client";

import { RouteErrorPanel } from "@/components/states/route-error-panel";

export default function AdminNewSessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorPanel error={error} reset={reset} homeHref="/admin/sessions" homeLabelKey="admin.sessions" />;
}
