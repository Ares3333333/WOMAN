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

export type MiniSession = {
  slug: string;
  title: ScriptBlock;
  short: ScriptBlock;
  durationMin: number;
  freeTier: boolean;
  gradient: "rose" | "mauve" | "sleep" | "sage" | "dusk";
  categorySlug: string;
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
      ru: "5 минут для нервной системы",
      en: "Five-minute nervous system reset",
    },
    short: {
      ru: "Короткий сброс, когда мало времени, а внутри шумно.",
      en: "A compact reset when time is short and your system feels loud.",
    },
    durationMin: 5,
    freeTier: true,
    gradient: "rose",
    categorySlug: "stress-relief",
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
    title: { ru: "Тревога поднялась: якорь дыхания", en: "When anxiety surges — breath anchor" },
    short: {
      ru: "Простой ритм выдоха, чтобы вернуть опору.",
      en: "A simple exhale rhythm to find footing again.",
    },
    durationMin: 8,
    freeTier: true,
    gradient: "sage",
    categorySlug: "breathing",
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
    title: { ru: "Вернуться к дыханию", en: "Reconnect with your breath" },
    short: { ru: "Спокойный темп без форсирования.", en: "Steady pacing without forcing." },
    durationMin: 10,
    freeTier: false,
    gradient: "rose",
    categorySlug: "breathing",
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
    title: { ru: "Заземление перед сном", en: "Grounding before bed" },
    short: {
      ru: "Смягчить день перед кроватью.",
      en: "Let the day soften before sleep.",
    },
    durationMin: 14,
    freeTier: false,
    gradient: "sleep",
    categorySlug: "sleep",
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
    title: { ru: "Сон после тяжёлого дня", en: "Sleep after a hard day" },
    short: {
      ru: "Нежный вечер, когда сердце полное.",
      en: "A tender wind-down when your heart feels full.",
    },
    durationMin: 18,
    freeTier: false,
    gradient: "sleep",
    categorySlug: "sleep",
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
    title: { ru: "Утренняя уверенность", en: "Morning confidence reset" },
    short: {
      ru: "Мягкая сила в начале дня.",
      en: "Quiet strength to start the day.",
    },
    durationMin: 8,
    freeTier: false,
    gradient: "dusk",
    categorySlug: "confidence",
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
    title: { ru: "После тяжёлых новостей", en: "After hard news — softening" },
    short: {
      ru: "Когда мир слишком резкий.",
      en: "When the world feels too sharp.",
    },
    durationMin: 11,
    freeTier: true,
    gradient: "mauve",
    categorySlug: "emotional-reset",
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
    title: { ru: "Мягкое возвращение в тело", en: "Gentle body reconnection" },
    short: {
      ru: "Вернуться в физическое присутствие с терпением.",
      en: "Return to physical presence with patience.",
    },
    durationMin: 14,
    freeTier: true,
    gradient: "rose",
    categorySlug: "body-awareness",
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
    title: { ru: "Микропауза для уставших опекунов", en: "Micro-pause for overloaded caregivers" },
    short: {
      ru: "Когда ты держишь слишком много.",
      en: "When you are holding too much.",
    },
    durationMin: 6,
    freeTier: true,
    gradient: "sage",
    categorySlug: "stress-relief",
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
      ru: "Чувственная мягкость (только с согласия)",
      en: "Sensual softness — consent first",
    },
    short: {
      ru: "Непорнографично, без давления, только твоё «да».",
      en: "Non-explicit, no pressure — only your yes.",
    },
    durationMin: 16,
    freeTier: false,
    gradient: "dusk",
    categorySlug: "sensual-wellness",
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
