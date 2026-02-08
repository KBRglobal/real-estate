import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  X,
  Loader2,
  Upload,
  Trash2,
  Plus,
  Building2,
  MapPin,
  DollarSign,
  Image,
  FileText,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  MessageSquare,
  ListChecks,
  Globe,
  Video,
  Download,
  HelpCircle,
  BarChart3,
  Settings2,
  Layers,
  ExternalLink,
  Copy,
  AlertCircle,
  GripVertical,
  CheckCircle2,
  ChevronUp,
  Calendar,
  Tag,
  Car,
  CreditCard,
  Search,
  Check,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { useAIAssist } from "@/hooks/use-ai-assist";
import { getCsrfToken } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import {
  type FormDataType,
  type OriginalProjectData,
  type HighlightItem,
  type FAQItem,
  type UnitItem,
  type FloorPlanItem,
  type UnitTypePricingItem,
  type GalleryCategory,
  type PaymentPlanData,
  type PaymentMilestone,
  emptyFormData,
} from "./projects/types";
import { projectToFormData, formDataToProject } from "./projects/utils";
import { AmenitiesEditor, schemaToAmenityIds, amenityIdsToSchema } from "@/components/admin/AmenitiesEditor";
import { useLocationSearch, type LocationSuggestion } from "@/hooks/use-mapbox-geocoding";
import { getAreaProximity, type ProximityLandmark } from "@/lib/dubai-proximity-data";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reusable section header inside a tab */
function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 pb-2 mb-4 border-b border-slate-200">
      <div className="mt-0.5 text-slate-500">{icon}</div>
      <div>
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

/** Required asterisk */
function Req() {
  return <span className="text-red-500 me-0.5">*</span>;
}

/** Inline validation message */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {message}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ProjectEditViewProps {
  project: Project;
  onSave: (id: string, data: Partial<Project>) => Promise<void>;
  onClose: () => void;
}

