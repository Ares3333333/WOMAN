import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export function sensualFilterForUser(prefs: {
  sensualContentMode: string;
  skipSensualInFeed: boolean;
}): Prisma.WellnessSessionWhereInput {
  if (prefs.sensualContentMode === "hidden" || prefs.skipSensualInFeed) {
    return { category: { slug: { not: "sensual-wellness" } } };
  }
  return {};
}

export async function listPublishedSessions(where?: Prisma.WellnessSessionWhereInput) {
  return prisma.wellnessSession.findMany({
    where: { published: true, ...where },
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSessionBySlug(slug: string) {
  return prisma.wellnessSession.findFirst({
    where: { slug, published: true },
    include: { category: true, tags: { include: { tag: true } } },
  });
}

export async function getSessionById(id: string) {
  return prisma.wellnessSession.findFirst({
    where: { id, published: true },
    include: { category: true },
  });
}
