import type { Locale } from "./types";
import { DEFAULT_LOCALE, isLocale } from "./types";
import en from "./messages/en.json";
import ru from "./messages/ru.json";

const dictionaries: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  ru: ru as Record<string, unknown>,
};

export function getDictionary(locale: Locale): Record<string, unknown> {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function parseLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
