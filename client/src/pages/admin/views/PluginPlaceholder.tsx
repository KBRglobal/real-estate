import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles, Crown, Star, Zap, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

const MAX_BETA_VIEWS = 3;

function getBetaViews(key: string): number {
  try {
    return parseInt(localStorage.getItem(key) || "0", 10);
  } catch {
    return 0;
  }
}

function incrementBetaViews(key: string): number {
  const current = getBetaViews(key);
  const next = current + 1;
  try {
    localStorage.setItem(key, String(next));
    window.dispatchEvent(new CustomEvent("ddl-beta-view-updated"));
  } catch {}
  return next;
}

interface PluginPlaceholderProps {
  betaKey: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: LucideIcon;
  features: string[];
  featuresEn: string[];
  color?: string;
}

export function PluginPlaceholder({
  betaKey,
  title,
  titleEn,
  description,
  descriptionEn,
  icon: Icon,
  features,
  featuresEn,
  color = "from-amber-500 to-yellow-600"
}: PluginPlaceholderProps) {
  const [betaViews, setBetaViews] = useState(() => getBetaViews(betaKey));
  const isBetaHidden = betaViews >= MAX_BETA_VIEWS;
  const [showDemo, setShowDemo] = useState(isBetaHidden);

  const handleShowDemo = () => {
    const newViews = incrementBetaViews(betaKey);
    setBetaViews(newViews);
    setShowDemo(true);
  };

  const remainingViews = Math.max(0, MAX_BETA_VIEWS - betaViews);

  if (!isBetaHidden && !showDemo) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8" dir="rtl">
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className={`bg-gradient-to-br ${color} p-8 text-white text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                >
                  <Icon className="w-10 h-10" />
                </motion.div>
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  <Crown className="w-3 h-3 ml-1" />
                  PRO BETA
                </Badge>
                <h1 className="text-3xl font-bold mb-2">{title}</h1>
                <p className="text-lg opacity-90">{titleEn}</p>
              </div>
            </div>
            
            <div className="p-8 bg-card">
              <p className="text-muted-foreground text-center mb-6 text-lg">
                {description}
              </p>
              <p className="text-muted-foreground/70 text-center mb-8 text-sm">
                {descriptionEn}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="text-center space-y-4">
                <Button
                  size="lg"
                  onClick={handleShowDemo}
                  className={`bg-gradient-to-r ${color} hover:opacity-90 text-white border-0 gap-2`}
                >
                  <Zap className="w-4 h-4" />
                  נסה עכשיו בחינם
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 inline ml-1 text-amber-500" />
                  נותרו {remainingViews} הדגמות חינמיות
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {title}
              <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">
                <Star className="w-3 h-3 ml-1" />
                BETA
              </Badge>
            </h1>
            <p className="text-muted-foreground text-sm">{titleEn}</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0">
          <Lock className="w-3 h-3 ml-1" />
          גרסת הדגמה
        </Badge>
      </div>

      <Card className="p-8 text-center border-dashed border-2">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{title} - גרסת הדגמה</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          {featuresEn.slice(0, 4).map((feature, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-amber-600">--</div>
              <div className="text-xs text-muted-foreground">{feature}</div>
            </div>
          ))}
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-medium">שדרג ל-PRO לגישה מלאה</span>
        </div>
      </Card>
    </div>
  );
}
