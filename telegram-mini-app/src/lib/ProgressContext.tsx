import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadProgress,
  markSelfCareToday,
  markSessionComplete,
  rememberLastSession,
  setPremium,
  setReminderMode as persistReminderMode,
  setSensualMode,
  type ProgressState,
} from "./progress";

type Ctx = {
  state: ProgressState;
  completeSession: (slug: string) => void;
  selfCareToday: () => void;
  unlockPremium: () => void;
  /** Сервер подтвердил премиум по initData Telegram */
  syncPremiumFromServer: (premium: boolean) => void;
  setSensual: (m: ProgressState["sensualMode"]) => void;
  rememberSession: (slug: string) => void;
  setReminderMode: (m: ProgressState["reminderMode"]) => void;
};

const ProgressCtx = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => loadProgress());

  const completeSession = useCallback((slug: string) => {
    setState((s) => markSessionComplete(s, slug));
  }, []);

  const selfCareToday = useCallback(() => {
    setState((s) => markSelfCareToday(s));
  }, []);

  const unlockPremium = useCallback(() => {
    setState((s) => setPremium(s, true));
  }, []);

  const syncPremiumFromServer = useCallback((premium: boolean) => {
    if (premium) setState((s) => setPremium(s, true));
  }, []);

  const setSensual = useCallback((m: ProgressState["sensualMode"]) => {
    setState((s) => setSensualMode(s, m));
  }, []);

  const rememberSession = useCallback((slug: string) => {
    setState((s) => rememberLastSession(s, slug));
  }, []);

  const setReminderMode = useCallback((m: ProgressState["reminderMode"]) => {
    setState((s) => persistReminderMode(s, m));
  }, []);

  const value = useMemo(
    () => ({
      state,
      completeSession,
      selfCareToday,
      unlockPremium,
      syncPremiumFromServer,
      setSensual,
      rememberSession,
      setReminderMode,
    }),
    [
      state,
      completeSession,
      selfCareToday,
      unlockPremium,
      syncPremiumFromServer,
      setSensual,
      rememberSession,
      setReminderMode,
    ]
  );

  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error("ProgressProvider missing");
  return c;
}
