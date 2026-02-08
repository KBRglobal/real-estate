import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, TrendingUp, Home, X, Building2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { projects } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import type { InvestmentZone } from "@shared/schema";
import type L from "leaflet";

interface DubaiZone {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  avgRoi: number;
  rentalYield: number;
  appreciation: number;
  demand: string;
  description: string;
  descriptionEn: string;
  coordinates: [number, number]; // [lat, lng]
}

// Unified gold color for all markers
const GOLD_COLOR = "#2563EB";

// Default Dubai zones (fallback)
const defaultDubaiZones: DubaiZone[] = [
  {
    id: "palm",
    name: "פאלם ג'ומיירה",
    nameEn: "Palm Jumeirah",
    color: GOLD_COLOR,
    avgRoi: 5.0,
    rentalYield: 4.5,
    appreciation: 7,
    demand: "premium",
    description: "האי המלאכותי המפורסם בעולם - סמל של יוקרה",
    descriptionEn: "The world-famous artificial island - a symbol of luxury",
    coordinates: [25.1124, 55.1390],
  },
  {
    id: "dubai-marina",
    name: "דובאי מרינה",
    nameEn: "Dubai Marina",
    color: GOLD_COLOR,
    avgRoi: 6.5,
    rentalYield: 6.2,
    appreciation: 10,
    demand: "high",
    description: "אזור יוקרתי עם מרינה מרהיבה וחיי לילה תוססים",
    descriptionEn: "Luxury area with stunning marina and vibrant nightlife",
    coordinates: [25.0805, 55.1403],
  },
  {
    id: "jvc",
    name: "JVC",
    nameEn: "JVC",
    color: GOLD_COLOR,
    avgRoi: 9.5,
    rentalYield: 8.5,
    appreciation: 15,
    demand: "very-high",
    description: "אזור צומח במהירות עם תשואות גבוהות ומחירי כניסה נוחים",
    descriptionEn: "Fast-growing area with high yields and affordable entry prices",
    coordinates: [25.0550, 55.2094],
  },
  {
    id: "downtown",
    name: "דאון טאון",
    nameEn: "Downtown",
    color: GOLD_COLOR,
    avgRoi: 5.5,
    rentalYield: 5.0,
    appreciation: 8,
    demand: "medium",
    description: "הלב הפועם של דובאי עם בורג' חליפה והמזרקה המפורסמת",
    descriptionEn: "The beating heart of Dubai with Burj Khalifa and the famous fountain",
    coordinates: [25.1972, 55.2744],
  },
  {
    id: "business-bay",
    name: "ביזנס ביי",
    nameEn: "Business Bay",
    color: GOLD_COLOR,
    avgRoi: 7.5,
    rentalYield: 6.8,
    appreciation: 12,
    demand: "high",
    description: "מרכז עסקים מוביל עם גישה מצוינת לכל חלקי העיר",
    descriptionEn: "Leading business center with excellent access to all parts of the city",
    coordinates: [25.1850, 55.2650],
  },
  {
    id: "mbr-city",
    name: "MBR סיטי",
    nameEn: "MBR City",
    color: GOLD_COLOR,
    avgRoi: 8.0,
    rentalYield: 7.0,
    appreciation: 14,
    demand: "high",
    description: "אזור חדש ומתפתח עם פרויקטים יוקרתיים",
    descriptionEn: "New developing area with luxury projects",
    coordinates: [25.1700, 55.3100],
  },
];

// Helper to convert API zone to display zone
function convertApiZoneToDisplay(zone: InvestmentZone): DubaiZone {
  return {
    id: zone.id,
    name: zone.name,
    nameEn: zone.nameEn,
    color: GOLD_COLOR,
    avgRoi: zone.avgRoi / 10, // Convert back from x10 storage
    rentalYield: zone.rentalYield / 10,
    appreciation: zone.appreciation,
    demand: zone.demand,
    description: zone.description,
    descriptionEn: zone.descriptionEn,
    coordinates: (zone.coordinates as [number, number]) || [25.15, 55.22],
  };
}

const zoneLocationMap: Record<string, string[]> = {
  "business-bay": ["ביזנס ביי", "Business Bay"],
  "dubai-marina": ["דובאי מרינה", "Dubai Marina"],
  "jvc": ["ג'ומיירה וילג' סירקל", "JVC", "Jumeirah Village Circle"],
  "downtown": ["דאון טאון דובאי", "Downtown Dubai", "דאון טאון"],
  "palm": ["פאלם ג'ומיירה", "Palm Jumeirah"],
  "mbr-city": ["MBR סיטי", "MBR City"],
};

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1) + "M";
  }
  return (price / 1000).toFixed(0) + "K";
}

