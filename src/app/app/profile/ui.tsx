"use client";

import { useState } from "react";
import type { SensualContentMode } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoiceStyleSelector } from "@/components/voice-style-selector";
import { SoftToggle } from "@/components/soft-toggle";
import { InlineError, InlineSuccess } from "@/components/states/inline-alert";
import { updateProfilePrefs } from "./actions";
import { useIntl } from "@/components/intl-provider";

const LISTEN_IDS = ["morning", "afternoon", "evening", "sleep"] as const;

function listenKey(id: (typeof LISTEN_IDS)[number]): string {
  const map = {
    morning: "app.onboarding.listenMorning",
    afternoon: "app.onboarding.listenAfternoon",
    evening: "app.onboarding.listenEvening",
    sleep: "app.onboarding.listenSleep",
  } as const;
  return map[id];
}

export function ProfileForm({
  displayName,
  sensualContentMode,
  skipSensualInFeed,
  voiceTonePref,
  listeningTimePref,
}: {
  displayName: string;
  sensualContentMode: SensualContentMode;
  skipSensualInFeed: boolean;
  voiceTonePref: string;
  listeningTimePref: string;
}) {
  const { t } = useIntl();
  const [name, setName] = useState(displayName);
  const [mode, setMode] = useState(sensualContentMode);
  const [skip, setSkip] = useState(skipSensualInFeed);
  const [voice, setVoice] = useState(voiceTonePref);
  const [listen, setListen] = useState(listeningTimePref);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensualChoices: [SensualContentMode, string][] = [
    ["welcome", t("app.profile.welcome")],
    ["optional", t("app.profile.optional")],
    ["hidden", t("app.profile.hidden")],
  ];

  async function save() {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      await updateProfilePrefs({
        displayName: name,
        sensualContentMode: mode,
        skipSensualInFeed: skip,
        voiceTonePref: voice,
        listeningTimePref: listen,
      });
      setSuccess(true);
    } catch {
      setError(t("app.profile.errorSave"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border/70 bg-card/50 p-4">
      {success ? <InlineSuccess>{t("app.profile.saved")}</InlineSuccess> : null}
      {error ? <InlineError>{error}</InlineError> : null}
      <div className="space-y-2">
        <Label htmlFor="dn">{t("app.profile.displayName")}</Label>
        <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{t("app.profile.sensualTitle")}</Label>
        <div className="grid gap-2">
          {sensualChoices.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                mode === id ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <SoftToggle
        id="skip-feed"
        label={t("app.profile.skipFeed")}
        checked={skip}
        onCheckedChange={setSkip}
      />
      <div className="space-y-2">
        <Label>{t("app.profile.voiceTone")}</Label>
        <VoiceStyleSelector value={voice} onChange={setVoice} />
      </div>
      <div className="space-y-2">
        <Label>{t("app.profile.listeningTime")}</Label>
        <div className="grid grid-cols-2 gap-2">
          {LISTEN_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setListen(id)}
              className={`rounded-xl border px-3 py-2 text-sm ${
                listen === id ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              {t(listenKey(id))}
            </button>
          ))}
        </div>
      </div>
      <Button type="button" onClick={save} disabled={loading}>
        {loading ? t("common.saving") : t("app.profile.save")}
      </Button>
    </div>
  );
}
