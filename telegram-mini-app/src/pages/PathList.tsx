import { Link } from "react-router-dom";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSION_BY_SLUG } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";

function priority(tier: "free" | "mixed" | "premium", signature?: boolean): number {
  if (signature) return 0;
  if (tier === "premium") return 1;
  if (tier === "mixed") return 2;
  return 3;
}

export function PathListPage() {
  const { pathTitle, t } = useI18n();
  const { state } = useProgress();

  const visible = PROGRAM_PATHS.filter((path) =>
    path.sessionSlugs.some((slug) => {
      const s = SESSION_BY_SLUG[slug];
      if (!s) return false;
      if (s.sensual && state.sensualMode === "hidden") return false;
      return true;
    })
  )
    .sort((a, b) => priority(a.tier, a.signature) - priority(b.tier, b.signature))
    .slice(0, 6);

  const tierLabel = (tier: "free" | "mixed" | "premium") => {
    if (tier === "free") return t("tierFree");
    if (tier === "mixed") return t("tierMixed");
    return t("tierPremium");
  };

  return (
    <div className="tm-page">
      <header className="tm-head">
        <h1 className="tm-h1">{t("navPaths")}</h1>
        <p className="tm-lead">{t("pathsHeroSub")}</p>
      </header>

      <ul className="paths-layout" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {visible.map((path) => {
          const sessionsCount = path.sessionSlugs.filter((slug) => {
            const s = SESSION_BY_SLUG[slug];
            if (!s) return false;
            if (s.sensual && state.sensualMode === "hidden") return false;
            return true;
          }).length;

          return (
            <li key={path.id}>
              <Link to={`/path/${path.id}`} className={`path-card${path.tier === "premium" ? " path-card--premium" : ""}`}>
                <div className="path-card-head">
                  <span className="tm-pill">{tierLabel(path.tier)}</span>
                  {path.signature ? <span className="tm-pill tm-pill--accent">{t("pathsSignature")}</span> : null}
                </div>
                <h2 className="path-card-title">{pathTitle(path.id)}</h2>
                <p className="tm-subtle">{sessionsCount} {t("pathSessions")}</p>
              </Link>
            </li>
          );
        })}
      </ul>

      {!state.premium ? (
        <Link to="/premium" className="tm-btn tm-btn-ghost tm-btn-block">
          {t("homePrimaryLockedCta")}
        </Link>
      ) : null}
    </div>
  );
}
