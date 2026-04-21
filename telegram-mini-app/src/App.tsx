import { useMemo, useState, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { TelegramSync } from "./components/TelegramSync";
import { detectLangFromTelegram, I18nProvider, type Lang } from "./lib/i18n";
import { ProgressProvider } from "./lib/ProgressContext";
import { HomePage } from "./pages/Home";
import { PathDetailPage } from "./pages/PathDetail";
import { PathListPage } from "./pages/PathList";
import { PremiumPage } from "./pages/Premium";
import { ProfilePage } from "./pages/Profile";
import { SessionPlayPage } from "./pages/SessionPlay";
import { getWebApp } from "./telegram/useTelegram";

function readSavedLang(): Lang | null {
  try {
    const s = localStorage.getItem("sora_lang");
    if (s === "ru" || s === "en") return s;
  } catch {
    /* ignore */
  }
  return null;
}

function AppProviders({ children }: { children: ReactNode }) {
  const [initialLang] = useState<Lang>(() => {
    const saved = readSavedLang();
    if (saved) return saved;
    const app = getWebApp();
    return detectLangFromTelegram(app.initDataUnsafe.user?.language_code);
  });

  const stable = useMemo(() => initialLang, [initialLang]);

  return (
    <I18nProvider initialLang={stable}>
      <ProgressProvider>
        <TelegramSync />
        {children}
      </ProgressProvider>
    </I18nProvider>
  );
}

export default function App() {
  return (
    <AppProviders>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="paths" element={<PathListPage />} />
          <Route path="path/:id" element={<PathDetailPage />} />
          <Route path="session/:slug" element={<SessionPlayPage />} />
          <Route path="goals" element={<Navigate to="/profile" replace />} />
          <Route path="premium" element={<PremiumPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProviders>
  );
}
