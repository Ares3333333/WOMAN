"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { adminSessionSchema, aiGeneratorFormSchema } from "@/lib/validations/admin-session";
import { generateDraftFromTemplate } from "@/lib/session-generation";
import type { ScriptSections } from "@/types/script";
import { scriptToTranscript } from "@/types/script";
import { getTtsProvider } from "@/lib/tts/factory";
import { GenerationLogKind } from "@prisma/client";

function assertAdmin(email: string | null | undefined) {
  const raw = process.env.ADMIN_EMAILS?.split(",").map((s) => s.trim().toLowerCase()) ?? [];
  if (raw.length === 0) return;
  if (!email || !raw.includes(email.toLowerCase())) {
    throw new Error("Forbidden");
  }
}

export async function adminUpsertSession(formData: FormData) {
  const userSession = await auth();
  assertAdmin(userSession?.user?.email);
  if (!userSession?.user?.id) throw new Error("Unauthorized");

  const raw = Object.fromEntries(formData.entries());
  const tagIds = formData.getAll("tagIds").map(String).filter(Boolean);
  const parsed = adminSessionSchema.safeParse({ ...raw, tagIds });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;
  const id = formData.get("id")?.toString();

  const data = {
    title: v.title,
    slug: v.slug,
    shortDescription: v.shortDescription,
    longDescription: v.longDescription,
    categoryId: v.categoryId,
    durationMinutes: v.durationMinutes,
    intensity: v.intensity,
    tone: v.tone,
    contraindicationNote: v.contraindicationNote ?? null,
    voiceStyle: v.voiceStyle,
    coverGradient: v.coverGradient,
    published: v.published,
    freeTier: v.freeTier,
    scriptJson: v.scriptJson,
  };

  let wellnessId: string;
  if (id) {
    const updated = await prisma.wellnessSession.update({ where: { id }, data });
    wellnessId = updated.id;
  } else {
    const created = await prisma.wellnessSession.create({ data });
    wellnessId = created.id;
  }

  await prisma.sessionTag.deleteMany({ where: { sessionId: wellnessId } });
  for (const tid of v.tagIds ?? []) {
    await prisma.sessionTag.create({ data: { sessionId: wellnessId, tagId: tid } });
  }

  revalidatePath("/admin/sessions");
  revalidatePath("/app/library");
  return { ok: true, id: wellnessId };
}

export async function adminDeleteSession(id: string) {
  const userSession = await auth();
  assertAdmin(userSession?.user?.email);
  await prisma.wellnessSession.delete({ where: { id } });
  revalidatePath("/admin/sessions");
  return { ok: true };
}

export async function adminDeleteSessionForm(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await adminDeleteSession(id);
}

export async function adminGenerateScript(formData: FormData) {
  const userSession = await auth();
  assertAdmin(userSession?.user?.email);

  const raw = Object.fromEntries(formData.entries());
  const parsed = aiGeneratorFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const input = parsed.data;

  try {
    const draft = await generateDraftFromTemplate({
      targetMood: input.targetMood,
      category: input.category,
      durationMinutes: input.duration,
      tone: input.tone,
      goal: input.goal,
      voiceStyle: input.voiceStyle,
      forbiddenPhrases: input.forbiddenPhrases,
    });

    await prisma.adminGenerationLog.create({
      data: {
        kind: GenerationLogKind.script,
        inputJson: JSON.stringify(input),
        outputJson: JSON.stringify(draft),
      },
    });

    return { ok: true, draft };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    await prisma.adminGenerationLog.create({
      data: {
        kind: GenerationLogKind.script,
        inputJson: JSON.stringify(input),
        error: message,
      },
    });
    return { ok: false, error: message };
  }
}

export async function adminGenerateTts(sessionId: string) {
  const userSession = await auth();
  assertAdmin(userSession?.user?.email);

  const ws = await prisma.wellnessSession.findUnique({ where: { id: sessionId } });
  if (!ws) return { ok: false, error: "Session not found" };

  let scriptText: string;
  try {
    const sections = JSON.parse(ws.scriptJson) as ScriptSections;
    scriptText = scriptToTranscript(sections);
  } catch {
    return { ok: false, error: "Invalid script JSON" };
  }

  try {
    const tts = getTtsProvider();
    const result = await tts.generateAudio({ text: scriptText, voiceStyle: ws.voiceStyle });
    await prisma.wellnessSession.update({
      where: { id: sessionId },
      data: { audioFileUrl: result.url },
    });
    await prisma.adminGenerationLog.create({
      data: {
        kind: GenerationLogKind.tts,
        inputJson: JSON.stringify({ sessionId, voiceStyle: ws.voiceStyle }),
        outputJson: JSON.stringify(result),
      },
    });
    revalidatePath(`/admin/sessions/${sessionId}/edit`);
    return { ok: true, result };
  } catch (e) {
    const message = e instanceof Error ? e.message : "TTS failed";
    await prisma.adminGenerationLog.create({
      data: {
        kind: GenerationLogKind.tts,
        inputJson: JSON.stringify({ sessionId }),
        error: message,
      },
    });
    return { ok: false, error: message };
  }
}

export async function adminUploadAudioUrl(sessionId: string, url: string) {
  const userSession = await auth();
  assertAdmin(userSession?.user?.email);
  if (!url.startsWith("/") && !url.startsWith("https://")) {
    return { ok: false, error: "Invalid URL" };
  }
  await prisma.wellnessSession.update({
    where: { id: sessionId },
    data: { audioFileUrl: url },
  });
  revalidatePath(`/admin/sessions/${sessionId}/edit`);
  return { ok: true };
}
