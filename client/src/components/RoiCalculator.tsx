import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Wallet, Calendar, ArrowLeft, ArrowRight, Sparkles, History, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/lib/i18n";
import { scrollToSection } from "@/lib/utils";

type Currency = "AED" | "USD" | "ILS";

const EXCHANGE_RATES: Record<Currency, number> = {
  AED: 1,
  USD: 0.272, // 1 AED = 0.272 USD
  ILS: 1.0,   // 1 AED ≈ 1 ILS (approximate)
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AED: "AED",
  USD: "$",
  ILS: "₪",
};

export function RoiCalculator() {
  const { t, isRTL } = useLanguage();
  const [budget, setBudget] = useState([1500000]);
  const [expectedRoi, setExpectedRoi] = useState([7]);
  const [timeline, setTimeline] = useState([3]);
  const [currency, setCurrency] = useState<Currency>("AED");

  const calculations = useMemo(() => {
    const initialInvestment = budget[0];
    const years = timeline[0];
    const annualRoiPercent = expectedRoi[0];

    const annualReturn = initialInvestment * (annualRoiPercent / 100);
    const totalReturn = initialInvestment + annualReturn * years;
    const monthlyIncome = annualReturn / 12;
    const profit = totalReturn - initialInvestment;
    const totalRoiPercent = (profit / initialInvestment) * 100;

    return {
      initialInvestment,
      totalReturn,
      profit,
      roiPercent: totalRoiPercent,
      monthlyIncome,
      years,
      annualRoiPercent,
    };
  }, [budget, expectedRoi, timeline]);

  const convertCurrency = (aedValue: number): number => {
    return aedValue * EXCHANGE_RATES[currency];
  };

  const formatCurrency = (value: number, inAED: boolean = false) => {
    const displayValue = inAED ? value : convertCurrency(value);
    return new Intl.NumberFormat(isRTL ? "he-IL" : "en-US", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(displayValue);
  };

  const scrollToContact = () => {
    scrollToSection("contact");
  };

  return (
    <section
      id="calculator"
      className="py-20 md:py-32 bg-muted/50 relative overflow-hidden"
      data-testid="section-calculator"
    >
      <div className="absolute top-0 left-0 w-[600px] h-[600px] decorative-orb orb-gold opacity-20 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] decorative-orb orb-gold opacity-15 translate-x-1/2 translate-y-1/2" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20 overflow-visible hover-elevate">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t("calc.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("calc.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("calc.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <Card className="p-6 md:p-8 glass-card relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
              <div className="space-y-8 relative z-10">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-foreground">
                      <span className="flex items-center gap-1.5">
                        {t("calc.budget")}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
                              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side={isRTL ? "left" : "right"} className="max-w-[200px]">
                            <p className="text-xs">
                              {isRTL
                                ? "הזן את סכום ההשקעה הראשוני שלך. ניתן להשקיע בנדל\"ן בדובאי החל מ-500,000 AED"
                                : "Enter your initial investment amount. Dubai real estate starts from AED 500,000"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="text-xs text-muted-foreground block">{t("calc.budgetNote")}</span>
                    </label>
                    <div className="flex gap-1" role="radiogroup" aria-label={isRTL ? "בחירת מטבע לתצוגה" : "Currency display selection"}>
                      {(["AED", "USD", "ILS"] as Currency[]).map((curr) => (
                        <Button
                          key={curr}
                          size="sm"
                          variant={currency === curr ? "default" : "outline"}
                          onClick={() => setCurrency(curr)}
                          className={`px-3 h-7 text-xs font-medium ${currency === curr ? "" : "hover:bg-muted"}`}
                          data-testid={`button-currency-${curr.toLowerCase()}`}
                          role="radio"
                          aria-checked={currency === curr}
                          aria-label={isRTL ? `הצג מחירים ב-${curr}` : `Display prices in ${curr}`}
                        >
                          {curr}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <Slider
                      value={budget}
                      onValueChange={setBudget}
                      min={500000}
                      max={10000000}
                      step={100000}
                      className="w-full"
                      data-testid="slider-budget"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{isRTL ? "AED 10,000,000" : "AED 500,000"}</span>
                    <motion.span 
                      key={`${budget[0]}-${currency}`}
                      initial={{ scale: 1.2, color: "hsl(43, 74%, 42%)" }}
                      animate={{ scale: 1, color: "hsl(43, 74%, 42%)" }}
                      className="text-xl font-bold"
                    >
                      {CURRENCY_SYMBOLS[currency]} {formatCurrency(budget[0])}
                    </motion.span>
                    <span>{isRTL ? "AED 500,000" : "AED 10,000,000"}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-foreground">
                      <span className="flex items-center gap-1.5">
                        {t("calc.expectedRoi")}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
                              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side={isRTL ? "left" : "right"} className="max-w-[200px]">
                            <p className="text-xs">
                              {isRTL
                                ? "תשואה שנתית צפויה מהשכרת הנכס. באזורים מובחרים בדובאי התשואה נעה בין 5-12%"
                                : "Expected annual rental yield. Premium Dubai areas yield 5-12% annually"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="text-xs text-muted-foreground block">{t("calc.expectedRoiNote")}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        step={0.5}
                        value={expectedRoi[0]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 1 && val <= 20) {
                            setExpectedRoi([val]);
                          }
                        }}
                        className="w-20 h-9 text-center text-lg font-bold text-primary bg-primary/10 border-primary/30"
                        aria-label={isRTL ? "אחוז תשואה צפוי" : "Expected ROI percentage"}
                        data-testid="input-expected-roi"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Slider
                      value={expectedRoi}
                      onValueChange={setExpectedRoi}
                      min={1}
                      max={20}
                      step={0.5}
                      className="w-full"
                      data-testid="slider-expected-roi"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{isRTL ? "20%" : "1%"}</span>
                    <span className="text-primary font-medium">{t("calc.perYear")}</span>
                    <span>{isRTL ? "1%" : "20%"}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      {t("calc.timeline")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
                            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side={isRTL ? "left" : "right"} className="max-w-[200px]">
                          <p className="text-xs">
                            {isRTL
                              ? "תקופת ההחזקה המתוכננת של ההשקעה. תקופות ארוכות יותר מאפשרות צמיחה מצטברת"
                              : "Planned investment holding period. Longer periods allow for compound growth"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </label>
                  <div className="mb-4">
                    <Slider
                      value={timeline}
                      onValueChange={setTimeline}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                      data-testid="slider-timeline"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{isRTL ? `10 ${t("calc.timeline.years")}` : t("calc.timeline.one")}</span>
                    <span className="text-xl font-bold text-primary">
                      {timeline[0]} {t("calc.timeline.years")}
                    </span>
                    <span>{isRTL ? t("calc.timeline.one") : `10 ${t("calc.timeline.years")}`}</span>
                  </div>
                </div>

                {/* Historical Reference Section */}
                <div className="border-t border-primary/20 pt-6 mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <History className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="text-sm font-medium text-foreground">
                      {t("calc.historical.title")}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    {t("calc.historical.intro")}
                  </p>
                  
                  <ul className={`text-xs text-muted-foreground space-y-1.5 mb-4 ${isRTL ? "pr-4" : "pl-4"}`}>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{t("calc.historical.point1")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{t("calc.historical.point2")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{t("calc.historical.point3")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{t("calc.historical.point4")}</span>
                    </li>
                  </ul>
                  
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-muted">
                    <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("calc.historical.disclaimer")}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 md:p-8 glass-card relative overflow-hidden gold-border-animated">
              <motion.div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 relative z-10">
                <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
                {t("calc.forecast")}
              </h3>

              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-xl p-4 overflow-visible hover-elevate">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <Wallet className="h-4 w-4" aria-hidden="true" />
                      {t("calc.investment")}
                    </div>
                    <motion.div 
                      key={`${calculations.initialInvestment}-${currency}`}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-foreground"
                    >
                      {formatCurrency(calculations.initialInvestment)}
                    </motion.div>
                    <div className="text-sm text-muted-foreground">{currency}</div>
                  </div>

                  <div className="glass-card rounded-xl p-4 overflow-visible hover-elevate">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      {t("calc.period")}
                    </div>
                    <motion.div 
                      key={calculations.years}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-foreground"
                    >
                      {calculations.years}
                    </motion.div>
                    <div className="text-sm text-muted-foreground">{t("calc.timeline.years")}</div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6 relative overflow-hidden gold-glow">
                  <div className="absolute inset-0 shimmer opacity-30" />
                  
                  <div className="text-center relative z-10">
                    <p className="text-sm text-muted-foreground mb-2">{t("calc.expected")}</p>
                    <motion.p 
                      key={`${calculations.totalReturn}-${currency}`}
                      initial={{ scale: 1.05, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-4xl md:text-5xl font-bold gradient-text-gold mb-3"
                    >
                      {CURRENCY_SYMBOLS[currency]} {formatCurrency(calculations.totalReturn)}
                    </motion.p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <motion.span 
                        key={`${calculations.profit}-${currency}`}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-lg font-semibold text-green-500"
                      >
                        +{CURRENCY_SYMBOLS[currency]} {formatCurrency(calculations.profit)}
                      </motion.span>
                      <motion.span 
                        key={calculations.roiPercent}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="bg-green-500/20 text-green-500 text-sm px-3 py-1 rounded-full font-semibold"
                      >
                        {calculations.roiPercent.toFixed(1)}% ROI
                      </motion.span>
                    </div>
                  </div>
                </div>

                {calculations.monthlyIncome > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="glass-card rounded-xl p-4 text-center"
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("calc.monthly")}
                    </p>
                    <motion.p 
                      key={`${calculations.monthlyIncome}-${currency}`}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold gradient-text-gold"
                    >
                      {CURRENCY_SYMBOLS[currency]} {formatCurrency(calculations.monthlyIncome)}
                    </motion.p>
                  </motion.div>
                )}

                <Button
                  onClick={scrollToContact}
                  className="luxury-button w-full h-14 text-lg font-semibold"
                  data-testid="button-calculator-cta"
                >
                  <Sparkles className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"}`} aria-hidden="true" />
                  {t("calc.cta")}
                  {isRTL ? (
                    <ArrowLeft className={`h-5 w-5 ${isRTL ? "mr-2" : "ml-2"}`} aria-hidden="true" />
                  ) : (
                    <ArrowRight className={`h-5 w-5 ${isRTL ? "mr-2" : "ml-2"}`} aria-hidden="true" />
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t("calc.disclaimer")}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
