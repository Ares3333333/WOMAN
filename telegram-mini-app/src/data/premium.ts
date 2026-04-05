export type Localized = { ru: string; en: string };

export type CircleFeature = {
  id: string;
  title: Localized;
  summary: Localized;
};

export const CIRCLE_FEATURES: CircleFeature[] = [
  {
    id: "signature-library",
    title: {
      ru: "Signature Library",
      en: "Signature Library",
    },
    summary: {
      ru: "Длинные вечерние и ночные треки, записанные как цельные ритуалы, а не отдельные фрагменты.",
      en: "Long-form evening and night tracks designed as complete rituals, not isolated fragments.",
    },
  },
  {
    id: "rhythm-tracker",
    title: {
      ru: "Rhythm Tracker",
      en: "Rhythm Tracker",
    },
    summary: {
      ru: "Персональные рекомендации на основе вашего ритма, сна и текущей эмоциональной нагрузки.",
      en: "Personal recommendations based on your rhythm, sleep quality, and current emotional load.",
    },
  },
  {
    id: "continuity-layer",
    title: {
      ru: "Continuity Layer",
      en: "Continuity Layer",
    },
    summary: {
      ru: "Связанные маршруты на 3-4 недели, чтобы эффект практик накапливался, а не обрывался.",
      en: "Linked 3-4 week routes so practice effects accumulate instead of resetting each day.",
    },
  },
  {
    id: "concierge-layer",
    title: {
      ru: "Curated Concierge",
      en: "Curated Concierge",
    },
    summary: {
      ru: "Тихий private-слой с vetted партнерскими сервисами: массаж, терапия, spa и support.",
      en: "A quiet private layer with vetted partner services: massage, therapy, spa, and support.",
    },
  },
];

export const CIRCLE_INCLUDED_ITEMS: Localized[] = [
  {
    ru: "Еженедельная персональная траектория из 3 практик",
    en: "Weekly personalized 3-session trajectory",
  },
  {
    ru: "Доступ к premium коллекциям и длинным evening протоколам",
    en: "Access to premium collections and long-form evening protocols",
  },
  {
    ru: "Приоритетный канал concierge-запросов внутри Telegram",
    en: "Priority concierge request channel inside Telegram",
  },
  {
    ru: "История ритма и прогресса для более точных рекомендаций",
    en: "Rhythm and progress history for more precise recommendations",
  },
];
