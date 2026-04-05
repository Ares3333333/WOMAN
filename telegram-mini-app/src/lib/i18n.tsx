import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

type Dict = Record<string, string>;

const RU: Dict = {
  brand: "Sora",
  shellTagline: "Telegram Mini App",
  shellStarter: "Core",
  shellCircle: "Circle",

  navAriaMain: "Основная навигация",
  navHome: "Главная",
  navPaths: "Пути",
  navGoals: "Ритм",
  navProfile: "Профиль",
  back: "Назад",
  free: "Free",

  tierFree: "Free",
  tierMixed: "Free + Circle",
  tierPremium: "Circle",

  homeHeroAnonymous: "Тихий вечер начинается здесь.",
  homeHeroNamed: "{name}, тихий вечер начинается здесь.",
  homeHeroLead: "Один точный следующий шаг, без ленты и лишнего шума.",
  homeTimeMorning: "Утро · мягкий вход",
  homeTimeAfternoon: "День · короткая перезагрузка",
  homeTimeEvening: "Вечер · плавное замедление",
  homePrimaryCta: "Запустить сессию",
  homePrimaryLockedCta: "Открыть Circle",
  homeQuickPaths: "Каталог",
  homeQuickGoals: "Неделя",
  homeQuickMood: "Состояние",

  homeSectionTodayKicker: "Сегодня",
  homeSectionTodayTitle: "Лучший следующий шаг",
  homeCurrentKicker: "Рекомендация",
  homeOpenHint: "Открыть сейчас",
  homeUnlockHint: "Полная версия в Circle",

  homeStudioKicker: "Studio",
  homeStudioTitle: "Ваши сессии",
  homeStudioSub: "Продолжение, вечерний фокус и альтернативы в одном слое.",
  homeContinueLabel: "Продолжить",
  homeContinueSub: "Там, где вы остановились в прошлый раз",
  homeContinueEmptyTitle: "История еще не началась",
  homeContinueEmptySub: "Сделайте первую сессию — и здесь появится персональное продолжение.",
  homeTonightLabel: "Фокус на вечер",

  homeMoodKicker: "Состояние",
  homeMoodTitle: "Как вы сейчас",
  homeMoodSub: "Ваш выбор влияет на рекомендации и подбор вечерних треков.",

  homePathsKicker: "Curated Paths",
  homePathsTitle: "Пути по реальным сценариям",
  homePathsSub: "Не бесконечная библиотека, а готовые дорожки под конкретные состояния.",

  homePremiumKicker: "Circle",
  homePremiumTitle: "Премиальная версия продукта",
  homePremiumSub: "Circle — это не «больше контента», а другой уровень структуры, глубины и непрерывности.",
  homePremiumPoint1: "Signature evening и night-протоколы до 22 минут",
  homePremiumPoint2: "Members-only пути с глубокой эмоциональной регуляцией",
  homePremiumPoint3: "Private-секции self-connection с consent-first подходом",
  homePremiumPoint4: "Структура, за которую платят как за персональную студию",
  homePremiumCta: "Открыть Circle в боте",
  homePremiumPrice: "$100/month · оплата и управление подпиской в Telegram-боте",

  homeValueUnlocked: "доступно сейчас",
  homeValueLocked: "закрытых сессий",
  homeValuePremiumPaths: "premium paths",
  homeValueSignature: "signature tracks",

  homeMemberKicker: "Circle Active",
  homeMemberTitle: "Вы в полной версии",
  homeMemberSub: "Открыты signature-пути, длинные вечерние треки и members-only библиотека.",

  homeWeekHint: "Три сессии в неделю — рабочий минимум для устойчивого эффекта.",
  homeSupportKicker: "Важно",
  homeSupportCopy: "Sora — emotional wellness продукт, не медицинская и не кризисная помощь.",
  homeSupportLink: "Ресурсы поддержки",

  onboardingEyebrow: "Вход",
  onboardingStepLine: "Шаг {current} из {total}",
  onboardingSkip: "Пропустить",
  onboardingS0Title: "Ваше личное пространство внутри Telegram",
  onboardingS0Sub: "Короткие и длинные аудиопрактики для эмоциональной разгрузки и самоконтакта.",
  onboardingS1Title: "Сначала выберите текущее состояние",
  onboardingS1Sub: "Это нужно, чтобы первая рекомендация попала в точку уже сегодня.",
  onboardingS2Title: "Как устроен продукт",
  onboardingS2Sub: "Free дает сильный вход. Circle дает глубину, структуру и долгую вечернюю дугу.",
  onboardingS3Title: "Готово",
  onboardingS3Sub: "Вы можете менять состояние и маршрут в любой момент — контроль всегда у вас.",
  onboardingChipsLabel: "Сейчас ближе всего:",
  onboardingMoodStress: "Перегрев и напряжение",
  onboardingMoodTired: "Эмоциональная усталость",
  onboardingMoodAnxiety: "Тревожный фон",
  onboardingMoodBody: "Нужен контакт с телом",
  onboardingFreeLabel: "Free",
  onboardingFreeCopy: "База: рабочие короткие сессии, опора на день, чистый вход без хаоса.",
  onboardingPremiumLabel: "Circle",
  onboardingPremiumCopy: "Премиум-слой: signature evening, sleep коллекции, members-only пути и приватные треки.",
  onboardingFinalNote: "Выход из любой практики доступен мгновенно. Здесь нет давления и обязательных форматов.",
  onboardingContinueHint: "Продолжить без выбора",
  onboardingContinue: "Войти в студию",
  onboardingNext: "Дальше",

  pathsHeroKicker: "Catalog",
  pathsHeroTitle: "Пути с четкой логикой",
  pathsHeroSub: "Каждый путь решает конкретную задачу: от быстрой стабилизации до глубокого вечернего восстановления.",
  pathSessions: "сессий",
  pathsLockedLabel: "locked",
  pathsOpenLabel: "все доступно",
  pathsSignature: "Signature",
  pathsPreviewCount: "Free preview: {count}",
  pathsMembersOnly: "Только для Circle",
  pathsLockedHint: "Закрыто в Free: {count}",
  pathsPremiumGateTitle: "Этот путь целиком в Circle",
  pathsPremiumGateSub: "Вы получите полный маршрут с длинными треками, вечерней архитектурой и непрерывной логикой прохождения.",
  pathsPremiumGateCta: "Открыть Circle",
  pathsMembersOnlyHint: "Этот маршрут доступен только участницам Circle и входит в premium-program layer.",
  pathNotFound: "Путь не найден",
  pathNotFoundSub: "Возможно, структура каталога обновилась. Вернитесь назад и выберите актуальный путь.",

  goalsHeroKicker: "Rhythm",
  goalsHeroTitle: "Ваш недельный ритм",
  goalsHeroSub: "Не гонка за результатом, а стабильный контур поддержки себя.",
  goalsStreak: "Дней подряд",
  goalsStreakHint: "Непрерывность заботы о себе",
  goalsDrops: "Calm drops",
  goalsDropsHint: "Сумма завершенных сессий",
  goalsWeekKicker: "Weekly Focus",
  goalsWeekTitle: "Цель на неделю",
  goalsWeekSub: "3 сессии в неделю — рабочая норма для устойчивого эффекта.",
  goalsWeeklyTarget: "Цель: 3 сессии",
  goalsWeeklyHint: "Можно больше, можно меньше. Важнее возвращаться регулярно.",
  goalsToday: "Отметить заботу о себе сегодня",
  goalsTodayDone: "Сегодня уже отмечено",
  goalsPremiumKicker: "Circle Continuity",
  goalsPremiumTitle: "Следующий премиальный шаг",
  goalsPremiumSub: "Используйте длинные guided-треки, чтобы не терять глубину между днями.",
  goalsPremiumNext: "Открыть следующий трек",
  goalsPremiumDone: "Вы уже закрыли доступные премиальные треки. Отличный ритм.",
  goalsPremiumLockedTitle: "Circle добавляет уровень глубины",
  goalsPremiumLockedSub: "В полной версии доступны длинные вечерние протоколы и members-only continuity paths.",

  profileTitle: "Профиль",
  profileHeroKicker: "Profile",
  profileHeroTitle: "Вы и ваша студия",
  profilePremium: "Sora Circle",
  profilePremiumTitle: "Премиальная программа",
  profilePremiumSub: "Сейчас активен базовый режим. Circle открывает полную систему.",
  profilePremiumBody: "Circle = длинные ритуалы, structured journeys, private-пакет и приоритетный premium-контент.",
  profilePremiumActive: "Circle активен",
  profilePremiumPrice: "$100/month · формат личной premium-студии",
  profilePremiumStatSessions: "premium sessions",
  profilePremiumStatPaths: "premium paths",
  profilePremiumStatSignature: "signature lines",
  profileCircleBullet1: "Глубокие evening/sleep протоколы до 22 минут",
  profileCircleBullet2: "Members-only коллекции с последовательной логикой",
  profileCircleBullet3: "Private self-connection треки в деликатной подаче",
  profileUpgrade: "Подключить Circle",
  profileManage: "Управление подпиской",

  profileReminderTitle: "Напоминания",
  profileReminderSub: "Редкие сообщения от бота, чтобы поддерживать ритм без навязчивости.",
  profileReminderOff: "Выкл",
  profileReminderEvening: "Вечер",
  profileReminderNight: "Ночь",

  profileLang: "Язык",

  profileSensualSectionTitle: "Private контент",
  profileSensualSectionSub: "Чувствительный контент появляется только по вашему прямому выбору.",
  profileSensualWelcome: "Мягкий default",
  profileSensualOptional: "Только по запросу",
  profileSensualHidden: "Скрыть полностью",

  profileEnvTelegram: "Среда: Telegram",
  profileEnvLocal: "Среда: локальный предпросмотр",
  profileAge: "21+ · продукт для взрослой аудитории",
  profileCrisis: "Открыть ресурсы поддержки",

  sessionNotFound: "Сессия не найдена",
  sessionNotFoundSub: "Вернитесь в каталог и выберите другой трек.",
  sensualGateTitle: "Категория скрыта в настройках",
  sensualNote: "Этот раздел выключен в профиле. Вы можете включить его вручную в любой момент.",
  sessionAbout: "О сессии",
  sessionMin: "мин",
  sessionPremium: "Circle",

  playerSourceAudio: "Recorded Audio",
  playerSourceVoice: "Voice Fallback",
  playerAudioReady: "Аудиофайл подключен",
  playerAudioPending: "Аудио пока не загружено — работает fallback",
  playerSpeed: "Скорость",
  playerPlay: "Play",
  playerResume: "Resume",
  playerPause: "Pause",
  playerStop: "Stop",
  playerRestart: "Restart",
  playerHint: "Если вы добавите аудиофайл в session.audio.src, плеер автоматически переключится на реальную запись.",

  sessionTranscript: "Транскрипт",
  sessionJournal: "Вопрос для заметки",
  sessionCompleteLine: "Сессия завершена. Дайте себе еще 20 секунд тишины перед возвращением к делам.",

  premiumGateEyebrow: "Premium Access",
  premiumGateTitle: "Эта сессия входит в Circle",
  premiumGateLead: "В Circle вы получаете не только больше треков, а полноценную премиальную структуру восстановления.",
  premiumGateBullet1: "Длинные guided-сессии с реальной глубиной",
  premiumGateBullet2: "Signature evening и sleep линии",
  premiumGateBullet3: "Members-only пути и curated continuity",
  premiumGateBullet4: "Private layer для деликатного self-connection",
  premiumGatePrivacy: "Sora не заменяет медицину, терапию или кризисную помощь.",
  premiumGateCta: "Открыть Circle",
  premiumGateProfile: "Профиль и настройки",
  premiumGateLater: "Позже",

  pillarLabel_still_mind: "Тихий ум",
  pillarLabel_when_lot: "Когда всего слишком много",
  pillarLabel_close_day: "Закрыть день",
  pillarLabel_back_body: "Вернуться в тело",
  pillarLabel_soft_evening: "Мягкий вечер",
  pillarLabel_tonight: "На эту ночь",
  pillarLabel_return_you: "Вернуться к себе",
  pillarLabel_quiet_warmth: "Тихое тепло",

  pillarTag_still_mind: "Mind",
  pillarTag_when_lot: "Overload",
  pillarTag_close_day: "Reset",
  pillarTag_back_body: "Body",
  pillarTag_soft_evening: "Evening",
  pillarTag_tonight: "Night",
  pillarTag_return_you: "Boundaries",
  pillarTag_quiet_warmth: "Private",

  pathIntro_nervous_system: "Быстрые и средние треки для снятия острого напряжения и возврата контроля.",
  pathIntro_overload_cycle_care: "Когда задач слишком много: стабилизация, фокус и минимальный рабочий ресурс.",
  pathIntro_emotional_care: "Восстановление после эмоционально тяжелых событий и новостного перегруза.",
  pathIntro_body_embodiment: "Контакт с телом, дыханием и сигналами безопасности без давления.",
  pathIntro_boundaries_confidence: "Собранность, границы и уверенный тон в сложных коммуникациях.",
  pathIntro_sleep_deep_rest: "Переход в ночной режим и восстановление сна после сложных дней.",
  pathIntro_signature_evening_rituals: "Signature-путь: вечерняя архитектура от downshift до спокойного засыпания.",
  pathIntro_premium_sleep_collection: "Премиальная коллекция самых глубоких sleep-протоколов приложения.",
  pathIntro_private_self_connection: "Private-слой self-connection с деликатным consent-first подходом.",
};

