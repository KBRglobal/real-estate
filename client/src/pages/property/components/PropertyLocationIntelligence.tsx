import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Building,
  Plane,
  ShoppingBag,
  GraduationCap,
  Stethoscope,
  Car,
  Train,
  BarChart3,
  Waves,
  TreePine,
  Ticket,
  CircleDot,
  Navigation,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationPOI {
  name: string;
  distance: string;
  type: "landmark" | "transport" | "shopping" | "education" | "medical" | "beach" | "restaurant" | "park";
}

interface PropertyLocationIntelligenceProps {
  locationName: string;
  locationNameEn?: string;
  coordinates?: [number, number];
  averageRoi?: number;
  rentalYield?: number;
  appreciation5Years?: number;
  demand?: "low" | "medium" | "high" | "very-high" | "premium";
  nearbyPOIs?: LocationPOI[];
  transportLinks?: string[];
  className?: string;
}

const DEFAULT_POIS: LocationPOI[] = [
  { name: "מרינה מול", distance: "5 דקות", type: "shopping" },
  { name: "שדה התעופה DXB", distance: "25 דקות", type: "transport" },
  { name: "בורג' חליפה", distance: "15 דקות", type: "landmark" },
  { name: "בית חולים מדיקליניק", distance: "10 דקות", type: "medical" },
];

const POI_ICONS: Record<string, React.ElementType> = {
  landmark: Building,
  transport: Plane,
  shopping: ShoppingBag,
  education: GraduationCap,
  medical: Stethoscope,
  beach: Waves,
  park: TreePine,
  entertainment: Ticket,
  metro: Train,
  other: CircleDot,
};

const DEMAND_LABELS = {
  low: { text: "נמוכה", color: "text-orange-400", progress: 20 },
  medium: { text: "בינונית", color: "text-yellow-400", progress: 40 },
  high: { text: "גבוהה", color: "text-emerald-400", progress: 65 },
  "very-high": { text: "גבוהה מאוד", color: "text-emerald-400", progress: 85 },
  premium: { text: "פרימיום", color: "text-[#2563EB]", progress: 95 },
};

export function PropertyLocationIntelligence({
  locationName,
  locationNameEn,
  coordinates,
  demand = "high",
  nearbyPOIs = DEFAULT_POIS,
  transportLinks = ["מטרו דובאי", "קו RTA"],
  className = "",
}: PropertyLocationIntelligenceProps) {
  const demandInfo = DEMAND_LABELS[demand];

  return (
    <section className={cn("py-16 md:py-20 relative overflow-hidden", className)}>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#2563EB]/20 via-[#2563EB]/10 to-[#2563EB]/20 border border-[#2563EB]/30 backdrop-blur-sm mb-6"
          >
            <MapPin className="h-4 w-4 text-[#2563EB]" />
            <span className="text-sm font-semibold text-[#2563EB]">מיקום אסטרטגי</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-white">מידע על האזור: </span>
            <span className="bg-gradient-to-r from-[#2563EB] via-[#F5E6B8] to-[#2563EB] bg-clip-text text-transparent">
              {locationName}
            </span>
          </h2>
          {locationNameEn && (
            <p className="text-lg text-white/50">{locationNameEn}</p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Location Stats Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Demand Card */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent" />
              <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl" />
              <div className="absolute inset-0 border border-white/10 rounded-2xl" />

              <div className="relative z-10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider">רמת ביקוש באזור</p>
                    <p className={cn("text-2xl font-bold", demandInfo.color)}>
                      {demandInfo.text}
                    </p>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${demandInfo.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      demand === "premium" ? "bg-gradient-to-r from-[#2563EB] to-[#F5E6B8]" : "bg-emerald-500"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Transport Card */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent" />
              <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl" />
              <div className="absolute inset-0 border border-white/10 rounded-2xl" />

              <div className="relative z-10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Train className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-white">נגישות תחבורתית</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {transportLinks.map((link) => (
                    <span
                      key={link}
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70"
                    >
                      {link}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    חניה בשפע
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* POIs Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="relative rounded-2xl overflow-hidden h-full">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/10 via-transparent to-[#2563EB]/5" />
              <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl" />
              <div className="absolute inset-0 border border-white/10 rounded-2xl" />

              <div className="relative z-10 p-6 h-full">
                {/* Map Placeholder */}
                <div className="relative h-40 md:h-52 rounded-xl overflow-hidden mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/10 to-[#2563EB]/5" />
                  <div className="absolute inset-0 border border-[#2563EB]/20 rounded-xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center">
                        <Navigation className="h-8 w-8 text-[#2563EB]" />
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {locationName}
                      </p>
                      {coordinates && (
                        <p className="text-xs text-white/40 mt-1">
                          {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* POIs Grid */}
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#2563EB]" />
                  מרחקים לציוני דרך
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {nearbyPOIs.map((poi, index) => {
                    const Icon = POI_ICONS[poi.type] || CircleDot;
                    return (
                      <motion.div
                        key={poi.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.08 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="group cursor-pointer"
                      >
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#2563EB]/30 hover:bg-white/10 transition-all duration-300">
                          <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Icon className="h-5 w-5 text-[#2563EB]" />
                          </div>
                          <p className="text-sm font-medium text-white truncate mb-1">
                            {poi.name}
                          </p>
                          <p className="text-xs text-white/50">{poi.distance}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PropertyLocationIntelligence;
