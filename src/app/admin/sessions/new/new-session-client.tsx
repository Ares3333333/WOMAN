"use client";

import { useState, useTransition } from "react";
import type { SessionCategory, Tag } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { adminGenerateScript, adminUpsertSession } from "@/app/actions/admin";

export function NewSessionClient({
  categories,
  tags,
}: {
  categories: SessionCategory[];
  tags: Tag[];
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [intensity, setIntensity] = useState("light");
  const [tone, setTone] = useState("soft");
  const [voiceStyle, setVoiceStyle] = useState("calm");
  const [coverGradient, setCoverGradient] = useState("rose-plum");
  const [scriptJson, setScriptJson] = useState("{}");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [published, setPublished] = useState(true);
  const [freeTier, setFreeTier] = useState(true);

  function toggleTag(id: string) {
    setSelectedTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  async function onGenerate(formData: FormData) {
    setMsg(null);
    start(async () => {
      const res = await adminGenerateScript(formData);
      if ("error" in res && res.error) {
        setMsg(JSON.stringify(res.error));
        return;
      }
      if (!("draft" in res) || !res.draft) {
        setMsg("error" in res && typeof res.error === "string" ? res.error : "Generation failed");
        return;
      }
      const d = res.draft;
      setTitle(d.title);
      setSlug(
        d.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
      setShortDescription(d.shortDescription);
      setLongDescription(d.shortDescription);
      setScriptJson(JSON.stringify(d.script, null, 2));
      setMsg("Draft applied — review before saving.");
    });
  }

  async function onSave(formData: FormData) {
    setMsg(null);
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
    if ("id" in res && res.id) {
      window.location.href = `/admin/sessions/${res.id}/edit`;
    }
  }

  return (
    <div className="space-y-10">
      <form action={onGenerate} className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
        <h2 className="font-display text-xl">AI script generator</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="targetMood">Target mood</Label>
            <Input id="targetMood" name="targetMood" defaultValue="overwhelmed" required />
          </div>
          <div>
            <Label htmlFor="category">Category label</Label>
            <Input id="category" name="category" defaultValue="stress relief" required />
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" name="duration" type="number" defaultValue={10} required />
          </div>
          <div>
            <Label htmlFor="tone">Tone</Label>
            <Input id="tone" name="tone" defaultValue="soft" required />
          </div>
        </div>
        <div>
          <Label htmlFor="goal">Goal</Label>
          <Input id="goal" name="goal" defaultValue="nervous system calm" required />
        </div>
        <div>
          <Label htmlFor="voiceStyle">Voice style</Label>
          <Input id="voiceStyle" name="voiceStyle" defaultValue="calm" required />
        </div>
        <div>
          <Label htmlFor="forbiddenPhrases">Forbidden phrases (optional)</Label>
          <Input id="forbiddenPhrases" name="forbiddenPhrases" placeholder="comma separated" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Generating…" : "Generate draft"}
        </Button>
      </form>

      <form action={onSave} className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
        <h2 className="font-display text-xl">Session fields</h2>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="shortDescription">Short description</Label>
          <Input
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="longDescription">Long description</Label>
          <Textarea
            id="longDescription"
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            required
          />
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
            <Label htmlFor="durationMinutes">Duration</Label>
            <Input
              id="durationMinutes"
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
              onChange={(e) => setIntensity(e.target.value)}
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
              onChange={(e) => setTone(e.target.value)}
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
          <Label htmlFor="scriptJson">Script JSON</Label>
          <Textarea
            id="scriptJson"
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
        <Button type="submit">Save session</Button>
      </form>

      {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
    </div>
  );
}
