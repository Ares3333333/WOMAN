import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

type Dict = Record<string, string>;

const RU: Dict = {
  brand: "Sora",
  shellTagline: "Telegram Mini App",
  shellPrivate: "Private Space",
  navAriaMain: "Основная навигация",
  navHome: "Главная",
  navPaths: "Пути",
  navGoals: "Ритм",
  navProfile: "Профиль",
  back: "Назад",
  free: "Free",

  homeHeroAnonymous: "Вечер в вашем ритме.",
  homeHeroNamed: "{name}, вечер в вашем ритме.",
  homeHeroLead: "Один сильный следующий шаг. Без ленты, без шума, без давления.",
  homeTimeMorning: "Утро · мягкий вход",
  homeTimeAfternoon: "День · короткая перезагрузка",
  homeTimeEvening: "Вечер · тихое снижение",
  homePrimaryCta: "Начать практику",
  homePrimaryLockedCta: "Открыть Circle в боте",
  homeQuickPaths: "Каталог",
  homeQuickGoals: "Неделя",
  homeQuickMood: "Состояние",
  homeSectionTodayKicker: "Сегодня",
  homeSectionTodayTitle: "Лучший следующий шаг",
  homeCurrentKicker: "Рекомендация на сейчас",
  homeOpenHint: "Открыть",
  homeUnlockHint: "Доступно в Circle",
  homeStudioKicker: "Studio",
  homeStudioTitle: "Личный набор",
  homeStudioSub: "Продолжение и альтернативы без перегруза интерфейса.",
  homeContinueLabel: "Продолжить",
  homeContinueSub: "Точка, где вы остановились в прошлый раз",
  homeContinueEmptyTitle: "История еще не началась",
  homeContinueEmptySub: "Сделайте первую короткую сессию, и продолжение появится здесь.",
  homeTonightLabel: "Сегодня вечером",
  homeMoodKicker: "Точный выбор",
  homeMoodTitle: "Как вы сейчас",
  homeMoodSub: "Выбор влияет на главную рекомендацию и вечерний слой.",
  homePathsKicker: "Curated Paths",
  homePathsTitle: "Пути по состоянию",
  homePathsSub: "Не бесконечный каталог, а собранные треки с понятной логикой.",
  homePremiumKicker: "Circle",
  homePremiumTitle: "Полная версия студии",
  homePremiumSub: "Расширенные вечерние дуги, закрытые сессии и полный библиотечный доступ.",
  homePremiumPoint1: "Полный каталог без урезанных карточек",
  homePremiumPoint2: "Длинные вечерние и ночные сценарии",
  homePremiumPoint3: "Оплата и управление подпиской через Telegram-бота",
  homePremiumCta: "Перейти в бот",
  homeWeekHint: "Три практики в неделю уже создают устойчивый ритм.",
  homeSupportKicker: "Важно",
  homeSupportCopy: "Sora не медицинский сервис и не кризисная линия.",
  homeSupportLink: "Ресурсы поддержки",

  onboardingEyebrow: "Вход",
  onboardingStepLine: "Шаг {current} из {total}",
  onboardingSkip: "Пропустить",
  onboardingS0Title: "Это ваше приватное пространство",
  onboardingS0Sub:
    "Короткие практики для эмоциональной разгрузки и возвращения к себе. Без терапии и медицинских обещаний.",
  onboardingS1Title: "Сначала выберите состояние",
  onboardingS1Sub: "Мы используем его только как контекст для первого экрана и рекомендаций.",
  onboardingS2Title: "Что внутри",
  onboardingS2Sub: "Продуманная структура, а не набор случайных медитаций.",
  onboardingS3Title: "Студия готова",
  onboardingS3Sub: "Можно менять состояние в любой момент. Контроль полностью у вас.",
  onboardingChipsLabel: "Сейчас ближе всего:",
  onboardingMoodStress: "Слишком много напряжения",
  onboardingMoodTired: "Истощение и перегруз",
  onboardingMoodAnxiety: "Тревожный внутренний шум",
  onboardingMoodBody: "Хочу вернуться в тело",
  onboardingFeature1: "Короткие сценарии на 5-18 минут с ясным назначением",
  onboardingFeature2: "Пути по состоянию: стресс, вечер, восстановление, опора",
  onboardingFeature3: "Circle: премиальный закрытый слой с полным доступом",
  onboardingFinalNote: "Если захотите выйти из практики, выход всегда безопасен и мгновенный.",
  onboardingContinueHint: "Продолжить без выбора",
  onboardingContinue: "Войти в студию",
  onboardingNext: "Дальше",

  goalsHeroKicker: "Rhythm",
  goalsHeroTitle: "Ваш недельный ритм",
  goalsHeroSub: "Сфокусировано на устойчивости, а не на перфекционизме.",
  goalsStreak: "Дней подряд",
  goalsStreakHint: "Личная непрерывность",
  goalsDrops: "Calm drops",
  goalsDropsHint: "Сумма завершенных сессий",
  goalsWeekKicker: "Weekly Focus",
  goalsWeekTitle: "Мягкая цель недели",
  goalsWeekSub: "3 практики в неделю достаточно, чтобы сохранить контакт с собой.",
  goalsWeeklyTarget: "Цель 3 практики",
  goalsWeeklyHint: "Можно больше. Можно меньше. Важна регулярность, а не рекорд.",
  goalsToday: "Отметить заботу о себе сегодня",
  goalsTodayDone: "Сегодня уже отмечено",

  profileTitle: "Настройки профиля",
  profileHeroKicker: "Profile",
  profileHeroTitle: "Вы и ваша студия",
  profilePremium: "Sora Circle",
  profilePremiumTitle: "Премиальный слой",
  profilePremiumSub: "Базовый режим активен. Circle можно подключить в любой момент.",
  profilePremiumBody: "Circle открывает полный каталог, вечерний и ночной слои, плюс расширенные пути.",
  profilePremiumActive: "Circle активен",
  profileCircleBullet1: "Все закрытые сессии и полные версии программ",
  profileCircleBullet2: "Приоритетный доступ к новым дорожкам",
  profileCircleBullet3: "Более глубокие вечерние протоколы",
  profileUpgrade: "Открыть Circle в боте",
  profileManage: "Управление в боте",
  profileReminderTitle: "Напоминания",
  profileReminderSub: "Тон редких напоминаний от бота. Можно отключить полностью.",
  profileReminderOff: "Выкл",
  profileReminderEvening: "Вечер",
  profileReminderNight: "Ночь",
  profileLang: "Язык",
  profileSensualSectionTitle: "Чувствительный контент",
  profileSensualSectionSub: "Показывается только по вашему выбору, без автоподталкивания.",
  profileSensualWelcome: "Мягкий default",
  profileSensualOptional: "Только по запросу",
  profileSensualHidden: "Скрыть",
  profileEnvTelegram: "Режим: Telegram",
  profileEnvLocal: "Режим: локальный предпросмотр",
  profileAge: "21+ · продукт для взрослых",
  profileCrisis: "Открыть ресурсы поддержки",

  pathsHeroKicker: "Catalog",
  pathsHeroTitle: "Пути с редакторской логикой",
  pathsHeroSub: "Выбирайте не по шуму, а по текущему состоянию и нужному результату.",
  pathSessions: "сессий",
  pathsLockedLabel: "locked",
  pathsOpenLabel: "доступно сейчас",
  pathNotFound: "Путь не найден",
  pathNotFoundSub: "Возможно, он был обновлен. Вернитесь в каталог и выберите актуальный путь.",

  sessionNotFound: "Сессия не найдена",
  sessionNotFoundSub: "Вернитесь в каталог и выберите другую практику.",
  sensualGateTitle: "Контент скрыт по настройке",
  sensualNote: "Эта категория отключена в вашем профиле. Вы можете включить ее вручную в любой момент.",
  sessionAbout: "О сессии",
  sessionMin: "мин",
  sessionPremium: "Circle",
  playerTts: "Текст озвучивает устройство. Проверьте, что звук в Telegram включен.",
  playerPlay: "Запустить аудио",
  playerPause: "Остановить",
  sessionTranscript: "Текст сессии",
  sessionJournal: "Вопрос для заметки",
  sessionCompleteLine: "Сессия завершена. Возьмите 20 секунд перед возвратом к делам.",

  premiumGateEyebrow: "Premium Access",
  premiumGateTitle: "Эта сессия в Circle",
  premiumGateLead:
    "Полная версия доступна в премиальном слое. Вы получите длинные вечерние протоколы и расширенные программы.",
  premiumGateBullet1: "Закрытые сессии без ограничений",
  premiumGateBullet2: "Расширенные форматы на вечер и ночь",
  premiumGateBullet3: "Оплата и управление подпиской в Telegram-боте",
  premiumGatePrivacy: "Sora не заменяет медицину, психотерапию или кризисную помощь.",
  premiumGateCta: "Открыть Circle",
  premiumGateProfile: "Открыть профиль",
  premiumGateLater: "Позже",

  pillarLabel_still_mind: "Тихий ум",
  pillarLabel_when_lot: "Когда всего слишком много",
  pillarLabel_close_day: "Закрыть день",
  pillarLabel_back_body: "Вернуться в тело",
  pillarLabel_soft_evening: "Мягкий вечер",
  pillarLabel_tonight: "На эту ночь",
  pillarLabel_return_you: "Вернуться к себе",
  pillarLabel_quiet_warmth: "Тихое тепло",

  pillarTag_still_mind: "Ум",
  pillarTag_when_lot: "Перегруз",
  pillarTag_close_day: "День",
  pillarTag_back_body: "Тело",
  pillarTag_soft_evening: "Вечер",
  pillarTag_tonight: "Ночь",
  pillarTag_return_you: "Опора",
  pillarTag_quiet_warmth: "Тепло",

  pathIntro_nervous_system: "Снимает внутренний перегрев и возвращает контроль над дыханием и темпом.",
  pathIntro_sleep_deep_rest: "Переход к спокойному вечеру и более глубокому ночному восстановлению.",
  pathIntro_boundaries_confidence: "Собирает внутренний стержень перед рабочим и социальным напряжением.",
  pathIntro_emotional_care: "Помогает мягко завершить эмоционально тяжелый день.",
  pathIntro_body_embodiment: "Возвращает контакт с телом и устойчивое ощущение присутствия.",
  pathIntro_overload_cycle_care: "Короткие остановки, когда на вас слишком много ответственности.",
};

