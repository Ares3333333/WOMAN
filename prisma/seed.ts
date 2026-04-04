import { PrismaClient, type SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SEED_SESSIONS } from "./seed-content";

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    slug: "stress-relief",
    name: "Quiet downshift",
    description: "For wired days, overload, and the need to lower the inner volume.",
    sortOrder: 1,
  },
  {
    slug: "breathing",
    name: "Breath-led pauses",
    description: "Small anchors between obligations — pace you choose, always.",
    sortOrder: 2,
  },
  {
    slug: "grounding",
    name: "Here, now",
    description: "Gentle return to the present when attention scatters.",
    sortOrder: 3,
  },
  {
    slug: "sleep",
    name: "Evening & rest",
    description: "Wind-down and bedside listens — rest without bargaining with yourself.",
    sortOrder: 4,
  },
  {
    slug: "emotional-reset",
    name: "Emotional aftercare",
    description: "Space after weight, news, or fatigue — not therapy, held tone.",
    sortOrder: 5,
  },
  {
    slug: "body-awareness",
    name: "Embodied presence",
    description: "Sensation-first listening — curiosity, not correction.",
    sortOrder: 6,
  },
  {
    slug: "sensual-wellness",
    name: "Soft embodiment",
    description: "Warm, consent-first, never explicit — you lead every boundary.",
    sortOrder: 7,
  },
  {
    slug: "morning-reset",
    name: "First light",
    description: "Threshold moments before the day asks for performance.",
    sortOrder: 8,
  },
  {
    slug: "confidence-soft-power",
    name: "Clear & kind",
    description: "Voice, limits, and steadiness without bracing.",
    sortOrder: 9,
  },
];

const DEMO_ACCOUNTS: {
  email: string;
  password: string;
  name: string;
  subscriptionStatus: SubscriptionStatus;
}[] = [
  {
    email: "demo@soracalm.app",
    password: "demo123456",
    name: "Explorer guest",
    subscriptionStatus: "none",
  },
  {
    email: "premium@soracalm.app",
    password: "premium123456",
    name: "Signature member (preview)",
    subscriptionStatus: "active",
  },
];

