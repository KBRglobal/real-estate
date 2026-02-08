import { useState, useEffect, useCallback, createContext, useContext, ReactNode, Component, ErrorInfo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Building2,
  Image,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  Shield,
  Bell,
  FileText,
  Sliders,
  Globe,
  FileCode,
  Home,
  Plus,
  UserPlus,
  AlertTriangle,
  RefreshCcw,
  CalendarClock,
  Clock,
  HardDrive,
  BellOff,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getBreadcrumbs } from "../config/page-titles";
import ddlLogo from "@assets/ddl_logo_1768141898381.png";

// ---- Language context ----
type Lang = "he" | "en";
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "he",
  setLang: () => {},
});
export const useLang = () => useContext(LangContext);

// ---- Badge counts ----
export interface AdminBadgeCounts {
  newLeads?: number;
  totalLeads?: number;
  projects?: number;
  media?: number;
  users?: number;
}

// ---- Notifications ----
export interface AdminNotification {
  id: string;
  type: "new_lead" | "overdue_followup" | "waiting_lead" | "high_priority" | "storage_alert";
  title: string;
  description: string;
  link: string;
  timestamp: Date;
  priority: "low" | "medium" | "high";
}

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  onLogout: () => void;
  badgeCounts?: AdminBadgeCounts;
  isLoading?: boolean;
  notifications?: AdminNotification[];
}