export function ProjectEditView({ project, onSave, onClose }: ProjectEditViewProps) {
  const [formData, setFormData] = useState<FormDataType>(emptyFormData);
  const [originalData, setOriginalData] = useState<OriginalProjectData | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const handleSaveRef = useRef<() => void>(() => {});
  const [galleryUploading, setGalleryUploading] = useState(false);

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      updateField("imageUrl", response.objectPath);
      toast({ title: "התמונה הועלתה בהצלחה" });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בהעלאת התמונה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { generateDescription, generateTagline, extractFromBrochure, isLoading: aiLoading } = useAIAssist({
    onError: (error) => {
      toast({
        title: "שגיאה ב-AI",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const fd = projectToFormData(project);
    setFormData(fd);
    setOriginalData({
      highlights: project.highlights,
      amenities: project.amenities,
      paymentPlan: project.paymentPlan,
      faqs: project.faqs,
      neighborhood: project.neighborhood,
      units: project.units,
      floorPlans: project.floorPlans,
      highlightsText: fd.highlightsText,
      amenitiesText: fd.amenitiesText,
      paymentPlanText: fd.paymentPlanText,
    });
    const amenitiesRaw = project.amenities as any;
    setSelectedAmenityIds(schemaToAmenityIds(amenitiesRaw));
  }, [project]);

  // Track scroll position for "scroll to top" button
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handler = () => setShowScrollTop(el.scrollTop > 300);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // Warn before closing browser tab with unsaved changes
  useEffect(() => {
    if (!hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  // Guarded close – confirms if there are unsaved changes
  const guardedClose = useCallback(() => {
    if (hasChanges) {
      if (!window.confirm("יש שינויים שלא נשמרו. האם אתה בטוח שברצונך לצאת?")) return;
    }
    onClose();
  }, [hasChanges, onClose]);

  const updateField = useCallback((field: keyof FormDataType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const markTouched = useCallback((field: string) => {
    setTouchedFields((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }, []);

  // ---- Validation ----
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = "שם הפרויקט הוא שדה חובה";
    if (!formData.developer?.trim()) errors.developer = "שם היזם הוא שדה חובה";
    if (!formData.location?.trim()) errors.location = "מיקום הוא שדה חובה";
    return errors;
  }, [formData.name, formData.developer, formData.location]);

  // Determine which tabs have changes (compare to initial load)
  const tabHasRequiredError = useMemo(() => {
    const result: Record<string, boolean> = {};
    result.details = !!(validationErrors.name || validationErrors.developer);
    result.content = !!validationErrors.location;
    result.units = false;
    result.pricing = false;
    result.location = false;
    result.media = false;
    result.extras = false;
    return result;
  }, [validationErrors]);

  // ---- Save handler ----
  const handleSave = async () => {
    // Validate required fields
    if (validationErrors.name) {
      toast({ title: "שם הפרויקט חובה", variant: "destructive" });
      setActiveTab("details");
      markTouched("name");
      return;
    }
    if (validationErrors.location) {
      toast({ title: "מיקום חובה", variant: "destructive" });
      setActiveTab("content");
      markTouched("location");
      return;
    }

    setSaving(true);
    try {
      const projectData = formDataToProject(formData, originalData);
      // Use AmenitiesEditor structured data instead of text-based amenities
      if (selectedAmenityIds.length > 0) {
        projectData.amenities = amenityIdsToSchema(selectedAmenityIds);
      }
      await onSave(project.id, projectData);
      toast({
        title: "הפרויקט נשמר בהצלחה",
        description: "כל השינויים נשמרו",
      });
      setHasChanges(false);
      onClose();
    } catch (error) {
      toast({
        title: "שגיאה בשמירה",
        description: "לא ניתן לשמור את הפרויקט. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Keep ref in sync so the Ctrl+S listener always calls the latest handleSave
  handleSaveRef.current = handleSave;

  // Ctrl+S / Cmd+S keyboard shortcut to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ---- Duplicate handler ----
  const handleDuplicate = async () => {
    setSaving(true);
    try {
      const projectData = formDataToProject(formData, originalData);
      if (selectedAmenityIds.length > 0) {
        projectData.amenities = amenityIdsToSchema(selectedAmenityIds);
      }
      // Mark as draft with modified name/slug
      projectData.name = `${formData.name} (עותק)`;
      projectData.slug = formData.slug ? `${formData.slug}-copy` : undefined;
      projectData.status = "draft";
      // Use empty id to create new project
      await onSave("__duplicate__", projectData);
      toast({ title: "הפרויקט שוכפל בהצלחה", description: "נוצר עותק חדש בסטטוס טיוטה" });
      onClose();
    } catch (_error) {
      toast({ title: "שגיאה בשכפול", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ---- Preview handler ----
  const handlePreview = () => {
    const slug = formData.slug || project.slug || project.id;
    window.open(`/project/${slug}`, "_blank");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file, "hero");
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGalleryUploading(true);
    const newImages: { url: string; alt?: string; type?: "image" | "video"; category?: "exterior" | "interior" | "amenities" | "views" }[] = [];
    const MAX_FILE_SIZE = 50 * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "הקובץ גדול מדי", description: `"${file.name}" > 50MB`, variant: "destructive" });
        continue;
      }
      try {
        const csrfToken = await getCsrfToken();
        let response = await fetch("/api/r2/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
          credentials: "include",
          body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "gallery" }),
        });
        if (response.status === 503) {
          response = await fetch("/api/uploads/request-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
          });
        }
        if (!response.ok) throw new Error("Failed to get upload URL");
        const { uploadURL, objectPath } = await response.json();
        const uploadResponse = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!uploadResponse.ok) throw new Error("Upload failed");
        newImages.push({ url: objectPath, alt: file.name.split(".")[0], type: "image", category: "exterior" });
      } catch (error) {
        console.error("Gallery upload error:", error);
      }
    }
    if (newImages.length > 0) {
      updateField("gallery", [...(formData.gallery || []), ...newImages]);
      toast({ title: `${newImages.length} תמונות הועלו` });
    }
    setGalleryUploading(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleFloorPlanUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const csrfToken = await getCsrfToken();
      let response = await fetch("/api/r2/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        credentials: "include",
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "floor-plans" }),
      });
      if (response.status === 503) {
        response = await fetch("/api/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
        });
      }
      if (!response.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await response.json();
      const uploadResponse = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!uploadResponse.ok) throw new Error("Upload failed");
      updateFloorPlan(idx, "image", objectPath);
      toast({ title: "תוכנית הקומה הועלתה" });
    } catch (error) {
      toast({ title: "שגיאה בהעלאה", variant: "destructive" });
    }
  };

  const removeGalleryImage = (index: number) => {
    updateField("gallery", formData.gallery?.filter((_, i) => i !== index) || []);
  };

  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    toast({ title: "מנתח ברושור...", description: "Gemini קורא את הקובץ, זה יכול לקחת כמה שניות" });

    const result = await extractFromBrochure(file);
    if (!result) return;

    let fieldsUpdated = 0;
    const fieldMap: Array<[keyof FormDataType, string]> = [
      ["name", "name"], ["nameEn", "nameEn"], ["developer", "developer"],
      ["location", "location"], ["locationEn", "locationEn"],
      ["propertyType", "propertyType"], ["buildingType", "buildingType"],
      ["bedrooms", "bedrooms"], ["priceFrom", "priceFrom"],
      ["priceCurrency", "priceCurrency"], ["roiPercent", "roiPercent"],
      ["completionDate", "completionDate"], ["projectStatus", "projectStatus"],
      ["ownership", "ownership"], ["furnishing", "furnishing"],
      ["numberOfBuildings", "numberOfBuildings"],
      ["description", "description"], ["descriptionEn", "descriptionEn"],
      ["tagline", "tagline"], ["taglineEn", "taglineEn"],
      ["serviceCharge", "serviceCharge"], ["reraNumber", "reraNumber"], ["dldNumber", "dldNumber"],
    ];

    for (const [formField, resultField] of fieldMap) {
      if (result[resultField] != null && result[resultField] !== "") {
        updateField(formField, result[resultField] as never);
        fieldsUpdated++;
      }
    }

    if (Array.isArray(result.units) && result.units.length > 0) {
      updateField("units", result.units as never);
      fieldsUpdated++;
    }
    if (Array.isArray(result.highlights) && result.highlights.length > 0) {
      updateField("highlights", result.highlights as never);
      fieldsUpdated++;
    }
    if (result.specs && typeof result.specs === "object") {
      updateField("specs", result.specs as never);
      fieldsUpdated++;
    }

    toast({ title: `הברושור נותח בהצלחה`, description: `${fieldsUpdated} שדות מולאו אוטומטית` });
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.location) {
      toast({ title: "יש למלא שם ומיקום קודם", variant: "destructive" });
      return;
    }
    const result = await generateDescription({ name: formData.name, developer: formData.developer, location: formData.location, propertyType: formData.propertyType, bedrooms: formData.bedrooms, priceFrom: formData.priceFrom, roiPercent: formData.roiPercent });
    if (result) { updateField("description", result.description); if (result.descriptionEn) updateField("descriptionEn", result.descriptionEn); toast({ title: "התיאור נוצר בהצלחה (עברית + אנגלית)" }); }
  };

  const handleGenerateTagline = async () => {
    if (!formData.name || !formData.location) {
      toast({ title: "יש למלא שם ומיקום קודם", variant: "destructive" });
      return;
    }
    const result = await generateTagline({ name: formData.name, location: formData.location, propertyType: formData.propertyType });
    if (result) { updateField("tagline", result.tagline); if (result.taglineEn) updateField("taglineEn", result.taglineEn); toast({ title: "הטאג-ליין נוצר בהצלחה (עברית + אנגלית)" }); }
  };

  // Highlight helpers
  const addHighlight = () => { updateField("highlights", [...formData.highlights, { icon: "star", title: "", titleHe: "", value: "" }]); };
  const removeHighlight = (i: number) => { updateField("highlights", formData.highlights.filter((_, idx) => idx !== i)); };
  const updateHighlight = (i: number, f: keyof HighlightItem, v: string) => { updateField("highlights", formData.highlights.map((h, idx) => idx === i ? { ...h, [f]: v } : h)); };

  // FAQ helpers
  const addFaq = () => { updateField("faqs", [...formData.faqs, { question: "", answer: "" }]); };
  const removeFaq = (i: number) => { updateField("faqs", formData.faqs.filter((_, idx) => idx !== i)); };
  const updateFaq = (i: number, f: keyof FAQItem, v: string) => { updateField("faqs", formData.faqs.map((fq, idx) => idx === i ? { ...fq, [f]: v } : fq)); };

  // Unit helpers
  const addUnit = () => { updateField("units", [...formData.units, { type: "", typeHe: "", bedrooms: "", sizeFrom: 0, sizeTo: 0, priceFrom: 0, priceTo: 0, floor: "", view: "", status: "available", parking: 0 }]); };
  const removeUnit = (i: number) => { updateField("units", formData.units.filter((_, idx) => idx !== i)); };
  const updateUnit = (i: number, f: keyof UnitItem, v: string | number) => { updateField("units", formData.units.map((u, idx) => idx === i ? { ...u, [f]: v } : u)); };

  // Nearby place helpers
  const addNearbyPlace = () => { updateField("neighborhood", { ...formData.neighborhood, nearbyPlaces: [...formData.neighborhood.nearbyPlaces, { name: "", nameEn: "", distance: "", type: "landmark" }] }); };
  const removeNearbyPlace = (i: number) => { updateField("neighborhood", { ...formData.neighborhood, nearbyPlaces: formData.neighborhood.nearbyPlaces.filter((_: any, idx: number) => idx !== i) }); };
  const updateNearbyPlace = (i: number, f: string, v: string) => { updateField("neighborhood", { ...formData.neighborhood, nearbyPlaces: formData.neighborhood.nearbyPlaces.map((p: any, idx: number) => idx === i ? { ...p, [f]: v } : p) }); };

  // Mapbox geocoding for location
  const { suggestions: mapboxSuggestions, isSearching: isMapboxSearching, search: mapboxSearch, clear: mapboxClear } = useLocationSearch();
  const [showMapboxSuggestions, setShowMapboxSuggestions] = useState(false);
  const [matchedArea, setMatchedArea] = useState("");
  const mapboxSuggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mapboxSuggestionsRef.current && !mapboxSuggestionsRef.current.contains(e.target as Node)) {
        setShowMapboxSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMapboxLocationChange = (value: string) => {
    updateField("locationEn", value);
    mapboxSearch(value);
    setShowMapboxSuggestions(true);
  };

  const handleMapboxSelect = (suggestion: LocationSuggestion) => {
    updateField("locationEn", suggestion.placeName);
    const [lng, lat] = suggestion.center;
    updateField("coordinates", { lat, lng });

    // Try matching area for nearby places
    const areaMatch = getAreaProximity(suggestion.text);
    if (areaMatch) {
      setMatchedArea(areaMatch.area);
      if (!formData.location && areaMatch.areaNameHe) {
        updateField("location", areaMatch.areaNameHe);
      }
      updateField("neighborhood", {
        ...formData.neighborhood,
        nearbyPlaces: areaMatch.landmarks.map((lm: ProximityLandmark) => ({
          name: lm.nameHe || lm.name,
          nameEn: lm.name,
          distance: lm.driveTime || (lm.distance != null ? `${lm.distance} km` : ""),
          type: lm.category || "landmark",
        })),
      });
      toast({ title: `נמצאו ${areaMatch.landmarks.length} מקומות קרובים`, description: `אזור: ${areaMatch.area}` });
    } else {
      setMatchedArea("");
    }

    mapboxClear();
    setShowMapboxSuggestions(false);
    toast({ title: "מיקום נקלט בהצלחה" });
  };

  // Unit type pricing helpers
  const defaultUnitTypes: UnitTypePricingItem[] = [
    { type: "Studio", typeHe: "סטודיו", startingPrice: 0, sizeRange: "" },
    { type: "1BR", typeHe: "חדר אחד", startingPrice: 0, sizeRange: "" },
    { type: "2BR", typeHe: "2 חדרים", startingPrice: 0, sizeRange: "" },
    { type: "3BR", typeHe: "3 חדרים", startingPrice: 0, sizeRange: "" },
    { type: "4BR", typeHe: "4 חדרים", startingPrice: 0, sizeRange: "" },
    { type: "Penthouse", typeHe: "פנטהאוז", startingPrice: 0, sizeRange: "" },
  ];
  const initUnitTypePricing = () => { updateField("unitTypePricing", defaultUnitTypes); };
  const updateUnitTypePricing = (i: number, f: keyof UnitTypePricingItem, v: string | number) => { updateField("unitTypePricing", formData.unitTypePricing.map((utp, idx) => idx === i ? { ...utp, [f]: v } : utp)); };
  const removeUnitTypePricing = (i: number) => { updateField("unitTypePricing", formData.unitTypePricing.filter((_, idx) => idx !== i)); };
  const addUnitTypePricing = () => { updateField("unitTypePricing", [...formData.unitTypePricing, { type: "", typeHe: "", startingPrice: 0, sizeRange: "" }]); };

  // Floor plan helpers
  const addFloorPlan = () => { updateField("floorPlans", [...formData.floorPlans, { name: "", image: "", size: "", bedrooms: "" }]); };
  const removeFloorPlan = (i: number) => { updateField("floorPlans", formData.floorPlans.filter((_, idx) => idx !== i)); };
  const updateFloorPlan = (i: number, f: keyof FloorPlanItem, v: string) => { updateField("floorPlans", formData.floorPlans.map((fp, idx) => idx === i ? { ...fp, [f]: v } : fp)); };

  // Gallery reorder with drag
  const moveGalleryImage = (from: number, to: number) => {
    if (!formData.gallery) return;
    const items = [...formData.gallery];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    updateField("gallery", items);
  };

  // Tab configuration
  const tabConfig = [
    { value: "details", label: "פרטים", icon: Building2 },
    { value: "content", label: "תוכן", icon: FileText },
    { value: "units", label: "יחידות", icon: ListChecks },
    { value: "pricing", label: "מחיר", icon: DollarSign },
    { value: "location", label: "מיקום", icon: MapPin },
    { value: "media", label: "מדיה", icon: Image },
    { value: "extras", label: "מתקדם", icon: Settings2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={guardedClose} />

      {/* Saving overlay */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4"
            >
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
              <p className="text-lg font-bold text-slate-800">שומר שינויים...</p>
              <p className="text-sm text-slate-500">אנא המתן</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-4xl bg-white shadow-2xl flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={guardedClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <ArrowRight className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900">עריכת פרויקט</h2>
              <p className="text-sm text-slate-500">{project.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Preview button */}
            <Button variant="outline" size="sm" onClick={handlePreview} className="gap-1.5 hidden sm:flex">
              <ExternalLink className="h-3.5 w-3.5" />
              תצוגה מקדימה
            </Button>
            {/* Duplicate button */}
            <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={saving} className="gap-1.5 hidden sm:flex">
              <Copy className="h-3.5 w-3.5" />
              שכפול
            </Button>
            <Button variant="outline" onClick={guardedClose}>ביטול</Button>
            <Button onClick={handleSave} disabled={saving || !hasChanges} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : <Save className="h-4 w-4 ms-2" />}
              שמור
            </Button>
          </div>
        </div>

        {/* Unsaved changes bar */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex-shrink-0"
            >
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <AlertCircle className="h-4 w-4" />
                  <span>יש שינויים שלא נשמרו</span>
                </div>
                <Button size="sm" onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 h-7 text-xs px-3">
                  {saving ? <Loader2 className="h-3 w-3 animate-spin ms-1" /> : <Save className="h-3 w-3 ms-1" />}
                  שמור עכשיו
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky tab navigation */}
          <div className="overflow-x-auto border-b bg-white px-4 pt-3 flex-shrink-0 sticky top-0 z-10 shadow-sm" dir="rtl">
            <TabsList className="inline-flex w-auto gap-1 bg-slate-100 rounded-lg p-1" dir="rtl">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                const hasError = tabHasRequiredError[tab.value];
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1.5 text-xs data-[state=active]:bg-white whitespace-nowrap relative"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {hasError && (
                      <span className="absolute -top-1 -start-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 relative" dir="rtl">
            {/* === DETAILS === */}
            <TabsContent value="details" className="mt-0 space-y-6">
              {/* Brochure Magic Upload */}
              <Card className="p-4 border-dashed border-2 border-blue-300 bg-blue-50/50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">מילוי אוטומטי מברושור</p>
                      <p className="text-xs text-slate-500">העלו PDF או תמונה של ברושור - ה-AI ימלא את כל השדות</p>
                    </div>
                  </div>
                  <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${aiLoading ? "bg-slate-100 text-slate-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {aiLoading ? "מנתח..." : "העלאת ברושור"}
                    <input type="file" accept=".pdf,image/*" onChange={handleBrochureUpload} disabled={aiLoading} className="hidden" />
                  </label>
                </div>
              </Card>

              {/* Basic Info Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<Building2 className="h-5 w-5" />}
                  title="פרטי הפרויקט"
                  description="מידע בסיסי אודות הפרויקט"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold"><Req />שם הפרויקט</Label>
                    <Input
                      value={formData.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      onBlur={() => markTouched("name")}
                      placeholder="מגדלי הים התיכון"
                      className={`h-11 ${touchedFields.has("name") && validationErrors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {touchedFields.has("name") && <FieldError message={validationErrors.name} />}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">שם באנגלית</Label>
                    <Input value={formData.nameEn || ""} onChange={(e) => updateField("nameEn", e.target.value)} placeholder="Project Name" className="h-11" dir="ltr" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold"><Req />שם היזם</Label>
                    <Input
                      value={formData.developer || ""}
                      onChange={(e) => updateField("developer", e.target.value)}
                      onBlur={() => markTouched("developer")}
                      placeholder="EMAAR"
                      className={`h-11 ${touchedFields.has("developer") && validationErrors.developer ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {touchedFields.has("developer") && <FieldError message={validationErrors.developer} />}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">לוגו היזם</Label>
                    <div className="flex gap-2">
                      <Input value={formData.developerLogo || ""} onChange={(e) => updateField("developerLogo", e.target.value)} placeholder="הדבק URL או העלה קובץ" className="h-9 flex-1 text-sm" dir="ltr" />
                      <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.onchange = async (ev: any) => { const file = ev.target.files?.[0]; if (!file) return; try { const csrfToken = await getCsrfToken(); let response = await fetch("/api/r2/upload-url", { method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken }, credentials: "include", body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "hero" }) }); if (!response.ok) throw new Error("Failed"); const { uploadURL, objectPath } = await response.json(); const up = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } }); if (!up.ok) throw new Error("Upload failed"); updateField("developerLogo", objectPath); toast({ title: "הלוגו הועלה בהצלחה" }); } catch { toast({ title: "שגיאה בהעלאת הלוגו", variant: "destructive" }); } }; input.click(); }}>
                        <Upload className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {formData.developerLogo && (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                        <img src={formData.developerLogo} alt="לוגו יזם" className="h-10 w-auto object-contain" width={40} height={40} loading="lazy" decoding="async" onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                        <span className="text-xs text-slate-500">תצוגה מקדימה</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Property Type Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<Layers className="h-5 w-5" />}
                  title="סיווג הנכס"
                  description="סוג הנכס, הבניין ומועד המסירה"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">סוג הנכס</Label>
                    <Select value={formData.propertyType || ""} onValueChange={(v) => updateField("propertyType", v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="בחר סוג" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="דירה">דירה</SelectItem>
                        <SelectItem value="סטודיו">סטודיו</SelectItem>
                        <SelectItem value="פנטהאוז">פנטהאוז</SelectItem>
                        <SelectItem value="וילה">וילה</SelectItem>
                        <SelectItem value="טאון האוס">טאון האוס</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">סוג בניין</Label>
                    <Select value={formData.buildingType || ""} onValueChange={(v) => updateField("buildingType", v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="בחר" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tower">מגדל</SelectItem>
                        <SelectItem value="Villa">וילה</SelectItem>
                        <SelectItem value="Townhouse">טאון האוס</SelectItem>
                        <SelectItem value="Low-rise">בנין נמוך</SelectItem>
                        <SelectItem value="Mid-rise">בנין בינוני</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">חדרים</Label>
                    <Input value={formData.bedrooms || ""} onChange={(e) => updateField("bedrooms", e.target.value)} placeholder="1-4" className="h-11" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">מועד מסירה</Label>
                    <Input value={formData.completionDate || ""} onChange={(e) => updateField("completionDate", e.target.value)} placeholder="Q4 2026" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Slug (URL)</Label>
                    <Input value={formData.slug || ""} onChange={(e) => updateField("slug", e.target.value)} placeholder="project-name" className="h-11" dir="ltr" />
                  </div>
                </div>
              </Card>

              {/* Status Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<Eye className="h-5 w-5" />}
                  title="סטטוס והצגה"
                  description="הגדרות פרסום ונראות"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {formData.status === "active" ? <Eye className="h-5 w-5 text-emerald-600" /> : <EyeOff className="h-5 w-5 text-slate-400" />}
                      <div>
                        <p className="font-medium">סטטוס פרסום</p>
                        <p className="text-sm text-slate-500">{formData.status === "active" ? "מפורסם באתר" : "טיוטה - לא מוצג"}</p>
                      </div>
                    </div>
                    <Switch checked={formData.status === "active"} onCheckedChange={(c) => updateField("status", c ? "active" : "draft")} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      <div><p className="font-medium">פרויקט מומלץ</p><p className="text-sm text-slate-500">יוצג בראש הרשימה</p></div>
                    </div>
                    <Switch checked={formData.featured || false} onCheckedChange={(c) => updateField("featured", c)} />
                  </div>
                </div>
              </Card>

              {/* Dubai-Specific Fields Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<Building2 className="h-5 w-5" />}
                  title="Dubai Market Fields"
                  description="RERA, DLD, ownership and project-specific details"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Project Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Project Status</Label>
                    <Select value={formData.projectStatus || "off-plan"} onValueChange={(v) => updateField("projectStatus", v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off-plan">Off-Plan</SelectItem>
                        <SelectItem value="under-construction">Under Construction</SelectItem>
                        <SelectItem value="ready-to-move">Ready to Move</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* RERA Number */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">RERA Number</Label>
                    <Input value={formData.reraNumber || ""} onChange={(e) => updateField("reraNumber", e.target.value)} placeholder="RERA-XXXX-XXXX" className="h-11" dir="ltr" />
                  </div>

                  {/* DLD Number */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">DLD Number</Label>
                    <Input value={formData.dldNumber || ""} onChange={(e) => updateField("dldNumber", e.target.value)} placeholder="DLD-XXXX" className="h-11" dir="ltr" />
                  </div>

                  {/* Ownership */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Ownership</Label>
                    <Select value={formData.ownership || ""} onValueChange={(v) => updateField("ownership", v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freehold">Freehold</SelectItem>
                        <SelectItem value="leasehold">Leasehold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Furnishing */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Furnishing</Label>
                    <Select value={formData.furnishing || ""} onValueChange={(v) => updateField("furnishing", v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="furnished">Furnished</SelectItem>
                        <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                        <SelectItem value="unfurnished">Unfurnished</SelectItem>
                        <SelectItem value="shell-core">Shell & Core</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Service Charge */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Service Charge (AED/sqft/yr)</Label>
                    <Input type="number" step="0.01" value={formData.serviceCharge || ""} onChange={(e) => updateField("serviceCharge", parseFloat(e.target.value) || 0)} placeholder="15.00" className="h-11" />
                  </div>

                  {/* Number of Buildings */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Number of Buildings</Label>
                    <Input type="number" value={formData.numberOfBuildings || ""} onChange={(e) => updateField("numberOfBuildings", parseInt(e.target.value) || 0)} placeholder="1" className="h-11" />
                  </div>

                  {/* Commission % */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Commission %</Label>
                    <Input type="number" step="0.1" value={formData.commissionPercent || ""} onChange={(e) => updateField("commissionPercent", parseFloat(e.target.value) || 0)} placeholder="5" className="h-11" />
                  </div>

                  {/* Launch Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-slate-400" />Launch Date</Label>
                    <Input type="date" value={formData.launchDate || ""} onChange={(e) => updateField("launchDate", e.target.value)} className="h-11" dir="ltr" />
                  </div>
                </div>

                {/* Construction Progress - only visible for off-plan or under-construction */}
                {(formData.projectStatus === "off-plan" || formData.projectStatus === "under-construction") && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Construction Progress</Label>
                      <span className="text-sm font-bold text-emerald-600">{formData.constructionProgress || 0}%</span>
                    </div>
                    <Input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={formData.constructionProgress || 0}
                      onChange={(e) => updateField("constructionProgress", parseInt(e.target.value) || 0)}
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                  </div>
                )}


                {/* Tags */}
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2"><Tag className="h-3.5 w-3.5 text-slate-400" />Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.tags || []).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
                        {tag}
                        <button onClick={() => updateField("tags", formData.tags.filter((_, i) => i !== idx))} className="hover:text-red-500 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {["Waterfront", "Branded Residence", "Golf Course", "Beachfront", "Luxury", "Investment", "Family", "Smart Home", "Sustainable", "Sky Collection"].filter(t => !(formData.tags || []).includes(t)).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => updateField("tags", [...(formData.tags || []), tag])}
                        className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="Type custom tag and press Enter..."
                    className="h-9 text-sm mt-2"
                    dir="ltr"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !(formData.tags || []).includes(val)) {
                          updateField("tags", [...(formData.tags || []), val]);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* === CONTENT (Description, Highlights, Amenities, FAQs) === */}
            <TabsContent value="content" className="mt-0 space-y-6">
              {/* Descriptions */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<FileText className="h-5 w-5" />}
                  title="תיאור הפרויקט"
                  description="תיאור שיווקי שיוצג בדף הפרויקט"
                />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">תיאור (עברית)</Label>
                      <Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={aiLoading} className="gap-2">
                        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        יצירה עם AI
                      </Button>
                    </div>
                    <Textarea value={formData.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="ספר על הפרויקט..." className="min-h-[150px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">תיאור באנגלית</Label>
                    <Textarea value={formData.descriptionEn || ""} onChange={(e) => updateField("descriptionEn", e.target.value)} placeholder="Project description..." className="min-h-[100px]" dir="ltr" />
                  </div>
                </div>
              </Card>

              {/* Highlights */}
              <Card className="p-4 md:p-6 border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-amber-500"><Sparkles className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">נקודות מפתח (Highlights)</h3>
                      <p className="text-sm text-slate-500 mt-0.5">מוצגים באזור &quot;אודות&quot; בדף הפרויקט</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={addHighlight}><Plus className="h-4 w-4 ms-1" />הוסף</Button>
                </div>
                {formData.highlights.map((h, idx) => (
                  <Card key={idx} className="p-3 mb-2 bg-slate-50 border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div><Label className="text-xs">אייקון</Label><Input value={h.icon} onChange={(e) => updateHighlight(idx, "icon", e.target.value)} placeholder="star" className="h-9 text-sm" dir="ltr" /></div>
                        <div><Label className="text-xs">כותרת</Label><Input value={h.title} onChange={(e) => updateHighlight(idx, "title", e.target.value)} placeholder="קומות" className="h-9 text-sm" /></div>
                        <div><Label className="text-xs">ערך</Label><Input value={h.value} onChange={(e) => updateHighlight(idx, "value", e.target.value)} placeholder="40" className="h-9 text-sm" /></div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-9 w-9 mt-5" onClick={() => removeHighlight(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </Card>
                ))}
                {formData.highlights.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">לחץ &quot;הוסף&quot; ליצירת נקודות מפתח</p>
                  </div>
                )}
              </Card>

              {/* Amenities */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  title="מתקנים ושירותים"
                  description="סמן את המתקנים הזמינים בפרויקט"
                />
                <AmenitiesEditor
                  selectedIds={selectedAmenityIds}
                  onChange={(ids) => {
                    setSelectedAmenityIds(ids);
                    setHasChanges(true);
                  }}
                  dir="rtl"
                />
              </Card>

              {/* FAQs */}
              <Card className="p-4 md:p-6 border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-blue-500"><HelpCircle className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">שאלות נפוצות (FAQ)</h3>
                      <p className="text-sm text-slate-500 mt-0.5">מוצגים בתחתית דף הפרויקט</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={addFaq}><Plus className="h-4 w-4 ms-1" />הוסף שאלה</Button>
                </div>
                {formData.faqs.map((faq, idx) => (
                  <Card key={idx} className="p-3 mb-2 space-y-2 bg-slate-50 border-slate-200">
                    <div className="flex items-start justify-between">
                      <Label className="text-xs text-slate-500 font-medium">שאלה {idx + 1}</Label>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFaq(idx)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                    </div>
                    <Input value={faq.question} onChange={(e) => updateFaq(idx, "question", e.target.value)} placeholder="מהי תוכנית התשלום?" className="h-9 text-sm" />
                    <Textarea value={faq.answer} onChange={(e) => updateFaq(idx, "answer", e.target.value)} placeholder="התשובה..." className="min-h-[60px] text-sm" />
                  </Card>
                ))}
                {formData.faqs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">לחץ &quot;הוסף שאלה&quot; ליצירת שאלות נפוצות</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* === UNITS === */}
            <TabsContent value="units" className="mt-0 space-y-6">
              {/* Unit Type Pricing Summary */}
              <Card className="p-4 md:p-6 border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-emerald-500"><BarChart3 className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">סיכום מחירים לפי סוג</h3>
                      <p className="text-sm text-slate-500 mt-0.5">מחיר התחלתי וטווח גדלים לכל סוג יחידה</p>
                    </div>
                  </div>
                  {formData.unitTypePricing.length === 0 ? (
                    <Button variant="outline" onClick={initUnitTypePricing}><Plus className="h-4 w-4 ms-1" />אתחל סוגי יחידות</Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={addUnitTypePricing}><Plus className="h-4 w-4 ms-1" />הוסף סוג</Button>
                  )}
                </div>
                {formData.unitTypePricing.length > 0 && (
                  <div className="space-y-2">
                    {formData.unitTypePricing.map((utp, idx) => (
                      <Card key={idx} className="p-3 bg-slate-50 border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-xs">סוג (עברית)</Label>
                              <Input value={utp.typeHe} onChange={(e) => updateUnitTypePricing(idx, "typeHe", e.target.value)} placeholder="סטודיו" className="h-9 text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs">Type (EN)</Label>
                              <Input value={utp.type} onChange={(e) => updateUnitTypePricing(idx, "type", e.target.value)} placeholder="Studio" className="h-9 text-sm" dir="ltr" />
                            </div>
                            <div>
                              <Label className="text-xs">מחיר התחלתי</Label>
                              <Input type="number" value={utp.startingPrice || ""} onChange={(e) => updateUnitTypePricing(idx, "startingPrice", parseInt(e.target.value) || 0)} placeholder="500000" className="h-9 text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs">טווח גדלים</Label>
                              <Input value={utp.sizeRange} onChange={(e) => updateUnitTypePricing(idx, "sizeRange", e.target.value)} placeholder="45-65 sqm" className="h-9 text-sm" dir="ltr" />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-9 w-9 mt-5" onClick={() => removeUnitTypePricing(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                {formData.unitTypePricing.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">לחץ &quot;אתחל סוגי יחידות&quot; ליצירת סיכום מחירים</p>
                  </div>
                )}
              </Card>

              {/* Individual Units */}
              <Card className="p-4 md:p-6 border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-blue-500"><ListChecks className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">יחידות פרטניות</h3>
                      <p className="text-sm text-slate-500 mt-0.5">סוגי הדירות, גדלים ומחירים</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={addUnit}><Plus className="h-4 w-4 ms-1" />הוסף יחידה</Button>
                </div>
                {formData.units.map((unit, idx) => (
                  <Card key={idx} className="p-4 mb-3 bg-slate-50 border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                        יחידה {unit.typeHe || unit.type || `#${idx + 1}`}
                      </h4>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeUnit(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div><Label className="text-xs">סוג (עברית)</Label><Input value={unit.typeHe} onChange={(e) => updateUnit(idx, "typeHe", e.target.value)} placeholder="דירה" className="h-9 text-sm" /></div>
                      <div><Label className="text-xs">Type (EN)</Label><Input value={unit.type} onChange={(e) => updateUnit(idx, "type", e.target.value)} placeholder="Apartment" className="h-9 text-sm" dir="ltr" /></div>
                      <div><Label className="text-xs">חדרי שינה</Label>
                        <Select value={unit.bedrooms} onValueChange={(v) => updateUnit(idx, "bedrooms", v)}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="בחר" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">סטודיו</SelectItem><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem><SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-xs">סטטוס</Label>
                        <Select value={unit.status || "available"} onValueChange={(v) => updateUnit(idx, "status", v)}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">זמין</SelectItem><SelectItem value="sold">נמכר</SelectItem><SelectItem value="reserved">שמור</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-xs">גודל מ- (מ&quot;ר)</Label><Input type="number" value={unit.sizeFrom || ""} onChange={(e) => updateUnit(idx, "sizeFrom", parseInt(e.target.value) || 0)} className="h-9 text-sm" /></div>
                      <div>
                        <Label className="text-xs">גודל עד</Label>
                        <Input type="number" value={unit.sizeTo || ""} onChange={(e) => updateUnit(idx, "sizeTo", parseInt(e.target.value) || 0)} className={`h-9 text-sm ${unit.sizeFrom && unit.sizeTo && unit.sizeFrom > unit.sizeTo ? "border-red-400" : ""}`} />
                        {unit.sizeFrom > 0 && unit.sizeTo > 0 && unit.sizeFrom > unit.sizeTo && (
                          <p className="text-xs text-red-500 mt-0.5">גודל מ- גדול מגודל עד</p>
                        )}
                      </div>
                      <div><Label className="text-xs">מחיר מ-</Label><Input type="number" value={unit.priceFrom || ""} onChange={(e) => updateUnit(idx, "priceFrom", parseInt(e.target.value) || 0)} className="h-9 text-sm" /></div>
                      <div>
                        <Label className="text-xs">מחיר עד</Label>
                        <Input type="number" value={unit.priceTo || ""} onChange={(e) => updateUnit(idx, "priceTo", parseInt(e.target.value) || 0)} className={`h-9 text-sm ${unit.priceFrom && unit.priceTo && unit.priceFrom > unit.priceTo ? "border-red-400" : ""}`} />
                        {unit.priceFrom > 0 && unit.priceTo > 0 && unit.priceFrom > unit.priceTo && (
                          <p className="text-xs text-red-500 mt-0.5">מחיר מ- גבוה ממחיר עד</p>
                        )}
                      </div>
                      <div><Label className="text-xs">קומה</Label><Input value={unit.floor || ""} onChange={(e) => updateUnit(idx, "floor", e.target.value)} placeholder="1-40" className="h-9 text-sm" /></div>
                      <div><Label className="text-xs">נוף (View)</Label>
                        <Select value={unit.view || ""} onValueChange={(v) => updateUnit(idx, "view", v)}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="בחר נוף" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sea">Sea View</SelectItem>
                            <SelectItem value="marina">Marina View</SelectItem>
                            <SelectItem value="city">City View</SelectItem>
                            <SelectItem value="garden">Garden View</SelectItem>
                            <SelectItem value="pool">Pool View</SelectItem>
                            <SelectItem value="canal">Canal View</SelectItem>
                            <SelectItem value="golf">Golf View</SelectItem>
                            <SelectItem value="landmark">Landmark View</SelectItem>
                            <SelectItem value="boulevard">Boulevard View</SelectItem>
                            <SelectItem value="community">Community View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-xs flex items-center gap-1"><Car className="h-3 w-3" />חניה</Label><Input type="number" min={0} value={unit.parking || ""} onChange={(e) => updateUnit(idx, "parking", parseInt(e.target.value) || 0)} placeholder="0" className="h-9 text-sm" /></div>
                    </div>
                  </Card>
                ))}
                {formData.units.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <ListChecks className="h-10 w-10 mx-auto mb-3 opacity-50" /><p>לחץ &quot;הוסף יחידה&quot; להגדרת סוגי הדירות</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* === PRICING === */}
            <TabsContent value="pricing" className="mt-0 space-y-6">
              {/* Main Pricing Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<DollarSign className="h-5 w-5" />}
                  title="מחירים ותשלום"
                  description="מחיר התחלתי, מטבע ותשואה"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">מחיר התחלתי</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute end-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input type="number" value={formData.priceFrom || ""} onChange={(e) => updateField("priceFrom", parseInt(e.target.value) || 0)} className="h-11 pe-10" />
                      </div>
                      <Select value={formData.priceCurrency || "AED"} onValueChange={(v) => updateField("priceCurrency", v)}>
                        <SelectTrigger className="w-24 h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AED">AED</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="ILS">ILS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">תשואה שנתית (%)</Label>
                      <Switch checked={!!formData.roiPercent && formData.roiPercent > 0} onCheckedChange={(c) => updateField("roiPercent", c ? 8 : 0)} />
                    </div>
                    {formData.roiPercent && formData.roiPercent > 0 ? (
                      <Input type="number" step="0.1" value={formData.roiPercent || ""} onChange={(e) => updateField("roiPercent", parseFloat(e.target.value) || 0)} className="h-11" />
                    ) : <p className="text-sm text-slate-400 italic py-3">התשואה לא תוצג</p>}
                  </div>
                </div>
              </Card>

              {/* Taglines Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<Sparkles className="h-5 w-5" />}
                  title="טאג-ליין"
                  description="כותרת שיווקית קצרה"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">טאג-ליין (עברית)</Label>
                      <Button variant="outline" size="sm" onClick={handleGenerateTagline} disabled={aiLoading} className="gap-2">
                        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}AI
                      </Button>
                    </div>
                    <Input value={formData.tagline || ""} onChange={(e) => updateField("tagline", e.target.value)} placeholder="יוקרה על קו המים" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Tagline (EN)</Label>
                    <Input value={formData.taglineEn || ""} onChange={(e) => updateField("taglineEn", e.target.value)} placeholder="Luxury on the waterfront" className="h-11" dir="ltr" />
                  </div>
                </div>
              </Card>

              {/* Payment Plan Card - Legacy Text */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<FileText className="h-5 w-5" />}
                  title="תכנית תשלום (טקסט)"
                  description="תיאור חופשי - ישמש רק אם אין תוכניות מובנות למטה"
                />
                <Textarea value={formData.paymentPlanText || ""} onChange={(e) => updateField("paymentPlanText", e.target.value)} placeholder="20% במעמד החתימה, 40% במהלך הבנייה..." className="min-h-[80px]" />
              </Card>

              {/* Dynamic Payment Plans Builder */}
              <Card className="p-4 md:p-6 border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-emerald-500"><CreditCard className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Payment Plans (Structured)</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Dynamic milestones with post-handover support</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Template buttons */}
                    <Select onValueChange={(tpl) => {
                      const templates: Record<string, PaymentPlanData> = {
                        "60-40": { name: "60/40 Plan", isPostHandover: false, milestones: [
                          { title: "On Booking", titleHe: "בהזמנה", percentage: 20 },
                          { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 40 },
                          { title: "On Handover", titleHe: "במסירה", percentage: 40 },
                        ]},
                        "80-20": { name: "80/20 Plan", isPostHandover: true, milestones: [
                          { title: "On Booking", titleHe: "בהזמנה", percentage: 10 },
                          { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 70 },
                          { title: "On Handover", titleHe: "במסירה", percentage: 10 },
                          { title: "Post-Handover (12 months)", titleHe: "אחרי מסירה (12 חודשים)", percentage: 10, isPostHandover: true },
                        ]},
                        "50-50": { name: "50/50 Plan", isPostHandover: false, milestones: [
                          { title: "On Booking", titleHe: "בהזמנה", percentage: 10 },
                          { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 40 },
                          { title: "On Handover", titleHe: "במסירה", percentage: 50 },
                        ]},
                        "post-handover": { name: "Post-Handover Plan", isPostHandover: true, milestones: [
                          { title: "On Booking", titleHe: "בהזמנה", percentage: 10 },
                          { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 30 },
                          { title: "On Handover", titleHe: "במסירה", percentage: 20 },
                          { title: "Post-Handover (24 months)", titleHe: "אחרי מסירה (24 חודשים)", percentage: 20, isPostHandover: true },
                          { title: "Post-Handover (48 months)", titleHe: "אחרי מסירה (48 חודשים)", percentage: 20, isPostHandover: true },
                        ]},
                      };
                      const plan = templates[tpl];
                      if (plan) {
                        updateField("paymentPlans", [...formData.paymentPlans, plan]);
                      }
                    }}>
                      <SelectTrigger className="h-9 w-40 text-xs"><SelectValue placeholder="Use Template" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60-40">60/40 Plan</SelectItem>
                        <SelectItem value="80-20">80/20 Plan</SelectItem>
                        <SelectItem value="50-50">50/50 Plan</SelectItem>
                        <SelectItem value="post-handover">Post-Handover</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => {
                      updateField("paymentPlans", [...formData.paymentPlans, {
                        name: "",
                        isPostHandover: false,
                        milestones: [{ title: "", titleHe: "", percentage: 0 }],
                      }]);
                    }}>
                      <Plus className="h-4 w-4 ms-1" />Add Plan
                    </Button>
                  </div>
                </div>

                {formData.paymentPlans.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Use a template or add a custom payment plan</p>
                  </div>
                )}

                {formData.paymentPlans.map((plan, planIdx) => {
                  const totalPct = plan.milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);
                  return (
                    <Card key={planIdx} className="p-4 mb-4 bg-slate-50 border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge variant="outline" className="text-xs">Plan {planIdx + 1}</Badge>
                          <Input
                            value={plan.name}
                            onChange={(e) => {
                              const plans = [...formData.paymentPlans];
                              plans[planIdx] = { ...plans[planIdx], name: e.target.value };
                              updateField("paymentPlans", plans);
                            }}
                            placeholder="Plan name (e.g. 60/40 Plan)"
                            className="h-9 text-sm max-w-xs"
                            dir="ltr"
                          />
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">Post-Handover</Label>
                            <Switch
                              checked={plan.isPostHandover}
                              onCheckedChange={(c) => {
                                const plans = [...formData.paymentPlans];
                                plans[planIdx] = { ...plans[planIdx], isPostHandover: c };
                                updateField("paymentPlans", plans);
                              }}
                            />
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                          updateField("paymentPlans", formData.paymentPlans.filter((_, i) => i !== planIdx));
                        }}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      {/* Milestones - 3 fields: שלב, אחוז, תאריך */}
                      <div className="space-y-2">
                        {plan.milestones.map((ms, msIdx) => (
                          <div key={msIdx} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                              <Input
                                value={ms.titleHe || ms.title || ""}
                                onChange={(e) => {
                                  const plans = [...formData.paymentPlans];
                                  const milestones = [...plans[planIdx].milestones];
                                  milestones[msIdx] = { ...milestones[msIdx], titleHe: e.target.value, title: e.target.value };
                                  plans[planIdx] = { ...plans[planIdx], milestones };
                                  updateField("paymentPlans", plans);
                                }}
                                placeholder="שלב (לדוגמה: בהזמנה)"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <div className="relative">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={ms.percentage || ""}
                                  onChange={(e) => {
                                    const plans = [...formData.paymentPlans];
                                    const milestones = [...plans[planIdx].milestones];
                                    milestones[msIdx] = { ...milestones[msIdx], percentage: parseInt(e.target.value) || 0 };
                                    plans[planIdx] = { ...plans[planIdx], milestones };
                                    updateField("paymentPlans", plans);
                                  }}
                                  placeholder="%"
                                  className="h-8 text-xs pe-7"
                                />
                                <span className="absolute start-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
                              </div>
                            </div>
                            <div className="col-span-4">
                              <Input
                                value={ms.dueDate || ""}
                                onChange={(e) => {
                                  const plans = [...formData.paymentPlans];
                                  const milestones = [...plans[planIdx].milestones];
                                  milestones[msIdx] = { ...milestones[msIdx], dueDate: e.target.value };
                                  plans[planIdx] = { ...plans[planIdx], milestones };
                                  updateField("paymentPlans", plans);
                                }}
                                placeholder="תאריך / הערה (אופציונלי)"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="col-span-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                const plans = [...formData.paymentPlans];
                                const milestones = plans[planIdx].milestones.filter((_, i) => i !== msIdx);
                                plans[planIdx] = { ...plans[planIdx], milestones };
                                updateField("paymentPlans", plans);
                              }}>
                                <X className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add milestone + total */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                        <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => {
                          const plans = [...formData.paymentPlans];
                          const milestones = [...plans[planIdx].milestones, { title: "", titleHe: "", percentage: 0 }];
                          plans[planIdx] = { ...plans[planIdx], milestones };
                          updateField("paymentPlans", plans);
                        }}>
                          <Plus className="h-3 w-3" />Add Milestone
                        </Button>
                        <div className={`text-sm font-bold ${totalPct === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                          Total: {totalPct}%{totalPct !== 100 && " (should be 100%)"}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </Card>

            </TabsContent>

            {/* === LOCATION (Search, Neighborhood, Nearby) === */}
            <TabsContent value="location" className="mt-0 space-y-6">

              {/* Location Search with Mapbox */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<MapPin className="h-5 w-5" />}
                  title="חפש מיקום"
                  description="הקלד שם אזור באנגלית — המפה ומקומות קרובים יתמלאו אוטומטית"
                />
                <div className="space-y-4">
                  <div className="space-y-2 relative" ref={mapboxSuggestionsRef}>
                    <div className="relative">
                      <Input
                        value={formData.locationEn || ""}
                        onChange={(e) => handleMapboxLocationChange(e.target.value)}
                        onFocus={() => mapboxSuggestions.length > 0 && setShowMapboxSuggestions(true)}
                        placeholder='לדוגמה: Meydan, Palm Jumeirah, Business Bay...'
                        className="h-14 text-lg pe-10"
                        dir="ltr"
                      />
                      {isMapboxSearching && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                      )}
                    </div>
                    <AnimatePresence>
                      {showMapboxSuggestions && mapboxSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
                        >
                          {mapboxSuggestions.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleMapboxSelect(s)}
                              className="w-full text-start px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
                                <p className="text-sm font-medium text-slate-900 truncate">{s.placeName}</p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {formData.coordinates?.lat && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-700 font-medium">מיקום נקלט — המפה תוצג אוטומטית בעמוד הפרויקט</span>
                        {matchedArea && (
                          <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 border-green-300">
                            אזור: {matchedArea}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold"><Req />שם מיקום בעברית</Label>
                    <Input
                      value={formData.location || ""}
                      onChange={(e) => updateField("location", e.target.value)}
                      onBlur={() => markTouched("location")}
                      placeholder="מתמלא אוטומטית או הקלד ידנית"
                      className={`h-11 ${touchedFields.has("location") && validationErrors.location ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {touchedFields.has("location") && <FieldError message={validationErrors.location} />}
                  </div>
                </div>
              </Card>

              {/* Neighborhood Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<Building2 className="h-5 w-5" />}
                  title="תיאור השכונה"
                  description="מידע על האזור והסביבה"
                />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">תיאור (עברית)</Label>
                    <Textarea value={formData.neighborhood.description || ""} onChange={(e) => updateField("neighborhood", { ...formData.neighborhood, description: e.target.value })} placeholder="תאר את השכונה..." className="min-h-[80px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Neighborhood (EN)</Label>
                    <Textarea value={formData.neighborhood.descriptionEn || ""} onChange={(e) => updateField("neighborhood", { ...formData.neighborhood, descriptionEn: e.target.value })} placeholder="Describe the neighborhood..." className="min-h-[60px]" dir="ltr" />
                  </div>
                </div>
              </Card>

              {/* Nearby Places Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-emerald-500"><MapPin className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">מקומות קרובים</h3>
                      <p className="text-sm text-slate-500 mt-0.5">נקודות עניין בסביבת הפרויקט</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={addNearbyPlace}><Plus className="h-4 w-4 ms-1" />הוסף מקום</Button>
                </div>
                {formData.neighborhood.nearbyPlaces.map((place, idx) => (
                  <Card key={idx} className="p-3 mb-2 bg-slate-50 border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><Label className="text-xs">שם</Label><Input value={place.name} onChange={(e) => updateNearbyPlace(idx, "name", e.target.value)} placeholder="קניון" className="h-9 text-sm" /></div>
                        <div><Label className="text-xs">Name (EN)</Label><Input value={place.nameEn || ""} onChange={(e) => updateNearbyPlace(idx, "nameEn", e.target.value)} placeholder="Mall" className="h-9 text-sm" dir="ltr" /></div>
                        <div><Label className="text-xs">מרחק</Label><Input value={place.distance} onChange={(e) => updateNearbyPlace(idx, "distance", e.target.value)} placeholder="5 min" className="h-9 text-sm" /></div>
                        <div><Label className="text-xs">סוג</Label>
                          <Select value={place.type} onValueChange={(v) => updateNearbyPlace(idx, "type", v)}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="landmark">ציון דרך</SelectItem><SelectItem value="transport">תחבורה</SelectItem>
                              <SelectItem value="shopping">קניות</SelectItem><SelectItem value="education">חינוך</SelectItem>
                              <SelectItem value="medical">רפואי</SelectItem><SelectItem value="beach">חוף</SelectItem>
                              <SelectItem value="restaurant">מסעדה</SelectItem><SelectItem value="park">פארק</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-9 w-9 mt-5" onClick={() => removeNearbyPlace(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </Card>
                ))}
                {formData.neighborhood.nearbyPlaces.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">לחץ &quot;הוסף מקום&quot; להוספת מקומות קרובים</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* === MEDIA (Hero, Gallery, Brochure, Video, Floor Plans) === */}
            <TabsContent value="media" className="mt-0 space-y-6">
              {/* Hero Image Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<Image className="h-5 w-5" />}
                  title="תמונה ראשית"
                  description="התמונה הראשית שמוצגת בכרטיס הפרויקט"
                />
                {formData.imageUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border bg-slate-100">
                    <img src={formData.imageUrl} alt="תמונה ראשית" className="w-full h-full object-cover" />
                    <button onClick={() => updateField("imageUrl", "")} className="absolute top-3 start-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3">
                    {isUploading ? (<><Loader2 className="h-10 w-10 text-blue-500 animate-spin" /><span className="text-blue-600 font-medium">{progress}%</span></>) : (<><Upload className="h-10 w-10 text-slate-400" /><span className="text-slate-600 font-medium">לחץ להעלאת תמונה</span></>)}
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-slate-400 whitespace-nowrap">או הדבק קישור:</span>
                  <Input value={formData.imageUrl || ""} onChange={(e) => updateField("imageUrl", e.target.value)} placeholder="https://..." className="text-sm h-8 flex-1" dir="ltr" />
                </div>
              </Card>

              {/* Gallery Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-purple-500"><Image className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">גלריה</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{formData.gallery?.length || 0} תמונות</p>
                    </div>
                  </div>
                </div>

                {/* Drag hint */}
                {(formData.gallery?.length || 0) > 1 && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 bg-slate-50 rounded-lg px-3 py-2">
                    <GripVertical className="h-3.5 w-3.5" />
                    <span>ניתן לשנות סדר התמונות באמצעות כפתורי החצים</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Gallery Grid - Larger previews */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.gallery?.map((img, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border bg-slate-50">
                        {/* Large preview */}
                        <div className="aspect-[4/3] overflow-hidden">
                          <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 end-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {index > 0 && (
                            <button onClick={() => moveGalleryImage(index, index - 1)} className="p-1.5 bg-white/90 rounded-md hover:bg-white shadow-sm text-slate-700" title="הזז למעלה">
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {index < (formData.gallery?.length || 1) - 1 && (
                            <button onClick={() => moveGalleryImage(index, index + 1)} className="p-1.5 bg-white/90 rounded-md hover:bg-white shadow-sm text-slate-700" title="הזז למטה">
                              <ChevronUp className="h-3.5 w-3.5 rotate-180" />
                            </button>
                          )}
                          <button onClick={() => removeGalleryImage(index)} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {/* Bottom info */}
                        <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2">
                            <Select value={img.category || "exterior"} onValueChange={(v) => {
                              const updated = [...(formData.gallery || [])];
                              updated[index] = { ...updated[index], category: v as GalleryCategory };
                              updateField("gallery", updated);
                            }}>
                              <SelectTrigger className="h-7 text-xs w-28 bg-white/90 border-0"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="exterior">חיצוני</SelectItem>
                                <SelectItem value="interior">פנימי</SelectItem>
                                <SelectItem value="amenities">מתקנים</SelectItem>
                                <SelectItem value="views">נוף</SelectItem>
                              </SelectContent>
                            </Select>
                            <Badge variant="secondary" className="text-[10px] bg-white/90">{index + 1}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload area */}
                  <button onClick={() => galleryInputRef.current?.click()} disabled={galleryUploading} className="w-full h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                    {galleryUploading ? <Loader2 className="h-6 w-6 text-blue-500 animate-spin" /> : <><Plus className="h-5 w-5 text-slate-400" /><span className="text-sm text-slate-500">הוסף תמונות לגלריה</span></>}
                  </button>
                </div>
                <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="או הדבק URL של תמונה..."
                    dir="ltr"
                    className="text-sm h-9 flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && (val.startsWith("http://") || val.startsWith("https://"))) {
                          updateField("gallery", [...(formData.gallery || []), { url: val, alt: "", type: "image" as const, category: "exterior" as const }]);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                </div>
              </Card>

              {/* Brochure & Video Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<Download className="h-5 w-5" />}
                  title="קבצים וקישורים"
                  description="ברושור, סרטון ומסמכים"
                />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2"><Download className="h-3.5 w-3.5 text-amber-500" />ברושור (PDF)</Label>
                    <div className="flex gap-2">
                      <Input value={formData.brochureUrl || ""} onChange={(e) => updateField("brochureUrl", e.target.value)} placeholder="הדבק קישור PDF" className="h-9 flex-1 text-sm" dir="ltr" />
                      <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept=".pdf,application/pdf"; input.onchange = async (ev: any) => { const file = ev.target.files?.[0]; if (!file) return; try { const csrfToken = await getCsrfToken(); let response = await fetch("/api/r2/upload-url", { method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken }, credentials: "include", body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "documents" }) }); if (!response.ok) throw new Error("Failed"); const { uploadURL, objectPath } = await response.json(); const up = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } }); if (!up.ok) throw new Error("Upload failed"); updateField("brochureUrl", objectPath); toast({ title: "הברושור הועלה בהצלחה" }); } catch { toast({ title: "שגיאה בהעלאה", variant: "destructive" }); } }; input.click(); }}>
                        <Upload className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">העלה קובץ PDF או הדבק קישור</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2"><Video className="h-3.5 w-3.5 text-purple-500" />סרטון</Label>
                    <Input value={formData.videoUrl || ""} onChange={(e) => updateField("videoUrl", e.target.value)} placeholder="הדבק קישור YouTube / Vimeo" className="h-9 text-sm" dir="ltr" />
                    <p className="text-xs text-slate-400">הדבק קישור לסרטון מ-YouTube או Vimeo</p>
                  </div>
                </div>
              </Card>

              {/* Floor Plans Card */}
              <Card className="p-4 md:p-6 border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-blue-500"><Layers className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">תוכניות קומה</h3>
                      <p className="text-sm text-slate-500 mt-0.5">תוכניות דירות בפרויקט</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={addFloorPlan}><Plus className="h-4 w-4 ms-1" />הוסף תוכנית</Button>
                </div>
                {formData.floorPlans.map((fp, idx) => (
                  <Card key={idx} className="p-3 mb-3 bg-slate-50 border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><Label className="text-xs">שם</Label><Input value={fp.name} onChange={(e) => updateFloorPlan(idx, "name", e.target.value)} placeholder="דירת 2 חדרים" className="h-9 text-sm" /></div>
                        <div><Label className="text-xs">גודל</Label><Input value={fp.size || ""} onChange={(e) => updateFloorPlan(idx, "size", e.target.value)} placeholder="85 sqm" className="h-9 text-sm" /></div>
                        <div><Label className="text-xs">חדרי שינה</Label><Input value={fp.bedrooms || ""} onChange={(e) => updateFloorPlan(idx, "bedrooms", e.target.value)} placeholder="2" className="h-9 text-sm" /></div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">תמונה</Label>
                          <div className="flex gap-2">
                            <Input value={fp.image} onChange={(e) => updateFloorPlan(idx, "image", e.target.value)} placeholder="https://... או העלה קובץ" className="h-9 text-sm flex-1" dir="ltr" />
                            <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.onchange = (ev) => handleFloorPlanUpload(idx, ev as any); input.click(); }}>
                              <Upload className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {fp.image && <div className="mt-2 aspect-video max-w-sm rounded-lg overflow-hidden border"><img src={fp.image} alt={fp.name} className="w-full h-full object-contain bg-slate-50" /></div>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-9 w-9 mt-5" onClick={() => removeFloorPlan(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </Card>
                ))}
                {formData.floorPlans.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">לחץ &quot;הוסף תוכנית&quot; להוספת תוכניות קומה</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* === EXTRAS (Investment Metrics, Specs, SEO, Highlights, FAQs) === */}
            <TabsContent value="extras" className="mt-0 space-y-6">
              {/* Building Specs */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<Building2 className="h-5 w-5" />}
                  title="מפרט הבניין"
                  description="נתונים טכניים של הבניין"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-xs">סה&quot;כ קומות</Label>
                    <Input type="number" value={formData.specs.totalFloors || ""} onChange={(e) => updateField("specs", { ...formData.specs, totalFloors: parseInt(e.target.value) || 0 })} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1"><Label className="text-xs">סה&quot;כ יחידות</Label>
                    <Input type="number" value={formData.specs.totalUnits || ""} onChange={(e) => updateField("specs", { ...formData.specs, totalUnits: parseInt(e.target.value) || 0 })} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1"><Label className="text-xs">מקומות חניה</Label>
                    <Input type="number" value={formData.specs.totalParkingSpaces || ""} onChange={(e) => updateField("specs", { ...formData.specs, totalParkingSpaces: parseInt(e.target.value) || 0 })} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1"><Label className="text-xs">גובה הבניין</Label>
                    <Input value={formData.specs.buildingHeight || ""} onChange={(e) => updateField("specs", { ...formData.specs, buildingHeight: e.target.value })} placeholder="120m" className="h-9 text-sm" />
                  </div>
                  <div className="md:col-span-2 space-y-1"><Label className="text-xs">סגנון אדריכלי</Label>
                    <Input value={formData.specs.architecturalStyle || ""} onChange={(e) => updateField("specs", { ...formData.specs, architecturalStyle: e.target.value })} placeholder="מודרני, אר-דקו..." className="h-9 text-sm" />
                  </div>
                </div>
              </Card>

              {/* SEO */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<Globe className="h-5 w-5" />}
                  title="SEO"
                  description="הגדרות קידום אתרים"
                />
                <div className="space-y-3">
                  <div className="space-y-1"><Label className="text-xs">Meta Title (כותרת SEO)</Label>
                    <Input value={formData.seo.title || ""} onChange={(e) => updateField("seo", { ...formData.seo, title: e.target.value })} placeholder={'שם הפרויקט - נדל"ן בדובאי'} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Meta Description (תיאור SEO)</Label>
                    <Textarea value={formData.seo.description || ""} onChange={(e) => updateField("seo", { ...formData.seo, description: e.target.value })} placeholder="עד 160 תווים..." className="min-h-[60px] text-sm" />
                  </div>
                  <div className="space-y-1"><Label className="text-xs">OG Image</Label>
                    <div className="flex gap-2">
                      <Input value={formData.seo.ogImage || ""} onChange={(e) => updateField("seo", { ...formData.seo, ogImage: e.target.value })} placeholder="URL או העלה תמונה" className="h-9 text-sm flex-1" dir="ltr" />
                      <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => {
                        const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
                        input.onchange = async (ev: any) => { const file = ev.target.files?.[0]; if (!file) return; try {
                          const csrfToken = await getCsrfToken();
                          const response = await fetch("/api/r2/upload-url", { method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken }, credentials: "include", body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "site" }) });
                          if (!response.ok) throw new Error("Failed"); const { uploadURL, objectPath } = await response.json();
                          const up = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
                          if (!up.ok) throw new Error("Upload failed"); updateField("seo", { ...formData.seo, ogImage: objectPath }); toast({ title: "התמונה הועלתה" });
                        } catch { toast({ title: "שגיאה בהעלאה", variant: "destructive" }); } }; input.click();
                      }}><Upload className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Highlights (free text fallback) */}
              <Card className="p-4 md:p-6 border-slate-200">
                <SectionHeader
                  icon={<FileText className="h-5 w-5" />}
                  title="נקודות מפתח (טקסט חופשי)"
                  description="שורה לכל נקודה. ישמש רק אם אין highlights מובנים"
                />
                <Textarea value={formData.highlightsText || ""} onChange={(e) => updateField("highlightsText", e.target.value)} placeholder={"40 קומות\n500 יחידות\nמסירה 2026"} className="min-h-[80px]" />
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Floating save button - visible on scroll */}
        <AnimatePresence>
          {hasChanges && showScrollTop && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 start-6 z-20"
            >
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-xl rounded-full h-14 w-14 p-0"
                title="שמור שינויים"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ProjectEditView;
