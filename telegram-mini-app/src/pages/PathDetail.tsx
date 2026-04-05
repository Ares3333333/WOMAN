import { Link, useParams } from "react-router-dom";
import { IconChevron } from "../components/MiniNavIcons";
import { SessionMetaRow } from "../components/SessionMetaRow";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSION_BY_SLUG, type MiniSession } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { useTelegram } from "../telegram/useTelegram";

export function PathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang, pathTitle, t } = useI18n();
  const { state, unlockPremium } = useProgress();
  const { app } = useTelegram();

  const L = lang === "ru" ? "ru" : "en";
  const path = PROGRAM_PATHS.find((p) => p.id === id);

  const tierLabel = (tier: "free" | "mixed" | "premium") => {
    if (tier === "free") return t("tierFree");
    if (tier === "mixed") return t("tierMixed");
    return t("tierPremium");
  };

  const openPremium = () => {
    const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;
    if (!bot) {
      unlockPremium();
      return;
    }
    try {
      app.openTelegramLink(`${bot}?start=premium`);
    } catch {
      window.open(`${bot}?start=premium`, "_blank");
    }
  };

  if (!path) {
    return (
      <div className="tm-page">
        <Link to="/paths" className="session-back">
          ← {t("back")}
        </Link>
        <section className="tm-card">
          <h2 className="tm-h2">{t("pathNotFound")}</h2>
          <p className="tm-subtle">{t("pathNotFoundSub")}</p>
        </section>
      </div>
    );
  }

  const sessions = path.sessionSlugs
    .map((slug) => SESSION_BY_SLUG[slug])
    .filter((s): s is MiniSession => Boolean(s))
    .filter((s) => !(s.sensual && state.sensualMode === "hidden"));

  const introKey = `pathIntro_${path.id}`;
  const intro = t(introKey);
  const lockedCount = sessions.filter((s) => !s.freeTier && !state.premium).length;
  const freeCount = sessions.filter((s) => s.freeTier).length;
  const membersOnlyPath = path.tier === "premium" && freeCount === 0;

  return (
    <div className="tm-page">
      <Link to="/paths" className="session-back">
        ← {t("back")}
      </Link>

      <section className="path-detail-hero">
        <div className="path-card-head">
          <span className="tm-pill">{tierLabel(path.tier)}</span>
          {path.signature ? <span className="tm-pill tm-pill--accent">{t("pathsSignature")}</span> : null}
        </div>
        <p className="tm-kicker">{t(`pillarLabel_${path.pillarId}`)}</p>
        <h1 className="tm-h1">{pathTitle(path.id)}</h1>
        <p className="tm-lead">{intro !== introKey ? intro : t("pathsHeroSub")}</p>
        <div className="path-card-meta">
          <span>
            {sessions.length} {t("pathSessions")}
          </span>
          <span>{lockedCount > 0 ? `${lockedCount} ${t("pathsLockedLabel")}` : t("pathsOpenLabel")}</span>
        </div>
        <div className="path-card-meta">
          <span>{t(`pathAxis_${path.valueAxis}`)}</span>
          <span>{t("pathContinuity").replace("{count}", String(path.continuityWeeks))}</span>
        </div>
      </section>

      {path.tier === "premium" && !state.premium ? (
        <section className="tm-card session-gate">
          <h2 className="tm-h2">{t("pathsPremiumGateTitle")}</h2>
          <p className="tm-subtle">{t("pathsPremiumGateSub")}</p>
          <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={openPremium}>
            {t("pathsPremiumGateCta")}
          </button>
        </section>
      ) : null}

      <ul className="path-session-list">
        {sessions.map((s) => {
          const locked = !s.freeTier && !state.premium;

          const body = (
            <>
              <div className="path-session-copy">
                <span className="tm-pill">{t(`pillarTag_${s.pillarId}`)}</span>
                <span className="tm-list-title">{s.title[L]}</span>
                <p className="path-session-desc">{s.short[L]}</p>
                <SessionMetaRow session={s} t={t} />
              </div>
              <IconChevron className="tm-chevron" />
            </>
          );

          if (locked) {
            return (
              <li key={s.slug}>
                <button
                  type="button"
                  className="path-session-item path-session-item--locked path-session-button"
                  onClick={openPremium}
                >
                  {body}
                </button>
              </li>
            );
          }

          return (
            <li key={s.slug}>
              <Link to={`/session/${s.slug}`} className="path-session-item">
                {body}
              </Link>
            </li>
          );
        })}
      </ul>

      {membersOnlyPath && !state.premium ? (
        <section className="tm-card">
          <p className="tm-subtle">{t("pathsMembersOnlyHint")}</p>
        </section>
      ) : null}
    </div>
  );
}
