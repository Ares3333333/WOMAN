export type ScriptBlock = { ru: string; en: string };

export type SessionScript = {
  intro: ScriptBlock;
  settling: ScriptBlock;
  breath: ScriptBlock;
  body: ScriptBlock;
  affirm: ScriptBlock;
  close: ScriptBlock;
  journal?: ScriptBlock;
};

/** Premium content architecture — maps to i18n pillarLabel_* */
export type ContentPillarId =
  | "still_mind"
  | "when_lot"
  | "close_day"
  | "back_body"
  | "soft_evening"
  | "tonight"
  | "return_you"
  | "quiet_warmth";

export type MiniSession = {
  slug: string;
  title: ScriptBlock;
  short: ScriptBlock;
  durationMin: number;
  freeTier: boolean;
  gradient: "rose" | "mauve" | "sleep" | "sage" | "dusk";
  /** Legacy category for scripts / analytics */
  categorySlug: string;
  pillarId: ContentPillarId;
  /** Boost in «evening / tonight» home picks */
  eveningHint?: boolean;
  sensual: boolean;
  script: SessionScript;
};

const settling: ScriptBlock = {
  ru: "Выбери опору для тела. Смягчи челюсть, опусти плечи. Можно менять позу — это твоё пространство.",
  en: "Find support for your body. Soften your jaw, let shoulders drop. Adjust anytime — this is your space.",
};

const breath: ScriptBlock = {
  ru: "Вдох спокойно через нос. Выдох чуть длиннее через рот, как будто запотевает стекло. Без напряжения.",
  en: "Inhale gently through the nose. Exhale a little longer through the mouth, like fogging glass. Easy.",
};

const body: ScriptBlock = {
  ru: "Заметь, где тело касается опоры. Назови одно нейтральное ощущение: тепло, вес или движение рёбер.",
  en: "Notice where you meet the surface. Name one neutral sensation: warmth, weight, or ribs moving.",
};

const affirm: ScriptBlock = {
  ru: "Здесь не нужно ничего исправлять. Спокойствие — не выступление, а разрешение быть с собой мягко.",
  en: "Nothing here needs fixing. Calm is not a performance — it is permission to be present, gently.",
};

const close: ScriptBlock = {
  ru: "Сделай чуть более глубокий вдох. Когда будешь готова, пошевели пальцами. Возьми с собой каплю мягкости.",
  en: "Take one slightly deeper breath. When ready, wiggle fingers and toes. Carry a small pocket of softness.",
};

