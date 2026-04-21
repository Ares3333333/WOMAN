import { Link, NavLink, Outlet } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { IconHome, IconPaths, IconProfile } from "./MiniNavIcons";

export function Layout() {
  const { t } = useI18n();
  const { state } = useProgress();

  const items: { to: string; end?: boolean; label: string; Icon: typeof IconHome }[] = [
    { to: "/", end: true, label: t("navHome"), Icon: IconHome },
    { to: "/paths", label: t("navPaths"), Icon: IconPaths },
    { to: "/profile", label: t("navProfile"), Icon: IconProfile },
  ];

  return (
    <div className="tm-app-shell">
      <header className="tm-shell-header">
        <div className="tm-shell-header-inner">
          <div className="tm-brand">
            <div className="tm-brand-mark" aria-hidden>
              <span className="tm-brand-dot" />
            </div>
            <div className="tm-brand-copy">
              <span className="tm-brand-name">{t("brand")}</span>
              <span className="tm-brand-sub">{t("shellTagline")}</span>
            </div>
          </div>
          <Link to="/premium" className="tm-shell-status tm-shell-status-link">
            {state.premium ? t("shellCircle") : t("shellStarter")}
          </Link>
        </div>
      </header>

      <main className="tm-shell-main">
        <Outlet />
      </main>

      <nav className="tm-shell-nav-wrap" aria-label={t("navAriaMain")}>
        <div className="tm-shell-nav">
          {items.map(({ to, end, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `tm-shell-link${isActive ? " active" : ""}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