// Leaflet Map Component with dark luxury theme
interface LeafletMapProps {
  zones: DubaiZone[];
  language: string;
  onZoneClick: (zone: DubaiZone) => void;
  onZoneHover: (zoneId: string | null) => void;
  selectedZone: DubaiZone | null;
}

function LeafletMap({ zones, language, onZoneClick, onZoneHover, selectedZone }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const leafletRef = useRef<typeof L | null>(null);
  const [isMapActive, setIsMapActive] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!mapContainerRef.current) return;
    // On mobile, don't init map until activated
    if (isMobile && !isMapActive) return;

    let mounted = true;

    const initMap = async () => {
      const leafletModule = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      const Leaf = leafletModule.default;
      leafletRef.current = Leaf;

      if (!mounted || !mapContainerRef.current) return;

      // Clear existing map if it exists (for language changes)
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }

      // Initialize map centered on Dubai
      const map = Leaf.map(mapContainerRef.current, {
        center: [25.15, 55.22],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: !isMobile, // Disable scroll zoom on mobile
        dragging: !isMobile || isMapActive, // Enable dragging only when active on mobile
        touchZoom: !isMobile || isMapActive,
      });

      // Dark luxury tile layer (CartoDB Dark Matter)
      Leaf.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control to top-right
      Leaf.control.zoom({ position: 'topright' }).addTo(map);

      // Create custom gold markers for each zone
      zones.forEach((zone) => {
        // Custom gold marker icon
        const markerIcon = Leaf.divIcon({
        className: 'custom-gold-marker',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 32px;
              height: 32px;
              background: rgba(212, 175, 55, 0.15);
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
            <div style="
              width: 20px;
              height: 20px;
              background: linear-gradient(135deg, #2563EB, #B8860B);
              border: 2px solid #1a2332;
              border-radius: 50%;
              box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
              z-index: 1;
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = Leaf.marker(zone.coordinates, { icon: markerIcon })
          .addTo(map)
          .bindTooltip(
          `<div style="
            background: rgba(12, 25, 41, 0.95);
            border: 1px solid #2563EB;
            border-radius: 8px;
            padding: 8px 12px;
            color: #2563EB;
            font-weight: 600;
            font-size: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          ">
            <div>${language === 'en' ? zone.nameEn : zone.name}</div>
            <div style="color: #888; font-size: 10px; margin-top: 2px;">ROI: ${zone.avgRoi}%</div>
          </div>`,
          { 
            permanent: false, 
            direction: 'top',
            offset: [0, -15],
            className: 'gold-tooltip'
          }
        );

      marker.on('click', () => onZoneClick(zone));
      marker.on('mouseover', () => onZoneHover(zone.id));
      marker.on('mouseout', () => onZoneHover(null));

      // Store marker data for later updates
      (marker as any).zoneId = zone.id;
      markersRef.current.push(marker);
    });

      mapRef.current = map;
    };

    initMap();

    // Cleanup
    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [language, isMobile, isMapActive]); // Reinitialize when language changes or mobile activation

  // Update markers when selection changes
  useEffect(() => {
    const Leaf = leafletRef.current;
    if (!Leaf) return;

    markersRef.current.forEach((marker) => {
      const zoneId = (marker as any).zoneId;
      const isSelected = selectedZone?.id === zoneId;

      // Update marker appearance based on selection
      const icon = marker.getIcon() as L.DivIcon;
      if (isSelected && icon.options.className !== 'custom-gold-marker-selected') {
        marker.setIcon(Leaf.divIcon({
          className: 'custom-gold-marker-selected',
          html: `
            <div style="
              position: relative;
              width: 50px;
              height: 50px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                position: absolute;
                width: 45px;
                height: 45px;
                background: rgba(212, 175, 55, 0.25);
                border-radius: 50%;
                animation: pulse 1.5s infinite;
              "></div>
              <div style="
                width: 28px;
                height: 28px;
                background: linear-gradient(135deg, #2563EB, #B8860B);
                border: 3px solid #1a2332;
                border-radius: 50%;
                box-shadow: 0 0 20px rgba(212, 175, 55, 0.7);
                z-index: 1;
              "></div>
            </div>
          `,
          iconSize: [50, 50],
          iconAnchor: [25, 25],
        }));
      } else if (!isSelected && icon.options.className === 'custom-gold-marker-selected') {
        marker.setIcon(Leaf.divIcon({
          className: 'custom-gold-marker',
          html: `
            <div style="
              position: relative;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                position: absolute;
                width: 32px;
                height: 32px;
                background: rgba(212, 175, 55, 0.15);
                border-radius: 50%;
                animation: pulse 2s infinite;
              "></div>
              <div style="
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #2563EB, #B8860B);
                border: 2px solid #1a2332;
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
                z-index: 1;
              "></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }));
      }
    });
  }, [selectedZone]);

  return (
    <div 
      className="w-full h-[450px] relative z-0"
      style={{ 
        background: '#0a1520',
        borderRadius: '1rem',
      }}
      data-testid="leaflet-map"
    >
      {/* Map container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ borderRadius: '1rem' }}
      />
      
      {/* Mobile overlay - tap to interact */}
      {isMobile && !isMapActive && (
        <div 
          className="absolute inset-0 z-[1001] bg-card/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer rounded-2xl"
          onClick={() => setIsMapActive(true)}
          data-testid="map-activate-overlay"
        >
          <div className="bg-card/90 backdrop-blur-sm px-6 py-4 rounded-xl border border-primary/40 text-center">
            <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-foreground font-medium">
              {language === 'en' ? 'Tap to explore map' : 'לחץ לחקירת המפה'}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {language === 'en' ? 'Swipe to navigate zones' : 'החלק לניווט באזורים'}
            </p>
          </div>
        </div>
      )}
      
      {/* DUBAI title overlay */}
      <div 
        className="absolute top-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/30"
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-primary font-bold text-lg">DUBAI</div>
        <div className="text-muted-foreground text-xs">
          {language === 'en' ? 'Investment Zones' : 'אזורי השקעה'}
        </div>
      </div>
      
      {/* Legend */}
      <div 
        className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/30 flex items-center gap-2"
        style={{ pointerEvents: 'none' }}
      >
        <div className="w-3 h-3 rounded-full bg-primary" />
        <span className="text-muted-foreground text-xs">
          {language === 'en' ? 'Click zone for details' : 'לחצו על אזור לפרטים'}
        </span>
      </div>
      
      {/* Close button when map is active on mobile */}
      {isMobile && isMapActive && (
        <button
          className="absolute top-4 right-4 z-[1001] bg-card/90 backdrop-blur-sm p-2 rounded-lg border border-primary/30"
          onClick={() => setIsMapActive(false)}
          data-testid="map-close-button"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      )}
    </div>
  );
}

export function DubaiZonesSection() {
  const { t, isRTL, language } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<DubaiZone | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Fetch dynamic zones from API
  const { data: apiZones, isError } = useQuery<InvestmentZone[]>({
    queryKey: ["investment-zones"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/investment-zones");
        if (!res.ok) return [];
        return res.json();
      } catch (error) {
        // Network error or other fetch failure - return empty array for graceful degradation
        console.error("Failed to fetch investment zones:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once to avoid blocking the page
  });

  // Use API data if available, otherwise use defaults
  const dubaiZones = useMemo(() => {
    if (apiZones && apiZones.length > 0) {
      return apiZones
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(convertApiZoneToDisplay);
    }
    return defaultDubaiZones;
  }, [apiZones]);

  const closeModal = useCallback(() => {
    setSelectedZone(null);
    setHoveredZone(null);
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedZone) {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedZone, closeModal]);

  const getZoneProjects = (zoneId: string) => {
    const zoneNames = zoneLocationMap[zoneId] || [];
    return projects.filter((project) =>
      zoneNames.some(
        (name) =>
          project.location?.toLowerCase().includes(name.toLowerCase()) ||
          project.locationEn?.toLowerCase().includes(name.toLowerCase())
      )
    );
  };

  const getDemandBadge = (demand: string) => {
    const demandConfig: Record<string, { label: string; labelEn: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      "very-high": { label: "ביקוש גבוה מאוד", labelEn: "Very High Demand", variant: "destructive" },
      high: { label: "ביקוש גבוה", labelEn: "High Demand", variant: "default" },
      medium: { label: "ביקוש בינוני", labelEn: "Medium Demand", variant: "secondary" },
      premium: { label: "פרימיום", labelEn: "Premium", variant: "outline" },
    };
    const config = demandConfig[demand] || demandConfig.medium;
    return (
      <Badge variant={config.variant} className="text-xs">
        {language === "en" ? config.labelEn : config.label}
      </Badge>
    );
  };

  return (
    <section
      id="zones"
      className="relative py-20 md:py-28 overflow-hidden bg-background"
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="section-zones"
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary/50">
            <MapPin className="w-3 h-3 mr-1" />
            {t("zones.badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t("zones.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("zones.subtitle")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none z-10" />
              
              {/* Professional Leaflet Map */}
              <LeafletMap 
                zones={dubaiZones}
                language={language}
                onZoneClick={setSelectedZone}
                onZoneHover={setHoveredZone}
                selectedZone={selectedZone}
              />
              
              {/* Hover info tooltip */}
              <AnimatePresence>
                {hoveredZone && !selectedZone && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 border border-primary/30"
                    data-testid="zone-tooltip"
                    role="tooltip"
                  >
                    {(() => {
                      const zone = dubaiZones.find(z => z.id === hoveredZone);
                      if (!zone) return null;
                      return (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-foreground" data-testid="tooltip-zone-name">
                              {language === "en" ? zone.nameEn : zone.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {language === "en" ? zone.descriptionEn : zone.description}
                            </p>
                          </div>
                          <div className="flex gap-4 text-center">
                            <div>
                              <p className="text-lg font-bold text-primary" data-testid="tooltip-roi">{zone.avgRoi}%</p>
                              <p className="text-xs text-muted-foreground">ROI</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-400" data-testid="tooltip-appreciation">+{zone.appreciation}%</p>
                              <p className="text-xs text-muted-foreground">{t("zones.appreciation")}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Zone Cards Grid */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {dubaiZones.map((zone, index) => (
              <div
                key={zone.id}
              >
                <Card
                  className={`group relative p-4 bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer transition-all duration-300 overflow-hidden ${
                    hoveredZone === zone.id || selectedZone?.id === zone.id
                      ? "border-primary/50 shadow-lg shadow-primary/10"
                      : "hover:border-border"
                  }`}
                  onClick={() => setSelectedZone(zone)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  data-testid={`card-zone-${zone.id}`}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
                    style={{ backgroundColor: zone.color }}
                  />

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${zone.color}20` }}
                      >
                        <Building2
                          className="h-4 w-4"
                          style={{ color: zone.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm">
                          {language === "en" ? zone.nameEn : zone.name}
                        </h3>
                        {getDemandBadge(zone.demand)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-lg font-bold text-primary">{zone.avgRoi}%</p>
                      <p className="text-[9px] text-muted-foreground">ROI</p>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <p className="text-lg font-bold text-foreground">{zone.rentalYield}%</p>
                      <p className="text-[9px] text-muted-foreground">{t("zones.rental")}</p>
                    </div>
                    <div className="text-center p-2 bg-green-900/20 rounded-lg border border-green-800/30">
                      <p className="text-lg font-bold text-green-400">+{zone.appreciation}%</p>
                      <p className="text-[9px] text-muted-foreground">{t("zones.appreciation")}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {getZoneProjects(zone.id).length} {t("zones.projectsCount")}
                    </span>
                    <span className="text-primary flex items-center gap-1">
                      {t("zones.viewDetails")}
                      {isRTL ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </span>
                  </div>
                </Card>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedZone && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={closeModal}
              data-testid="modal-overlay"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full z-[51] overflow-auto max-h-[90vh]"
              dir={isRTL ? "rtl" : "ltr"}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-6 bg-card border-border/50 shadow-2xl">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${selectedZone.color}20` }}
                    >
                      <Building2
                        className="h-6 w-6"
                        style={{ color: selectedZone.color }}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {language === "en"
                          ? selectedZone.nameEn
                          : selectedZone.name}
                      </h3>
                      {getDemandBadge(selectedZone.demand)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeModal}
                    aria-label={language === "en" ? "Close zone details" : "סגור פרטי אזור"}
                    data-testid="button-close-modal"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <p className="text-muted-foreground mb-6">
                  {language === "en"
                    ? selectedZone.descriptionEn
                    : selectedZone.description}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/30">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {selectedZone.avgRoi}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("zones.avgRoi")}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Home className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedZone.rentalYield}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("zones.rental")}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-900/20 rounded-xl border border-green-800/30">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Sparkles className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-400">
                      +{selectedZone.appreciation}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("zones.appreciation")}
                    </p>
                  </div>
                </div>

                {/* Projects in this zone */}
                {getZoneProjects(selectedZone.id).length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      {t("zones.projectsInZone")}
                    </h4>
                    <div className="space-y-2">
                      {getZoneProjects(selectedZone.id)
                        .slice(0, 3)
                        .map((project) => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {language === "en" && project.nameEn
                                  ? project.nameEn
                                  : project.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {project.developer}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary text-sm">
                                {formatPrice(project.priceFrom || 0)} AED
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full luxury-button"
                  onClick={() => {
                    setSelectedZone(null);
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  data-testid="button-zone-cta"
                >
                  {t("zones.getConsultation")}
                </Button>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