export const SESSIONS: MiniSession[] = [
  {
    slug: "five-minute-nervous-system-reset",
    title: {
      ru: "Пять минут, чтобы размотать",
      en: "Five minutes to unspool",
    },
    short: {
      ru: "Мало времени, а внутри всё ещё на взводе.",
      en: "When you are short on time but your wiring is still turned up.",
    },
    durationMin: 5,
    freeTier: true,
    gradient: "rose",
    categorySlug: "stress-relief",
    pillarId: "still_mind",
    sensual: false,
    script: {
      intro: {
        ru: "Небольшая пауза для нервной системы. Двигаемся только так, как добро телу.",
        en: "A brief pause for your nervous system. Move only in ways that feel kind.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
      journal: { ru: "Что стало на 1% мягче?", en: "What felt 1% softer?" },
    },
  },
  {
    slug: "when-everything-feels-too-much",
    title: { ru: "Когда всего слишком", en: "When everything feels too much" },
    short: {
      ru: "Мягкое удержание, когда перегруз громкий.",
      en: "Gentle containment when overwhelm is loud.",
    },
    durationMin: 12,
    freeTier: true,
    gradient: "mauve",
    categorySlug: "stress-relief",
    pillarId: "when_lot",
    sensual: false,
    script: {
      intro: {
        ru: "Если кажется, что всего слишком — это не провал, система просит медленнее.",
        en: "If everything feels like too much, you are not failing — your system is asking for slowness.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
      journal: { ru: "Какая граница была бы сейчас самой доброй?", en: "What boundary would feel kindest now?" },
    },
  },
  {
    slug: "when-anxiety-surges-breath-anchor",
    title: { ru: "Волна — и якорь", en: "Surge, then anchor" },
    short: {
      ru: "Дыхание и чувства под рукой, когда тревога громкая — темп задаёте вы.",
      en: "Portable breath and senses when worry runs hot — you set the pace.",
    },
    durationMin: 8,
    freeTier: true,
    gradient: "sage",
    categorySlug: "breathing",
    pillarId: "still_mind",
    sensual: false,
    script: {
      intro: {
        ru: "Тревога может быть громкой — мы не спорим с ней, мы даём телу сигнал безопасности.",
        en: "Anxiety can be loud — we are not arguing with it; we offer the body a cue of safety.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
    },
  },
  {
    slug: "reconnect-with-your-breath",
    title: { ru: "Дыхание как домашняя точка", en: "Breath as your home base" },
    short: { ru: "Якорь, который можно украсть в любом месте.", en: "A portable anchor you can steal anywhere." },
    durationMin: 10,
    freeTier: false,
    gradient: "rose",
    categorySlug: "breathing",
    pillarId: "still_mind",
    sensual: false,
    script: {
      intro: {
        ru: "Дыхание — мост между умом и телом. Не нужно «правильно», нужно по-честному.",
        en: "Breath is a bridge between mind and body. Honest beats perfect.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
    },
  },
  {
    slug: "grounding-before-bed",
    title: { ru: "Пусть ночь примет", en: "Let the night receive you" },
    short: {
      ru: "Маленькие опоры, пока ум хочет пересказать день.",
      en: "Small anchors while the mind still wants to narrate the day.",
    },
    durationMin: 14,
    freeTier: false,
    gradient: "sleep",
    categorySlug: "sleep",
    pillarId: "soft_evening",
    eveningHint: true,
    sensual: false,
    script: {
      intro: {
        ru: "Переход ко сну — не отчёт о продуктивности, а разрешение отпустить бодрствование.",
        en: "Bedtime is not a productivity report — it is permission to release the day.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
    },
  },
  {
    slug: "sleep-after-an-emotionally-hard-day",
    title: { ru: "Сон после эмоционально тяжёлого дня", en: "Sleep after an emotionally hard day" },
    short: {
      ru: "Пусть сердце опустится, прежде чем погаснет свет.",
      en: "Let the heart land before the lights go out.",
    },
    durationMin: 18,
    freeTier: false,
    gradient: "sleep",
    categorySlug: "sleep",
    pillarId: "tonight",
    eveningHint: true,
    sensual: false,
    script: {
      intro: {
        ru: "Пусть день смягчится по краям. Не обязательно всё решить до отдыха.",
        en: "Let the day soften at the edges. You do not have to resolve everything before rest.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
      journal: {
        ru: "Что ты готова отложить до утра?",
        en: "What are you willing to set down until morning?",
      },
    },
  },
  {
    slug: "morning-confidence-reset",
    title: { ru: "Утро без брони", en: "Morning without the armor" },
    short: {
      ru: "Ровный язык до того, как день попросит маску.",
      en: "Steady language before the day asks you to perform.",
    },
    durationMin: 8,
    freeTier: false,
    gradient: "dusk",
    categorySlug: "confidence",
    pillarId: "return_you",
    sensual: false,
    script: {
      intro: {
        ru: "Уверенность не всегда громкая — иногда это ровный внутренний тон.",
        en: "Confidence is not always loud — sometimes it is a steady inner tone.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
    },
  },
  {
    slug: "after-hard-news-softening",
    title: { ru: "После тяжёлых новостей — удержать себя", en: "After hard news — holding yourself" },
    short: {
      ru: "Когда мир сужается — расширить дыхание честными маленькими шагами.",
      en: "When the world narrows, widen the breath in small, honest steps.",
    },
    durationMin: 11,
    freeTier: true,
    gradient: "mauve",
    categorySlug: "emotional-reset",
    pillarId: "close_day",
    sensual: false,
    script: {
      intro: {
        ru: "Телу нужно время переварить — мы не ускоряем, мы присутствуем.",
        en: "Your body may need time to digest — we do not rush; we stay present.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
    },
  },
  {
    slug: "gentle-body-reconnection",
    title: { ru: "Вернуться домой в тело", en: "Coming home to the body" },
    short: {
      ru: "Физическое присутствие без задачи что-то исправить.",
      en: "Physical presence without an agenda to change anything.",
    },
    durationMin: 14,
    freeTier: true,
    gradient: "rose",
    categorySlug: "body-awareness",
    pillarId: "back_body",
    sensual: false,
    script: {
      intro: {
        ru: "Добро пожаловать домой в тело — не чтобы его менять, а чтобы быть с ним.",
        en: "Welcome home to your body — not to change it, simply to be with it.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
      journal: {
        ru: "Где ты заметила самое нежное ощущение?",
        en: "Where did you notice the gentlest sensation?",
      },
    },
  },
  {
    slug: "micro-pause-overloaded-caregivers",
    title: { ru: "Девяносто секунд за закрытой дверью", en: "Ninety seconds with the door closed" },
    short: {
      ru: "Обслуживание нагрузки «все от меня хотят» — коротко, можно, достаточно.",
      en: "Maintenance for the mental load of holding everyone else — brief, allowed, enough.",
    },
    durationMin: 6,
    freeTier: true,
    gradient: "sage",
    categorySlug: "stress-relief",
    pillarId: "when_lot",
    sensual: false,
    script: {
      intro: {
        ru: "Эта пауза — не эгоизм, а пополнение, без которого сложнее заботиться о других.",
        en: "This pause is not selfish — it is refueling so care for others stays possible.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
    },
  },
  {
    slug: "sensual-softness-consent-first",
    title: {
      ru: "Мягкое воплощение (согласие в центре)",
      en: "Soft embodiment (consent-first)",
    },
    short: {
      ru: "Тепло, дыхание и границы, которые задаёте вы — без откровенности.",
      en: "Warmth, breath, and boundaries you set — never explicit.",
    },
    durationMin: 16,
    freeTier: false,
    gradient: "dusk",
    categorySlug: "sensual-wellness",
    pillarId: "quiet_warmth",
    sensual: true,
    script: {
      intro: {
        ru: "Здесь нет задачи «достичь» — только исследование мягкости в теле, в твоём темпе. Стоп в любой момент.",
        en: "No goal to perform — only gentle exploration in your body, your pace. Stop anytime.",
      },
      settling,
      breath,
      body,
      affirm,
      close,
      journal: {
        ru: "Что тебе сейчас важно уважать в себе?",
        en: "What do you want to honor in yourself right now?",
      },
    },
  },
];

export const SESSION_BY_SLUG = Object.fromEntries(SESSIONS.map((s) => [s.slug, s]));

export function scriptToText(s: SessionScript, lang: "ru" | "en"): string {
  const L = lang === "ru" ? "ru" : "en";
  const parts = [
    s.intro[L],
    s.settling[L],
    s.breath[L],
    s.body[L],
    s.affirm[L],
    s.close[L],
  ];
  if (s.journal) parts.push(s.journal[L]);
  return parts.join("\n\n");
}
