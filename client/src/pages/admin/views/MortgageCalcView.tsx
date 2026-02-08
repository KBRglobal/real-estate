import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calculator, Percent, DollarSign, Calendar, TrendingUp, Home, PiggyBank, CreditCard } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const MAX_BETA_VIEWS = 3;
const BETA_KEY = "ddl-mortgage-calc-beta-views";

export function MortgageCalcView() {
  const { language } = useLanguage();
  const isRTL = language === "he";

  const [betaViews] = useState(() => {
    try {
      const stored = localStorage.getItem(BETA_KEY);
      const currentViews = stored ? parseInt(stored, 10) : 0;
      if (currentViews < MAX_BETA_VIEWS) {
        const newViews = currentViews + 1;
        localStorage.setItem(BETA_KEY, String(newViews));
        window.dispatchEvent(new CustomEvent("ddl-beta-view-updated"));
        return newViews;
      }
      return currentViews;
    } catch {
      return 0;
    }
  });

  const isDemoLocked = betaViews > MAX_BETA_VIEWS;

  const [propertyPrice, setPropertyPrice] = useState(2500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState([20]);
  const [interestRate, setInterestRate] = useState([4.5]);
  const [loanTermYears, setLoanTermYears] = useState("25");
  const [currency, setCurrency] = useState("AED");

  const calculations = useMemo(() => {
    const downPayment = (propertyPrice * downPaymentPercent[0]) / 100;
    const loanAmount = propertyPrice - downPayment;
    const monthlyRate = interestRate[0] / 100 / 12;
    const numPayments = parseInt(loanTermYears) * 12;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;
    
    return {
      downPayment,
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
    };
  }, [propertyPrice, downPaymentPercent, interestRate, loanTermYears]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? "he-IL" : "en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  if (isDemoLocked) {
    return (
      <div className="space-y-6">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm z-10 flex items-center justify-center">
            <Card className="max-w-md mx-4 bg-white/95 backdrop-blur shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isRTL ? "הדמו הסתיים" : "Demo Completed"}
                </h3>
                <p className="text-slate-600 mb-4">
                  {isRTL 
                    ? "צפית ב-3 הדגמות של מחשבון משכנתא. שדרג לגרסה המלאה לגישה בלתי מוגבלת."
                    : "You've viewed 3 demos of Mortgage Calculator. Upgrade for unlimited access."}
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {isRTL ? "שדרג עכשיו" : "Upgrade Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="opacity-30 pointer-events-none p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[1,2,3,4].map(i => (
                <Card key={i} className="bg-slate-100 h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
            BETA
          </Badge>
          <span className="text-sm text-slate-500">
            {isRTL ? `צפייה ${betaViews}/${MAX_BETA_VIEWS}` : `View ${betaViews}/${MAX_BETA_VIEWS}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-500" />
                {isRTL ? "מחשבון משכנתא" : "Mortgage Calculator"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-slate-500" />
                    {isRTL ? "מחיר הנכס" : "Property Price"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={propertyPrice}
                      onChange={(e) => setPropertyPrice(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="ILS">ILS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    {isRTL ? "תקופת ההלוואה" : "Loan Term"}
                  </Label>
                  <Select value={loanTermYears} onValueChange={setLoanTermYears}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">{isRTL ? "10 שנים" : "10 Years"}</SelectItem>
                      <SelectItem value="15">{isRTL ? "15 שנים" : "15 Years"}</SelectItem>
                      <SelectItem value="20">{isRTL ? "20 שנים" : "20 Years"}</SelectItem>
                      <SelectItem value="25">{isRTL ? "25 שנים" : "25 Years"}</SelectItem>
                      <SelectItem value="30">{isRTL ? "30 שנים" : "30 Years"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-slate-500" />
                      {isRTL ? "מקדמה" : "Down Payment"}
                    </Label>
                    <span className="text-lg font-bold text-blue-600">{downPaymentPercent[0]}%</span>
                  </div>
                  <Slider
                    value={downPaymentPercent}
                    onValueChange={setDownPaymentPercent}
                    min={5}
                    max={50}
                    step={5}
                    className="py-2"
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>5%</span>
                    <span className="font-medium text-slate-900">{formatCurrency(calculations.downPayment)}</span>
                    <span>50%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-slate-500" />
                      {isRTL ? "ריבית שנתית" : "Interest Rate"}
                    </Label>
                    <span className="text-lg font-bold text-purple-600">{interestRate[0]}%</span>
                  </div>
                  <Slider
                    value={interestRate}
                    onValueChange={setInterestRate}
                    min={2}
                    max={10}
                    step={0.25}
                    className="py-2"
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>2%</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-blue-100">
                  <CreditCard className="h-5 w-5" />
                  <span>{isRTL ? "תשלום חודשי" : "Monthly Payment"}</span>
                </div>
                <p className="text-4xl font-bold">{formatCurrency(calculations.monthlyPayment)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isRTL ? "פירוט ההלוואה" : "Loan Breakdown"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">{isRTL ? "מחיר הנכס" : "Property Price"}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(propertyPrice)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">{isRTL ? "מקדמה" : "Down Payment"}</span>
                <span className="font-semibold text-green-600">-{formatCurrency(calculations.downPayment)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">{isRTL ? "סכום ההלוואה" : "Loan Amount"}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(calculations.loanAmount)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">{isRTL ? "סה\"כ ריבית" : "Total Interest"}</span>
                <span className="font-semibold text-red-600">{formatCurrency(calculations.totalInterest)}</span>
              </div>
              <div className="flex items-center justify-between py-2 bg-slate-50 rounded-lg px-3">
                <span className="font-medium text-slate-900">{isRTL ? "סה\"כ לתשלום" : "Total Payment"}</span>
                <span className="font-bold text-lg text-slate-900">{formatCurrency(calculations.totalPayment)}</span>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            {isRTL ? "בקש אישור עקרוני" : "Request Pre-Approval"}
          </Button>
        </div>
      </div>
    </div>
  );
}
