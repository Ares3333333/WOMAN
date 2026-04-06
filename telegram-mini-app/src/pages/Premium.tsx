import { Link, useNavigate } from "react-router-dom";
import { CIRCLE_INCLUDED_ITEMS } from "../data/premium";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSIONS } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { useTelegram } from "../telegram/useTelegram";

export function PremiumPage() {
  const { lang, pathTitle, t } = useI18n();
  const { state, unlockPremium } = useProgress();
  const { app } = useTelegram();
  const nav = useNavigate();

  const L = lang === "ru" ? "ru" : "en";
  const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;

  const premiumSessions = SESSIONS.filter((s) => !s.freeTier && !(s.sensual && state.sensualMode === "hidden"));
  const deepTracks = premiumSessions.filter((s) => s.durationMin >= 15);
  const premiumPaths = PROGRAM_PATHS.filter((p) => p.tier === "premium");

  const copy =
    L === "ru"
      ? {
          title: "Circle",
          lead: "Один спокойный премиум-слой: глубокие практики, личные инсайты и поддержка.",
          freeTitle: "Starter",
          freeItems: ["Короткие базовые практики", "Ограниченный каталог"],
          premiumTitle: "Circle",
          premiumItems: ["Длинные вечерние и ночные треки", "Личный ритм и точные рекомендации", "Private Care по запросу"],
          includes: "Что открывается",
          guidance: "Дальше",
          trackerLine: "Инсайты помогают выбрать лучший трек на сегодня.",
          conciergeLine: "Private Care открывает доступ к проверенной поддержке.",
          unlock: "Включить Circle (test)",
          active: "Circle уже активен",
          concierge: "Открыть Private Care",
        }
      : {
          title: "Circle",
          lead: "One clear premium layer: deep tracks, tracker, and curated support.",
          freeTitle: "Starter",
          freeItems: ["Short core practices", "Limited catalog"],
          premiumTitle: "Circle",
          premiumItems: ["Long evening and sleep tracks", "Personal tracker and continuity", "Private concierge layer"],
          includes: "What opens",
          guidance: "Next",
          trackerLine: "Tracker suggests what to play tonight.",
          conciergeLine: "Concierge gives quiet access to trusted services.",
          unlock: "Unlock Circle (test)",
          active: "Circle is already active",
          concierge: "Send concierge request",
        };

  const openBot = (start?: string) => {
    if (!bot) return;
    const url = start ? `${bot}?start=${start}` : bot;
    try {
      app.openTelegramLink(url);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="tm-page">
      <header className="tm-head">
        <p className="tm-kicker">{t("homePremiumKicker")}</p>
        <h1 className="tm-h1">{copy.title}</h1>
        <p className="tm-lead">{copy.lead}</p>
      </header>

      <section className="tm-card home-premium">
        <div className="home-value-grid">
          <article className="home-value-item">
            <span className="home-value-number">{premiumSessions.length}</span>
            <span className="home-value-label">{t("homeValueLocked")}</span>
          </article>
          <article className="home-value-item">
            <span className="home-value-number">{deepTracks.length}</span>
            <span className="home-value-label">{t("homeValueSignature")}</span>
          </article>
        </div>

        <div className="premium-compare-grid" aria-label="plan comparison">
          <article className="premium-compare-card">
            <p className="tm-kicker tm-kicker--muted">{copy.freeTitle}</p>
            <ul className="home-premium-list">
              {copy.freeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="premium-compare-card premium-compare-card--accent">
            <p className="tm-kicker">{copy.premiumTitle}</p>
            <ul className="home-premium-list">
              {copy.premiumItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        {!state.premium ? (
          <button
            type="button"
            className="tm-btn tm-btn-primary tm-btn-block"
            onClick={() => {
              unlockPremium();
              nav("/premium");
            }}
          >
            {copy.unlock}
          </button>
        ) : (
          <button type="button" className="tm-btn tm-btn-secondary tm-btn-block" disabled>
            {copy.active}
          </button>
        )}

      </section>

      <section className="tm-card">
        <div className="tm-head">
          <p className="tm-kicker tm-kicker--muted">{copy.includes}</p>
          <h2 className="tm-h2">{t("shellCircle")}</h2>
        </div>

        <div className="profile-included-list">
          {CIRCLE_INCLUDED_ITEMS.slice(0, 4).map((item) => (
            <p key={item.en} className="tm-subtle">
              • {item[L]}
            </p>
          ))}
        </div>

        <div className="premium-program-list">
          {premiumPaths.slice(0, 3).map((path) => (
            <article key={path.id} className="premium-program-item">
              <p className="tm-list-title">{pathTitle(path.id)}</p>
              <p className="tm-list-sub">{path.sessionSlugs.length} {t("pathSessions")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tm-card">
        <div className="tm-head">
          <p className="tm-kicker tm-kicker--muted">{copy.guidance}</p>
          <h2 className="tm-h2">{t("homeTrackerTitle")}</h2>
          <p className="tm-subtle">{copy.trackerLine}</p>
          <p className="tm-subtle">{copy.conciergeLine}</p>
        </div>

        <div className="home-grid-2">
          <Link to="/paths" className="tm-btn tm-btn-secondary tm-btn-block">
            {t("navPaths")}
          </Link>
          <Link to="/profile" className="tm-btn tm-btn-ghost tm-btn-block">
            {t("navProfile")}
          </Link>
        </div>

        {bot ? (
          <button type="button" className="tm-btn tm-btn-secondary tm-btn-block" onClick={() => openBot("concierge")}>
            {copy.concierge}
          </button>
        ) : (
          <Link to="/profile" className="tm-btn tm-btn-secondary tm-btn-block">
            {t("profileConciergeRequest")}
          </Link>
        )}
      </section>
    </div>
  );
}



