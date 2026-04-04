import { getDictionary } from "./get-dictionary";
import { getLocale } from "./get-locale";
import type { Locale } from "./types";
import { t as translate } from "./t";

export async function getPageI18n(): Promise<{
  locale: Locale;
  dict: Record<string, unknown>;
  t: (path: string) => string;
}> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return { locale, dict, t: (path: string) => translate(dict, path) };
}
