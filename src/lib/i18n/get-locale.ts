import { cookies, headers } from "next/headers";
import type { Locale } from "./types";
import { DEFAULT_LOCALE, isLocale } from "./types";

const COOKIE = "sora_locale";

/** Server-only: cookie wins, then Accept-Language hint. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const c = store.get(COOKIE)?.value;
  if (isLocale(c)) return c;

  const h = await headers();
  const accept = h.get("accept-language")?.toLowerCase() ?? "";
  if (accept.includes("ru")) return "ru";
  return DEFAULT_LOCALE;
}

export { COOKIE as LOCALE_COOKIE };
