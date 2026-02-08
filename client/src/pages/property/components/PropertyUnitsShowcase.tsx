import { motion, AnimatePresence } from "framer-motion";
import { Building2, Filter, ArrowUpDown, Home, Sparkles, TrendingUp, Maximize2, GitCompare } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { UnitCard, type UnitData } from "./UnitCard";
import { cn } from "@/lib/utils";
import { formatPrice } from "../utils";
import { Checkbox } from "@/components/ui/checkbox";

export type { UnitData };

interface PropertyUnitsShowcaseProps {
  units: UnitData[];
  propertyName?: string;
  onUnitInterest?: (unit: UnitData) => void;
  className?: string;
}

type SortOption = "price-asc" | "price-desc" | "size-asc" | "size-desc";
type FilterOption = "all" | "studio" | "1br" | "2br" | "3br" | "4br" | "penthouse";

interface UnitTypeSummary {
  type: FilterOption;
  label: string;
  count: number;
  startingPrice: number;
  maxPrice: number;
  minSize: number;
  maxSize: number;
}

export function PropertyUnitsShowcase({
  units,
  propertyName,
  onUnitInterest,
  className = "",
}: PropertyUnitsShowcaseProps) {
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [compareUnits, setCompareUnits] = useState<Set<string>>(new Set());

  // Unit type summaries for the pricing overview
  const unitTypeSummaries = useMemo((): UnitTypeSummary[] => {
    const summaries: UnitTypeSummary[] = [];

    const typeMap: Record<number, { type: FilterOption; label: string }> = {
      0: { type: "studio", label: "סטודיו" },
      1: { type: "1br", label: "חדר אחד" },
      2: { type: "2br", label: "2 חדרים" },
      3: { type: "3br", label: "3 חדרים" },
      4: { type: "4br", label: "4 חדרים" },
    };

    // Group units by bedroom count
    Object.entries(typeMap).forEach(([bedrooms, config]) => {
      const bedroomCount = parseInt(bedrooms);
      const unitsOfType = units.filter(u => u.bedrooms === bedroomCount);

      if (unitsOfType.length > 0) {
        const prices = unitsOfType.map(u => u.price).filter(p => p > 0);
        const sizes = unitsOfType.map(u => u.size).filter(s => s > 0);

        summaries.push({
          type: config.type,
          label: config.label,
          count: unitsOfType.length,
          startingPrice: prices.length > 0 ? Math.min(...prices) : 0,
          maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
          minSize: sizes.length > 0 ? Math.min(...sizes) : 0,
          maxSize: sizes.length > 0 ? Math.max(...sizes) : 0,
        });
      }
    });

    // Check for penthouse units (could be identified by type string)
    const penthouses = units.filter(u =>
      u.type?.toLowerCase().includes("penthouse") ||
      u.type?.toLowerCase().includes("פנטהאוז")
    );
    if (penthouses.length > 0) {
      const prices = penthouses.map(u => u.price).filter(p => p > 0);
      const sizes = penthouses.map(u => u.size).filter(s => s > 0);

      summaries.push({
        type: "penthouse",
        label: "פנטהאוז",
        count: penthouses.length,
        startingPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        minSize: sizes.length > 0 ? Math.min(...sizes) : 0,
        maxSize: sizes.length > 0 ? Math.max(...sizes) : 0,
      });
    }

    return summaries.sort((a, b) => a.startingPrice - b.startingPrice);
  }, [units]);

  // Dynamic filter options based on available units
  const availableFilters = useMemo(() => {
    const options: { value: FilterOption; label: string; count: number }[] = [
      { value: "all", label: "הכל", count: units.length },
    ];

    unitTypeSummaries.forEach(summary => {
      options.push({
        value: summary.type,
        label: summary.label,
        count: summary.count,
      });
    });

    return options;
  }, [units, unitTypeSummaries]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "price-asc", label: "מחיר: נמוך לגבוה" },
    { value: "price-desc", label: "מחיר: גבוה לנמוך" },
    { value: "size-asc", label: "גודל: קטן לגדול" },
    { value: "size-desc", label: "גודל: גדול לקטן" },
  ];

  const filteredUnits = units.filter((unit) => {
    if (filterBy === "all") return true;
    if (filterBy === "studio") return unit.bedrooms === 0;
    if (filterBy === "1br") return unit.bedrooms === 1;
    if (filterBy === "2br") return unit.bedrooms === 2;
    if (filterBy === "3br") return unit.bedrooms === 3;
    if (filterBy === "4br") return unit.bedrooms === 4;
    if (filterBy === "penthouse") {
      return unit.type?.toLowerCase().includes("penthouse") ||
             unit.type?.toLowerCase().includes("פנטהאוז");
    }
    return true;
  });

  const sortedUnits = [...filteredUnits].sort((a, b) => {
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

  const availableCount = units.filter((u) => u.isAvailable !== false).length;

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

  return (
    <section className={cn("py-16 md:py-24 relative", className)}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
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
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#2563EB]/20 via-[#2563EB]/10 to-[#2563EB]/20 border border-[#2563EB]/30 backdrop-blur-sm">
              <Home className="h-4 w-4 text-[#2563EB]" />
              <span className="text-sm font-semibold text-[#2563EB]">יחידות זמינות</span>
              <span className="px-2 py-0.5 rounded-full bg-[#2563EB]/20 text-xs font-bold text-[#2563EB]">
                {availableCount}
              </span>
            </div>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">בחר את </span>
            <span className="bg-gradient-to-r from-[#2563EB] via-[#F5E6B8] to-[#2563EB] bg-clip-text text-transparent">
              הדירה המושלמת
            </span>
            <span className="text-white"> עבורך</span>
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {propertyName && `מגוון יחידות לבחירתך ב${propertyName}`}
          </p>
        </motion.div>

        {/* Pricing Summary Cards */}
        {unitTypeSummaries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unitTypeSummaries.map((summary, index) => (
                <motion.button
                  key={summary.type}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  onClick={() => setFilterBy(summary.type)}
                  className={cn(
                    "relative p-6 rounded-2xl text-right transition-all duration-300",
                    "bg-gradient-to-br from-white/[0.08] to-white/[0.03]",
                    "backdrop-blur-xl border",
                    filterBy === summary.type
                      ? "border-[#2563EB] shadow-[0_0_30px_rgba(212,175,55,0.25)]"
                      : "border-white/10 hover:border-[#2563EB]/40"
                  )}
                >
                  {/* Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        filterBy === summary.type
                          ? "bg-[#2563EB]/20 text-[#2563EB]"
                          : "bg-white/10 text-white/60"
                      )}>
                        {summary.label}
                      </div>
                      <span className="text-xs text-white/40">
                        ({summary.count} יח׳)
                      </span>
                    </div>
                    <Home className={cn(
                      "h-5 w-5",
                      filterBy === summary.type ? "text-[#2563EB]" : "text-white/40"
                    )} />
                  </div>

                  {/* Starting Price */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1 text-xs text-white/50 mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>מחיר התחלתי</span>
                    </div>
                    <div className={cn(
                      "text-xl font-bold",
                      filterBy === summary.type
                        ? "text-[#2563EB]"
                        : "text-white"
                    )}>
                      {summary.startingPrice > 0 ? formatPrice(summary.startingPrice) : "מתעדכן"}
                    </div>

                    {/* Price Range Bar */}
                    {summary.startingPrice > 0 && summary.maxPrice > summary.startingPrice && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              filterBy === summary.type
                                ? "bg-gradient-to-r from-[#2563EB] to-[#F5E6B8]"
                                : "bg-white/30"
                            )}
                            style={{
                              width: `${Math.min(100, (summary.startingPrice / summary.maxPrice) * 100)}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-white/40">
                            {formatPrice(summary.startingPrice)}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {formatPrice(summary.maxPrice)}
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
                  {filterBy === summary.type && (
                    <div className="absolute top-3 left-3">
                      <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters and Sort - Glassmorphism Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="p-4 md:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Filter Buttons */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Filter className="h-4 w-4" />
                  <span>סינון לפי סוג:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableFilters.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterBy(option.value)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                        filterBy === option.value
                          ? "bg-gradient-to-r from-[#2563EB] to-[#C9A227] text-black shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                          : "bg-white/5 text-white/70 border border-white/10 hover:border-[#2563EB]/30 hover:text-white"
                      )}
                    >
                      {option.label}
                      <span className={cn(
                        "mr-2 text-xs",
                        filterBy === option.value ? "text-black/60" : "text-white/40"
                      )}>
                        ({option.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Dropdown */}
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
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300",
                        sortBy === option.value
                          ? "bg-white/10 text-white border border-white/20"
                          : "text-white/50 hover:text-white/80"
                      )}
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
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#2563EB]/20 to-[#2563EB]/10 border border-[#2563EB]/30 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <GitCompare className="h-5 w-5 text-[#2563EB]" />
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
                    className="bg-gradient-to-r from-[#2563EB] to-[#C9A227] text-black hover:from-[#E5C547] hover:to-[#2563EB]"
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
            <motion.div
              key={filterBy + sortBy}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {sortedUnits.map((unit, index) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <div className="relative">
                    {/* Comparison Checkbox */}
                    <div className="absolute top-4 left-4 z-20">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-xl transition-all duration-200",
                          compareUnits.has(unit.id)
                            ? "bg-[#2563EB]/20 border border-[#2563EB]/50"
                            : "bg-black/30 border border-white/10 hover:border-[#2563EB]/30"
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
                          className="border-white/30 data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
                        />
                        <span className={cn(
                          "text-xs font-medium",
                          compareUnits.has(unit.id) ? "text-[#2563EB]" : "text-white/70"
                        )}>
                          השווה
                        </span>
                      </motion.div>
                    </div>

                    <UnitCard
                      unit={unit}
                      index={index}
                      onInterestClick={onUnitInterest}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
                {filterBy !== "all"
                  ? `אין יחידות זמינות בקטגוריית ${availableFilters.find(f => f.value === filterBy)?.label}. נסה לבחור קטגוריה אחרת.`
                  : "אין יחידות זמינות כרגע."}
              </p>
              {filterBy !== "all" && (
                <Button
                  onClick={() => setFilterBy("all")}
                  className="bg-gradient-to-r from-[#2563EB] to-[#C9A227] text-black hover:from-[#E5C547] hover:to-[#2563EB] border-0"
                >
                  <Sparkles className="h-4 w-4 ml-2" />
                  הצג את כל היחידות
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Bottom Info */}
        {sortedUnits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-white/40">
              * המחירים הינם להמחשה בלבד ועשויים להשתנות. יש לאמת מול היזם.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default PropertyUnitsShowcase;
