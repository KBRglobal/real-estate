import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Loader2,
  Upload,
  Plus,
  Trash2,
  Building2,
  MapPin,
  DollarSign,
  Image,
  Eye,
  EyeOff,
  Sparkles,
  Wand2,
  FileText,
  ListChecks,
  Settings2,
  Globe,
  Video,
  Download,
  HelpCircle,
  BarChart3,
  Layers,
  Tag,
  Car,
  CreditCard,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Save,
  Search,
  Navigation,
} from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { useAIAssist } from "@/hooks/use-ai-assist";
import { csrfFetch } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import {
  type FormDataType,
  type OriginalProjectData,
  type HighlightItem,
  type FAQItem,
  type UnitItem,
  type FloorPlanItem,
  type UnitTypePricingItem,
  type PaymentPlanData,
  type PaymentMilestone,
  emptyFormData,
} from "./projects/types";
import {
  projectToFormData,
  formDataToProject,
  formatPrice,
} from "./projects/utils";
import { AmenitiesEditor, schemaToAmenityIds, amenityIdsToSchema } from "@/components/admin/AmenitiesEditor";
import { useLocationSearch, type LocationSuggestion } from "@/hooks/use-mapbox-geocoding";
import { getAreaProximity, type ProximityLandmark } from "@/lib/dubai-proximity-data";

// ===========================================
// TYPES
// ===========================================

interface ProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: Project | null;
  onCreateProject: (data: Partial<Project>) => Promise<string | void>;
  onUpdateProject: (id: string, data: Partial<Project>) => Promise<void>;
}

interface StepProps {
  formData: FormDataType;
  updateField: (field: keyof FormDataType, value: any) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  aiAvailable?: boolean;
  selectedAmenityIds?: string[];
  setSelectedAmenityIds?: (ids: string[]) => void;
}

