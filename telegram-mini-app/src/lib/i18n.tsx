import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

type Dict = Record<string, string>;

const RU: Dict = {
  brand: "Sora Calm",
  tagline: "Мягкая забота о себе — в одном касании",
  homeGreeting: "Привет",
  homePrivateEyebrow: "Приватное пространство",
  homeSub:
    "Кураторские аудио-практики под твоё состояние и время суток. Без давления и без оценки.",
  homeTodayPickLabel: "Для тебя сейчас",
  homeTimeMorning: "Утро — мягкий вход",
  homeTimeAfternoon: "День — можно выдохнуть",
  homeTimeEvening: "Вечер — тихий сброс",
  homeCtaListen: "Слушать",
  homePrimaryCta: "Начать практику",
  homeContinueLabel: "Продолжить",
  homeContinueSub: "Там, где ты остановилась в прошлый раз",
  homeMoodSectionLabel: "Сейчас ближе по ощущению",
  homePathsSectionTitle: "Кураторские пути",
  homePathsSectionSub: "Не каталог — собранные дорожки под разные дни",
  homeEveningRowCta: "Вечерний отдых и сон — отдельный путь",
  homeFooterPaths: "Все пути",
  homeFooterGoals: "Мягкая неделя",
  homeCtaPaths: "Подобрать по состоянию",
  homeCtaGoals: "Мягкий ритм недели",
  homeDisclaimer: "Не терапия и не медпомощь. В кризисе — к поддержке очно.",
  onboardingEyebrow: "Твоё пространство",
  onboardingTitle: "Добро пожаловать в Sora",
  onboardingSub:
    "Короткие практики для тишины внутри — без давления и без оценки. Ниже отметь, что ближе по ощущению.",
  onboardingChipsLabel: "Сейчас ближе…",
  onboardingContinueHint: "Продолжить без выбора",
  onboardingMoodStress: "Много напряжения",
  onboardingMoodTired: "Усталость, нет сил",
  onboardingMoodAnxiety: "Тревога, мысли крутятся",
  onboardingMoodBody: "Хочу вернуться в тело",
  onboardingSkip: "Пропустить",
  onboardingContinue: "Войти в Sora",
  onboardingNext: "Дальше",
  homeHeadline: "Ты здесь. Можно выдохнуть.",
  homeHeroMomentLabel: "На этот момент",
  homeTonightSectionLabel: "Сегодня вечером",
  homeTonightSub: "Тихий спуск к отдыху — без плана и без давления.",
  homePremiumBlockTitle: "Sora Circle",
  homePremiumBlockSub:
    "Глубина вечера и ночи, полные пути и новинки первыми — в твоём темпе. Оплата — в боте.",
  homePremiumCta: "Открыть в боте",
  homeContinueEmpty: "Пока нечего продолжить — начни с короткой практики выше.",
  onboardingStep0Title: "Это твоё тихое место",
  onboardingStep0Sub:
    "Sora — короткие практики для контакта с собой. Не терапия и не медицина, без оценки результата.",
  onboardingStep1Title: "Для взрослых дней",
  onboardingStep1Sub:
    "Когда шумно внутри, тяжело отпустить день или хочется мягкости — без лозунгов и спешки.",
  onboardingStep2Title: "Один тап — и ты внутри практики",
  onboardingStep2Sub: "Можно выйти в любой момент. Это твоё право, не исключение.",
  onboardingStep3Title: "Что ближе по ощущению?",
  onboardingStep3Sub: "Не диагноз — только подсказка, с чего начать. Потом поменяешь на главной.",
  onboardingStep4Title: "Что ты здесь получаешь",
  onboardingStep4Sub:
    "Кураторские дорожки под разные состояния. Бесплатно — сильный вход. Circle — глубина и вечер.",
  onboardingStep5Title: "Добро пожаловать в Sora",
  onboardingStep5Sub:
    "Мы подобрали первую практику под твой выбор. Всегда можно сменить настроение на главной.",
  pillarLabel_still_mind: "Тише внутренний шум",
  pillarLabel_when_lot: "Когда много",
  pillarLabel_close_day: "Закрыть день",
  pillarLabel_back_body: "Вернуться в тело",
  pillarLabel_soft_evening: "Мягкий вечер",
  pillarLabel_tonight: "На ночь",
  pillarLabel_return_you: "Снова своя",
  pillarLabel_quiet_warmth: "Тихое тепло",
  pillarTag_still_mind: "Тишина",
  pillarTag_when_lot: "Много",
  pillarTag_close_day: "День",
  pillarTag_back_body: "Тело",
  pillarTag_soft_evening: "Вечер",
  pillarTag_tonight: "Ночь",
  pillarTag_return_you: "Своя",
  pillarTag_quiet_warmth: "Тепло",
  pathIntro_nervous_system: "Когда внутри шумно или всего слишком — короткие якоря без разбора мыслей.",
  pathIntro_sleep_deep_rest: "Закрыть день телом и подойти к отдыху — мягко и без отчёта.",
  pathIntro_boundaries_confidence: "Тихий вход в день и контакт с собой — без геройства.",
  pathIntro_emotional_care: "Когда мир резкий — смягчить впечатление и опустить плечи.",
  pathIntro_body_embodiment: "Опора и присутствие; чувственный слой — только с твоего согласия.",
  pathIntro_overload_cycle_care: "Когда держишь слишком много — короткая пауза без чувства вины.",
  pathsTitle: "Пути",
  pathsSub: "Каждый путь — маленькая дорожка под настроение и день, без шума каталога.",
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
    "Circle — это структура и глубина: вечерние ритуалы, полные пути и приватная коллекция. В твоём темпе.",
  profileCircleBullet1: "Полная кураторская библиотека и вечерние практики",
  profileCircleBullet2: "Новые дорожки и сессии — сначала в Circle",
  profileCircleBullet3: "Персональная логика путей и чувственный слой — только с твоего согласия",
  profilePremiumActive: "Sora Circle активен",
  profileUpgrade: "Открыть в боте",
  profileManage: "Управление в боте",
  profileReminderTitle: "Напоминания",
  profileReminderSub:
    "Выбери, какой тон разрешаешь для редких сообщений из бота. Отправка подключается в боте.",
  profileReminderOff: "Выключено",
  profileReminderEvening: "Мягкий вечер",
  profileReminderNight: "На ночь",
  profileLang: "Язык",
  profileCrisis: "Ресурсы поддержки",
  profilePrivacy: "Конфиденциальность",
  profileAge: "21+ · контент для взрослых",
  premiumGateTitle: "Sora Circle",
  premiumGateEyebrow: "Полная коллекция",
  premiumGateLead:
    "Эта сессия — из полной коллекции Circle: больше дорожек, вечерних и глубоких практик. Без спешки.",
  premiumGateBullet1: "Структура и связность практик — не разрозненные файлы",
  premiumGateBullet2: "Вечерний слой и расширенные пути",
  premiumGateBullet3: "Новинки и опциональный чувственный контент — по твоему выбору",
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
  loadingLine: "Загружаем тихое место…",
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
  homePrivateEyebrow: "A private space",
  homeSub:
    "Curated audio practices for how you feel and the time of day. No pressure, no scoring.",
  homeTodayPickLabel: "For you right now",
  homeTimeMorning: "Morning — a gentle way in",
  homeTimeAfternoon: "Day — room to breathe",
  homeTimeEvening: "Evening — a quiet wind-down",
  homeCtaListen: "Listen",
  homePrimaryCta: "Begin practice",
  homeContinueLabel: "Continue",
  homeContinueSub: "Where you left off last time",
  homeMoodSectionLabel: "What feels closest now",
  homePathsSectionTitle: "Curated paths",
  homePathsSectionSub: "Not a catalog — tracks for different days",
  homeEveningRowCta: "Evening rest & sleep — its own path",
  homeFooterPaths: "All paths",
  homeFooterGoals: "Gentle week",
  homeCtaPaths: "Browse by how you feel",
  homeCtaGoals: "Your gentle week",
  homeDisclaimer: "Not therapy or medical care. In crisis, reach real-world support.",
  onboardingEyebrow: "Your space",
  onboardingTitle: "Welcome to Sora",
  onboardingSub:
    "Short practices for inner quiet — no pressure, no scoring. Mark what feels closest right now.",
  onboardingChipsLabel: "Right now it feels more like…",
  onboardingContinueHint: "Continue without choosing",
  onboardingMoodStress: "A lot of tension",
  onboardingMoodTired: "Worn out, low energy",
  onboardingMoodAnxiety: "Anxiety, racing thoughts",
  onboardingMoodBody: "I want to feel my body again",
  onboardingSkip: "Skip",
  onboardingContinue: "Enter Sora",
  onboardingNext: "Next",
  homeHeadline: "You are here. You can exhale.",
  homeHeroMomentLabel: "For this moment",
  homeTonightSectionLabel: "This evening",
  homeTonightSub: "A quiet wind-down — no plan, no pressure.",
  homePremiumBlockTitle: "Sora Circle",
  homePremiumBlockSub:
    "Deeper evenings and nights, full paths, and new releases first — at your pace. Billing in the bot.",
  homePremiumCta: "Open in bot",
  homeContinueEmpty: "Nothing to continue yet — start with the short practice above.",
  onboardingStep0Title: "This is your quiet place",
  onboardingStep0Sub:
    "Sora is short practices to reconnect with yourself. Not therapy or medicine — no scoring.",
  onboardingStep1Title: "For grown-up days",
  onboardingStep1Sub:
    "When it is loud inside, hard to release the day, or you want softness — no slogans, no rush.",
  onboardingStep2Title: "One tap — you are in the practice",
  onboardingStep2Sub: "You can leave anytime. That is your right, not an exception.",
  onboardingStep3Title: "What feels closest right now?",
  onboardingStep3Sub: "Not a diagnosis — just a hint where to start. You can change it on Home.",
  onboardingStep4Title: "What you get here",
  onboardingStep4Sub:
    "Curated tracks for different states. Free tier is a strong start. Circle is depth and evening.",
  onboardingStep5Title: "Welcome to Sora",
  onboardingStep5Sub:
    "We picked a first practice from your choice. You can always shift how you feel on Home.",
  pillarLabel_still_mind: "Still the Mind",
  pillarLabel_when_lot: "When it is a lot",
  pillarLabel_close_day: "Close the Day",
  pillarLabel_back_body: "Back to Body",
  pillarLabel_soft_evening: "Soft Evening",
  pillarLabel_tonight: "Tonight",
  pillarLabel_return_you: "Return to You",
  pillarLabel_quiet_warmth: "Quiet Warmth",
  pillarTag_still_mind: "Quiet",
  pillarTag_when_lot: "Overload",
  pillarTag_close_day: "Day",
  pillarTag_back_body: "Body",
  pillarTag_soft_evening: "Evening",
  pillarTag_tonight: "Night",
  pillarTag_return_you: "You",
  pillarTag_quiet_warmth: "Warmth",
  pathIntro_nervous_system: "When it is loud inside or too much — short anchors without chasing thoughts.",
  pathIntro_sleep_deep_rest: "Soften the day with your body and move toward rest — gently.",
  pathIntro_boundaries_confidence: "A quiet way into the day — contact with yourself, no heroics.",
  pathIntro_emotional_care: "When the world feels sharp — soften the edges and drop your shoulders.",
  pathIntro_body_embodiment: "Grounding and presence; sensual layer only with your consent.",
  pathIntro_overload_cycle_care: "When you are holding too much — a micro-pause without guilt.",
  pathsTitle: "Paths",
  pathsSub: "Each path is a small track for your mood and day — not catalog noise.",
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
    "Circle is structure and depth: evening rituals, full paths, and a private collection — at your pace.",
  profileCircleBullet1: "Full curated library and evening practices",
  profileCircleBullet2: "New tracks and sessions land in Circle first",
  profileCircleBullet3: "Path logic and optional sensual content — only with your consent",
  profilePremiumActive: "Sora Circle is active",
  profileUpgrade: "Open in bot",
  profileManage: "Manage in bot",
  profileReminderTitle: "Reminders",
  profileReminderSub:
    "Choose the tone you allow for rare bot messages. Delivery is wired in the bot.",
  profileReminderOff: "Off",
  profileReminderEvening: "Soft evening",
  profileReminderNight: "For tonight",
  profileLang: "Language",
  profileCrisis: "Support resources",
  profilePrivacy: "Privacy",
  profileAge: "21+ · adult-oriented wellness",
  premiumGateTitle: "Sora Circle",
  premiumGateEyebrow: "Full collection",
  premiumGateLead:
    "This session is from the full Circle collection — more tracks, evening and deeper practices. No rush.",
  premiumGateBullet1: "Structure and continuity — not a loose file dump",
  premiumGateBullet2: "Evening layer and extended paths",
  premiumGateBullet3: "New releases and optional sensual content — your choice",
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
  loadingLine: "Opening your quiet space…",
  navHome: "Home",
  navPaths: "Paths",
  navGoals: "Goal",
  navProfile: "Profile",
  back: "Back",
  free: "Free",
  sensualNote: "Sensual wellness is optional, consent-first, never pushy.",
};

const PATH_TITLES: Record<string, { ru: string; en: string }> = {
  nervous_system: { ru: "Тише внутренний шум", en: "Still the Mind" },
  sleep_deep_rest: { ru: "Мягкий вечер и ночь", en: "Soft Evening & Tonight" },
  boundaries_confidence: { ru: "Снова своя", en: "Return to You" },
  emotional_care: { ru: "Когда день не отпускает", en: "When the day lingers" },
  body_embodiment: { ru: "Вернуться в тело", en: "Back to Body" },
  overload_cycle_care: { ru: "Когда держишь слишком много", en: "When you hold too much" },
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
