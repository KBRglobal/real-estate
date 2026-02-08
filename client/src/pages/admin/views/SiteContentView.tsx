import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCsrfToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  MapPin,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import type { SiteStat, InvestmentZone, CaseStudy } from "@shared/schema";

// Default fallback data
const defaultStats = [
  { key: "projects", value: 50, suffix: "+", labelHe: "פרויקטים פעילים", labelEn: "Active Projects", color: "from-amber-500/20 border-amber-500/30" },
  { key: "investors", value: 200, suffix: "+", labelHe: "משקיעים מרוצים", labelEn: "Happy Investors", color: "from-blue-500/20 border-blue-500/30" },
  { key: "yield", value: 8, suffix: "%", labelHe: "תשואה ממוצעת", labelEn: "Average Yield", color: "from-emerald-500/20 border-emerald-500/30" },
  { key: "experience", value: 5, suffix: "+", labelHe: "שנות ניסיון", labelEn: "Years Experience", color: "from-purple-500/20 border-purple-500/30" },
];

const defaultZones = [
  { name: "פאלם ג'ומיירה", nameEn: "Palm Jumeirah", avgRoi: 50, rentalYield: 45, appreciation: 7, demand: "premium", description: "האי המלאכותי המפורסם בעולם - סמל של יוקרה", descriptionEn: "The world-famous artificial island - a symbol of luxury", coordinates: [25.1124, 55.1390] },
  { name: "דובאי מרינה", nameEn: "Dubai Marina", avgRoi: 65, rentalYield: 62, appreciation: 10, demand: "high", description: "אזור יוקרתי עם מרינה מרהיבה וחיי לילה תוססים", descriptionEn: "Luxury area with stunning marina and vibrant nightlife", coordinates: [25.0805, 55.1403] },
  { name: "JVC", nameEn: "JVC", avgRoi: 95, rentalYield: 85, appreciation: 15, demand: "very-high", description: "אזור צומח במהירות עם תשואות גבוהות ומחירי כניסה נוחים", descriptionEn: "Fast-growing area with high yields and affordable entry prices", coordinates: [25.0550, 55.2094] },
];

const defaultCaseStudies = [
  { investmentAmount: 800000, currentValue: 1120000, roiPercent: 40, investmentYear: "2022", exitYear: "2024", location: "JVC", locationEn: "JVC", propertyType: "דירת 2 חדרים", propertyTypeEn: "2 Bedroom Apartment", testimonial: "התהליך היה מסודר ושקוף לחלוטין. קיבלתי ליווי צמוד מהרגע הראשון ועד קבלת המפתח.", testimonialEn: "The process was organized and completely transparent." },
  { investmentAmount: 1500000, currentValue: 1950000, roiPercent: 30, investmentYear: "2021", exitYear: "2024", location: "ביזנס ביי", locationEn: "Business Bay", propertyType: "דירת 3 חדרים", propertyTypeEn: "3 Bedroom Apartment", testimonial: "השקעתי בפרויקט על הנייר וקיבלתי תשואה מעולה.", testimonialEn: "I invested in an off-plan project and received excellent returns." },
];