const EN: Dict = {
  brand: "Sora",
  shellTagline: "Telegram Mini App",
  shellStarter: "Core",
  shellCircle: "Circle",

  navAriaMain: "Main navigation",
  navHome: "Home",
  navPaths: "Paths",
  navGoals: "Rhythm",
  navProfile: "Profile",
  back: "Back",
  free: "Free",

  tierFree: "Free",
  tierMixed: "Free + Circle",
  tierPremium: "Circle",

  homeHeroAnonymous: "A quieter evening starts here.",
  homeHeroNamed: "{name}, a quieter evening starts here.",
  homeHeroLead: "One precise next step. No feed, no clutter, no pressure.",
  homeTimeMorning: "Morning · soft entry",
  homeTimeAfternoon: "Day · compact reset",
  homeTimeEvening: "Evening · smooth downshift",
  homePrimaryCta: "Start session",
  homePrimaryLockedCta: "Unlock Circle",
  homeQuickPaths: "Catalog",
  homeQuickGoals: "Week",
  homeQuickMood: "State",

  homeSectionTodayKicker: "Today",
  homeSectionTodayTitle: "Best next step",
  homeCurrentKicker: "Recommendation",
  homeOpenHint: "Open now",
  homeUnlockHint: "Full version in Circle",

  homeStudioKicker: "Studio",
  homeStudioTitle: "Your sessions",
  homeStudioSub: "Continuation, evening focus, and alternates in one layer.",
  homeContinueLabel: "Continue",
  homeContinueSub: "Where you paused last time",
  homeContinueEmptyTitle: "No history yet",
  homeContinueEmptySub: "Complete your first session and personalized continuation will appear here.",
  homeTonightLabel: "Evening focus",

  homeMoodKicker: "State",
  homeMoodTitle: "How you feel now",
  homeMoodSub: "Your selection updates recommendations and evening track logic.",

  homePathsKicker: "Curated Paths",
  homePathsTitle: "Paths by real-life scenarios",
  homePathsSub: "Not an endless library. Structured tracks for specific emotional states.",

  homePremiumKicker: "Circle",
  homePremiumTitle: "Premium product layer",
  homePremiumSub: "Circle is not just more content. It is a deeper structure, stronger continuity, and premium guidance.",
  homePremiumPoint1: "Signature evening and night protocols up to 22 minutes",
  homePremiumPoint2: "Members-only paths for deeper emotional regulation",
  homePremiumPoint3: "Private self-connection sections with consent-first framing",
  homePremiumPoint4: "A premium studio-level experience worth a high-ticket subscription",
  homePremiumCta: "Open Circle in bot",
  homePremiumPrice: "$100/month · billing and subscription management in Telegram bot",

  homeValueUnlocked: "available now",
  homeValueLocked: "locked sessions",
  homeValuePremiumPaths: "premium paths",
  homeValueSignature: "signature lines",

  homeMemberKicker: "Circle Active",
  homeMemberTitle: "You are in full access",
  homeMemberSub: "Signature paths, long evening tracks, and members-only library are unlocked.",

  homeWeekHint: "Three sessions per week is enough to maintain a stable effect.",
  homeSupportKicker: "Important",
  homeSupportCopy: "Sora is an emotional wellness product, not medical or crisis care.",
  homeSupportLink: "Support resources",

  onboardingEyebrow: "Entry",
  onboardingStepLine: "Step {current} of {total}",
  onboardingSkip: "Skip",
  onboardingS0Title: "Your private space inside Telegram",
  onboardingS0Sub: "Short and long audio practices for emotional reset and self-connection.",
  onboardingS1Title: "Start with your current state",
  onboardingS1Sub: "We use it to make your first recommendation relevant right away.",
  onboardingS2Title: "How the product is structured",
  onboardingS2Sub: "Free gives a strong entry. Circle gives depth, continuity, and premium evening architecture.",
  onboardingS3Title: "Ready",
  onboardingS3Sub: "You can change state and route at any time. Control stays with you.",
  onboardingChipsLabel: "Closest to your current state:",
  onboardingMoodStress: "Overheated and tense",
  onboardingMoodTired: "Emotionally exhausted",
  onboardingMoodAnxiety: "Anxious background",
  onboardingMoodBody: "Need body reconnection",
  onboardingFreeLabel: "Free",
  onboardingFreeCopy: "Solid entry: effective short sessions, daily grounding, clear structure.",
  onboardingPremiumLabel: "Circle",
  onboardingPremiumCopy: "Premium layer: signature evenings, sleep collections, members-only paths, private tracks.",
  onboardingFinalNote: "You can exit any session instantly. No pressure, no forced format.",
  onboardingContinueHint: "Continue without selection",
  onboardingContinue: "Enter studio",
  onboardingNext: "Next",

  pathsHeroKicker: "Catalog",
  pathsHeroTitle: "Paths with clear architecture",
  pathsHeroSub: "Each path solves a specific need, from quick stabilization to deep evening recovery.",
  pathSessions: "sessions",
  pathsLockedLabel: "locked",
  pathsOpenLabel: "fully available",
  pathsSignature: "Signature",
  pathsPreviewCount: "Free preview: {count}",
  pathsMembersOnly: "Members only",
  pathsLockedHint: "Locked in Free: {count}",
  pathsPremiumGateTitle: "This path is fully in Circle",
  pathsPremiumGateSub: "Circle unlocks full route continuity, long-form tracks, and premium evening architecture.",
  pathsPremiumGateCta: "Unlock Circle",
  pathsMembersOnlyHint: "This route is part of the members-only premium program layer.",
  pathNotFound: "Path not found",
  pathNotFoundSub: "Catalog structure may have changed. Go back and select an active path.",

  goalsHeroKicker: "Rhythm",
  goalsHeroTitle: "Your weekly rhythm",
  goalsHeroSub: "Not a performance race. A stable framework for self-support.",
  goalsStreak: "Streak days",
  goalsStreakHint: "Continuity of care",
  goalsDrops: "Calm drops",
  goalsDropsHint: "Total completed sessions",
  goalsWeekKicker: "Weekly Focus",
  goalsWeekTitle: "Weekly target",
  goalsWeekSub: "Three sessions per week is a practical baseline for steady effect.",
  goalsWeeklyTarget: "Target: 3 sessions",
  goalsWeeklyHint: "More is welcome, less is still valid. Consistency is the key.",
  goalsToday: "Mark self-care today",
  goalsTodayDone: "Already marked today",
  goalsPremiumKicker: "Circle Continuity",
  goalsPremiumTitle: "Next premium move",
  goalsPremiumSub: "Use long guided tracks to preserve depth across the week.",
  goalsPremiumNext: "Open next track",
  goalsPremiumDone: "You completed available premium tracks. Strong rhythm.",
  goalsPremiumLockedTitle: "Circle adds depth",
  goalsPremiumLockedSub: "Full version includes long evening protocols and members-only continuity paths.",

  profileTitle: "Profile",
  profileHeroKicker: "Profile",
  profileHeroTitle: "You and your studio",
  profilePremium: "Sora Circle",
  profilePremiumTitle: "Premium program",
  profilePremiumSub: "Core mode is active. Circle unlocks the full system.",
  profilePremiumBody: "Circle = long rituals, structured journeys, private package, and priority premium drops.",
  profilePremiumActive: "Circle is active",
  profilePremiumPrice: "$100/month · premium personal studio format",
  profilePremiumStatSessions: "premium sessions",
  profilePremiumStatPaths: "premium paths",
  profilePremiumStatSignature: "signature lines",
  profileCircleBullet1: "Deep evening and sleep protocols up to 22 minutes",
  profileCircleBullet2: "Members-only collections with sequence logic",
  profileCircleBullet3: "Private self-connection tracks in a refined tone",
  profileUpgrade: "Unlock Circle",
  profileManage: "Manage subscription",

  profileReminderTitle: "Reminders",
  profileReminderSub: "Occasional bot prompts to keep rhythm without noise.",
  profileReminderOff: "Off",
  profileReminderEvening: "Evening",
  profileReminderNight: "Night",

  profileLang: "Language",

  profileSensualSectionTitle: "Private content",
  profileSensualSectionSub: "Sensitive content appears only if you explicitly allow it.",
  profileSensualWelcome: "Soft default",
  profileSensualOptional: "On request",
  profileSensualHidden: "Hide fully",

  profileEnvTelegram: "Environment: Telegram",
  profileEnvLocal: "Environment: local preview",
  profileAge: "21+ · adult audience product",
  profileCrisis: "Open support resources",

  sessionNotFound: "Session not found",
  sessionNotFoundSub: "Return to catalog and choose another track.",
  sensualGateTitle: "Category hidden in settings",
  sensualNote: "This section is disabled in your profile. You can enable it manually any time.",
  sessionAbout: "About this session",
  sessionMin: "min",
  sessionPremium: "Circle",

  playerSourceAudio: "Recorded Audio",
  playerSourceVoice: "Voice Fallback",
  playerAudioReady: "Audio file connected",
  playerAudioPending: "Audio not uploaded yet — fallback mode is active",
  playerSpeed: "Speed",
  playerPlay: "Play",
  playerResume: "Resume",
  playerPause: "Pause",
  playerStop: "Stop",
  playerRestart: "Restart",
  playerHint: "Once you provide session.audio.src, the player automatically switches to real uploaded audio.",

  sessionTranscript: "Transcript",
  sessionJournal: "Journal prompt",
  sessionCompleteLine: "Session complete. Give yourself 20 more seconds of quiet before returning.",

  premiumGateEyebrow: "Premium Access",
  premiumGateTitle: "This session is part of Circle",
  premiumGateLead: "Circle is not just more tracks. It is a premium recovery structure with deeper continuity.",
  premiumGateBullet1: "Long guided sessions with real depth",
  premiumGateBullet2: "Signature evening and sleep lines",
  premiumGateBullet3: "Members-only paths and curated continuity",
  premiumGateBullet4: "Private layer for refined self-connection",
  premiumGatePrivacy: "Sora does not replace medical treatment, therapy, or crisis services.",
  premiumGateCta: "Unlock Circle",
  premiumGateProfile: "Profile & settings",
  premiumGateLater: "Later",

  pillarLabel_still_mind: "Still Mind",
  pillarLabel_when_lot: "When It Is Too Much",
  pillarLabel_close_day: "Close The Day",
  pillarLabel_back_body: "Back To Body",
  pillarLabel_soft_evening: "Soft Evening",
  pillarLabel_tonight: "Tonight",
  pillarLabel_return_you: "Return To You",
  pillarLabel_quiet_warmth: "Quiet Warmth",

  pillarTag_still_mind: "Mind",
  pillarTag_when_lot: "Overload",
  pillarTag_close_day: "Reset",
  pillarTag_back_body: "Body",
  pillarTag_soft_evening: "Evening",
  pillarTag_tonight: "Night",
  pillarTag_return_you: "Boundaries",
  pillarTag_quiet_warmth: "Private",

  pathIntro_nervous_system: "Quick and mid-length tracks for reducing acute stress and regaining control.",
  pathIntro_overload_cycle_care: "When everything is too much: stabilize, focus, and protect minimum capacity.",
  pathIntro_emotional_care: "Recover after emotionally heavy events and information overload.",
  pathIntro_body_embodiment: "Body contact, breath, and safety signals without pressure.",
  pathIntro_boundaries_confidence: "Composure, boundaries, and clear voice in demanding interactions.",
  pathIntro_sleep_deep_rest: "Transition into night mode and deeper recovery sleep.",
  pathIntro_signature_evening_rituals: "Signature evening architecture from downshift to calm sleep entry.",
  pathIntro_premium_sleep_collection: "Premium collection of the deepest sleep protocols in the app.",
  pathIntro_private_self_connection: "Private self-connection layer in a consent-first tone.",
};

const PATH_TITLES: Record<string, { ru: string; en: string }> = {
  nervous_system: { ru: "Нервная система · база", en: "Nervous System · Core" },
  overload_cycle_care: { ru: "Антиперегруз", en: "Overload Control" },
  emotional_care: { ru: "Эмоциональное восстановление", en: "Emotional Recovery" },
  body_embodiment: { ru: "Контакт с телом", en: "Body Reconnection" },
  boundaries_confidence: { ru: "Границы и уверенность", en: "Boundaries & Composure" },
  sleep_deep_rest: { ru: "Сон и ночное восстановление", en: "Sleep & Night Recovery" },
  signature_evening_rituals: { ru: "Signature Evening", en: "Signature Evening" },
  premium_sleep_collection: { ru: "Premium Sleep Collection", en: "Premium Sleep Collection" },
  private_self_connection: { ru: "Private Self-Connection", en: "Private Self-Connection" },
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
