import { useEffect, useMemo, useState } from "react";
import type { TelegramWebApp } from "./types";

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

export function initTelegramApp(): TelegramWebApp {
  const twa = getWebApp();
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
    const tp = app.themeParams;
    const root = document.documentElement;
    if (tp.bg_color) root.style.setProperty("--tg-bg", `#${tp.bg_color}`);
    if (tp.secondary_bg_color) root.style.setProperty("--tg-secondary", `#${tp.secondary_bg_color}`);
    if (tp.text_color) root.style.setProperty("--tg-text", `#${tp.text_color}`);
    if (tp.hint_color) root.style.setProperty("--tg-hint", `#${tp.hint_color}`);
    if (tp.link_color) root.style.setProperty("--tg-link", `#${tp.link_color}`);
    if (tp.button_color) root.style.setProperty("--tg-button", `#${tp.button_color}`);
    if (tp.button_text_color) root.style.setProperty("--tg-button-text", `#${tp.button_text_color}`);
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
