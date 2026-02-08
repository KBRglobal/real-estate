import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { getCsrfToken } from "@/lib/queryClient";
import {
  Globe,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  Users,
  Save,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { MiniSite, Project } from "@shared/schema";

interface MiniSitesViewProps {
  miniSites: MiniSite[];
  projects: Project[];
  onCreateMiniSite: (data: Partial<MiniSite>) => Promise<void>;
  onUpdateMiniSite: (id: string, data: Partial<MiniSite>) => Promise<void>;
  onDeleteMiniSite: (id: string) => Promise<void>;
  isLoading: boolean;
}

export function MiniSitesView({
  miniSites,
  projects,
  onCreateMiniSite,
  onUpdateMiniSite,
  onDeleteMiniSite,
  isLoading,
}: MiniSitesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [editingMiniSite, setEditingMiniSite] = useState<MiniSite | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [exportData, setExportData] = useState<string>("");
  const [importData, setImportData] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Export mini-sites to JSON
  const handleExport = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/mini-sites/admin/export");
      const data = await response.json();
      
      if (!response.ok || data.error) {
        toast({
          title: "שגיאה בייצוא",
          description: data.error || "לא ניתן לייצא את המיני-סייטים",
          variant: "destructive",
        });
        return;
      }
      
      setExportData(JSON.stringify(data, null, 2));
      setIsSyncModalOpen(true);
      toast({ title: "הנתונים יוצאו בהצלחה" });
    } catch (error) {
      toast({
        title: "שגיאה בייצוא",
        description: "לא ניתן לייצא את המיני-סייטים",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Import mini-sites from JSON
  const handleImport = async (overwrite: boolean = false) => {
    if (!importData.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להדביק את נתוני ה-JSON לפני הייבוא",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    try {
      const parsed = JSON.parse(importData);
      const miniSitesToImport = parsed.miniSites || parsed;

      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/mini-sites/admin/import", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ miniSites: miniSitesToImport, overwrite }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        toast({
          title: "שגיאה בייבוא",
          description: result.error || "שגיאת שרת",
          variant: "destructive",
        });
        return;
      }
      
      if (result.success) {
        toast({
          title: "הייבוא הושלם",
          description: `יובאו: ${result.results.imported}, עודכנו: ${result.results.updated}, דולגו: ${result.results.skipped}`,
        });
        setIsSyncModalOpen(false);
        setImportData("");
        // Refresh the page to show new data
        window.location.reload();
      } else {
        toast({
          title: "שגיאה בייבוא",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "שגיאה בייבוא",
        description: error.message || "JSON לא תקין",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Copy export data to clipboard
  const copyExportData = () => {
    navigator.clipboard.writeText(exportData);
    toast({ title: "הנתונים הועתקו ללוח" });
  };

  // Download export as file
  const downloadExport = () => {
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mini-sites-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "הקובץ הורד בהצלחה" });
  };

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    projectId: "",
    status: "draft" as "draft" | "active" | "hidden",
    hero: {
      title: "",
      subtitle: "",
      image: "",
      cta: { text: "", link: "" },
    },
    about: {
      title: "",
      content: "",
    },
    contact: {
      phone: "",
      email: "",
      whatsapp: "",
    },
  });

  const filteredMiniSites = miniSites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingMiniSite(null);
    setFormData({
      name: "",
      slug: "",
      projectId: "",
      status: "draft",
      hero: { title: "", subtitle: "", image: "", cta: { text: "", link: "" } },
      about: { title: "", content: "" },
      contact: { phone: "", email: "", whatsapp: "" },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (site: MiniSite) => {
    setEditingMiniSite(site);
    const hero = site.hero as any || {};
    const about = site.about as any || {};
    const contact = site.contact as any || {};

    setFormData({
      name: site.name,
      slug: site.slug,
      projectId: site.projectId || "",
      status: (site.status as "draft" | "active" | "hidden") || "draft",
      hero: {
        title: hero.title || "",
        subtitle: hero.subtitle || "",
        image: hero.image || "",
        cta: hero.cta || { text: "", link: "" },
      },
      about: {
        title: about.title || "",
        content: about.content || "",
      },
      contact: {
        phone: contact.phone || "",
        email: contact.email || "",
        whatsapp: contact.whatsapp || "",
      },
    });
    setIsModalOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: "שגיאה",
        description: "יש למלא שם וכתובת URL",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const siteData = {
        name: formData.name,
        slug: formData.slug,
        projectId: formData.projectId || null,
        status: formData.status,
        hero: formData.hero,
        about: formData.about,
        contact: formData.contact,
      };

      if (editingMiniSite) {
        await onUpdateMiniSite(editingMiniSite.id, siteData);
        toast({ title: "המיני-סייט עודכן בהצלחה" });
      } else {
        await onCreateMiniSite(siteData);
        toast({ title: "המיני-סייט נוצר בהצלחה" });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את המיני-סייט",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (site: MiniSite) => {
    if (!confirm(`למחוק את "${site.name}"?`)) return;

    try {
      await onDeleteMiniSite(site.id);
      toast({ title: "המיני-סייט נמחק בהצלחה" });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את המיני-סייט",
        variant: "destructive",
      });
    }
  };

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(slug);
    toast({ title: "הקישור הועתק" });
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
            <Eye className="h-3 w-3" /> פעיל
          </span>
        );
      case "hidden":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1">
            <EyeOff className="h-3 w-3" /> מוסתר
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
            טיוטה
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="חיפוש מיני-סייטים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 bg-white border-slate-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white border-slate-200">
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="active">פעיל</SelectItem>
              <SelectItem value="draft">טיוטה</SelectItem>
              <SelectItem value="hidden">מוסתר</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={syncing}
            className="border-slate-200"
            data-testid="button-export-minisites"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 ml-2" />
            )}
            ייצוא/סנכרון
          </Button>
          <Button onClick={openCreateModal} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="h-4 w-4 ml-2" />
            מיני-סייט חדש
          </Button>
        </div>
      </div>

      {filteredMiniSites.length === 0 ? (
        <Card className="bg-white shadow-sm border-slate-200 p-12">
          <div className="text-center text-slate-500">
            <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">אין מיני-סייטים</p>
            <p className="text-sm mt-1">צור מיני-סייט חדש להתחיל</p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMiniSites.map((site) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white shadow-sm border-slate-200 overflow-hidden hover:border-blue-300 transition-colors">
                <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="h-12 w-12 text-slate-300" />
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(site.status)}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{site.name}</h3>
                    <p className="text-sm text-slate-500">/s/{site.slug}</p>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-500">
                      <BarChart3 className="h-4 w-4" />
                      <span>{site.views || 0} צפיות</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Users className="h-4 w-4" />
                      <span>{site.leads || 0} לידים</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyUrl(site.slug)}
                      className="flex-1"
                    >
                      {copiedUrl === site.slug ? (
                        <Check className="h-4 w-4 ml-1 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 ml-1" />
                      )}
                      העתק קישור
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`/s/${site.slug}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(site)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(site)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingMiniSite ? "עריכת מיני-סייט" : "מיני-סייט חדש"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="bg-slate-50 border border-slate-200">
              <TabsTrigger value="basic">פרטים בסיסיים</TabsTrigger>
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="about">אודות</TabsTrigger>
              <TabsTrigger value="contact">יצירת קשר</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>שם המיני-סייט</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="bg-slate-50 border-slate-200"
                    placeholder="פרויקט מרינה גייט"
                  />
                </div>
                <div className="space-y-2">
                  <Label>כתובת URL</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="bg-slate-50 border-slate-200"
                    dir="ltr"
                    placeholder="marina-gate"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>פרויקט מקושר</Label>
                  <Select
                    value={formData.projectId || "none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        projectId: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="בחר פרויקט" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">ללא</SelectItem>
                      {projects.filter(p => p.id && p.id.trim().length > 0).map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>סטטוס</Label>
                  <Select
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
              </div>
            </TabsContent>

            <TabsContent value="hero" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>כותרת ראשית</Label>
                <Input
                  value={formData.hero.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, title: e.target.value },
                    })
                  }
                  className="bg-slate-50 border-slate-200"
                  placeholder="השקעה חכמה בדובאי"
                />
              </div>
              <div className="space-y-2">
                <Label>כותרת משנית</Label>
                <Input
                  value={formData.hero.subtitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, subtitle: e.target.value },
                    })
                  }
                  className="bg-slate-50 border-slate-200"
                  placeholder="תשואה של 8% מובטחת"
                />
              </div>
              <div className="space-y-2">
                <Label>תמונת רקע (URL)</Label>
                <Input
                  value={formData.hero.image}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, image: e.target.value },
                    })
                  }
                  className="bg-slate-50 border-slate-200"
                  dir="ltr"
                  placeholder="https://..."
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>טקסט כפתור CTA</Label>
                  <Input
                    value={formData.hero.cta.text}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          cta: { ...formData.hero.cta, text: e.target.value },
                        },
                      })
                    }
                    className="bg-slate-50 border-slate-200"
                    placeholder="קבל פרטים נוספים"
                  />
                </div>
                <div className="space-y-2">
                  <Label>קישור כפתור</Label>
                  <Input
                    value={formData.hero.cta.link}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          cta: { ...formData.hero.cta, link: e.target.value },
                        },
                      })
                    }
                    className="bg-slate-50 border-slate-200"
                    dir="ltr"
                    placeholder="#contact"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>כותרת</Label>
                <Input
                  value={formData.about.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, title: e.target.value },
                    })
                  }
                  className="bg-slate-50 border-slate-200"
                  placeholder="אודות הפרויקט"
                />
              </div>
              <div className="space-y-2">
                <Label>תוכן</Label>
                <Textarea
                  value={formData.about.content}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, content: e.target.value },
                    })
                  }
                  className="bg-slate-50 border-slate-200 min-h-[150px]"
                  placeholder="תיאור מפורט של הפרויקט..."
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input
                  value={formData.contact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value },
                    })
                  }
                  className="bg-slate-50 border-slate-200"
                  dir="ltr"
                  placeholder="+972-50-000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>אימייל</Label>
                <Input
                  value={formData.contact.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value },
                    })
                  }
                  className="bg-slate-50 border-slate-200"
                  dir="ltr"
                  placeholder="info@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={formData.contact.whatsapp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, whatsapp: e.target.value },
                    })
                  }
                  className="bg-slate-50 border-slate-200"
                  dir="ltr"
                  placeholder="+972500000000"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 mt-6">
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
              className="bg-blue-500 hover:bg-blue-600"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 ml-2" />
              )}
              {editingMiniSite ? "עדכן" : "צור"} מיני-סייט
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sync Modal */}
      <Dialog open={isSyncModalOpen} onOpenChange={setIsSyncModalOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              סנכרון מיני-סייטים בין סביבות
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="export" className="mt-4">
            <TabsList className="bg-slate-100 border border-slate-300 w-full grid grid-cols-2 h-12">
              <TabsTrigger value="export" className="text-base font-semibold data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                ייצוא (מסביבה זו)
              </TabsTrigger>
              <TabsTrigger value="import" className="text-base font-semibold data-[state=active]:bg-green-500 data-[state=active]:text-white">
                ייבוא (לסביבה זו)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>כדי לסנכרן לפרודקשן:</strong>
                <ol className="mt-2 space-y-1 list-decimal list-inside">
                  <li>לחץ "העתק" או "הורד" להעתקת הנתונים</li>
                  <li>היכנס לאתר הפרודקשן (ddl-uae.com)</li>
                  <li>עבור לאדמין → מיני-סייטים → ייצוא/סנכרון</li>
                  <li>בחר בלשונית "ייבוא" והדבק את הנתונים</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label>נתוני הייצוא ({miniSites.length} מיני-סייטים)</Label>
                <Textarea
                  value={exportData}
                  readOnly
                  className="bg-slate-50 border-slate-200 min-h-[300px] font-mono text-xs"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={copyExportData} variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 ml-2" />
                  העתק ללוח
                </Button>
                <Button onClick={downloadExport} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 ml-2" />
                  הורד כקובץ
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4 mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>שים לב:</strong> הייבוא יוסיף מיני-סייטים חדשים לסביבה זו.
                מיני-סייטים עם אותו slug ידולגו (אלא אם תבחר לדרוס).
              </div>

              <div className="space-y-2">
                <Label>הדבק את נתוני ה-JSON כאן</Label>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="bg-slate-50 border-slate-200 min-h-[300px] font-mono text-xs"
                  dir="ltr"
                  placeholder='{"exportedAt": "...", "miniSites": [...]}'
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => handleImport(false)} 
                  disabled={syncing || !importData.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 ml-2" />
                  )}
                  יבא (דלג על קיימים)
                </Button>
                <Button 
                  onClick={() => handleImport(true)} 
                  disabled={syncing || !importData.trim()}
                  variant="outline"
                  className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 ml-2" />
                  )}
                  יבא ודרוס קיימים
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4 border-t border-slate-200 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setIsSyncModalOpen(false);
                setExportData("");
                setImportData("");
              }}
            >
              סגור
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