async function main() {
  for (const c of CATEGORIES) {
    await prisma.sessionCategory.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, description: c.description, sortOrder: c.sortOrder },
    });
  }

  const tagNames = new Set<string>();
  SEED_SESSIONS.forEach((s) => s.tagSlugs.forEach((t) => tagNames.add(t)));
  const tags = Array.from(tagNames);
  for (const slug of tags) {
    await prisma.tag.upsert({
      where: { slug },
      create: { slug, name: slug.replace(/-/g, " ") },
      update: { name: slug.replace(/-/g, " ") },
    });
  }

  const catMap = Object.fromEntries(
    (await prisma.sessionCategory.findMany()).map((c) => [c.slug, c.id])
  );
  const tagMap = Object.fromEntries((await prisma.tag.findMany()).map((t) => [t.slug, t.id]));

  for (const s of SEED_SESSIONS) {
    const categoryId = catMap[s.categorySlug];
    if (!categoryId) throw new Error(`Missing category ${s.categorySlug}`);

    const session = await prisma.wellnessSession.upsert({
      where: { slug: s.slug },
      create: {
        title: s.title,
        slug: s.slug,
        shortDescription: s.shortDescription,
        longDescription: s.longDescription,
        categoryId,
        durationMinutes: s.durationMinutes,
        intensity: s.intensity,
        tone: s.tone,
        contraindicationNote: s.contraindicationNote ?? null,
        scriptJson: JSON.stringify(s.script),
        voiceStyle: s.voiceStyle,
        audioFileUrl: null,
        coverGradient: s.coverGradient,
        published: s.published,
        freeTier: s.freeTier,
      },
      update: {
        title: s.title,
        shortDescription: s.shortDescription,
        longDescription: s.longDescription,
        categoryId,
        durationMinutes: s.durationMinutes,
        intensity: s.intensity,
        tone: s.tone,
        contraindicationNote: s.contraindicationNote ?? null,
        scriptJson: JSON.stringify(s.script),
        voiceStyle: s.voiceStyle,
        coverGradient: s.coverGradient,
        published: s.published,
        freeTier: s.freeTier,
      },
    });

    await prisma.sessionTag.deleteMany({ where: { sessionId: session.id } });
    for (const ts of s.tagSlugs) {
      const tid = tagMap[ts];
      if (tid) {
        await prisma.sessionTag.create({ data: { sessionId: session.id, tagId: tid } });
      }
    }
  }

  await prisma.subscriptionPlan.upsert({
    where: { slug: "free" },
    create: {
      name: "Explorer",
      slug: "free",
      description:
        "A curated opening set — enough to feel how the room holds you before you choose more.",
      stripePriceId: null,
      featuresJson: JSON.stringify({ sessions: "curated_free" }),
      sortOrder: 1,
    },
    update: {
      name: "Explorer",
      description:
        "A curated opening set — enough to feel how the room holds you before you choose more.",
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { slug: "premium" },
    create: {
      name: "Signature · Monthly",
      slug: "premium",
      description:
        "The residence tier — full library, longer evenings, sequenced paths, and first look at new work as it ships. Intended ~$100/month; secure checkout when enabled for your deployment.",
      stripePriceId: process.env.STRIPE_PRICE_PREMIUM ?? null,
      featuresJson: JSON.stringify({
        sessions: "full",
        priceUsd: 100,
        cadence: "monthly",
        bedtime: true,
        programs: true,
      }),
      sortOrder: 2,
    },
    update: {
      name: "Signature · Monthly",
      description:
        "The residence tier — full library, longer evenings, sequenced paths, and first look at new work as it ships. Intended ~$100/month; secure checkout when enabled for your deployment.",
      stripePriceId: process.env.STRIPE_PRICE_PREMIUM ?? null,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { slug: "addons" },
    create: {
      name: "Add-on · Deep calm lab",
      slug: "addons",
      description:
        "A companion shelf — printable workbooks, extended series, deeper wind-downs — for listeners who want something to hold beyond the headphones. ~$49 one-time when payments open (indicative), outside Signature.",
      stripePriceId: process.env.STRIPE_PRICE_ADDON ?? null,
      featuresJson: JSON.stringify({ type: "addon", priceUsdApprox: 49 }),
      sortOrder: 3,
    },
    update: {
      name: "Add-on · Deep calm lab",
      description:
        "A companion shelf — printable workbooks, extended series, deeper wind-downs — for listeners who want something to hold beyond the headphones. ~$49 one-time when payments open (indicative), outside Signature.",
      stripePriceId: process.env.STRIPE_PRICE_ADDON ?? null,
    },
  });

  for (const acct of DEMO_ACCOUNTS) {
    const passwordHash = await bcrypt.hash(acct.password, 12);
    const user = await prisma.user.upsert({
      where: { email: acct.email },
      create: {
        email: acct.email,
        name: acct.name,
        passwordHash,
        subscriptionStatus: acct.subscriptionStatus,
        profile: { create: {} },
        preference: {
          create: {
            onboardingComplete: true,
            sensualContentMode: "optional",
            preferredSessionLength: "10-15",
            stressLevel: 5,
            voiceTonePref: "warm",
            listeningTimePref: "evening",
          },
        },
      },
      update: {
        passwordHash,
        name: acct.name,
        subscriptionStatus: acct.subscriptionStatus,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    await prisma.preference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        onboardingComplete: true,
        sensualContentMode: "optional",
        preferredSessionLength: "10-15",
        stressLevel: 5,
        voiceTonePref: "warm",
        listeningTimePref: "evening",
      },
      update: {
        onboardingComplete: true,
      },
    });
  }

  console.log("Seed complete.");
  console.log("  Free tier:   demo@soracalm.app / demo123456");
  console.log("  Full access: premium@soracalm.app / premium123456");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
