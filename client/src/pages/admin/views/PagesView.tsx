import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Eye,
  EyeOff,
  ChevronDown,
  Save,
  X,
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { WYSIWYGEditor } from "@/components/admin/WYSIWYGEditor";
import type { Page } from "@shared/schema";

interface PagesViewProps {
  pages: Page[];
  onCreatePage: (data: Partial<Page>) => Promise<void>;
  onUpdatePage: (id: string, data: Partial<Page>) => Promise<void>;
  onDeletePage: (id: string) => Promise<void>;
  isLoading: boolean;
}

type SortField = "title" | "slug" | "status" | "updatedAt";
type SortDirection = "asc" | "desc";

export function PagesView({
  pages,
  onCreatePage,
  onUpdatePage,
  onDeletePage,
  isLoading,
}: PagesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [location] = useLocation();
  const autoOpenedRef = useRef(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    status: "draft" as "draft" | "active" | "hidden",
    parentId: "",
    content: "",
    seo: {
      title: "",
      description: "",
    },
  });

  const hasActiveFilters = statusFilter !== "all" || searchTerm.length > 0;

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDirection === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
      : <ArrowDown className="h-3.5 w-3.5 text-blue-600" />;
  };

  const filteredAndSortedPages = useMemo(() => {
    const filtered = pages.filter((page) => {
      const matchesSearch =
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || page.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortField) {
        case "title":
          return dir * (a.title || "").localeCompare(b.title || "", "he");
        case "slug":
          return dir * (a.slug || "").localeCompare(b.slug || "");
        case "status":
          return dir * (a.status || "").localeCompare(b.status || "");
        case "updatedAt": {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dir * (dateA - dateB);
        }
        default:
          return 0;
      }
    });
  }, [pages, searchTerm, statusFilter, sortField, sortDirection]);

  const openCreateModal = () => {
    setEditingPage(null);
    setFormErrors({});
    setFormData({
      title: "",
      slug: "",
      status: "draft",
      parentId: "",
      content: "",
      seo: { title: "", description: "" },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (page: Page) => {
    setEditingPage(page);
    setFormErrors({});
    const seo = page.seo as { title?: string; description?: string } | null;
    const content = page.content as { html?: string } | string | null;
    setFormData({
      title: page.title,
      slug: page.slug,
      status: (page.status as "draft" | "active" | "hidden") || "draft",
      parentId: page.parentId || "",
      content: typeof content === "string" ? content : content?.html || "",
      seo: {
        title: seo?.title || "",
        description: seo?.description || "",
      },
    });
    setIsModalOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormErrors((prev) => ({ ...prev, title: "" }));
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setFormErrors((prev) => ({ ...prev, slug: "" }));
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "שדה חובה";
    if (!formData.slug.trim()) errors.slug = "שדה חובה";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל שדות החובה",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const pageData = {
        title: formData.title,
        slug: formData.slug,
        status: formData.status,
        parentId: formData.parentId || null,
        content: { html: formData.content },
        seo: formData.seo,
      };

      if (editingPage) {
        await onUpdatePage(editingPage.id, pageData);
        toast({ title: "העמוד עודכן בהצלחה" });
      } else {
        await onCreatePage(pageData);
        toast({ title: "העמוד נוצר בהצלחה" });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: editingPage ? "לא ניתן לעדכן עמוד" : "לא ניתן ליצור עמוד",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDeletePage(deleteTarget.id);
      toast({ title: "העמוד נמחק בהצלחה" });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק עמוד",
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
            <Eye className="h-3 w-3 me-1" />
            פעיל
          </Badge>
        );
      case "hidden":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100">
            <EyeOff className="h-3 w-3 me-1" />
            מוסתר
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
            טיוטה
          </Badge>
        );
    }
  };

  // Auto-open create modal from URL (/new)
  useEffect(() => {
    if (autoOpenedRef.current) return;
    const isNewRoute = location.endsWith("/new") || window.location.pathname.endsWith("/new");
    if (isNewRoute) {
      openCreateModal();
      autoOpenedRef.current = true;
    }
  }, [location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">עמודים</h1>
          <p className="text-sm text-slate-500 mt-1">
            {pages.length} עמודים במערכת
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
          <Plus className="h-4 w-4 me-2" />
          עמוד חדש
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white shadow-sm border-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">סינון:</span>
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="חיפוש לפי כותרת או URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pe-10 bg-slate-50 border-slate-200"
            />
          </div>
          <Select dir="rtl" value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-slate-50 border-slate-200">
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="active">פעיל</SelectItem>
              <SelectItem value="draft">טיוטה</SelectItem>
              <SelectItem value="hidden">מוסתר</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5 me-1" />
              נקה סינון
            </Button>
          )}
          <div className="flex-1" />
          <span className="text-sm text-slate-500">
            {filteredAndSortedPages.length} מתוך {pages.length}
          </span>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="text-start">
                <button
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  כותרת
                  {getSortIcon("title")}
                </button>
              </TableHead>
              <TableHead className="text-start">
                <button
                  onClick={() => handleSort("slug")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  URL
                  {getSortIcon("slug")}
                </button>
              </TableHead>
              <TableHead className="text-start">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  סטטוס
                  {getSortIcon("status")}
                </button>
              </TableHead>
              <TableHead className="text-start">
                <button
                  onClick={() => handleSort("updatedAt")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  עודכן
                  {getSortIcon("updatedAt")}
                </button>
              </TableHead>
              <TableHead className="text-start w-[100px]">
                <span className="text-sm font-semibold text-slate-600">פעולות</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-900 font-medium mb-1">
                      {hasActiveFilters ? "לא נמצאו תוצאות" : "אין עמודים עדיין"}
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                      {hasActiveFilters ? "נסה לשנות את פרמטרי החיפוש" : "צור את העמוד הראשון שלך"}
                    </p>
                    {hasActiveFilters ? (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        נקה סינון
                      </Button>
                    ) : (
                      <Button size="sm" onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 me-2" />
                        צור עמוד
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedPages.map((page) => (
                <TableRow
                  key={page.id}
                  className="group cursor-pointer"
                  onClick={() => openEditModal(page)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-slate-900 font-medium">{page.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded font-mono" dir="ltr">
                      /{page.slug}
                    </code>
                  </TableCell>
                  <TableCell>{getStatusBadge(page.status)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {page.updatedAt
                      ? new Date(page.updatedAt).toLocaleDateString("he-IL", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider delayDuration={300}>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(page)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">ערוך</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteTarget(page)}
                              className="h-8 w-8 p-0 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">מחק</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl" className="bg-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-slate-900">מחיקת עמוד</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600">
              {"האם אתה בטוח שברצונך למחוק את העמוד "}
              <strong>"{deleteTarget?.title}"</strong>?
              <br />
              פעולה זו אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
            <AlertDialogCancel className="mt-0">ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 me-2" />
              מחק עמוד
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingPage ? "עריכת עמוד" : "עמוד חדש"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" dir="rtl" className="flex-1 flex flex-col overflow-hidden">
            <TabsList dir="rtl" className="bg-slate-50 border-b border-slate-200">
              <TabsTrigger value="basic">פרטי העמוד</TabsTrigger>
              <TabsTrigger value="content">תוכן</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pt-4">
              <TabsContent value="basic" className="mt-0 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      כותרת העמוד <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className={`bg-slate-50 border-slate-200 ${formErrors.title ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                      placeholder="דף הבית"
                    />
                    {formErrors.title && (
                      <p className="text-xs text-red-500">{formErrors.title}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      כתובת URL (slug) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className={`bg-slate-50 border-slate-200 ${formErrors.slug ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                      dir="ltr"
                      placeholder="home"
                    />
                    {formErrors.slug && (
                      <p className="text-xs text-red-500">{formErrors.slug}</p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">סטטוס</Label>
                    <Select
                      dir="rtl"
                      value={formData.status}
                      onValueChange={(value: "draft" | "active" | "hidden") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">טיוטה</SelectItem>
                        <SelectItem value="active">פעיל</SelectItem>
                        <SelectItem value="hidden">מוסתר</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">עמוד אב</Label>
                    <Select
                      dir="rtl"
                      value={formData.parentId || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          parentId: value === "none" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="בחר עמוד אב" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">ללא</SelectItem>
                        {pages
                          .filter((p) => p.id !== editingPage?.id && p.id && p.id.trim().length > 0)
                          .map((page) => (
                            <SelectItem key={page.id} value={page.id}>
                              {page.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="mt-0">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">תוכן העמוד</Label>
                  <WYSIWYGEditor
                    value={formData.content}
                    onChange={(value) =>
                      setFormData({ ...formData, content: value })
                    }
                    placeholder="התחל לכתוב את תוכן העמוד..."
                    minHeight="300px"
                    maxHeight="400px"
                  />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="mt-0 space-y-4">
                <div className="space-y-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <h4 className="font-medium text-slate-900">הגדרות SEO</h4>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">כותרת SEO</Label>
                    <Input
                      value={formData.seo.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo, title: e.target.value },
                        })
                      }
                      className="bg-white border-slate-200"
                      placeholder="כותרת לתוצאות חיפוש"
                    />
                    <p className={`text-xs ${formData.seo.title.length > 60 ? "text-amber-600" : "text-slate-500"}`}>
                      {formData.seo.title.length}/60 תווים מומלץ
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">תיאור SEO</Label>
                    <Input
                      value={formData.seo.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo, description: e.target.value },
                        })
                      }
                      className="bg-white border-slate-200"
                      placeholder="תיאור קצר לתוצאות חיפוש"
                    />
                    <p className={`text-xs ${formData.seo.description.length > 160 ? "text-amber-600" : "text-slate-500"}`}>
                      {formData.seo.description.length}/160 תווים מומלץ
                    </p>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-white border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">תצוגה מקדימה בגוגל:</p>
                    <div className="space-y-1">
                      <p className="text-blue-600 text-lg truncate">
                        {formData.seo.title || formData.title || "כותרת העמוד"}
                      </p>
                      <p className="text-green-600 text-sm dir-ltr text-end">
                        example.com/{formData.slug || "page-url"}
                      </p>
                      <p className="text-slate-500 text-sm line-clamp-2">
                        {formData.seo.description || "תיאור העמוד יופיע כאן..."}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 mt-4 sticky bottom-0 bg-white">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                ביטול
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 me-2" />
                )}
                {editingPage ? "עדכן" : "צור"} עמוד
              </Button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
