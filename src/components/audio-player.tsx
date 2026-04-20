"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Heart,
  ListMusic,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Square,
  Waves,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import type { ScriptSections } from "@/types/script";
import { scriptToTranscript } from "@/types/script";
import { trackEvent } from "@/lib/analytics";
import { useIntl } from "@/components/intl-provider";
import type { BreathCoachMetrics } from "@/features/biofeedback/types";
import { createBreathEstimator } from "@/features/biofeedback/breath-estimator";

const SPEEDS = [0.9, 1, 1.15] as const;
const BREATH_TARGET_LABEL = "4-1-6";

function breathPhaseAt(second: number): { id: "inhale" | "pause" | "exhale"; progress: number } {
  const cycle = 11;
  const tick = second % cycle;

  if (tick < 4) {
    return { id: "inhale", progress: (tick + 1) / 4 };
  }
  if (tick < 5) {
    return { id: "pause", progress: 1 };
  }
  return { id: "exhale", progress: (tick - 5 + 1) / 6 };
}

export function AudioPlayer({
  sessionId,
  title,
  audioUrl,
  script,
  initialFavorited,
  onToggleFavorite,
  onComplete,
  useBrowserTts,
  enableBreathCoach = false,
  onBreathCoachMetrics,
  completionExtras,
}: {
  sessionId: string;
  title: string;
  audioUrl: string | null;
  script: ScriptSections;
  initialFavorited: boolean;
  onToggleFavorite: () => Promise<void> | void;
  onComplete: () => Promise<void> | void;
  useBrowserTts: boolean;
  enableBreathCoach?: boolean;
  onBreathCoachMetrics?: (metrics: BreathCoachMetrics) => Promise<void> | void;
  completionExtras?: React.ReactNode;
}) {
  const { t, locale } = useIntl();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const breathTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const estimatorRef = useRef(createBreathEstimator());

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [fav, setFav] = useState(initialFavorited);
  const [completedUi, setCompletedUi] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [audioFailed, setAudioFailed] = useState(false);

  const [breathCoachOn, setBreathCoachOn] = useState(false);
  const [coachSeconds, setCoachSeconds] = useState(0);
  const [coachActiveSeconds, setCoachActiveSeconds] = useState(0);
  const [cameraAssistOn, setCameraAssistOn] = useState(false);
  const [stillnessScore, setStillnessScore] = useState<number | null>(null);
  const [cameraAssistError, setCameraAssistError] = useState<string | null>(null);

  const fullText = useMemo(() => scriptToTranscript(script), [script]);
  const mode = useBrowserTts || !audioUrl || audioFailed ? "tts" : "audio";
  const breathEstimatorSupported = estimatorRef.current.supported;

  useEffect(() => {
    trackEvent("session_started", { sessionId });
  }, [sessionId]);

  useEffect(() => {
    setAudioFailed(false);
  }, [audioUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || mode !== "audio") return;

    const onMeta = () => setDuration(el.duration || 0);
    const onTime = () => setCurrent(el.currentTime);
    const onEnded = () => setPlaying(false);

    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [mode, audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[speedIdx];
    }
  }, [speedIdx]);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = locale === "ru" ? "ru-RU" : "en-US";
    utterance.rate = SPEEDS[speedIdx];
    utterance.pitch = 1;
    utterance.onend = () => {
      setPlaying(false);
      setCurrent(0);
    };

    window.speechSynthesis.speak(utterance);
    setPlaying(true);

    const estDuration = Math.max(120, fullText.split(/\s+/).length / 2.5);
    setDuration(estDuration);
    const start = performance.now();

    const tick = () => {
      if (!window.speechSynthesis.speaking) return;
      setCurrent((performance.now() - start) / 1000);
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [fullText, speedIdx, locale]);

  const pauseTts = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setPlaying(false);
  }, []);

  const resumeTts = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setPlaying(true);
  }, []);

  const togglePlay = async () => {
    if (mode === "audio" && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        await audioRef.current.play();
        setPlaying(true);
      }
      return;
    }

    if (playing) {
      if (typeof window !== "undefined" && window.speechSynthesis.paused) {
        resumeTts();
      } else {
        pauseTts();
      }
    } else {
      speak();
    }
  };

  const restartPlayback = () => {
    if (mode === "audio" && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrent(0);
      void audioRef.current.play();
      setPlaying(true);
      return;
    }

    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setCurrent(0);
    setPlaying(false);
    speak();
  };

  const stopPlayback = () => {
    if (mode === "audio" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrent(0);
      setPlaying(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setCurrent(0);
    setPlaying(false);
  };

  const onScrub = (v: number) => {
    if (mode === "audio" && audioRef.current) {
      audioRef.current.currentTime = v;
      setCurrent(v);
    }
  };

  const cycleSpeed = () => {
    setSpeedIdx((idx) => (idx + 1) % SPEEDS.length);
  };

  useEffect(() => {
    if (!enableBreathCoach || !breathCoachOn) {
      if (breathTimerRef.current) {
        clearInterval(breathTimerRef.current);
        breathTimerRef.current = null;
      }
      return;
    }

    breathTimerRef.current = setInterval(() => {
      setCoachSeconds((prev) => prev + 1);
      if (playing) setCoachActiveSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (breathTimerRef.current) {
        clearInterval(breathTimerRef.current);
        breathTimerRef.current = null;
      }
    };
  }, [enableBreathCoach, breathCoachOn, playing]);

  useEffect(() => {
    if (!enableBreathCoach || !breathCoachOn || !cameraAssistOn || !breathEstimatorSupported) return;
    let active = true;

    (async () => {
      try {
        setCameraAssistError(null);
        await estimatorRef.current.start();
      } catch {
        if (!active) return;
        setCameraAssistOn(false);
        setCameraAssistError(t("app.play.breathCameraError"));
      }
    })();

    return () => {
      active = false;
      void estimatorRef.current.stop();
    };
  }, [enableBreathCoach, breathCoachOn, cameraAssistOn, breathEstimatorSupported, t]);

  useEffect(() => {
    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      void estimatorRef.current.stop();
    };
  }, []);

  const phase = useMemo(() => breathPhaseAt(coachSeconds), [coachSeconds]);
  const phaseScale = phase.id === "inhale" ? 1.12 : phase.id === "pause" ? 1.08 : 0.94;

  const phaseLabel = phase.id === "inhale"
    ? t("app.play.breathInhale")
    : phase.id === "pause"
      ? t("app.play.breathPause")
      : t("app.play.breathExhale");

  async function finalizeBreathCoach(): Promise<BreathCoachMetrics | null> {
    if (!enableBreathCoach || !breathCoachOn) return null;

    if (breathTimerRef.current) {
      clearInterval(breathTimerRef.current);
      breathTimerRef.current = null;
    }

    const estimatorResult = cameraAssistOn
      ? await estimatorRef.current.stop()
      : { stillnessScore: null, sampleCount: 0 };

    const adherenceScore =
      coachSeconds > 5 ? Number(Math.max(0, Math.min(1, coachActiveSeconds / coachSeconds)).toFixed(2)) : null;

    const metrics: BreathCoachMetrics = {
      targetPaceLabel: BREATH_TARGET_LABEL,
      adherenceScore,
      stillnessScore:
        estimatorResult.stillnessScore != null ? Number(estimatorResult.stillnessScore.toFixed(2)) : null,
    };

    setStillnessScore(metrics.stillnessScore);
    setBreathCoachOn(false);

    await onBreathCoachMetrics?.(metrics);
    trackEvent("breath_coach_completed", {
      sessionId,
      adherence: metrics.adherenceScore,
      stillness: metrics.stillnessScore,
    });

    return metrics;
  }

  const markComplete = async () => {
    await finalizeBreathCoach();
    await onComplete();
    setCompletedUi(true);
    trackEvent("session_completed", { sessionId });
  };

  const toggleFav = async () => {
    const next = !fav;
    setFav(next);
    await onToggleFavorite();
    if (next) trackEvent("favorite_added", { sessionId });
  };

  const remaining = Math.max(0, duration - current);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_48px_-20px_hsl(var(--shadow-hsl)/0.08)] backdrop-blur-xl backdrop-saturate-150">
      {mode === "audio" && audioUrl ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          className="hidden"
          onError={() => setAudioFailed(true)}
        />
      ) : null}

      <div className="mx-auto flex max-w-lg flex-col gap-3.5 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {t("app.play.nowGuiding")}
            </p>
            <p className="truncate font-display text-lg font-medium leading-tight tracking-tight">{title}</p>
            {mode === "tts" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {audioFailed ? t("app.play.browserVoiceMissing") : t("app.play.browserVoiceDefault")}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="icon"
            variant={fav ? "default" : "outline"}
            aria-pressed={fav}
            onClick={toggleFav}
          >
            <Heart className={cn("h-5 w-5", fav && "fill-current")} />
          </Button>
        </div>

        {enableBreathCoach ? (
          <div className="rounded-2xl border border-border/45 bg-muted/20 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {t("app.play.breathCoachEyebrow")}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{t("app.play.breathCoachTitle")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("app.play.breathCoachHint")}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={breathCoachOn ? "default" : "secondary"}
                className="rounded-full"
                onClick={() => {
                  const next = !breathCoachOn;
                  if (next) {
                    setCoachSeconds(0);
                    setCoachActiveSeconds(0);
                    setStillnessScore(null);
                    setCameraAssistError(null);
                    trackEvent("breath_coach_started", { sessionId });
                  } else {
                    void finalizeBreathCoach();
                  }
                  setBreathCoachOn(next);
                }}
              >
                <Waves className="mr-1.5 h-4 w-4" />
                {breathCoachOn ? t("app.play.breathCoachStop") : t("app.play.breathCoachStart")}
              </Button>
            </div>

            {breathCoachOn ? (
              <div className="mt-3 rounded-xl border border-border/40 bg-card/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {t("app.play.breathTarget")}: <span className="font-medium text-foreground">{BREATH_TARGET_LABEL}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{phaseLabel}</p>
                </div>

                <div className="mt-3 flex justify-center">
                  <motion.div
                    animate={{ scale: phaseScale }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/35 bg-primary/[0.08] text-xs font-medium text-primary"
                  >
                    {Math.round(phase.progress * 100)}%
                  </motion.div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {breathEstimatorSupported ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={cameraAssistOn ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => {
                        setCameraAssistOn((prev) => !prev);
                        setCameraAssistError(null);
                      }}
                    >
                      <Camera className="mr-1.5 h-3.5 w-3.5" />
                      {cameraAssistOn ? t("app.play.breathCameraOn") : t("app.play.breathCameraOff")}
                    </Button>
                  ) : null}

                  <p className="text-[0.72rem] text-muted-foreground">
                    {playing ? t("app.play.breathSyncGood") : t("app.play.breathSyncPaused")}
                  </p>
                </div>

                {cameraAssistError ? <p className="mt-2 text-[0.72rem] text-destructive">{cameraAssistError}</p> : null}

                {stillnessScore != null ? (
                  <p className="mt-2 text-[0.72rem] text-muted-foreground">
                    {t("app.play.breathStillness")}: {Math.round(stillnessScore * 100)}%
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={Math.min(current, duration || 100)}
            onChange={(e) => onScrub(Number(e.target.value))}
            className="w-full accent-primary"
            aria-label={t("app.play.progressAria")}
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{formatDuration(current)}</span>
            <span>-{formatDuration(remaining)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="secondary" size="sm" className="rounded-full font-medium tabular-nums" onClick={cycleSpeed}>
            {SPEEDS[speedIdx].toFixed(2)}x
          </Button>

          <Button type="button" size="lg" className="rounded-full px-8 shadow-soft" onClick={togglePlay}>
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={stopPlayback}>
            <Square className="mr-1 h-4 w-4" />
            {t("app.play.stop")}
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={restartPlayback}>
            <RotateCcw className="mr-1 h-4 w-4" />
            {t("app.play.restart")}
          </Button>

          <Button
            type="button"
            variant={showTranscript ? "default" : "outline"}
            size="sm"
            onClick={() => setShowTranscript((s) => !s)}
          >
            <ListMusic className="mr-1 h-4 w-4" />
            {t("app.play.transcript")}
          </Button>
        </div>

        <Button type="button" variant="ghost" size="sm" className="mx-auto rounded-full px-5" onClick={markComplete}>
          <SkipForward className="mr-2 h-4 w-4 opacity-70" />
          {t("app.play.complete")}
        </Button>

        <AnimatePresence>
          {showTranscript ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground shadow-inner"
            >
              {fullText}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {completedUi ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-border/45 bg-gradient-mesh px-4 py-5"
          >
            <div className="mx-auto flex max-w-lg flex-col gap-3">
              <p className="flex items-center gap-2 font-display text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("app.play.howFeel")}
              </p>
              <textarea
                className="min-h-[80px] w-full rounded-2xl border border-border/55 bg-card/90 p-3.5 text-sm shadow-inner"
                placeholder={t("app.play.reflectionPlaceholder")}
                value={reflection ?? ""}
                onChange={(e) => setReflection(e.target.value)}
              />
              {completionExtras}
              <Button type="button" variant="secondary" className="rounded-full" onClick={() => setCompletedUi(false)}>
                {t("app.play.close")}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
