import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Locale } from "@/lib/i18n/types";

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS?.split(",").map((s) => s.trim().toLowerCase()) ?? [];
  if (raw.length === 0) return true;
  return raw.includes(email.toLowerCase());
}

function resolveLocale(req: NextRequest): Locale {
  const c = req.cookies.get("sora_locale")?.value;
  if (c === "ru" || c === "en") return c;
  const al = req.headers.get("accept-language")?.toLowerCase() ?? "";
  return al.includes("ru") ? "ru" : "en";
}

function withLocaleCookie(req: NextRequest, res: NextResponse): NextResponse {
  if (!req.cookies.get("sora_locale")) {
    res.cookies.set("sora_locale", resolveLocale(req), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return res;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isApp = pathname.startsWith("/app");
  const isAdmin = pathname.startsWith("/admin");
  const isAuthed = !!req.auth;

  if ((isApp || isAdmin) && !isAuthed) {
    const url = new URL("/sign-in", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return withLocaleCookie(req, NextResponse.redirect(url));
  }

  if (isAdmin && isAuthed && !isAdminEmail(req.auth?.user?.email)) {
    return withLocaleCookie(req, NextResponse.redirect(new URL("/app", req.nextUrl.origin)));
  }

  return withLocaleCookie(req, NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
