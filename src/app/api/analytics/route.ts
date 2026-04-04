import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  payload: z.record(z.string(), z.unknown()).optional(),
  ts: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const { name, payload, ts } = parsed.data;
    // MVP: log only — never log raw user-generated text; payloads should be minimal (see lib/analytics.ts).
    console.info("[analytics]", name, { ...payload, ts });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
