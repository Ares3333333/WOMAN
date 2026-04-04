"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  ListMusic,
  Pause,
  Play,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import type { ScriptSections } from "@/types/script";
import { scriptToTranscript } from "@/types/script";
import { trackEvent } from "@/lib/analytics";
import { useIntl } from "@/components/intl-provider";

const SPEEDS = [0.85, 1, 1.1, 1.25] as const;

export function AudioPlayer({
  sessionId,
  title,
  audioUrl,
  script,
  initialFavorited,
  onToggleFavorite,
  onComplete,
  useBrowserTts,
}: {
  sessionId: string;
  title: string;
  audioUrl: string | null;
  script: ScriptSections;
  initialFavorited: boolean;
  onToggleFavorite: () => Promise<void> | void;
  onComplete: () => Promise<void> | void;
  useBrowserTts: boolean;
}) {
  const { t, locale } = useIntl();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [fav, setFav] = useState(initialFavorited);
  const [completedUi, setCompletedUi] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [audioFailed, setAudioFailed] = useState(false);

  const fullText = useMemo(() => scriptToTranscript(script), [script]);
  const mode = useBrowserTts || !audioUrl || audioFailed ? "tts" : "audio";

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
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("timeupdate", onTime);
    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("timeupdate", onTime);
    };
  }, [mode, audioUrl]);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(fullText);
    u.lang = locale === "ru" ? "ru-RU" : "en-US";
    u.rate = SPEEDS[speedIdx];
    u.pitch = 1;
    u.onend = () => {
      setPlaying(false);
      setCurrent(0);
    };
    window.speechSynthesis.speak(u);
    setPlaying(true);
    const est = Math.max(120, fullText.split(/\s+/).length / 2.5);
    setDuration(est);
    const start = performance.now();
    const tick = () => {
      if (!window.speechSynthesis.speaking) return;
      setCurrent((performance.now() - start) / 1000);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [fullText, speedIdx, locale]);

  const pauseTts = useCallback(() => {
    window.speechSynthesis.pause();
    setPlaying(false);
  }, []);

  const resumeTts = useCallback(() => {
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
      if (window.speechSynthesis.paused) resumeTts();
      else pauseTts();
    } else {
      speak();
    }
  };

  const onScrub = (v: number) => {
    if (mode === "audio" && audioRef.current) {
      audioRef.current.currentTime = v;
      setCurrent(v);
    }
  };

  const cycleSpeed = () => {
    setSpeedIdx((i) => (i + 1) % SPEEDS.length);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[(speedIdx + 1) % SPEEDS.length];
  };

  const markComplete = async () => {
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      {mode === "audio" && audioUrl ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          className="hidden"
          onError={() => setAudioFailed(true)}
        />
      ) : null}

      <div className="mx-auto flex max-w-lg flex-col gap-3 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("app.play.nowGuiding")}</p>
            <p className="font-display text-lg font-medium leading-tight">{title}</p>
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
          <Button type="button" variant="secondary" size="sm" onClick={cycleSpeed}>
            {SPEEDS[speedIdx]}×
          </Button>
          <Button type="button" size="lg" className="rounded-full px-8" onClick={togglePlay}>
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
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

        <Button type="button" variant="ghost" size="sm" className="mx-auto" onClick={markComplete}>
          <SkipForward className="mr-2 h-4 w-4" />
          {t("app.play.complete")}
        </Button>

        <AnimatePresence>
          {showTranscript ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden rounded-xl border border-border/60 bg-background/60 p-3 text-sm leading-relaxed text-muted-foreground"
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
            className="border-t border-border/60 bg-gradient-mesh px-4 py-5"
          >
            <div className="mx-auto flex max-w-lg flex-col gap-3">
              <p className="flex items-center gap-2 font-display text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("app.play.howFeel")}
              </p>
              <textarea
                className="min-h-[72px] w-full rounded-xl border border-border bg-card/80 p-3 text-sm"
                placeholder={t("app.play.reflectionPlaceholder")}
                value={reflection ?? ""}
                onChange={(e) => setReflection(e.target.value)}
              />
              <Button type="button" variant="secondary" onClick={() => setCompletedUi(false)}>
                {t("app.play.close")}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
