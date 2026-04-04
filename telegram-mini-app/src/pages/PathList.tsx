import { Link } from "react-router-dom";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSION_BY_SLUG } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";

export function PathListPage() {
  const { pathTitle, t } = useI18n();
  const { state } = useProgress();

  return (
    <div className="page-head">
      <h1>{t("pathsTitle")}</h1>
      <p className="sub">{t("pathsSub")}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {PROGRAM_PATHS.map((path) => {
          const count = path.sessionSlugs.filter((slug) => {
            const s = SESSION_BY_SLUG[slug];
            if (!s) return false;
            if (s.sensual && state.sensualMode === "hidden") return false;
            return true;
          }).length;
          if (count === 0) return null;
          return (
            <li key={path.id}>
              <Link
                to={`/path/${path.id}`}
                className="card"
                style={{
                  background: "color-mix(in srgb, var(--tg-secondary) 95%, transparent)",
                }}
              >
                <h2 style={{ margin: "0 0 6px", fontSize: "1.15rem" }}>{pathTitle(path.id)}</h2>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--tg-hint)" }}>
                  {count} {t("pathSessions")}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
