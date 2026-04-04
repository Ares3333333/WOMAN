import { NextResponse } from "next/server";

/** No database — only confirms Next.js responds. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "sora-calm",
    hint: "If this works but /api/health/db shows ok:false, fix DATABASE_URL (use file:./dev.db for SQLite) and run npm run db:setup.",
  });
}
