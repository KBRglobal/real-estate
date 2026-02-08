import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Wallet,
  Calculator,
  Building2,
  Percent,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Landmark,
  BadgeCheck,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface UnitType {
  id: string;
  name: string;
  nameEn: string;
  basePrice: number;
  rentalYield: number; // percentage
}

interface PropertyRoiCalculatorProps {
  propertyName?: string;
  propertyNameEn?: string;
  units?: UnitType[];
  defaultYield?: number;
  onContactClick?: () => void;
  className?: string;
}

const DEFAULT_UNITS: UnitType[] = [
  { id: "studio", name: "סטודיו", nameEn: "Studio", basePrice: 750000, rentalYield: 9 },
  { id: "1br", name: "חדר שינה אחד", nameEn: "1 Bedroom", basePrice: 1100000, rentalYield: 8.5 },
  { id: "2br", name: "שני חדרי שינה", nameEn: "2 Bedrooms", basePrice: 1800000, rentalYield: 8 },
];

const BANK_DEPOSIT_RATE = 4.5; // typical bank deposit rate

export function PropertyRoiCalculator({
  propertyName,
  propertyNameEn,
  units = DEFAULT_UNITS,
  defaultYield = 8,
  onContactClick,
  className = "",
}: PropertyRoiCalculatorProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitType>(units[0]);
  const [investmentYears, setInvestmentYears] = useState([5]);
  const [appreciationRate, setAppreciationRate] = useState([5]);
  const [showComparison, setShowComparison] = useState(true);

  const calculations = useMemo(() => {
    const price = selectedUnit.basePrice;
    const yield_ = selectedUnit.rentalYield;
    const years = investmentYears[0];
    const appreciation = appreciationRate[0];

    // Property calculations
    const annualRentalIncome = price * (yield_ / 100);
    const monthlyRentalIncome = annualRentalIncome / 12;
    const totalRentalIncome = annualRentalIncome * years;
    const totalAppreciation = price * (appreciation / 100) * years;
    const totalPropertyValue = price + totalAppreciation;
    const totalReturn = totalRentalIncome + totalAppreciation;
    const totalRoi = (totalReturn / price) * 100;

    // Bank comparison
    const bankAnnualReturn = price * (BANK_DEPOSIT_RATE / 100);
    const bankTotalReturn = bankAnnualReturn * years;
    const bankMonthlyIncome = bankAnnualReturn / 12;

    // Stock market comparison (average 7% per year)
    const stockMarketRate = 7;
    const stockMarketAnnualReturn = price * (stockMarketRate / 100);
    const stockMarketTotalReturn = stockMarketAnnualReturn * years;

    // Differences
    const advantageTotal = totalReturn - bankTotalReturn;
    const advantageMonthly = monthlyRentalIncome - bankMonthlyIncome;
    const advantageVsStock = totalReturn - stockMarketTotalReturn;

    // Break-even calculation (years until investment is recouped through rental income)
    const breakEvenYears = price / annualRentalIncome;

    return {
      price,
      yield: yield_,
      years,
      appreciation,
      annualRentalIncome,
      monthlyRentalIncome,
      totalRentalIncome,
      totalAppreciation,
      totalPropertyValue,
      totalReturn,
      totalRoi,
      bankTotalReturn,
      bankMonthlyIncome,
      stockMarketTotalReturn,
      advantageTotal,
      advantageMonthly,
      advantageVsStock,
      breakEvenYears,
    };
  }, [selectedUnit, investmentYears, appreciationRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      const element = document.querySelector("#property-contact");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Calculator className="h-4 w-4" />
            חשב את התשואה שלך
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            מחשבון תשואה לנכס
          </h2>
          {propertyName && (
            <p className="text-muted-foreground">{propertyName}</p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left side - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 glass-card h-full">
              <div className="space-y-8">
                {/* Unit Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    בחר סוג יחידה
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {units.map((unit) => (
                      <motion.button
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all duration-300 text-right cursor-pointer",
                          selectedUnit.id === unit.id
                            ? "border-primary bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-3 h-3 rounded-full transition-colors",
                                selectedUnit.id === unit.id
                                  ? "bg-primary"
                                  : "bg-white/20"
                              )}
                            />
                            <span className="font-medium text-foreground">
                              {unit.name}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-bold text-primary">
                              AED {formatCurrency(unit.basePrice)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              תשואה: {unit.rentalYield}%
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Investment Period Slider */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <Percent className="h-4 w-4 text-primary" />
                    תקופת השקעה
                  </label>
                  <div className="mb-4 px-2">
                    <Slider
                      value={investmentYears}
                      onValueChange={setInvestmentYears}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>שנה</span>
                    <motion.span
                      key={investmentYears[0]}
                      initial={{ scale: 1.2, color: "#2563EB" }}
                      animate={{ scale: 1, color: "#2563EB" }}
                      transition={{ duration: 0.3 }}
                      className="text-xl font-bold text-primary"
                    >
                      {investmentYears[0]} שנים
                    </motion.span>
                    <span>10 שנים</span>
                  </div>
                </div>

                {/* Appreciation Rate Slider */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    עליית ערך צפויה (שנתית)
                  </label>
                  <div className="mb-4 px-2">
                    <Slider
                      value={appreciationRate}
                      onValueChange={setAppreciationRate}
                      min={0}
                      max={15}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0%</span>
                    <motion.span
                      key={appreciationRate[0]}
                      initial={{ scale: 1.2, color: "#2563EB" }}
                      animate={{ scale: 1, color: "#2563EB" }}
                      transition={{ duration: 0.3 }}
                      className="text-xl font-bold text-primary"
                    >
                      {appreciationRate[0]}%
                    </motion.span>
                    <span>15%</span>
                  </div>
                </div>

                {/* Comparison Mode Toggle */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      הצג השוואה
                    </span>
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        showComparison ? "bg-primary" : "bg-white/20"
                      }`}
                    >
                      <motion.div
                        animate={{ x: showComparison ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                  {showComparison && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Landmark className="h-3.5 w-3.5 text-blue-400" />
                        <span>פיקדון בנקאי: {BANK_DEPOSIT_RATE}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
                        <span>שוק ההון: 7% ממוצע</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right side - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 glass-card gold-border-animated h-full">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                תוצאות הסימולציה
              </h3>

              <div className="space-y-6">
                {/* Summary Cards - Key Outputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Monthly Income Card */}
                  <motion.div
                    key={`monthly-${calculations.monthlyRentalIncome}`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-emerald-400" />
                      <p className="text-xs text-muted-foreground">הכנסה חודשית</p>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={calculations.monthlyRentalIncome}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        className="text-2xl font-bold text-emerald-400"
                      >
                        AED {formatCurrency(calculations.monthlyRentalIncome)}
                      </motion.p>
                    </AnimatePresence>
                  </motion.div>

                  {/* Total Return Card */}
                  <motion.div
                    key={`total-${calculations.totalReturn}`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                      <p className="text-xs text-muted-foreground">תשואה כוללת</p>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={calculations.totalReturn}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        className="text-2xl font-bold text-amber-400"
                      >
                        AED {formatCurrency(calculations.totalReturn)}
                      </motion.p>
                    </AnimatePresence>
                  </motion.div>

                  {/* Break-even Card */}
                  <motion.div
                    key={`breakeven-${calculations.breakEvenYears}`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <p className="text-xs text-muted-foreground">נקודת איזון</p>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={calculations.breakEvenYears}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        className="text-2xl font-bold text-blue-400"
                      >
                        {calculations.breakEvenYears.toFixed(1)} שנים
                      </motion.p>
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground mb-1">מחיר נכס</p>
                    <p className="text-base font-bold text-foreground">
                      AED {formatCurrency(calculations.price)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground mb-1">תשואה שנתית</p>
                    <p className="text-base font-bold text-foreground">
                      {calculations.yield}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground mb-1">עליית ערך ({calculations.years} שנים)</p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={calculations.totalAppreciation}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-base font-bold text-foreground"
                      >
                        AED {formatCurrency(calculations.totalAppreciation)}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground mb-1">הכנסות שכירות</p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={calculations.totalRentalIncome}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-base font-bold text-foreground"
                      >
                        AED {formatCurrency(calculations.totalRentalIncome)}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Comparison Box */}
                {showComparison && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
                  >
                    <p className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-emerald-400" />
                      השוואה להשקעות חלופיות
                    </p>

                    <div className="space-y-3">
                      {/* vs Bank */}
                      <div className="p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Landmark className="h-4 w-4 text-blue-400" />
                          <span className="text-xs text-muted-foreground">פיקדון בנקאי ({BANK_DEPOSIT_RATE}%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">רווח נוסף:</span>
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={calculations.advantageTotal}
                              initial={{ scale: 1.1 }}
                              animate={{ scale: 1 }}
                              className="text-base font-bold text-emerald-400"
                            >
                              +AED {formatCurrency(calculations.advantageTotal)}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* vs Stock Market */}
                      <div className="p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-purple-400" />
                          <span className="text-xs text-muted-foreground">שוק ההון (7%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">רווח נוסף:</span>
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={calculations.advantageVsStock}
                              initial={{ scale: 1.1 }}
                              animate={{ scale: 1 }}
                              className="text-base font-bold text-emerald-400"
                            >
                              +AED {formatCurrency(calculations.advantageVsStock)}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Total Return */}
                <div className="p-5 rounded-xl glass-card gold-glow relative overflow-hidden">
                  <div className="absolute inset-0 shimmer opacity-30" />
                  <div className="relative z-10 text-center">
                    <p className="text-sm text-muted-foreground mb-2">סה"כ תשואה צפויה</p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={calculations.totalReturn}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        className="text-3xl md:text-4xl font-bold gradient-text-gold"
                      >
                        AED {formatCurrency(calculations.totalReturn)}
                      </motion.p>
                    </AnimatePresence>
                    <motion.div
                      key={calculations.totalRoi}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="inline-flex items-center gap-2 mt-3"
                    >
                      <span className="bg-emerald-500/20 text-emerald-400 text-sm px-3 py-1 rounded-full font-semibold">
                        {calculations.totalRoi.toFixed(1)}% ROI
                      </span>
                    </motion.div>
                    <p className="text-xs text-muted-foreground mt-3">
                      כולל הכנסות שכירות + עליית ערך צפויה
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleContactClick}
                  className="luxury-button w-full h-14 text-lg font-semibold group"
                >
                  <Sparkles className="h-5 w-5 ml-2" />
                  רוצה לדבר עם יועץ?
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  *החישוב מבוסס על נתונים היסטוריים ואינו מהווה התחייבות לתשואה עתידית
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PropertyRoiCalculator;
