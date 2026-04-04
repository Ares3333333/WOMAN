"use client";

import { useMemo } from "react";
import { AudioPlayer } from "@/components/audio-player";
import type { ScriptSections } from "@/types/script";
import { toggleFavorite } from "@/app/actions/favorites";
import { recordPlaybackComplete } from "@/app/actions/playback";
import { useIntl } from "@/components/intl-provider";

export function PlayClient(props: {
  sessionId: string;
  title: string;
  audioUrl: string | null;
  script: ScriptSections;
  favorited: boolean;
  useBrowserTts: boolean;
}) {
  const { t } = useIntl();
  const script = useMemo(() => props.script, [props.script]);

  return (
    <div className="pb-56 pt-2">
      <div className="rounded-2xl border border-border/45 bg-card/60 px-5 py-5 shadow-sm md:px-6 md:py-6">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("app.play.sessionEyebrow")}
        </p>
        <h1 className="mt-2 font-display text-2xl font-medium tracking-tight md:text-[1.65rem]">{props.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("app.play.wellnessOnly")}</p>
        {props.useBrowserTts ? (
          <p className="mt-4 border-l-2 border-primary/30 pl-3.5 text-xs leading-relaxed text-muted-foreground">
            {t("app.play.ttsExplainer")}
          </p>
        ) : null}
      </div>
      <AudioPlayer
        sessionId={props.sessionId}
        title={props.title}
        audioUrl={props.audioUrl}
        script={script}
        initialFavorited={props.favorited}
        useBrowserTts={props.useBrowserTts}
        onToggleFavorite={() => {
          void toggleFavorite(props.sessionId);
        }}
        onComplete={() => {
          void recordPlaybackComplete(props.sessionId);
        }}
      />
    </div>
  );
}
