import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, TrendingUp, TrendingDown, Building2, MapPin, DollarSign, Percent, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const MAX_BETA_VIEWS = 3;
const BETA_KEY = "ddl-market-analytics-beta-views";

const priceData = [
  { month: "Jan", price: 1850, volume: 450 },
  { month: "Feb", price: 1920, volume: 520 },
  { month: "Mar", price: 2050, volume: 680 },
  { month: "Apr", price: 2100, volume: 720 },
  { month: "May", price: 2180, volume: 650 },
  { month: "Jun", price: 2250, volume: 780 },
  { month: "Jul", price: 2320, volume: 850 },
  { month: "Aug", price: 2400, volume: 920 },
  { month: "Sep", price: 2480, volume: 880 },
  { month: "Oct", price: 2550, volume: 950 },
  { month: "Nov", price: 2620, volume: 1020 },
  { month: "Dec", price: 2700, volume: 1100 },
];

const areaData = [
  { name: "Downtown Dubai", avgPrice: 2800, growth: 12.5, demand: "High" },
  { name: "Palm Jumeirah", avgPrice: 3200, growth: 15.2, demand: "Very High" },
  { name: "Dubai Marina", avgPrice: 2500, growth: 8.3, demand: "High" },
  { name: "Business Bay", avgPrice: 2200, growth: 10.1, demand: "Medium" },
  { name: "JVC", avgPrice: 1400, growth: 18.7, demand: "Very High" },
  { name: "Dubai Hills", avgPrice: 2100, growth: 14.2, demand: "High" },
];

export function MarketAnalyticsView() {
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

  const [timeframe, setTimeframe] = useState("12m");
  const [propertyType, setPropertyType] = useState("all");


  if (isDemoLocked) {
    return (
      <div className="space-y-6">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm z-10 flex items-center justify-center">
            <Card className="max-w-md mx-4 bg-white/95 backdrop-blur shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                  <LineChart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isRTL ? "הדמו הסתיים" : "Demo Completed"}
                </h3>
                <p className="text-slate-600 mb-4">
                  {isRTL 
                    ? "צפית ב-3 הדגמות של ניתוח שוק. שדרג לגרסה המלאה לגישה בלתי מוגבלת."
                    : "You've viewed 3 demos of Market Analytics. Upgrade for unlimited access."}
                </p>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  {isRTL ? "שדרג עכשיו" : "Upgrade Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="opacity-30 pointer-events-none p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => (
                <Card key={i} className="bg-slate-100 h-24" />
              ))}
            </div>
            <Card className="h-96 bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
            BETA
          </Badge>
          <span className="text-sm text-slate-500">
            {isRTL ? `צפייה ${betaViews}/${MAX_BETA_VIEWS}` : `View ${betaViews}/${MAX_BETA_VIEWS}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">{isRTL ? "3 חודשים" : "3 Months"}</SelectItem>
              <SelectItem value="6m">{isRTL ? "6 חודשים" : "6 Months"}</SelectItem>
              <SelectItem value="12m">{isRTL ? "12 חודשים" : "12 Months"}</SelectItem>
              <SelectItem value="24m">{isRTL ? "24 חודשים" : "24 Months"}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "הכל" : "All Types"}</SelectItem>
              <SelectItem value="apartment">{isRTL ? "דירות" : "Apartments"}</SelectItem>
              <SelectItem value="villa">{isRTL ? "וילות" : "Villas"}</SelectItem>
              <SelectItem value="townhouse">{isRTL ? "טאון-האוס" : "Townhouses"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{isRTL ? "מחיר ממוצע למ\"ר" : "Avg Price/sqft"}</p>
                  <p className="text-2xl font-bold text-slate-900">AED 2,700</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ArrowUp className="h-3 w-3" />
                    <span>+12.5%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{isRTL ? "עסקאות החודש" : "Monthly Transactions"}</p>
                  <p className="text-2xl font-bold text-slate-900">1,100</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ArrowUp className="h-3 w-3" />
                    <span>+8.2%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{isRTL ? "תשואה שנתית" : "Annual ROI"}</p>
                  <p className="text-2xl font-bold text-slate-900">7.8%</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ArrowUp className="h-3 w-3" />
                    <span>+0.5%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{isRTL ? "פרויקטים חדשים" : "New Projects"}</p>
                  <p className="text-2xl font-bold text-slate-900">45</p>
                  <div className="flex items-center gap-1 text-amber-600 text-sm">
                    <ArrowDown className="h-3 w-3" />
                    <span>-3.2%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              {isRTL ? "מגמת מחירים" : "Price Trend"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px" }}
                    formatter={(value) => [`AED ${value}`, isRTL ? "מחיר" : "Price"]}
                  />
                  <Area type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              {isRTL ? "נפח עסקאות" : "Transaction Volume"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px" }}
                    formatter={(value) => [value, isRTL ? "עסקאות" : "Transactions"]}
                  />
                  <Bar dataKey="volume" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-500" />
            {isRTL ? "ניתוח לפי אזור" : "Area Analysis"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areaData.map((area, idx) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{area.name}</h4>
                  <Badge className={
                    area.demand === "Very High" ? "bg-red-100 text-red-700" :
                    area.demand === "High" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }>
                    {area.demand}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{isRTL ? "מחיר ממוצע" : "Avg Price"}</span>
                  <span className="font-medium text-slate-900">AED {area.avgPrice}/sqft</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-slate-500">{isRTL ? "צמיחה" : "Growth"}</span>
                  <span className="font-medium text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{area.growth}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
