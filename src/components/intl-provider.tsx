"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/types";
import { t as lookup } from "@/lib/i18n/t";

type IntlContextValue = {
  locale: Locale;
  t: (path: string) => string;
};

const IntlContext = createContext<IntlContextValue | null>(null);

export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const t = useCallback((path: string) => lookup(messages, path), [messages]);
  const value = useMemo(() => ({ locale, t }), [locale, t]);

  return <IntlContext.Provider value={value}>{children}</IntlContext.Provider>;
}

export function useIntl() {
  const ctx = useContext(IntlContext);
  if (!ctx) {
    throw new Error("useIntl must be used within IntlProvider");
  }
  return ctx;
}
