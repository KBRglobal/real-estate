import { memo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  Landmark,
  ShoppingBag,
  GraduationCap,
  Building2,
  Waves,
  Dumbbell,
  Sparkles,
  Car,
  TreePine,
  Wifi,
  Coffee,
  Baby,
  Shield,
  PawPrint,
  AlertCircle,
  Clock,
  Compass,
} from "lucide-react";
import type { AmenityCategory, Neighborhood } from "../types";
import { getIcon } from "../utils";

interface LocationAmenitiesV2Props {
  location: string;
  neighborhood?: Neighborhood | null;
  amenities?: AmenityCategory[] | null;
  coordinates?: { lat: number; lng: number } | null;
}

const typeIcons: Record<string, React.ElementType> = {
  landmark: Landmark,
  transport: Navigation,
  shopping: ShoppingBag,
  education: GraduationCap,
  medical: Building2,
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function LeafletMap({ lat, lng, location }: { lat: number; lng: number; location: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    let mounted = true;
    let mapInstance: any = null;

    setIsLoaded(false);
    setHasError(false);

    const initMap = async () => {
      try {
        const L = await import("leaflet");
        await import("leaflet/dist/leaflet.css");

        if (!mounted || !containerRef.current) return;

        if (mapRef.current) {
          mapRef.current.remove();
        }

        const disableTouch = isMobile && !isActive;

        mapInstance = L.map(containerRef.current, {
          center: [lat, lng],
          zoom: 14,
          scrollWheelZoom: false,
          zoomControl: false,
          attributionControl: false,
          dragging: !disableTouch,
          touchZoom: !disableTouch,
        });

        // Dark luxury tile layer (matching homepage)
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 19,
        }).addTo(mapInstance);

        L.control.zoom({ position: "topright" }).addTo(mapInstance);

        // Gold marker matching site theme
        const goldMarker = L.divIcon({
          className: "custom-gold-marker",
          html: `<div style="
            width: 36px; height: 36px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border: 3px solid #fbbf24;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 0 16px rgba(245,158,11,0.5);
          "><div style="
            width: 10px; height: 10px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
          "></div></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });

        L.marker([lat, lng], { icon: goldMarker })
          .addTo(mapInstance)
          .bindPopup(`<div style="font-weight:600;color:#333;">${location}</div>`);

        mapRef.current = mapInstance;
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load map:", error);
        if (mounted) setHasError(true);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
      mapRef.current = null;
    };
  }, [lat, lng, location, isMobile, isActive]);

  if (hasError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white/5 rounded-xl">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400/60 mx-auto mb-2" />
          <p className="text-white/40 text-sm">שגיאה בטעינת המפה</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl z-10">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-white/20 mx-auto mb-2 animate-pulse" />
            <p className="text-white/40 text-sm">טוען מפה...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="h-full w-full rounded-xl"
        style={{ minHeight: "200px" }}
      />

      {/* Mobile: tap-to-activate overlay */}
      {isMobile && !isActive && isLoaded && (
        <div
          className="absolute inset-0 z-[1001] bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer rounded-2xl"
          onClick={() => setIsActive(true)}
        >
          <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-amber-500/40 text-center">
            <MapPin className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-white font-medium">לחץ להצגת מיקום על המפה</p>
          </div>
        </div>
      )}

      {/* Mobile: close button when active */}
      {isMobile && isActive && (
        <button
          className="absolute top-3 right-3 z-[1001] bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-amber-500/30"
          onClick={() => setIsActive(false)}
        >
          <span className="text-white text-sm px-1">✕</span>
        </button>
      )}
    </div>
  );
}

export const LocationAmenitiesV2 = memo(function LocationAmenitiesV2({
  location,
  neighborhood,
  amenities,
  coordinates,
}: LocationAmenitiesV2Props) {
  const nearbyPlaces = neighborhood?.nearbyPlaces?.filter(
    (p) => p.name && p.distance
  );

  // Flatten all amenity items for impressive grid display
  const allAmenities = amenities
    ?.flatMap((cat) => cat.items || [])
    .filter((item) => item?.nameHe || item?.name);

  return (
    <section className="py-12 sm:py-16 bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===== FULL-WIDTH MAP SECTION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">מיקום</h3>
              <p className="text-white/60 text-sm">{location}</p>
            </div>
          </div>

          {/* Full-width Map */}
          <div className="w-full h-[280px] sm:h-[400px] lg:h-[500px] bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            {coordinates ? (
              <LeafletMap lat={coordinates.lat} lng={coordinates.lng} location={location} />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">מפה אינטראקטיבית</p>
                  <p className="text-white/30 text-xs">{location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Nearby Places - horizontal cards under map (show 3 or 6 for clean rows) */}
          {nearbyPlaces && nearbyPlaces.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
              {nearbyPlaces.slice(0, nearbyPlaces.length >= 6 ? 6 : 3).map((place, idx) => {
                const Icon = typeIcons[place.type || "landmark"] || Landmark;
                const categoryColors: Record<string, string> = {
                  landmark: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
                  transport: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
                  shopping: "from-purple-500/20 to-purple-600/5 border-purple-500/30",
                  education: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
                  medical: "from-rose-500/20 to-rose-600/5 border-rose-500/30",
                };
                const categoryIconColors: Record<string, string> = {
                  landmark: "text-amber-400",
                  transport: "text-blue-400",
                  shopping: "text-purple-400",
                  education: "text-emerald-400",
                  medical: "text-rose-400",
                };
                const colorClass = categoryColors[place.type || "landmark"] || categoryColors.landmark;
                const iconColor = categoryIconColors[place.type || "landmark"] || categoryIconColors.landmark;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl bg-gradient-to-r ${colorClass} border backdrop-blur-sm hover:shadow-lg transition-all duration-300`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                          {place.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/60 mt-0.5">
                          <Compass className="h-3 w-3" />
                          <span>{place.distance}</span>
                          {place.driveTime && (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{place.driveTime}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Description */}
          {neighborhood?.description && (
            <p className="mt-6 text-white/60 text-sm leading-relaxed">
              {neighborhood.description}
            </p>
          )}
        </motion.div>

        {/* ===== AMENITIES - FULL FLAT GRID ===== */}
        {(allAmenities && allAmenities.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">מתקנים ושירותים</h3>
                <p className="text-white/60 text-sm">
                  {allAmenities.length} מתקנים
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {allAmenities.map((amenity, idx) => {
                const IconComponent = getIcon(amenity.icon);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/20 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-white/80 text-sm truncate">
                      {amenity.nameHe || amenity.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Fallback when no amenities data */}
        {(!allAmenities || allAmenities.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">מתקנים ושירותים</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: Waves, name: "בריכה" },
                { icon: Dumbbell, name: "חדר כושר" },
                { icon: Sparkles, name: "ספא" },
                { icon: Car, name: "חניה" },
                { icon: Shield, name: "אבטחה 24/7" },
                { icon: TreePine, name: "גינה" },
              ].map((amenity, idx) => {
                const Icon = amenity.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-white/80 text-sm">
                      {amenity.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
});

export default LocationAmenitiesV2;