const EN: Dict = {
  brand: "Sora",
  shellTagline: "Telegram Mini App",
  shellPrivate: "Private Space",
  navAriaMain: "Main navigation",
  navHome: "Home",
  navPaths: "Paths",
  navGoals: "Rhythm",
  navProfile: "Profile",
  back: "Back",
  free: "Free",

  homeHeroAnonymous: "A calmer evening, on your terms.",
  homeHeroNamed: "{name}, a calmer evening, on your terms.",
  homeHeroLead: "One clear next step. No feed, no noise, no pressure.",
  homeTimeMorning: "Morning · soft entry",
  homeTimeAfternoon: "Day · quick reset",
  homeTimeEvening: "Evening · quiet descent",
  homePrimaryCta: "Start session",
  homePrimaryLockedCta: "Unlock Circle in bot",
  homeQuickPaths: "Catalog",
  homeQuickGoals: "Week",
  homeQuickMood: "State",
  homeSectionTodayKicker: "Today",
  homeSectionTodayTitle: "Best next step",
  homeCurrentKicker: "Recommended now",
  homeOpenHint: "Open now",
  homeUnlockHint: "Available in Circle",
  homeStudioKicker: "Studio",
  homeStudioTitle: "Your shortlist",
  homeStudioSub: "Continue where you left off and pick alternatives without visual overload.",
  homeContinueLabel: "Continue",
  homeContinueSub: "Resume from your previous session point",
  homeContinueEmptyTitle: "No history yet",
  homeContinueEmptySub: "Complete your first short session and your continuation will appear here.",
  homeTonightLabel: "Tonight",
  homeMoodKicker: "Precision",
  homeMoodTitle: "How you feel now",
  homeMoodSub: "Your selection updates recommendations and evening focus.",
  homePathsKicker: "Curated Paths",
  homePathsTitle: "Paths by emotional state",
  homePathsSub: "Not an endless list. Structured tracks with clear intent.",
  homePremiumKicker: "Circle",
  homePremiumTitle: "Full studio access",
  homePremiumSub: "Extended evening arcs, locked sessions, and the complete catalog.",
  homePremiumPoint1: "Full library access without truncated cards",
  homePremiumPoint2: "Long-form evening and night protocols",
  homePremiumPoint3: "Billing and subscription management in Telegram bot",
  homePremiumCta: "Continue in bot",
  homeWeekHint: "Three sessions a week is enough to keep momentum.",
  homeSupportKicker: "Important",
  homeSupportCopy: "Sora is not medical treatment or crisis support.",
  homeSupportLink: "Open support resources",

  onboardingEyebrow: "Entry",
  onboardingStepLine: "Step {current} of {total}",
  onboardingSkip: "Skip",
  onboardingS0Title: "This is your private space",
  onboardingS0Sub:
    "Short practices for emotional relief and self-connection. No therapy or medical claims.",
  onboardingS1Title: "Choose your current state",
  onboardingS1Sub: "We use it only to personalize your first recommendations.",
  onboardingS2Title: "What is inside",
  onboardingS2Sub: "A structured product, not a random meditation feed.",
  onboardingS3Title: "Your studio is ready",
  onboardingS3Sub: "Change your state at any time. You stay in control.",
  onboardingChipsLabel: "Closest to how you feel now:",
  onboardingMoodStress: "Too much tension",
  onboardingMoodTired: "Burnout and overload",
  onboardingMoodAnxiety: "Anxious mental noise",
  onboardingMoodBody: "Need to return to my body",
  onboardingFeature1: "5-18 minute sessions with explicit emotional intent",
  onboardingFeature2: "State-based paths: stress, evening, recovery, grounding",
  onboardingFeature3: "Circle: premium layer with full locked catalog",
  onboardingFinalNote: "You can stop any session instantly. Exit is always available.",
  onboardingContinueHint: "Continue without selection",
  onboardingContinue: "Enter studio",
  onboardingNext: "Next",

  goalsHeroKicker: "Rhythm",
  goalsHeroTitle: "Your weekly rhythm",
  goalsHeroSub: "Built around consistency, not perfection.",
  goalsStreak: "Streak days",
  goalsStreakHint: "Your continuity of care",
  goalsDrops: "Calm drops",
  goalsDropsHint: "Total completed sessions",
  goalsWeekKicker: "Weekly Focus",
  goalsWeekTitle: "Soft weekly target",
  goalsWeekSub: "Three sessions weekly is enough to keep self-connection active.",
  goalsWeeklyTarget: "Target: 3 sessions",
  goalsWeeklyHint: "More is welcome. Less is fine. Consistency matters most.",
  goalsToday: "Mark self-care today",
  goalsTodayDone: "Already marked today",

  profileTitle: "Profile settings",
  profileHeroKicker: "Profile",
  profileHeroTitle: "You and your studio",
  profilePremium: "Sora Circle",
  profilePremiumTitle: "Premium layer",
  profilePremiumSub: "Core mode is active. Upgrade any time.",
  profilePremiumBody: "Circle unlocks full catalog access, evening and night layers, plus advanced paths.",
  profilePremiumActive: "Circle is active",
  profileCircleBullet1: "All locked sessions and full-length programs",
  profileCircleBullet2: "Priority access to new drops",
  profileCircleBullet3: "Deeper evening protocols",
  profileUpgrade: "Unlock Circle in bot",
  profileManage: "Manage in bot",
  profileReminderTitle: "Reminders",
  profileReminderSub: "Choose tone for occasional bot reminders. Full opt-out is available.",
  profileReminderOff: "Off",
  profileReminderEvening: "Evening",
  profileReminderNight: "Night",
  profileLang: "Language",
  profileSensualSectionTitle: "Sensitive content",
  profileSensualSectionSub: "Shown only when you explicitly allow it.",
  profileSensualWelcome: "Soft default",
  profileSensualOptional: "On request",
  profileSensualHidden: "Hidden",
  profileEnvTelegram: "Mode: Telegram",
  profileEnvLocal: "Mode: local preview",
  profileAge: "21+ · adult-oriented product",
  profileCrisis: "Open support resources",

  pathsHeroKicker: "Catalog",
  pathsHeroTitle: "Editorially structured paths",
  pathsHeroSub: "Choose by state and outcome, not by noise.",
  pathSessions: "sessions",
  pathsLockedLabel: "locked",
  pathsOpenLabel: "available now",
  pathNotFound: "Path not found",
  pathNotFoundSub: "It may have changed. Return to the catalog and choose an active path.",

  sessionNotFound: "Session not found",
  sessionNotFoundSub: "Return to catalog and select another session.",
  sensualGateTitle: "Category hidden by your settings",
  sensualNote: "This category is disabled in profile. You can re-enable it manually at any time.",
  sessionAbout: "About this session",
  sessionMin: "min",
  sessionPremium: "Circle",
  playerTts: "Your device voice reads the script. Make sure Telegram sound is on.",
  playerPlay: "Play audio",
  playerPause: "Stop",
  sessionTranscript: "Session transcript",
  sessionJournal: "Journal prompt",
  sessionCompleteLine: "Session complete. Take 20 seconds before returning to your tasks.",

  premiumGateEyebrow: "Premium Access",
  premiumGateTitle: "This session is in Circle",
  premiumGateLead:
    "Full access lives in the premium layer with extended evening protocols and complete path structure.",
  premiumGateBullet1: "Unlimited access to locked sessions",
  premiumGateBullet2: "Extended evening and night formats",
  premiumGateBullet3: "Billing and management in Telegram bot",
  premiumGatePrivacy: "Sora is not medical treatment, therapy, or crisis support.",
  premiumGateCta: "Unlock Circle",
  premiumGateProfile: "Open profile",
  premiumGateLater: "Later",

  pillarLabel_still_mind: "Still Mind",
  pillarLabel_when_lot: "When It Is A Lot",
  pillarLabel_close_day: "Close The Day",
  pillarLabel_back_body: "Back To Body",
  pillarLabel_soft_evening: "Soft Evening",
  pillarLabel_tonight: "Tonight",
  pillarLabel_return_you: "Return To You",
  pillarLabel_quiet_warmth: "Quiet Warmth",

  pillarTag_still_mind: "Mind",
  pillarTag_when_lot: "Overload",
  pillarTag_close_day: "Day",
  pillarTag_back_body: "Body",
  pillarTag_soft_evening: "Evening",
  pillarTag_tonight: "Night",
  pillarTag_return_you: "Grounding",
  pillarTag_quiet_warmth: "Warmth",

  pathIntro_nervous_system: "Down-regulates internal overload and restores breathing control.",
  pathIntro_sleep_deep_rest: "A structured transition into deep evening rest.",
  pathIntro_boundaries_confidence: "Rebuilds internal posture before demanding days.",
  pathIntro_emotional_care: "Helps close emotionally heavy days with less residue.",
  pathIntro_body_embodiment: "Restores body contact and grounded presence.",
  pathIntro_overload_cycle_care: "Micro-pauses for days when too much depends on you.",
};

const PATH_TITLES: Record<string, { ru: string; en: string }> = {
  nervous_system: { ru: "Тихий ум", en: "Still Mind" },
  sleep_deep_rest: { ru: "Мягкий вечер и ночь", en: "Soft Evening & Night" },
  boundaries_confidence: { ru: "Вернуться к себе", en: "Return To You" },
  emotional_care: { ru: "Эмоциональный reset", en: "Emotional Reset" },
  body_embodiment: { ru: "Контакт с телом", en: "Body Reconnection" },
  overload_cycle_care: { ru: "Когда слишком много на вас", en: "When You Hold Too Much" },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  pathTitle: (id: string) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children, initialLang }: { children: ReactNode; initialLang: Lang }) {
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
