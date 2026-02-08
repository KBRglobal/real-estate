import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Building2,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
  Star,
  Calendar,
  Home,
  Eye,
  EyeOff,
  Filter,
  LayoutGrid,
  LayoutList,
  Copy,
  MoreVertical,
  ChevronDown,
  TrendingUp,
  Users,
  FileText,
  CheckCircle2,
  X,
  ArrowUpDown,
  Package,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";
import { ProjectWizard } from "./ProjectWizard";
import { ProjectEditView } from "./ProjectEditView";
import { AnimatePresence } from "framer-motion";

// Extracted types and utilities
import { type ProjectsViewProps } from "./projects/types";
import { formatPrice, filterProjects } from "./projects/utils";

// Status badge configuration
const STATUS_CONFIG = {
  active: { label: "פעיל", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  draft: { label: "טיוטה", color: "bg-amber-100 text-amber-700 border-amber-200" },
  "sold-out": { label: "נמכר", color: "bg-red-100 text-red-700 border-red-200" },
  "coming-soon": { label: "בקרוב", color: "bg-blue-100 text-blue-700 border-blue-200" },
} as const;

type ViewMode = "grid" | "list";
type SortOption = "newest" | "name" | "price";

export function ProjectsView({
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  isLoading,
}: ProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardProject, setWizardProject] = useState<Project | null>(null); // For resuming drafts in wizard
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const autoOpenedRef = useRef(false);
  const [location] = useLocation();
  const { toast } = useToast();

  // View and filter states
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Apply filters, search, and sorting
  const filteredAndSortedProjects = useMemo(() => {
    // First, filter by search
    let result = filterProjects(projects, searchQuery);

    // Apply active status filters
    if (activeFilters.length > 0) {
      result = result.filter((project) => activeFilters.includes(project.status));
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name, "he");
        case "price":
          return (a.priceFrom || 0) - (b.priceFrom || 0);
        case "newest":
        default:
          // Assuming newer projects have higher IDs or we can use createdAt if available
          return b.id.localeCompare(a.id);
      }
    });

    return result;
  }, [projects, searchQuery, activeFilters, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === "active").length;
    const drafts = projects.filter(p => p.status === "draft").length;
    const totalUnits = projects.reduce((sum, p) => {
      // Assuming we can derive unit count from somewhere, or use a placeholder
      const units = (p as any).units;
      return sum + (Array.isArray(units) ? units.length : typeof units === "number" ? units : 0);
    }, 0);

    return { total, active, drafts, totalUnits };
  }, [projects]);

  // Open wizard for NEW projects or resume a draft
  const handleOpenWizard = (draftProject?: Project) => {
    setWizardProject(draftProject || null);
    setShowWizard(true);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setWizardProject(null);
  };

  // Open edit view for EXISTING projects
  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleCloseEdit = () => {
    setEditingProject(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteProject(id);
      toast({ title: "הפרויקט נמחק בהצלחה" });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את הפרויקט",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (project: Project) => {
    try {
      const { id, createdAt, updatedAt, views, publishedAt, ...projectData } = project as any;
      await onCreateProject({
        ...projectData,
        name: `${project.name} (עותק)`,
        status: "draft",
        slug: undefined,
      });
      toast({ title: "הפרויקט שוכפל בהצלחה" });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשכפל את הפרויקט",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (project: Project) => {
    try {
      const newStatus = project.status === "active" ? "draft" : "active";
      await onUpdateProject(project.id, { status: newStatus });
      // If filters would hide the project after status change, clear filters
      if (activeFilters.length > 0 && !activeFilters.includes(newStatus)) {
        setActiveFilters([]);
      }
      toast({
        title: `הפרויקט ${newStatus === "active" ? "הופעל" : "הועבר לטיוטה"}`,
        description: newStatus === "draft" ? "הפרויקט הוסר מהאתר אך נשמר במערכת" : undefined,
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשנות את הסטטוס",
        variant: "destructive",
      });
    }
  };

  const toggleFilter = (status: string) => {
    setActiveFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchQuery("");
  };

  // Auto-open from URL (/new for wizard, ?edit=ID for edit view)
  useEffect(() => {
    if (autoOpenedRef.current) return;
    const isNewRoute = location.endsWith("/new") || window.location.pathname.endsWith("/new");
    if (isNewRoute) {
      handleOpenWizard();
      autoOpenedRef.current = true;
      return;
    }
    if (!isLoading && projects.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get("edit");
      if (editId) {
        const project = projects.find(p => p.id === editId);
        if (project) {
          handleOpenEdit(project);
          autoOpenedRef.current = true;
        }
      }
    }
  }, [location, isLoading, projects.length]);

  return (
    <TooltipProvider>
    <div dir="rtl" className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">סך הכל פרויקטים</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">פרויקטים פעילים</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-200 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">טיוטות</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{stats.drafts}</p>
            </div>
            <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-amber-700" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">סך יחידות</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.totalUnits}</p>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Drafts Section */}
      {stats.drafts > 0 && (() => {
        const draftProjects = projects.filter(p => p.status === "draft");
        if (draftProjects.length === 0) return null;

        // Calculate completion for a draft
        const getDraftCompletion = (p: Project) => {
          const checks = [
            !!p.name,
            !!p.developer,
            !!p.propertyType,
            !!p.location,
            !!p.description,
            (p.priceFrom || 0) > 0,
            !!p.imageUrl,
            Array.isArray((p as any).gallery) && (p as any).gallery.length >= 2,
          ];
          return Math.round((checks.filter(Boolean).length / checks.length) * 100);
        };

        const getTimeAgo = (date: string | Date | null | undefined) => {
          if (!date) return "";
          const diff = Date.now() - new Date(date).getTime();
          const minutes = Math.floor(diff / 60000);
          if (minutes < 1) return "עכשיו";
          if (minutes < 60) return `לפני ${minutes} דק'`;
          const hours = Math.floor(minutes / 60);
          if (hours < 24) return `לפני ${hours} שעות`;
          const days = Math.floor(hours / 24);
          return `לפני ${days} ימים`;
        };

        return (
          <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-amber-900">טיוטות ({draftProjects.length})</h3>
              </div>
              <p className="text-xs text-amber-600">המשך לערוך את הפרויקטים שלא הושלמו</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {draftProjects.slice(0, 4).map((draft) => {
                const completion = getDraftCompletion(draft);
                return (
                  <div
                    key={draft.id}
                    className="bg-white rounded-xl border border-amber-200 p-3 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-800 truncate">{draft.name || "פרויקט ללא שם"}</h4>
                        <p className="text-xs text-slate-500 truncate">{draft.developer || "—"}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: draft.id, name: draft.name });
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Clock className="h-3 w-3" />
                      <span>{getTimeAgo(draft.updatedAt)}</span>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">השלמה</span>
                        <span className={`font-medium ${completion >= 75 ? "text-emerald-600" : completion >= 50 ? "text-amber-600" : "text-slate-500"}`}>{completion}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${completion >= 75 ? "bg-emerald-500" : completion >= 50 ? "bg-amber-500" : "bg-slate-300"}`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      onClick={() => handleOpenWizard(draft)}
                    >
                      <ArrowRight className="h-3 w-3 ms-1" />
                      המשך עריכה
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })()}

      {/* Search & Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="חיפוש לפי שם, יזם או אזור..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-11 h-11 bg-white border-slate-200 rounded-xl"
            data-testid="input-search-projects"
          />
        </div>

        <Select dir="rtl" value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-40 h-11 bg-white border-slate-200 rounded-xl">
            <ArrowUpDown className="h-4 w-4 ms-2" />
            <SelectValue placeholder="מיון" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">החדשים ביותר</SelectItem>
            <SelectItem value="name">לפי שם</SelectItem>
            <SelectItem value="price">לפי מחיר</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-lg"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-lg"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>

        <Button
          className="h-11 px-6 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20"
          onClick={() => handleOpenWizard()}
          data-testid="button-new-project"
        >
          <Plus className="h-4 w-4 ms-2" />
          פרויקט חדש
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">סינון מהיר:</span>

        {(["active", "draft", "sold-out", "coming-soon"] as const).map((status) => {
          const isActive = activeFilters.includes(status);
          const config = STATUS_CONFIG[status];

          return (
            <button
              key={status}
              onClick={() => toggleFilter(status)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                ${isActive
                  ? config.color + " shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }
              `}
            >
              {config.label}
              {isActive && <X className="inline h-3 w-3 ms-1" />}
            </button>
          );
        })}

        {(activeFilters.length > 0 || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-slate-500 hover:text-slate-700"
          >
            נקה הכל
          </Button>
        )}

        <div className="flex-1" />

        <span className="text-sm text-slate-500">
          {filteredAndSortedProjects.length} מתוך {projects.length} פרויקטים
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        // Loading Skeletons
        <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white border-slate-200 overflow-hidden rounded-xl">
              {viewMode === "grid" ? (
                <>
                  <div className="aspect-video bg-slate-100 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-slate-100 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded animate-pulse" />
                      <div className="h-3 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 flex gap-4">
                  <div className="w-32 h-24 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-100 rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-1/4" />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : filteredAndSortedProjects.length === 0 ? (
        // Empty State
        <Card className="p-16 bg-gradient-to-br from-slate-50 to-white border-slate-200 text-center rounded-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Building2 className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {searchQuery || activeFilters.length > 0 ? "לא נמצאו תוצאות" : "אין פרויקטים עדיין"}
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              {searchQuery || activeFilters.length > 0
                ? "נסה לשנות את תנאי החיפוש או הסינון"
                : "התחל את המסע שלך על ידי יצירת הפרויקט הראשון שלך. זה קל ומהיר!"}
            </p>
            {!searchQuery && activeFilters.length === 0 && (
              <Button
                onClick={() => handleOpenWizard()}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl h-12 px-8 text-base shadow-lg shadow-blue-600/20"
              >
                <Plus className="h-5 w-5 ms-2" />
                צור פרויקט ראשון
              </Button>
            )}
            {(searchQuery || activeFilters.length > 0) && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="rounded-xl h-12 px-8 text-base"
              >
                נקה סינון
              </Button>
            )}
          </motion.div>
        </Card>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
            >
              <Card className="bg-white border-slate-200 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-xl">
                {/* Image */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-slate-300" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 start-3">
                    <Badge className={`${STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]?.color || STATUS_CONFIG.draft.color} border text-xs font-medium`}>
                      {STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]?.label || "טיוטה"}
                    </Badge>
                  </div>

                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute top-3 end-3">
                      <Badge className="bg-amber-500 text-white text-xs border-0 shadow-md">
                        <Star className="h-3 w-3 ms-1 fill-current" />
                        מומלץ
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">{project.name}</h3>
                    <p className="text-sm text-slate-500">{project.developer}</p>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="line-clamp-1">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span>{project.propertyType}</span>
                      {project.bedrooms && <span className="text-slate-400">| {project.bedrooms}</span>}
                    </div>
                    {(project as any).units && Array.isArray((project as any).units) && (project as any).units.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{(project as any).units.length} סוגי יחידות</span>
                      </div>
                    )}
                    {project.updatedAt && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        עודכן: {new Date(project.updatedAt).toLocaleDateString("he-IL")}
                      </div>
                    )}
                  </div>

                  {/* Price & ROI */}
                  <div className="flex items-center justify-between pt-4 mb-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">החל מ-</p>
                      <p className="font-bold text-blue-600 text-base">
                        {formatPrice(project.priceFrom)} AED
                      </p>
                    </div>
                    {project.roiPercent && (
                      <div className="text-start">
                        <p className="text-xs text-slate-400 mb-0.5">תשואה</p>
                        <p className="font-bold text-emerald-600 text-base flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {project.roiPercent}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      onClick={() => handleOpenEdit(project)}
                      data-testid={`button-edit-project-${project.id}`}
                    >
                      <Pencil className="h-3.5 w-3.5 ms-1" />
                      ערוך
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                      onClick={() => window.open(`/project/${project.slug || project.id}`, "_blank")}
                    >
                      <Eye className="h-3.5 w-3.5 ms-1" />
                      תצוגה
                    </Button>
                    <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg hover:bg-slate-50"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleDuplicate(project)}>
                          <Copy className="h-4 w-4 me-2" />
                          שכפל פרויקט
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(project)}>
                          {project.status === "active" ? (
                            <>
                              <EyeOff className="h-4 w-4 me-2" />
                              העבר לטיוטה
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 me-2" />
                              הפעל פרויקט
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget({ id: project.id, name: project.name })}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 me-2" />
                          מחק פרויקט
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          {filteredAndSortedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.2) }}
            >
              <Card className="bg-white border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 rounded-xl">
                <div className="p-4 flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-32 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{project.name}</h3>
                        <p className="text-sm text-slate-500">{project.developer}</p>
                      </div>
                      <Badge className={`${STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]?.color || STATUS_CONFIG.draft.color} border text-xs font-medium flex-shrink-0`}>
                        {STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]?.label || "טיוטה"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{project.propertyType}</span>
                      </div>
                      {(project as any).units && Array.isArray((project as any).units) && (project as any).units.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span>{(project as any).units.length} סוגי יחידות</span>
                        </div>
                      )}
                      {project.updatedAt && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>עודכן: {new Date(project.updatedAt).toLocaleDateString("he-IL")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-slate-400 me-1">מחיר:</span>
                        <span className="font-bold text-blue-600">{formatPrice(project.priceFrom)} AED</span>
                      </div>
                      {project.roiPercent && (
                        <div>
                          <span className="text-xs text-slate-400 me-1">תשואה:</span>
                          <span className="font-bold text-emerald-600">{project.roiPercent}%</span>
                        </div>
                      )}
                      {project.featured && (
                        <Badge className="bg-amber-500 text-white text-xs border-0">
                          <Star className="h-3 w-3 ms-1 fill-current" />
                          מומלץ
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleOpenEdit(project)}
                      data-testid={`button-edit-project-${project.id}`}
                    >
                      <Pencil className="h-3.5 w-3.5 ms-1" />
                      ערוך
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => window.open(`/project/${project.slug || project.id}`, "_blank")}
                    >
                      <Eye className="h-3.5 w-3.5 ms-1" />
                      תצוגה
                    </Button>
                    <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg hover:bg-slate-50"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleDuplicate(project)}>
                          <Copy className="h-4 w-4 me-2" />
                          שכפל פרויקט
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(project)}>
                          {project.status === "active" ? (
                            <>
                              <EyeOff className="h-4 w-4 me-2" />
                              העבר לטיוטה
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 me-2" />
                              הפעל פרויקט
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget({ id: project.id, name: project.name })}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 me-2" />
                          מחק פרויקט
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Wizard Modal - for NEW projects or resuming drafts */}
      <ProjectWizard
        isOpen={showWizard}
        onClose={handleCloseWizard}
        editingProject={wizardProject}
        onCreateProject={onCreateProject}
        onUpdateProject={onUpdateProject}
      />

      {/* Edit View - for EXISTING projects */}
      <AnimatePresence>
        {editingProject && (
          <ProjectEditView
            project={editingProject}
            onSave={onUpdateProject}
            onClose={handleCloseEdit}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-end">מחיקת פרויקט</AlertDialogTitle>
            <AlertDialogDescription className="text-end">
              האם אתה בטוח שברצונך למחוק את הפרויקט "{deleteTarget?.name}"?
              <br />
              פעולה זו אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deleteTarget) {
                  handleDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4 me-2" />
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
}
