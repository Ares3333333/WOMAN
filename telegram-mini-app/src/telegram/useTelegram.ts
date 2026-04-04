import { useEffect, useMemo, useState } from "react";
import type { TelegramWebApp } from "./types";

/** Telegram may send #RRGGBB or RRGGBB — avoid ## which breaks CSS variables (text turns black on some clients). */
function themeColorToCss(value: string | undefined): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const hex = value.trim().replace(/^#+/, "");
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return `#${hex}`;
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  return undefined;
}

function mockWebApp(): TelegramWebApp {
  const noop = () => {};
  return {
    initData: "",
    initDataUnsafe: { user: { id: 0, first_name: "Sora", language_code: "ru" } },
    version: "7.0",
    platform: "web",
    colorScheme: "dark",
    themeParams: {
      bg_color: "#1a1625",
      text_color: "#f4eef7",
      hint_color: "#9a8fb0",
      link_color: "#e8b4c8",
      button_color: "#c77dff",
      button_text_color: "#1a1625",
      secondary_bg_color: "#2d2640",
    },
    isExpanded: true,
    viewportHeight: 640,
    viewportStableHeight: 640,
    ready: noop,
    expand: noop,
    close: noop,
    MainButton: {
      text: "",
      color: "#c77dff",
      textColor: "#1a1625",
      isVisible: false,
      isActive: true,
      show: noop,
      hide: noop,
      enable: noop,
      disable: noop,
      showProgress: noop,
      hideProgress: noop,
      setText: noop,
      onClick: noop,
      offClick: noop,
    },
    BackButton: {
      isVisible: false,
      show: noop,
      hide: noop,
      onClick: noop,
      offClick: noop,
    },
    HapticFeedback: {
      impactOccurred: noop,
      notificationOccurred: noop,
      selectionChanged: noop,
    },
    openLink: (url) => window.open(url, "_blank"),
    openTelegramLink: (url) => window.open(url, "_blank"),
    showPopup: (_p, cb) => cb?.(""),
  };
}

export function getWebApp(): TelegramWebApp {
  if (typeof window === "undefined") return mockWebApp();
  const w = window.Telegram?.WebApp;
  if (w) return w;
  return mockWebApp();
}

export function applyTelegramThemeVars(twa: TelegramWebApp): void {
  const tp = twa.themeParams;
  const root = document.documentElement;
  const set = (prop: string, raw: string | undefined) => {
    const c = themeColorToCss(raw);
    if (c) root.style.setProperty(prop, c);
  };
  set("--tg-bg", tp.bg_color);
  set("--tg-secondary", tp.secondary_bg_color);
  set("--tg-text", tp.text_color);
  set("--tg-hint", tp.hint_color);
  set("--tg-link", tp.link_color);
  set("--tg-button", tp.button_color);
  set("--tg-button-text", tp.button_text_color);
}

export function initTelegramApp(): TelegramWebApp {
  const twa = getWebApp();
  applyTelegramThemeVars(twa);
  twa.ready();
  twa.expand();
  return twa;
}

export function useTelegram() {
  const [app] = useState(() => getWebApp());

  const isTelegram = useMemo(
    () => Boolean(app.initData && app.initData.length > 0),
    [app.initData]
  );

  useEffect(() => {
    applyTelegramThemeVars(app);
  }, [app]);

  return { app, isTelegram };
}

export function hapticLight(app: TelegramWebApp) {
  try {
    app.HapticFeedback?.impactOccurred("light");
  } catch {
    /* ignore */
  }
}
