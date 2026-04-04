"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/lib/i18n/types";
import { isLocale } from "@/lib/i18n/types";
import { LOCALE_COOKIE } from "@/lib/i18n/get-locale";

export async function setUserLocale(locale: string): Promise<void> {
  const l: Locale = isLocale(locale) ? locale : "en";
  const store = await cookies();
  store.set(LOCALE_COOKIE, l, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
