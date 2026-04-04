/** Structured seed sessions — wellness copy only, consent-first, non-explicit. */

const settling =
  "Choose a position that feels supported. Soften your jaw and let your shoulders drop. You can adjust anytime — this is your space.";

const breath =
  "Inhale gently through your nose. Exhale a little longer through your mouth, as if fogging a mirror. Let the exhale be an unhurried signal of safety.";

const body =
  "Notice where your body meets the chair, floor, or bed. Name one neutral sensation: warmth, weight, or the rise of your ribs. Return here when the mind wanders.";

const affirm =
  "Nothing here needs to be fixed. Calm is not a performance — it is permission to be present with yourself, gently.";

const close =
  "Take one deeper breath. When you are ready, wiggle fingers and toes. Carry a small pocket of softness with you as you return.";

function script(theme: string, journal: string) {
  return {
    intro: `${theme} Move only in ways that feel kind. Pause or stop whenever you wish.`,
    settling,
    guidedBreathing: breath,
    bodyAwareness: body,
    affirmation: affirm,
    closing: close,
    journalPrompt: journal,
  };
}

export const SEED_SESSIONS = [
  {
    title: "Five-minute nervous system reset",
    slug: "five-minute-nervous-system-reset",
    shortDescription: "A compact reset when your system feels wired but you only have a few minutes.",
    longDescription:
      "Short guided calming audio to downshift stress responses. Wellness only — not medical treatment.",
    categorySlug: "stress-relief",
    tagSlugs: ["quick", "nervous-system", "reset"],
    durationMinutes: 5,
    intensity: "light" as const,
    tone: "soft" as const,
    voiceStyle: "calm",
    coverGradient: "rose-plum",
    published: true,
    freeTier: true,
    contraindicationNote: "If you feel faint when slowing breath, breathe naturally and stop the exercise.",
    script: script(
      "Welcome to a brief pause for your nervous system.",
      "What felt 1% softer by the end?"
    ),
  },
  {
    title: "When everything feels too much",
    slug: "when-everything-feels-too-much",
    shortDescription: "Gentle containment when overwhelm is loud.",
    longDescription:
      "Grounding language and breath to help you feel a little more room inside. Not therapy — supportive audio only.",
    categorySlug: "stress-relief",
    tagSlugs: ["overwhelm", "grounding"],
    durationMinutes: 12,
    intensity: "medium" as const,
    tone: "grounding" as const,
    voiceStyle: "warm",
    coverGradient: "cream-mauve",
    published: true,
    freeTier: true,
    script: script(
      "If everything feels like too much, you are not failing — your system is asking for slowness.",
      "What boundary would feel kindest tonight?"
    ),
  },
  {
    title: "Sleep after an emotionally hard day",
    slug: "sleep-after-an-emotionally-hard-day",
    shortDescription: "A tender wind-down when your heart feels full.",
    longDescription:
      "Bedtime-oriented calming audio. For rest support, not trauma processing or crisis care.",
    categorySlug: "sleep",
    tagSlugs: ["sleep", "evening", "gentle"],
    durationMinutes: 18,
    intensity: "light" as const,
    tone: "sleep" as const,
    voiceStyle: "bedtime_soft",
    coverGradient: "sleep",
    published: true,
    freeTier: false,
    script: script(
      "Let the day soften at the edges. You do not have to resolve everything before you rest.",
      "What are you willing to set down until morning?"
    ),
  },
  {
    title: "Gentle body reconnection",
    slug: "gentle-body-reconnection",
    shortDescription: "Return to physical presence with patience.",
    longDescription:
      "Body awareness and breath to reconnect with yourself. Consent-first; move only as feels right.",
    categorySlug: "body-awareness",
    tagSlugs: ["embodiment", "presence"],
    durationMinutes: 14,
    intensity: "medium" as const,
    tone: "soft" as const,
    voiceStyle: "warm",
    coverGradient: "rose-plum",
    published: true,
    freeTier: true,
    script: script(
      "Welcome home to your body — not to change it, simply to be with it.",
      "Where did you notice the gentlest sensation?"
    ),
  },
  {
    title: "Softness after stress",
    slug: "softness-after-stress",
    shortDescription: "A warm exhale when tension has been high.",
    longDescription:
      "Soothing audio for stress aftercare. Wellness guidance only.",
    categorySlug: "emotional-reset",
    tagSlugs: ["softness", "recovery"],
    durationMinutes: 10,
    intensity: "light" as const,
    tone: "soft" as const,
    voiceStyle: "calm",
    coverGradient: "dusk",
    published: true,
    freeTier: true,
    script: script(
      "Stress can leave a sharp edge — here, we practice softness without forcing calm.",
      "What softened first: breath, shoulders, or thoughts?"
    ),
  },
  {
    title: "Grounding before bed",
    slug: "grounding-before-bed",
    shortDescription: "Simple anchors for a quieter mind at night.",
    longDescription:
      "Grounding and breath to support sleep readiness. Not a substitute for clinical insomnia care.",
    categorySlug: "sleep",
    tagSlugs: ["grounding", "night"],
    durationMinutes: 15,
    intensity: "light" as const,
    tone: "sleep" as const,
    voiceStyle: "bedtime_soft",
    coverGradient: "sleep",
    published: true,
    freeTier: true,
    script: script(
      "Let the mind land, little by little, like snow on quiet ground.",
      "What felt heavier in a comforting way?"
    ),
  },
  {
    title: "Morning confidence reset",
    slug: "morning-confidence-reset",
    shortDescription: "Quiet strength to begin the day.",
    longDescription:
      "Uplifting yet steady language for mornings — confidence as self-trust, not pressure.",
    categorySlug: "morning-reset",
    tagSlugs: ["morning", "confidence"],
    durationMinutes: 8,
    intensity: "light" as const,
    tone: "uplifting" as const,
    voiceStyle: "confident",
    coverGradient: "cream-mauve",
    published: true,
    freeTier: true,
    script: script(
      "Begin as you are. Strength here means showing up with honesty and care.",
      "What intention feels spacious for today?"
    ),
  },
  {
    title: "Reconnect with your breath",
    slug: "reconnect-with-your-breath",
    shortDescription: "Breath as a simple anchor you can return to.",
    longDescription:
      "Breathing-focused session. Stop if dizzy; breathe at your own pace.",
    categorySlug: "breathing",
    tagSlugs: ["breath", "anchor"],
    durationMinutes: 7,
    intensity: "light" as const,
    tone: "grounding" as const,
    voiceStyle: "calm",
    coverGradient: "rose-plum",
    published: true,
    freeTier: true,
    contraindicationNote: "Avoid extended breath-holding; keep breath comfortable.",
    script: script(
      "Your breath is a quiet doorway back to the present moment.",
      "When did your breath feel most natural?"
    ),
  },
  {
    title: "Emotional release without overwhelm",
    slug: "emotional-release-without-overwhelm",
    shortDescription: "Make room for feelings with gentle pacing.",
    longDescription:
      "Emotional reset audio — not therapy. If you are in crisis, seek professional support.",
    categorySlug: "emotional-reset",
    tagSlugs: ["emotions", "pace"],
    durationMinutes: 16,
    intensity: "medium" as const,
    tone: "grounding" as const,
    voiceStyle: "warm",
    coverGradient: "dusk",
    published: true,
    freeTier: false,
    script: script(
      "Feelings can move when they are not rushed. You set the tempo.",
      "What did you honor by going slowly?"
    ),
  },
  {
    title: "Sensual softness (consent-first)",
    slug: "sensual-softness-consent-first",
    shortDescription: "Embodied calm and self-connection in non-explicit language.",
    longDescription:
      "Gentle sensual wellness focused on breath, warmth, and boundaries you choose. Skip if not welcome — you are always in charge.",
    categorySlug: "sensual-wellness",
    tagSlugs: ["embodiment", "softness", "consent"],
    durationMinutes: 12,
    intensity: "medium" as const,
    tone: "sensual_soft" as const,
    voiceStyle: "warm",
    coverGradient: "cream-mauve",
    published: true,
    freeTier: false,
    script: script(
      "This is an invitation, never a demand. Curiosity toward your own comfort is enough.",
      "What boundary felt most caring today?"
    ),
  },
  {
    title: "Afternoon exhale",
    slug: "afternoon-exhale",
    shortDescription: "A mid-day nervous system exhale.",
    longDescription:
      "Short breathing and grounding for busy afternoons.",
    categorySlug: "breathing",
    tagSlugs: ["afternoon", "breath"],
    durationMinutes: 6,
    intensity: "light" as const,
    tone: "soft" as const,
    voiceStyle: "calm",
    coverGradient: "rose-plum",
    published: true,
    freeTier: true,
    script: script(
      "Let the middle of the day hold a small exhale of relief.",
      "What tension dropped first?"
    ),
  },
  {
    title: "Return to your center",
    slug: "return-to-your-center",
    shortDescription: "Grounding when you feel pulled in many directions.",
    longDescription:
      "Grounding practice for scattered attention. Wellness only.",
    categorySlug: "grounding",
    tagSlugs: ["center", "focus"],
    durationMinutes: 11,
    intensity: "medium" as const,
    tone: "grounding" as const,
    voiceStyle: "warm",
    coverGradient: "dusk",
    published: true,
    freeTier: true,
    script: script(
      "Your center is not perfection — it is the place you can return with kindness.",
      "What helped you feel a little more gathered?"
    ),
  },
  {
    title: "Quiet strength for hard meetings",
    slug: "quiet-strength-for-hard-meetings",
    shortDescription: "Soft power before stepping into intensity.",
    longDescription:
      "Confidence framing as steadiness and self-respect — not performance.",
    categorySlug: "confidence-soft-power",
    tagSlugs: ["confidence", "work"],
    durationMinutes: 9,
    intensity: "light" as const,
    tone: "uplifting" as const,
    voiceStyle: "confident",
    coverGradient: "cream-mauve",
    published: true,
    freeTier: false,
    script: script(
      "You can be clear and kind at once. Let your breath widen your spine.",
      "What quality do you want to carry into the room?"
    ),
  },
  {
    title: "Wind-down for sensitive systems",
    slug: "wind-down-for-sensitive-systems",
    shortDescription: "Extra gentle pacing for overstimulated days.",
    longDescription:
      "Slowed language and breath for sensitive nervous systems.",
    categorySlug: "stress-relief",
    tagSlugs: ["sensitive", "slow"],
    durationMinutes: 14,
    intensity: "light" as const,
    tone: "soft" as const,
    voiceStyle: "bedtime_soft",
    coverGradient: "rose-plum",
    published: true,
    freeTier: true,
    script: script(
      "If your system runs hot, we move like cool water — no rush.",
      "What sensory detail felt safest?"
    ),
  },
  {
    title: "Body scan for tired minds",
    slug: "body-scan-for-tired-minds",
    shortDescription: "Simple scanning without fixing anything.",
    longDescription:
      "Body awareness meditation in accessible language.",
    categorySlug: "body-awareness",
    tagSlugs: ["body-scan", "rest"],
    durationMinutes: 13,
    intensity: "medium" as const,
    tone: "grounding" as const,
    voiceStyle: "calm",
    coverGradient: "dusk",
    published: true,
    freeTier: true,
    script: script(
      "Notice without judging — tired minds deserve gentle maps of the body.",
      "Which area asked for softness?"
    ),
  },
  {
    title: "First light ritual",
    slug: "first-light-ritual",
    shortDescription: "A soft beginning when the world feels loud.",
    longDescription:
      "Morning reset with breath and affirmation — intimate wellness, never explicit.",
    categorySlug: "morning-reset",
    tagSlugs: ["morning", "ritual"],
    durationMinutes: 10,
    intensity: "light" as const,
    tone: "uplifting" as const,
    voiceStyle: "warm",
    coverGradient: "cream-mauve",
    published: true,
    freeTier: true,
    script: script(
      "First light is a private threshold — cross it gently.",
      "What felt sacred in this small ritual?"
    ),
  },
  {
    title: "Self-held gentleness",
    slug: "self-held-gentleness",
    shortDescription: "Practice holding yourself with care.",
    longDescription:
      "Emotional reset emphasizing self-compassion. Not a replacement for therapy.",
    categorySlug: "emotional-reset",
    tagSlugs: ["self-compassion"],
    durationMinutes: 12,
    intensity: "light" as const,
    tone: "soft" as const,
    voiceStyle: "warm",
    coverGradient: "rose-plum",
    published: true,
    freeTier: true,
    script: script(
      "Imagine your own hand steady on your heart — metaphorically or physically, as you choose.",
      "What words would you offer a dear friend that you can offer yourself?"
    ),
  },
  {
    title: "Deep rest invitation",
    slug: "deep-rest-invitation",
    shortDescription: "Longer exhale toward restful states.",
    longDescription:
      "Extended relaxation audio — premium wind-down series placeholder.",
    categorySlug: "sleep",
    tagSlugs: ["deep-rest", "premium"],
    durationMinutes: 22,
    intensity: "deep" as const,
    tone: "sleep" as const,
    voiceStyle: "bedtime_soft",
    coverGradient: "sleep",
    published: true,
    freeTier: false,
    script: script(
      "Rest is not earned — it is biological. Allow this invitation without bargaining.",
      "What part of you thanked you for resting?"
    ),
  },
  {
    title: "Before a difficult conversation",
    slug: "before-a-difficult-conversation",
    shortDescription: "Steady your voice, breath, and spine before you speak your truth.",
    longDescription:
      "A pre-conversation ritual: breath, grounding, and gentle framing for clarity without bracing. Wellness skill-building — not conflict mediation.",
    categorySlug: "confidence-soft-power",
    tagSlugs: ["boundaries", "communication"],
    durationMinutes: 9,
    intensity: "light" as const,
    tone: "grounding" as const,
    voiceStyle: "warm",
    coverGradient: "dusk",
    published: true,
    freeTier: true,
    script: {
      intro:
        "You are allowed to speak clearly and still be kind. This time is only for you — to arrive in your body before words meet air.",
      settling,
      guidedBreathing:
        "Inhale for four gentle counts. Exhale for six, as if smoothing a wrinkle in fabric. Repeat until your shoulders feel a millimeter lower.",
      bodyAwareness:
        "Feel the soles of your feet, the seat beneath you. Imagine a quiet line of strength from tailbone through the crown — flexible, not rigid.",
      affirmation:
        "You do not need to over-explain your boundaries. A steady breath is already a form of honesty.",
      closing: close,
      journalPrompt: "What is the one sentence you want to remember if you start to shrink?",
    },
  },
  {
    title: "After hard news — holding yourself",
    slug: "after-hard-news-softening",
    shortDescription: "When the world narrows, widen your breath in tiny steps.",
    longDescription:
      "Supportive pacing after upsetting information. Not trauma therapy — a gentle container for your nervous system in the moment.",
    categorySlug: "emotional-reset",
    tagSlugs: ["grief", "support"],
    durationMinutes: 14,
    intensity: "medium" as const,
    tone: "soft" as const,
    voiceStyle: "warm",
    coverGradient: "rose-plum",
    published: true,
    freeTier: true,
    script: {
      intro:
        "Sometimes news lands like cold water. You are not dramatic for feeling shaken — your body is doing what bodies do.",
      settling,
      guidedBreathing:
        "Breathe as slowly as honesty allows. If long exhales feel wrong, return to natural breath — there is no prize for forcing calm.",
      bodyAwareness:
        "Place a palm over your chest or belly — whichever feels less exposing. Notice temperature, texture, the subtle rise under your hand.",
      affirmation:
        "You can feel more than one thing. Grief and hunger for rest can sit beside each other without needing a verdict.",
      closing: close,
      journalPrompt: "What do you need someone trustworthy to know about today — even if you never say it aloud?",
    },
  },
  {
    title: "Inner boundary rehearsal",
    slug: "inner-boundary-rehearsal",
    shortDescription: "Practice saying no in the body before you say it out loud.",
    longDescription:
      "Embodied rehearsal for limits and self-respect — wellness coaching tone, not legal or therapeutic advice.",
    categorySlug: "confidence-soft-power",
    tagSlugs: ["boundaries", "self-trust"],
    durationMinutes: 11,
    intensity: "medium" as const,
    tone: "uplifting" as const,
    voiceStyle: "confident",
    coverGradient: "cream-mauve",
    published: true,
    freeTier: false,
    script: {
      intro:
        "Boundaries are not cruelty — they are the shape of your care, including care for yourself. Whisper the word no internally; notice what shifts.",
      settling,
      guidedBreathing:
        "Inhale: I have limits. Exhale: that is human. Let each exhale be permission rather than apology.",
      bodyAwareness:
        "Scan jaw, hands, belly. Where does no live today? Soften anywhere you are gripping as if bracing for a fight you do not want.",
      affirmation:
        "A clear no can be soft in delivery and firm in meaning. You are practicing both.",
      closing: close,
      journalPrompt: "Where have you been over-giving — and what would a 10% reduction look like?",
    },
  },
  {
    title: "Cycle stress — gentle downshift",
    slug: "cycle-stress-softening",
    shortDescription: "For days hormones make everything feel louder.",
    longDescription:
      "Wellness audio for premenstrual or cyclic sensitivity — soothing language only, not medical guidance about hormones or mood disorders.",
    categorySlug: "stress-relief",
    tagSlugs: ["cycle", "sensitivity"],
    durationMinutes: 10,
    intensity: "light" as const,
    tone: "soft" as const,
    voiceStyle: "warm",
    coverGradient: "rose-plum",
    published: true,
    freeTier: true,
    script: {
      intro:
        "If your inner volume knob feels stuck high, this is a quiet dial-down — sensory kindness, not a demand to feel better instantly.",
      settling,
      guidedBreathing:
        "Let the belly expand without judgment. Breath does not need to be pretty; it only needs to be allowed.",
      bodyAwareness:
        "Notice heat, ache, or restlessness with curiosity instead of argument. Label sensations neutrally: tight, warm, humming.",
      affirmation:
        "Needing softness is not regression — it is wisdom on a loud day.",
      closing: close,
      journalPrompt: "What single comfort (tea, darkness, silence) would feel like advocacy for yourself?",
    },
  },
  {
    title: "When anxiety surges — breath & anchor",
    slug: "when-anxiety-surges-breath-anchor",
    shortDescription: "Short anchors when worry spikes — stop anytime.",
    longDescription:
      "Breath-led downshift for anxious activation. Not exposure therapy or panic treatment — discontinue if breathwork worsens symptoms.",
    categorySlug: "breathing",
    tagSlugs: ["anxiety", "anchor"],
    durationMinutes: 8,
    intensity: "light" as const,
    tone: "grounding" as const,
    voiceStyle: "calm",
    coverGradient: "dusk",
    published: true,
    freeTier: true,
    contraindicationNote:
      "If you feel dizzy, tingling, or more anxious, breathe naturally and pause. Seek professional support for recurring panic.",
    script: {
      intro:
        "This is a portable anchor — something you can steal even in a bathroom stall. You are in charge of pace.",
      settling,
      guidedBreathing:
        "Box breath optional: inhale four, hold four, exhale four, hold four — only if it feels steady. Otherwise lengthen only the exhale slightly.",
      bodyAwareness:
        "Name five things you can see, four you can hear, three you can touch. Slow the naming like honey off a spoon.",
      affirmation:
        "Anxiety can lie about urgency. Your breath is a quiet fact-check.",
      closing: close,
      journalPrompt: "What is one true thing about this moment that fear is ignoring?",
    },
  },
  {
    title: "Micro-pause for overloaded caregivers",
    slug: "micro-pause-overloaded-caregivers",
    shortDescription: "Ninety seconds of permission when everyone needs you.",
    longDescription:
      "Ultra-short reset for chronic mental load — wellness only, not parenting therapy or burnout treatment.",
    categorySlug: "stress-relief",
    tagSlugs: ["caregiver", "quick"],
    durationMinutes: 4,
    intensity: "light" as const,
    tone: "soft" as const,
    voiceStyle: "calm",
    coverGradient: "cream-mauve",
    published: true,
    freeTier: true,
    script: {
      intro:
        "If you are holding a household in your mind, this pause is not selfish — it is maintenance. Ninety seconds, door closed if you can.",
      settling,
      guidedBreathing:
        "Three slow breaths where the exhale is longer than the inhale. Imagine handing one invisible task to the floor for just this minute.",
      bodyAwareness:
        "Unclench toes, unclench jaw. Let the next demand wait behind a velvet rope — it can wait ninety seconds.",
      affirmation:
        "Your worth is not your output. Even heroes need oxygen before the next scene.",
      closing: close,
      journalPrompt: "What help would you accept if pride stepped out of the room?",
    },
  },
];
