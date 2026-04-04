"use client";

import { useState } from "react";
import type { AdminGenerationLog, SessionCategory, Tag, WellnessSession } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  adminGenerateTts,
  adminUploadAudioUrl,
  adminUpsertSession,
} from "@/app/actions/admin";

type SessionWith = WellnessSession & {
  category: SessionCategory;
  tags: { tagId: string }[];
};

export function EditSessionClient({
  session,
  categories,
  tags,
  selectedTagIds,
  logs,
}: {
  session: SessionWith;
  categories: SessionCategory[];
  tags: Tag[];
  selectedTagIds: string[];
  logs: AdminGenerationLog[];
}) {
  const [title, setTitle] = useState(session.title);
  const [slug, setSlug] = useState(session.slug);
  const [shortDescription, setShortDescription] = useState(session.shortDescription);
  const [longDescription, setLongDescription] = useState(session.longDescription);
  const [categoryId, setCategoryId] = useState(session.categoryId);
  const [durationMinutes, setDurationMinutes] = useState(session.durationMinutes);
  const [intensity, setIntensity] = useState(session.intensity);
  const [tone, setTone] = useState(session.tone);
  const [voiceStyle, setVoiceStyle] = useState(session.voiceStyle);
  const [coverGradient, setCoverGradient] = useState(session.coverGradient);
  const [scriptJson, setScriptJson] = useState(session.scriptJson);
  const [published, setPublished] = useState(session.published);
  const [freeTier, setFreeTier] = useState(session.freeTier);
  const [selectedTags, setSelectedTags] = useState<string[]>(selectedTagIds);
  const [msg, setMsg] = useState<string | null>(null);
  const [audioUrlInput, setAudioUrlInput] = useState(session.audioFileUrl ?? "");
  const [ttsPending, setTtsPending] = useState(false);

  function toggleTag(id: string) {
    setSelectedTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  async function onSave(formData: FormData) {
    setMsg(null);
    formData.set("id", session.id);
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("shortDescription", shortDescription);
    formData.set("longDescription", longDescription);
    formData.set("categoryId", categoryId);
    formData.set("durationMinutes", String(durationMinutes));
    formData.set("intensity", intensity);
    formData.set("tone", tone);
    formData.set("voiceStyle", voiceStyle);
    formData.set("coverGradient", coverGradient);
    formData.set("scriptJson", scriptJson);
    formData.set("published", published ? "true" : "false");
    formData.set("freeTier", freeTier ? "true" : "false");
    selectedTags.forEach((id) => formData.append("tagIds", id));
    const res = await adminUpsertSession(formData);
    if ("error" in res && res.error) {
      setMsg(JSON.stringify(res.error));
      return;
    }
    setMsg("Saved.");
  }

  async function runTts() {
    setTtsPending(true);
    setMsg(null);
    const res = await adminGenerateTts(session.id);
    setTtsPending(false);
    if (!res.ok) {
      setMsg(res.error ?? "TTS failed");
      return;
    }
    setMsg("TTS complete. Refresh audio URL below if needed.");
    window.location.reload();
  }

  async function saveAudioUrl() {
    setMsg(null);
    const res = await adminUploadAudioUrl(session.id, audioUrlInput.trim());
    if (!res.ok) {
      setMsg(res.error ?? "Upload failed");
      return;
    }
    setMsg("Audio URL saved.");
  }

  return (
    <div className="space-y-8">
      <form action={onSave} className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
        <input type="hidden" name="id" value={session.id} />
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div>
          <Label>Short description</Label>
          <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
        </div>
        <div>
          <Label>Long description</Label>
          <Textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} />
        </div>
        <div>
          <Label>Category</Label>
          <select
            className="mt-1 h-11 w-full rounded-xl border border-input bg-card/60 px-3 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Duration</Label>
            <Input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Intensity</Label>
            <select
              className="mt-1 h-11 w-full rounded-xl border border-input bg-card/60 px-3 text-sm"
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as typeof intensity)}
            >
              {["light", "medium", "deep"].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Tone</Label>
            <select
              className="mt-1 h-11 w-full rounded-xl border border-input bg-card/60 px-3 text-sm"
              value={tone}
              onChange={(e) => setTone(e.target.value as typeof tone)}
            >
              {["soft", "grounding", "uplifting", "sensual_soft", "sleep"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label>Voice style</Label>
          <select
            className="mt-1 h-11 w-full rounded-xl border border-input bg-card/60 px-3 text-sm"
            value={voiceStyle}
            onChange={(e) => setVoiceStyle(e.target.value)}
          >
            {["calm", "warm", "confident", "bedtime_soft"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Cover gradient</Label>
          <Input value={coverGradient} onChange={(e) => setCoverGradient(e.target.value)} />
        </div>
        <div>
          <Label>Script JSON</Label>
          <Textarea
            value={scriptJson}
            onChange={(e) => setScriptJson(e.target.value)}
            className="font-mono text-xs"
            rows={14}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={published} onCheckedChange={(c) => setPublished(c === true)} />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={freeTier} onCheckedChange={(c) => setFreeTier(c === true)} />
            Free tier
          </label>
        </div>
        <div>
          <Label>Tags</Label>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {tags.map((t) => (
              <label key={t.id} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTags.includes(t.id)}
                  onCheckedChange={() => toggleTag(t.id)}
                />
                {t.name}
              </label>
            ))}
          </div>
        </div>
        <Button type="submit">Save changes</Button>
      </form>

      <div className="rounded-2xl border border-border/70 bg-card/40 p-4">
        <h2 className="font-display text-lg">Audio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Current: {session.audioFileUrl ?? "none (browser TTS in app when enabled)"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={runTts} disabled={ttsPending}>
            {ttsPending ? "Generating…" : "Generate TTS"}
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            placeholder="/uploads/... or https://..."
            value={audioUrlInput}
            onChange={(e) => setAudioUrlInput(e.target.value)}
            className="max-w-md"
          />
          <Button type="button" variant="secondary" onClick={saveAudioUrl}>
            Save audio URL
          </Button>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg">Generation logs</h2>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          {logs.map((l) => (
            <li key={l.id} className="rounded-lg border border-border/60 bg-card/40 p-2">
              {l.kind} · {l.createdAt.toLocaleString()}
              {l.error ? <span className="text-destructive"> — {l.error}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      {msg ? <p className="text-sm">{msg}</p> : null}
    </div>
  );
}
