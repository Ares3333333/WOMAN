import { NavLink, Outlet } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { IconGoals, IconHome, IconPaths, IconProfile } from "./MiniNavIcons";

export function Layout() {
  const { t } = useI18n();

  const items: { to: string; end?: boolean; label: string; Icon: typeof IconHome }[] = [
    { to: "/", end: true, label: t("navHome"), Icon: IconHome },
    { to: "/paths", label: t("navPaths"), Icon: IconPaths },
    { to: "/goals", label: t("navGoals"), Icon: IconGoals },
    { to: "/profile", label: t("navProfile"), Icon: IconProfile },
  ];

  return (
    <>
      <header className="shell-header">
        <div className="shell-header-inner">
          <div className="shell-brand-mark" aria-hidden>
            <span className="shell-brand-glyph" />
          </div>
          <div className="shell-brand-text">
            <span className="shell-brand-name">{t("brand")}</span>
            <span className="shell-brand-tag">{t("shellTagline")}</span>
          </div>
        </div>
      </header>
      <div className="app-shell">
        <Outlet />
      </div>
      <nav className="bottom-dock-wrap" aria-label={t("navAriaMain")}>
        <div className="bottom-dock">
          {items.map(({ to, end, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `dock-link${isActive ? " dock-link--active" : ""}`}
            >
              <Icon className="dock-link-icon" />
              <span className="dock-link-label">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
