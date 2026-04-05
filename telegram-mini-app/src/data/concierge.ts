export type Localized = { ru: string; en: string };

export type ConciergeService = {
  id: string;
  category: "body" | "mind" | "rest" | "medical-check" | "support";
  title: Localized;
  summary: Localized;
  priceFromUsd: number;
  bookingHint: Localized;
  premiumBenefit: Localized;
};

export const CONCIERGE_SERVICES: ConciergeService[] = [
  {
    id: "massage-reset",
    category: "body",
    title: {
      ru: "Восстанавливающий массаж",
      en: "Body Reset Massage",
    },
    summary: {
      ru: "Партнерские студии с тихой атмосферой, вечерними окнами и мягким восстановлением после перегруза.",
      en: "Partner studios with calm atmosphere, evening slots, and gentle post-overload recovery.",
    },
    priceFromUsd: 85,
    bookingHint: {
      ru: "Подбор локации и слота через concierge внутри Telegram",
      en: "Location and slot selection through in-app Telegram concierge",
    },
    premiumBenefit: {
      ru: "Участницам Circle: приоритетные окна и curated shortlist без спама",
      en: "For Circle members: priority slots and curated shortlist without spam",
    },
  },
  {
    id: "therapist-match",
    category: "mind",
    title: {
      ru: "Подбор психолога",
      en: "Quiet Therapist Match",
    },
    summary: {
      ru: "Аккуратный подбор психолога под запрос: тревожный фон, истощение, границы, поддержка в переходах.",
      en: "Careful therapist matching for anxiety background, exhaustion, boundaries, and transition support.",
    },
    priceFromUsd: 140,
    bookingHint: {
      ru: "Concierge задает 3 коротких вопроса и возвращает персональный shortlist",
      en: "Concierge asks 3 short questions and returns a personal shortlist",
    },
    premiumBenefit: {
      ru: "Для Circle: расширенный shortlist и warm intro, без публичного каталога",
      en: "For Circle: expanded shortlist and warm intro without public marketplace noise",
    },
  },
  {
    id: "spa-recovery-window",
    category: "rest",
    title: {
      ru: "Recovery SPA Window",
      en: "Recovery Spa Window",
    },
    summary: {
      ru: "Короткие восстановительные spa-окна, когда телу нужен глубокий спад нагрузки.",
      en: "Short restorative spa windows when your body needs a deeper load drop.",
    },
    priceFromUsd: 110,
    bookingHint: {
      ru: "Формат: 60-90 минут, подбор по району и времени",
      en: "Format: 60-90 min, selected by area and time",
    },
    premiumBenefit: {
      ru: "Для Circle: проверенные партнеры и приоритет на вечерние слоты",
      en: "For Circle: vetted partners and priority on evening slots",
    },
  },
  {
    id: "sleep-consult",
    category: "medical-check",
    title: {
      ru: "Консультация по вечернему режиму",
      en: "Sleep Routine Consult",
    },
    summary: {
      ru: "Немедицинская консультация по вечернему ритму и среде сна с практичными шагами на 2 недели.",
      en: "Non-medical consultation on evening rhythm and sleep environment with practical 2-week steps.",
    },
    priceFromUsd: 120,
    bookingHint: {
      ru: "Онлайн-формат, короткий pre-brief и ясный post-plan",
      en: "Online format with short pre-brief and clear post-plan",
    },
    premiumBenefit: {
      ru: "Для Circle: шаблон плана сна внутри профиля и follow-up через 10 дней",
      en: "For Circle: in-profile sleep plan template and a 10-day follow-up",
    },
  },
  {
    id: "women-support-network",
    category: "support",
    title: {
      ru: "Кураторская сеть поддержки",
      en: "Women Support Network",
    },
    summary: {
      ru: "Кураторский доступ к надежным специалистам для поддержки в эмоционально сложные периоды.",
      en: "Curated access to trusted specialists for support during emotionally intense periods.",
    },
    priceFromUsd: 95,
    bookingHint: {
      ru: "Подбор без витрины: только релевантные контакты под ваш запрос",
      en: "No open marketplace: only relevant contacts for your request",
    },
    premiumBenefit: {
      ru: "Для Circle: приоритетный ответ concierge и приватная коммуникация",
      en: "For Circle: priority concierge response and private communication",
    },
  },
];

