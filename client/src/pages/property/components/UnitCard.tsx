import { motion, AnimatePresence } from "framer-motion";
import { Bed, Bath, Square, CheckCircle, Eye, Layers, Sparkles, FileImage, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface UnitData {
  id: string;
  type: string;
  typeEn?: string;
  bedrooms: number;
  bathrooms?: number;
  size: number; // sqft
  price: number;
  isAvailable?: boolean;
  floor?: string;
  view?: string;
  floorPlanImage?: string;
}

interface UnitCardProps {
  unit: UnitData;
  onInterestClick?: (unit: UnitData) => void;
  index?: number;
  className?: string;
}

export function UnitCard({
  unit,
  onInterestClick,
  index = 0,
  className = "",
}: UnitCardProps) {
  const [showFloorPlan, setShowFloorPlan] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleClick = () => {
    if (onInterestClick) {
      onInterestClick(unit);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 0.5,
          delay: index * 0.08,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        whileHover={{ y: -12, scale: 1.02 }}
        className="h-full"
      >
        {/* Glass Card with Premium Design */}
        <div
          className={cn(
            "relative h-full rounded-2xl overflow-hidden cursor-pointer group",
            // Glassmorphism effect
            "bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-transparent",
            "backdrop-blur-xl",
            // Border with gold accent on hover
            "border border-white/10",
            "hover:border-[#2563EB]/40",
            // Shadow effects
            "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
            "hover:shadow-[0_20px_60px_rgba(212,175,55,0.25)]",
            "transition-all duration-500",
            className
          )}
          onClick={handleClick}
        >
          {/* Gold shimmer effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/10 via-transparent to-[#2563EB]/5" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2563EB]/50 to-transparent" />
          </div>

        {/* Content Container */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Top Row: Badges */}
          <div className="flex items-start justify-between mb-5 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Availability Badge with Pulse */}
              {unit.isAvailable !== false && (
                <Badge
                  className={cn(
                    "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
                    "flex items-center gap-2 px-3 py-1.5 rounded-full",
                    "shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                  )}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-semibold">זמין</span>
                </Badge>
              )}

              {/* Unit Type Badge */}
              <Badge
                className={cn(
                  "bg-[#2563EB]/20 text-[#2563EB] border-[#2563EB]/30",
                  "px-3 py-1.5 rounded-full text-xs font-semibold"
                )}
              >
                {unit.bedrooms === 0 ? "סטודיו" : `${unit.bedrooms} חד׳`}
              </Badge>
            </div>

            {/* Floor Plan Preview Button */}
            {unit.floorPlanImage && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFloorPlan(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/30 hover:bg-[#2563EB]/20 transition-colors"
              >
                <FileImage className="h-3.5 w-3.5 text-[#2563EB]" />
                <span className="text-xs font-medium text-[#2563EB]">תכנית</span>
              </motion.button>
            )}
          </div>

          {/* Unit Type with Icon */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/5 border border-[#2563EB]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Bed className="h-6 w-6 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white group-hover:text-[#2563EB] transition-colors duration-300">
                {unit.type}
              </h3>
              <p className="text-sm text-white/50">
                {unit.bedrooms === 0 ? "סטודיו" : `${unit.bedrooms} חדרי שינה`}
              </p>
            </div>
          </div>

          {/* Key Stats Row */}
          <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-6">
              {/* Bedrooms */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                  <Bed className="h-4 w-4 text-[#2563EB]" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/50">חדרי שינה</div>
                  <div className="text-sm font-bold text-white">
                    {unit.bedrooms === 0 ? "סטודיו" : unit.bedrooms}
                  </div>
                </div>
              </div>

              {/* Bathrooms */}
              {unit.bathrooms !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                    <Bath className="h-4 w-4 text-[#2563EB]" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/50">אמבטיות</div>
                    <div className="text-sm font-bold text-white">{unit.bathrooms}</div>
                  </div>
                </div>
              )}

              {/* Size */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                  <Square className="h-4 w-4 text-[#2563EB]" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/50">שטח</div>
                  <div className="text-sm font-bold text-white">{unit.size.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Section - Premium Design */}
          <div className="relative mb-6 p-5 rounded-xl overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/15 via-[#2563EB]/5 to-transparent" />
            <div className="absolute inset-0 border border-[#2563EB]/20 rounded-xl" />

            <div className="relative">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">החל מ-</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-[#2563EB] via-[#F5E6B8] to-[#2563EB] bg-clip-text text-transparent">
                AED {formatCurrency(unit.price)}
              </p>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-3 mb-6 flex-grow">
            {unit.floor && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-white/60" />
                </div>
                <span className="text-white/70">קומה {unit.floor}</span>
              </div>
            )}
            {unit.view && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white/60" />
                </div>
                <span className="text-white/70">נוף: {unit.view}</span>
              </div>
            )}
          </div>

          {/* CTA Buttons Row */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className={cn(
                "h-12 text-sm font-semibold rounded-xl",
                "bg-gradient-to-r from-[#2563EB] via-[#C9A227] to-[#2563EB]",
                "hover:from-[#E5C547] hover:via-[#2563EB] hover:to-[#E5C547]",
                "text-black",
                "shadow-[0_4px_20px_rgba(212,175,55,0.3)]",
                "hover:shadow-[0_8px_30px_rgba(212,175,55,0.5)]",
                "transition-all duration-300",
                "group/btn"
              )}
            >
              <Sparkles className="h-4 w-4 ml-2 group-hover/btn:rotate-12 transition-transform duration-300" />
              בקש מידע
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              variant="outline"
              className={cn(
                "h-12 text-sm font-semibold rounded-xl",
                "border-[#2563EB]/30 text-[#2563EB]",
                "hover:bg-[#2563EB]/10 hover:border-[#2563EB]/50",
                "transition-all duration-300",
                "group/btn"
              )}
            >
              <Calendar className="h-4 w-4 ml-2" />
              קבע ביקור
            </Button>
          </div>
        </div>
      </div>
    </motion.div>

    {/* Floor Plan Modal */}
    <AnimatePresence>
      {showFloorPlan && unit.floorPlanImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowFloorPlan(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#0A0A0F] rounded-2xl border border-[#2563EB]/30 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">תכנית קומה - {unit.type}</h3>
              <button
                onClick={() => setShowFloorPlan(false)}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-white/70" />
              </button>
            </div>

            {/* Floor Plan Image */}
            <div className="p-6">
              <img
                src={unit.floorPlanImage}
                alt={`תכנית קומה ${unit.type}`}
                className="w-full h-auto rounded-xl"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

export default UnitCard;
