"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CrisisGuardTextarea } from "@/components/crisis-guard-textarea";
import { InlineError, InlineSuccess } from "@/components/states/inline-alert";
import { saveJournalEntry } from "@/app/actions/journal";
import { useIntl } from "@/components/intl-provider";

export function JournalForm({
  initialPrompt,
  sessionId,
  defaultPrompt,
}: {
  initialPrompt: string;
  sessionId?: string;
  defaultPrompt: string;
}) {
  const { t } = useIntl();
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt || defaultPrompt);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await saveJournalEntry(prompt, content, sessionId);
      setContent("");
      setSuccess(true);
      router.refresh();
    } catch {
      setError(t("app.journal.errorSave"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border/70 bg-card/50 p-4">
      {success ? <InlineSuccess>{t("app.journal.saved")}</InlineSuccess> : null}
      {error ? <InlineError>{error}</InlineError> : null}
      <div className="space-y-2">
        <Label htmlFor="prompt">{t("app.journal.promptLabel")}</Label>
        <CrisisGuardTextarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">{t("app.journal.contentLabel")}</Label>
        <CrisisGuardTextarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          minLength={3}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? t("common.saving") : t("app.journal.save")}
      </Button>
    </form>
  );
}
