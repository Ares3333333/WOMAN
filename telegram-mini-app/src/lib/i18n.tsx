import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

type Dict = Record<string, string>;

const RU: Dict = {
  brand: "Sora Calm",
  tagline: "Мягкая забота о себе — в одном касании",
  homeGreeting: "Привет",
  homeSub:
    "Короткие практики — чтобы снова почувствовать опору и тишину внутри. Без спешки и без оценки.",
  homeTodayPickLabel: "Сегодня для тебя",
  homeTimeMorning: "Утро — мягкий вход в день",
  homeTimeAfternoon: "День — можно выдохнуть",
  homeTimeEvening: "Вечер — тихий сброс",
  homeCtaListen: "Слушать сейчас",
  homePrimaryCta: "Начать практику",
  homeCtaPaths: "Подобрать по состоянию",
  homeCtaGoals: "Мягкий ритм недели",
  homeDisclaimer: "Не терапия и не медпомощь. В кризисе — к поддержке очно.",
  onboardingTitle: "Добро пожаловать в Sora",
  onboardingSub:
    "Это не про «стать лучше». Про заботу и контакт с собой. Что ближе сейчас — или пропусти шаг.",
  onboardingMoodStress: "Много напряжения",
  onboardingMoodTired: "Усталость, нет сил",
  onboardingMoodAnxiety: "Тревога, мысли крутятся",
  onboardingMoodBody: "Хочу вернуться в тело",
  onboardingSkip: "Пропустить",
  onboardingContinue: "Продолжить",
  pathsTitle: "Пути",
  pathsSub: "Отобранные практики под то, как ты сейчас — без лишнего шума.",
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
  goalsStreak: "Дни заботы подряд",
  goalsWeek: "Практик на этой неделе",
  goalsDrops: "Капель спокойствия",
  goalsWeeklyTarget: "Мягкая цель недели",
  goalsWeeklyHint: "3 практики — уже победа. Можно меньше, если так тело просит.",
  goalsToday: "Я выбираю 5 минут для себя",
  goalsTodayDone: "Сегодня ты уже отметила заботу о себе",
  profileTitle: "Профиль",
  profilePremium: "Sora Circle",
  profilePremiumBody:
    "Полная коллекция практик и путей — в твоём темпе. Новые выпуски — в Circle первыми.",
  profileCircleBullet1: "Все пути и сессии, включая вечерние и более глубокие",
  profileCircleBullet2: "Новые практики — сначала в Circle",
  profileCircleBullet3: "Чувственный слой — только при твоём «да» в настройках ниже",
  profilePremiumActive: "Sora Circle активен",
  profileUpgrade: "Открыть в боте",
  profileManage: "Управление в боте",
  profileLang: "Язык",
  profileCrisis: "Ресурсы поддержки",
  profilePrivacy: "Конфиденциальность",
  profileAge: "21+ · контент для взрослых",
  premiumGateTitle: "Sora Circle",
  premiumGateLead:
    "Эта практика — часть полной коллекции. Открой Circle в твоём темпе, без давления.",
  premiumGateBullet1: "Все пути и сессии, включая вечерние и более глубокие",
  premiumGateBullet2: "Новые выпуски — сначала в Circle",
  premiumGateBullet3: "Чувственный контент — только с твоего согласия в настройках",
  premiumGatePrivacy: "Оплата и подписка — в боте Telegram, не внутри этого окна.",
  premiumGateCta: "Открыть в боте",
  premiumGateProfile: "Настройки и язык",
  premiumGateLater: "Назад",
  profileSensualSectionTitle: "Интимность контента",
  profileSensualSectionSub:
    "Чувственные практики показываются только если ты сама разрешаешь.",
  profileSensualWelcome: "По умолчанию — мягко",
  profileSensualOptional: "По желанию",
  profileSensualHidden: "Не показывать",
  profileEnvTelegram: "Telegram",
  profileEnvLocal: "Локальный просмотр",
  sessionCompleteLine: "Практика завершена. Можно остаться ещё на минуту в тишине.",
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
  homeSub:
    "Short practices to find quiet and contact with yourself. No rush, no scoring.",
  homeTodayPickLabel: "Chosen for you today",
  homeTimeMorning: "Morning — a gentle way in",
  homeTimeAfternoon: "Day — space to breathe",
  homeTimeEvening: "Evening — a quiet wind-down",
  homeCtaListen: "Listen now",
  homePrimaryCta: "Begin practice",
  homeCtaPaths: "Browse by how you feel",
  homeCtaGoals: "Your gentle week",
  homeDisclaimer: "Not therapy or medical care. In crisis, reach real-world support.",
  onboardingTitle: "Welcome to Sora",
  onboardingSub:
    "This isn’t about self-improvement. It’s care and contact with yourself — or skip this step.",
  onboardingMoodStress: "A lot of tension",
  onboardingMoodTired: "Worn out, low energy",
  onboardingMoodAnxiety: "Anxiety, racing thoughts",
  onboardingMoodBody: "I want to feel my body again",
  onboardingSkip: "Skip",
  onboardingContinue: "Continue",
  pathsTitle: "Paths",
  pathsSub: "Curated practices for how you feel — nothing noisy.",
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
  goalsStreak: "Days of care in a row",
  goalsWeek: "Practices this week",
  goalsDrops: "Calm drops",
  goalsWeeklyTarget: "Soft weekly target",
  goalsWeeklyHint: "Three practices is a win. Less is OK if your body asks for it.",
  goalsToday: "I choose 5 minutes for myself",
  goalsTodayDone: "You already marked self-care today",
  profileTitle: "Profile",
  profilePremium: "Sora Circle",
  profilePremiumBody:
    "The full collection of practices and paths — at your pace. New releases land in Circle first.",
  profileCircleBullet1: "All paths and sessions, including evening and deeper listens",
  profileCircleBullet2: "New practices in Circle first",
  profileCircleBullet3: "Sensual layer — only with your explicit yes in settings below",
  profilePremiumActive: "Sora Circle is active",
  profileUpgrade: "Open in bot",
  profileManage: "Manage in bot",
  profileLang: "Language",
  profileCrisis: "Support resources",
  profilePrivacy: "Privacy",
  profileAge: "21+ · adult-oriented wellness",
  premiumGateTitle: "Sora Circle",
  premiumGateLead:
    "This practice is part of the full collection. Open Circle at your pace — no pressure.",
  premiumGateBullet1: "All paths and sessions, including evening and deeper listens",
  premiumGateBullet2: "New releases in Circle first",
  premiumGateBullet3: "Sensual content — only with your consent in settings",
  premiumGatePrivacy: "Billing and subscription are handled in our Telegram bot.",
  premiumGateCta: "Open in bot",
  premiumGateProfile: "Settings & language",
  premiumGateLater: "Back",
  profileSensualSectionTitle: "Content intimacy",
  profileSensualSectionSub: "Sensual practices appear only if you choose to allow them.",
  profileSensualWelcome: "Gentle default",
  profileSensualOptional: "When I opt in",
  profileSensualHidden: "Do not show",
  profileEnvTelegram: "Telegram",
  profileEnvLocal: "Local preview",
  sessionCompleteLine: "Practice complete. You can stay in the quiet for another moment.",
  navHome: "Home",
  navPaths: "Paths",
  navGoals: "Goal",
  navProfile: "Profile",
  back: "Back",
  free: "Free",
  sensualNote: "Sensual wellness is optional, consent-first, never pushy.",
};

const PATH_TITLES: Record<string, { ru: string; en: string }> = {
  nervous_system: { ru: "Когда система на пределе", en: "When your system is overloaded" },
  sleep_deep_rest: { ru: "Сон и глубокий отдых", en: "Sleep & deep rest" },
  boundaries_confidence: { ru: "Границы и тихая сила", en: "Boundaries & quiet strength" },
  emotional_care: { ru: "Эмоциональная опора", en: "Emotional steadiness" },
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
