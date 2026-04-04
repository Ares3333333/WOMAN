import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toSerializable } from "@/lib/plain";
import { EditSessionClient } from "./edit-session-client";
import { getPageI18n } from "@/lib/i18n/server";

export default async function EditAdminSessionPage({ params }: { params: { id: string } }) {
  const { t } = await getPageI18n();
  const { id } = params;
  const ws = await prisma.wellnessSession.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } }, category: true },
  });
  if (!ws) notFound();

  const categories = await prisma.sessionCategory.findMany({ orderBy: { sortOrder: "asc" } });
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  const logs = await prisma.adminGenerationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-medium">{t("admin.editPageTitle")}</h1>
      <EditSessionClient
        session={toSerializable(ws)}
        categories={toSerializable(categories)}
        tags={toSerializable(tags)}
        selectedTagIds={ws.tags.map((t) => t.tagId)}
        logs={toSerializable(logs)}
      />
    </div>
  );
}
