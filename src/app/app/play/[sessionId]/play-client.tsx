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
    <div className="pb-56 pt-4">
      <h1 className="font-display text-2xl font-medium">{props.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("app.play.wellnessOnly")}</p>
      {props.useBrowserTts ? (
        <p className="mt-3 border-l-2 border-primary/40 pl-3 text-xs leading-relaxed text-muted-foreground">
          {t("app.play.ttsExplainer")}
        </p>
      ) : null}
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
