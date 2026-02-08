import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Users,
  Building2,
  FileText,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  Eye,
  Phone,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Image,
  Globe,
  UserPlus,
  RefreshCw,
  Target,
  BarChart3,
  CalendarClock,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Lead, Project, Page, Media, MiniSite, Prospect, User } from "@shared/schema";

interface DashboardViewProps {
  leads: Lead[];
  projects: Project[];
  pages?: Page[];
  media?: Media[];
  miniSites?: MiniSite[];
  prospects?: Prospect[];
  users?: User[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

function StatCardSkeleton() {
  return (
    <Card className="p-6 bg-white border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-16 bg-slate-200 rounded animate-pulse mt-3" />
          <div className="h-3 w-20 bg-slate-100 rounded animate-pulse mt-3" />
        </div>
        <div className="w-12 h-12 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </Card>
  );
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="p-6 bg-white border-slate-200 shadow-sm">
      <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DashboardView({
  leads = [],
  projects = [],
  pages = [],
  media = [],
  miniSites = [],
  prospects = [],
  users = [],
  isLoading = false,
  onRefresh,
}: DashboardViewProps) {
  const computedData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const todayLeads = leads.filter((l) => {
      const d = new Date(l.createdAt || "");
      return d.toDateString() === todayStr;
    });

    const thisWeekLeads = leads.filter((l) => {
      if (!l.createdAt) return false;
      return new Date(l.createdAt) >= sevenDaysAgo;
    });

    const thisMonthLeads = leads.filter((l) => {
      if (!l.createdAt) return false;
      return new Date(l.createdAt) >= thirtyDaysAgo;
    });

    const newLeads = leads.filter((l) => l.status === "new");
    const featuredProjects = projects.filter((p) => p.featured);
    const activeProjects = projects.filter((p) => p.status === "active");
    const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);

    const waitingLeads = leads.filter((l) => {
      if (!l.createdAt) return false;
      const leadDate = new Date(l.createdAt);
      return leadDate < sevenDaysAgo && (l.status === "new" || l.status === "contacted");
    });

    const highPriorityLeads = leads.filter(
      (l) => l.priority === "high" && l.status !== "closed_won" && l.status !== "closed_lost" && l.status !== "handled"
    );

    const closedWon = leads.filter((l) => l.status === "closed_won").length;
    const closedLost = leads.filter((l) => l.status === "closed_lost").length;
    const totalClosed = closedWon + closedLost;
    const conversionRate = totalClosed > 0 ? Math.round((closedWon / totalClosed) * 100) : 0;

    const statusBreakdown = {
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      in_progress: leads.filter((l) => l.status === "in_progress").length,
      negotiation: leads.filter((l) => l.status === "negotiation").length,
      closed_won: closedWon,
      closed_lost: closedLost,
      handled: leads.filter((l) => l.status === "handled").length,
    };

    const sourceBreakdown: Record<string, number> = {};
    leads.forEach((l) => {
      const src = l.leadSource || "website";
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    });

    const recentLeads = [...leads]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    const upcomingFollowUps = leads
      .filter((l) => l.nextFollowUp && new Date(l.nextFollowUp) >= today)
      .sort((a, b) => new Date(a.nextFollowUp!).getTime() - new Date(b.nextFollowUp!).getTime())
      .slice(0, 5);

    const overdueFollowUps = leads.filter(
      (l) =>
        l.nextFollowUp &&
        new Date(l.nextFollowUp) < today &&
        l.status !== "closed_won" &&
        l.status !== "closed_lost" &&
        l.status !== "handled"
    );

    return {
      todayLeads,
      thisWeekLeads,
      thisMonthLeads,
      newLeads,
      featuredProjects,
      activeProjects,
      totalViews,
      waitingLeads,
      highPriorityLeads,
      conversionRate,
      closedWon,
      statusBreakdown,
      sourceBreakdown,
      recentLeads,
      upcomingFollowUps,
      overdueFollowUps,
    };
  }, [leads, projects]);

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    new: { label: "\u05D7\u05D3\u05E9", color: "bg-blue-100 text-blue-700 border-blue-200" },
    contacted: { label: "\u05E0\u05D5\u05E6\u05E8 \u05E7\u05E9\u05E8", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    in_progress: { label: "\u05D1\u05D8\u05D9\u05E4\u05D5\u05DC", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    negotiation: { label: "\u05DE\u05E9\u05D0 \u05D5\u05DE\u05EA\u05DF", color: "bg-purple-100 text-purple-700 border-purple-200" },
    closed_won: { label: "\u05E1\u05D2\u05D5\u05E8 - \u05D4\u05E6\u05DC\u05D7\u05D4", color: "bg-green-100 text-green-700 border-green-200" },
    closed_lost: { label: "\u05E1\u05D2\u05D5\u05E8 - \u05D0\u05D1\u05D5\u05D3", color: "bg-red-100 text-red-700 border-red-200" },
    handled: { label: "\u05D8\u05D5\u05E4\u05DC", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  };

  const SOURCE_CONFIG: Record<string, { label: string; icon: typeof Globe }> = {
    website: { label: "\u05D0\u05EA\u05E8", icon: Globe },
    facebook: { label: "Facebook", icon: MessageSquare },
    instagram: { label: "Instagram", icon: Image },
    google: { label: "Google", icon: Globe },
    referral: { label: "\u05D4\u05E4\u05E0\u05D9\u05D4", icon: Users },
    phone: { label: "\u05D8\u05DC\u05E4\u05D5\u05DF", icon: Phone },
    whatsapp: { label: "WhatsApp", icon: MessageSquare },
    other: { label: "\u05D0\u05D7\u05E8", icon: Zap },
  };

  const stats = [
    {
      title: "\u05E1\u05D4\u05F4\u05DB \u05E4\u05E0\u05D9\u05D5\u05EA",
      value: leads.length,
      icon: Users,
      color: "blue",
      trend: `+${computedData.todayLeads.length} \u05D4\u05D9\u05D5\u05DD`,
    },
    {
      title: "\u05E4\u05E0\u05D9\u05D5\u05EA \u05D7\u05D3\u05E9\u05D5\u05EA",
      value: computedData.newLeads.length,
      icon: TrendingUp,
      color: "green",
      trend: "\u05DE\u05DE\u05EA\u05D9\u05E0\u05D5\u05EA \u05DC\u05D8\u05D9\u05E4\u05D5\u05DC",
    },
    {
      title: "\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD",
      value: computedData.activeProjects.length,
      icon: Building2,
      color: "purple",
      trend: `${computedData.featuredProjects.length} \u05DE\u05D5\u05DE\u05DC\u05E6\u05D9\u05DD`,
    },
    {
      title: "\u05D0\u05D7\u05D5\u05D6 \u05D4\u05DE\u05E8\u05D4",
      value: computedData.conversionRate > 0 ? `${computedData.conversionRate}%` : "--",
      icon: Target,
      color: "orange",
      trend: `${computedData.closedWon} \u05E2\u05E1\u05E7\u05D0\u05D5\u05EA \u05DE\u05D5\u05E6\u05DC\u05D7\u05D5\u05EA`,
    },
  ];

  const secondaryStats = [
    { title: "\u05E6\u05E4\u05D9\u05D5\u05EA \u05D1\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD", value: computedData.totalViews.toLocaleString("he-IL"), icon: Eye, color: "slate" },
    { title: "\u05E2\u05DE\u05D5\u05D3\u05D9\u05DD", value: pages.length, icon: FileText, color: "slate" },
    { title: "\u05E7\u05D1\u05E6\u05D9 \u05DE\u05D3\u05D9\u05D4", value: media.length, icon: Image, color: "slate" },
    { title: "\u05DE\u05D9\u05E0\u05D9 \u05E1\u05D9\u05D9\u05D8\u05E1", value: miniSites.length, icon: Globe, color: "slate" },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
      green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
      slate: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
    };
    return colors[color] || colors.blue;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "\u05E2\u05DB\u05E9\u05D9\u05D5";
    if (diffMins < 60) return `\u05DC\u05E4\u05E0\u05D9 ${diffMins} \u05D3\u05E7\u05D5\u05EA`;
    if (diffHours < 24) return `\u05DC\u05E4\u05E0\u05D9 ${diffHours} \u05E9\u05E2\u05D5\u05EA`;
    if (diffDays < 7) return `\u05DC\u05E4\u05E0\u05D9 ${diffDays} \u05D9\u05DE\u05D9\u05DD`;
    return d.toLocaleDateString("he-IL");
  };

  const formatFutureDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "\u05D4\u05D9\u05D5\u05DD";
    if (diffDays === 1) return "\u05DE\u05D7\u05E8";
    if (diffDays < 7) return `\u05D1\u05E2\u05D5\u05D3 ${diffDays} \u05D9\u05DE\u05D9\u05DD`;
    return d.toLocaleDateString("he-IL");
  };

