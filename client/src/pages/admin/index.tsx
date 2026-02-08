import { useEffect, useMemo, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { AdminLogin } from "./Login";
import { AdminLayout, type AdminNotification } from "./components/AdminLayout";

// Lazy load all admin views - only the active view's code is downloaded.
// This dramatically reduces the initial admin bundle size.
const DashboardView = lazy(() => import("./views/DashboardView").then(m => ({ default: m.DashboardView })));
const LeadsView = lazy(() => import("./views/LeadsView").then(m => ({ default: m.LeadsView })));
const ProjectsView = lazy(() => import("./views/ProjectsView").then(m => ({ default: m.ProjectsView })));
const PagesView = lazy(() => import("./views/PagesView").then(m => ({ default: m.PagesView })));
const MediaView = lazy(() => import("./views/MediaView").then(m => ({ default: m.MediaView })));
const SettingsView = lazy(() => import("./views/SettingsView").then(m => ({ default: m.SettingsView })));
const MiniSitesView = lazy(() => import("./views/MiniSitesView").then(m => ({ default: m.MiniSitesView })));
const ProspectImportView = lazy(() => import("./views/ProspectImportView").then(m => ({ default: m.ProspectImportView })));
const UsersView = lazy(() => import("./views/UsersView").then(m => ({ default: m.UsersView })));
const TranslationsView = lazy(() => import("./views/TranslationsView").then(m => ({ default: m.TranslationsView })));
const PluginPlaceholder = lazy(() => import("./views/PluginPlaceholder").then(m => ({ default: m.PluginPlaceholder })));
const LeadScoringView = lazy(() => import("./views/LeadScoringView").then(m => ({ default: m.LeadScoringView })));
const MortgageCalcView = lazy(() => import("./views/MortgageCalcView").then(m => ({ default: m.MortgageCalcView })));
const MarketAnalyticsView = lazy(() => import("./views/MarketAnalyticsView").then(m => ({ default: m.MarketAnalyticsView })));
const DocumentManagerView = lazy(() => import("./views/DocumentManagerView").then(m => ({ default: m.DocumentManagerView })));
const SiteContentView = lazy(() => import("./views/SiteContentView").then(m => ({ default: m.SiteContentView })));
const HomepageEditorView = lazy(() => import("./views/HomepageEditorView").then(m => ({ default: m.HomepageEditorView })));
const GeneralSettingsView = lazy(() => import("./views/GeneralSettingsView").then(m => ({ default: m.GeneralSettingsView })));

// Modular imports
import { pluginConfigs, getCurrentTitle } from "./config";
import { useAdminAuth, useAdminData, useAdminOperations } from "./hooks";

export function AdminPage() {
  const [location] = useLocation();

  // Apply admin light theme class to body immediately
  useEffect(() => {
    document.body.classList.add("admin-panel-light");
    document.documentElement.classList.add("admin-panel-light");
    return () => {
      document.body.classList.remove("admin-panel-light");
      document.documentElement.classList.remove("admin-panel-light");
    };
  }, []);

  // Authentication
  const { isAuthenticated, isLoading, handleLogin, handleLogout } = useAdminAuth();

  // Data fetching
  const {
    leads,
    projects,
    pages,
    media,
    miniSites,
    prospects,
    users,
    isLoading: dataLoading,
    setLeads,
    setProjects,
    setPages,
    setMedia,
    setMiniSites,
    setProspects,
    setUsers,
    refreshData,
  } = useAdminData(isAuthenticated);

  // CRUD operations
  const operations = useAdminOperations({
    setLeads,
    setProjects,
    setPages,
    setMedia,
    setMiniSites,
    setProspects,
    setUsers,
  });

  // Compute notifications from existing data (must be before early returns)
  const STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB
  const notifications: AdminNotification[] = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const items: AdminNotification[] = [];

    // New leads
    leads.filter((l) => l.status === "new").forEach((l) => {
      items.push({
        id: `new-lead-${l.id}`,
        type: "new_lead",
        title: `ליד חדש: ${l.name}`,
        description: l.phone || l.email || "",
        link: "/admin/leads",
        timestamp: l.createdAt ? new Date(l.createdAt) : now,
        priority: "medium",
      });
    });

    // Overdue follow-ups
    leads.filter((l) => l.nextFollowUp && new Date(l.nextFollowUp) < now && l.status !== "closed_won" && l.status !== "closed_lost").forEach((l) => {
      items.push({
        id: `overdue-${l.id}`,
        type: "overdue_followup",
        title: `מעקב באיחור: ${l.name}`,
        description: `תאריך מעקב: ${new Date(l.nextFollowUp!).toLocaleDateString("he-IL")}`,
        link: "/admin/leads",
        timestamp: new Date(l.nextFollowUp!),
        priority: "high",
      });
    });

    // Leads waiting 7+ days with no progress
    leads.filter((l) => (l.status === "new" || l.status === "contacted") && l.createdAt && new Date(l.createdAt) < sevenDaysAgo).forEach((l) => {
      items.push({
        id: `waiting-${l.id}`,
        type: "waiting_lead",
        title: `ליד ממתין: ${l.name}`,
        description: `נוצר לפני ${Math.floor((now.getTime() - new Date(l.createdAt!).getTime()) / (1000 * 60 * 60 * 24))} ימים`,
        link: "/admin/leads",
        timestamp: new Date(l.createdAt!),
        priority: "medium",
      });
    });

    // High priority active leads
    leads.filter((l) => l.priority === "high" && l.status !== "closed_won" && l.status !== "closed_lost").forEach((l) => {
      items.push({
        id: `high-priority-${l.id}`,
        type: "high_priority",
        title: `עדיפות גבוהה: ${l.name}`,
        description: l.status === "new" ? "ליד חדש" : l.status === "contacted" ? "נוצר קשר" : l.status === "in_progress" ? "בטיפול" : l.status === "negotiation" ? "במו״מ" : "",
        link: "/admin/leads",
        timestamp: l.updatedAt ? new Date(l.updatedAt) : now,
        priority: "high",
      });
    });

    // Storage alerts
    const storageUsed = media.reduce((sum, m) => sum + (m.size || 0), 0);
    const storagePercent = (storageUsed / STORAGE_LIMIT) * 100;
    if (storagePercent >= 80) {
      items.push({
        id: "storage-alert",
        type: "storage_alert",
        title: storagePercent >= 100 ? "האחסון מלא!" : "האחסון כמעט מלא",
        description: `${storagePercent.toFixed(0)}% מהאחסון בשימוש`,
        link: "/admin/media",
        timestamp: now,
        priority: storagePercent >= 100 ? "high" : "medium",
      });
    }

    // Sort by priority (high first), then by timestamp (newest first)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    return items;
  }, [leads, media]);

  // Loading state
  if (isLoading) {
    return (
      <div 
        data-testid="admin-auth-loading" 
        className="admin-panel-light min-h-screen flex items-center justify-center" 
        style={{ backgroundColor: '#f1f5f9' }}
        data-admin-theme="light"
        dir="rtl"
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-4">טוען...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Render the appropriate view based on location
  const renderContent = () => {
    if (location === "/admin") {
      return (
        <DashboardView
          leads={leads}
          projects={projects}
          pages={pages}
          media={media}
          miniSites={miniSites}
          prospects={prospects}
          users={users}
          isLoading={dataLoading}
          onRefresh={refreshData}
        />
      );
    }
    if (location.startsWith("/admin/leads")) {
      return (
        <LeadsView
          leads={leads}
          projects={projects}
          onUpdateLead={operations.handleUpdateLead}
          onCreateLead={operations.handleCreateLead}
          onRefresh={refreshData}
          isLoading={dataLoading}
        />
      );
    }
    if (location.startsWith("/admin/projects")) {
      return (
        <ProjectsView
          projects={projects}
          onCreateProject={operations.handleCreateProject}
          onUpdateProject={operations.handleUpdateProject}
          onDeleteProject={operations.handleDeleteProject}
          isLoading={dataLoading}
        />
      );
    }
    if (location.startsWith("/admin/settings")) {
      return <SettingsView />;
    }
    if (location.startsWith("/admin/pages")) {
      return (
        <PagesView
          pages={pages}
          onCreatePage={operations.handleCreatePage}
          onUpdatePage={operations.handleUpdatePage}
          onDeletePage={operations.handleDeletePage}
          isLoading={dataLoading}
        />
      );
    }
    if (location.startsWith("/admin/media")) {
      return (
        <MediaView
          media={media}
          onUpload={operations.handleUploadMedia}
          onDelete={operations.handleDeleteMedia}
          onUpdateAlt={operations.handleUpdateMediaAlt}
          onUpdateMedia={operations.handleUpdateMedia}
          onSyncR2={operations.handleSyncR2}
          isLoading={dataLoading}
        />
      );
    }
    if (location.startsWith("/admin/mini-sites")) {
      return (
        <MiniSitesView
          miniSites={miniSites}
          projects={projects}
          onCreateMiniSite={operations.handleCreateMiniSite}
          onUpdateMiniSite={operations.handleUpdateMiniSite}
          onDeleteMiniSite={operations.handleDeleteMiniSite}
          isLoading={dataLoading}
        />
      );
    }
    if (location.startsWith("/admin/prospects")) {
      return (
        <ProspectImportView
          prospects={prospects}
          onCreateProspect={operations.handleCreateProspect}
          onUpdateProspect={operations.handleUpdateProspect}
          onDeleteProspect={operations.handleDeleteProspect}
          isLoading={dataLoading}
        />
      );
    }
    if (location.startsWith("/admin/users")) {
      return (
        <UsersView
          users={users}
          onCreateUser={operations.handleCreateUser}
          onUpdateUser={operations.handleUpdateUser}
          onDeleteUser={operations.handleDeleteUser}
          isLoading={dataLoading}
        />
      );
    }
    if (location.startsWith("/admin/translations")) {
      return <TranslationsView isLoading={dataLoading} />;
    }
    if (location.startsWith("/admin/site-content")) {
      return <SiteContentView />;
    }
    if (location.startsWith("/admin/homepage-editor")) {
      return <HomepageEditorView />;
    }
    if (location.startsWith("/admin/general-settings")) {
      return <GeneralSettingsView />;
    }
    // Specific functional plugin views
    if (location.startsWith("/admin/plugin/lead-scoring")) {
      return <LeadScoringView />;
    }
    if (location.startsWith("/admin/plugin/mortgage-calc")) {
      return <MortgageCalcView />;
    }
    if (location.startsWith("/admin/plugin/market-analytics")) {
      return <MarketAnalyticsView />;
    }
    if (location.startsWith("/admin/plugin/document-manager")) {
      return <DocumentManagerView />;
    }
    // Generic plugin routes
    if (location.startsWith("/admin/plugin/")) {
      const match = location.match(/^\/admin\/plugin\/([^/]+)/);
      if (match) {
        const pluginId = match[1];
        const config = pluginConfigs[pluginId];
        if (config) {
          return (
            <PluginPlaceholder
              betaKey={config.betaKey}
              title={config.title}
              titleEn={config.titleEn}
              description={config.description}
              descriptionEn={config.descriptionEn}
              icon={config.icon}
              features={config.features}
              featuresEn={config.featuresEn}
              color={config.color}
            />
          );
        }
      }
    }
    // Default to dashboard
    return (
      <DashboardView
        leads={leads}
        projects={projects}
        pages={pages}
        media={media}
        miniSites={miniSites}
        prospects={prospects}
        users={users}
        isLoading={dataLoading}
        onRefresh={refreshData}
      />
    );
  };

  // Admin view loading fallback
  const viewFallback = (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 mt-3 text-sm">טוען תצוגה...</p>
      </div>
    </div>
  );

  // Compute badge counts for sidebar
  const newLeadsCount = leads.filter((l) => l.status === "new").length;
  const badgeCounts = {
    newLeads: newLeadsCount > 0 ? newLeadsCount : undefined,
    projects: projects.length > 0 ? projects.length : undefined,
    media: media.length > 0 ? media.length : undefined,
    users: users.length > 0 ? users.length : undefined,
  };

  // Main admin panel
  return (
    <AdminLayout
      title={getCurrentTitle(location)}
      onLogout={handleLogout}
      badgeCounts={badgeCounts}
      isLoading={dataLoading}
      notifications={notifications}
    >
      <Suspense fallback={viewFallback}>
        {renderContent()}
      </Suspense>
    </AdminLayout>
  );
}

export default AdminPage;
