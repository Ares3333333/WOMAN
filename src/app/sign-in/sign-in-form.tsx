"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIntl } from "@/components/intl-provider";

type Props = {
  defaultCallbackUrl: string;
  devSkipEnabled: boolean;
  autoLoginFailed: boolean;
  showManualHint: boolean;
};

export function SignInForm({
  defaultCallbackUrl,
  devSkipEnabled,
  autoLoginFailed,
  showManualHint,
}: Props) {
  const { t } = useIntl();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? defaultCallbackUrl;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(t("signIn.error"));
      return;
    }
    window.location.href = callbackUrl;
  }

  const instantHref =
    callbackUrl === "/app"
      ? "/sign-in"
      : `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-3xl font-medium">{t("signIn.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("signIn.hint")}</p>

      {devSkipEnabled ? (
        <p className="mt-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground/90">
          {t("signIn.devModeBanner")}
        </p>
      ) : null}

      {autoLoginFailed ? (
        <p className="mt-3 text-sm text-destructive">{t("signIn.devAutoFailed")}</p>
      ) : null}

      <div className="mt-4 space-y-3 rounded-2xl border border-border/80 bg-card/70 p-4 text-xs leading-relaxed text-muted-foreground">
        <div>
          <p className="font-medium text-foreground">{t("signIn.demoFree")}</p>
          <p className="mt-1 font-mono text-[11px] text-foreground/90">
            demo@soracalm.app · demo123456
          </p>
        </div>
        <div className="border-t border-border/60 pt-3">
          <p className="font-medium text-primary">{t("signIn.demoPremium")}</p>
          <p className="mt-1 font-mono text-[11px] text-foreground/90">
            premium@soracalm.app · premium123456
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">{t("signIn.seedHint")}</p>
        <div className="border-t border-border/60 pt-3">
          <p className="font-medium text-foreground">{t("signIn.troubleshootTitle")}</p>
          <p className="mt-1 text-[11px] leading-relaxed">{t("signIn.troubleshootBody")}</p>
          <div className="mt-2 flex flex-col gap-1.5 text-[11px]">
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline"
            >
              {t("signIn.healthSimpleLink")}
            </a>
            <a
              href="/api/health/db"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline"
            >
              {t("signIn.troubleshootLink")}
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("signIn.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("signIn.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("signIn.signingIn") : t("signIn.submit")}
        </Button>
      </form>

      {devSkipEnabled && showManualHint ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href={instantHref} className="text-primary underline">
            {t("signIn.backToInstant")}
          </Link>
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("signIn.newHere")}{" "}
        <Link href="/sign-up" className="text-primary underline">
          {t("signIn.createAccount")}
        </Link>
      </p>
    </div>
  );
}
