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
          lead: "Премиальный уровень: глубокие треки, личные инсайты и private care.",
          price: "$100/month · private membership",
          freeTitle: "Starter",
          freeItems: ["Короткие базовые практики", "Ограниченная библиотека"],
          premiumTitle: "Circle",
          premiumItems: ["Длинные вечерние и ночные треки", "Личный ритм и точные рекомендации", "Private Care по запросу"],
          includes: "Что входит в Circle",
          trackerLine: "Инсайты помогают выбрать лучший трек на сегодня.",
          conciergeLine: "Private Care открывает доступ к проверенной поддержке.",
          unlock: "Включить Circle (test)",
          active: "Circle уже активен",
          concierge: "Открыть Private Care",
        }
      : {
          title: "Circle",
          lead: "Premium level: deep tracks, personal insights, and private care.",
          price: "$100/month · private membership",
          freeTitle: "Starter",
          freeItems: ["Short core practices", "Limited library"],
          premiumTitle: "Circle",
          premiumItems: ["Long evening and night tracks", "Personal tracker and continuity", "Private Care on request"],
          includes: "Included in Circle",
          trackerLine: "Tracker suggests what to play tonight.",
          conciergeLine: "Concierge gives quiet access to trusted services.",
          unlock: "Unlock Circle (test)",
          active: "Circle is already active",
          concierge: "Open Private Care",
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
        <p className="tm-subtle">{copy.price}</p>

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

        <div className="premium-compact-compare" aria-label="plan comparison">
          <article className="premium-compact-col">
            <p className="tm-kicker tm-kicker--muted">{copy.freeTitle}</p>
            <ul className="home-premium-list">
              {copy.freeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="premium-compact-col">
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

      <section className="tm-card tm-card--quiet">
        <div className="tm-head">
          <h2 className="tm-h2">{copy.includes}</h2>
        </div>

        <div className="profile-included-list">
          {CIRCLE_INCLUDED_ITEMS.slice(0, 3).map((item) => (
            <p key={item.en} className="tm-subtle">
              • {item[L]}
            </p>
          ))}
        </div>

        <div className="premium-line-list">
          {premiumPaths.slice(0, 2).map((path) => (
            <p key={path.id} className="premium-line">
              <span className="tm-list-title">{pathTitle(path.id)}</span>
              <span className="tm-list-sub">
                {path.sessionSlugs.length} {t("pathSessions")}
              </span>
            </p>
          ))}
        </div>

        <p className="tm-subtle">{copy.trackerLine}</p>
        <p className="tm-subtle">{copy.conciergeLine}</p>

        <Link to="/paths" className="tm-btn tm-btn-secondary tm-btn-block">
          {t("navPaths")}
        </Link>

        {state.premium && bot ? (
          <button type="button" className="tm-btn tm-btn-ghost tm-btn-block" onClick={() => openBot("concierge")}>
            {copy.concierge}
          </button>
        ) : state.premium ? (
          <Link to="/profile" className="tm-btn tm-btn-ghost tm-btn-block">
            {t("profileConciergeRequest")}
          </Link>
        ) : null}
      </section>
    </div>
  );
}



