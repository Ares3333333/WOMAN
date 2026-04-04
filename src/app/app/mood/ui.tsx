"use client";

import { useRouter } from "next/navigation";
import { MOOD_OPTIONS } from "@/types/script";
import { MoodChip } from "@/components/mood-chip";
import { Button } from "@/components/ui/button";
import { saveMoodCheckin } from "@/app/actions/mood";
import { trackEvent } from "@/lib/analytics";
import { useState } from "react";
import { useIntl } from "@/components/intl-provider";

export function MoodPicker() {
  const { t } = useIntl();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      await saveMoodCheckin(selected);
      await trackEvent("mood_checkin_submitted", { mood: selected });
      router.push("/app");
      router.refresh();
    } catch {
      setError(t("app.mood.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="grid gap-2">
        {MOOD_OPTIONS.map((m) => (
          <MoodChip
            key={m.id}
            label={t(`app.moodOptions.${m.id}.label`)}
            description={t(`app.moodOptions.${m.id}.description`)}
            selected={selected === m.id}
            onSelect={() => setSelected(m.id)}
          />
        ))}
      </div>
      <Button type="button" className="w-full" disabled={!selected || loading} onClick={submit}>
        {loading ? t("common.saving") : t("app.mood.submit")}
      </Button>
    </div>
  );
}