// =====================
// Stats Manager Component
// =====================
function StatsManager() {
  const { toast } = useToast();
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SiteStat>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStat, setNewStat] = useState<Partial<SiteStat>>({
    key: "",
    value: 0,
    suffix: "+",
    labelHe: "",
    labelEn: "",
    color: "from-blue-500/20 border-blue-500/30",
    order: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/site-stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.sort((a: SiteStat, b: SiteStat) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (id: string) => {
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/site-stats/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        await fetchStats();
        setEditingId(null);
        toast({ title: "נשמר בהצלחה", variant: "default" });
      } else {
        toast({ title: "שגיאה", description: "לא ניתן לשמור את הסטטיסטיקה", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update stat:", error);
      toast({ title: "שגיאה", description: "לא ניתן לשמור את הסטטיסטיקה", variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch("/api/site-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(newStat),
      });
      if (res.ok) {
        await fetchStats();
        setIsDialogOpen(false);
        setNewStat({
          key: "",
          value: 0,
          suffix: "+",
          labelHe: "",
          labelEn: "",
          color: "from-blue-500/20 border-blue-500/30",
          order: 0,
        });
        toast({ title: "נוצר בהצלחה", variant: "default" });
      } else {
        toast({ title: "שגיאה", description: "לא ניתן ליצור סטטיסטיקה", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create stat:", error);
      toast({ title: "שגיאה", description: "לא ניתן ליצור סטטיסטיקה", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/site-stats/${id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      });
      if (res.ok) {
        await fetchStats();
        toast({ title: "נמחק בהצלחה", variant: "default" });
      } else {
        toast({ title: "שגיאה", description: "לא ניתן למחוק את הסטטיסטיקה", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to delete stat:", error);
      toast({ title: "שגיאה", description: "לא ניתן למחוק את הסטטיסטיקה", variant: "destructive" });
    }
  };

  const startEditing = (stat: SiteStat) => {
    setEditingId(stat.id);
    setEditForm(stat);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">טוען...</div>;
  }

  const displayStats = stats.length > 0 ? stats : [];

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">סטטיסטיקות האתר</h3>
          <p className="text-sm text-muted-foreground">
            ערכו את המספרים שמוצגים באתר
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 ms-2" />
          הוסף סטטיסטיקה
        </Button>
      </div>

      {displayStats.length === 0 ? (
        <Card className="p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">אין סטטיסטיקות עדיין</h4>
          <p className="text-sm text-muted-foreground mb-4">
            הוסיפו סטטיסטיקות שיוצגו באתר הראשי
          </p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 ms-2" />
            הוסף סטטיסטיקה ראשונה
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {displayStats.map((stat) => (
            <Card key={stat.id} className="p-4">
              {editingId === stat.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>מפתח (key)</Label>
                      <Input
                        value={editForm.key || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, key: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>ערך</Label>
                      <Input
                        type="number"
                        value={editForm.value || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            value: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>סיומת</Label>
                      <Input
                        value={editForm.suffix || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, suffix: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>סדר</Label>
                      <Input
                        type="number"
                        value={editForm.order || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>תווית (עברית)</Label>
                      <Input
                        value={editForm.labelHe || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, labelHe: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>תווית (אנגלית)</Label>
                      <Input
                        value={editForm.labelEn || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, labelEn: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4 ms-2" />
                      ביטול
                    </Button>
                    <Button onClick={() => handleSave(stat.id)}>
                      <Save className="w-4 h-4 ms-2" />
                      שמור
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                          {stat.value}
                          {stat.suffix}
                        </span>
                        <Badge variant="outline">{stat.key}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stat.labelHe} | {stat.labelEn}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(stat)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(stat.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף סטטיסטיקה חדשה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>מפתח (key)</Label>
                <Input
                  value={newStat.key || ""}
                  onChange={(e) =>
                    setNewStat({ ...newStat, key: e.target.value })
                  }
                  placeholder="projects"
                />
              </div>
              <div>
                <Label>ערך</Label>
                <Input
                  type="number"
                  value={newStat.value || 0}
                  onChange={(e) =>
                    setNewStat({
                      ...newStat,
                      value: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>סיומת</Label>
                <Input
                  value={newStat.suffix || ""}
                  onChange={(e) =>
                    setNewStat({ ...newStat, suffix: e.target.value })
                  }
                  placeholder="+"
                />
              </div>
              <div>
                <Label>סדר</Label>
                <Input
                  type="number"
                  value={newStat.order || 0}
                  onChange={(e) =>
                    setNewStat({
                      ...newStat,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>תווית (עברית)</Label>
                <Input
                  value={newStat.labelHe || ""}
                  onChange={(e) =>
                    setNewStat({ ...newStat, labelHe: e.target.value })
                  }
                  placeholder="פרויקטים פעילים"
                />
              </div>
              <div>
                <Label>תווית (אנגלית)</Label>
                <Input
                  value={newStat.labelEn || ""}
                  onChange={(e) =>
                    setNewStat({ ...newStat, labelEn: e.target.value })
                  }
                  placeholder="Active Projects"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleCreate}>צור סטטיסטיקה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =====================
// Zones Manager Component
// =====================
function ZonesManager() {
  const { toast } = useToast();
  const [zones, setZones] = useState<InvestmentZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<InvestmentZone | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<InvestmentZone>>({
    name: "",
    nameEn: "",
    avgRoi: 0,
    rentalYield: 0,
    appreciation: 0,
    demand: "medium",
    description: "",
    descriptionEn: "",
    coordinates: null,
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await fetch("/api/investment-zones/all");
      if (res.ok) {
        const data = await res.json();
        setZones(data.sort((a: InvestmentZone, b: InvestmentZone) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error("Failed to fetch zones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingZone
        ? `/api/investment-zones/${editingZone.id}`
        : "/api/investment-zones";
      const method = editingZone ? "PUT" : "POST";

      const csrfToken = await getCsrfToken();
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchZones();
        closeDialog();
        toast({ title: editingZone ? "נשמר בהצלחה" : "נוצר בהצלחה", variant: "default" });
      } else {
        toast({ title: "שגיאה", description: "לא ניתן לשמור את האזור", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to save zone:", error);
      toast({ title: "שגיאה", description: "לא ניתן לשמור את האזור", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/investment-zones/${id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      });
      if (res.ok) {
        await fetchZones();
        setDeleteConfirm(null);
        toast({ title: "נמחק בהצלחה", variant: "default" });
      } else {
        toast({ title: "שגיאה", description: "לא ניתן למחוק את האזור", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to delete zone:", error);
      toast({ title: "שגיאה", description: "לא ניתן למחוק את האזור", variant: "destructive" });
    }
  };

  const openDialog = (zone?: InvestmentZone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData(zone);
    } else {
      setEditingZone(null);
      setFormData({
        name: "",
        nameEn: "",
        avgRoi: 0,
        rentalYield: 0,
        appreciation: 0,
        demand: "medium",
        description: "",
        descriptionEn: "",
        coordinates: null,
        order: 0,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingZone(null);
    setFormData({
      name: "",
      nameEn: "",
      avgRoi: 0,
      rentalYield: 0,
      appreciation: 0,
      demand: "medium",
      description: "",
      descriptionEn: "",
      coordinates: null,
      order: 0,
      isActive: true,
    });
  };

  const getDemandLabel = (demand: string) => {
    const labels: Record<string, string> = {
      "very-high": "ביקוש גבוה מאוד",
      high: "ביקוש גבוה",
      medium: "ביקוש בינוני",
      premium: "פרימיום",
    };
    return labels[demand] || demand;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">טוען...</div>;
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">אזורי השקעה</h3>
          <p className="text-sm text-muted-foreground">
            נהלו את אזורי ההשקעה המוצגים במפה
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 ms-2" />
          הוסף אזור
        </Button>
      </div>

      {zones.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">אין אזורי השקעה</h4>
          <p className="text-sm text-muted-foreground mb-4">
            הוסיפו אזורי השקעה שיוצגו במפה
          </p>
          <Button variant="outline" onClick={() => openDialog()}>
            <Plus className="w-4 h-4 ms-2" />
            הוסף אזור ראשון
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <Card key={zone.id} className="relative overflow-hidden">
              {!zone.isActive && (
                <div className="absolute top-2 start-2">
                  <Badge variant="secondary">מוסתר</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{zone.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{zone.nameEn}</p>
                  </div>
                  <Badge>{getDemandLabel(zone.demand)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-primary/10 rounded-lg">
                    <p className="text-lg font-bold text-primary">
                      {(zone.avgRoi / 10).toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">ROI</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">
                      {(zone.rentalYield / 10).toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">תשואת שכירות</p>
                  </div>
                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                    <p className="text-lg font-bold text-green-600">
                      +{zone.appreciation}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">עלייה</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {zone.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDialog(zone)}
                  >
                    <Pencil className="w-4 h-4 ms-2" />
                    עריכה
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(zone.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? "עריכת אזור השקעה" : "הוספת אזור השקעה"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>שם (עברית)</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>שם (אנגלית)</Label>
                <Input
                  value={formData.nameEn || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>ROI ממוצע (x10)</Label>
                <Input
                  type="number"
                  value={formData.avgRoi || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      avgRoi: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  למשל: 65 = 6.5%
                </p>
              </div>
              <div>
                <Label>תשואת שכירות (x10)</Label>
                <Input
                  type="number"
                  value={formData.rentalYield || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rentalYield: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>עלייה שנתית (%)</Label>
                <Input
                  type="number"
                  value={formData.appreciation || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appreciation: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>רמת ביקוש</Label>
                <Select
                  dir="rtl"
                  value={formData.demand || "medium"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, demand: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very-high">ביקוש גבוה מאוד</SelectItem>
                    <SelectItem value="high">ביקוש גבוה</SelectItem>
                    <SelectItem value="medium">ביקוש בינוני</SelectItem>
                    <SelectItem value="premium">פרימיום</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>סדר</Label>
                <Input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>תיאור (עברית)</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div>
              <Label>תיאור (אנגלית)</Label>
              <Textarea
                value={formData.descriptionEn || ""}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between" dir="rtl">
              <Label>פעיל (מוצג באתר)</Label>
              <Switch
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              ביטול
            </Button>
            <Button onClick={handleSubmit}>
              {editingZone ? "שמור שינויים" : "צור אזור"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת אזור השקעה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את אזור ההשקעה? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// =====================
// Case Studies Manager Component
// =====================
function CaseStudiesManager() {
  const { toast } = useToast();
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState<CaseStudy | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CaseStudy>>({
    investmentAmount: 0,
    currentValue: 0,
    roiPercent: 0,
    investmentYear: "",
    exitYear: "",
    location: "",
    locationEn: "",
    propertyType: "",
    propertyTypeEn: "",
    testimonial: "",
    testimonialEn: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      const res = await fetch("/api/case-studies/all");
      if (res.ok) {
        const data = await res.json();
        setStudies(data.sort((a: CaseStudy, b: CaseStudy) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error("Failed to fetch case studies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingStudy
        ? `/api/case-studies/${editingStudy.id}`
        : "/api/case-studies";
      const method = editingStudy ? "PUT" : "POST";

      const csrfToken = await getCsrfToken();
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchStudies();
        closeDialog();
        toast({ title: editingStudy ? "נשמר בהצלחה" : "נוצר בהצלחה", variant: "default" });
      } else {
        toast({ title: "שגיאה", description: "לא ניתן לשמור את מקרה המבחן", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to save case study:", error);
      toast({ title: "שגיאה", description: "לא ניתן לשמור את מקרה המבחן", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/case-studies/${id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      });
      if (res.ok) {
        await fetchStudies();
        setDeleteConfirm(null);
        toast({ title: "נמחק בהצלחה", variant: "default" });
      } else {
        toast({ title: "שגיאה", description: "לא ניתן למחוק את מקרה המבחן", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to delete case study:", error);
      toast({ title: "שגיאה", description: "לא ניתן למחוק את מקרה המבחן", variant: "destructive" });
    }
  };

  const openDialog = (study?: CaseStudy) => {
    if (study) {
      setEditingStudy(study);
      setFormData(study);
    } else {
      setEditingStudy(null);
      setFormData({
        investmentAmount: 0,
        currentValue: 0,
        roiPercent: 0,
        investmentYear: "",
        exitYear: "",
        location: "",
        locationEn: "",
        propertyType: "",
        propertyTypeEn: "",
        testimonial: "",
        testimonialEn: "",
        order: 0,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingStudy(null);
    setFormData({
      investmentAmount: 0,
      currentValue: 0,
      roiPercent: 0,
      investmentYear: "",
      exitYear: "",
      location: "",
      locationEn: "",
      propertyType: "",
      propertyTypeEn: "",
      testimonial: "",
      testimonialEn: "",
      order: 0,
      isActive: true,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL").format(value);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">טוען...</div>;
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">מקרי מבחן</h3>
          <p className="text-sm text-muted-foreground">
            הציגו את סיפורי ההצלחה של המשקיעים
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 ms-2" />
          הוסף מקרה מבחן
        </Button>
      </div>

      {studies.length === 0 ? (
        <Card className="p-8 text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">אין מקרי מבחן</h4>
          <p className="text-sm text-muted-foreground mb-4">
            הוסיפו מקרי מבחן של משקיעים אמיתיים
          </p>
          <Button variant="outline" onClick={() => openDialog()}>
            <Plus className="w-4 h-4 ms-2" />
            הוסף מקרה מבחן ראשון
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studies.map((study) => (
            <Card key={study.id} className="relative">
              {!study.isActive && (
                <div className="absolute top-2 start-2">
                  <Badge variant="secondary">מוסתר</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-700">
                    +{study.roiPercent}% ROI
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {study.location}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">השקעה:</span>
                    <span className="font-medium">
                      {formatCurrency(study.investmentAmount)} AED
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">שווי נוכחי:</span>
                    <span className="font-medium text-primary">
                      {formatCurrency(study.currentValue)} AED
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">תקופה:</span>
                    <span>
                      {study.investmentYear} - {study.exitYear}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic line-clamp-2 mb-4">
                  "{study.testimonial}"
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDialog(study)}
                  >
                    <Pencil className="w-4 h-4 ms-2" />
                    עריכה
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(study.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStudy ? "עריכת מקרה מבחן" : "הוספת מקרה מבחן"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>סכום השקעה (AED)</Label>
                <Input
                  type="number"
                  value={formData.investmentAmount || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      investmentAmount: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>שווי נוכחי (AED)</Label>
                <Input
                  type="number"
                  value={formData.currentValue || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentValue: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>אחוז תשואה</Label>
                <Input
                  type="number"
                  value={formData.roiPercent || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roiPercent: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>שנת השקעה</Label>
                <Input
                  value={formData.investmentYear || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, investmentYear: e.target.value })
                  }
                  placeholder="2022"
                />
              </div>
              <div>
                <Label>שנת יציאה</Label>
                <Input
                  value={formData.exitYear || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, exitYear: e.target.value })
                  }
                  placeholder="2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>מיקום (עברית)</Label>
                <Input
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>מיקום (אנגלית)</Label>
                <Input
                  value={formData.locationEn || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, locationEn: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>סוג נכס (עברית)</Label>
                <Input
                  value={formData.propertyType || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyType: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>סוג נכס (אנגלית)</Label>
                <Input
                  value={formData.propertyTypeEn || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyTypeEn: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>עדות (עברית)</Label>
              <Textarea
                value={formData.testimonial || ""}
                onChange={(e) =>
                  setFormData({ ...formData, testimonial: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label>עדות (אנגלית)</Label>
              <Textarea
                value={formData.testimonialEn || ""}
                onChange={(e) =>
                  setFormData({ ...formData, testimonialEn: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>סדר</Label>
                <Input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between pt-6" dir="rtl">
                <Label>פעיל (מוצג באתר)</Label>
                <Switch
                  checked={formData.isActive ?? true}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              ביטול
            </Button>
            <Button onClick={handleSubmit}>
              {editingStudy ? "שמור שינויים" : "צור מקרה מבחן"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת מקרה מבחן</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את מקרה המבחן? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// =====================
// Main Component
// =====================
export function SiteContentView() {
  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">ניהול תוכן האתר</h2>
        <p className="text-muted-foreground">
          עדכנו את הסטטיסטיקות, אזורי ההשקעה ומקרי המבחן שמוצגים באתר
        </p>
      </div>

      <Tabs dir="rtl" defaultValue="stats" className="w-full">
        <TabsList dir="rtl" className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            סטטיסטיקות
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            אזורים
          </TabsTrigger>
          <TabsTrigger value="cases" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            מקרי מבחן
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-6">
          <StatsManager />
        </TabsContent>

        <TabsContent value="zones" className="mt-6">
          <ZonesManager />
        </TabsContent>

        <TabsContent value="cases" className="mt-6">
          <CaseStudiesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
