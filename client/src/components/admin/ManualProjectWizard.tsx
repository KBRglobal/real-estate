import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Image,
  ListChecks,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  Globe,
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudOff,
  Video,
  Download,
  Layers,
  BarChart3,
  Settings2,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  ImagePlus,
  FileQuestion,
  Tag,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { getCsrfToken } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import { AmenitiesEditor, amenityIdsToSchema } from "./AmenitiesEditor";
import { DeveloperPicker } from "./DeveloperPicker";
import { ProximityEditor, proximityToNeighborhood, type NearbyPlaceEntry } from "./ProximityEditor";
import type {
  GalleryCategory,
  HighlightItem,
  FAQItem,
  FloorPlanItem,
  SpecsData,
  InvestmentMetricsData,
  SeoData,
  CoordinatesData,
  PaymentPlanData,
} from "@/pages/admin/views/projects/types";

interface ManualProjectWizardProps {
  onSave: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

interface UnitType {
  type: string;
  typeHe: string;
  bedrooms: string;
  sizeFrom: number;
  sizeTo: number;
  priceFrom: number;
  priceTo: number;
  floor?: string;
  view?: string;
  status?: string;
  parking?: number;
}

interface GalleryImage {
  url: string;
  alt: string;
  category?: GalleryCategory;
}

interface UnitTypePricing {
  label: string;
  labelHe: string;
  startingPrice: number;
  sizeRange: string;
  available: boolean;
}

const STEPS = [
  { id: "basics", label: "פרטים בסיסיים", labelEn: "Basic Details", icon: Building2 },
  { id: "description", label: "תיאור", labelEn: "Description", icon: FileText },
  { id: "units", label: "סוגי יחידות", labelEn: "Unit Types", icon: ListChecks },
  { id: "payment", label: "תוכנית תשלומים", labelEn: "Payment Plan", icon: CreditCard },
  { id: "amenities", label: "מתקנים", labelEn: "Amenities", icon: Check },
  { id: "location", label: "מיקום ושכונה", labelEn: "Location & Neighborhood", icon: MapPin },
  { id: "media", label: "מדיה", labelEn: "Media", icon: Image },
  { id: "extras", label: "מתקדם", labelEn: "Advanced", icon: Settings2 },
];

// Field validation helper component
function FieldStatus({ isValid, message }: { isValid: boolean; message?: string }) {
  if (isValid) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 text-xs">
        <CheckCircle2 className="h-3.5 w-3.5" />
        תקין
      </span>
    );
  }
  return message ? (
    <span className="inline-flex items-center gap-1 text-red-500 text-xs">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </span>
  ) : null;
}

