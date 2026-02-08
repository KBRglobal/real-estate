import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Users, DollarSign, Clock, Star, AlertCircle, CheckCircle, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  budget: number;
  timeline: string;
  source: string;
  engagement: number;
  score: number;
  status: "hot" | "warm" | "cold";
}

const sampleLeads: Lead[] = [
  { id: "1", name: "יוסי כהן", email: "yossi@example.com", phone: "+972521234567", budget: 5000000, timeline: "immediate", source: "website", engagement: 85, score: 92, status: "hot" },
  { id: "2", name: "מיכל לוי", email: "michal@example.com", phone: "+972509876543", budget: 3000000, timeline: "3_months", source: "referral", engagement: 70, score: 78, status: "warm" },
  { id: "3", name: "דוד אברהם", email: "david@example.com", phone: "+972548765432", budget: 2000000, timeline: "6_months", source: "social", engagement: 45, score: 55, status: "warm" },
  { id: "4", name: "שרה ישראלי", email: "sara@example.com", phone: "+972533456789", budget: 1500000, timeline: "12_months", source: "event", engagement: 30, score: 35, status: "cold" },
  { id: "5", name: "אבי גולן", email: "avi@example.com", phone: "+972526543210", budget: 8000000, timeline: "immediate", source: "referral", engagement: 95, score: 98, status: "hot" },
];

const MAX_BETA_VIEWS = 3;
const BETA_KEY = "ddl-lead-scoring-beta-views";

export function LeadScoringView() {
  const { t, language } = useLanguage();
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
  
  const [leads] = useState<Lead[]>(sampleLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [budgetWeight, setBudgetWeight] = useState([30]);
  const [timelineWeight, setTimelineWeight] = useState([25]);
  const [engagementWeight, setEngagementWeight] = useState([25]);
  const [sourceWeight, setSourceWeight] = useState([20]);

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "hot": return "bg-red-500";
      case "warm": return "bg-amber-500";
      case "cold": return "bg-blue-500";
    }
  };

  const getStatusLabel = (status: Lead["status"]) => {
    switch (status) {
      case "hot": return isRTL ? "חם" : "Hot";
      case "warm": return isRTL ? "חמים" : "Warm";
      case "cold": return isRTL ? "קר" : "Cold";
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat(isRTL ? "he-IL" : "en-US", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const hotLeads = leads.filter(l => l.status === "hot").length;
  const warmLeads = leads.filter(l => l.status === "warm").length;
  const coldLeads = leads.filter(l => l.status === "cold").length;
  const avgScore = Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length);


  if (isDemoLocked) {
    return (
      <div className="space-y-6">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm z-10 flex items-center justify-center">
            <Card className="max-w-md mx-4 bg-white/95 backdrop-blur shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isRTL ? "הדמו הסתיים" : "Demo Completed"}
                </h3>
                <p className="text-slate-600 mb-4">
                  {isRTL 
                    ? "צפית ב-3 הדגמות של Lead Scoring. שדרג לגרסה המלאה לגישה בלתי מוגבלת."
                    : "You've viewed 3 demos of Lead Scoring. Upgrade for unlimited access."}
                </p>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">{isRTL ? "לידים חמים" : "Hot Leads"}</p>
                  <p className="text-3xl font-bold">{hotLeads}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100">{isRTL ? "לידים חמימים" : "Warm Leads"}</p>
                  <p className="text-3xl font-bold">{warmLeads}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">{isRTL ? "לידים קרים" : "Cold Leads"}</p>
                  <p className="text-3xl font-bold">{coldLeads}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">{isRTL ? "ציון ממוצע" : "Avg Score"}</p>
                  <p className="text-3xl font-bold">{avgScore}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                {isRTL ? "רשימת לידים" : "Lead List"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedLead?.id === lead.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-200 hover:border-orange-300 hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.status)}`} />
                        <div>
                          <p className="font-semibold text-slate-900">{lead.name}</p>
                          <p className="text-sm text-slate-500">{lead.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-slate-500">{isRTL ? "תקציב" : "Budget"}</p>
                          <p className="font-semibold text-slate-900">{formatBudget(lead.budget)}</p>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <div className={`text-2xl font-bold ${
                            lead.score >= 80 ? "text-green-600" : 
                            lead.score >= 50 ? "text-amber-600" : "text-red-600"
                          }`}>
                            {lead.score}
                          </div>
                          <Badge className={`${getStatusColor(lead.status)} text-white text-xs`}>
                            {getStatusLabel(lead.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{isRTL ? "מעורבות" : "Engagement"}</span>
                        <span>{lead.engagement}%</span>
                      </div>
                      <Progress value={lead.engagement} className="h-2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                {isRTL ? "משקלות ניקוד" : "Scoring Weights"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{isRTL ? "תקציב" : "Budget"}</Label>
                  <span className="text-sm font-medium text-slate-900">{budgetWeight[0]}%</span>
                </div>
                <Slider value={budgetWeight} onValueChange={setBudgetWeight} max={100} step={5} className="py-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{isRTL ? "לוח זמנים" : "Timeline"}</Label>
                  <span className="text-sm font-medium text-slate-900">{timelineWeight[0]}%</span>
                </div>
                <Slider value={timelineWeight} onValueChange={setTimelineWeight} max={100} step={5} className="py-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{isRTL ? "מעורבות" : "Engagement"}</Label>
                  <span className="text-sm font-medium text-slate-900">{engagementWeight[0]}%</span>
                </div>
                <Slider value={engagementWeight} onValueChange={setEngagementWeight} max={100} step={5} className="py-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{isRTL ? "מקור" : "Source"}</Label>
                  <span className="text-sm font-medium text-slate-900">{sourceWeight[0]}%</span>
                </div>
                <Slider value={sourceWeight} onValueChange={setSourceWeight} max={100} step={5} className="py-2" />
              </div>

              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                {isRTL ? "חשב מחדש ציונים" : "Recalculate Scores"}
              </Button>
            </CardContent>
          </Card>

          {selectedLead && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                    {selectedLead.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">{selectedLead.phone}</span>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      {isRTL ? "שלח אימייל" : "Send Email"}
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Phone className="h-4 w-4 mr-2" />
                      {isRTL ? "התקשר" : "Call Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
