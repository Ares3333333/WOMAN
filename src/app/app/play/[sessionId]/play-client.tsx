"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Sparkles, TrendingDown, Waves } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import type { ScriptSections } from "@/types/script";
import { toggleFavorite } from "@/app/actions/favorites";
import { recordPlaybackComplete } from "@/app/actions/playback";
import {
  acceptBiofeedbackConsent,
  savePostSessionBiofeedback,
  savePreSessionBiofeedback,
} from "@/app/actions/biofeedback";
import { useIntl } from "@/components/intl-provider";
import { trackEvent } from "@/lib/analytics";
import type { BreathCoachMetrics, PulseScanResult } from "@/features/biofeedback/types";
import { PulseScanPanel } from "@/features/biofeedback/components/pulse-scan-panel";

type PreScanSaved = Awaited<ReturnType<typeof savePreSessionBiofeedback>>;
type PostScanSaved = Awaited<ReturnType<typeof savePostSessionBiofeedback>>;

export function PlayClient(props: {
  sessionId: string;
  title: string;
  audioUrl: string | null;
  script: ScriptSections;
  favorited: boolean;
  useBrowserTts: boolean;
  meditationType: string;
  biofeedbackOnboardingComplete: boolean;
  breathCoachEligible: boolean;
}) {
  const { t, locale } = useIntl();
  const script = useMemo(() => props.script, [props.script]);

  const [biofeedbackConsent, setBiofeedbackConsent] = useState(props.biofeedbackOnboardingComplete);
  const [consentSaving, setConsentSaving] = useState(false);

  const [preScanResult, setPreScanResult] = useState<PreScanSaved | null>(null);
  const [postScanResult, setPostScanResult] = useState<PostScanSaved | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanBusy, setScanBusy] = useState(false);
  const [showPostScanPanel, setShowPostScanPanel] = useState(false);
  const [breathMetrics, setBreathMetrics] = useState<BreathCoachMetrics | null>(null);

  const bioSessionId = preScanResult?.ok ? preScanResult.biofeedbackSessionId : null;

  useEffect(() => {
    trackEvent("biofeedback_entry_opened", { sessionId: props.sessionId, surface: "play" });
  }, [props.sessionId]);

  async function enableBiofeedbackConsent() {
    setConsentSaving(true);
    setScanError(null);
    try {
      await acceptBiofeedbackConsent();
      setBiofeedbackConsent(true);
    } catch {
      setScanError(t("app.biofeedback.consentError"));
    } finally {
      setConsentSaving(false);
    }
  }

  async function handlePreScanResult(scan: PulseScanResult) {
    setScanBusy(true);
    setScanError(null);

    if (scan.rawStatus === "permission_denied") {
      trackEvent("biofeedback_permission_denied", { sessionId: props.sessionId, phase: "pre" });
    } else {
      trackEvent("biofeedback_permission_granted", { sessionId: props.sessionId, phase: "pre" });
    }

    try {
      const saved = await savePreSessionBiofeedback({
        meditationSessionId: props.sessionId,
        meditationType: props.meditationType,
        locale,
        scan,
      });

      setPreScanResult(saved);
      setPostScanResult(null);

      if (saved.ok) {
        trackEvent("biometric_scan_completed", {
          sessionId: props.sessionId,
          phase: "pre",
          quality: saved.signalQuality,
          pulse: saved.pulse,
        });
      } else {
        trackEvent("biometric_scan_failed", {
          sessionId: props.sessionId,
          phase: "pre",
          reason: saved.failureReason,
          quality: saved.signalQuality,
        });
      }
    } catch {
      setScanError(t("app.biofeedback.scanSaveError"));
      trackEvent("biometric_scan_failed", {
        sessionId: props.sessionId,
        phase: "pre",
        reason: "save_failed",
      });
    } finally {
      setScanBusy(false);
    }
  }

  async function handlePostScanResult(scan: PulseScanResult) {
    if (!bioSessionId) return;
    setScanBusy(true);
    setScanError(null);

    if (scan.rawStatus === "permission_denied") {
      trackEvent("biofeedback_permission_denied", { sessionId: props.sessionId, phase: "post" });
    } else {
      trackEvent("biofeedback_permission_granted", { sessionId: props.sessionId, phase: "post" });
    }

    try {
      const saved = await savePostSessionBiofeedback({
        biofeedbackSessionId: bioSessionId,
        locale,
        scan,
        breathMetrics: {
          adherenceScore: breathMetrics?.adherenceScore ?? null,
          stillnessScore: breathMetrics?.stillnessScore ?? null,
        },
      });
      setPostScanResult(saved);

      if (saved.ok) {
        trackEvent("biometric_scan_completed", {
          sessionId: props.sessionId,
          phase: "post",
          pulseAfter: saved.pulseAfter,
          sessionEffect: saved.sessionEffect,
        });
        trackEvent("post_session_effect_viewed", {
          sessionId: props.sessionId,
          sessionEffect: saved.sessionEffect,
        });
      } else {
        trackEvent("biometric_scan_failed", {
          sessionId: props.sessionId,
          phase: "post",
          reason: saved.failureReason,
        });
      }
    } catch {
      setScanError(t("app.biofeedback.scanSaveError"));
      trackEvent("biometric_scan_failed", {
        sessionId: props.sessionId,
        phase: "post",
        reason: "save_failed",
      });
    } finally {
      setScanBusy(false);
    }
  }

  return (
    <div className="pb-56 pt-2">
      <div className="space-y-4 rounded-2xl border border-border/45 bg-card/60 px-5 py-5 shadow-sm md:px-6 md:py-6">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("app.play.sessionEyebrow")}
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight md:text-[1.65rem]">{props.title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("app.play.wellnessOnly")}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("app.biofeedback.wellnessDisclaimer")}</p>
        {props.useBrowserTts ? (
          <p className="border-l-2 border-primary/30 pl-3.5 text-xs leading-relaxed text-muted-foreground">
            {t("app.play.ttsExplainer")}
          </p>
        ) : null}
      </div>

      <section className="mt-6 space-y-4">
        {!biofeedbackConsent ? (
          <div className="rounded-2xl border border-border/50 bg-card/55 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="space-y-2">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary/80">
                  {t("app.biofeedback.onboardingEyebrow")}
                </p>
                <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
                  {t("app.biofeedback.onboardingTitle")}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t("app.biofeedback.onboardingBody")}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("app.biofeedback.onboardingPrivacy")}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" className="rounded-full" onClick={enableBiofeedbackConsent} disabled={consentSaving}>
                {consentSaving ? t("common.saving") : t("app.biofeedback.onboardingCta")}
              </Button>
            </div>
          </div>
        ) : (
          <PulseScanPanel
            title={t("app.biofeedback.preEyebrow")}
            lead={t("app.biofeedback.preLead")}
            instruction={t("app.biofeedback.scanInstruction")}
            onScanStart={() => trackEvent("biometric_scan_started", { sessionId: props.sessionId, phase: "pre" })}
            onScanCanceled={() => trackEvent("biometric_scan_failed", { sessionId: props.sessionId, phase: "pre", reason: "canceled" })}
            onResult={handlePreScanResult}
            labels={{
              start: t("app.biofeedback.scanStart"),
              scanning: t("app.biofeedback.scanMeasuring"),
              cancel: t("app.biofeedback.scanCancel"),
              reset: t("app.biofeedback.scanReset"),
              ready: t("app.biofeedback.scanReady"),
              failed: t("app.biofeedback.scanFailed"),
            }}
          />
        )}

        {preScanResult ? (
          <div
            className={`rounded-2xl border p-4 ${
              preScanResult.ok
                ? "border-primary/25 bg-primary/[0.06]"
                : "border-amber-500/30 bg-amber-500/[0.08]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">{t("app.biofeedback.preResultTitle")}</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{preScanResult.summary}</p>

            {preScanResult.ok ? (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="rounded-xl border border-border/45 bg-card/80 px-3 py-2">
                  <p>{t("app.biofeedback.metricPulse")}</p>
                  <p className="mt-1 text-base font-medium text-foreground">{preScanResult.pulse} bpm</p>
                </div>
                <div className="rounded-xl border border-border/45 bg-card/80 px-3 py-2">
                  <p>{t("app.biofeedback.metricCalm")}</p>
                  <p className="mt-1 text-base font-medium text-foreground">{preScanResult.calmScore}</p>
                </div>
              </div>
            ) : null}

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{preScanResult.recommendation}</p>
          </div>
        ) : null}

        {scanError ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/[0.08] px-3 py-2 text-xs text-destructive">
            {scanError}
          </p>
        ) : null}
      </section>

      <AudioPlayer
        sessionId={props.sessionId}
        title={props.title}
        audioUrl={props.audioUrl}
        script={script}
        initialFavorited={props.favorited}
        useBrowserTts={props.useBrowserTts}
        enableBreathCoach={props.breathCoachEligible}
        onBreathCoachMetrics={async (metrics) => {
          setBreathMetrics(metrics);
        }}
        onToggleFavorite={() => {
          void toggleFavorite(props.sessionId);
        }}
        onComplete={() => {
          void recordPlaybackComplete(props.sessionId);
        }}
        completionExtras={
          <div className="space-y-3 rounded-2xl border border-border/50 bg-card/70 p-3">
            <div className="flex items-start gap-2">
              <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("app.biofeedback.postTitle")}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{t("app.biofeedback.postLead")}</p>
              </div>
            </div>

            {bioSessionId ? (
              !showPostScanPanel ? (
                <Button type="button" size="sm" className="rounded-full" onClick={() => setShowPostScanPanel(true)}>
                  {t("app.biofeedback.postStart")}
                </Button>
              ) : (
                <PulseScanPanel
                  title={t("app.biofeedback.postEyebrow")}
                  lead={t("app.biofeedback.postScanLead")}
                  instruction={t("app.biofeedback.scanInstruction")}
                  onScanStart={() => trackEvent("biometric_scan_started", { sessionId: props.sessionId, phase: "post" })}
                  onScanCanceled={() => trackEvent("biometric_scan_failed", { sessionId: props.sessionId, phase: "post", reason: "canceled" })}
                  onResult={handlePostScanResult}
                  labels={{
                    start: t("app.biofeedback.scanStart"),
                    scanning: t("app.biofeedback.scanMeasuring"),
                    cancel: t("app.biofeedback.scanCancel"),
                    reset: t("app.biofeedback.scanReset"),
                    ready: t("app.biofeedback.scanReady"),
                    failed: t("app.biofeedback.scanFailed"),
                  }}
                />
              )
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">{t("app.biofeedback.postLockedHint")}</p>
            )}

            {breathMetrics ? (
              <div className="rounded-xl border border-border/45 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                <p className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Waves className="h-3.5 w-3.5 text-primary" />
                  {t("app.biofeedback.breathSummary")}
                </p>
                <p className="mt-1">
                  {t("app.biofeedback.breathTargetLabel")}: {breathMetrics.targetPaceLabel}
                  {typeof breathMetrics.adherenceScore === "number"
                    ? ` • ${t("app.biofeedback.breathAdherence")}: ${Math.round(breathMetrics.adherenceScore * 100)}%`
                    : ""}
                  {typeof breathMetrics.stillnessScore === "number"
                    ? ` • ${t("app.biofeedback.breathStillness")}: ${Math.round(breathMetrics.stillnessScore * 100)}%`
                    : ""}
                </p>
              </div>
            ) : null}

            {postScanResult ? (
              <div
                className={`rounded-xl border px-3 py-2 text-sm ${
                  postScanResult.ok
                    ? "border-primary/30 bg-primary/[0.06]"
                    : "border-amber-500/30 bg-amber-500/[0.08]"
                }`}
              >
                <p className="font-medium text-foreground">{t("app.biofeedback.effectTitle")}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{postScanResult.summary}</p>

                {postScanResult.ok ? (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="rounded-lg border border-border/40 bg-card/70 px-2 py-1.5">
                      <p>{t("app.biofeedback.effectPulse")}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {postScanResult.pulseBefore ?? "—"} → {postScanResult.pulseAfter ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-card/70 px-2 py-1.5">
                      <p>{t("app.biofeedback.effectCalm")}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {postScanResult.calmBefore ?? "—"} → {postScanResult.calmAfter ?? "—"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {scanBusy ? <p className="text-xs text-muted-foreground">{t("common.loading")}</p> : null}
          </div>
        }
      />
    </div>
  );
}
