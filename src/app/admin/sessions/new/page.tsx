import { prisma } from "@/lib/prisma";
import { toSerializable } from "@/lib/plain";
import { NewSessionClient } from "./new-session-client";
import { getPageI18n } from "@/lib/i18n/server";

export default async function NewAdminSessionPage() {
  const { t } = await getPageI18n();
  const categories = await prisma.sessionCategory.findMany({ orderBy: { sortOrder: "asc" } });
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-medium">{t("admin.newPageTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("admin.newPageBody")}</p>
      <NewSessionClient categories={toSerializable(categories)} tags={toSerializable(tags)} />
    </div>
  );
}
