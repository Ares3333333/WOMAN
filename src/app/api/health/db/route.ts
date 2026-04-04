import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HealthPayload =
  | {
      ok: true;
      database: "connected";
      demoAccounts: { email: string | null; subscriptionStatus: string | null }[];
      hint: string;
    }
  | {
      ok: false;
      database: "disconnected_or_error";
      message: string;
      stepsRu: string[];
      stepsEn: string[];
    };

async function getPayload(): Promise<HealthPayload> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const demos = await prisma.user.findMany({
      where: { email: { in: ["demo@soracalm.app", "premium@soracalm.app"] } },
      select: { email: true, subscriptionStatus: true },
    });
    return {
      ok: true,
      database: "connected",
      demoAccounts: demos,
      hint:
        demos.length < 2
          ? "Run: npm run db:setup"
          : "OK — sign in with demo@soracalm.app / demo123456 or premium@soracalm.app / premium123456",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return {
      ok: false,
      database: "disconnected_or_error",
      message,
      stepsRu: [
        "1. В .env должно быть: DATABASE_URL=\"file:./dev.db\" (файл prisma/dev.db создаётся сам).",
        "2. Удалите старый .env, если там был postgresql:// — затем снова npm run dev.",
        "3. В папке проекта: npx prisma db push && npx prisma db seed",
        "4. Перезапустите npm run dev",
      ],
      stepsEn: [
        "1. .env should have: DATABASE_URL=\"file:./dev.db\" (creates prisma/dev.db).",
        "2. Delete old .env if it had postgresql:// — then npm run dev again.",
        "3. In project folder: npx prisma db push && npx prisma db seed",
        "4. Restart npm run dev",
      ],
    };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(req: NextRequest) {
  const payload = await getPayload();
  const accept = req.headers.get("accept") ?? "";
  const wantsHtml = accept.includes("text/html");

  // Always HTTP 200 so the browser does not show a generic "error" page for 503.
  if (wantsHtml) {
    const json = JSON.stringify(payload, null, 2);
    const steps =
      "ok" in payload && payload.ok === false
        ? `<h2>Что сделать (RU)</h2><ol>${payload.stepsRu.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
           <h2>What to do (EN)</h2><ol>${payload.stepsEn.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`
        : "";
    const statusLine =
      payload.ok === true
        ? `<p class="ok">База подключена. Аккаунтов: ${payload.demoAccounts.length} / 2 ожидается.</p>`
        : `<p class="bad">База не доступна. Ниже текст ошибки и шаги.</p>`;

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sora Calm — проверка базы</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    pre { background: #f4f4f5; padding: 1rem; overflow: auto; font-size: 12px; border-radius: 8px; }
    .ok { color: #15803d; }
    .bad { color: #b91c1c; }
    a { color: #7c3aed; }
  </style>
</head>
<body>
  <h1>Проверка базы данных</h1>
  <p><a href="/api/health">Проверка без базы (должно быть ok: true)</a> · <a href="/sign-in">Вход</a></p>
  ${statusLine}
  ${steps}
  <h2>Данные (JSON)</h2>
  <pre>${escapeHtml(json)}</pre>
</body>
</html>`;
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.json(payload, { status: 200 });
}
