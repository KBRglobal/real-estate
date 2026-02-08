import { useState, useEffect, useMemo, useCallback } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  X,
  Check,
  ChevronDown,
  Car,
  Navigation,
  ShoppingBag,
  GraduationCap,
  Stethoscope,
  Plane,
  Train,
  Trees,
  Dumbbell,
  Building2,
  Waves,
  UtensilsCrossed,
  Landmark,
  Church,
  LayoutGrid,
  Eye,
  EyeOff,
  Sparkles,
  Edit3,
  Save,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getProximityByArea, getAllAreas, type ProximityLandmark } from "@/lib/dubai-proximity-data";

// =====================
// Types
// =====================

export interface NearbyPlaceEntry {
  id: string;
  name: string;
  nameEn: string;
  distance: string;
  driveTime: string;
  type: string;
  enabled: boolean;
  isCustom: boolean;
}

interface ProximityEditorProps {
  value: NearbyPlaceEntry[];
  onChange: (places: NearbyPlaceEntry[]) => void;
  selectedArea?: string;
  onAreaChange?: (area: string) => void;
  className?: string;
}

// =====================
// Category icon mapping
// =====================

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  shopping: ShoppingBag,
  beach: Waves,
  restaurant: UtensilsCrossed,
  school: GraduationCap,
  hospital: Stethoscope,
  airport: Plane,
  metro: Train,
  park: Trees,
  gym: Dumbbell,
  mall: ShoppingBag,
  mosque: Church,
  hotel: Building2,
  landmark: Landmark,
  highway: Car,
  transport: Train,
  education: GraduationCap,
  healthcare: Stethoscope,
  leisure: Trees,
  other: MapPin,
};

const CATEGORY_COLORS: Record<string, string> = {
  shopping: "bg-pink-100 text-pink-700",
  beach: "bg-cyan-100 text-cyan-700",
  restaurant: "bg-orange-100 text-orange-700",
  school: "bg-indigo-100 text-indigo-700",
  hospital: "bg-red-100 text-red-700",
  airport: "bg-blue-100 text-blue-700",
  metro: "bg-violet-100 text-violet-700",
  park: "bg-green-100 text-green-700",
  gym: "bg-amber-100 text-amber-700",
  mall: "bg-pink-100 text-pink-700",
  mosque: "bg-emerald-100 text-emerald-700",
  hotel: "bg-purple-100 text-purple-700",
  landmark: "bg-yellow-100 text-yellow-700",
  highway: "bg-slate-100 text-slate-700",
  transport: "bg-violet-100 text-violet-700",
  education: "bg-indigo-100 text-indigo-700",
  healthcare: "bg-red-100 text-red-700",
  leisure: "bg-green-100 text-green-700",
  other: "bg-slate-100 text-slate-700",
};

const CATEGORY_LABELS_HE: Record<string, string> = {
  shopping: "קניות",
  beach: "חוף",
  restaurant: "מסעדה",
  school: "בית ספר",
  hospital: "בית חולים",
  airport: "שדה תעופה",
  metro: "מטרו",
  park: "פארק",
  gym: "חדר כושר",
  mall: "קניון",
  mosque: "מסגד",
  hotel: "מלון",
  landmark: "ציון דרך",
  highway: "כביש מהיר",
  transport: "תחבורה",
  education: "חינוך",
  healthcare: "בריאות",
  leisure: "פנאי",
  other: "אחר",
};

const PLACE_TYPES = [
  { value: "shopping", label: "קניות" },
  { value: "beach", label: "חוף" },
  { value: "restaurant", label: "מסעדה" },
  { value: "school", label: "בית ספר" },
  { value: "hospital", label: "בית חולים" },
  { value: "airport", label: "שדה תעופה" },
  { value: "metro", label: "מטרו" },
  { value: "park", label: "פארק" },
  { value: "gym", label: "חדר כושר" },
  { value: "mall", label: "קניון" },
  { value: "hotel", label: "מלון" },
  { value: "landmark", label: "ציון דרך" },
  { value: "highway", label: "כביש מהיר" },
  { value: "transport", label: "תחבורה" },
  { value: "education", label: "חינוך" },
  { value: "healthcare", label: "בריאות" },
  { value: "leisure", label: "פנאי" },
  { value: "other", label: "אחר" },
];

// =====================
// Helper: generate unique ID
// =====================

