"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { runPulseScan } from "@/features/biofeedback/camera-pulse-scan";
import type { PulseScanResult } from "@/features/biofeedback/types";

export function PulseScanPanel({
  title,
  lead,
  instruction,
  onResult,
  onScanStart,
  onScanCanceled,
  labels,
}: {
  title: string;
  lead: string;
  instruction: string;
  onResult: (result: PulseScanResult) => Promise<void> | void;
  onScanStart?: () => void;
  onScanCanceled?: () => void;
  labels: {
    start: string;
    scanning: string;
    cancel: string;
    reset: string;
    ready: string;
    failed: string;
  };
}) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const pct = Math.round(progress * 100);
  const progressStyle = useMemo(() => ({ width: `${pct}%` }), [pct]);

  async function start() {
    setLocalError(null);
    setScanning(true);
    setProgress(0);
    onScanStart?.();

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const result = await runPulseScan({
        durationMs: 35_000,
        onProgress: setProgress,
        signal: abortController.signal,
        facingMode: "environment",
      });
      await onResult(result);
    } catch {
      setLocalError(labels.failed);
    } finally {
      setScanning(false);
      abortRef.current = null;
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setScanning(false);
    onScanCanceled?.();
  }

  return (
    <section className="rounded-2xl border border-border/50 bg-card/55 p-4">
      <div className="space-y-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/80">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{lead}</p>
      </div>

      <div className="mt-4 rounded-xl border border-border/45 bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
          <p className="text-xs leading-relaxed text-muted-foreground">{instruction}</p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary/85 transition-[width] duration-200" style={progressStyle} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{scanning ? `${pct}%` : labels.ready}</p>

        {localError ? (
          <p className="mt-3 rounded-lg border border-destructive/35 bg-destructive/[0.06] px-3 py-2 text-xs text-destructive">
            {localError}
          </p>
        ) : null}

        <div className={cn("mt-4 flex flex-wrap gap-2", scanning && "opacity-95")}>
          {!scanning ? (
            <Button type="button" className="rounded-full" onClick={start}>
              <Camera className="mr-2 h-4 w-4" />
              {labels.start}
            </Button>
          ) : (
            <>
              <Button type="button" className="rounded-full" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {labels.scanning}
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={cancel}>
                {labels.cancel}
              </Button>
            </>
          )}

          {!scanning ? (
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => setProgress(0)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {labels.reset}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