// AI Assist Button Component
function AIAssistButton({
  onClick,
  loading,
  disabled,
  tooltip,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  tooltip: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              loading
                ? "bg-purple-100 text-purple-400 cursor-wait"
                : disabled
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-sm hover:shadow"
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            AI
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ===========================================
// STEP DEFINITIONS
// ===========================================

const STEPS = [
  { id: 1, title: "פרטי פרויקט", subtitle: "שם, יזם, סוג ומאפייני דובאי", icon: Building2 },
  { id: 2, title: "מיקום ומפה", subtitle: "מיקום, שכונה ומקומות קרובים", icon: MapPin },
  { id: 3, title: "תוכן ותיאור", subtitle: "תיאורים, highlights, מתקנים ושאלות", icon: FileText },
  { id: 4, title: "מחיר ותשלום", subtitle: "תמחור ותכניות תשלום", icon: DollarSign },
  { id: 5, title: "יחידות", subtitle: "סוגי דירות, גדלים ומחירים", icon: ListChecks },
  { id: 6, title: "מדיה", subtitle: "תמונות, גלריה, תוכניות וקבצים", icon: Image },
  { id: 7, title: "מתקדם", subtitle: "מפרט, SEO ותגיות", icon: Settings2 },
  { id: 8, title: "סיכום ופרסום", subtitle: "בדיקה אחרונה לפני פרסום", icon: Eye },
];

// ===========================================
// STEP 1: Project Details (Enhanced)
// ===========================================

function Step1_ProjectDetails({ formData, updateField, errors, setErrors }: StepProps) {
  const validateOnBlur = (field: string, value: string, minLength: number = 2) => {
    if (!value || value.trim().length < minLength) {
      setErrors(prev => ({ ...prev, [field]: `נדרשים לפחות ${minLength} תווים` }));
    } else {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">שם הפרויקט *</Label>
          <Input
            value={formData.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            onBlur={(e) => validateOnBlur("name", e.target.value)}
            placeholder="לדוגמה: מגדלי הים התיכון"
            className={`h-12 text-lg ${errors.name ? "border-red-300 focus:border-red-500" : ""}`}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-base font-medium text-slate-600">Name (English)</Label>
          <Input
            value={formData.nameEn || ""}
            onChange={(e) => updateField("nameEn", e.target.value)}
            placeholder="Project Name"
            className="h-12 text-lg"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">שם היזם *</Label>
          <Input
            value={formData.developer || ""}
            onChange={(e) => updateField("developer", e.target.value)}
            onBlur={(e) => validateOnBlur("developer", e.target.value)}
            placeholder="לדוגמה: EMAAR"
            className={`h-12 text-lg ${errors.developer ? "border-red-300 focus:border-red-500" : ""}`}
          />
          {errors.developer && <p className="text-sm text-red-500">{errors.developer}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-base font-medium">לוגו היזם</Label>
          <Input
            value={formData.developerLogo || ""}
            onChange={(e) => updateField("developerLogo", e.target.value)}
            placeholder="הדבק URL של לוגו"
            className="h-12"
            dir="ltr"
          />
        </div>
      </div>

      {/* Property Type & Building */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">סוג הנכס *</Label>
          <Select dir="rtl" value={formData.propertyType || ""} onValueChange={(value) => updateField("propertyType", value)}>
            <SelectTrigger className={`h-12 text-lg ${errors.propertyType ? "border-red-300" : ""}`}>
              <SelectValue placeholder="בחר סוג נכס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="דירה">דירה</SelectItem>
              <SelectItem value="סטודיו">סטודיו</SelectItem>
              <SelectItem value="פנטהאוז">פנטהאוז</SelectItem>
              <SelectItem value="וילה">וילה</SelectItem>
              <SelectItem value="טאון האוס">טאון האוס</SelectItem>
            </SelectContent>
          </Select>
          {errors.propertyType && <p className="text-sm text-red-500">{errors.propertyType}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-base font-medium">סוג בניין</Label>
          <Select value={formData.buildingType || ""} onValueChange={(v) => updateField("buildingType", v)}>
            <SelectTrigger className="h-12"><SelectValue placeholder="בחר" /></SelectTrigger>
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
          <Label className="text-base font-medium">מספר חדרים</Label>
          <Input value={formData.bedrooms || ""} onChange={(e) => updateField("bedrooms", e.target.value)} placeholder="1-4 או סטודיו" className="h-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Slug (URL)</Label>
          <Input value={formData.slug || ""} onChange={(e) => updateField("slug", e.target.value)} placeholder="project-name" className="h-10" dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">מועד מסירה</Label>
          <Input value={formData.completionDate || ""} onChange={(e) => updateField("completionDate", e.target.value)} placeholder="Q4 2026" className="h-10" />
        </div>
      </div>

      {/* Dubai Market Section */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Dubai Market Fields
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Project Status</Label>
            <Select value={formData.projectStatus || "off-plan"} onValueChange={(v) => updateField("projectStatus", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off-plan">Off-Plan</SelectItem>
                <SelectItem value="under-construction">Under Construction</SelectItem>
                <SelectItem value="ready-to-move">Ready to Move</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">RERA Number</Label>
            <Input value={formData.reraNumber || ""} onChange={(e) => updateField("reraNumber", e.target.value)} placeholder="RERA-XXXX" className="h-9 text-sm" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">DLD Number</Label>
            <Input value={formData.dldNumber || ""} onChange={(e) => updateField("dldNumber", e.target.value)} placeholder="DLD-XXXX" className="h-9 text-sm" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Ownership</Label>
            <Select value={formData.ownership || ""} onValueChange={(v) => updateField("ownership", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="freehold">Freehold</SelectItem>
                <SelectItem value="leasehold">Leasehold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Furnishing</Label>
            <Select value={formData.furnishing || ""} onValueChange={(v) => updateField("furnishing", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="furnished">Furnished</SelectItem>
                <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                <SelectItem value="unfurnished">Unfurnished</SelectItem>
                <SelectItem value="shell-core">Shell & Core</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Service Charge (AED/sqft/yr)</Label>
            <Input type="number" step="0.01" value={formData.serviceCharge || ""} onChange={(e) => updateField("serviceCharge", parseFloat(e.target.value) || 0)} placeholder="15" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Number of Buildings</Label>
            <Input type="number" value={formData.numberOfBuildings || ""} onChange={(e) => updateField("numberOfBuildings", parseInt(e.target.value) || 0)} placeholder="1" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Commission %</Label>
            <Input type="number" step="0.1" value={formData.commissionPercent || ""} onChange={(e) => updateField("commissionPercent", parseFloat(e.target.value) || 0)} placeholder="5" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />Launch Date</Label>
            <Input type="date" value={formData.launchDate || ""} onChange={(e) => updateField("launchDate", e.target.value)} className="h-9 text-sm" dir="ltr" />
          </div>
        </div>
        {(formData.projectStatus === "off-plan" || formData.projectStatus === "under-construction") && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Construction Progress</Label>
              <span className="text-xs font-bold text-emerald-600">{formData.constructionProgress || 0}%</span>
            </div>
            <Input type="range" min={0} max={100} step={1} value={formData.constructionProgress || 0} onChange={(e) => updateField("constructionProgress", parseInt(e.target.value) || 0)} className="w-full accent-emerald-600" />
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// STEP 2: Location & Map (Enhanced)
// ===========================================

function Step2_Location({ formData, updateField, errors, setErrors, aiAvailable }: StepProps) {
  const { toast } = useToast();
  const { translate, isLoading } = useAIAssist({
    onError: (error) => { toast({ title: "שגיאה ב-AI", description: error.message, variant: "destructive" }); },
  });
  const { suggestions, isSearching, search, clear } = useLocationSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchedArea, setMatchedArea] = useState<string>("");
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateOnBlur = (field: string, value: string, minLength: number = 2) => {
    if (!value || value.trim().length < minLength) {
      setErrors(prev => ({ ...prev, [field]: `נדרשים לפחות ${minLength} תווים` }));
    } else {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleTranslateLocation = async () => {
    if (!formData.location) return;
    const result = await translate(formData.location, "he-to-en");
    if (result) { updateField("locationEn", result.translation); toast({ title: "התרגום הושלם" }); }
  };

  // Handle location input with Mapbox search
  const handleLocationEnChange = (value: string) => {
    updateField("locationEn", value);
    search(value);
    setShowSuggestions(true);
  };

  // Handle selecting a location suggestion
  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
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
      const landmarks = areaMatch.landmarks;
      updateField("neighborhood", {
        ...formData.neighborhood,
        nearbyPlaces: landmarks.map((lm: ProximityLandmark) => ({
          name: lm.nameHe || lm.name,
          nameEn: lm.name,
          distance: lm.driveTime || (lm.distance != null ? `${lm.distance} km` : ""),
          type: lm.category || "landmark",
        })),
      });
      toast({ title: `נמצאו ${landmarks.length} מקומות קרובים`, description: `אזור: ${areaMatch.area}` });
    } else {
      setMatchedArea("");
    }

    clear();
    setShowSuggestions(false);
    toast({ title: "מיקום נקלט בהצלחה" });
  };

  const addNearbyPlace = () => {
    updateField("neighborhood", {
      ...formData.neighborhood,
      nearbyPlaces: [...formData.neighborhood.nearbyPlaces, { name: "", nameEn: "", distance: "", type: "landmark" }],
    });
  };
  const removeNearbyPlace = (i: number) => {
    updateField("neighborhood", {
      ...formData.neighborhood,
      nearbyPlaces: formData.neighborhood.nearbyPlaces.filter((_: any, idx: number) => idx !== i),
    });
  };
  const updateNearbyPlace = (i: number, f: string, v: string) => {
    updateField("neighborhood", {
      ...formData.neighborhood,
      nearbyPlaces: formData.neighborhood.nearbyPlaces.map((p: any, idx: number) => idx === i ? { ...p, [f]: v } : p),
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Location Search */}
      <div className="space-y-2 relative" ref={suggestionsRef}>
        <Label className="text-base font-medium flex items-center gap-2">
          <Search className="h-4 w-4 text-blue-500" />
          חפש מיקום *
        </Label>
        <p className="text-xs text-slate-500">הקלד שם אזור באנגלית, למשל: Meydan, Dubai Marina, Business Bay</p>
        <div className="relative">
          <Input
            value={formData.locationEn || ""}
            onChange={(e) => handleLocationEnChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder='לדוגמה: Meydan Dubai, Palm Jumeirah...'
            className="h-14 text-lg pe-10"
            dir="ltr"
          />
          {isSearching && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
          )}
        </div>

        {/* Mapbox Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
            >
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
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

        {/* Success confirmation */}
        {formData.coordinates?.lat && (
          <div className="flex flex-wrap items-center gap-3 mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700 font-medium">מיקום נקלט בהצלחה — המפה תוצג אוטומטית בעמוד הפרויקט</span>
            {matchedArea && (
              <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 border-green-300">
                אזור: {matchedArea}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Hebrew location name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">שם מיקום בעברית *</Label>
          {aiAvailable && formData.locationEn && !formData.location && (
            <AIAssistButton onClick={handleTranslateLocation} loading={isLoading} tooltip="תרגם לעברית" />
          )}
        </div>
        <Input
          value={formData.location || ""}
          onChange={(e) => updateField("location", e.target.value)}
          onBlur={(e) => validateOnBlur("location", e.target.value)}
          placeholder="מתמלא אוטומטית או הקלד ידנית"
          className={`h-12 text-lg ${errors.location ? "border-red-300" : ""}`}
        />
        {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
        <p className="text-xs text-slate-400">מתמלא אוטומטית כשהאזור מזוהה. ניתן לערוך ידנית.</p>
      </div>


      {/* Neighborhood */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-slate-700 mb-3">תיאור השכונה</h4>
        <div className="space-y-3">
          <Textarea value={formData.neighborhood.description || ""} onChange={(e) => updateField("neighborhood", { ...formData.neighborhood, description: e.target.value })} placeholder="תאר את השכונה..." className="min-h-[60px]" />
          <Textarea value={formData.neighborhood.descriptionEn || ""} onChange={(e) => updateField("neighborhood", { ...formData.neighborhood, descriptionEn: e.target.value })} placeholder="Neighborhood description (EN)..." className="min-h-[50px]" dir="ltr" />
        </div>
      </div>

      {/* Nearby Places (auto-populated from proximity data) */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> מקומות קרובים
            {formData.neighborhood.nearbyPlaces.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{formData.neighborhood.nearbyPlaces.length}</Badge>
            )}
          </h4>
          <Button variant="outline" size="sm" onClick={addNearbyPlace}><Plus className="h-3.5 w-3.5 ms-1" />הוסף ידני</Button>
        </div>
        {formData.neighborhood.nearbyPlaces.map((place: any, idx: number) => (
          <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
            <div className="col-span-3"><Label className="text-xs">שם</Label><Input value={place.name} onChange={(e) => updateNearbyPlace(idx, "name", e.target.value)} placeholder="קניון" className="h-8 text-xs" /></div>
            <div className="col-span-3"><Label className="text-xs">Name (EN)</Label><Input value={place.nameEn || ""} onChange={(e) => updateNearbyPlace(idx, "nameEn", e.target.value)} placeholder="Mall" className="h-8 text-xs" dir="ltr" /></div>
            <div className="col-span-2"><Label className="text-xs">מרחק</Label><Input value={place.distance} onChange={(e) => updateNearbyPlace(idx, "distance", e.target.value)} placeholder="5 min" className="h-8 text-xs" /></div>
            <div className="col-span-3"><Label className="text-xs">סוג</Label>
              <Select value={place.type} onValueChange={(v) => updateNearbyPlace(idx, "type", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="landmark">ציון דרך</SelectItem>
                  <SelectItem value="transport">תחבורה</SelectItem>
                  <SelectItem value="shopping">קניות</SelectItem>
                  <SelectItem value="education">חינוך</SelectItem>
                  <SelectItem value="medical">רפואי</SelectItem>
                  <SelectItem value="beach">חוף</SelectItem>
                  <SelectItem value="restaurant">מסעדה</SelectItem>
                  <SelectItem value="park">פארק</SelectItem>
                  <SelectItem value="mall">קניון</SelectItem>
                  <SelectItem value="airport">שדה תעופה</SelectItem>
                  <SelectItem value="entertainment">בילוי</SelectItem>
                  <SelectItem value="business">עסקים</SelectItem>
                  <SelectItem value="leisure">פנאי</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeNearbyPlace(idx)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button></div>
          </div>
        ))}
        {formData.neighborhood.nearbyPlaces.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed rounded-lg bg-blue-50/30">
            <Navigation className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <p className="text-sm text-slate-500 font-medium">הקלד מיקום בשדה Location (English) למעלה</p>
            <p className="text-xs text-slate-400 mt-1">המקומות הקרובים יאוכלסו אוטומטית מתוך 75 אזורים בדובאי</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// STEP 3: Content & Description (NEW)
// ===========================================

function Step3_Content({ formData, updateField, aiAvailable, selectedAmenityIds, setSelectedAmenityIds }: StepProps) {
  const { toast } = useToast();
  const { generateDescription, generateTagline, translate, isLoading } = useAIAssist({
    onError: (error) => { toast({ title: "שגיאה ב-AI", description: error.message, variant: "destructive" }); },
  });

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.location) {
      toast({ title: "יש למלא שם ומיקום קודם", variant: "destructive" });
      return;
    }
    const result = await generateDescription({ name: formData.name, developer: formData.developer, location: formData.location, propertyType: formData.propertyType, bedrooms: formData.bedrooms, priceFrom: formData.priceFrom, roiPercent: formData.roiPercent });
    if (result) { updateField("description", result.description); if (result.descriptionEn) updateField("descriptionEn", result.descriptionEn); toast({ title: "התיאור נוצר (עברית + אנגלית)" }); }
  };

  const handleGenerateTagline = async () => {
    if (!formData.name || !formData.location) return;
    const result = await generateTagline({ name: formData.name, location: formData.location, propertyType: formData.propertyType });
    if (result) { updateField("tagline", result.tagline); if (result.taglineEn) updateField("taglineEn", result.taglineEn); toast({ title: "הטאג-ליין נוצר (עברית + אנגלית)" }); }
  };

  // Highlight helpers
  const addHighlight = () => { updateField("highlights", [...formData.highlights, { icon: "star", title: "", titleHe: "", value: "" }]); };
  const removeHighlight = (i: number) => { updateField("highlights", formData.highlights.filter((_, idx) => idx !== i)); };
  const updateHighlight = (i: number, f: keyof HighlightItem, v: string) => { updateField("highlights", formData.highlights.map((h, idx) => idx === i ? { ...h, [f]: v } : h)); };

  // FAQ helpers
  const addFaq = () => { updateField("faqs", [...formData.faqs, { question: "", answer: "" }]); };
  const removeFaq = (i: number) => { updateField("faqs", formData.faqs.filter((_, idx) => idx !== i)); };
  const updateFaq = (i: number, f: keyof FAQItem, v: string) => { updateField("faqs", formData.faqs.map((fq, idx) => idx === i ? { ...fq, [f]: v } : fq)); };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">תיאור הפרויקט</Label>
          {aiAvailable && (
            <AIAssistButton onClick={handleGenerateDescription} loading={isLoading} disabled={!formData.name || !formData.location} tooltip="צור תיאור שיווקי" />
          )}
        </div>
        <Textarea value={formData.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="ספר על הפרויקט..." className="min-h-[100px]" />
        <div className="space-y-1">
          <Label className="text-sm text-slate-600">Description (English)</Label>
          <Textarea value={formData.descriptionEn || ""} onChange={(e) => updateField("descriptionEn", e.target.value)} placeholder="Project description..." className="min-h-[70px]" dir="ltr" />
        </div>
      </div>

      {/* Tagline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">טאג-ליין</Label>
            {aiAvailable && <AIAssistButton onClick={handleGenerateTagline} loading={isLoading} disabled={!formData.name || !formData.location} tooltip="צור טאג-ליין" />}
          </div>
          <Input value={formData.tagline || ""} onChange={(e) => updateField("tagline", e.target.value)} placeholder="יוקרה על קו המים" className="h-10" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-600">Tagline (EN)</Label>
          <Input value={formData.taglineEn || ""} onChange={(e) => updateField("taglineEn", e.target.value)} placeholder="Luxury on the waterfront" className="h-10" dir="ltr" />
        </div>
      </div>

      {/* Highlights */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" /> נקודות מפתח (Highlights)</h4>
          <Button variant="outline" size="sm" onClick={addHighlight}><Plus className="h-3.5 w-3.5 ms-1" />הוסף</Button>
        </div>
        {formData.highlights.map((h, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
            <div className="col-span-2"><Label className="text-xs">אייקון</Label><Input value={h.icon} onChange={(e) => updateHighlight(idx, "icon", e.target.value)} placeholder="star" className="h-8 text-xs" dir="ltr" /></div>
            <div className="col-span-4"><Label className="text-xs">כותרת</Label><Input value={h.title} onChange={(e) => updateHighlight(idx, "title", e.target.value)} placeholder="קומות" className="h-8 text-xs" /></div>
            <div className="col-span-4"><Label className="text-xs">ערך</Label><Input value={h.value} onChange={(e) => updateHighlight(idx, "value", e.target.value)} placeholder="40" className="h-8 text-xs" /></div>
            <div className="col-span-2"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeHighlight(idx)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button></div>
          </div>
        ))}
        {formData.highlights.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4 border-2 border-dashed rounded-lg">לחץ "הוסף" ליצירת נקודות מפתח</p>
        )}
      </div>

      {/* Amenities */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> מתקנים ושירותים</h4>
        <AmenitiesEditor
          selectedIds={selectedAmenityIds || []}
          onChange={(ids) => {
            setSelectedAmenityIds?.(ids);
            // Clear amenitiesText so formDataToProject won't create bad data from raw IDs
            updateField("amenitiesText", "");
          }}
          dir="rtl"
        />
      </div>

      {/* FAQs */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><HelpCircle className="h-4 w-4 text-blue-500" /> שאלות נפוצות</h4>
          <Button variant="outline" size="sm" onClick={addFaq}><Plus className="h-3.5 w-3.5 ms-1" />הוסף שאלה</Button>
        </div>
        {formData.faqs.map((faq, idx) => (
          <Card key={idx} className="p-3 mb-2 bg-slate-50">
            <div className="flex items-start justify-between mb-2">
              <Label className="text-xs text-slate-500">שאלה {idx + 1}</Label>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFaq(idx)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
            </div>
            <Input value={faq.question} onChange={(e) => updateFaq(idx, "question", e.target.value)} placeholder="מהי תוכנית התשלום?" className="h-8 text-sm mb-2" />
            <Textarea value={faq.answer} onChange={(e) => updateFaq(idx, "answer", e.target.value)} placeholder="התשובה..." className="min-h-[50px] text-sm" />
          </Card>
        ))}
        {formData.faqs.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4 border-2 border-dashed rounded-lg">לחץ "הוסף שאלה" ליצירת שאלות נפוצות</p>
        )}
      </div>
    </div>
  );
}

// ===========================================
// STEP 4: Pricing & Payment (Enhanced)
// ===========================================

function Step4_Pricing({ formData, updateField, aiAvailable }: StepProps) {
  const { toast } = useToast();
  const { generatePaymentPlan, isLoading } = useAIAssist({
    onError: (error) => { toast({ title: "שגיאה ב-AI", description: error.message, variant: "destructive" }); },
  });

  const handleGeneratePaymentPlan = async () => {
    const result = await generatePaymentPlan({ developer: formData.developer, projectName: formData.name, priceFrom: formData.priceFrom });
    if (result) { updateField("paymentPlanText", result.planText); toast({ title: "תכנית התשלום נוצרה" }); }
  };

  // Unit type pricing helpers
  const defaultUnitTypes: UnitTypePricingItem[] = [
    { type: "Studio", typeHe: "סטודיו", startingPrice: 0, sizeRange: "" },
    { type: "1BR", typeHe: "חדר אחד", startingPrice: 0, sizeRange: "" },
    { type: "2BR", typeHe: "2 חדרים", startingPrice: 0, sizeRange: "" },
    { type: "3BR", typeHe: "3 חדרים", startingPrice: 0, sizeRange: "" },
  ];

  // Payment plan templates
  const paymentPlanTemplates: Record<string, PaymentPlanData> = {
    "60-40": { name: "60/40 Plan", isPostHandover: false, milestones: [
      { title: "On Booking", titleHe: "בהזמנה", percentage: 20 },
      { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 40 },
      { title: "On Handover", titleHe: "במסירה", percentage: 40 },
    ]},
    "80-20": { name: "80/20 Plan", isPostHandover: true, milestones: [
      { title: "On Booking", titleHe: "בהזמנה", percentage: 10 },
      { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 70 },
      { title: "On Handover", titleHe: "במסירה", percentage: 10 },
      { title: "Post-Handover (12 months)", titleHe: "אחרי מסירה", percentage: 10, isPostHandover: true },
    ]},
    "50-50": { name: "50/50 Plan", isPostHandover: false, milestones: [
      { title: "On Booking", titleHe: "בהזמנה", percentage: 10 },
      { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 40 },
      { title: "On Handover", titleHe: "במסירה", percentage: 50 },
    ]},
  };

  return (
    <div className="space-y-6">
      {/* Main Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">מחיר התחלתי</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute end-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input type="number" value={formData.priceFrom || ""} onChange={(e) => updateField("priceFrom", parseInt(e.target.value) || 0)} placeholder="1,500,000" className="h-12 pe-10" />
            </div>
            <Select dir="rtl" value={formData.priceCurrency || "AED"} onValueChange={(value) => updateField("priceCurrency", value)}>
              <SelectTrigger className="w-24 h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AED">AED</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">תשואה שנתית (%)</Label>
            <Switch checked={!!formData.roiPercent && formData.roiPercent > 0} onCheckedChange={(c) => updateField("roiPercent", c ? 8 : 0)} />
          </div>
          {formData.roiPercent && formData.roiPercent > 0 ? (
            <Input type="number" step="0.1" value={formData.roiPercent || ""} onChange={(e) => updateField("roiPercent", parseFloat(e.target.value) || 0)} placeholder="8.5" className="h-12" />
          ) : (
            <p className="text-sm text-slate-400 italic py-3">התשואה לא תוצג</p>
          )}
        </div>
      </div>

      {/* Payment Plan Text */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">תכנית תשלום (טקסט חופשי)</Label>
          {aiAvailable && <AIAssistButton onClick={handleGeneratePaymentPlan} loading={isLoading} tooltip="צור תכנית תשלום" />}
        </div>
        <Textarea value={formData.paymentPlanText || ""} onChange={(e) => updateField("paymentPlanText", e.target.value)} placeholder="20% במעמד החתימה..." className="min-h-[60px] text-sm" />
      </div>

      {/* Structured Payment Plans */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-500" /> Payment Plans (Structured)</h4>
          <div className="flex gap-2">
            <Select onValueChange={(tpl) => {
              const plan = paymentPlanTemplates[tpl];
              if (plan) updateField("paymentPlans", [...formData.paymentPlans, plan]);
            }}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="60-40">60/40</SelectItem>
                <SelectItem value="80-20">80/20</SelectItem>
                <SelectItem value="50-50">50/50</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
              updateField("paymentPlans", [...formData.paymentPlans, { name: "", isPostHandover: false, milestones: [{ title: "", titleHe: "", percentage: 0 }] }]);
            }}>
              <Plus className="h-3.5 w-3.5 ms-1" />Add Plan
            </Button>
          </div>
        </div>
        {formData.paymentPlans.map((plan, planIdx) => {
          const totalPct = plan.milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);
          return (
            <Card key={planIdx} className="p-3 mb-3 bg-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">Plan {planIdx + 1}</Badge>
                <Input value={plan.name} onChange={(e) => {
                  const plans = [...formData.paymentPlans];
                  plans[planIdx] = { ...plans[planIdx], name: e.target.value };
                  updateField("paymentPlans", plans);
                }} placeholder="Plan name" className="h-7 text-xs flex-1" dir="ltr" />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateField("paymentPlans", formData.paymentPlans.filter((_, i) => i !== planIdx))}>
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
              {plan.milestones.map((ms, msIdx) => (
                <div key={msIdx} className="grid grid-cols-12 gap-1 mb-1 items-center">
                  <div className="col-span-4"><Input value={ms.title} onChange={(e) => {
                    const plans = [...formData.paymentPlans];
                    const milestones = [...plans[planIdx].milestones];
                    milestones[msIdx] = { ...milestones[msIdx], title: e.target.value };
                    plans[planIdx] = { ...plans[planIdx], milestones };
                    updateField("paymentPlans", plans);
                  }} placeholder="Milestone" className="h-7 text-xs" dir="ltr" /></div>
                  <div className="col-span-4"><Input value={ms.titleHe || ""} onChange={(e) => {
                    const plans = [...formData.paymentPlans];
                    const milestones = [...plans[planIdx].milestones];
                    milestones[msIdx] = { ...milestones[msIdx], titleHe: e.target.value };
                    plans[planIdx] = { ...plans[planIdx], milestones };
                    updateField("paymentPlans", plans);
                  }} placeholder="כותרת" className="h-7 text-xs" /></div>
                  <div className="col-span-2"><Input type="number" min={0} max={100} value={ms.percentage || ""} onChange={(e) => {
                    const plans = [...formData.paymentPlans];
                    const milestones = [...plans[planIdx].milestones];
                    milestones[msIdx] = { ...milestones[msIdx], percentage: parseInt(e.target.value) || 0 };
                    plans[planIdx] = { ...plans[planIdx], milestones };
                    updateField("paymentPlans", plans);
                  }} placeholder="%" className="h-7 text-xs" /></div>
                  <div className="col-span-2 flex gap-1">
                    <button onClick={() => {
                      const plans = [...formData.paymentPlans];
                      const milestones = [...plans[planIdx].milestones];
                      milestones[msIdx] = { ...milestones[msIdx], isPostHandover: !milestones[msIdx].isPostHandover };
                      plans[planIdx] = { ...plans[planIdx], milestones };
                      updateField("paymentPlans", plans);
                    }} className={`text-[9px] px-1 py-0.5 rounded border ${ms.isPostHandover ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-400"}`}>PH</button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                      const plans = [...formData.paymentPlans];
                      plans[planIdx] = { ...plans[planIdx], milestones: plans[planIdx].milestones.filter((_, i) => i !== msIdx) };
                      updateField("paymentPlans", plans);
                    }}><X className="h-3 w-3 text-red-400" /></Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between mt-2 pt-2 border-t">
                <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => {
                  const plans = [...formData.paymentPlans];
                  plans[planIdx] = { ...plans[planIdx], milestones: [...plans[planIdx].milestones, { title: "", titleHe: "", percentage: 0 }] };
                  updateField("paymentPlans", plans);
                }}><Plus className="h-3 w-3 ms-1" />Milestone</Button>
                <span className={`text-xs font-bold ${totalPct === 100 ? "text-emerald-600" : "text-amber-600"}`}>{totalPct}%{totalPct !== 100 && " (100% needed)"}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Unit Type Pricing */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> סיכום מחירים לפי סוג</h4>
          {formData.unitTypePricing.length === 0 ? (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => updateField("unitTypePricing", defaultUnitTypes)}><Plus className="h-3.5 w-3.5 ms-1" />אתחל</Button>
          ) : (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => updateField("unitTypePricing", [...formData.unitTypePricing, { type: "", typeHe: "", startingPrice: 0, sizeRange: "" }])}><Plus className="h-3.5 w-3.5 ms-1" />הוסף</Button>
          )}
        </div>
        {formData.unitTypePricing.map((utp, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
            <div className="col-span-3"><Label className="text-xs">סוג</Label><Input value={utp.typeHe} onChange={(e) => {
              const arr = [...formData.unitTypePricing]; arr[idx] = { ...arr[idx], typeHe: e.target.value }; updateField("unitTypePricing", arr);
            }} placeholder="סטודיו" className="h-8 text-xs" /></div>
            <div className="col-span-3"><Label className="text-xs">Type</Label><Input value={utp.type} onChange={(e) => {
              const arr = [...formData.unitTypePricing]; arr[idx] = { ...arr[idx], type: e.target.value }; updateField("unitTypePricing", arr);
            }} placeholder="Studio" className="h-8 text-xs" dir="ltr" /></div>
            <div className="col-span-3"><Label className="text-xs">מחיר מ-</Label><Input type="number" value={utp.startingPrice || ""} onChange={(e) => {
              const arr = [...formData.unitTypePricing]; arr[idx] = { ...arr[idx], startingPrice: parseInt(e.target.value) || 0 }; updateField("unitTypePricing", arr);
            }} className="h-8 text-xs" /></div>
            <div className="col-span-2"><Label className="text-xs">גדלים</Label><Input value={utp.sizeRange} onChange={(e) => {
              const arr = [...formData.unitTypePricing]; arr[idx] = { ...arr[idx], sizeRange: e.target.value }; updateField("unitTypePricing", arr);
            }} placeholder="45-65" className="h-8 text-xs" /></div>
            <div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateField("unitTypePricing", formData.unitTypePricing.filter((_, i) => i !== idx))}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button></div>
          </div>
        ))}
      </div>

    </div>
  );
}

// ===========================================
// STEP 5: Units (NEW)
// ===========================================

function Step5_Units({ formData, updateField }: StepProps) {
  const addUnit = () => { updateField("units", [...formData.units, { type: "", typeHe: "", bedrooms: "", sizeFrom: 0, sizeTo: 0, priceFrom: 0, priceTo: 0, floor: "", view: "", status: "available", parking: 0 }]); };
  const removeUnit = (i: number) => { updateField("units", formData.units.filter((_, idx) => idx !== i)); };
  const updateUnit = (i: number, f: keyof UnitItem, v: string | number) => { updateField("units", formData.units.map((u, idx) => idx === i ? { ...u, [f]: v } : u)); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2"><ListChecks className="h-5 w-5 text-blue-500" /> יחידות ({formData.units.length})</h4>
        <Button variant="outline" onClick={addUnit}><Plus className="h-4 w-4 ms-1" />הוסף יחידה</Button>
      </div>

      {formData.units.map((unit, idx) => (
        <Card key={idx} className="p-3 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-sm flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
              {unit.typeHe || unit.type || `יחידה #${idx + 1}`}
            </h5>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeUnit(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div><Label className="text-xs">סוג (עברית)</Label><Input value={unit.typeHe} onChange={(e) => updateUnit(idx, "typeHe", e.target.value)} placeholder="דירה" className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Type (EN)</Label><Input value={unit.type} onChange={(e) => updateUnit(idx, "type", e.target.value)} placeholder="Apartment" className="h-8 text-xs" dir="ltr" /></div>
            <div><Label className="text-xs">חדרי שינה</Label>
              <Select value={unit.bedrooms} onValueChange={(v) => updateUnit(idx, "bedrooms", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="בחר" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">סטודיו</SelectItem><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem><SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">סטטוס</Label>
              <Select value={unit.status || "available"} onValueChange={(v) => updateUnit(idx, "status", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">זמין</SelectItem><SelectItem value="sold">נמכר</SelectItem><SelectItem value="reserved">שמור</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">גודל מ- (מ"ר)</Label><Input type="number" value={unit.sizeFrom || ""} onChange={(e) => updateUnit(idx, "sizeFrom", parseInt(e.target.value) || 0)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">גודל עד</Label><Input type="number" value={unit.sizeTo || ""} onChange={(e) => updateUnit(idx, "sizeTo", parseInt(e.target.value) || 0)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">מחיר מ-</Label><Input type="number" value={unit.priceFrom || ""} onChange={(e) => updateUnit(idx, "priceFrom", parseInt(e.target.value) || 0)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">מחיר עד</Label><Input type="number" value={unit.priceTo || ""} onChange={(e) => updateUnit(idx, "priceTo", parseInt(e.target.value) || 0)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">קומה</Label><Input value={unit.floor || ""} onChange={(e) => updateUnit(idx, "floor", e.target.value)} placeholder="1-40" className="h-8 text-xs" /></div>
            <div><Label className="text-xs">נוף</Label>
              <Select value={unit.view || ""} onValueChange={(v) => updateUnit(idx, "view", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="בחר" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sea">Sea</SelectItem><SelectItem value="marina">Marina</SelectItem><SelectItem value="city">City</SelectItem>
                  <SelectItem value="garden">Garden</SelectItem><SelectItem value="pool">Pool</SelectItem><SelectItem value="golf">Golf</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs flex items-center gap-1"><Car className="h-3 w-3" />חניה</Label><Input type="number" min={0} value={unit.parking || ""} onChange={(e) => updateUnit(idx, "parking", parseInt(e.target.value) || 0)} className="h-8 text-xs" /></div>
          </div>
        </Card>
      ))}

      {formData.units.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <ListChecks className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>לחץ "הוסף יחידה" להגדרת סוגי הדירות</p>
          <p className="text-xs text-slate-400 mt-1">שלב זה אופציונלי - ניתן להוסיף מאוחר יותר</p>
        </div>
      )}
    </div>
  );
}

// ===========================================
// STEP 6: Media (Enhanced)
// ===========================================

function Step6_Media({ formData, updateField, errors }: StepProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => { updateField("imageUrl", response.objectPath); toast({ title: "התמונה הועלתה בהצלחה" }); },
    onError: (error) => { toast({ title: "שגיאה בהעלאת התמונה", description: error.message, variant: "destructive" }); },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file, "hero");
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setGalleryUploading(true);
    const newImages: { url: string; alt?: string; type?: "image" | "video" }[] = [];
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) { toast({ title: "הקובץ גדול מדי", variant: "destructive" }); continue; }
      try {
        const response = await csrfFetch("/api/r2/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "gallery" }) });
        if (!response.ok) throw new Error("Failed");
        const { uploadURL, objectPath } = await response.json();
        const uploadResponse = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!uploadResponse.ok) throw new Error("Upload failed");
        newImages.push({ url: objectPath, alt: file.name.split(".")[0], type: "image" });
      } catch (error) { console.error("Gallery upload error:", error); }
    }
    if (newImages.length > 0) { updateField("gallery", [...(formData.gallery || []), ...newImages]); toast({ title: `${newImages.length} תמונות הועלו` }); }
    setGalleryUploading(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeGalleryImage = (index: number) => { updateField("gallery", formData.gallery?.filter((_, i) => i !== index) || []); };

  // Floor plan helpers
  const addFloorPlan = () => { updateField("floorPlans", [...formData.floorPlans, { name: "", image: "", size: "", bedrooms: "" }]); };
  const removeFloorPlan = (i: number) => { updateField("floorPlans", formData.floorPlans.filter((_, idx) => idx !== i)); };
  const updateFloorPlan = (i: number, f: keyof FloorPlanItem, v: string) => { updateField("floorPlans", formData.floorPlans.map((fp, idx) => idx === i ? { ...fp, [f]: v } : fp)); };

  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">תמונה ראשית *</Label>
          {formData.imageUrl && <span className="flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> הועלתה</span>}
        </div>
        {formData.imageUrl ? (
          <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-emerald-200 bg-slate-100">
            <img src={formData.imageUrl} alt="תמונה ראשית" className="w-full h-full object-cover" />
            <button onClick={() => updateField("imageUrl", "")} className="absolute top-3 start-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3">
            {isUploading ? (<><Loader2 className="h-10 w-10 text-blue-500 animate-spin" /><span className="text-blue-600 font-medium">{progress}%</span></>) : (<><Upload className="h-10 w-10 text-slate-400" /><span className="text-slate-600 font-medium">לחץ להעלאת תמונה</span></>)}
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400 whitespace-nowrap">או הדבק קישור:</span>
          <Input value={formData.imageUrl || ""} onChange={(e) => { const v = e.target.value; if (v === "") { updateField("imageUrl", v); } else { try { new URL(v); updateField("imageUrl", v); } catch {} } }} placeholder="https://..." className="text-sm h-8 flex-1" dir="ltr" />
        </div>
      </div>

      {/* Gallery */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base font-medium">גלריה * <span className="text-slate-500 font-normal text-sm">(מינימום 2)</span></Label>
          <span className={`text-sm ${(formData.gallery?.length || 0) >= 2 ? "text-emerald-600" : "text-amber-600"}`}>{formData.gallery?.length || 0}/2</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {formData.gallery?.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-slate-100">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeGalleryImage(index)} className="absolute top-2 end-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"><X className="h-3 w-3" /></button>
            </div>
          ))}
          <button onClick={() => galleryInputRef.current?.click()} disabled={galleryUploading} className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1">
            {galleryUploading ? <Loader2 className="h-6 w-6 text-blue-500 animate-spin" /> : (<><Plus className="h-6 w-6 text-slate-400" /><span className="text-xs text-slate-500">הוסף</span></>)}
          </button>
        </div>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
        <div className="flex gap-2 mt-3">
          <Input placeholder="או הדבק URL של תמונה ולחץ Enter" dir="ltr" className="h-9 text-sm flex-1" onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const val = (e.target as HTMLInputElement).value.trim();
              if (val && (val.startsWith("http://") || val.startsWith("https://"))) {
                updateField("gallery", [...(formData.gallery || []), { url: val, alt: "", type: "image" as const }]);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }} />
        </div>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Upload className="h-3 w-3" /> העלה תמונות או הדבק קישור</p>
      </div>

      {/* Floor Plans */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Layers className="h-4 w-4" /> תוכניות קומה</h4>
          <Button variant="outline" size="sm" onClick={addFloorPlan}><Plus className="h-3.5 w-3.5 ms-1" />הוסף</Button>
        </div>
        {formData.floorPlans.map((fp, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
            <div className="col-span-3"><Label className="text-xs">שם</Label><Input value={fp.name} onChange={(e) => updateFloorPlan(idx, "name", e.target.value)} placeholder="2BR" className="h-8 text-xs" /></div>
            <div className="col-span-4"><Label className="text-xs">תמונה</Label><div className="flex gap-1"><Input value={fp.image} onChange={(e) => updateFloorPlan(idx, "image", e.target.value)} placeholder="URL או העלה" className="h-8 text-xs flex-1" dir="ltr" /><Button variant="outline" size="sm" className="h-8 px-1.5 flex-shrink-0" onClick={() => {
              const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
              input.onchange = async (ev: any) => { const file = ev.target.files?.[0]; if (!file) return; try {
                const response = await csrfFetch("/api/r2/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "floor-plans" }) });
                if (!response.ok) throw new Error("Failed"); const { uploadURL, objectPath } = await response.json();
                const up = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
                if (!up.ok) throw new Error("Upload failed"); updateFloorPlan(idx, "image", objectPath); toast({ title: "התמונה הועלתה" });
              } catch { toast({ title: "שגיאה בהעלאה", variant: "destructive" }); } }; input.click();
            }}><Upload className="h-3 w-3" /></Button></div></div>
            <div className="col-span-2"><Label className="text-xs">גודל</Label><Input value={fp.size || ""} onChange={(e) => updateFloorPlan(idx, "size", e.target.value)} placeholder="85sqm" className="h-8 text-xs" /></div>
            <div className="col-span-2"><Label className="text-xs">חדרים</Label><Input value={fp.bedrooms || ""} onChange={(e) => updateFloorPlan(idx, "bedrooms", e.target.value)} placeholder="2" className="h-8 text-xs" /></div>
            <div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFloorPlan(idx)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button></div>
          </div>
        ))}
      </div>

      {/* Brochure & Video */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Download className="h-4 w-4" /> קבצים וקישורים</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Download className="h-3 w-3 text-amber-500" />ברושור (PDF)</Label>
            <div className="flex gap-2">
              <Input value={formData.brochureUrl || ""} onChange={(e) => updateField("brochureUrl", e.target.value)} placeholder="הדבק קישור PDF" className="h-9 text-sm flex-1" dir="ltr" />
              <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,application/pdf";
                input.onchange = async (ev: any) => {
                  const file = ev.target.files?.[0];
                  if (!file) return;
                  try {
                    const response = await csrfFetch("/api/r2/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "documents" }) });
                    if (!response.ok) throw new Error("Failed");
                    const { uploadURL, objectPath } = await response.json();
                    const up = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
                    if (!up.ok) throw new Error("Upload failed");
                    updateField("brochureUrl", objectPath);
                    toast({ title: "הברושור הועלה בהצלחה" });
                  } catch {
                    toast({ title: "שגיאה בהעלאה", variant: "destructive" });
                  }
                };
                input.click();
              }}>
                <Upload className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">העלה קובץ PDF או הדבק קישור</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Video className="h-3 w-3 text-purple-500" />סרטון</Label>
            <Input value={formData.videoUrl || ""} onChange={(e) => updateField("videoUrl", e.target.value)} placeholder="הדבק קישור YouTube / Vimeo" className="h-9 text-sm" dir="ltr" />
            <p className="text-xs text-slate-400 mt-0.5">הדבק קישור לסרטון מ-YouTube או Vimeo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// STEP 7: Advanced (NEW)
// ===========================================

function Step7_Advanced({ formData, updateField }: StepProps) {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      {/* Building Specs */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" /> מפרט הבניין</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1"><Label className="text-xs">סה"כ קומות</Label>
            <Input type="number" value={formData.specs.totalFloors || ""} onChange={(e) => updateField("specs", { ...formData.specs, totalFloors: parseInt(e.target.value) || 0 })} className="h-9 text-sm" />
          </div>
          <div className="space-y-1"><Label className="text-xs">סה"כ יחידות</Label>
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
      </div>

      {/* SEO */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Globe className="h-4 w-4" /> SEO</h4>
        <div className="space-y-3">
          <div className="space-y-1"><Label className="text-xs">Meta Title</Label>
            <Input value={formData.seo.title || ""} onChange={(e) => updateField("seo", { ...formData.seo, title: e.target.value })} placeholder={'שם הפרויקט - נדל"ן בדובאי'} className="h-9 text-sm" />
          </div>
          <div className="space-y-1"><Label className="text-xs">Meta Description</Label>
            <Textarea value={formData.seo.description || ""} onChange={(e) => updateField("seo", { ...formData.seo, description: e.target.value })} placeholder="עד 160 תווים..." className="min-h-[50px] text-sm" />
          </div>
          <div className="space-y-1"><Label className="text-xs">OG Image</Label>
            <div className="flex gap-2">
              <Input value={formData.seo.ogImage || ""} onChange={(e) => updateField("seo", { ...formData.seo, ogImage: e.target.value })} placeholder="URL או העלה תמונה" className="h-9 text-sm flex-1" dir="ltr" />
              <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => {
                const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
                input.onchange = async (ev: any) => { const file = ev.target.files?.[0]; if (!file) return; try {
                  const response = await csrfFetch("/api/r2/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "site" }) });
                  if (!response.ok) throw new Error("Failed"); const { uploadURL, objectPath } = await response.json();
                  const up = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
                  if (!up.ok) throw new Error("Upload failed"); updateField("seo", { ...formData.seo, ogImage: objectPath }); toast({ title: "התמונה הועלתה" });
                } catch { toast({ title: "שגיאה בהעלאה", variant: "destructive" }); } }; input.click();
              }}><Upload className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Tag className="h-4 w-4" /> תגיות</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {(formData.tags || []).map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
              {tag}
              <button onClick={() => updateField("tags", formData.tags.filter((_, i) => i !== idx))} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {["Waterfront", "Branded Residence", "Golf Course", "Beachfront", "Luxury", "Investment", "Family", "Smart Home", "Sustainable"].filter(t => !(formData.tags || []).includes(t)).map((tag) => (
            <button key={tag} onClick={() => updateField("tags", [...(formData.tags || []), tag])} className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100">+ {tag}</button>
          ))}
        </div>
        <Input placeholder="Custom tag + Enter" className="h-8 text-sm" dir="ltr" onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (val && !(formData.tags || []).includes(val)) { updateField("tags", [...(formData.tags || []), val]); (e.target as HTMLInputElement).value = ""; } }
        }} />
      </div>

      {/* Related Projects */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Layers className="h-4 w-4" /> פרויקטים קשורים</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {(formData.relatedProjects || []).map((projectId, idx) => (
            <Badge key={idx} variant="outline" className="gap-1.5 px-3 py-1 text-sm font-mono">
              {projectId}
              <button onClick={() => updateField("relatedProjects", formData.relatedProjects.filter((_, i) => i !== idx))} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
        <Input placeholder="Project ID + Enter" className="h-8 text-sm" dir="ltr" onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (val && !(formData.relatedProjects || []).includes(val)) { updateField("relatedProjects", [...(formData.relatedProjects || []), val]); (e.target as HTMLInputElement).value = ""; } }
        }} />
      </div>
    </div>
  );
}

// ===========================================
// STEP 8: Summary & Publish (Enhanced)
// ===========================================

function Step8_Summary({ formData, updateField }: StepProps) {
  const isPublished = formData.status === "active";

  // Calculate section completion
  const sections = [
    { name: "פרטי פרויקט", completed: !!(formData.name && formData.developer && formData.propertyType), required: true },
    { name: "מיקום", completed: !!formData.location, required: true },
    { name: "תיאור", completed: !!formData.description, required: false },
    { name: "מחיר", completed: formData.priceFrom > 0, required: false },
    { name: "יחידות", completed: formData.units.length > 0, required: false },
    { name: "תמונה ראשית", completed: !!formData.imageUrl, required: true },
    { name: "גלריה", completed: (formData.gallery?.length || 0) >= 2, required: true },
    { name: "מתקנים", completed: !!(formData.amenitiesText || formData.highlights.length > 0), required: false },
  ];

  const completedCount = sections.filter(s => s.completed).length;
  const completionPercent = Math.round((completedCount / sections.length) * 100);

  return (
    <div className="space-y-6">
      {/* Completion Bar */}
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-900">שלמות הפרויקט</h4>
          <span className={`text-lg font-bold ${completionPercent >= 75 ? "text-emerald-600" : completionPercent >= 50 ? "text-amber-600" : "text-red-500"}`}>{completionPercent}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
          <div className={`h-2 rounded-full transition-all ${completionPercent >= 75 ? "bg-emerald-500" : completionPercent >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${completionPercent}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {sections.map((section, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              {section.completed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${section.required ? "border-red-300" : "border-slate-300"}`} />
              )}
              <span className={section.completed ? "text-slate-700" : section.required ? "text-red-500" : "text-slate-400"}>
                {section.name} {section.required && !section.completed && "*"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-slate-50 rounded-xl p-5 space-y-4">
        <h4 className="font-semibold text-slate-900">סיכום הפרויקט</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">שם:</span><p className="font-medium">{formData.name || "-"}</p></div>
          <div><span className="text-slate-500">יזם:</span><p className="font-medium">{formData.developer || "-"}</p></div>
          <div><span className="text-slate-500">מיקום:</span><p className="font-medium">{formData.location || "-"}</p></div>
          <div><span className="text-slate-500">סוג:</span><p className="font-medium">{formData.propertyType || "-"}</p></div>
          <div><span className="text-slate-500">מחיר:</span><p className="font-medium">{formData.priceFrom ? `${formatPrice(formData.priceFrom)} ${formData.priceCurrency}` : "-"}</p></div>
          <div><span className="text-slate-500">תשואה:</span><p className="font-medium">{formData.roiPercent ? `${formData.roiPercent}%` : "-"}</p></div>
          <div><span className="text-slate-500">יחידות:</span><p className="font-medium">{formData.units.length || "-"}</p></div>
          <div><span className="text-slate-500">תגיות:</span><p className="font-medium">{formData.tags?.length || "-"}</p></div>
        </div>

        {/* Images Preview */}
        <div className="pt-3 border-t">
          <span className="text-slate-500 text-sm">תמונות:</span>
          <div className="flex gap-2 mt-2">
            {formData.imageUrl && <img src={formData.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />}
            {formData.gallery?.slice(0, 3).map((img, i) => (
              <img key={i} src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover" />
            ))}
            {(formData.gallery?.length || 0) > 3 && (
              <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-sm text-slate-600">+{(formData.gallery?.length || 0) - 3}</div>
            )}
          </div>
        </div>
      </div>

      {/* Publish Toggle */}
      <div
        onClick={() => updateField("status", isPublished ? "draft" : "active")}
        className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${isPublished ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isPublished ? <Eye className="h-6 w-6 text-emerald-600" /> : <EyeOff className="h-6 w-6 text-slate-400" />}
            <div>
              <p className="font-semibold">{isPublished ? "יפורסם באתר" : "ישמר כטיוטה"}</p>
              <p className="text-sm text-slate-500">{isPublished ? "הפרויקט יהיה גלוי ללקוחות" : "ניתן לפרסם מאוחר יותר"}</p>
            </div>
          </div>
          <div className={`w-12 h-7 rounded-full transition-colors ${isPublished ? "bg-emerald-500" : "bg-slate-300"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-1 transition-transform ${isPublished ? "me-1" : "me-6"}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// MAIN WIZARD COMPONENT
// ===========================================

export function ProjectWizard({
  isOpen,
  onClose,
  editingProject,
  onCreateProject,
  onUpdateProject,
}: ProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>(emptyFormData);
  const [originalData, setOriginalData] = useState<OriginalProjectData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const { toast } = useToast();
  const { checkStatus } = useAIAssist();

  // ---- Amenity IDs state (lifted from Step3) ----
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);

  // ---- Draft auto-save state ----
  const [draftId, setDraftId] = useState<string | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const lastSavedRef = useRef<string>("");
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check AI availability on mount
  useEffect(() => {
    checkStatus().then(setAiAvailable);
  }, [checkStatus]);

  // Initialize form when opening
  useEffect(() => {
    if (!isOpen) return;
    if (editingProject) {
      const fd = projectToFormData(editingProject);
      setFormData(fd);
      setOriginalData({
        highlights: editingProject.highlights,
        amenities: editingProject.amenities,
        paymentPlan: editingProject.paymentPlan,
        faqs: editingProject.faqs,
        neighborhood: editingProject.neighborhood,
        units: editingProject.units,
        floorPlans: editingProject.floorPlans,
        highlightsText: fd.highlightsText,
        amenitiesText: fd.amenitiesText,
        paymentPlanText: fd.paymentPlanText,
      });
      // Initialize amenity IDs from existing project data
      const existingAmenities = editingProject.amenities as any[] | null;
      if (existingAmenities && existingAmenities.length > 0) {
        setSelectedAmenityIds(schemaToAmenityIds(existingAmenities));
      } else {
        setSelectedAmenityIds([]);
      }
      // If editing a draft, keep its ID for auto-save
      if (editingProject.status === "draft") {
        setDraftId(editingProject.id);
      } else {
        setDraftId(null);
      }
      setCurrentStep(1);
      setErrors({});
    } else {
      setFormData(emptyFormData);
      setOriginalData(null);
      setSelectedAmenityIds([]);
      setDraftId(null);
      setCurrentStep(1);
      setErrors({});
    }
  }, [isOpen, editingProject]);

  // ---- Auto-save to server every 30s ----
  useEffect(() => {
    if (!isOpen || !draftId) return;

    autoSaveTimerRef.current = setInterval(async () => {
      const currentJson = JSON.stringify(formData);
      if (currentJson === lastSavedRef.current) return;

      try {
        setAutoSaving(true);
        const projectData = formDataToProject(formData, originalData);
        if (selectedAmenityIds.length > 0) {
          projectData.amenities = amenityIdsToSchema(selectedAmenityIds);
        }
        await onUpdateProject(draftId, projectData);
        lastSavedRef.current = currentJson;
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setAutoSaving(false);
      }
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [isOpen, draftId, formData, originalData, onUpdateProject]);

  // Cleanup timer on close
  useEffect(() => {
    if (!isOpen && autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, [isOpen]);

  const updateField = useCallback((field: keyof FormDataType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Validation per step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name?.trim() || formData.name.trim().length < 2) newErrors.name = "שם הפרויקט חובה";
      if (!formData.developer?.trim() || formData.developer.trim().length < 2) newErrors.developer = "שם היזם חובה";
      if (!formData.propertyType?.trim()) newErrors.propertyType = "סוג הנכס חובה";
    }

    if (step === 2) {
      if (!formData.location?.trim() || formData.location.trim().length < 2) newErrors.location = "מיקום חובה";
    }

    // Steps 3-5, 7: no required validation
    if (step === 6) {
      if (!formData.imageUrl) newErrors.imageUrl = "תמונה ראשית חובה";
      if ((formData.gallery?.length || 0) < 2) newErrors.gallery = "נדרשות לפחות 2 תמונות";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---- Create draft on server (via onCreateProject so the list updates) ----
  const createDraftOnServer = async () => {
    try {
      const projectData = formDataToProject(formData, originalData);
      if (selectedAmenityIds.length > 0) {
        projectData.amenities = amenityIdsToSchema(selectedAmenityIds);
      }
      projectData.status = "draft";
      const newId = await onCreateProject(projectData);
      if (newId) {
        setDraftId(newId);
        lastSavedRef.current = JSON.stringify(formData);
        toast({ title: "טיוטה נשמרה", description: "הפרויקט נשמר כטיוטה ויישמר אוטומטית" });
      }
    } catch (error) {
      console.error("Failed to create draft:", error);
      toast({ title: "שגיאה בשמירת טיוטה", variant: "destructive" });
    }
  };

  const goNext = async () => {
    if (validateStep(currentStep)) {
      // Auto-create draft when leaving Step 1 for the first time
      if (currentStep === 1 && !draftId && !editingProject) {
        await createDraftOnServer();
      }
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    } else {
      toast({ title: "יש למלא את השדות הנדרשים", variant: "destructive" });
    }
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validate required steps
    for (const step of [1, 2, 6]) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        toast({ title: "שדות חובה חסרים", description: "יש למלא את כל שדות החובה", variant: "destructive" });
        return;
      }
    }

    setSaving(true);
    const projectData = formDataToProject(formData, originalData);
    if (selectedAmenityIds.length > 0) {
      projectData.amenities = amenityIdsToSchema(selectedAmenityIds);
    }

    try {
      if (draftId) {
        // Update existing draft (change status if publishing)
        await onUpdateProject(draftId, projectData);
        toast({ title: formData.status === "active" ? "הפרויקט פורסם בהצלחה!" : "הפרויקט נשמר כטיוטה" });
      } else if (editingProject?.id) {
        await onUpdateProject(editingProject.id, projectData);
        toast({ title: "הפרויקט עודכן בהצלחה" });
      } else {
        await onCreateProject(projectData);
        toast({ title: "הפרויקט נוצר בהצלחה" });
      }
      onClose();
    } catch (error) {
      toast({ title: "שגיאה", description: "לא ניתן לשמור את הפרויקט", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (draftId) {
      toast({ title: "הטיוטה נשמרה", description: "ניתן להמשיך מאוחר יותר מרשימת הטיוטות" });
    }
    setFormData(emptyFormData);
    setDraftId(null);
    setCurrentStep(1);
    setErrors({});
    onClose();
  };

  const handleBackdropClick = () => {
    if (draftId) {
      // Draft is auto-saved, safe to close
      handleClose();
    } else if (formData.name || formData.developer || formData.location) {
      if (window.confirm("יש לך שינויים שלא נשמרו. האם אתה בטוח שברצונך לצאת?")) {
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const stepProps: StepProps = { formData, updateField, errors, setErrors, aiAvailable, selectedAmenityIds, setSelectedAmenityIds };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col m-4"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold">
                {editingProject ? "עריכת פרויקט" : "פרויקט חדש"}
              </h2>
              {aiAvailable && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 text-xs font-medium">
                  <Sparkles className="h-3 w-3" /> AI
                </span>
              )}
              {draftId && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                  {autoSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  {autoSaving ? "שומר..." : "טיוטה"}
                </span>
              )}
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper - scrollable for 8 steps */}
          <div className="flex items-center overflow-x-auto pb-1" dir="rtl">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        currentStep > step.id
                          ? "bg-emerald-500 text-white"
                          : currentStep === step.id
                          ? "bg-white text-slate-900"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <span className={`text-[10px] mt-0.5 whitespace-nowrap ${currentStep >= step.id ? "text-white" : "text-slate-500"}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-6 h-0.5 mx-0.5 ${currentStep > step.id ? "bg-emerald-500" : "bg-slate-700"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && <Step1_ProjectDetails {...stepProps} />}
              {currentStep === 2 && <Step2_Location {...stepProps} />}
              {currentStep === 3 && <Step3_Content {...stepProps} />}
              {currentStep === 4 && <Step4_Pricing {...stepProps} />}
              {currentStep === 5 && <Step5_Units {...stepProps} />}
              {currentStep === 6 && <Step6_Media {...stepProps} />}
              {currentStep === 7 && <Step7_Advanced {...stepProps} />}
              {currentStep === 8 && <Step8_Summary {...stepProps} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between bg-slate-50">
          <Button variant="ghost" onClick={goBack} disabled={currentStep === 1} className="gap-2">
            <ChevronRight className="h-4 w-4" />
            חזור
          </Button>

          <div className="flex items-center gap-2">
            {/* Save Draft button - available from step 1 onwards */}
            {!editingProject && (
              <Button
                variant="outline"
                onClick={async () => {
                  if (!formData.name) {
                    toast({ title: "יש להזין שם פרויקט לפני שמירה", variant: "destructive" });
                    return;
                  }
                  setSaving(true);
                  try {
                    if (draftId) {
                      const projectData = formDataToProject(formData, originalData);
                      if (selectedAmenityIds.length > 0) {
                        projectData.amenities = amenityIdsToSchema(selectedAmenityIds);
                      }
                      projectData.status = "draft";
                      await onUpdateProject(draftId, projectData);
                      toast({ title: "הטיוטה עודכנה" });
                    } else {
                      await createDraftOnServer();
                    }
                  } catch {
                    toast({ title: "שגיאה בשמירת טיוטה", variant: "destructive" });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving || !formData.name}
                className="gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                שמור טיוטה
              </Button>
            )}

            <span className="text-sm text-slate-500 mx-2">
              שלב {currentStep} מתוך {STEPS.length}
            </span>

            {currentStep < STEPS.length ? (
              <Button onClick={goNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
                הבא
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {formData.status === "active" ? "פרסם פרויקט" : editingProject ? "שמור שינויים" : "שמור כטיוטה"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
