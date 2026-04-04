import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

type Dict = Record<string, string>;

const RU: Dict = {
  brand: "Sora Calm",
  tagline: "Мягкая забота о себе — в одном касании",
  homeGreeting: "Привет",
  homeSub: "Сегодня твоя нервная система заслуживает тишину.",
  homeCtaListen: "Слушать сейчас",
  homeCtaPaths: "Пути спокойствия",
  homeCtaGoals: "Моя цель недели",
  homeDisclaimer: "Не терапия и не медпомощь. В кризисе — к поддержке очно.",
  pathsTitle: "Пути",
  pathsSub: "Короткие последовательности под разные состояния.",
  pathSessions: "сессий",
  sessionMin: "мин",
  sessionPremium: "Sora Circle",
  sessionPlay: "Слушать",
  sessionTranscript: "Текст практики",
  sessionJournal: "Подсказка для заметки",
  playerTts: "Озвучка в Telegram: включите звук. Текст читает устройство.",
  playerPlay: "Старт",
  playerPause: "Пауза",
  goalsTitle: "Твоя цель",
  goalsSub:
    "Каждая завершённая практика — капля спокойствия. Собери неделю без давления: это про заботу, не про идеальность.",
  goalsStreak: "Дней подряд",
  goalsWeek: "Практик на этой неделе",
  goalsDrops: "Капель спокойствия",
  goalsWeeklyTarget: "Мягкая цель недели",
  goalsWeeklyHint: "3 практики — уже победа. Можно меньше, если так тело просит.",
  goalsToday: "Я выбираю 5 минут для себя",
  goalsTodayDone: "Сегодня ты уже отметила заботу о себе",
  profileTitle: "Профиль",
  profilePremium: "Sora Circle",
  profilePremiumBody:
    "Полная библиотека, чувственное wellness (только с твоего согласия в настройках) и новые сессии первыми.",
  profileUpgrade: "Подключить",
  profileManage: "Управление в боте",
  profileLang: "Язык",
  profileCrisis: "Ресурсы поддержки",
  profilePrivacy: "Конфиденциальность",
  profileAge: "21+ · контент для взрослых",
  premiumGateTitle: "Эта сессия в Sora Circle",
  premiumGateBody: "Поддержи продукт и открой полную библиотеку — оформление через бота Telegram.",
  premiumGateLater: "Позже",
  navHome: "Домой",
  navPaths: "Пути",
  navGoals: "Цель",
  navProfile: "Профиль",
  back: "Назад",
  free: "Бесплатно",
  sensualNote: "Чувственный wellness — только в режиме «по желанию» и без давления.",
};

const EN: Dict = {
  brand: "Sora Calm",
  tagline: "Gentle self-care — one tap away",
  homeGreeting: "Hello",
  homeSub: "Your nervous system deserves quiet today.",
  homeCtaListen: "Listen now",
  homeCtaPaths: "Calm paths",
  homeCtaGoals: "My weekly goal",
  homeDisclaimer: "Not therapy or medical care. In crisis, reach real-world support.",
  pathsTitle: "Paths",
  pathsSub: "Short sequences for different states.",
  pathSessions: "sessions",
  sessionMin: "min",
  sessionPremium: "Sora Circle",
  sessionPlay: "Listen",
  sessionTranscript: "Practice text",
  sessionJournal: "Journal prompt",
  playerTts: "Telegram will use your device voice for the script. Unmute if needed.",
  playerPlay: "Start",
  playerPause: "Pause",
  goalsTitle: "Your goal",
  goalsSub:
    "Each completed practice is a drop of calm. A gentle week — about care, not perfection.",
  goalsStreak: "Day streak",
  goalsWeek: "Practices this week",
  goalsDrops: "Calm drops",
  goalsWeeklyTarget: "Soft weekly target",
  goalsWeeklyHint: "Three practices is a win. Less is OK if your body asks for it.",
  goalsToday: "I choose 5 minutes for myself",
  goalsTodayDone: "You already marked self-care today",
  profileTitle: "Profile",
  profilePremium: "Sora Circle",
  profilePremiumBody:
    "Full library, sensual wellness (only with your consent in settings), and new sessions first.",
  profileUpgrade: "Unlock",
  profileManage: "Manage in bot",
  profileLang: "Language",
  profileCrisis: "Support resources",
  profilePrivacy: "Privacy",
  profileAge: "21+ · adult-oriented wellness",
  premiumGateTitle: "Sora Circle session",
  premiumGateBody: "Support the app and unlock the full library — checkout via our Telegram bot.",
  premiumGateLater: "Later",
  navHome: "Home",
  navPaths: "Paths",
  navGoals: "Goal",
  navProfile: "Profile",
  back: "Back",
  free: "Free",
  sensualNote: "Sensual wellness is optional, consent-first, never pushy.",
};

const PATH_TITLES: Record<string, { ru: string; en: string }> = {
  nervous_system: { ru: "Нервная система", en: "Nervous system" },
  sleep_deep_rest: { ru: "Сон и глубокий отдых", en: "Sleep & deep rest" },
  boundaries_confidence: { ru: "Границы и мягкая сила", en: "Boundaries & quiet strength" },
  emotional_care: { ru: "Эмоциональная забота", en: "Emotional care" },
  body_embodiment: { ru: "Тело и присутствие", en: "Body & presence" },
  overload_cycle_care: { ru: "Перегруз и циклы", en: "Overload & cycles" },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  pathTitle: (id: string) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  initialLang: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("sora_lang", l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string) => {
      const d = lang === "ru" ? RU : EN;
      return d[key] ?? key;
    },
    [lang]
  );

  const pathTitle = useCallback(
    (id: string) => {
      const p = PATH_TITLES[id];
      if (!p) return id;
      return lang === "ru" ? p.ru : p.en;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, pathTitle }), [lang, setLang, t, pathTitle]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("I18nProvider missing");
  return c;
}

export function detectLangFromTelegram(code: string | undefined): Lang {
  if (!code) return "ru";
  return code.toLowerCase().startsWith("ru") ? "ru" : "en";
}