// ==========================================
// Error Boundary for admin content area
// ==========================================
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AdminErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Admin panel error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            שגיאה בטעינת העמוד
          </h2>
          <p className="text-slate-500 mb-6 max-w-md">
            אירעה שגיאה בלתי צפויה. נסה לרענן את העמוד או לחזור ללוח הבקרה.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              נסה שוב
            </button>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              לוח בקרה
            </a>
          </div>
          {this.state.error && (
            <details className="mt-6 text-sm text-slate-400 max-w-lg">
              <summary className="cursor-pointer hover:text-slate-600">
                פרטי השגיאה
              </summary>
              <pre className="mt-2 p-3 bg-slate-100 rounded-lg text-left overflow-auto text-xs" dir="ltr">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// Hook to detect if we're on desktop (lg breakpoint = 1024px)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return isDesktop;
}

// ==========================================
// Navigation with collapsible groups + badges
// ==========================================
interface NavItem {
  name: string;
  nameEn: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: keyof AdminBadgeCounts;
}

interface NavGroup {
  label: string;
  labelEn: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navSections: NavGroup[] = [
  {
    label: "ראשי",
    labelEn: "Main",
    defaultOpen: true,
    items: [
      { name: "לוח בקרה", nameEn: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "לידים", nameEn: "Leads", href: "/admin/leads", icon: Users, badgeKey: "newLeads" },
      { name: "פרויקטים", nameEn: "Projects", href: "/admin/projects", icon: Building2, badgeKey: "projects" },
    ],
  },
  {
    label: "תוכן",
    labelEn: "Content",
    defaultOpen: true,
    items: [
      { name: "תוכן האתר", nameEn: "Site Content", href: "/admin/site-content", icon: FileText },
      { name: "עמודים", nameEn: "Pages", href: "/admin/pages", icon: FileCode },
      { name: "מדיה", nameEn: "Media", href: "/admin/media", icon: Image, badgeKey: "media" },
      { name: "תרגומים", nameEn: "Translations", href: "/admin/translations", icon: Globe },
      { name: "עריכת דף הבית", nameEn: "Homepage", href: "/admin/homepage-editor", icon: Home },
    ],
  },
  {
    label: "מערכת",
    labelEn: "System",
    defaultOpen: false,
    items: [
      { name: "משתמשים", nameEn: "Users", href: "/admin/users", icon: Shield, badgeKey: "users" },
      { name: "הגדרות כלליות", nameEn: "General Settings", href: "/admin/general-settings", icon: Sliders },
      { name: "הגדרות", nameEn: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

// ---- Content skeleton for loading states ----
function PageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20 bg-slate-200" />
                <Skeleton className="h-8 w-16 bg-slate-200" />
                <Skeleton className="h-3 w-24 bg-slate-200" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-6 w-40 bg-slate-200" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 bg-slate-200" />
                <Skeleton className="h-3 w-48 bg-slate-200" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Collapsible nav group component ----
function NavGroupSection({
  group,
  lang,
  sidebarOpen,
  isActive,
  onNavigate,
  badgeCounts,
}: {
  group: NavGroup;
  lang: Lang;
  sidebarOpen: boolean;
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
  badgeCounts: AdminBadgeCounts;
}) {
  const hasActiveChild = group.items.some((item) => isActive(item.href));
  const [open, setOpen] = useState(group.defaultOpen || hasActiveChild);

  useEffect(() => {
    if (hasActiveChild && !open) setOpen(true);
  }, [hasActiveChild]);

  // Collapsed sidebar: icons only
  if (!sidebarOpen) {
    return (
      <div className="space-y-0.5">
        {group.items.map((item) => {
          const active = isActive(item.href);
          const badge = item.badgeKey ? badgeCounts[item.badgeKey] : undefined;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`relative flex items-center justify-center w-full h-11 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-200"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {badge != null && badge > 0 && (
                    <span className={`absolute -top-1 ${lang === "he" ? "-right-1" : "-left-1"} min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold px-1`}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side={lang === "he" ? "left" : "right"} className="font-medium">
                {lang === "he" ? item.name : item.nameEn}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  // Expanded: collapsible group
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors text-start"
      >
        <span>{lang === "he" ? group.label : group.labelEn}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pb-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const badge = item.badgeKey ? badgeCounts[item.badgeKey] : undefined;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                      active
                        ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-200 font-medium"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <item.icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                    <span className="flex-1 text-sm truncate">{lang === "he" ? item.name : item.nameEn}</span>
                    {badge != null && badge > 0 && (
                      <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-[11px] font-bold px-1.5 ${
                        active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Notification icon/color config ----
const notificationConfig: Record<AdminNotification["type"], { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  new_lead: { icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
  overdue_followup: { icon: CalendarClock, color: "text-red-600", bg: "bg-red-50" },
  waiting_lead: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  high_priority: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  storage_alert: { icon: HardDrive, color: "text-amber-600", bg: "bg-amber-50" },
};

export function AdminLayout({ children, title, onLogout, badgeCounts = {}, isLoading = false, notifications = [] }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("he");
  const isDesktop = useIsDesktop();
  const isRtl = lang === "he";

  // Apply admin-panel-light class to body
  useEffect(() => {
    document.body.classList.add("admin-panel-light");
    return () => { document.body.classList.remove("admin-panel-light"); };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  const isActive = useCallback(
    (href: string) => href === "/admin" ? location === "/admin" : location.startsWith(href),
    [location]
  );

  const breadcrumbs = getBreadcrumbs(location);

  const renderSidebarNav = (isMobile: boolean) => (
    <div className={`space-y-2 ${isMobile ? "" : "px-1"}`} dir={isRtl ? "rtl" : "ltr"}>
      {navSections.map((group) => (
        <NavGroupSection
          key={group.label}
          group={group}
          lang={lang}
          sidebarOpen={isMobile || sidebarOpen}
          isActive={isActive}
          onNavigate={isMobile ? () => setMobileMenuOpen(false) : undefined}
          badgeCounts={badgeCounts}
        />
      ))}
    </div>
  );

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <TooltipProvider delayDuration={200}>
        <div className="admin-panel-light min-h-screen text-slate-900" dir={isRtl ? "rtl" : "ltr"} style={{ backgroundColor: "#f1f5f9" }} data-admin-theme="light">
          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 right-0 left-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-3 shadow-sm">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors" data-testid="button-mobile-menu" aria-label={isRtl ? "פתח תפריט" : "Open menu"}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src={ddlLogo} alt="DDL Real Estate" className="h-7" data-testid="admin-logo-mobile" />
              <span className="text-sm font-bold text-slate-900">KBR CMC</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setLang(lang === "he" ? "en" : "he")} className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors text-xs font-bold">
                {lang === "he" ? "EN" : "HE"}
              </button>
              <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" data-testid="button-logout-mobile" aria-label={isRtl ? "התנתק" : "Logout"}>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setMobileMenuOpen(false)} />
                <motion.div
                  initial={{ x: isRtl ? "100%" : "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: isRtl ? "100%" : "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  dir={isRtl ? "rtl" : "ltr"}
                  className={`lg:hidden fixed top-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col ${isRtl ? "right-0 border-s border-slate-200" : "left-0 border-e border-slate-200"}`}
                >
                  <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <img src={ddlLogo} alt="DDL Real Estate" className="h-9" />
                      <div>
                        <span className="text-sm font-bold text-slate-900">KBR CMC</span>
                        <p className="text-[11px] text-slate-400">{lang === "he" ? "מערכת ניהול" : "Admin Panel"}</p>
                      </div>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors" data-testid="button-close-mobile-menu" aria-label={isRtl ? "סגור תפריט" : "Close menu"}>
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <ScrollArea className="flex-1">
                    <nav className="p-3">{renderSidebarNav(true)}</nav>
                  </ScrollArea>
                  <div className="p-3 border-t border-slate-200 shrink-0 space-y-0.5" dir={isRtl ? "rtl" : "ltr"}>
                    <button onClick={() => setLang(lang === "he" ? "en" : "he")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm">
                      <Globe className="h-[18px] w-[18px]" />
                      <span>{lang === "he" ? "English" : "עברית"}</span>
                    </button>
                    <button onClick={() => { setMobileMenuOpen(false); onLogout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all text-sm">
                      <LogOut className="h-[18px] w-[18px]" />
                      <span>{lang === "he" ? "התנתק" : "Logout"}</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <motion.aside
            initial={false}
            animate={{ width: sidebarOpen ? 260 : 72 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            dir={isRtl ? "rtl" : "ltr"}
            className={`hidden lg:flex fixed top-0 bottom-0 flex-col bg-white z-40 shadow-sm ${isRtl ? "right-0 border-s border-slate-200" : "left-0 border-e border-slate-200"}`}
          >
            <div className="h-16 flex items-center justify-between px-3 border-b border-slate-200 shrink-0">
              {sidebarOpen ? (
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img src={ddlLogo} alt="DDL Real Estate" className="h-9 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-900 block truncate">KBR CMC</span>
                    <p className="text-[11px] text-slate-400 truncate">{lang === "he" ? "מערכת ניהול" : "Admin Panel"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <img src={ddlLogo} alt="DDL Real Estate" className="h-8" />
                </div>
              )}
              {sidebarOpen && (
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shrink-0" aria-label={isRtl ? "כווץ תפריט" : "Collapse sidebar"}>
                  <ChevronLeft className={`h-4 w-4 transition-transform ${isRtl ? "" : "rotate-180"}`} />
                </button>
              )}
            </div>
            {!sidebarOpen && (
              <div className="flex justify-center py-2 border-b border-slate-100 shrink-0">
                <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors" aria-label={isRtl ? "הרחב תפריט" : "Expand sidebar"}>
                  <ChevronLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
            <ScrollArea className="flex-1 py-3 px-2">
              <nav>{renderSidebarNav(false)}</nav>
            </ScrollArea>
            <div className="border-t border-slate-200 p-2 shrink-0 space-y-0.5" dir={isRtl ? "rtl" : "ltr"}>
              {sidebarOpen ? (
                <>
                  <button onClick={() => setLang(lang === "he" ? "en" : "he")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm">
                    <Globe className="h-[18px] w-[18px] shrink-0" />
                    <span>{lang === "he" ? "English" : "עברית"}</span>
                  </button>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm">
                    <LogOut className="h-[18px] w-[18px] shrink-0" />
                    <span>{lang === "he" ? "התנתק" : "Logout"}</span>
                  </button>
                </>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setLang(lang === "he" ? "en" : "he")} className="w-full flex items-center justify-center h-11 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all text-xs font-bold">
                        {lang === "he" ? "EN" : "HE"}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side={isRtl ? "left" : "right"}>{lang === "he" ? "Switch to English" : "עבור לעברית"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={onLogout} className="w-full flex items-center justify-center h-11 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all">
                        <LogOut className="h-[18px] w-[18px]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side={isRtl ? "left" : "right"}>{lang === "he" ? "התנתק" : "Logout"}</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={false}
            animate={{ [isRtl ? "marginRight" : "marginLeft"]: isDesktop ? (sidebarOpen ? 260 : 72) : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="min-h-screen pt-14 lg:pt-0"
          >
            {/* Desktop Header */}
            <header className="hidden lg:block sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
              <div className="h-16 flex items-center justify-between px-6">
                <div className="min-w-0 flex-1">
                  {breadcrumbs.length > 1 && (
                    <Breadcrumb className="mb-0.5">
                      <BreadcrumbList>
                        {breadcrumbs.map((crumb, idx) => (
                          <BreadcrumbItem key={crumb.href}>
                            {idx < breadcrumbs.length - 1 ? (
                              <>
                                <BreadcrumbLink asChild>
                                  <Link href={crumb.href} className="text-slate-400 hover:text-slate-700 text-xs transition-colors">{lang === "he" ? crumb.he : crumb.en}</Link>
                                </BreadcrumbLink>
                                <BreadcrumbSeparator className={isRtl ? "rotate-180" : ""} />
                              </>
                            ) : (
                              <BreadcrumbPage className="text-xs text-slate-600 font-medium">{lang === "he" ? crumb.he : crumb.en}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  )}
                  <h1 className="text-xl font-bold text-slate-900 truncate">{title}</h1>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 text-slate-600 border-slate-200 hover:border-slate-300 h-9">
                        <Plus className="h-4 w-4" />
                        <span className="hidden xl:inline text-xs">{lang === "he" ? "הוספה מהירה" : "Quick Add"}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRtl ? "start" : "end"} className="w-48">
                      <DropdownMenuLabel className="text-xs text-slate-400">{lang === "he" ? "הוספה מהירה" : "Quick Add"}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setLocation("/admin/leads")} className="gap-2 cursor-pointer">
                        <UserPlus className="h-4 w-4 text-blue-500" />
                        <span>{lang === "he" ? "ליד חדש" : "New Lead"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation("/admin/projects")} className="gap-2 cursor-pointer">
                        <Building2 className="h-4 w-4 text-purple-500" />
                        <span>{lang === "he" ? "פרויקט חדש" : "New Project"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation("/admin/media")} className="gap-2 cursor-pointer">
                        <Image className="h-4 w-4 text-green-500" />
                        <span>{lang === "he" ? "העלאת מדיה" : "Upload Media"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setLang(lang === "he" ? "en" : "he")} className="h-9 w-9 p-0 text-slate-500 hover:text-slate-900">
                        <span className="text-xs font-bold">{lang === "he" ? "EN" : "HE"}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{lang === "he" ? "Switch to English" : "עבור לעברית"}</TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="relative h-9 w-9 flex items-center justify-center text-slate-400 rounded-lg hover:bg-slate-100 transition-colors">
                        <Bell className="h-4 w-4" />
                        {notifications.length > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 ring-2 ring-white">
                            {notifications.length > 99 ? "99+" : notifications.length}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRtl ? "start" : "end"} className="w-80" style={{ direction: isRtl ? "rtl" : "ltr" }}>
                      <DropdownMenuLabel className="text-xs text-slate-400 flex items-center justify-between">
                        <span>{lang === "he" ? "התראות" : "Notifications"}</span>
                        {notifications.length > 0 && (
                          <span className="text-[10px] bg-red-100 text-red-600 rounded-full px-1.5 py-0.5 font-bold">{notifications.length}</span>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">
                          <BellOff className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">{lang === "he" ? "אין התראות חדשות" : "No new notifications"}</p>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-80">
                          {notifications.slice(0, 20).map((notif) => {
                            const config = notificationConfig[notif.type];
                            const Icon = config.icon;
                            return (
                              <DropdownMenuItem
                                key={notif.id}
                                onClick={() => setLocation(notif.link)}
                                className="gap-3 cursor-pointer py-2.5 px-3 focus:bg-slate-50"
                              >
                                <div className={`shrink-0 w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                                  <Icon className={`h-4 w-4 ${config.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 truncate">{notif.title}</p>
                                  <p className="text-xs text-slate-400 truncate">{notif.description}</p>
                                </div>
                                {notif.priority === "high" && (
                                  <span className="shrink-0 w-2 h-2 rounded-full bg-red-500" />
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                        </ScrollArea>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{lang === "he" ? "מ" : "A"}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-700 hidden xl:block">{lang === "he" ? "מנהל" : "Admin"}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRtl ? "start" : "end"} className="w-44">
                      <DropdownMenuLabel className="text-xs text-slate-400">{lang === "he" ? "חשבון" : "Account"}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setLocation("/admin/settings")} className="gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>{lang === "he" ? "הגדרות" : "Settings"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onLogout} className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
                        <LogOut className="h-4 w-4" />
                        <span>{lang === "he" ? "התנתק" : "Logout"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            {/* Mobile Page Title + Breadcrumbs */}
            <div className="lg:hidden px-4 py-3 bg-white border-b border-slate-200">
              {breadcrumbs.length > 1 && (
                <Breadcrumb className="mb-1">
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, idx) => (
                      <BreadcrumbItem key={crumb.href}>
                        {idx < breadcrumbs.length - 1 ? (
                          <>
                            <BreadcrumbLink asChild>
                              <Link href={crumb.href} className="text-slate-400 hover:text-slate-700 text-xs">{lang === "he" ? crumb.he : crumb.en}</Link>
                            </BreadcrumbLink>
                            <BreadcrumbSeparator className={isRtl ? "rotate-180" : ""} />
                          </>
                        ) : (
                          <BreadcrumbPage className="text-xs text-slate-600 font-medium">{lang === "he" ? crumb.he : crumb.en}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
              <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            </div>

            {/* Page Content */}
            <div className="p-4 lg:p-6">
              <AdminErrorBoundary>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <PageSkeleton />
                    </motion.div>
                  ) : (
                    <motion.div key={location} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                      {children}
                    </motion.div>
                  )}
                </AnimatePresence>
              </AdminErrorBoundary>
            </div>
          </motion.main>
        </div>
      </TooltipProvider>
    </LangContext.Provider>
  );
}
