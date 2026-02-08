import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * GeneralSettingsView now redirects to the unified SettingsView at /admin/settings.
 * All general settings, SEO, branding, social, and security are managed there.
 */
export function GeneralSettingsView() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/admin/settings"); }, [setLocation]);
  return null;
}