  const getStatusBadge = (status: string | null) => {
    const config = status ? STATUS_CONFIG[status] : null;
    if (config) {
      return <Badge className={config.color}>{config.label}</Badge>;
    }
    return (
      <Badge className="bg-slate-100 text-slate-600 border-slate-200">
        {status || "\u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2"}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-700 border-red-200">{"\u05D2\u05D1\u05D5\u05D4"}</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{"\u05D1\u05D9\u05E0\u05D5\u05E0\u05D9"}</Badge>;
      case "low":
        return <Badge className="bg-slate-100 text-slate-600 border-slate-200">{"\u05E0\u05DE\u05D5\u05DA"}</Badge>;
      default:
        return null;
    }
  };

  const quickActions = [
    { label: "\u05DC\u05D9\u05D3 \u05D7\u05D3\u05E9", icon: UserPlus, href: "/admin/leads", color: "bg-blue-600 hover:bg-blue-700 text-white" },
    { label: "\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8 \u05D7\u05D3\u05E9", icon: Plus, href: "/admin/projects", color: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "\u05E6\u05E4\u05D4 \u05D1\u05DC\u05D9\u05D3\u05D9\u05DD", icon: Users, href: "/admin/leads", color: "bg-slate-600 hover:bg-slate-700 text-white" },
    { label: "\u05E0\u05D4\u05DC \u05DE\u05D3\u05D9\u05D4", icon: Image, href: "/admin/media", color: "bg-slate-600 hover:bg-slate-700 text-white" },
  ];