function generateId(): string {
  return `prx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =====================
// Helper: get icon for category
// =====================

function getCategoryIcon(category: string): React.ElementType {
  return CATEGORY_ICONS[category] || MapPin;
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
}

// =====================
// Sub-components
// =====================

function LandmarkCard({
  place,
  onToggle,
  onRemove,
  onUpdate,
}: {
  place: NearbyPlaceEntry;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (field: keyof NearbyPlaceEntry, value: string) => void;
}) {
  const Icon = getCategoryIcon(place.type);
  const colorClass = getCategoryColor(place.type);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editDistance, setEditDistance] = useState(place.distance);
  const [editDriveTime, setEditDriveTime] = useState(place.driveTime);

  const handleSaveInlineEdit = () => {
    if (editDistance !== place.distance) {
      onUpdate("distance", editDistance);
    }
    if (editDriveTime !== place.driveTime) {
      onUpdate("driveTime", editDriveTime);
    }
    setIsEditingInline(false);
  };

  return (
    <div
      className={`group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
        place.enabled
          ? "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
          : "bg-slate-50 border-slate-100 opacity-60"
      }`}
    >
      {/* Category Icon */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} shadow-sm`}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing && place.isCustom ? (
          <div className="space-y-2">
            <Input
              value={place.name}
              onChange={(e) => onUpdate("name", e.target.value)}
              placeholder="שם המקום"
              className="h-8 text-sm"
              dir="rtl"
            />
            <Input
              value={place.nameEn}
              onChange={(e) => onUpdate("nameEn", e.target.value)}
              placeholder="Place name (English)"
              className="h-8 text-sm"
              dir="ltr"
            />
            <div className="flex gap-2">
              <Input
                value={place.distance}
                onChange={(e) => onUpdate("distance", e.target.value)}
                placeholder="מרחק"
                className="h-8 text-sm flex-1"
              />
              <Input
                value={place.driveTime}
                onChange={(e) => onUpdate("driveTime", e.target.value)}
                placeholder="זמן נסיעה"
                className="h-8 text-sm flex-1"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Select
                value={place.type}
                onValueChange={(val) => onUpdate("type", val)}
              >
                <SelectTrigger className="h-8 text-sm flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLACE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-8 px-2"
              >
                <Check className="h-3.5 w-3.5 text-green-600" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-semibold text-sm truncate ${place.enabled ? "text-slate-900" : "text-slate-500"}`}>
                {place.name || place.nameEn}
              </span>
              {place.isCustom && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-300 text-amber-600 bg-amber-50">
                  ידני
                </Badge>
              )}
              <Badge className={`text-[10px] px-1.5 py-0.5 h-5 ${colorClass} border-0`}>
                {CATEGORY_LABELS_HE[place.type] || place.type}
              </Badge>
            </div>
            {place.nameEn && place.name && (
              <p className="text-xs text-slate-400 truncate mb-2" dir="ltr">{place.nameEn}</p>
            )}
            {isEditingInline ? (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <Navigation className="h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={editDistance}
                    onChange={(e) => setEditDistance(e.target.value)}
                    placeholder="מרחק"
                    className="h-7 text-xs flex-1"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <Car className="h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={editDriveTime}
                    onChange={(e) => setEditDriveTime(e.target.value)}
                    placeholder="זמן נסיעה"
                    className="h-7 text-xs flex-1"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveInlineEdit}
                  className="h-7 px-2"
                >
                  <Save className="h-3.5 w-3.5 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditDistance(place.distance);
                    setEditDriveTime(place.driveTime);
                    setIsEditingInline(false);
                  }}
                  className="h-7 px-2"
                >
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-1.5">
                {place.distance && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                    <Navigation className="h-3.5 w-3.5" />
                    {place.distance}
                  </span>
                )}
                {place.driveTime && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                    <Car className="h-3.5 w-3.5" />
                    {place.driveTime}
                  </span>
                )}
                {!isEditingInline && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsEditingInline(true)}
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>ערוך מרחק וזמן נסיעה</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {place.isCustom && !isEditing && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>ערוך הכל</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggle}
                className={`p-2 rounded-md transition-colors ${
                  place.enabled
                    ? "hover:bg-blue-50 text-blue-500 hover:text-blue-600"
                    : "hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                }`}
              >
                {place.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{place.enabled ? "הסתר" : "הצג"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {place.isCustom && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onRemove}
                  className="p-2 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>הסר</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

// =====================
// Main Component
// =====================

export function ProximityEditor({
  value,
  onChange,
  selectedArea: externalSelectedArea,
  onAreaChange,
  className,
}: ProximityEditorProps) {
  const [selectedArea, setSelectedArea] = useState(externalSelectedArea || "");
  const [areaSearchOpen, setAreaSearchOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customPlace, setCustomPlace] = useState<Partial<NearbyPlaceEntry>>({
    name: "",
    nameEn: "",
    distance: "",
    driveTime: "",
    type: "other",
  });

  // Sync external area prop
  useEffect(() => {
    if (externalSelectedArea && externalSelectedArea !== selectedArea) {
      setSelectedArea(externalSelectedArea);
    }
  }, [externalSelectedArea]);

  // Get all available areas
  const allAreas = useMemo(() => {
    try {
      return getAllAreas();
    } catch {
      return [];
    }
  }, []);

  // When area changes, auto-populate landmarks
  const handleAreaSelect = useCallback(
    (area: string) => {
      setSelectedArea(area);
      setAreaSearchOpen(false);
      onAreaChange?.(area);

      try {
        const landmarks = getProximityByArea(area);
        if (landmarks && landmarks.length > 0) {
          // Preserve existing custom entries
          const existingCustom = value.filter((p) => p.isCustom);

          // Convert landmarks to NearbyPlaceEntry
          const newEntries: NearbyPlaceEntry[] = landmarks.map((lm: ProximityLandmark) => ({
            id: generateId(),
            name: lm.nameHe || lm.name,
            nameEn: lm.name,
            distance: lm.distance != null ? `${lm.distance} km` : "",
            driveTime: lm.driveTime || "",
            type: lm.category || "other",
            enabled: true,
            isCustom: false,
          }));

          onChange([...newEntries, ...existingCustom]);
        }
      } catch (e) {
        // Data file may not be ready yet, ignore
        console.warn("Proximity data not available:", e);
      }
    },
    [value, onChange, onAreaChange]
  );

  // Toggle a landmark on/off
  const handleToggle = useCallback(
    (id: string) => {
      onChange(
        value.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
      );
    },
    [value, onChange]
  );

  // Remove a landmark
  const handleRemove = useCallback(
    (id: string) => {
      onChange(value.filter((p) => p.id !== id));
    },
    [value, onChange]
  );

  // Update a landmark field
  const handleUpdate = useCallback(
    (id: string, field: keyof NearbyPlaceEntry, fieldValue: string) => {
      onChange(
        value.map((p) =>
          p.id === id ? { ...p, [field]: fieldValue } : p
        )
      );
    },
    [value, onChange]
  );

  // Add custom place
  const handleAddCustom = useCallback(() => {
    if (!customPlace.name && !customPlace.nameEn) return;

    const newEntry: NearbyPlaceEntry = {
      id: generateId(),
      name: customPlace.name || "",
      nameEn: customPlace.nameEn || "",
      distance: customPlace.distance || "",
      driveTime: customPlace.driveTime || "",
      type: customPlace.type || "other",
      enabled: true,
      isCustom: true,
    };

    onChange([...value, newEntry]);
    setCustomPlace({
      name: "",
      nameEn: "",
      distance: "",
      driveTime: "",
      type: "other",
    });
    setShowAddCustom(false);
  }, [customPlace, value, onChange]);

  // Toggle all enabled/disabled
  const handleToggleAll = useCallback(
    (enabled: boolean) => {
      onChange(value.map((p) => ({ ...p, enabled })));
    },
    [value, onChange]
  );

  // Filter landmarks by category
  const filteredPlaces = useMemo(() => {
    if (filterCategory === "all") return value;
    return value.filter((p) => p.type === filterCategory);
  }, [value, filterCategory]);

  // Get unique categories from current data
  const activeCategories = useMemo(() => {
    const cats = new Set(value.map((p) => p.type));
    return Array.from(cats);
  }, [value]);

  // Stats
  const enabledCount = value.filter((p) => p.enabled).length;
  const totalCount = value.length;

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">מקומות קרובים</h4>
            <p className="text-xs text-slate-500">
              בחר אזור לאכלוס אוטומטי של ציוני דרך
            </p>
          </div>
        </div>
        {totalCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {enabledCount}/{totalCount} מוצגים
          </Badge>
        )}
      </div>

      {/* Area Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          אזור בדובאי
          <span className="text-xs text-slate-400 font-normal">({allAreas.length} אזורים זמינים)</span>
        </Label>
        <Popover open={areaSearchOpen} onOpenChange={setAreaSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={areaSearchOpen}
              className="w-full justify-between h-12 text-end font-medium"
              data-testid="proximity-area-selector"
            >
              <span className={selectedArea ? "text-slate-900" : "text-slate-400"}>
                {selectedArea || "בחר אזור..."}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command shouldFilter={true}>
              <CommandInput placeholder="חפש אזור..." className="text-end h-11" dir="rtl" />
              <CommandList>
                <CommandEmpty>
                  <div className="py-8 text-center">
                    <MapPin className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-500 font-medium">לא נמצא אזור מתאים</p>
                    <p className="text-xs text-slate-400 mt-1">נסה לחפש במילים אחרות</p>
                  </div>
                </CommandEmpty>
                <CommandGroup heading={`כל האזורים בדובאי (${allAreas.length})`}>
                  {allAreas.map((area) => (
                    <CommandItem
                      key={area}
                      value={area}
                      onSelect={() => handleAreaSelect(area)}
                      className="cursor-pointer py-2.5"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Check
                          className={`h-4 w-4 text-blue-500 ${
                            selectedArea === area ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="flex-1 text-end">{area}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Auto-populated landmarks */}
      {totalCount > 0 && (
        <>
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap p-3 bg-slate-50 rounded-lg border border-slate-200">
            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-slate-500" />
              <Badge
                variant={filterCategory === "all" ? "default" : "outline"}
                className="cursor-pointer text-xs font-medium hover:bg-blue-600 hover:text-white transition-colors"
                onClick={() => setFilterCategory("all")}
              >
                הכל ({totalCount})
              </Badge>
              {activeCategories.map((cat) => {
                const Icon = getCategoryIcon(cat);
                const count = value.filter((p) => p.type === cat).length;
                const colorClass = getCategoryColor(cat);
                return (
                  <Badge
                    key={cat}
                    variant={filterCategory === cat ? "default" : "outline"}
                    className={`cursor-pointer text-xs gap-1 font-medium hover:opacity-80 transition-all ${
                      filterCategory === cat ? colorClass : ""
                    }`}
                    onClick={() => setFilterCategory(cat)}
                  >
                    <Icon className="h-3 w-3" />
                    {CATEGORY_LABELS_HE[cat] || cat} ({count})
                  </Badge>
                );
              })}
            </div>

            {/* Toggle All */}
            <div className="flex items-center gap-2" dir="rtl">
              <span className="text-xs text-slate-600 font-medium">הצג הכל</span>
              <Switch
                checked={enabledCount === totalCount}
                onCheckedChange={(checked) => handleToggleAll(checked)}
              />
            </div>
          </div>

          {/* Landmarks List */}
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-3 pe-2">
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map((place) => (
                  <LandmarkCard
                    key={place.id}
                    place={place}
                    onToggle={() => handleToggle(place.id)}
                    onRemove={() => handleRemove(place.id)}
                    onUpdate={(field, fieldValue) => handleUpdate(place.id, field, fieldValue)}
                  />
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                  <Filter className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 font-medium">אין מקומות בקטגוריה זו</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterCategory("all")}
                    className="mt-2"
                  >
                    נקה סינון
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}

      {/* Empty State */}
      {totalCount === 0 && !selectedArea && (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-gradient-to-br from-blue-50 to-slate-50">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-400" />
          <p className="text-slate-700 font-semibold text-lg mb-2">בחר אזור בדובאי</p>
          <p className="text-sm text-slate-500 mb-4">
            הציוני דרך הקרובים יאוכלסו אוטומטית
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
            <p className="text-xs text-slate-400 w-full mb-2">אזורים פופולריים:</p>
            {["Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "Business Bay", "JBR"].map((area) => (
              <Badge
                key={area}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-500 hover:text-white transition-colors"
                onClick={() => {
                  if (allAreas.includes(area)) {
                    handleAreaSelect(area);
                  }
                }}
              >
                {area}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {totalCount === 0 && selectedArea && (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-600 font-semibold text-lg mb-2">אין ציוני דרך עבור אזור זה</p>
          <p className="text-sm text-slate-500 mb-4">
            ניתן להוסיף מקומות באופן ידני בלחיצה על הכפתור למטה
          </p>
          <Badge variant="outline" className="text-xs">
            אזור נבחר: {selectedArea}
          </Badge>
        </div>
      )}

      {/* Add Custom Place */}
      {showAddCustom ? (
        <Card className="p-4 border-blue-200 bg-blue-50/30">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-slate-700">הוספת מקום ידני</h5>
            <button
              onClick={() => setShowAddCustom(false)}
              className="p-1 rounded hover:bg-slate-100"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">שם המקום</Label>
              <Input
                value={customPlace.name || ""}
                onChange={(e) =>
                  setCustomPlace((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="לדוגמה: דובאי מול"
                className="h-9 text-sm"
                dir="rtl"
                data-testid="proximity-custom-name"
              />
            </div>
            <div>
              <Label className="text-xs">Name (English)</Label>
              <Input
                value={customPlace.nameEn || ""}
                onChange={(e) =>
                  setCustomPlace((prev) => ({ ...prev, nameEn: e.target.value }))
                }
                placeholder="e.g., Dubai Mall"
                className="h-9 text-sm"
                dir="ltr"
                data-testid="proximity-custom-name-en"
              />
            </div>
            <div>
              <Label className="text-xs">מרחק</Label>
              <Input
                value={customPlace.distance || ""}
                onChange={(e) =>
                  setCustomPlace((prev) => ({ ...prev, distance: e.target.value }))
                }
                placeholder={'1.5 ק"מ'}
                className="h-9 text-sm"
                data-testid="proximity-custom-distance"
              />
            </div>
            <div>
              <Label className="text-xs">זמן נסיעה</Label>
              <Input
                value={customPlace.driveTime || ""}
                onChange={(e) =>
                  setCustomPlace((prev) => ({ ...prev, driveTime: e.target.value }))
                }
                placeholder="5 דקות"
                className="h-9 text-sm"
                data-testid="proximity-custom-drive-time"
              />
            </div>
            <div>
              <Label className="text-xs">קטגוריה</Label>
              <Select
                value={customPlace.type || "other"}
                onValueChange={(val) =>
                  setCustomPlace((prev) => ({ ...prev, type: val }))
                }
              >
                <SelectTrigger className="h-9 text-sm" data-testid="proximity-custom-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLACE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddCustom}
                disabled={!customPlace.name && !customPlace.nameEn}
                className="w-full h-9 bg-blue-600 hover:bg-blue-700"
                data-testid="proximity-custom-add"
              >
                <Plus className="h-4 w-4 ms-1" />
                הוסף
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowAddCustom(true)}
          className="w-full border-dashed"
          data-testid="proximity-add-custom-btn"
        >
          <Plus className="h-4 w-4 ms-2" />
          הוסף מקום ידני
        </Button>
      )}

      {/* Summary */}
      {totalCount > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {enabledCount} מקומות ישמרו בפרויקט
            {value.filter((p) => p.isCustom && p.enabled).length > 0 &&
              ` (כולל ${value.filter((p) => p.isCustom && p.enabled).length} ידניים)`}
          </p>
        </div>
      )}
    </div>
  );
}

// =====================
// Helper: Convert ProximityEditor output to project neighborhood format
// =====================

export function proximityToNeighborhood(
  places: NearbyPlaceEntry[],
  neighborhoodDescription?: string,
  neighborhoodDescriptionEn?: string
) {
  const enabledPlaces = places.filter((p) => p.enabled);
  if (enabledPlaces.length === 0 && !neighborhoodDescription) return null;

  return {
    description: neighborhoodDescription || "",
    descriptionEn: neighborhoodDescriptionEn || null,
    nearbyPlaces: enabledPlaces.map((p) => ({
      name: p.name,
      nameEn: p.nameEn || null,
      distance: p.distance,
      driveTime: p.driveTime || null,
      type: p.type,
    })),
  };
}

// =====================
// Helper: Convert project neighborhood back to ProximityEditor format
// =====================

export function neighborhoodToProximity(
  neighborhood: any
): NearbyPlaceEntry[] {
  if (!neighborhood?.nearbyPlaces) return [];

  return neighborhood.nearbyPlaces.map((p: any) => ({
    id: generateId(),
    name: p.name || "",
    nameEn: p.nameEn || "",
    distance: p.distance || "",
    driveTime: p.driveTime || "",
    type: p.type || "other",
    enabled: true,
    isCustom: true,
  }));
}
