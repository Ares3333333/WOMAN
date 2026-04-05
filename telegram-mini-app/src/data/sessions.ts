
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

export type SessionAudio = {
  /** Public URL for recorded narration. Keep null until upload is ready. */
  src: string | null;
  /** Stable storage key for later audio uploads/CDN sync. */
  uploadKey: string;
  /** Target real duration for production audio. */
  durationSec: number;
  /** Fallback to local speech synthesis when source is unavailable. */
  fallbackVoice: boolean;
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
  categorySlug: string;
  pillarId: ContentPillarId;
  eveningHint?: boolean;
  sensual: boolean;
  audio: SessionAudio;
  script: SessionScript;
};

const audio = (uploadKey: string, durationMin: number, src: string | null = null): SessionAudio => ({
  src,
  uploadKey: `sessions/${uploadKey}.mp3`,
  durationSec: durationMin * 60,
  fallbackVoice: true,
});

export const SESSIONS: MiniSession[] = [
  {
    slug: "five-minute-nervous-system-reset",
    title: {
      ru: "Снять внутренний перегрев за 5 минут",
      en: "A 5-minute nervous system downshift",
    },
    short: {
      ru: "Быстрая перезагрузка, когда нужно собраться без давления.",
      en: "A quick reset when you need composure without force.",
    },
    durationMin: 5,
    freeTier: true,
    gradient: "sage",
    categorySlug: "stress-relief",
    pillarId: "still_mind",
    sensual: false,
    audio: audio("five-minute-nervous-system-reset", 5),
    script: {
      intro: {
        ru: "Сядьте так, чтобы спина имела опору. Мы не будем ничего анализировать и раскладывать по полочкам — только быстро снизим внутренний шум.",
        en: "Sit with your back supported. We are not analyzing anything right now, only lowering internal noise quickly.",
      },
      settling: {
        ru: "Проверьте лоб, челюсть, плечи. Там, где есть зажим, отпустите хотя бы пять процентов. [Пауза 10 секунд] Отметьте, как вес тела переходит в опору.",
        en: "Check forehead, jaw, shoulders. Wherever there is tension, release even five percent. [Pause 10 seconds] Notice body weight settling into support.",
      },
      breath: {
        ru: "Сделайте четыре цикла: вдох на четыре счета, выдох на шесть. Не глубже, а ровнее. [Пауза 20 секунд] Если мысли прыгают, возвращайтесь к длине выдоха.",
        en: "Do four cycles: inhale for four, exhale for six. Not deeper, steadier. [Pause 20 seconds] If thoughts jump, return to the longer exhale.",
      },
      body: {
        ru: "Найдите три точки контакта: стопы, таз, спина. Назовите их про себя. [Пауза 15 секунд] Это дает нервной системе простой сигнал: сейчас безопасно.",
        en: "Find three contact points: feet, pelvis, back. Name them silently. [Pause 15 seconds] This gives your nervous system a direct signal: safe now.",
      },
      affirm: {
        ru: "Мне не нужен идеальный день, чтобы действовать спокойно.",
        en: "I do not need a perfect day to move calmly.",
      },
      close: {
        ru: "Откройте глаза, разожмите пальцы рук. Отметьте, что внутри стало тише хотя бы на один уровень.",
        en: "Open your eyes, release your hands. Notice that your inner volume dropped at least one level.",
      },
      journal: {
        ru: "Какой один шаг я сделаю дальше из этого более ровного состояния?",
        en: "What one next step can I take from this steadier state?",
      },
    },
  },
  {
    slug: "when-everything-feels-too-much",
    title: { ru: "Когда все наваливается", en: "When everything piles up" },
    short: {
      ru: "Глубокая практика для дней, когда тревога и список задач сливаются в один шум.",
      en: "A deep track for days when anxiety and task load collapse into one loud signal.",
    },
    durationMin: 12,
    freeTier: true,
    gradient: "mauve",
    categorySlug: "overwhelm",
    pillarId: "when_lot",
    sensual: false,
    audio: audio("when-everything-feels-too-much", 12),
    script: {
      intro: {
        ru: "Если вам сейчас тяжело держать объем, это не слабость. Это состояние перегруза. Мы не будем делать вид, что все хорошо — мы снизим интенсивность и вернем управляемость.",
        en: "If the load feels unbearable, that is not weakness. It is overload. We are not pretending everything is fine; we are lowering intensity and restoring control.",
      },
      settling: {
        ru: "Оцените напряжение по шкале от 0 до 10. Просто цифра. [Пауза 8 секунд] Теперь скорректируйте позу так, чтобы телу было легче оставаться в неподвижности.",
        en: "Rate tension from 0 to 10. Just a number. [Pause 8 seconds] Adjust your posture so the body can stay still with less effort.",
      },
      breath: {
        ru: "Схема 4-2-6: вдох четыре, пауза два, выдох шесть. Повторите шесть циклов. [Пауза 35 секунд] Если счет мешает, оставьте только длинный выдох.",
        en: "Use 4-2-6 breathing: inhale four, hold two, exhale six. Repeat six rounds. [Pause 35 seconds] If counting feels stressful, keep only the longer exhale.",
      },
      body: {
        ru: "Пройдите вниманием по телу сверху вниз. На каждом участке задавайте вопрос: можно ли отпустить хотя бы 5%? [Пауза 45 секунд] Там, где ответ нет, ничего не давите.",
        en: "Scan your body top to bottom. In each area ask: can I release even 5%? [Pause 45 seconds] Where the answer is no, do not push.",
      },
      affirm: {
        ru: "Сегодня мне нужна не идеальность, а опора, с которой можно пройти день до конца.",
        en: "Today I do not need perfection. I need support strong enough to carry me through.",
      },
      close: {
        ru: "Снова назовите цифру напряжения. Даже маленькое снижение важно. Возвращайтесь не ко всему списку сразу, а только к ближайшему действию.",
        en: "Name your tension number again. Even a small drop matters. Return not to the whole list, only to the nearest action.",
      },
      journal: {
        ru: "Какие две задачи я могу осознанно снять с себя сегодня?",
        en: "Which two tasks can I consciously remove from today?",
      },
    },
  },
  {
    slug: "when-anxiety-surges-breath-anchor",
    title: { ru: "Если тревога поднимается волной", en: "When anxiety surges" },
    short: {
      ru: "Практика-якорь для острого всплеска тревоги и ускоренного пульса.",
      en: "An anchor for acute anxiety spikes and racing pulse.",
    },
    durationMin: 8,
    freeTier: true,
    gradient: "sage",
    categorySlug: "anxiety",
    pillarId: "still_mind",
    sensual: false,
    audio: audio("when-anxiety-surges-breath-anchor", 8),
    script: {
      intro: {
        ru: "Тревога подает сигнал срочности, даже когда реальной срочности нет. Сейчас мы переведем систему в более безопасный ритм.",
        en: "Anxiety sends urgency signals even when no immediate danger is present. We are moving your system into a safer rhythm.",
      },
      settling: {
        ru: "Одна ладонь на грудь, вторая на низ живота. [Пауза 10 секунд] Назовите три факта из окружающей среды: звук, цвет, температуру.",
        en: "One hand on chest, one on lower belly. [Pause 10 seconds] Name three environmental facts: a sound, a color, a temperature.",
      },
      breath: {
        ru: "Десять медленных циклов: вдох носом, выдох длиннее через рот. [Пауза 30 секунд] Слушайте звук выдоха — он будет вашим метрономом.",
        en: "Ten slow cycles: inhale through nose, longer exhale through mouth. [Pause 30 seconds] Use the sound of exhale as your metronome.",
      },
      body: {
        ru: "Сожмите кисти на два счета и отпустите. Повторите три раза. [Пауза 15 секунд] Затем поднимите плечи вверх и медленно опустите вниз.",
        en: "Clench your hands for two counts and release. Repeat three times. [Pause 15 seconds] Then lift shoulders up and slowly drop them.",
      },
      affirm: {
        ru: "Тревога — это сигнал, не приказ. Я выбираю темп сама.",
        en: "Anxiety is a signal, not an order. I choose the pace.",
      },
      close: {
        ru: "Осмотритесь и найдите глазами три нейтральных объекта. Сделайте обычный вдох и вернитесь к делу с новой скоростью.",
        en: "Look around and find three neutral objects. Take a natural breath and return at a different speed.",
      },
      journal: {
        ru: "Что помогло быстрее: длина выдоха, контакт с опорой или телесные движения?",
        en: "What helped faster today: longer exhale, sensory grounding, or body release?",
      },
    },
  },
  {
    slug: "reconnect-with-your-breath",
    title: { ru: "Вернуть дыхание как опору", en: "Breath as your base again" },
    short: {
      ru: "Дыхательная сессия с несколькими фазами и длинными паузами стабилизации.",
      en: "A premium multi-phase breathing session with extended stabilization pauses.",
    },
    durationMin: 10,
    freeTier: false,
    gradient: "rose",
    categorySlug: "breathing",
    pillarId: "still_mind",
    sensual: false,
    audio: audio("reconnect-with-your-breath", 10),
    script: {
      intro: {
        ru: "Эта сессия помогает вернуть контроль, если дыхание стало поверхностным, а голова перегружена. Мы работаем с ритмом, а не с усилием.",
        en: "This session restores control when breath gets shallow and mind overloaded. We work with rhythm, not force.",
      },
      settling: {
        ru: "Сядьте выше на опоре, освободите горло и челюсть. [Пауза 12 секунд] Положите ладони на нижние ребра и почувствуйте, как они двигаются в стороны.",
        en: "Sit taller on support, soften throat and jaw. [Pause 12 seconds] Place hands on lower ribs and feel lateral movement.",
      },
      breath: {
        ru: "Фаза 1: наблюдение без контроля — 1 минута. Фаза 2: ритм 4-6 — 5 циклов. Фаза 3: ритм 5-7 — 5 циклов. [Пауза 45 секунд] Если появляется дискомфорт, вернитесь к 4-6.",
        en: "Phase 1: observe without control for 1 minute. Phase 2: 4-6 rhythm for 5 rounds. Phase 3: 5-7 rhythm for 5 rounds. [Pause 45 seconds] If discomfort appears, return to 4-6.",
      },
      body: {
        ru: "С каждым выдохом мягко опускайте плечи и живот. Не втягивайте корпус и не удерживайте осанку силой. [Пауза 25 секунд] Тишина в теле приходит через стабильность, не через героизм.",
        en: "On each exhale let shoulders and belly soften. Do not hold posture by force. [Pause 25 seconds] Bodily quiet comes from consistency, not heroics.",
      },
      affirm: {
        ru: "Даже в сложном дне у меня есть свой внутренний ритм.",
        en: "Even in a difficult day, I still have my own internal rhythm.",
      },
      close: {
        ru: "Сделайте один цикл без счета. Зафиксируйте текущее состояние и перенесите этот ритм в следующие десять минут дня.",
        en: "Take one uncounted cycle. Register your current state and carry this rhythm into the next ten minutes.",
      },
      journal: {
        ru: "Какая схема дыхания сегодня дала мне максимальную устойчивость?",
        en: "Which breathing scheme gave me the strongest stability today?",
      },
    },
  },
  {
    slug: "grounding-before-bed",
    title: { ru: "Мягкий переход ко сну", en: "A grounded transition to sleep" },
    short: {
      ru: "Вечерняя практика для снижения тонуса и аккуратного входа в режим сна.",
      en: "An evening track to reduce activation and transition into sleep mode.",
    },
    durationMin: 14,
    freeTier: false,
    gradient: "sleep",
    categorySlug: "sleep",
    pillarId: "soft_evening",
    eveningHint: true,
    sensual: false,
    audio: audio("grounding-before-bed", 14),
    script: {
      intro: {
        ru: "Перед сном мозг часто продолжает решать задачи, даже когда тело уже устало. Эта практика закрывает рабочий день и переводит нервную систему в ночной режим.",
        en: "Before sleep, the mind often keeps solving tasks while the body is already tired. This practice closes the work cycle and shifts your system into night mode.",
      },
      settling: {
        ru: "Уберите лишний свет, отложите экран, сделайте пространство тише. [Пауза 20 секунд] Лягте или сядьте так, чтобы телу ничего не приходилось удерживать.",
        en: "Dim extra light, set the screen aside, let the room get quieter. [Pause 20 seconds] Lie or sit so your body does not need to hold itself.",
      },
      breath: {
        ru: "Шесть циклов: вдох носом, длинный выдох ртом. Потом переход на спокойное дыхание только носом. [Пауза 45 секунд] С каждым выдохом отпускайте скорость дня.",
        en: "Take six cycles: inhale through nose, long exhale through mouth. Then switch to calm nose-only breathing. [Pause 45 seconds] With each exhale, release the speed of the day.",
      },
      body: {
        ru: "Пройдите вниманием по телу сверху вниз: лицо, шея, плечи, грудь, живот, таз, ноги. На каждом участке внутренне говорите: можно отпустить. [Пауза 60 секунд]",
        en: "Scan from top to bottom: face, neck, shoulders, chest, belly, pelvis, legs. In each area, quietly say: soften. [Pause 60 seconds]",
      },
      affirm: {
        ru: "День завершен. Я могу оставить нерешенное до утра и дать телу ночь восстановления.",
        en: "The day is complete. I can leave unresolved things for morning and give my body a night of repair.",
      },
      close: {
        ru: "Останьтесь в тишине еще несколько дыхательных циклов. Ничего больше делать не нужно.",
        en: "Stay in silence for a few extra breaths. Nothing else is required now.",
      },
      journal: {
        ru: "Что я осознанно оставляю до завтра, чтобы дать себе полноценный сон?",
        en: "What am I consciously leaving for tomorrow so I can sleep fully tonight?",
      },
    },
  },
  {
    slug: "sleep-after-an-emotionally-hard-day",
    title: { ru: "Сон после тяжелого эмоционального дня", en: "Sleep after an emotionally heavy day" },
    short: {
      ru: "Длинный night-track для вечеров, когда мысли не отпускают и телу трудно замедлиться.",
      en: "A long-form night track for evenings when thoughts keep spinning.",
    },
    durationMin: 18,
    freeTier: false,
    gradient: "sleep",
    categorySlug: "sleep",
    pillarId: "tonight",
    eveningHint: true,
    sensual: false,
    audio: audio("sleep-after-an-emotionally-hard-day", 18),
    script: {
      intro: {
        ru: "Когда день был эмоционально жестким, сон не приходит по команде. Это нормально. Сейчас мы поможем телу выйти из режима защиты и вернуться в режим восстановления.",
        en: "After an emotionally hard day, sleep does not arrive on command. That is normal. We are guiding your body out of defense mode and into recovery mode.",
      },
      settling: {
        ru: "Укройтесь так, чтобы было тепло. Почувствуйте вес одеяла, вес тела, вес головы на опоре. [Пауза 20 секунд] Вам не нужно сейчас ничего решать.",
        en: "Settle under warmth. Feel blanket weight, body weight, head supported. [Pause 20 seconds] Nothing needs to be solved right now.",
      },
      breath: {
        ru: "Первые две минуты — только длинный выдох. Дальше восемь циклов 4-6. Потом дыхание без счета и без контроля. [Пауза 80 секунд]",
        en: "First two minutes: only longer exhale. Then eight rounds of 4-6. Then uncounted breathing with no control. [Pause 80 seconds]",
      },
      body: {
        ru: "Обратите внимание на зоны, где эмоциональное напряжение держится чаще всего: горло, грудь, солнечное сплетение, живот. На каждом выдохе приглашайте эти зоны стать мягче. [Пауза 90 секунд]",
        en: "Notice where emotional tension usually stays: throat, chest, solar plexus, belly. On each exhale invite these areas to soften. [Pause 90 seconds]",
      },
      affirm: {
        ru: "Мне не нужно закончить все эмоциональные процессы сегодня. Мне нужно дать себе ночь.",
        en: "I do not need to complete every emotional process tonight. I need to give myself a night.",
      },
      close: {
        ru: "Сделайте три тихих дыхательных цикла. Дальше просто оставайтесь в темноте и позвольте сну прийти в своем времени.",
        en: "Take three quiet breathing cycles. Then stay in the dark and let sleep come in its own timing.",
      },
      journal: {
        ru: "Какой вечерний триггер чаще всего мешает уснуть после эмоционального дня?",
        en: "Which evening trigger most often blocks sleep after an emotional day?",
      },
    },
  },
  {
    slug: "morning-confidence-reset",
    title: { ru: "Утренний сбор перед днем", en: "Morning composure reset" },
    short: {
      ru: "Короткая практика для спокойного голоса, ясного фокуса и устойчивых границ.",
      en: "A short practice for steady voice, clear focus, and boundaries.",
    },
    durationMin: 8,
    freeTier: false,
    gradient: "dusk",
    categorySlug: "confidence",
    pillarId: "return_you",
    sensual: false,
    audio: audio("morning-confidence-reset", 8),
    script: {
      intro: {
        ru: "Эта сессия нужна не для жесткости, а для собранности. Вы сохраняете мягкость, но перестаете терять себя в чужом темпе.",
        en: "This session is not about hardening. It is about composure. You stay warm while not losing yourself in someone else's pace.",
      },
      settling: {
        ru: "Сядьте или встаньте с хорошей опорой на стопы. Легко вытянитесь вверх. [Пауза 12 секунд] Почувствуйте, что корпус держит вас, а не вы держите его усилием.",
        en: "Sit or stand with stable feet. Lengthen softly upward. [Pause 12 seconds] Feel your structure supporting you, not muscular strain.",
      },
      breath: {
        ru: "Пять ровных циклов дыхания через нос. На выдохе внутренне повторяйте: спокойно. [Пауза 20 секунд] Потом пять циклов с фразой: ясно.",
        en: "Take five even nose-breath cycles. On exhale repeat silently: steady. [Pause 20 seconds] Then five cycles with: clear.",
      },
      body: {
        ru: "Чуть откройте грудную клетку, не перегибая поясницу. Опустите плечи, смягчите взгляд. [Пауза 15 секунд] Это нейтральная уверенная позиция, без демонстрации силы.",
        en: "Open chest slightly without over-arching lower back. Drop shoulders, soften gaze. [Pause 15 seconds] This is neutral confidence, not performance.",
      },
      affirm: {
        ru: "Я могу быть доброй и при этом точной. Мои границы остаются со мной.",
        en: "I can be kind and still precise. My boundaries stay with me.",
      },
      close: {
        ru: "Назовите один разговор, где вам особенно нужна ясность. Сделайте вдох, выдох и войдите в день из этой опоры.",
        en: "Name one conversation where clarity matters most. Breathe in, breathe out, and enter your day from this base.",
      },
      journal: {
        ru: "Какой один ответ сегодня поможет мне сохранить себя в общении?",
        en: "What one response will help me keep myself intact today?",
      },
    },
  },
  {
    slug: "after-hard-news-softening",
    title: { ru: "После тревожных новостей", en: "After difficult news" },
    short: {
      ru: "Снизить внутренний удар и вернуть опору, не уходя в информационное онемение.",
      en: "Reduce impact and regain grounding without shutting down.",
    },
    durationMin: 11,
    freeTier: true,
    gradient: "mauve",
    categorySlug: "emotional-reset",
    pillarId: "close_day",
    sensual: false,
    audio: audio("after-hard-news-softening", 11),
    script: {
      intro: {
        ru: "Тяжелые новости сжимают тело и внимание. Мы не будем спорить с реакцией — только дадим системе безопасный способ вернуться к устойчивости.",
        en: "Hard news can constrict body and attention. We are not fighting your reaction; we are offering a safe route back to steadiness.",
      },
      settling: {
        ru: "Отложите экран на расстояние вытянутой руки. Поставьте стопы на пол и назовите пять предметов вокруг. [Пауза 12 секунд]",
        en: "Set your screen at arm's length. Place feet on the floor and name five objects around you. [Pause 12 seconds]",
      },
      breath: {
        ru: "Вдох на четыре, выдох на семь. Семь циклов подряд. [Пауза 40 секунд] Если ритм сбивается, сократите счет, сохранив длинный выдох.",
        en: "Inhale for four, exhale for seven. Seven rounds. [Pause 40 seconds] If rhythm breaks, shorten the count and keep exhale longer.",
      },
      body: {
        ru: "Слегка надавите стопами в пол и отпустите. Повторите три раза. Затем мягко сведите и разведите лопатки. [Пауза 20 секунд]",
        en: "Press feet into the floor and release. Repeat three times. Then gently draw shoulder blades together and release. [Pause 20 seconds]",
      },
      affirm: {
        ru: "Я могу оставаться в контакте с миром и одновременно беречь свою нервную систему.",
        en: "I can stay in contact with reality and still protect my nervous system.",
      },
      close: {
        ru: "Выберите один здоровый следующий шаг: вода, прогулка, душ, разговор с близким. Один шаг достаточно.",
        en: "Choose one healthy next step: water, walk, shower, or reaching out to someone close. One step is enough.",
      },
      journal: {
        ru: "Какой информационный лимит на сегодня будет бережным и реалистичным?",
        en: "What information boundary is both realistic and protective for today?",
      },
    },
  },
  {
    slug: "gentle-body-reconnection",
    title: { ru: "Вернуться в тело без давления", en: "Return to your body, gently" },
    short: {
      ru: "Медленная практика на контакт с телом после дня в режиме «только голова».",
      en: "A slow body reconnection practice after a head-heavy day.",
    },
    durationMin: 14,
    freeTier: true,
    gradient: "rose",
    categorySlug: "body-awareness",
    pillarId: "back_body",
    sensual: false,
    audio: audio("gentle-body-reconnection", 14),
    script: {
      intro: {
        ru: "Когда вы долго живете в мыслях и задачах, тело становится фоном. Эта сессия возвращает физическое присутствие без самооценки и контроля.",
        en: "After long cognitive load, the body turns into background. This session restores physical presence without self-judgment.",
      },
      settling: {
        ru: "Выберите положение, в котором вам тепло и спокойно. Отметьте вес одежды, температуру воздуха и опору под телом. [Пауза 15 секунд]",
        en: "Choose a position where you feel warm and calm. Notice clothing weight, air temperature, and support under your body. [Pause 15 seconds]",
      },
      breath: {
        ru: "Дышите свободно, без счета. На каждом выдохе внутренне говорите: я здесь. [Пауза 35 секунд]",
        en: "Breathe naturally without counting. On each exhale repeat silently: I am here. [Pause 35 seconds]",
      },
      body: {
        ru: "Сканируйте тело от стоп к макушке и обратно. В каждой зоне замечайте одно ощущение: тепло, давление, пульсацию, нейтральность. [Пауза 60 секунд]",
        en: "Scan from feet to crown and back. In each zone notice one sensation: warmth, pressure, pulse, or neutrality. [Pause 60 seconds]",
      },
      affirm: {
        ru: "Мое тело не инструмент для задач. Это мой дом, и я могу возвращаться в него ежедневно.",
        en: "My body is not a task instrument. It is my home, and I can return daily.",
      },
      close: {
        ru: "Слегка пошевелите пальцами рук и ног. Откройте глаза и сохраните ощущение контакта с собой на ближайшие минуты.",
        en: "Move fingers and toes lightly. Open your eyes and keep this contact with yourself for the next minutes.",
      },
      journal: {
        ru: "Где в теле сегодня появилось больше тепла или устойчивости?",
        en: "Where in my body did warmth or stability increase today?",
      },
    },
  },
  {
    slug: "micro-pause-overloaded-caregivers",
    title: { ru: "Микропауза, когда все держится на вас", en: "Micro-pause when everyone needs you" },
    short: {
      ru: "Экстренная мини-сессия для моментов «я больше не вывожу».",
      en: "Emergency mini-session for moments of near-capacity.",
    },
    durationMin: 6,
    freeTier: true,
    gradient: "sage",
    categorySlug: "overload",
    pillarId: "when_lot",
    sensual: false,
    audio: audio("micro-pause-overloaded-caregivers", 6),
    script: {
      intro: {
        ru: "Эти шесть минут — не роскошь. Это техническая пауза, которая помогает вам не дойти до внутреннего срыва.",
        en: "These six minutes are not luxury. They are maintenance that helps prevent internal collapse.",
      },
      settling: {
        ru: "Отвернитесь от шума, поставьте таймер и дайте телу опору. [Пауза 8 секунд] Сейчас вам не нужно ни с кем справляться.",
        en: "Turn away from noise, set a timer, and give your body support. [Pause 8 seconds] You do not need to manage anyone right now.",
      },
      breath: {
        ru: "Три глубоких цикла: вдох, длинный выдох. Затем пять обычных спокойных циклов. Повторите блок еще раз. [Пауза 25 секунд]",
        en: "Three deeper cycles: inhale, long exhale. Then five natural cycles. Repeat once more. [Pause 25 seconds]",
      },
      body: {
        ru: "Сожмите и отпустите кулаки, потом челюсть, потом плечи. [Пауза 15 секунд] Контраст напряжение-расслабление быстро разгружает нервную систему.",
        en: "Tense and release fists, then jaw, then shoulders. [Pause 15 seconds] Tension-release contrast unloads the nervous system quickly.",
      },
      affirm: {
        ru: "Моя пауза — часть моей ответственности за себя.",
        en: "My pause is part of my responsibility to myself.",
      },
      close: {
        ru: "Выберите одну задачу на ближайшие 30 минут. Только одну. Вернитесь к ней в более ровном темпе.",
        en: "Choose one task for the next 30 minutes. One only. Return to it with a steadier pace.",
      },
      journal: {
        ru: "Какая самая короткая версия заботы о себе реально работает в загруженные дни?",
        en: "What is the shortest self-care action that still works on overloaded days?",
      },
    },
  },
  {
    slug: "sensual-softness-consent-first",
    title: {
      ru: "Чувственное заземление (согласие на первом месте)",
      en: "Sensual grounding (consent-first)",
    },
    short: {
      ru: "Private-практика про телесную безопасность, границы и мягкое тепло без откровенности.",
      en: "A private practice for body safety, boundaries, and quiet warmth.",
    },
    durationMin: 16,
    freeTier: false,
    gradient: "dusk",
    categorySlug: "sensual-wellness",
    pillarId: "quiet_warmth",
    sensual: true,
    audio: audio("sensual-softness-consent-first", 16),
    script: {
      intro: {
        ru: "Эта сессия строится на полном согласии с собой. Вы можете остановиться в любую секунду, сменить темп, изменить фокус. Никакого обязательного результата.",
        en: "This session is built on full consent with yourself. You can stop at any second, change pace, shift focus. No required outcome.",
      },
      settling: {
        ru: "Проверьте пространство: дверь закрыта, температура комфортная, вас никто не отвлечет. [Пауза 20 секунд] Подберите положение, где ощущается опора и контроль.",
        en: "Check the space: door closed, temperature comfortable, no interruptions. [Pause 20 seconds] Choose a position that feels both supportive and in your control.",
      },
      breath: {
        ru: "Дышите мягко через нос. На выдохе отпускайте напряжение в животе и тазе, не усиливая ощущения. [Пауза 40 секунд]",
        en: "Breathe softly through your nose. On each exhale, release tension in belly and pelvis without intensifying sensation. [Pause 40 seconds]",
      },
      body: {
        ru: "Переводите внимание между грудной клеткой, животом и бедрами. Если где-то появляется тепло, просто оставайтесь рядом с этим ощущением. [Пауза 60 секунд] Если приходит дискомфорт, сразу снижайте интенсивность или делайте паузу.",
        en: "Move attention between chest, belly, and hips. If warmth appears, simply stay near that sensation. [Pause 60 seconds] If discomfort appears, reduce intensity immediately or pause.",
      },
      affirm: {
        ru: "Мое тело — моя территория. Я задаю правила контакта.",
        en: "My body is my territory. I set the rules of contact.",
      },
      close: {
        ru: "Сделайте длинный выдох, почувствуйте опору под собой и отметьте, что сегодня было для вас действительно бережным.",
        en: "Take a long exhale, feel support beneath you, and note what felt genuinely respectful today.",
      },
      journal: {
        ru: "Какой формат self-connection для меня самый спокойный и безопасный?",
        en: "Which self-connection format feels most calm and safe for me?",
      },
    },
  },
  {
    slug: "evening-nervous-system-downshift",
    title: { ru: "Подготовить нервную систему к вечеру", en: "Evening nervous system downshift" },
    short: {
      ru: "Signature evening-ритуал для перехода из рабочего режима в личный.",
      en: "A signature evening ritual to transition out of work mode.",
    },
    durationMin: 20,
    freeTier: false,
    gradient: "sleep",
    categorySlug: "signature-evening",
    pillarId: "soft_evening",
    eveningHint: true,
    sensual: false,
    audio: audio("evening-nervous-system-downshift", 20),
    script: {
      intro: {
        ru: "Это длинная вечерняя дуга для дней, когда тело все еще живет в рабочем темпе. Мы последовательно снимем остаточное напряжение и вернем личный ритм.",
        en: "This is a long evening arc for days when your body remains in work speed. We will progressively release residual tension and restore personal rhythm.",
      },
      settling: {
        ru: "Выключите рабочие уведомления, ослабьте свет, приготовьте воду рядом. [Пауза 20 секунд] Сейчас ключевая задача — не эффективность, а переход.",
        en: "Disable work notifications, soften light, keep water nearby. [Pause 20 seconds] Your priority now is transition, not efficiency.",
      },
      breath: {
        ru: "Блок из трех фаз: длинный выдох, затем 4-6, затем свободное дыхание. Дайте каждой фазе минимум по минуте. [Пауза 80 секунд]",
        en: "Three-phase breath block: long exhale, then 4-6, then natural breathing. Give each phase at least one minute. [Pause 80 seconds]",
      },
      body: {
        ru: "Разгрузите шею, плечи, грудную клетку, поясницу, бедра. В каждой зоне — микродвижение и пауза, чтобы тело успело ответить. [Пауза 100 секунд]",
        en: "Unload neck, shoulders, chest, lower back, hips. In each area use a micro-movement and pause long enough for body response. [Pause 100 seconds]",
      },
      affirm: {
        ru: "Рабочий день завершен. Личное время начинается сейчас.",
        en: "Work mode is complete. Personal time starts now.",
      },
      close: {
        ru: "Оцените остаточный уровень напряжения от 0 до 10. Сохраните в теле этот более медленный ритм и переходите к вечеру без рывка.",
        en: "Rate residual tension from 0 to 10. Keep this slower rhythm in your body and move into evening without a hard shift.",
      },
      journal: {
        ru: "Какой вечерний ритуал лучше всего закрепляет эффект этой сессии?",
        en: "Which evening ritual helps this session's effect last longer?",
      },
    },
  },
  {
    slug: "deep-sleep-arrival-ritual",
    title: { ru: "Глубокий ритуал засыпания", en: "Deep sleep arrival ritual" },
    short: {
      ru: "Самый длинный night-track: для ночей, когда мозг не выключается по команде.",
      en: "Our longest night track for nights when your mind does not switch off.",
    },
    durationMin: 22,
    freeTier: false,
    gradient: "sleep",
    categorySlug: "sleep-signature",
    pillarId: "tonight",
    eveningHint: true,
    sensual: false,
    audio: audio("deep-sleep-arrival-ritual", 22),
    script: {
      intro: {
        ru: "Это signature night-протокол. Он создан для ночей, когда день закончился, но нервная система еще нет. Мы последовательно снизим активацию до уровня, совместимого со сном.",
        en: "This is a signature night protocol for evenings when the day ended but your system did not. We will steadily lower activation to sleep-compatible levels.",
      },
      settling: {
        ru: "Подготовьте темную и тихую среду. Уберите экран из зоны видимости. [Пауза 25 секунд] Представьте, что ночь сейчас работает на вашу регенерацию.",
        en: "Prepare a dark and quiet environment. Keep screens out of sight. [Pause 25 seconds] Imagine the night now working for your regeneration.",
      },
      breath: {
        ru: "Первые шесть циклов — длинный выдох. Следующие шесть — ритм 4-7. Затем три минуты свободного дыхания в тишине. [Пауза 100 секунд]",
        en: "First six cycles with long exhale. Next six cycles at 4-7 rhythm. Then three minutes of quiet natural breathing. [Pause 100 seconds]",
      },
      body: {
        ru: "Последовательно расслабляйте: лицо, язык, шею, плечи, грудную клетку, живот, таз, ноги. На каждом участке задерживайтесь дольше обычного. [Пауза 130 секунд]",
        en: "Release in sequence: face, tongue, neck, shoulders, chest, belly, pelvis, legs. Stay longer than usual in each area. [Pause 130 seconds]",
      },
      affirm: {
        ru: "Сон — это не награда, а базовая поддержка моей психики и тела.",
        en: "Sleep is not a reward. It is baseline support for my mind and body.",
      },
      close: {
        ru: "Сделайте три очень тихих дыхательных цикла и перестаньте что-либо контролировать. Дальше просто лежите в темноте, пока сон не придет сам.",
        en: "Take three very quiet breaths and stop controlling anything. Then remain in darkness until sleep arrives naturally.",
      },
      journal: {
        ru: "Какая часть вечерней рутины чаще всего мешает мне войти в сонный режим?",
        en: "Which part of my evening routine most often blocks sleep mode?",
      },
    },
  },
  {
    slug: "boundaries-after-social-overload",
    title: { ru: "Вернуть границы после социального перегруза", en: "Boundaries after social overload" },
    short: {
      ru: "Трек для восстановления после интенсивного общения и эмоционального истощения.",
      en: "A premium recovery track after intense social exposure.",
    },
    durationMin: 15,
    freeTier: false,
    gradient: "dusk",
    categorySlug: "boundaries",
    pillarId: "return_you",
    sensual: false,
    audio: audio("boundaries-after-social-overload", 15),
    script: {
      intro: {
        ru: "После плотного общения легко потерять чувство собственного контура. Эта сессия возвращает личные границы без агрессии и без закрытости.",
        en: "After dense social interaction it is easy to lose your personal contour. This session restores boundaries without aggression or withdrawal.",
      },
      settling: {
        ru: "Сядьте с устойчивой опорой. Ладонь на грудь, ладонь на живот. [Пауза 15 секунд] Отметьте: сейчас вы в своем пространстве.",
        en: "Sit with stable support. One hand on chest, one on belly. [Pause 15 seconds] Note: right now you are in your own space.",
      },
      breath: {
        ru: "Вдох носом, выдох ртом с мягким звуком. Восемь повторов подряд. [Пауза 40 секунд] На каждом выдохе возвращайте внимание в тело.",
        en: "Inhale through nose, exhale through mouth with a soft sound. Eight rounds in a row. [Pause 40 seconds] On every exhale return attention to your body.",
      },
      body: {
        ru: "Представьте вокруг себя спокойный контур на расстоянии вытянутой руки. Он не отталкивает людей, а защищает ваш ресурс. [Пауза 55 секунд]",
        en: "Imagine a calm boundary around you at arm's length. It does not push people away; it protects your capacity. [Pause 55 seconds]",
      },
      affirm: {
        ru: "Я могу быть открытой и ясной одновременно. Мои границы — часть моего достоинства.",
        en: "I can be open and clear at the same time. My boundaries are part of my dignity.",
      },
      close: {
        ru: "Выберите один запрос, на который вы ответите не сейчас, а позже. Это и есть практическая граница.",
        en: "Choose one request you will answer later, not now. That is a practical boundary.",
      },
      journal: {
        ru: "Какая формулировка помогает мне говорить «нет» спокойно и без вины?",
        en: "Which phrase helps me say no calmly and without guilt?",
      },
    },
  },
  {
    slug: "private-soft-confidence-body-trust",
    title: { ru: "Private-практика телесного доверия", en: "Private body-trust ritual" },
    short: {
      ru: "Деликатная сессия про согласие, контакт с телом и уверенность без напряжения.",
      en: "A delicate session for consent, body contact, and calm confidence.",
    },
    durationMin: 18,
    freeTier: false,
    gradient: "dusk",
    categorySlug: "private-self-connection",
    pillarId: "quiet_warmth",
    sensual: true,
    audio: audio("private-soft-confidence-body-trust", 18),
    script: {
      intro: {
        ru: "Эта private-сессия про уважительный контакт с собой. Вы полностью контролируете глубину, темп и продолжительность каждого шага.",
        en: "This private session is about respectful self-contact. You fully control depth, pace, and duration at every step.",
      },
      settling: {
        ru: "Проверьте безопасность пространства: приватность, комфортный свет, удобная одежда. [Пауза 20 секунд] Скажите себе: я могу остановиться в любой момент.",
        en: "Check space safety: privacy, comfortable light, comfortable clothing. [Pause 20 seconds] Tell yourself: I can stop at any moment.",
      },
      breath: {
        ru: "Дыхание через нос, без форсирования. На выдохе отпускайте ожидания о том, как нужно чувствовать. [Пауза 45 секунд]",
        en: "Breathe through the nose without forcing. On each exhale, release expectations about how you should feel. [Pause 45 seconds]",
      },
      body: {
        ru: "Плавно перемещайте внимание между грудью, животом и бедрами. Если появляется приятное тепло, просто оставайтесь рядом. [Пауза 70 секунд] Если приходит дискомфорт, снизьте интенсивность или сделайте паузу.",
        en: "Move attention gently between chest, belly, and hips. If pleasant warmth appears, simply stay nearby. [Pause 70 seconds] If discomfort appears, reduce intensity or pause.",
      },
      affirm: {
        ru: "Я выбираю контакт с собой в темпе, который бережет меня.",
        en: "I choose self-contact at a pace that protects me.",
      },
      close: {
        ru: "Сделайте один длинный выдох и найдите в теле точку устойчивого тепла. Сохраните ее как личную опору на остаток вечера.",
        en: "Take one long exhale and locate a point of steady warmth in your body. Keep it as your anchor for the rest of the evening.",
      },
      journal: {
        ru: "Что делает мой личный ритуал контакта с собой действительно ценным?",
        en: "What makes my private self-connection ritual genuinely valuable?",
      },
    },
  },
  {
    slug: "cycle-aware-evening-balance",
    title: { ru: "Вечерняя настройка под ваш ритм", en: "Cycle-aware evening balance" },
    short: {
      ru: "Сессия для вечеров, когда состояние меняется волнами в разные фазы цикла.",
      en: "A premium evening session for days when your inner tone shifts across cycle phases.",
    },
    durationMin: 13,
    freeTier: false,
    gradient: "rose",
    categorySlug: "rhythm-support",
    pillarId: "return_you",
    eveningHint: true,
    sensual: false,
    audio: audio("cycle-aware-evening-balance", 13),
    script: {
      intro: {
        ru: "Эта практика не лечит и не диагностирует. Она помогает мягко выровнять вечерний ритм, когда эмоциональный фон скачет и трудно понять, что именно нужно телу.",
        en: "This practice does not diagnose or treat. It helps gently rebalance your evening rhythm when emotional tone shifts and body needs feel unclear.",
      },
      settling: {
        ru: "Выберите позу, где есть и комфорт, и ощущение собранности. [Пауза 15 секунд] Положите одну ладонь на грудную клетку, вторую на низ живота.",
        en: "Choose a posture that feels both comfortable and composed. [Pause 15 seconds] Place one hand on your chest and one on lower belly.",
      },
      breath: {
        ru: "Первые пять циклов: вдох на четыре, выдох на шесть. Следующие пять циклов: без счета, но с длинным спокойным выдохом. [Пауза 40 секунд]",
        en: "First five cycles: inhale for four, exhale for six. Next five cycles: no counting, just a long calm exhale. [Pause 40 seconds]",
      },
      body: {
        ru: "Проверьте четыре зоны: лицо, грудь, живот, таз. На каждой зоне задайте вопрос: «что тебе сейчас нужно - тепло, тишина, движение или покой?» [Пауза 55 секунд] Выберите один самый понятный ответ и дайте телу этот сигнал.",
        en: "Check four zones: face, chest, belly, pelvis. In each zone ask: what do you need now - warmth, quiet, movement, or stillness? [Pause 55 seconds] Choose one clear answer and give your body that signal.",
      },
      affirm: {
        ru: "Мой ритм может меняться. Я могу подстраиваться к себе без борьбы.",
        en: "My rhythm can change. I can adjust to myself without a fight.",
      },
      close: {
        ru: "Отметьте текущий уровень внутреннего напряжения от 0 до 10. Сохраните эту цифру в памяти: это ваша точка для завтрашнего сравнения, без оценки и критики.",
        en: "Notice your current tension level from 0 to 10. Keep that number for tomorrow's comparison, without judgment or pressure.",
      },
      journal: {
        ru: "Что сегодня реально помогло: длина выдоха, тепло, тишина или небольшой телесный жест?",
        en: "What actually helped tonight: longer exhale, warmth, quiet, or a small body movement?",
      },
    },
  },
  {
    slug: "midnight-overthinking-off-ramp",
    title: { ru: "Ночной выход из overthinking", en: "Midnight off-ramp for overthinking" },
    short: {
      ru: "Длинный трек на ночи, когда мысли крутятся по кругу и сон все время откладывается.",
      en: "A long night track for loops of overthinking that keep delaying sleep.",
    },
    durationMin: 19,
    freeTier: false,
    gradient: "sleep",
    categorySlug: "night-recovery",
    pillarId: "tonight",
    eveningHint: true,
    sensual: false,
    audio: audio("midnight-overthinking-off-ramp", 19),
    script: {
      intro: {
        ru: "Если вы снова прокручиваете одни и те же разговоры и решения, вы не обязаны «выключить голову силой». Мы создадим мягкий выход из мыслительного круга.",
        en: "If you are replaying the same conversations and decisions, you do not need to shut your mind down by force. We will build a gentle exit from the loop.",
      },
      settling: {
        ru: "Уберите телефон с кровати и разверните экран вниз. [Пауза 20 секунд] Дайте телу устойчивую опору: подушке, матрасу, одеялу.",
        en: "Move your phone off the bed and turn the screen face down. [Pause 20 seconds] Let your body feel clear support from pillow, mattress, blanket.",
      },
      breath: {
        ru: "Сделайте восемь циклов с длинным выдохом через рот. Затем вернитесь к носовому дыханию без счета и без контроля. [Пауза 80 секунд] Каждый выдох - это сигнал «не сейчас».",
        en: "Take eight cycles with a long exhale through your mouth. Then return to natural nose breathing without counting. [Pause 80 seconds] Each exhale is a signal: not now.",
      },
      body: {
        ru: "На вдохе слегка напрягайте стопы и кисти, на выдохе полностью отпускайте. Повторите шесть раз. [Пауза 45 секунд] Затем расслабьте лоб, язык, челюсть, плечи и низ живота.",
        en: "On inhale, lightly tense feet and hands; on exhale, release fully. Repeat six times. [Pause 45 seconds] Then soften forehead, tongue, jaw, shoulders, and lower belly.",
      },
      affirm: {
        ru: "Я могу отложить решения до утра. Ночь не для анализа, ночь для восстановления.",
        en: "I can postpone decisions until morning. Night is not for analysis, night is for recovery.",
      },
      close: {
        ru: "Выберите одну фразу-закрытие: «утром разберусь». Повторите ее три раза и перестаньте проверять мысли. Просто оставайтесь в дыхании и темноте.",
        en: "Choose one closing phrase: I will handle this in the morning. Repeat it three times and stop auditing thoughts. Stay with breath and darkness.",
      },
      journal: {
        ru: "Какая тема чаще всего не отпускает меня ночью и требует отдельного дневного слота?",
        en: "Which topic keeps returning at night and needs a dedicated daytime slot?",
      },
    },
  },
  {
    slug: "deep-recovery-sunday-reset",
    title: { ru: "Глубокий недельный reset", en: "Deep weekly recovery reset" },
    short: {
      ru: "Signature-трек для завершения недели: снять остаточный шум и войти в новую неделю спокойнее.",
      en: "A signature track to close the week and enter the next one with lower internal noise.",
    },
    durationMin: 21,
    freeTier: false,
    gradient: "dusk",
    categorySlug: "weekly-signature",
    pillarId: "close_day",
    sensual: false,
    audio: audio("deep-recovery-sunday-reset", 21),
    script: {
      intro: {
        ru: "Эта длинная сессия создана как weekly checkpoint. Мы закроем эмоциональные хвосты недели и оставим только то, что действительно важно взять дальше.",
        en: "This long session is built as a weekly checkpoint. We close emotional leftovers and carry forward only what is truly worth keeping.",
      },
      settling: {
        ru: "Сядьте или лягте так, чтобы можно было не двигаться ближайшие двадцать минут. [Пауза 20 секунд] Мысленно назовите три темы, которые больше всего нагружали вас на этой неделе.",
        en: "Sit or lie in a way you can stay still for twenty minutes. [Pause 20 seconds] Silently name three themes that loaded you most this week.",
      },
      breath: {
        ru: "Первый блок - десять циклов 4-6. Второй блок - свободное дыхание, но с фокусом на полном выдохе. [Пауза 95 секунд] На каждом выдохе мысленно завершайте одну тему недели.",
        en: "First block: ten rounds of 4-6. Second block: free breathing with attention on full exhale. [Pause 95 seconds] On each exhale, mentally close one weekly thread.",
      },
      body: {
        ru: "Пройдите вниманием по телу: лицо, шея, плечи, грудь, живот, таз, ноги. На каждой зоне говорите: «снимаю остаточное». [Пауза 120 секунд] Если где-то остается плотность, дайте этой зоне больше времени.",
        en: "Move attention through body: face, neck, shoulders, chest, belly, pelvis, legs. In each area say: releasing residual load. [Pause 120 seconds] If density remains somewhere, give that area more time.",
      },
      affirm: {
        ru: "Я завершаю неделю с уважением к себе, а не через внутренний долг.",
        en: "I close the week with self-respect, not internal debt.",
      },
      close: {
        ru: "Выберите один фокус на следующую неделю: не список задач, а состояние, которое вы хотите сохранить. Откройте глаза и сделайте спокойный переход в реальность.",
        en: "Choose one focus for next week: not a task list, but a state you want to preserve. Open your eyes and transition calmly back into your evening.",
      },
      journal: {
        ru: "Какое одно правило поможет мне не перенести старый перегруз в новую неделю?",
        en: "What one rule will help me avoid carrying old overload into the new week?",
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
