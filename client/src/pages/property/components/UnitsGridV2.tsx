import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BedDouble, Ruler, Check, X, Home, TrendingUp, Maximize2, GitCompare, Sparkles, ArrowUpDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "../utils";
import { cn } from "@/lib/utils";

export interface UnitDataV2 {
  id: string;
  type: string;
  bedrooms: number;
  size: number;
  sizeUnit?: string;
  price: number;
  priceCurrency?: string;
  isAvailable: boolean;
  floor?: string;
  view?: string;
}

interface UnitTypeSummaryV2 {
  bedrooms: number;
  label: string;
  count: number;
  startingPrice: number;
  maxPrice: number;
  minSize: number;
  maxSize: number;
}

type SortOption = "price-asc" | "price-desc" | "size-asc" | "size-desc";

interface UnitsGridV2Props {
  propertyName: string;
  units: UnitDataV2[];
  onUnitInterest: (unit: UnitDataV2) => void;
}

export const UnitsGridV2 = memo(function UnitsGridV2({
  propertyName,
  units,
  onUnitInterest,
}: UnitsGridV2Props) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [compareUnits, setCompareUnits] = useState<Set<string>>(new Set());

  // Unit type summaries for pricing overview
  const unitTypeSummaries = useMemo((): UnitTypeSummaryV2[] => {
    const summaries: UnitTypeSummaryV2[] = [];
    const uniqueBedrooms = Array.from(new Set(units.map((u) => u.bedrooms))).sort(
      (a, b) => a - b
    );

    uniqueBedrooms.forEach(bedroomCount => {
      const unitsOfType = units.filter(u => u.bedrooms === bedroomCount);

      if (unitsOfType.length > 0) {
        const prices = unitsOfType.map(u => u.price).filter(p => p > 0);
        const sizes = unitsOfType.map(u => u.size).filter(s => s > 0);

        summaries.push({
          bedrooms: bedroomCount,
          label: bedroomCount === 0 ? "סטודיו" : `${bedroomCount} חדרים`,
          count: unitsOfType.length,
          startingPrice: prices.length > 0 ? Math.min(...prices) : 0,
          maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
          minSize: sizes.length > 0 ? Math.min(...sizes) : 0,
          maxSize: sizes.length > 0 ? Math.max(...sizes) : 0,
        });
      }
    });

    return summaries;
  }, [units]);

  // Get unique bedroom counts for filter tabs
  const bedroomFilters = useMemo(() => {
    const bedrooms = Array.from(new Set(units.map((u) => u.bedrooms))).sort(
      (a, b) => a - b
    );
    return ["all", ...bedrooms.map(String)];
  }, [units]);

  const filteredUnits = useMemo(() => {
    if (activeFilter === "all") return units;
    return units.filter((u) => u.bedrooms === parseInt(activeFilter));
  }, [units, activeFilter]);

  const sortedUnits = useMemo(() => {
    return [...filteredUnits].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "size-asc":
          return a.size - b.size;
        case "size-desc":
          return b.size - a.size;
        default:
          return 0;
      }
    });
  }, [filteredUnits, sortBy]);

  const toggleCompare = (unitId: string) => {
    setCompareUnits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else if (newSet.size < 3) {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const clearComparison = () => {
    setCompareUnits(new Set());
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "price-asc", label: "מחיר: נמוך לגבוה" },
    { value: "price-desc", label: "מחיר: גבוה לנמוך" },
    { value: "size-asc", label: "גודל: קטן לגדול" },
    { value: "size-desc", label: "גודל: גדול לקטן" },
  ];

  const getFilterLabel = (filter: string) => {
    if (filter === "all") return "הכל";
    if (filter === "0") return "סטודיו";
    return `${filter} חדרים`;
  };

  const getBedroomLabel = (bedrooms: number) => {
    if (bedrooms === 0) return "סטודיו";
    return `${bedrooms} חדרים`;
  };

  if (units.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            בחר את הדירה שלך
          </h2>
          <p className="text-white/60">
            {units.filter((u) => u.isAvailable).length} יחידות זמינות ב{propertyName}
          </p>
        </motion.div>

        {/* Pricing Summary Cards */}
        {unitTypeSummaries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unitTypeSummaries.map((summary, index) => (
                <motion.button
                  key={summary.bedrooms}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setActiveFilter(String(summary.bedrooms))}
                  className={`relative p-4 sm:p-5 rounded-2xl text-right transition-all duration-300 overflow-hidden ${
                    activeFilter === String(summary.bedrooms)
                      ? "bg-amber-500/10 border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                      : "bg-white/5 border border-white/10 hover:border-amber-400/30 hover:bg-white/10"
                  }`}
                >
                  {/* Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activeFilter === String(summary.bedrooms)
                          ? "bg-amber-400/20 text-amber-300"
                          : "bg-white/10 text-white/60"
                      }`}>
                        {summary.label}
                      </div>
                      <span className="text-xs text-white/40">
                        ({summary.count} יח׳)
                      </span>
                    </div>
                    <Home className={`h-5 w-5 ${
                      activeFilter === String(summary.bedrooms) ? "text-amber-400" : "text-white/40"
                    }`} />
                  </div>

                  {/* Starting Price */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1 text-xs text-white/50 mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>מחיר התחלתי</span>
                    </div>
                    <div className={`text-lg sm:text-xl font-bold truncate ${
                      activeFilter === String(summary.bedrooms) ? "text-amber-400" : "text-white"
                    }`}>
                      {summary.startingPrice > 0
                        ? formatPrice(summary.startingPrice, "AED")
                        : "מתעדכן"
                      }
                    </div>

                    {/* Price Range Bar */}
                    {summary.startingPrice > 0 && summary.maxPrice > summary.startingPrice && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              activeFilter === String(summary.bedrooms)
                                ? "bg-gradient-to-r from-amber-400 to-amber-300"
                                : "bg-white/30"
                            }`}
                            style={{
                              width: `${Math.min(100, (summary.startingPrice / summary.maxPrice) * 100)}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-white/40">
                            {formatPrice(summary.startingPrice, "AED")}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {formatPrice(summary.maxPrice, "AED")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Size Range */}
                  {summary.minSize > 0 && (
                    <div className="flex items-center gap-1 text-xs text-white/50">
                      <Maximize2 className="h-3 w-3" />
                      <span>
                        {summary.minSize === summary.maxSize
                          ? `${summary.minSize.toLocaleString()} sqft`
                          : `${summary.minSize.toLocaleString()}-${summary.maxSize.toLocaleString()} sqft`
                        }
                      </span>
                    </div>
                  )}

                  {/* Active Indicator */}
                  {activeFilter === String(summary.bedrooms) && (
                    <div className="absolute top-3 left-3">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filter and Sort Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Filter Tabs */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Home className="h-4 w-4" />
                  <span>סינון לפי סוג:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bedroomFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeFilter === filter
                          ? "bg-amber-500 text-white shadow-[0_4px_20px_rgba(251,191,36,0.3)]"
                          : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white hover:border-amber-400/30"
                      }`}
                    >
                      {getFilterLabel(filter)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>מיון:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        sortBy === option.value
                          ? "bg-white/10 text-white border border-white/20"
                          : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comparison Bar */}
        <AnimatePresence>
          {compareUnits.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-400/30 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <GitCompare className="h-5 w-5 text-amber-400" />
                  <span className="text-white font-medium">
                    נבחרו {compareUnits.size} מתוך 3 יחידות להשוואה
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={clearComparison}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    נקה הכל
                  </Button>
                  <Button
                    disabled={compareUnits.size < 2}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                  >
                    השווה יחידות ({compareUnits.size})
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Units Grid */}
        <AnimatePresence mode="sync">
          {sortedUnits.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedUnits.map((unit, idx) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{
                    duration: 0.3,
                    delay: idx * 0.05,
                    ease: "easeOut"
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative glass-card rounded-2xl overflow-hidden hover:border-amber-400/30 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(251,191,36,0.15)]"
                >
                  {/* Comparison Checkbox */}
                  <div className="absolute top-4 left-4 z-20">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-xl transition-all duration-200",
                        compareUnits.has(unit.id)
                          ? "bg-amber-500/20 border border-amber-400/50"
                          : "bg-black/30 border border-white/10 hover:border-amber-400/30"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(unit.id);
                      }}
                    >
                      <Checkbox
                        checked={compareUnits.has(unit.id)}
                        onCheckedChange={() => toggleCompare(unit.id)}
                        disabled={!compareUnits.has(unit.id) && compareUnits.size >= 3}
                        className="border-white/30 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                      />
                      <span className={cn(
                        "text-xs font-medium",
                        compareUnits.has(unit.id) ? "text-amber-400" : "text-white/70"
                      )}>
                        השווה
                      </span>
                    </motion.div>
                  </div>

                  <div className="p-6">
                    {/* Top Row: Badges */}
                    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {/* Availability Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            unit.isAvailable
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {unit.isAvailable ? (
                            <>
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                              </span>
                              זמין
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3" />
                              נמכר
                            </>
                          )}
                        </span>

                        {/* Unit Type Badge */}
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-400/20">
                          {unit.bedrooms === 0 ? "סטודיו" : `${unit.bedrooms} חד׳`}
                        </span>
                      </div>

                      {unit.view && (
                        <span className="text-xs text-white/50">{unit.view}</span>
                      )}
                    </div>

                    {/* Unit Type */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble className="h-5 w-5 text-amber-400" />
                        <span className="text-lg font-bold text-white">
                          {getBedroomLabel(unit.bedrooms)}
                        </span>
                      </div>
                      <div className="text-sm text-white/50">{unit.type}</div>
                    </div>

                    {/* Size */}
                    <div className="flex items-center gap-2 mb-6">
                      <Ruler className="h-4 w-4 text-white/40" />
                      <span className="text-white/70">
                        {unit.size.toLocaleString()} {unit.sizeUnit || "sqft"}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-xs text-white/50 uppercase tracking-wide mb-1">
                        החל מ-
                      </div>
                      <div className="text-2xl font-bold text-amber-400">
                        {formatPrice(unit.price, unit.priceCurrency || "AED")}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => onUnitInterest(unit)}
                      disabled={!unit.isAvailable}
                      className={`w-full ${
                        unit.isAvailable
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-[0_4px_20px_rgba(251,191,36,0.3)] hover:shadow-[0_8px_30px_rgba(251,191,36,0.5)]"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {unit.isAvailable ? (
                        <>
                          <Check className="h-4 w-4 ml-2" />
                          בקש מידע
                        </>
                      ) : (
                        "נמכר"
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {sortedUnits.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
            >
              <Building2 className="h-10 w-10 text-white/30" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-white mb-2">
                לא נמצאו יחידות מתאימות
              </h3>
              <p className="text-lg text-white/50 mb-6 max-w-md mx-auto">
                {activeFilter !== "all"
                  ? `אין יחידות זמינות בקטגוריית ${getFilterLabel(activeFilter)}. נסה לבחור קטגוריה אחרת.`
                  : "אין יחידות זמינות כרגע."}
              </p>
              {activeFilter !== "all" && (
                <Button
                  onClick={() => setActiveFilter("all")}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                >
                  <Sparkles className="h-4 w-4 ml-2" />
                  הצג את כל היחידות
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
});

export default UnitsGridV2;
