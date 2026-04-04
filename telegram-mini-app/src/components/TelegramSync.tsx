import { useEffect, useRef } from "react";
import { useProgress } from "../lib/ProgressContext";

/**
 * Синхронизирует премиум с бэкендом по initData (тот же домен, что и мини-приложение, или VITE_API_URL).
 */
export function TelegramSync() {
  const { syncPremiumFromServer } = useProgress();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return;
    ran.current = true;

    const rawBase = import.meta.env.VITE_API_URL;
    const base = typeof rawBase === "string" ? rawBase.replace(/\/$/, "") : "";
    const url = base ? `${base}/api/telegram/me` : "/api/telegram/me";

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.ok && data.premium) syncPremiumFromServer(true);
      })
      .catch(() => {
        /* офлайн / нет сервера — остаётся локальный режим */
      });
  }, [syncPremiumFromServer]);

  return null;
}