// Required field label with red asterisk
function RequiredLabel({ htmlFor, children, hint }: { htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor} className="flex items-center gap-1">
        {children}
        <span className="text-red-500 text-sm" aria-hidden="true">*</span>
      </Label>
      {hint && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[250px] text-xs">
              <p>{hint}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// Field hint tooltip for non-required fields
function FieldHint({ children, hint }: { children: React.ReactNode; hint: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {children}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help flex-shrink-0" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[250px] text-xs">
            <p>{hint}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// Empty state placeholder for steps with no data
function EmptyStateHint({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/20"
    >
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-primary/60" />
      </div>
      <h4 className="text-base font-semibold text-foreground/80 mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground text-center max-w-md">{description}</p>
    </motion.div>
  );
}

// Shake animation variant for blocked navigation
const shakeVariant = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5 },
  },
};

const DEFAULT_UNIT_TYPE_PRICING: UnitTypePricing[] = [
  { label: "Studio", labelHe: "סטודיו", startingPrice: 0, sizeRange: "", available: true },
  { label: "1BR", labelHe: "חדר שינה 1", startingPrice: 0, sizeRange: "", available: true },
  { label: "2BR", labelHe: "2 חדרי שינה", startingPrice: 0, sizeRange: "", available: true },
  { label: "3BR", labelHe: "3 חדרי שינה", startingPrice: 0, sizeRange: "", available: true },
  { label: "4BR", labelHe: "4 חדרי שינה", startingPrice: 0, sizeRange: "", available: false },
  { label: "Penthouse", labelHe: "פנטהאוז", startingPrice: 0, sizeRange: "", available: false },
];

const GALLERY_CATEGORIES: { value: GalleryCategory; label: string }[] = [
  { value: "exterior", label: "חיצוני" },
  { value: "interior", label: "פנימי" },
  { value: "amenities", label: "מתקנים" },
  { value: "views", label: "נוף" },
];

export function ManualProjectWizard({ onSave, onCancel, isOpen }: ManualProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "pending" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    developer: "",
    developerLogo: "",
    location: "",
    locationEn: "",
    priceFrom: 0,
    priceCurrency: "AED",
    completionDate: "",
    propertyType: "דירה",
    buildingType: "",
    videoUrl: "",
    brochureUrl: "",
    description: "",
    descriptionEn: "",
    tagline: "",
    taglineEn: "",
    projectStatus: "" as string,
    reraNumber: "",
    dldNumber: "",
    ownership: "" as string,
    constructionProgress: 0,
    furnishing: "" as string,
    serviceCharge: 0,
    numberOfBuildings: 1,
    commissionPercent: 0,
    launchDate: "",
    googleMapsUrl: "",
    tags: [] as string[],
  });

  const [units, setUnits] = useState<UnitType[]>([
    { type: "1 Bedroom", typeHe: "1 חדר שינה", bedrooms: "1", sizeFrom: 0, sizeTo: 0, priceFrom: 0, priceTo: 0, status: "available" },
  ]);

  const [unitTypePricing, setUnitTypePricing] = useState<UnitTypePricing[]>(DEFAULT_UNIT_TYPE_PRICING);
  const [unitsCollapsed, setUnitsCollapsed] = useState(false);

  const [paymentPlans, setPaymentPlans] = useState<PaymentPlanData[]>([]);
  const [paymentPlanText, setPaymentPlanText] = useState("");

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [neighborhood, setNeighborhood] = useState({
    description: "",
    descriptionEn: "",
  });
  const [nearbyPlaces, setNearbyPlaces] = useState<{ name: string; nameEn: string; distance: string; type: string }[]>([]);
  const [proximityPlaces, setProximityPlaces] = useState<NearbyPlaceEntry[]>([]);
  const [proximityArea, setProximityArea] = useState("");

  const [coordinates, setCoordinates] = useState<CoordinatesData | null>(null);

  const [heroImage, setHeroImage] = useState("");
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [floorPlans, setFloorPlans] = useState<FloorPlanItem[]>([]);

  // Step 7: Extras/Advanced state
  const [investmentMetrics, setInvestmentMetrics] = useState<InvestmentMetricsData>({});
  const [specs, setSpecs] = useState<SpecsData>({});
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [seo, setSeo] = useState<SeoData>({ title: "", description: "", ogImage: "" });

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      if (!heroImage) {
        setHeroImage(response.objectPath);
      } else {
        setGallery((prev) => [...prev, { url: response.objectPath, alt: formData.name, category: "exterior" }]);
      }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isHero: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isHero) {
        setHeroImage("");
      }
      await uploadFile(file);
    }
  };

  const handleBrochureUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,application/pdf";
    input.onchange = async (ev: any) => {
      const file = ev.target.files?.[0];
      if (!file) return;
      try {
        const csrfToken = await getCsrfToken();
        const response = await fetch("/api/r2/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
          credentials: "include",
          body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "documents" }),
        });
        if (!response.ok) throw new Error("Failed");
        const { uploadURL, objectPath } = await response.json();
        const up = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!up.ok) throw new Error("Upload failed");
        setFormData((prev) => ({ ...prev, brochureUrl: objectPath }));
        toast({ title: "הברושור הועלה בהצלחה" });
      } catch {
        toast({ title: "שגיאה בהעלאה", variant: "destructive" });
      }
    };
    input.click();
  };

  const handleFloorPlanUpload = async (idx: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (ev: any) => {
      const file = ev.target.files?.[0];
      if (!file) return;
      try {
        const csrfToken = await getCsrfToken();
        const response = await fetch("/api/r2/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
          credentials: "include",
          body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: "floor-plans" }),
        });
        if (!response.ok) throw new Error("Failed");
        const { uploadURL, objectPath } = await response.json();
        const up = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!up.ok) throw new Error("Upload failed");
        updateFloorPlan(idx, "image", objectPath);
        toast({ title: "תוכנית הקומה הועלתה" });
      } catch {
        toast({ title: "שגיאה בהעלאה", variant: "destructive" });
      }
    };
    input.click();
  };

  const addUnit = () => {
    setUnits((prev) => [
      ...prev,
      { type: "", typeHe: "", bedrooms: "", sizeFrom: 0, sizeTo: 0, priceFrom: 0, priceTo: 0, status: "available", parking: 0 },
    ]);
  };

  const removeUnit = (index: number) => {
    setUnits((prev) => prev.filter((_, i) => i !== index));
  };

  const updateUnit = (index: number, field: keyof UnitType, value: string | number) => {
    setUnits((prev) =>
      prev.map((unit, i) => (i === index ? { ...unit, [field]: value } : unit))
    );
  };

  const updateUnitTypePricing = (index: number, field: keyof UnitTypePricing, value: string | number | boolean) => {
    setUnitTypePricing((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addNearbyPlace = () => {
    setNearbyPlaces((prev) => [...prev, { name: "", nameEn: "", distance: "", type: "shopping" }]);
  };

  const removeNearbyPlace = (index: number) => {
    setNearbyPlaces((prev) => prev.filter((_, i) => i !== index));
  };

  const updateNearbyPlace = (index: number, field: string, value: string) => {
    setNearbyPlaces((prev) =>
      prev.map((place, i) => (i === index ? { ...place, [field]: value } : place))
    );
  };

  const removeGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGalleryImage = (index: number, field: keyof GalleryImage, value: string) => {
    setGallery((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    );
  };

  // Floor plan helpers
  const addFloorPlan = () => {
    setFloorPlans((prev) => [...prev, { name: "", image: "", size: "", bedrooms: "" }]);
  };
  const removeFloorPlan = (index: number) => {
    setFloorPlans((prev) => prev.filter((_, i) => i !== index));
  };
  const updateFloorPlan = (index: number, field: keyof FloorPlanItem, value: string) => {
    setFloorPlans((prev) =>
      prev.map((fp, i) => (i === index ? { ...fp, [field]: value } : fp))
    );
  };

  // Highlight helpers
  const addHighlight = () => {
    setHighlights((prev) => [...prev, { icon: "star", title: "", titleHe: "", value: "" }]);
  };
  const removeHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };
  const updateHighlight = (index: number, field: keyof HighlightItem, value: string) => {
    setHighlights((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  };

  // FAQ helpers
  const addFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };
  const removeFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };
  const updateFaq = (index: number, field: keyof FAQItem, value: string) => {
    setFaqs((prev) =>
      prev.map((fq, i) => (i === index ? { ...fq, [field]: value } : fq))
    );
  };

  // Field validation functions
  const validation = {
    name: {
      isValid: formData.name.trim().length >= 2,
      message: formData.name.trim() ? (formData.name.trim().length < 2 ? "שם קצר מדי" : "") : "שדה חובה",
    },
    developer: {
      isValid: formData.developer.trim().length >= 2,
      message: formData.developer.trim() ? (formData.developer.trim().length < 2 ? "שם קצר מדי" : "") : "שדה חובה",
    },
    location: {
      isValid: formData.location.trim().length >= 2,
      message: formData.location.trim() ? (formData.location.trim().length < 2 ? "מיקום קצר מדי" : "") : "שדה חובה",
    },
    priceFrom: {
      isValid: formData.priceFrom > 0,
      message: formData.priceFrom > 0 ? "" : "יש להזין מחיר",
    },
    description: {
      isValid: formData.description.length >= 20,
      message: formData.description.length >= 20 ? "" : `נדרשים עוד ${20 - formData.description.length} תווים`,
    },
    units: {
      isValid: units.length > 0 && units.some((u) => u.type || u.typeHe),
      message: units.some((u) => u.type || u.typeHe) ? "" : "יש להגדיר לפחות סוג יחידה אחד",
    },
    amenities: {
      isValid: selectedAmenities.length >= 3,
      message: selectedAmenities.length >= 3 ? "" : `נבחרו ${selectedAmenities.length}/3 מתקנים (מינימום 3)`,
    },
    heroImage: {
      isValid: heroImage.length > 0,
      message: heroImage ? "" : "תמונה ראשית חובה למכירה",
    },
    gallery: {
      isValid: gallery.length >= 2,
      message: gallery.length >= 2 ? "" : `נוספו ${gallery.length}/2 תמונות (מינימום 2)`,
    },
  };

  // Step validation summary
  const stepValidation = {
    0: validation.name.isValid && validation.developer.isValid && validation.location.isValid && validation.priceFrom.isValid,
    1: validation.description.isValid,
    2: validation.units.isValid,
    3: true, // Payment plan optional
    4: validation.amenities.isValid,
    5: true, // Location/neighborhood optional
    6: validation.heroImage.isValid && validation.gallery.isValid,
    7: true, // Extras/Advanced optional
  };

  const canProceed = () => {
    return stepValidation[currentStep as keyof typeof stepValidation] ?? true;
  };

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    const currentData = JSON.stringify({ formData, units, unitTypePricing, paymentPlans, paymentPlanText, selectedAmenities, neighborhood, nearbyPlaces, proximityPlaces, proximityArea, coordinates, heroImage, gallery, floorPlans, investmentMetrics, specs, highlights, faqs, seo });
    if (currentData === lastSavedDataRef.current) {
      setAutoSaveStatus("saved");
      return;
    }

    // Only auto-save if we have minimum required data
    if (!formData.name.trim() || !formData.developer.trim()) {
      setAutoSaveStatus("idle");
      return;
    }

    setAutoSaveStatus("saving");

    // Save to localStorage as draft
    try {
      localStorage.setItem("project-wizard-draft", currentData);
      lastSavedDataRef.current = currentData;
      setLastSaved(new Date());
      setAutoSaveStatus("saved");
    } catch (error) {
      setAutoSaveStatus("error");
      console.error("Auto-save failed:", error);
    }
  }, [formData, units, unitTypePricing, paymentPlans, paymentPlanText, selectedAmenities, neighborhood, nearbyPlaces, proximityPlaces, proximityArea, coordinates, heroImage, gallery, floorPlans, investmentMetrics, specs, highlights, faqs, seo]);

  const triggerAutoSave = useCallback(() => {
    setAutoSaveStatus("pending");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, 2000); // 2 seconds debounce
  }, [performAutoSave]);

  // Trigger auto-save on any data change
  useEffect(() => {
    if (isOpen && (formData.name || formData.developer)) {
      triggerAutoSave();
    }
  }, [formData, units, unitTypePricing, paymentPlans, paymentPlanText, selectedAmenities, neighborhood, nearbyPlaces, proximityPlaces, proximityArea, coordinates, heroImage, gallery, floorPlans, investmentMetrics, specs, highlights, faqs, seo, isOpen, triggerAutoSave]);

  // Load draft on open
  useEffect(() => {
    if (isOpen) {
      const draft = localStorage.getItem("project-wizard-draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.formData) setFormData(parsed.formData);
          if (parsed.units) setUnits(parsed.units);
          if (parsed.unitTypePricing) setUnitTypePricing(parsed.unitTypePricing);
          if (parsed.paymentPlans) setPaymentPlans(parsed.paymentPlans);
          if (parsed.paymentPlanText) setPaymentPlanText(parsed.paymentPlanText);
          if (parsed.selectedAmenities) setSelectedAmenities(parsed.selectedAmenities);
          if (parsed.neighborhood) setNeighborhood(parsed.neighborhood);
          if (parsed.nearbyPlaces) setNearbyPlaces(parsed.nearbyPlaces);
          if (parsed.proximityPlaces) setProximityPlaces(parsed.proximityPlaces);
          if (parsed.proximityArea) setProximityArea(parsed.proximityArea);
          if (parsed.coordinates) setCoordinates(parsed.coordinates);
          if (parsed.heroImage) setHeroImage(parsed.heroImage);
          if (parsed.gallery) setGallery(parsed.gallery);
          if (parsed.floorPlans) setFloorPlans(parsed.floorPlans);
          if (parsed.investmentMetrics) setInvestmentMetrics(parsed.investmentMetrics);
          if (parsed.specs) setSpecs(parsed.specs);
          if (parsed.highlights) setHighlights(parsed.highlights);
          if (parsed.faqs) setFaqs(parsed.faqs);
          if (parsed.seo) setSeo(parsed.seo);
          lastSavedDataRef.current = draft;
          setLastSaved(new Date());
          toast({ title: "טיוטה נטענה", description: "המשך מהמקום שהפסקת" });
        } catch {
          // Invalid draft, ignore
        }
      }
    }
  }, [isOpen]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    if (diff < 60) return "הרגע";
    if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דקות`;
    return lastSaved.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  };

  // Compute overall progress percentage
  const completionPercentage = useMemo(() => {
    const totalSteps = STEPS.length;
    let completed = 0;
    for (let i = 0; i < totalSteps; i++) {
      if (stepValidation[i as keyof typeof stepValidation]) {
        completed++;
      }
    }
    return Math.round((completed / totalSteps) * 100);
  }, [stepValidation]);

  // Validation messages per step for toast feedback
  const stepValidationMessages: Record<number, string> = useMemo(() => ({
    0: !validation.name.isValid ? "יש למלא שם פרויקט" : !validation.developer.isValid ? "יש למלא שם יזם" : !validation.location.isValid ? "יש למלא מיקום" : !validation.priceFrom.isValid ? "יש למלא מחיר התחלתי" : "",
    1: !validation.description.isValid ? "יש לכתוב תיאור (לפחות 20 תווים)" : "",
    2: !validation.units.isValid ? "יש להגדיר לפחות סוג יחידה אחד" : "",
    3: "",
    4: !validation.amenities.isValid ? `יש לבחור לפחות 3 מתקנים (נבחרו ${selectedAmenities.length})` : "",
    5: "",
    6: !validation.heroImage.isValid ? "יש להוסיף תמונה ראשית" : !validation.gallery.isValid ? "יש להוסיף לפחות 2 תמונות לגלריה" : "",
    7: "",
  }), [validation, selectedAmenities.length]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      if (!canProceed()) {
        // Trigger shake animation
        setShakeKey((k) => k + 1);
        // Show validation toast
        const msg = stepValidationMessages[currentStep];
        if (msg) {
          toast({
            title: "יש למלא שדות חובה",
            description: msg,
            variant: "destructive",
          });
        }
        return;
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Keyboard shortcut: Enter for next step (unless in textarea/select)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      // Don't capture Enter in textareas or selects
      if (tag === "textarea" || tag === "select") return;
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (currentStep < STEPS.length - 1) {
          handleNext();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep, handleNext]);

  const generateSlug = (name: string) => {
    const normalized = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    return normalized || `project-${Date.now()}`;
  };

  // Extract bedrooms number from type string (e.g., "1 חדר שינה" -> "1", "סטודיו" -> "0")
  const extractBedroomsFromType = (type: string): string => {
    if (!type) return "";
    const match = type.match(/(\d+)/);
    if (match) return match[1];
    if (type.includes("סטודיו") || type.toLowerCase().includes("studio")) return "0";
    return "";
  };

  // No longer used: paymentTotal is computed per-plan in the UI

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const projectData: Partial<Project> = {
        name: formData.name,
        nameEn: formData.nameEn || null,
        developer: formData.developer,
        developerLogo: formData.developerLogo || null,
        location: formData.location,
        locationEn: formData.locationEn || null,
        priceFrom: formData.priceFrom,
        priceCurrency: formData.priceCurrency,
        completionDate: formData.completionDate,
        propertyType: formData.propertyType,
        buildingType: formData.buildingType || null,
        description: formData.description,
        descriptionEn: formData.descriptionEn || null,
        tagline: formData.tagline || null,
        taglineEn: formData.taglineEn || null,
        videoUrl: formData.videoUrl || null,
        brochureUrl: formData.brochureUrl || null,
        projectStatus: formData.projectStatus || null,
        reraNumber: formData.reraNumber || null,
        dldNumber: formData.dldNumber || null,
        ownership: formData.ownership || null,
        constructionProgress: formData.constructionProgress || null,
        furnishing: formData.furnishing || null,
        serviceCharge: formData.serviceCharge || null,
        numberOfBuildings: formData.numberOfBuildings || null,
        commissionPercent: formData.commissionPercent || null,
        launchDate: formData.launchDate || null,
        googleMapsUrl: formData.googleMapsUrl || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        heroImage: heroImage || null,
        imageUrl: heroImage || null,
        slug: generateSlug(formData.nameEn || formData.name),
        status: "draft",
        coordinates: coordinates || null,
        units: units.filter((u) => u.type || u.typeHe).map((u) => {
          // Format size string for display
          const sizeStr = u.sizeFrom && u.sizeTo
            ? `${u.sizeFrom}-${u.sizeTo} מ״ר`
            : u.sizeFrom
              ? `${u.sizeFrom} מ״ר`
              : u.sizeTo
                ? `${u.sizeTo} מ״ר`
                : "";

          // Format price string for display
          const formatNum = (n: number) => new Intl.NumberFormat("he-IL").format(n);
          const priceStr = u.priceFrom && u.priceTo
            ? `${formatNum(u.priceFrom)} - ${formatNum(u.priceTo)} ${formData.priceCurrency}`
            : u.priceFrom
              ? `${formatNum(u.priceFrom)} ${formData.priceCurrency}`
              : u.priceTo
                ? `${formatNum(u.priceTo)} ${formData.priceCurrency}`
                : "";

          return {
            type: u.type || u.typeHe,
            typeHe: u.typeHe || u.type,
            bedrooms: u.bedrooms || extractBedroomsFromType(u.typeHe || u.type),
            size: sizeStr,
            sizeFrom: u.sizeFrom,
            sizeTo: u.sizeTo,
            price: priceStr,
            priceFrom: u.priceFrom,
            priceTo: u.priceTo,
            sizeUnit: "sqm" as const,
            priceCurrency: formData.priceCurrency,
            status: u.status || "available",
            floor: u.floor || undefined,
            view: u.view || undefined,
            parking: u.parking ?? undefined,
          };
        }),
        paymentPlan: paymentPlans.length > 0
          ? paymentPlans.map((plan) => ({
              name: plan.name,
              isPostHandover: plan.isPostHandover,
              milestones: plan.milestones.map((m) => ({
                milestone: m.title,
                milestoneHe: m.titleHe || undefined,
                percentage: m.percentage,
                dueDate: m.dueDate || undefined,
                isPostHandover: m.isPostHandover || false,
                description: m.title,
              })),
            }))
          : null,
        paymentPlanText: paymentPlanText || null,
        amenities: amenityIdsToSchema(selectedAmenities),
        neighborhood: proximityPlaces.length > 0
          ? proximityToNeighborhood(proximityPlaces, neighborhood.description, neighborhood.descriptionEn)
          : nearbyPlaces.length > 0 || neighborhood.description ? {
              description: neighborhood.description,
              descriptionEn: neighborhood.descriptionEn || null,
              nearbyPlaces: nearbyPlaces.filter(p => p.name).map(p => ({
                name: p.name,
                nameEn: p.nameEn || null,
                distance: p.distance,
                type: p.type,
              })),
            } : null,
        gallery: gallery.map((img) => ({
          url: img.url,
          alt: img.alt || formData.name,
          type: "image" as const,
          category: img.category || undefined,
        })),
        floorPlans: floorPlans.filter((fp) => fp.name || fp.image).length > 0
          ? floorPlans.filter((fp) => fp.name || fp.image)
          : null,
        highlights: highlights.filter((h) => h.title || h.value).length > 0
          ? highlights.filter((h) => h.title || h.value)
          : null,
        faqs: faqs.filter((f) => f.question && f.answer).length > 0
          ? faqs.filter((f) => f.question && f.answer)
          : null,
        specs: (specs.totalFloors || specs.totalUnits || specs.totalParkingSpaces || specs.buildingHeight || specs.architecturalStyle) ? specs : null,
        investmentMetrics: (investmentMetrics.expectedRoiPercent || investmentMetrics.rentalYieldPercent || investmentMetrics.pricePerSqft || investmentMetrics.occupancyRate || investmentMetrics.capitalAppreciationForecast) ? investmentMetrics : null,
        seo: (seo.title || seo.description) ? seo : null,
      } as any;

      await onSave(projectData);
      toast({ title: "הפרויקט נוצר בהצלחה!" });
    } catch (error) {
      toast({
        title: "שגיאה ביצירת הפרויקט",
        description: error instanceof Error ? error.message : "נסה שוב",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div dir="rtl" className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 sm:inset-2 md:inset-6 lg:inset-12 bg-background border rounded-none sm:rounded-lg shadow-xl flex flex-col overflow-hidden">
        {/* Header with title, auto-save indicator and close */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">הוספת פרויקט חדש</h2>
              {/* Auto-save status indicator */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={autoSaveStatus}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex items-center gap-2 text-xs mt-0.5"
                >
                  {autoSaveStatus === "pending" && (
                    <span className="text-amber-600 flex items-center gap-1">
                      <CloudOff className="h-3 w-3" />
                      שינויים לא נשמרו
                    </span>
                  )}
                  {autoSaveStatus === "saving" && (
                    <span className="text-blue-600 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      שומר טיוטה...
                    </span>
                  )}
                  {autoSaveStatus === "saved" && lastSaved && (
                    <span className="text-green-600 flex items-center gap-1">
                      <Cloud className="h-3 w-3" />
                      נשמר {formatLastSaved()}
                    </span>
                  )}
                  {autoSaveStatus === "error" && (
                    <span className="text-red-600 flex items-center gap-1">
                      <CloudOff className="h-3 w-3" />
                      שגיאה בשמירה
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Progress percentage badge */}
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"} className="text-xs hidden sm:inline-flex">
              {completionPercentage}% הושלם
            </Badge>
            <Button variant="ghost" size="icon" onClick={onCancel} data-testid="button-close-wizard" className="h-8 w-8 sm:h-9 sm:w-9">
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-3 sm:px-4 pt-2">
          <Progress value={completionPercentage} className="h-1.5 sm:h-2" />
        </div>

        {/* Step navigation pills */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b bg-muted/30 overflow-x-auto scrollbar-thin">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isStepValid = stepValidation[index as keyof typeof stepValidation];
            return (
              <TooltipProvider key={step.id} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCurrentStep(index)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all whitespace-nowrap text-xs sm:text-sm font-medium ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                          : isStepValid
                          ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                          : isCompleted && !isStepValid
                          ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                          : "text-muted-foreground hover:bg-muted border border-transparent"
                      }`}
                      data-testid={`button-step-${step.id}`}
                    >
                      <span className="relative flex-shrink-0">
                        {isStepValid && !isActive ? (
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                        ) : isCompleted && !isStepValid ? (
                          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                        ) : (
                          <StepIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                      </span>
                      {/* Show label on sm+ screens, number on mobile */}
                      <span className="hidden sm:inline">{step.label}</span>
                      <span className="sm:hidden">{index + 1}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>{step.label} {isStepValid ? "(הושלם)" : ""}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentStep}-${shakeKey}`}
              initial={{ opacity: 0, x: 20 }}
              animate={shakeKey > 0 && !canProceed() ? "shake" : { opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              variants={{
                ...shakeVariant,
                initial: { opacity: 0, x: 20 },
              }}
              transition={{ duration: 0.2 }}
              onAnimationComplete={() => {
                // Reset shake visual state — the motion.div remounts via key anyway
              }}
            >
              {/* ===== STEP 0: BASICS ===== */}
              {currentStep === 0 && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold">פרטים בסיסיים</h3>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">הזן את פרטי הפרויקט הבסיסיים - שדות חובה מסומנים ב-<span className="text-red-500">*</span></p>
                  </div>

                  <Tabs defaultValue="he" dir="rtl" className="w-full">
                    <TabsList dir="rtl" className="grid w-full grid-cols-2">
                      <TabsTrigger value="he">עברית</TabsTrigger>
                      <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="he" className="space-y-4 mt-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <RequiredLabel htmlFor="project-name-he" hint="שם הפרויקט כפי שיוצג ללקוחות באתר">שם הפרויקט</RequiredLabel>
                          <FieldStatus isValid={validation.name.isValid} message={validation.name.message} />
                        </div>
                        <Input
                          id="project-name-he"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="לדוגמה: THE CADEN - הזן לפחות 2 תווים"
                          className={`text-end ${validation.name.isValid ? "border-green-300 focus:ring-green-500" : formData.name ? "border-red-300" : ""}`}
                          dir="rtl"
                          aria-label="שם הפרויקט"
                          aria-invalid={!validation.name.isValid && !!formData.name}
                          aria-describedby={!validation.name.isValid ? "project-name-error" : undefined}
                          data-testid="input-project-name-he"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <RequiredLabel htmlFor="location-he" hint="עיר ושכונה - לדוגמה: Meydan, דובאי">מיקום</RequiredLabel>
                          <FieldStatus isValid={validation.location.isValid} message={validation.location.message} />
                        </div>
                        <Input
                          id="location-he"
                          value={formData.location}
                          onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="לדוגמה: Meydan, דובאי - שכונה ועיר"
                          className={`text-end ${validation.location.isValid ? "border-green-300 focus:ring-green-500" : formData.location ? "border-red-300" : ""}`}
                          dir="rtl"
                          aria-label="מיקום הפרויקט"
                          aria-invalid={!validation.location.isValid && !!formData.location}
                          aria-describedby={!validation.location.isValid ? "location-error" : undefined}
                          data-testid="input-location-he"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="en" className="space-y-4 mt-4">
                      <div>
                        <Label>Project Name</Label>
                        <Input
                          value={formData.nameEn}
                          onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                          placeholder="e.g., THE CADEN"
                          data-testid="input-project-name-en"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={formData.locationEn}
                          onChange={(e) => setFormData((prev) => ({ ...prev, locationEn: e.target.value }))}
                          placeholder="e.g., Meydan, Dubai"
                          data-testid="input-location-en"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Developer Selection Section */}
                  <Card className="p-4 border-slate-200">
                    <DeveloperPicker
                      developerName={formData.developer}
                      developerLogo={formData.developerLogo}
                      onDeveloperNameChange={(name) => setFormData((prev) => ({ ...prev, developer: name }))}
                      onDeveloperLogoChange={(logoUrl) => setFormData((prev) => ({ ...prev, developerLogo: logoUrl }))}
                      isValid={validation.developer.isValid}
                      validationMessage={validation.developer.message}
                      showPreview={true}
                    />
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FieldHint hint="סוג הנכס הראשי בפרויקט"><Label>סוג הנכס</Label></FieldHint>
                      <Select
                        dir="rtl"
                        value={formData.propertyType}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, propertyType: value }))}
                      >
                        <SelectTrigger data-testid="select-property-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="דירה">דירה</SelectItem>
                          <SelectItem value="פנטהאוז">פנטהאוז</SelectItem>
                          <SelectItem value="וילה">וילה</SelectItem>
                          <SelectItem value="טאון האוס">טאון האוס</SelectItem>
                          <SelectItem value="סטודיו">סטודיו</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <FieldHint hint="ייעוד הבניין - מגורים, מסחרי וכו׳"><Label>סוג בניין</Label></FieldHint>
                      <Select
                        dir="rtl"
                        value={formData.buildingType}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, buildingType: value }))}
                      >
                        <SelectTrigger data-testid="select-building-type">
                          <SelectValue placeholder="בחר סוג בניין" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">מגורים</SelectItem>
                          <SelectItem value="commercial">מסחרי</SelectItem>
                          <SelectItem value="mixed-use">שימוש מעורב</SelectItem>
                          <SelectItem value="hotel">מלונאות</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <RequiredLabel htmlFor="price-from" hint="המחיר הנמוך ביותר של יחידה בפרויקט">מחיר התחלתי</RequiredLabel>
                        <FieldStatus isValid={validation.priceFrom.isValid} message={validation.priceFrom.message} />
                      </div>
                      <Input
                        id="price-from"
                        type="number"
                        value={formData.priceFrom || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, priceFrom: parseInt(e.target.value) || 0 }))}
                        placeholder="1800000"
                        min={0}
                        className={validation.priceFrom.isValid ? "border-green-300 focus:ring-green-500" : formData.priceFrom ? "border-red-300" : ""}
                        aria-label="מחיר התחלתי"
                        aria-invalid={!validation.priceFrom.isValid && !!formData.priceFrom}
                        aria-describedby={!validation.priceFrom.isValid ? "price-error" : undefined}
                        data-testid="input-price-from"
                      />
                    </div>
                    <div>
                      <FieldHint hint="מטבע ההצגה של המחירים באתר"><Label>מטבע</Label></FieldHint>
                      <Select
                        dir="rtl"
                        value={formData.priceCurrency}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, priceCurrency: value }))}
                      >
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AED">AED</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="ILS">ILS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <FieldHint hint="רבעון ושנה צפויים למסירת המפתחות"><Label>מסירה צפויה</Label></FieldHint>
                      <Input
                        value={formData.completionDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, completionDate: e.target.value }))}
                        placeholder="לדוגמה: Q4 2028"
                        data-testid="input-completion-date"
                      />
                    </div>
                  </div>

                  {/* Video URL */}
                  <div>
                    <FieldHint hint="קישור ליוטיוב או וימאו - סרטון של הפרויקט">
                      <Label className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-purple-500" />
                        קישור לסרטון
                      </Label>
                    </FieldHint>
                    <Input
                      value={formData.videoUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=... (לא חובה)"
                      dir="ltr"
                      data-testid="input-video-url"
                    />
                  </div>

                  {/* Brochure URL */}
                  <div>
                    <FieldHint hint="קובץ PDF של הברושור - ניתן להעלות או להדביק קישור">
                      <Label className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-amber-500" />
                        קישור לברושור (PDF)
                      </Label>
                    </FieldHint>
                    <div className="flex gap-2">
                      <Input
                        value={formData.brochureUrl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, brochureUrl: e.target.value }))}
                        placeholder="הדבק URL או העלה קובץ"
                        dir="ltr"
                        className="flex-1"
                        data-testid="input-brochure-url"
                      />
                      <Button variant="outline" size="sm" className="h-9 px-2" onClick={handleBrochureUpload}>
                        <Upload className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Dubai-Specific Fields */}
                  <Card className="p-5 border-slate-200">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      פרטי דובאי ורגולציה
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Project Status */}
                      <div>
                        <Label>סטטוס פרויקט</Label>
                        <Select
                          dir="rtl"
                          value={formData.projectStatus}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, projectStatus: value }))}
                        >
                          <SelectTrigger data-testid="select-project-status">
                            <SelectValue placeholder="בחר סטטוס" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="off-plan">Off-Plan</SelectItem>
                            <SelectItem value="under-construction">בבנייה</SelectItem>
                            <SelectItem value="ready-to-move">מוכן למסירה</SelectItem>
                            <SelectItem value="completed">הושלם</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Ownership */}
                      <div>
                        <Label>סוג בעלות</Label>
                        <Select
                          dir="rtl"
                          value={formData.ownership}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, ownership: value }))}
                        >
                          <SelectTrigger data-testid="select-ownership">
                            <SelectValue placeholder="בחר סוג בעלות" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="freehold">Freehold</SelectItem>
                            <SelectItem value="leasehold">Leasehold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* RERA Number */}
                      <div>
                        <Label>מספר RERA/DLD</Label>
                        <Input
                          value={formData.reraNumber}
                          onChange={(e) => setFormData((prev) => ({ ...prev, reraNumber: e.target.value }))}
                          placeholder="e.g. 12345"
                          dir="ltr"
                          data-testid="input-rera-number"
                        />
                      </div>

                      {/* DLD Number */}
                      <div>
                        <Label>מספר רישום DLD</Label>
                        <Input
                          value={formData.dldNumber}
                          onChange={(e) => setFormData((prev) => ({ ...prev, dldNumber: e.target.value }))}
                          placeholder="e.g. DLD-2024-001"
                          dir="ltr"
                          data-testid="input-dld-number"
                        />
                      </div>

                      {/* Furnishing */}
                      <div>
                        <Label>רמת ריהוט</Label>
                        <Select
                          dir="rtl"
                          value={formData.furnishing}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, furnishing: value }))}
                        >
                          <SelectTrigger data-testid="select-furnishing">
                            <SelectValue placeholder="בחר רמת ריהוט" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="furnished">Furnished</SelectItem>
                            <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                            <SelectItem value="unfurnished">Unfurnished</SelectItem>
                            <SelectItem value="shell-core">Shell & Core</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Service Charge */}
                      <div>
                        <Label>דמי ניהול (Service Charge)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={formData.serviceCharge || ""}
                            onChange={(e) => setFormData((prev) => ({ ...prev, serviceCharge: parseFloat(e.target.value) || 0 }))}
                            placeholder="15"
                            min={0}
                            className="pe-28"
                            data-testid="input-service-charge"
                          />
                          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">AED/sqft/year</span>
                        </div>
                      </div>

                      {/* Number of Buildings */}
                      <div>
                        <Label>מספר מגדלים/בניינים</Label>
                        <Input
                          type="number"
                          value={formData.numberOfBuildings || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, numberOfBuildings: parseInt(e.target.value) || 1 }))}
                          min={1}
                          data-testid="input-number-of-buildings"
                        />
                      </div>

                      {/* Commission % */}
                      <div>
                        <Label>עמלת סוכן (%)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step={0.5}
                            value={formData.commissionPercent || ""}
                            onChange={(e) => setFormData((prev) => ({ ...prev, commissionPercent: parseFloat(e.target.value) || 0 }))}
                            placeholder="2.0"
                            min={0}
                            max={100}
                            className="pe-8"
                            data-testid="input-commission-percent"
                          />
                          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                      </div>

                      {/* Launch Date */}
                      <div>
                        <Label>תאריך השקה</Label>
                        <Input
                          type="date"
                          value={formData.launchDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, launchDate: e.target.value }))}
                          dir="ltr"
                          data-testid="input-launch-date"
                        />
                      </div>

                      {/* Google Maps URL */}
                      <div>
                        <Label>קישור Google Maps</Label>
                        <Input
                          value={formData.googleMapsUrl}
                          onChange={(e) => setFormData((prev) => ({ ...prev, googleMapsUrl: e.target.value }))}
                          placeholder="https://maps.google.com/..."
                          dir="ltr"
                          data-testid="input-google-maps-url"
                        />
                      </div>
                    </div>

                    {/* Construction Progress - conditional */}
                    {(formData.projectStatus === "off-plan" || formData.projectStatus === "under-construction") && (
                      <div className="mt-4">
                        <Label className="flex items-center justify-between mb-2">
                          <span>אחוז התקדמות בנייה</span>
                          <Badge variant="secondary" className="text-sm">{formData.constructionProgress}%</Badge>
                        </Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[formData.constructionProgress]}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, constructionProgress: value[0] }))}
                            min={0}
                            max={100}
                            step={1}
                            className="flex-1"
                            data-testid="slider-construction-progress"
                          />
                          <Input
                            type="number"
                            value={formData.constructionProgress}
                            onChange={(e) => setFormData((prev) => ({ ...prev, constructionProgress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))}
                            min={0}
                            max={100}
                            className="w-20 h-9 text-sm text-center"
                            data-testid="input-construction-progress"
                          />
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="mt-4">
                      <Label className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-blue-500" />
                        תגיות
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[
                          "Waterfront", "Branded Residence", "Golf View", "Beach Access", "Smart Home",
                          "Sea View", "City View", "Canal View", "Park View", "Infinity Pool",
                          "Private Beach", "Concierge", "Valet Parking",
                        ].map((tag) => (
                          <Badge
                            key={tag}
                            variant={formData.tags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer transition-colors hover:bg-primary/20"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                tags: prev.tags.includes(tag)
                                  ? prev.tags.filter((t) => t !== tag)
                                  : [...prev.tags, tag],
                              }));
                            }}
                            data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {/* Custom tag input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="הוסף תגית מותאמת אישית..."
                          dir="ltr"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const value = (e.target as HTMLInputElement).value.trim();
                              if (value && !formData.tags.includes(value)) {
                                setFormData((prev) => ({ ...prev, tags: [...prev.tags, value] }));
                                (e.target as HTMLInputElement).value = "";
                              }
                              e.preventDefault();
                            }
                          }}
                          className="flex-1"
                          data-testid="input-custom-tag"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector("input") as HTMLInputElement;
                            const value = input?.value?.trim();
                            if (value && !formData.tags.includes(value)) {
                              setFormData((prev) => ({ ...prev, tags: [...prev.tags, value] }));
                              input.value = "";
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Display selected tags */}
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 p-2 bg-muted/30 rounded-lg">
                          {formData.tags.map((tag) => (
                            <Badge key={tag} variant="default" className="gap-1 pe-1">
                              {tag}
                              <button
                                onClick={() => setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}
                                className="ms-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* ===== STEP 1: DESCRIPTION ===== */}
              {currentStep === 1 && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold">תיאור הפרויקט</h3>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">הוסף תיאור מפורט של הפרויקט - תיאור טוב מעלה את סיכויי המכירה</p>
                  </div>

                  {/* Hint card for empty description */}
                  {!formData.description && !formData.tagline && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">טיפ לכתיבת תיאור מוצלח</p>
                        <p>ציין את היתרונות הבולטים: מיקום, נוף, מתקנים, תשואה צפויה, וקרבה לציר תחבורה. תיאור של 3-5 משפטים הוא אידיאלי.</p>
                      </div>
                    </div>
                  )}

                  <Tabs defaultValue="he" dir="rtl" className="w-full">
                    <TabsList dir="rtl" className="grid w-full grid-cols-2">
                      <TabsTrigger value="he">עברית</TabsTrigger>
                      <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="he" className="space-y-4 mt-4">
                      <div>
                        <FieldHint hint="משפט קצר ומושך שמתאר את הפרויקט בקצרה"><Label>כותרת משנה (טאגליין)</Label></FieldHint>
                        <Input
                          value={formData.tagline}
                          onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                          placeholder="לדוגמה: בניין יוקרתי על הלגונה העתידית"
                          className="text-end"
                          dir="rtl"
                          data-testid="input-tagline-he"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <RequiredLabel htmlFor="description-he" hint="תיאור מפורט של הפרויקט - לפחות 20 תווים">תיאור מלא</RequiredLabel>
                          <FieldStatus isValid={validation.description.isValid} message={validation.description.message} />
                        </div>
                        <Textarea
                          id="description-he"
                          value={formData.description}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="תאר את הפרויקט, המיקום, המתקנים והיתרונות..."
                          className={`min-h-[200px] text-end ${validation.description.isValid ? "border-green-300 focus:ring-green-500" : formData.description ? "border-amber-300" : ""}`}
                          dir="rtl"
                          aria-label="תיאור מלא של הפרויקט"
                          aria-invalid={!validation.description.isValid && !!formData.description}
                          aria-describedby={!validation.description.isValid ? "description-error" : undefined}
                          data-testid="textarea-description-he"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="en" className="space-y-4 mt-4">
                      <div>
                        <Label>Tagline</Label>
                        <Input
                          value={formData.taglineEn}
                          onChange={(e) => setFormData((prev) => ({ ...prev, taglineEn: e.target.value }))}
                          placeholder="e.g., Luxury living on the future lagoon"
                          data-testid="input-tagline-en"
                        />
                      </div>
                      <div>
                        <Label>Full Description</Label>
                        <Textarea
                          value={formData.descriptionEn}
                          onChange={(e) => setFormData((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                          placeholder="Describe the project, location, amenities and advantages..."
                          className="min-h-[200px]"
                          data-testid="textarea-description-en"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* ===== STEP 2: UNITS ===== */}
              {currentStep === 2 && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold">סוגי יחידות ומחירים</h3>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">הגדר את סוגי הדירות, הגדלים והמחירים - לפחות סוג יחידה אחד נדרש</p>
                  </div>

                  {/* Quick Unit Type Pricing */}
                  <Card className="p-5 border-slate-200">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                      מחירון מהיר לפי סוג יחידה
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">הגדר מחיר התחלתי, טווח גדלים וזמינות עבור כל סוג יחידה</p>
                    <div className="space-y-3">
                      {/* Header row - hidden on mobile */}
                      <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground px-1">
                        <div className="col-span-2">סוג</div>
                        <div className="col-span-3">מחיר התחלתי</div>
                        <div className="col-span-3">טווח גדלים (מ"ר)</div>
                        <div className="col-span-2">זמין</div>
                        <div className="col-span-2"></div>
                      </div>
                      {unitTypePricing.map((item, index) => (
                        <div key={index} className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3 items-center p-2 sm:p-0 rounded-lg sm:rounded-none bg-muted/30 sm:bg-transparent">
                          <div className="col-span-2 sm:col-span-2">
                            <span className="text-sm font-medium">{item.labelHe}</span>
                          </div>
                          <div className="col-span-1 sm:col-span-3">
                            <Label className="text-xs sm:hidden text-muted-foreground">מחיר</Label>
                            <Input
                              type="number"
                              value={item.startingPrice || ""}
                              onChange={(e) => updateUnitTypePricing(index, "startingPrice", parseInt(e.target.value) || 0)}
                              placeholder="0"
                              min={0}
                              className="h-9 text-sm"
                              data-testid={`input-unit-type-price-${index}`}
                            />
                          </div>
                          <div className="col-span-1 sm:col-span-3">
                            <Label className="text-xs sm:hidden text-muted-foreground">גדלים</Label>
                            <Input
                              value={item.sizeRange}
                              onChange={(e) => updateUnitTypePricing(index, "sizeRange", e.target.value)}
                              placeholder="40-60"
                              className="h-9 text-sm"
                              data-testid={`input-unit-type-size-${index}`}
                            />
                          </div>
                          <div className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 sm:gap-0">
                            <Label className="text-xs sm:hidden text-muted-foreground">זמין</Label>
                            <Switch
                              checked={item.available}
                              onCheckedChange={(checked) => updateUnitTypePricing(index, "available", checked)}
                              data-testid={`switch-unit-type-available-${index}`}
                            />
                          </div>
                          <div className="col-span-1 sm:col-span-2 flex items-center">
                            <Badge variant={item.available ? "default" : "secondary"} className="text-xs">
                              {item.available ? "זמין" : "לא זמין"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Collapsible Individual Units */}
                  <Card className="p-4 border-slate-200">
                    <button
                      onClick={() => setUnitsCollapsed(!unitsCollapsed)}
                      className="w-full flex items-center justify-between"
                    >
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-blue-500" />
                        יחידות בודדות ({units.length})
                      </h4>
                      {unitsCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </button>

                    {!unitsCollapsed && (
                      <div className="mt-4 space-y-4">
                        {units.map((unit, index) => (
                          <Card key={index} className="p-4 bg-slate-50">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium">יחידה {index + 1}</h4>
                              {units.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeUnit(index)}
                                  data-testid={`button-remove-unit-${index}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                              <div>
                                <Label className="text-xs">סוג</Label>
                                <Input
                                  value={unit.typeHe}
                                  onChange={(e) => updateUnit(index, "typeHe", e.target.value)}
                                  placeholder="דירה / פנטהאוז"
                                  className="h-9 text-sm"
                                  data-testid={`input-unit-type-${index}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">חדרי שינה</Label>
                                <Select
                                  dir="rtl"
                                  value={unit.bedrooms}
                                  onValueChange={(value) => updateUnit(index, "bedrooms", value)}
                                >
                                  <SelectTrigger className="h-9 text-sm" data-testid={`select-unit-bedrooms-${index}`}>
                                    <SelectValue placeholder="בחר" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">סטודיו</SelectItem>
                                    <SelectItem value="1">1 חדר</SelectItem>
                                    <SelectItem value="2">2 חדרים</SelectItem>
                                    <SelectItem value="3">3 חדרים</SelectItem>
                                    <SelectItem value="4">4 חדרים</SelectItem>
                                    <SelectItem value="5">5+ חדרים</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">גודל מ- (מ״ר)</Label>
                                <Input
                                  type="number"
                                  value={unit.sizeFrom || ""}
                                  onChange={(e) => updateUnit(index, "sizeFrom", parseInt(e.target.value) || 0)}
                                  placeholder="75"
                                  min={0}
                                  className="h-9 text-sm"
                                  data-testid={`input-unit-size-from-${index}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">גודל עד (מ״ר)</Label>
                                <Input
                                  type="number"
                                  value={unit.sizeTo || ""}
                                  onChange={(e) => updateUnit(index, "sizeTo", parseInt(e.target.value) || 0)}
                                  placeholder="83"
                                  min={0}
                                  className="h-9 text-sm"
                                  data-testid={`input-unit-size-to-${index}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">מחיר מ-</Label>
                                <Input
                                  type="number"
                                  value={unit.priceFrom || ""}
                                  onChange={(e) => updateUnit(index, "priceFrom", parseInt(e.target.value) || 0)}
                                  placeholder="1800000"
                                  min={0}
                                  className="h-9 text-sm"
                                  data-testid={`input-unit-price-from-${index}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">מחיר עד</Label>
                                <Input
                                  type="number"
                                  value={unit.priceTo || ""}
                                  onChange={(e) => updateUnit(index, "priceTo", parseInt(e.target.value) || 0)}
                                  placeholder="2200000"
                                  min={0}
                                  className={`h-9 text-sm ${unit.priceFrom && unit.priceTo && unit.priceFrom > unit.priceTo ? "border-red-400" : ""}`}
                                  data-testid={`input-unit-price-to-${index}`}
                                />
                                {unit.priceFrom > 0 && unit.priceTo > 0 && unit.priceFrom > unit.priceTo && (
                                  <p className="text-xs text-red-500 mt-0.5">מחיר מ- גבוה ממחיר עד</p>
                                )}
                              </div>
                              <div>
                                <Label className="text-xs">קומה</Label>
                                <Input
                                  value={unit.floor || ""}
                                  onChange={(e) => updateUnit(index, "floor", e.target.value)}
                                  placeholder="1-40"
                                  className="h-9 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">סטטוס</Label>
                                <Select
                                  dir="rtl"
                                  value={unit.status || "available"}
                                  onValueChange={(value) => updateUnit(index, "status", value)}
                                >
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="available">זמין</SelectItem>
                                    <SelectItem value="sold">נמכר</SelectItem>
                                    <SelectItem value="reserved">שמור</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">נוף</Label>
                                <Select
                                  dir="rtl"
                                  value={unit.view || ""}
                                  onValueChange={(value) => updateUnit(index, "view", value)}
                                >
                                  <SelectTrigger className="h-9 text-sm" data-testid={`select-unit-view-${index}`}>
                                    <SelectValue placeholder="בחר נוף" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sea-view">Sea View</SelectItem>
                                    <SelectItem value="city-view">City View</SelectItem>
                                    <SelectItem value="golf-view">Golf View</SelectItem>
                                    <SelectItem value="garden-view">Garden View</SelectItem>
                                    <SelectItem value="canal-view">Canal View</SelectItem>
                                    <SelectItem value="pool-view">Pool View</SelectItem>
                                    <SelectItem value="park-view">Park View</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">חניות</Label>
                                <Input
                                  type="number"
                                  value={unit.parking ?? ""}
                                  onChange={(e) => updateUnit(index, "parking", parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                  min={0}
                                  max={3}
                                  className="h-9 text-sm"
                                  data-testid={`input-unit-parking-${index}`}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}

                        <Button variant="outline" onClick={addUnit} className="w-full" data-testid="button-add-unit">
                          <Plus className="h-4 w-4 ms-2" />
                          הוסף סוג יחידה
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* ===== STEP 3: PAYMENT PLAN BUILDER ===== */}
              {currentStep === 3 && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold">תוכנית תשלומים</h3>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">הגדר תוכניות תשלום מפורטות עם אבני דרך - שלב אופציונלי</p>
                  </div>

                  {/* Quick Templates */}
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">תבניות מהירות</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {([
                        {
                          label: "80/20",
                          desc: "80% בנייה, 20% מסירה",
                          plan: {
                            name: "80/20 Plan",
                            isPostHandover: false,
                            milestones: [
                              { title: "On Booking", titleHe: "בהזמנה", percentage: 10, isPostHandover: false },
                              { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 70, isPostHandover: false },
                              { title: "On Handover", titleHe: "במסירה", percentage: 20, isPostHandover: false },
                            ],
                          },
                        },
                        {
                          label: "60/40",
                          desc: "60% בנייה, 40% אחרי מסירה",
                          plan: {
                            name: "60/40 Post-Handover Plan",
                            isPostHandover: true,
                            milestones: [
                              { title: "On Booking", titleHe: "בהזמנה", percentage: 10, isPostHandover: false },
                              { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 50, isPostHandover: false },
                              { title: "On Handover", titleHe: "במסירה", percentage: 10, isPostHandover: false },
                              { title: "Post-Handover (12 months)", titleHe: "לאחר מסירה (12 חודשים)", percentage: 30, isPostHandover: true },
                            ],
                          },
                        },
                        {
                          label: "70/30",
                          desc: "70% בנייה, 30% אחרי מסירה",
                          plan: {
                            name: "70/30 Post-Handover Plan",
                            isPostHandover: true,
                            milestones: [
                              { title: "On Booking", titleHe: "בהזמנה", percentage: 10, isPostHandover: false },
                              { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 60, isPostHandover: false },
                              { title: "On Handover", titleHe: "במסירה", percentage: 10, isPostHandover: true },
                              { title: "Post-Handover (24 months)", titleHe: "לאחר מסירה (24 חודשים)", percentage: 20, isPostHandover: true },
                            ],
                          },
                        },
                        {
                          label: "50/50",
                          desc: "חלוקה שווה",
                          plan: {
                            name: "50/50 Plan",
                            isPostHandover: true,
                            milestones: [
                              { title: "On Booking", titleHe: "בהזמנה", percentage: 10, isPostHandover: false },
                              { title: "During Construction", titleHe: "במהלך הבנייה", percentage: 40, isPostHandover: false },
                              { title: "On Handover", titleHe: "במסירה", percentage: 10, isPostHandover: true },
                              { title: "Post-Handover", titleHe: "לאחר מסירה", percentage: 40, isPostHandover: true },
                            ],
                          },
                        },
                        {
                          label: "Custom",
                          desc: "תוכנית ריקה להזנה ידנית",
                          plan: {
                            name: "",
                            isPostHandover: false,
                            milestones: [
                              { title: "", titleHe: "", percentage: 0, isPostHandover: false },
                            ],
                          },
                        },
                      ] as { label: string; desc: string; plan: PaymentPlanData }[]).map((tpl) => (
                        <TooltipProvider key={tpl.label} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() =>
                                  setPaymentPlans((prev) => [
                                    ...prev,
                                    {
                                      ...tpl.plan,
                                      milestones: tpl.plan.milestones.map((m) => ({ ...m })),
                                    },
                                  ])
                                }
                              >
                                <Copy className="h-3.5 w-3.5" />
                                {tpl.label}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-xs">{tpl.desc}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </Card>

                  {/* Empty state */}
                  {paymentPlans.length === 0 && (
                    <EmptyStateHint
                      icon={CreditCard}
                      title="אין תוכניות תשלום"
                      description="השתמש בתבניות המהירות למעלה או הוסף תוכנית ידנית. שלב זה אופציונלי."
                    />
                  )}

                  {/* Payment Plans List */}
                  <div className="space-y-6">
                    {paymentPlans.map((plan, planIdx) => {
                      const totalPct = plan.milestones.reduce((sum, m) => sum + m.percentage, 0);
                      const preHandover = plan.milestones.filter((m) => !m.isPostHandover).reduce((s, m) => s + m.percentage, 0);
                      const postHandover = plan.milestones.filter((m) => m.isPostHandover).reduce((s, m) => s + m.percentage, 0);
                      return (
                        <Card key={planIdx} className="p-4 sm:p-5 space-y-4">
                          {/* Plan Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <Badge variant={totalPct === 100 ? "default" : "secondary"} className="text-xs flex-shrink-0">
                                  {totalPct === 100 ? (
                                    <CheckCircle2 className="h-3 w-3 me-1" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 me-1" />
                                  )}
                                  {totalPct}%
                                </Badge>
                                <Input
                                  value={plan.name}
                                  onChange={(e) => {
                                    const updated = [...paymentPlans];
                                    updated[planIdx] = { ...updated[planIdx], name: e.target.value };
                                    setPaymentPlans(updated);
                                  }}
                                  placeholder="שם התוכנית (לדוגמה: 60/40 Plan)"
                                  className="font-medium"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <Switch
                                  id={`plan-post-handover-${planIdx}`}
                                  checked={plan.isPostHandover}
                                  onCheckedChange={(checked) => {
                                    const updated = [...paymentPlans];
                                    updated[planIdx] = { ...updated[planIdx], isPostHandover: checked };
                                    setPaymentPlans(updated);
                                  }}
                                />
                                <Label htmlFor={`plan-post-handover-${planIdx}`} className="text-sm text-muted-foreground cursor-pointer">
                                  תוכנית עם תשלום לאחר מסירה (Post-Handover)
                                </Label>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                              onClick={() => setPaymentPlans((prev) => prev.filter((_, i) => i !== planIdx))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Visual Summary Bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>לפני מסירה: {preHandover}%</span>
                              <span>לאחר מסירה: {postHandover}%</span>
                            </div>
                            <div className="w-full h-6 rounded-full bg-muted/50 overflow-hidden flex">
                              {plan.milestones.map((m, mIdx) => {
                                if (m.percentage <= 0) return null;
                                const isPost = m.isPostHandover;
                                return (
                                  <TooltipProvider key={mIdx} delayDuration={100}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`h-full flex items-center justify-center text-[10px] font-medium text-white transition-all ${
                                            isPost
                                              ? "bg-amber-500 hover:bg-amber-600"
                                              : "bg-primary hover:bg-primary/90"
                                          } ${mIdx === 0 ? "rounded-s-full" : ""} ${
                                            mIdx === plan.milestones.length - 1 ? "rounded-e-full" : ""
                                          }`}
                                          style={{ width: `${Math.max(m.percentage, 2)}%` }}
                                        >
                                          {m.percentage >= 8 ? `${m.percentage}%` : ""}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p className="text-xs font-medium">{m.title || m.titleHe || `Milestone ${mIdx + 1}`}</p>
                                        <p className="text-xs">{m.percentage}% {isPost ? "(post-handover)" : "(pre-handover)"}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })}
                              {totalPct < 100 && (
                                <div
                                  className="h-full bg-muted-foreground/10 flex items-center justify-center text-[10px] text-muted-foreground"
                                  style={{ width: `${100 - totalPct}%` }}
                                >
                                  {100 - totalPct >= 8 ? `${100 - totalPct}%` : ""}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm bg-primary" />
                                <span>לפני מסירה</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm bg-amber-500" />
                                <span>אחרי מסירה</span>
                              </div>
                              {totalPct !== 100 && (
                                <span className={`ms-auto font-medium ${totalPct > 100 ? "text-red-500" : "text-amber-600"}`}>
                                  {totalPct > 100 ? `חריגה: ${totalPct - 100}% עודף` : `חסרים ${100 - totalPct}%`}
                                </span>
                              )}
                              {totalPct === 100 && (
                                <span className="ms-auto font-medium text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  100% - תקין
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Milestones */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-semibold">אבני דרך ({plan.milestones.length})</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updated = [...paymentPlans];
                                  updated[planIdx] = {
                                    ...updated[planIdx],
                                    milestones: [
                                      ...updated[planIdx].milestones,
                                      { title: "", titleHe: "", percentage: 0, isPostHandover: false },
                                    ],
                                  };
                                  setPaymentPlans(updated);
                                }}
                              >
                                <Plus className="h-3.5 w-3.5 ms-1" />
                                אבן דרך
                              </Button>
                            </div>

                            {plan.milestones.map((milestone, mIdx) => (
                              <Card key={mIdx} className={`p-3 border ${milestone.isPostHandover ? "border-amber-200 bg-amber-50/50" : "border-border"}`}>
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                                  {/* Title EN */}
                                  <div className="sm:col-span-3">
                                    <Label className="text-xs text-muted-foreground">Title (EN)</Label>
                                    <Input
                                      value={milestone.title}
                                      onChange={(e) => {
                                        const updated = [...paymentPlans];
                                        const ms = [...updated[planIdx].milestones];
                                        ms[mIdx] = { ...ms[mIdx], title: e.target.value };
                                        updated[planIdx] = { ...updated[planIdx], milestones: ms };
                                        setPaymentPlans(updated);
                                      }}
                                      placeholder="On Booking"
                                      className="text-sm"
                                    />
                                  </div>
                                  {/* Title HE */}
                                  <div className="sm:col-span-3">
                                    <Label className="text-xs text-muted-foreground">כותרת (עברית)</Label>
                                    <Input
                                      value={milestone.titleHe || ""}
                                      onChange={(e) => {
                                        const updated = [...paymentPlans];
                                        const ms = [...updated[planIdx].milestones];
                                        ms[mIdx] = { ...ms[mIdx], titleHe: e.target.value };
                                        updated[planIdx] = { ...updated[planIdx], milestones: ms };
                                        setPaymentPlans(updated);
                                      }}
                                      placeholder="בהזמנה"
                                      className="text-sm"
                                    />
                                  </div>
                                  {/* Percentage */}
                                  <div className="sm:col-span-2">
                                    <Label className="text-xs text-muted-foreground">אחוז (%)</Label>
                                    <Input
                                      type="number"
                                      value={milestone.percentage}
                                      onChange={(e) => {
                                        const updated = [...paymentPlans];
                                        const ms = [...updated[planIdx].milestones];
                                        ms[mIdx] = { ...ms[mIdx], percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) };
                                        updated[planIdx] = { ...updated[planIdx], milestones: ms };
                                        setPaymentPlans(updated);
                                      }}
                                      min={0}
                                      max={100}
                                      className="text-sm"
                                    />
                                  </div>
                                  {/* Due Date */}
                                  <div className="sm:col-span-2">
                                    <Label className="text-xs text-muted-foreground">תאריך (אופציונלי)</Label>
                                    <Input
                                      type="date"
                                      value={milestone.dueDate || ""}
                                      onChange={(e) => {
                                        const updated = [...paymentPlans];
                                        const ms = [...updated[planIdx].milestones];
                                        ms[mIdx] = { ...ms[mIdx], dueDate: e.target.value };
                                        updated[planIdx] = { ...updated[planIdx], milestones: ms };
                                        setPaymentPlans(updated);
                                      }}
                                      className="text-sm"
                                    />
                                  </div>
                                  {/* Post-handover + Delete */}
                                  <div className="sm:col-span-2 flex items-end gap-2 pb-0.5">
                                    <div className="flex items-center gap-1.5 flex-1">
                                      <Switch
                                        id={`ms-post-${planIdx}-${mIdx}`}
                                        checked={milestone.isPostHandover || false}
                                        onCheckedChange={(checked) => {
                                          const updated = [...paymentPlans];
                                          const ms = [...updated[planIdx].milestones];
                                          ms[mIdx] = { ...ms[mIdx], isPostHandover: checked };
                                          updated[planIdx] = { ...updated[planIdx], milestones: ms };
                                          setPaymentPlans(updated);
                                        }}
                                      />
                                      <Label htmlFor={`ms-post-${planIdx}-${mIdx}`} className="text-[10px] text-muted-foreground cursor-pointer leading-tight">
                                        Post
                                      </Label>
                                    </div>
                                    {plan.milestones.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                          const updated = [...paymentPlans];
                                          const ms = updated[planIdx].milestones.filter((_, i) => i !== mIdx);
                                          updated[planIdx] = { ...updated[planIdx], milestones: ms };
                                          setPaymentPlans(updated);
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Add Plan Button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      setPaymentPlans((prev) => [
                        ...prev,
                        {
                          name: "",
                          isPostHandover: false,
                          milestones: [{ title: "", titleHe: "", percentage: 0, isPostHandover: false }],
                        },
                      ])
                    }
                  >
                    <Plus className="h-4 w-4 ms-2" />
                    הוסף תוכנית תשלומים
                  </Button>

                  {/* Simple text fallback */}
                  <Card className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-semibold">טקסט תוכנית תשלומים (גיבוי)</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">שדה טקסט חופשי למקרה שהתוכנית המפורטת לא מתאימה, או כתוספת לתיאור.</p>
                    <Textarea
                      value={paymentPlanText}
                      onChange={(e) => setPaymentPlanText(e.target.value)}
                      placeholder="לדוגמה: 60/40 payment plan with post-handover installments over 3 years..."
                      data-testid="textarea-payment-plan-text"
                      rows={3}
                    />
                  </Card>
                </div>
              )}

              {/* ===== STEP 4: AMENITIES ===== */}
              {currentStep === 4 && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold">מתקנים ושירותים</h3>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                      בחר את המתקנים הזמינים בפרויקט (מינימום 3) - לחץ על מתקן לבחירה/ביטול
                    </p>
                    {/* Selection counter */}
                    <div className="mt-3">
                      <Badge variant={selectedAmenities.length >= 3 ? "default" : "secondary"} className="text-sm px-3 py-1">
                        {selectedAmenities.length >= 3 ? (
                          <CheckCircle2 className="h-3.5 w-3.5 me-1.5 inline" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 me-1.5 inline" />
                        )}
                        נבחרו {selectedAmenities.length} מתקנים {selectedAmenities.length < 3 ? `(חסרים ${3 - selectedAmenities.length})` : ""}
                      </Badge>
                    </div>
                  </div>

                  <AmenitiesEditor
                    selectedIds={selectedAmenities}
                    onChange={setSelectedAmenities}
                    dir="rtl"
                  />
                </div>
              )}

              {/* ===== STEP 5: LOCATION ===== */}
              {currentStep === 5 && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold">מיקום ושכונה</h3>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">הוסף מידע על השכונה ומקומות קרובים - שלב אופציונלי</p>
                  </div>

                  {/* Empty state hint */}
                  {!neighborhood.description && !coordinates?.lat && proximityPlaces.length === 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">מידע על המיקום עוזר ללקוחות</p>
                        <p>הוסף קואורדינטות להצגה על המפה, תיאור השכונה, ומקומות קרובים (קניונים, בתי ספר, חופים). שלב זה אופציונלי אך מומלץ.</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Coordinates */}
                    <Card className="p-4 border-slate-200">
                      <FieldHint hint="ניתן למצוא קואורדינטות ב-Google Maps - לחיצה ימנית על המיקום">
                        <Label className="text-base font-medium flex items-center gap-2 mb-3">
                          <Globe className="h-4 w-4 text-blue-500" />
                          קואורדינטות (למפה)
                        </Label>
                      </FieldHint>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Latitude (קו רוחב)</Label>
                          <Input
                            type="number"
                            step="0.000001"
                            value={coordinates?.lat || ""}
                            onChange={(e) => setCoordinates((prev) => ({
                              lat: parseFloat(e.target.value) || 0,
                              lng: prev?.lng || 0,
                            }))}
                            placeholder="25.2048"
                            min={-90}
                            max={90}
                            className="h-9 text-sm"
                            dir="ltr"
                            data-testid="input-latitude"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Longitude (קו אורך)</Label>
                          <Input
                            type="number"
                            step="0.000001"
                            value={coordinates?.lng || ""}
                            onChange={(e) => setCoordinates((prev) => ({
                              lat: prev?.lat || 0,
                              lng: parseFloat(e.target.value) || 0,
                            }))}
                            placeholder="55.2708"
                            min={-180}
                            max={180}
                            className="h-9 text-sm"
                            dir="ltr"
                            data-testid="input-longitude"
                          />
                        </div>
                      </div>
                    </Card>

                    <div>
                      <Label className="text-lg font-medium">תיאור השכונה</Label>
                      <Textarea
                        value={neighborhood.description}
                        onChange={(e) => setNeighborhood({ ...neighborhood, description: e.target.value })}
                        placeholder="תאר את השכונה, האווירה, והיתרונות של המיקום..."
                        rows={3}
                        className="mt-2"
                        data-testid="input-neighborhood-description"
                      />
                    </div>

                    <div>
                      <Label className="text-lg font-medium">תיאור השכונה באנגלית</Label>
                      <Textarea
                        value={neighborhood.descriptionEn}
                        onChange={(e) => setNeighborhood({ ...neighborhood, descriptionEn: e.target.value })}
                        placeholder="Describe the neighborhood, atmosphere, and location advantages..."
                        rows={3}
                        className="mt-2"
                        dir="ltr"
                        data-testid="input-neighborhood-description-en"
                      />
                    </div>

                    {/* Proximity / Nearby Landmarks Editor */}
                    <Card className="p-5 border-slate-200">
                      <ProximityEditor
                        value={proximityPlaces}
                        onChange={setProximityPlaces}
                        selectedArea={proximityArea}
                        onAreaChange={setProximityArea}
                      />
                    </Card>
                  </div>
                </div>
              )}

              {/* ===== STEP 6: MEDIA ===== */}
              {currentStep === 6 && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold">מדיה ותמונות</h3>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">תמונות איכותיות חיוניות למכירה - חובה להוסיף תמונה ראשית <span className="text-red-500">*</span> וגלריה <span className="text-red-500">*</span></p>
                  </div>

                  {/* Validation summary for images */}
                  <div className={`p-4 rounded-lg border ${validation.heroImage.isValid && validation.gallery.isValid ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {validation.heroImage.isValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          )}
                          <span className={validation.heroImage.isValid ? "text-green-700" : "text-amber-700"}>תמונה ראשית</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {validation.gallery.isValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          )}
                          <span className={validation.gallery.isValid ? "text-green-700" : "text-amber-700"}>גלריה ({gallery.length}/2)</span>
                        </div>
                      </div>
                      {validation.heroImage.isValid && validation.gallery.isValid && (
                        <Badge className="bg-green-600">מוכן לפרסום</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Hero Image */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <RequiredLabel hint="תמונה מלבנית באיכות גבוהה (רזולוציה מומלצת: 1920x1080)">
                          <span className="text-base sm:text-lg font-medium">תמונה ראשית (Hero)</span>
                        </RequiredLabel>
                        <FieldStatus isValid={validation.heroImage.isValid} message={validation.heroImage.message} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">זו התמונה הראשונה שהמשתמשים יראו - בחר תמונה אטרקטיבית ואיכותית</p>

                      {heroImage ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border">
                          <img src={heroImage} alt="תמונה ראשית של הפרויקט - תצוגה מקדימה" className="w-full h-full object-cover" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 start-2"
                            onClick={() => setHeroImage("")}
                            data-testid="button-remove-hero"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Tabs defaultValue="url" dir="rtl" className="w-full">
                          <TabsList dir="rtl" className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="url">
                              <Globe className="h-4 w-4 ms-2" />
                              הזן URL
                            </TabsTrigger>
                            <TabsTrigger value="upload">
                              <Upload className="h-4 w-4 ms-2" />
                              העלה קובץ
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="url" className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                placeholder="הדבק כתובת URL של תמונה..."
                                dir="ltr"
                                onChange={(e) => {
                                  const url = e.target.value.trim();
                                  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
                                    setHeroImage(url);
                                  }
                                }}
                                data-testid="input-hero-url"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ניתן להעתיק URL של תמונה מהאינטרנט או מ-Google Drive (שתף כ-Anyone with link)
                            </p>
                          </TabsContent>
                          <TabsContent value="upload">
                            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                              <span className="text-muted-foreground">לחץ להעלאת תמונה ראשית</span>
                              <span className="text-xs text-muted-foreground mt-1">(דורש הגדרת Cloudflare R2)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, true)}
                                disabled={isUploading}
                                data-testid="input-hero-image"
                              />
                            </label>
                          </TabsContent>
                        </Tabs>
                      )}
                    </div>

                    {/* Gallery Images with Category */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <RequiredLabel hint="הדבק קישורי תמונה או העלה קבצים - מינימום 2 תמונות">
                          <span className="text-base sm:text-lg font-medium">גלריית תמונות</span>
                        </RequiredLabel>
                        <FieldStatus isValid={validation.gallery.isValid} message={validation.gallery.message} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">הוסף לפחות 2 תמונות נוספות - פנים, חוץ, מתקנים ונוף</p>

                      <div className="space-y-3">
                        {gallery.length === 0 && (
                          <EmptyStateHint
                            icon={ImagePlus}
                            title="עדיין אין תמונות בגלריה"
                            description="הדבק URL של תמונה בשדה למטה ולחץ Enter להוספה. תמונות מגוונות (פנים, חוץ, נוף) עוזרות ללקוחות לקבל החלטה."
                          />
                        )}
                        {gallery.map((img, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start gap-3">
                              {img.url && (
                                <div className="w-20 h-14 rounded overflow-hidden border flex-shrink-0">
                                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                <div>
                                  <Label className="text-xs">URL</Label>
                                  <Input
                                    value={img.url}
                                    onChange={(e) => updateGalleryImage(index, "url", e.target.value)}
                                    placeholder="https://..."
                                    dir="ltr"
                                    className="h-9 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">קטגוריה</Label>
                                  <Select
                                    dir="rtl"
                                    value={img.category || "exterior"}
                                    onValueChange={(value) => updateGalleryImage(index, "category", value)}
                                  >
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {GALLERY_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">טקסט חלופי</Label>
                                  <Input
                                    value={img.alt}
                                    onChange={(e) => updateGalleryImage(index, "alt", e.target.value)}
                                    placeholder="תיאור התמונה"
                                    className="h-9 text-sm"
                                  />
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 mt-4 flex-shrink-0"
                                onClick={() => removeGalleryImage(index)}
                                data-testid={`button-remove-gallery-${index}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>

                      {/* Add gallery image */}
                      <div className="mt-4 flex gap-2">
                        <Input
                          placeholder="הדבק URL של תמונה לגלריה..."
                          dir="ltr"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const url = (e.target as HTMLInputElement).value.trim();
                              if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
                                setGallery((prev) => [...prev, { url, alt: formData.name, category: "exterior" }]);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }
                          }}
                          data-testid="input-gallery-url"
                        />
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector("input") as HTMLInputElement;
                            const url = input?.value?.trim();
                            if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
                              setGallery((prev) => [...prev, { url, alt: formData.name, category: "exterior" }]);
                              input.value = "";
                            }
                          }}
                          data-testid="button-add-gallery-image"
                        >
                          <Plus className="h-4 w-4 ms-1" />
                          הוסף תמונה
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">לחץ Enter או על הכפתור להוספה</p>
                    </div>

                    {/* Floor Plans */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-lg font-medium flex items-center gap-2">
                          <Layers className="h-5 w-5 text-blue-500" />
                          תוכניות קומה
                        </Label>
                        <Button variant="outline" size="sm" onClick={addFloorPlan}>
                          <Plus className="h-4 w-4 ms-1" />
                          הוסף תוכנית
                        </Button>
                      </div>
                      {floorPlans.map((fp, idx) => (
                        <Card key={idx} className="p-3 mb-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">שם</Label>
                                <Input
                                  value={fp.name}
                                  onChange={(e) => updateFloorPlan(idx, "name", e.target.value)}
                                  placeholder="דירת 2 חדרים"
                                  className="h-9 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">גודל</Label>
                                <Input
                                  value={fp.size || ""}
                                  onChange={(e) => updateFloorPlan(idx, "size", e.target.value)}
                                  placeholder="85 sqm"
                                  className="h-9 text-sm"
                                />
                              </div>
                              <div className="col-span-2">
                                <Label className="text-xs">תמונה / URL</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={fp.image}
                                    onChange={(e) => updateFloorPlan(idx, "image", e.target.value)}
                                    placeholder="https://... או העלה קובץ"
                                    className="h-9 text-sm flex-1"
                                    dir="ltr"
                                  />
                                  <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => handleFloorPlanUpload(idx)}>
                                    <Upload className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                {fp.image && (
                                  <div className="mt-1.5 aspect-video max-w-xs rounded overflow-hidden border">
                                    <img src={fp.image} alt={fp.name} className="w-full h-full object-contain bg-slate-50" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-9 w-9 mt-5" onClick={() => removeFloorPlan(idx)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {floorPlans.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                          <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">לחץ "הוסף תוכנית" להוספת תוכניות קומה</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isUploading && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>מעלה תמונה...</span>
                    </div>
                  )}

                  {(!validation.heroImage.isValid || !validation.gallery.isValid) && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                      <p className="font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        תמונות הן חובה
                      </p>
                      <p>כדי ליצור פרויקט יש להוסיף תמונה ראשית ולפחות 2 תמונות לגלריה. תמונות איכותיות מעלות משמעותית את הסיכוי למכירה.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== STEP 7: EXTRAS / ADVANCED ===== */}
              {currentStep === 7 && (
                <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold">הגדרות מתקדמות</h3>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">שלב אופציונלי - מדדי השקעה, מפרט בניין, נקודות מפתח, שאלות נפוצות ו-SEO</p>
                  </div>

                  {/* Empty state hint */}
                  {!investmentMetrics.expectedRoiPercent && !specs.totalFloors && highlights.length === 0 && faqs.length === 0 && !seo.title && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">שלב זה אופציונלי לחלוטין</p>
                        <p>ניתן לדלג על שלב זה וליצור את הפרויקט. המידע כאן משפר את דף הפרויקט אך אינו הכרחי. ניתן להוסיף מאוחר יותר.</p>
                      </div>
                    </div>
                  )}

                  {/* Investment Metrics */}
                  <Card className="p-5 border-slate-200">
                    <FieldHint hint="מדדים פיננסיים שעוזרים למשקיעים לקבל החלטה">
                      <Label className="text-base font-medium flex items-center gap-2 mb-4">
                        <BarChart3 className="h-5 w-5 text-emerald-500" />
                        מדדי השקעה
                      </Label>
                    </FieldHint>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">עליית ערך שנתית (%)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            value={investmentMetrics.expectedRoiPercent || ""}
                            onChange={(e) => setInvestmentMetrics((prev) => ({ ...prev, expectedRoiPercent: parseFloat(e.target.value) || 0 }))}
                            placeholder="10"
                            min={0}
                            max={100}
                            className="h-9 text-sm pe-8"
                            data-testid="input-annual-appreciation"
                          />
                          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">תשואת שכירות (%)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            value={investmentMetrics.rentalYieldPercent || ""}
                            onChange={(e) => setInvestmentMetrics((prev) => ({ ...prev, rentalYieldPercent: parseFloat(e.target.value) || 0 }))}
                            placeholder="7"
                            min={0}
                            max={100}
                            className="h-9 text-sm pe-8"
                            data-testid="input-rental-yield"
                          />
                          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">מחיר לרגל מרובע</Label>
                        <Input
                          type="number"
                          value={investmentMetrics.pricePerSqft || ""}
                          onChange={(e) => setInvestmentMetrics((prev) => ({ ...prev, pricePerSqft: parseInt(e.target.value) || 0 }))}
                          placeholder="1600"
                          min={0}
                          className="h-9 text-sm"
                          data-testid="input-price-per-sqft"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">שיעור תפוסה (%)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            value={investmentMetrics.occupancyRate || ""}
                            onChange={(e) => setInvestmentMetrics((prev) => ({ ...prev, occupancyRate: parseFloat(e.target.value) || 0 }))}
                            placeholder="85"
                            min={0}
                            max={100}
                            className="h-9 text-sm pe-8"
                            data-testid="input-occupancy-rate"
                          />
                          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">שיעור היוון (Cap Rate) (%)</Label>
                        <div className="relative">
                          <Input
                            value={investmentMetrics.capitalAppreciationForecast || ""}
                            onChange={(e) => setInvestmentMetrics((prev) => ({ ...prev, capitalAppreciationForecast: e.target.value }))}
                            placeholder="5.5"
                            className="h-9 text-sm pe-8"
                            data-testid="input-cap-rate"
                          />
                          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Building Specs */}
                  <Card className="p-5 border-slate-200">
                    <FieldHint hint="נתוני הבניין הפיזיים - קומות, יחידות, חניה">
                      <Label className="text-base font-medium flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-slate-500" />
                        מפרט הבניין
                      </Label>
                    </FieldHint>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">סה"כ קומות</Label>
                        <Input
                          type="number"
                          value={specs.totalFloors || ""}
                          onChange={(e) => setSpecs((prev) => ({ ...prev, totalFloors: parseInt(e.target.value) || 0 }))}
                          placeholder="40"
                          min={0}
                          className="h-9 text-sm"
                          data-testid="input-total-floors"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">סה"כ יחידות</Label>
                        <Input
                          type="number"
                          value={specs.totalUnits || ""}
                          onChange={(e) => setSpecs((prev) => ({ ...prev, totalUnits: parseInt(e.target.value) || 0 }))}
                          placeholder="500"
                          min={0}
                          className="h-9 text-sm"
                          data-testid="input-total-units"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">מקומות חניה</Label>
                        <Input
                          type="number"
                          value={specs.totalParkingSpaces || ""}
                          onChange={(e) => setSpecs((prev) => ({ ...prev, totalParkingSpaces: parseInt(e.target.value) || 0 }))}
                          placeholder="200"
                          min={0}
                          className="h-9 text-sm"
                          data-testid="input-total-parking"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">גובה הבניין</Label>
                        <Input
                          value={specs.buildingHeight || ""}
                          onChange={(e) => setSpecs((prev) => ({ ...prev, buildingHeight: e.target.value }))}
                          placeholder="120m"
                          className="h-9 text-sm"
                          data-testid="input-building-height"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">סגנון אדריכלי</Label>
                        <Input
                          value={specs.architecturalStyle || ""}
                          onChange={(e) => setSpecs((prev) => ({ ...prev, architecturalStyle: e.target.value }))}
                          placeholder="מודרני, אר-דקו..."
                          className="h-9 text-sm"
                          data-testid="input-architectural-style"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Highlights */}
                  <Card className="p-5 border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        נקודות מפתח (Highlights)
                      </Label>
                      <Button variant="outline" size="sm" onClick={addHighlight}>
                        <Plus className="h-4 w-4 ms-1" />
                        הוסף
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">מוצגים באזור "אודות" בדף הפרויקט</p>
                    {highlights.map((h, idx) => (
                      <Card key={idx} className="p-3 mb-2 bg-slate-50">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">אייקון</Label>
                              <Input value={h.icon} onChange={(e) => updateHighlight(idx, "icon", e.target.value)} placeholder="star" className="h-9 text-sm" dir="ltr" />
                            </div>
                            <div>
                              <Label className="text-xs">כותרת</Label>
                              <Input value={h.title} onChange={(e) => updateHighlight(idx, "title", e.target.value)} placeholder="קומות" className="h-9 text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs">ערך</Label>
                              <Input value={h.value} onChange={(e) => updateHighlight(idx, "value", e.target.value)} placeholder="40" className="h-9 text-sm" />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-9 w-9 mt-5" onClick={() => removeHighlight(idx)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {highlights.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">לחץ "הוסף" ליצירת נקודות מפתח</p>
                      </div>
                    )}
                  </Card>

                  {/* FAQs */}
                  <Card className="p-5 border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-blue-500" />
                        שאלות נפוצות (FAQ)
                      </Label>
                      <Button variant="outline" size="sm" onClick={addFaq}>
                        <Plus className="h-4 w-4 ms-1" />
                        הוסף שאלה
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">מוצגים בתחתית דף הפרויקט</p>
                    {faqs.map((faq, idx) => (
                      <Card key={idx} className="p-3 mb-2 bg-slate-50 space-y-2">
                        <div className="flex items-start justify-between">
                          <Label className="text-xs text-slate-500">שאלה {idx + 1}</Label>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFaq(idx)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                        <Input
                          value={faq.question}
                          onChange={(e) => updateFaq(idx, "question", e.target.value)}
                          placeholder="מהי תוכנית התשלום?"
                          className="h-9 text-sm"
                          data-testid={`input-faq-question-${idx}`}
                        />
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                          placeholder="התשובה..."
                          className="min-h-[60px] text-sm"
                          data-testid={`input-faq-answer-${idx}`}
                        />
                      </Card>
                    ))}
                    {faqs.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                        <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">לחץ "הוסף שאלה" ליצירת שאלות נפוצות</p>
                      </div>
                    )}
                  </Card>

                  {/* SEO */}
                  <Card className="p-5 border-slate-200">
                    <Label className="text-base font-medium flex items-center gap-2 mb-4">
                      <Globe className="h-5 w-5 text-green-500" />
                      SEO - אופטימיזציה למנועי חיפוש
                    </Label>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">כותרת SEO (Meta Title)</Label>
                        <Input
                          value={seo.title || ""}
                          onChange={(e) => setSeo((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder={'שם הפרויקט - נדל"ן בדובאי'}
                          className="h-9 text-sm"
                          data-testid="input-seo-title"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">תיאור SEO (Meta Description)</Label>
                        <Textarea
                          value={seo.description || ""}
                          onChange={(e) => setSeo((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="עד 160 תווים..."
                          className="min-h-[60px] text-sm"
                          data-testid="input-seo-description"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation bar */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base"
            data-testid="button-previous"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ms-1 sm:ms-2" />
            <span className="hidden sm:inline">הקודם</span>
            <span className="sm:hidden">חזור</span>
          </Button>

          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs sm:text-sm text-muted-foreground">
              שלב {currentStep + 1} מתוך {STEPS.length}
            </span>
            <span className="text-[10px] text-muted-foreground/60 hidden sm:block">
              {currentStep < STEPS.length - 1 ? "Enter = הבא" : ""}
            </span>
          </div>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              className={`h-10 sm:h-11 px-5 sm:px-8 text-sm sm:text-base font-semibold shadow-md transition-all ${
                !canProceed() ? "opacity-80" : "hover:shadow-lg hover:scale-[1.02]"
              }`}
              data-testid="button-next"
            >
              <span className="hidden sm:inline">המשך לשלב הבא</span>
              <span className="sm:hidden">הבא</span>
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 me-1 sm:me-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="h-10 sm:h-11 px-5 sm:px-8 text-sm sm:text-base font-semibold shadow-md bg-green-600 hover:bg-green-700 transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
              data-testid="button-submit"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 ms-2 animate-spin" />
                  <span className="hidden sm:inline">שומר פרויקט...</span>
                  <span className="sm:hidden">שומר...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 ms-2" />
                  <span className="hidden sm:inline">צור פרויקט</span>
                  <span className="sm:hidden">צור</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
