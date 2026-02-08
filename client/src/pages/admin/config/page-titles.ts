import { getPluginTitle } from "./plugins";

/**
 * Page title config with Hebrew, English, and breadcrumb parent
 */
export interface PageTitleConfig {
  he: string;
  en: string;
  /** Parent route for breadcrumb chain */
  parent?: string;
}

export const pageTitleConfigs: Record<string, PageTitleConfig> = {
  "/admin": { he: "לוח בקרה", en: "Dashboard" },
  "/admin/pages": { he: "עמודים", en: "Pages", parent: "/admin" },
  "/admin/projects": { he: "פרויקטים", en: "Projects", parent: "/admin" },
  "/admin/site-content": { he: "תוכן האתר", en: "Site Content", parent: "/admin" },
  "/admin/general-settings": { he: "הגדרות", en: "Settings", parent: "/admin" },
  "/admin/homepage-editor": { he: "עריכת דף הבית", en: "Homepage Editor", parent: "/admin" },
  "/admin/mini-sites": { he: "מיני-סייט", en: "Mini Sites", parent: "/admin" },
  "/admin/prospects": { he: "ייבוא חכם", en: "Smart Import", parent: "/admin" },
  "/admin/media": { he: "מדיה", en: "Media", parent: "/admin" },
  "/admin/leads": { he: "לידים", en: "Leads", parent: "/admin" },
  "/admin/translations": { he: "תרגומים", en: "Translations", parent: "/admin" },
  "/admin/users": { he: "משתמשים והרשאות", en: "Users & Permissions", parent: "/admin" },
  "/admin/settings": { he: "הגדרות", en: "Settings", parent: "/admin" },
};

/** Legacy simple map for backward compat */
export const pageTitles: Record<string, string> = Object.fromEntries(
  Object.entries(pageTitleConfigs).map(([k, v]) => [k, v.he])
);

/**
 * Get full page config for a location
 */
export function getPageConfig(location: string): PageTitleConfig | null {
  if (pageTitleConfigs[location]) {
    return pageTitleConfigs[location];
  }
  const pluginTitle = getPluginTitle(location);
  if (pluginTitle) {
    return { he: pluginTitle, en: pluginTitle, parent: "/admin" };
  }
  for (const [path, config] of Object.entries(pageTitleConfigs)) {
    if (location.startsWith(path) && path !== "/admin") {
      return config;
    }
  }
  return null;
}

/**
 * Get current page title based on location (Hebrew)
 */
export function getCurrentTitle(location: string): string {
  return getPageConfig(location)?.he ?? "לוח בקרה";
}

/**
 * Build breadcrumb trail for a given location
 */
export function getBreadcrumbs(location: string): Array<{ href: string; he: string; en: string }> {
  const config = getPageConfig(location);
  if (!config) return [{ href: "/admin", he: "לוח בקרה", en: "Dashboard" }];

  const chain: Array<{ href: string; config: PageTitleConfig }> = [];
  let currentPath: string | undefined = location;

  while (currentPath) {
    const cfg: PageTitleConfig | undefined = pageTitleConfigs[currentPath];
    if (cfg) {
      chain.unshift({ href: currentPath, config: cfg });
      currentPath = cfg.parent;
    } else {
      let found = false;
      for (const [path, pathCfg] of Object.entries(pageTitleConfigs)) {
        if (currentPath!.startsWith(path) && path !== "/admin") {
          chain.unshift({ href: path, config: pathCfg });
          currentPath = pathCfg.parent;
          found = true;
          break;
        }
      }
      if (!found) {
        if (currentPath!.startsWith("/admin/plugin/")) {
          const pluginTitle = getPluginTitle(currentPath!);
          if (pluginTitle) {
            chain.unshift({
              href: currentPath!,
              config: { he: pluginTitle, en: pluginTitle, parent: "/admin" },
            });
          }
          currentPath = "/admin";
        } else {
          break;
        }
      }
    }
  }

  return chain.map((c) => ({ href: c.href, he: c.config.he, en: c.config.en }));
}
