import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import {
  DEV_BYPASS_PASSWORD,
  devAutoLoginEmail,
  isDevSkipLoginEnabled,
} from "@/lib/dev-auth";
import { SignInForm } from "./sign-in-form";

export const dynamic = "force-dynamic";

function safeCallbackUrl(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/app";
  return raw;
}

function isAuthFailureLocation(location: string): boolean {
  try {
    const u = location.includes("://")
      ? new URL(location)
      : new URL(location, "http://localhost");
    return u.searchParams.has("error");
  } catch {
    return true;
  }
}

function nextRedirectPath(location: string): string {
  if (location.startsWith("/")) return location;
  try {
    const u = new URL(location);
    return `${u.pathname}${u.search}`;
  } catch {
    return "/app";
  }
}

function isNextRedirectError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "digest" in e &&
    typeof (e as { digest?: unknown }).digest === "string" &&
    String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; manual?: string };
}) {
  const session = await auth();
  const callback = safeCallbackUrl(searchParams.callbackUrl);
  if (session?.user?.id) {
    redirect(callback);
  }

  const manual = searchParams.manual === "1";
  const devSkip = isDevSkipLoginEnabled();

  if (devSkip && !manual) {
    try {
      const result = await signIn("credentials", {
        email: devAutoLoginEmail(),
        password: DEV_BYPASS_PASSWORD,
        redirectTo: callback,
        redirect: false,
      });

      if (typeof result === "string") {
        if (isAuthFailureLocation(result)) {
          return (
            <SignInForm
              defaultCallbackUrl={callback}
              devSkipEnabled={devSkip}
              autoLoginFailed
              showManualHint={false}
            />
          );
        }
        redirect(nextRedirectPath(result));
      }
    } catch (e) {
      if (isNextRedirectError(e)) throw e;
      console.error("[sign-in] dev auto-login failed", e);
      return (
        <SignInForm
          defaultCallbackUrl={callback}
          devSkipEnabled={devSkip}
          autoLoginFailed
          showManualHint={false}
        />
      );
    }
  }

  return (
    <SignInForm
      defaultCallbackUrl={callback}
      devSkipEnabled={devSkip}
      autoLoginFailed={false}
      showManualHint={manual}
    />
  );
}
