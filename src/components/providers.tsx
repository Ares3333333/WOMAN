"use client";

import { SessionProvider } from "next-auth/react";
import type { Locale } from "@/lib/i18n/types";
import { IntlProvider } from "@/components/intl-provider";

export function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: Locale;
  messages: Record<string, unknown>;
}) {
  return (
    <SessionProvider>
      <IntlProvider locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    </SessionProvider>
  );
}