  if (isLoading && leads.length === 0 && projects.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-64 bg-slate-100 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionSkeleton rows={4} />
          <SectionSkeleton rows={3} />
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Welcome + Refresh */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="text-xl text-slate-600">
            {"\u05E9\u05DC\u05D5\u05DD, "}<span className="text-slate-900 font-semibold">{"\u05DE\u05E0\u05D4\u05DC"}</span>
          </h2>
          <p className="text-slate-500 mt-1">{"\u05D4\u05E0\u05D4 \u05E1\u05D9\u05DB\u05D5\u05DD \u05D4\u05E4\u05E2\u05D9\u05DC\u05D5\u05EA \u05E9\u05DC\u05DA"}</p>
        </motion.div>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {"\u05E8\u05E2\u05E0\u05DF"}
          </Button>
        )}
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.3 }}>
              <Card className="p-5 bg-white border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-500 truncate">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                    <p className={`text-xs mt-2 ${colors.text}`}>{stat.trend}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${colors.bg} flex-shrink-0 ms-3`}>
                    <stat.icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Stats Row */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.3 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {secondaryStats.map((stat) => {
            const colors = getColorClasses(stat.color);
            return (
              <Card key={stat.title} className="p-4 bg-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colors.bg} flex-shrink-0`}>
                    <stat.icon className={`h-4 w-4 ${colors.text}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500 truncate">{stat.title}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }}>
        <Card className="p-5 bg-white border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">{"\u05E4\u05E2\u05D5\u05DC\u05D5\u05EA \u05DE\u05D4\u05D9\u05E8\u05D5\u05EA"}</h3>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button size="sm" className={`gap-2 ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Overdue follow-ups warning */}
      {computedData.overdueFollowUps.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 bg-red-50 border-red-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
                <CalendarClock className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-red-900 mb-1">{"\u05DE\u05E2\u05E7\u05D1\u05D9\u05DD \u05E9\u05E2\u05D1\u05E8 \u05D6\u05DE\u05E0\u05DD"}</h3>
                <p className="text-sm text-red-700">
                  {"\u05D9\u05E9 "}{computedData.overdueFollowUps.length}{" \u05DC\u05D9\u05D3\u05D9\u05DD \u05E2\u05DD \u05DE\u05E2\u05E7\u05D1 \u05E9\u05E2\u05D1\u05E8. \u05D9\u05E9 \u05DC\u05D8\u05E4\u05DC \u05D1\u05D4\u05DD \u05D1\u05D4\u05E7\u05D3\u05DD."}
                </p>
                <Link href="/admin/leads" className="inline-block mt-2">
                  <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-100 gap-1">
                    {"\u05E6\u05E4\u05D4 \u05D1\u05DC\u05D9\u05D3\u05D9\u05DD"}
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Leads waiting more than 7 days warning */}
      {computedData.waitingLeads.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 bg-amber-50 border-amber-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-xl flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-amber-900 mb-1">{"\u05DC\u05D9\u05D3\u05D9\u05DD \u05E9\u05DE\u05DE\u05EA\u05D9\u05E0\u05D9\u05DD \u05DE\u05E2\u05DC 7 \u05D9\u05DE\u05D9\u05DD"}</h3>
                <p className="text-sm text-amber-700 mb-3">
                  {"\u05D9\u05E9 "}{computedData.waitingLeads.length}{" \u05DC\u05D9\u05D3\u05D9\u05DD \u05E9\u05DC\u05D0 \u05D8\u05D5\u05E4\u05DC\u05D5 \u05D1\u05DE\u05E9\u05DA \u05D9\u05D5\u05EA\u05E8 \u05DE\u05E9\u05D1\u05D5\u05E2. \u05DE\u05D5\u05DE\u05DC\u05E5 \u05DC\u05D9\u05E6\u05D5\u05E8 \u05E7\u05E9\u05E8 \u05D1\u05D4\u05E7\u05D3\u05DD."}
                </p>
                <div className="space-y-2">
                  {computedData.waitingLeads.slice(0, 3).map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/leads?selected=${lead.id}`}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-700 font-semibold text-sm">{(lead.name ?? "?").charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{lead.name}</p>
                        <p className="text-sm text-slate-500 truncate">{lead.phone}</p>
                      </div>
                      <span className="text-xs text-amber-600 flex-shrink-0">{formatDate(lead.createdAt)}</span>
                    </Link>
                  ))}
                </div>
                {computedData.waitingLeads.length > 3 && (
                  <Link href="/admin/leads" className="inline-block mt-3 text-sm text-amber-700 hover:text-amber-800 font-medium">
                    {"\u05D4\u05E6\u05D2 \u05D0\u05EA \u05DB\u05DC "}{computedData.waitingLeads.length}{" \u05D4\u05DC\u05D9\u05D3\u05D9\u05DD \u05D4\u05DE\u05DE\u05EA\u05D9\u05E0\u05D9\u05DD"}
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Leads by Status Breakdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
        <Card className="p-5 bg-white border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">{"\u05E4\u05D9\u05DC\u05D5\u05D7 \u05DC\u05D9\u05D3\u05D9\u05DD \u05DC\u05E4\u05D9 \u05E1\u05D8\u05D8\u05D5\u05E1"}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {Object.entries(computedData.statusBreakdown).map(([status, count]) => {
              const config = STATUS_CONFIG[status];
              if (!config) return null;
              return (
                <Link key={status} href="/admin/leads" className={`p-3 rounded-xl border-2 text-center transition-all hover:scale-105 ${config.color}`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs font-medium mt-1">{config.label}</p>
                </Link>
              );
            })}
          </div>
          {leads.length > 0 && (
            <div className="mt-4">
              <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">
                {Object.entries(computedData.statusBreakdown).map(([status, count]) => {
                  if (count === 0) return null;
                  const percentage = (count / leads.length) * 100;
                  const colorMap: Record<string, string> = {
                    new: "bg-blue-500",
                    contacted: "bg-cyan-500",
                    in_progress: "bg-yellow-500",
                    negotiation: "bg-purple-500",
                    closed_won: "bg-green-500",
                    closed_lost: "bg-red-500",
                    handled: "bg-emerald-500",
                  };
                  return (
                    <div
                      key={status}
                      className={`${colorMap[status] || "bg-slate-400"} transition-all`}
                      style={{ width: `${percentage}%` }}
                      title={`${STATUS_CONFIG[status]?.label || status}: ${count}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Lead Sources */}
      {Object.keys(computedData.sourceBreakdown).length > 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.3 }}>
          <Card className="p-5 bg-white border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">{"\u05DE\u05E7\u05D5\u05E8\u05D5\u05EA \u05DC\u05D9\u05D3\u05D9\u05DD"}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(computedData.sourceBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => {
                  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG.other;
                  const percentage = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
                  return (
                    <div key={source} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <config.icon className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">{config.label}</span>
                      </div>
                      <p className="text-xl font-bold text-slate-900">{count}</p>
                      <div className="mt-1.5">
                        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent Leads + Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }}>
          <Card className="p-5 bg-white border-slate-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">{"\u05E4\u05E0\u05D9\u05D5\u05EA \u05D0\u05D7\u05E8\u05D5\u05E0\u05D5\u05EA"}</h3>
              <Link href="/admin/leads" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                {"\u05D4\u05E6\u05D2 \u05D4\u05DB\u05DC"}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {computedData.recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads?selected=${lead.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">{(lead.name ?? "?").charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-900 truncate">{lead.name}</p>
                      {getStatusBadge(lead.status)}
                      {lead.priority === "high" && getPriorityBadge(lead.priority)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span dir="ltr">{lead.phone}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(lead.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                </Link>
              ))}
              {leads.length === 0 && !isLoading && (
                <div className="text-center py-8 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{"\u05D0\u05D9\u05DF \u05E4\u05E0\u05D9\u05D5\u05EA \u05E2\u05D3\u05D9\u05D9\u05DF"}</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.3 }}>
          <Card className="p-5 bg-white border-slate-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                {computedData.upcomingFollowUps.length > 0 ? "\u05DE\u05E2\u05E7\u05D1\u05D9\u05DD \u05E7\u05E8\u05D5\u05D1\u05D9\u05DD" : "\u05DC\u05D9\u05D3\u05D9\u05DD \u05D1\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA \u05D2\u05D1\u05D5\u05D4\u05D4"}
              </h3>
              <Link href="/admin/leads" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                {"\u05D4\u05E6\u05D2 \u05D4\u05DB\u05DC"}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {computedData.upcomingFollowUps.length > 0 ? (
                computedData.upcomingFollowUps.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/admin/leads?selected=${lead.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <CalendarClock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{lead.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(lead.status)}
                        <span className="text-xs text-orange-600 font-medium">{formatFutureDate(lead.nextFollowUp)}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </Link>
                ))
              ) : computedData.highPriorityLeads.length > 0 ? (
                computedData.highPriorityLeads.slice(0, 5).map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/admin/leads?selected=${lead.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-semibold">{(lead.name ?? "?").charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{lead.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(lead.status)}
                        {getPriorityBadge(lead.priority)}
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{"\u05D0\u05D9\u05DF \u05DE\u05E2\u05E7\u05D1\u05D9\u05DD \u05D0\u05D5 \u05DC\u05D9\u05D3\u05D9\u05DD \u05D1\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA \u05D2\u05D1\u05D5\u05D4\u05D4"}</p>
                  <p className="text-xs mt-1">{"\u05D4\u05DB\u05DC \u05D1\u05E1\u05D3\u05E8!"}</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Projects Overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.3 }}>
        <Card className="p-5 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">{"\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD"}</h3>
            <Link href="/admin/projects" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              {"\u05D4\u05E6\u05D2 \u05D4\u05DB\u05DC"}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects?edit=${project.id}`}
                className="block p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group"
              >
                <div className="aspect-video rounded-lg bg-slate-200 mb-3 overflow-hidden">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-slate-900 truncate">{project.name}</h4>
                    <p className="text-sm text-slate-500 truncate">{project.location}</p>
                  </div>
                  {project.status === "active" && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 flex-shrink-0 text-xs">{"\u05E4\u05E2\u05D9\u05DC"}</Badge>
                  )}
                  {project.status === "draft" && (
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 flex-shrink-0 text-xs">{"\u05D8\u05D9\u05D5\u05D8\u05D4"}</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-primary font-medium">
                    {new Intl.NumberFormat("he-IL").format(project.priceFrom)} AED
                  </span>
                  <div className="flex items-center gap-2">
                    {project.views != null && project.views > 0 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {project.views.toLocaleString("he-IL")}
                      </span>
                    )}
                    {project.featured && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">{"\u05DE\u05D5\u05DE\u05DC\u05E5"}</Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-8 text-slate-500">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{"\u05D0\u05D9\u05DF \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD \u05E2\u05D3\u05D9\u05D9\u05DF"}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Week Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.3 }}>
        <Card className="p-5 bg-gradient-to-l from-blue-50 to-white border-blue-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">{"\u05E1\u05D9\u05DB\u05D5\u05DD \u05E9\u05D1\u05D5\u05E2\u05D9"}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/80 rounded-xl border border-blue-100">
              <p className="text-2xl font-bold text-slate-900">{computedData.thisWeekLeads.length}</p>
              <p className="text-xs text-slate-500 mt-1">{"\u05DC\u05D9\u05D3\u05D9\u05DD \u05D4\u05E9\u05D1\u05D5\u05E2"}</p>
            </div>
            <div className="text-center p-3 bg-white/80 rounded-xl border border-blue-100">
              <p className="text-2xl font-bold text-slate-900">{computedData.thisMonthLeads.length}</p>
              <p className="text-xs text-slate-500 mt-1">{"\u05DC\u05D9\u05D3\u05D9\u05DD \u05D4\u05D7\u05D5\u05D3\u05E9"}</p>
            </div>
            <div className="text-center p-3 bg-white/80 rounded-xl border border-blue-100">
              <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
              <p className="text-xs text-slate-500 mt-1">{"\u05E1\u05D4\u05F4\u05DB \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9\u05DD"}</p>
            </div>
            <div className="text-center p-3 bg-white/80 rounded-xl border border-blue-100">
              <p className="text-2xl font-bold text-slate-900">{users.length}</p>
              <p className="text-xs text-slate-500 mt-1">{"\u05DE\u05E9\u05EA\u05DE\u05E9\u05D9\u05DD"}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
