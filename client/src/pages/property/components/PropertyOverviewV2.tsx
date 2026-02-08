import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Calendar,
  Home,
  BedDouble,
  Bath,
  Car,
  Check,
  Download,
  ChevronDown,
  Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Highlight } from "../types";
import { getIcon } from "../utils";

interface PropertyOverviewV2Props {
  description: string;
  highlights?: Highlight[] | null;
  developer?: string | null;
  developerLogo?: string | null;
  location: string;
  completionDate?: string | null;
  propertyType?: string | null;
  bedrooms?: string | null;
  bathrooms?: string | null;
  parking?: string | null;
  brochureUrl?: string | null;
}

export const PropertyOverviewV2 = memo(function PropertyOverviewV2({
  description,
  highlights,
  developer,
  developerLogo,
  location,
  completionDate,
  propertyType,
  bedrooms,
  bathrooms,
  parking,
  brochureUrl,
}: PropertyOverviewV2Props) {
  const paragraphs = description.split("\n").filter((p) => p.trim());
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if description is long (more than 300 characters or 3 paragraphs)
  const isLongDescription = description.length > 300 || paragraphs.length > 3;
  const shouldTruncate = isLongDescription && !isExpanded;

  const keyFacts = [
    { icon: Building2, label: "יזם", value: developer || "יזם מוביל" },
    { icon: Ruler, label: "שטח", value: "תכנון מושלם" },
    { icon: Calendar, label: "מסירה", value: completionDate || "בקרוב" },
    { icon: Home, label: "סוג", value: propertyType || "יוקרתי" },
  ];

  const quickFacts = [
    { icon: MapPin, label: "מיקום", value: location },
    developer && { icon: Building2, label: "יזם", value: developer },
    completionDate && { icon: Calendar, label: "מסירה", value: completionDate },
    propertyType && { icon: Home, label: "סוג נכס", value: propertyType },
  ].filter(Boolean) as Array<{
    icon: React.ElementType;
    label: string;
    value: string;
  }>;

  const specs = [
    bedrooms && { icon: BedDouble, value: bedrooms, label: "חדרים" },
    bathrooms && { icon: Bath, value: bathrooms, label: "אמבטיות" },
    parking && { icon: Car, value: parking, label: "חניות" },
  ].filter(Boolean) as Array<{
    icon: React.ElementType;
    value: string;
    label: string;
  }>;

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    אודות הפרויקט
                  </h2>
                  <p className="text-white/60">הזדמנות השקעה ייחודית</p>
                </div>
              </div>

              {/* Key Facts Grid */}
              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4 mb-8">
                {keyFacts.map((fact, idx) => {
                  const Icon = fact.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card p-5 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="text-xs text-white/50 uppercase tracking-wide">
                          {fact.label}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white break-words">
                        {fact.value}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Description Card */}
              <div className="glass-card p-4 sm:p-6 md:p-8 rounded-2xl mb-8">
                <div className="prose prose-lg prose-invert max-w-none">
                  <AnimatePresence mode="wait">
                    {(shouldTruncate ? paragraphs.slice(0, 2) : paragraphs).map((paragraph, idx) => (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className={`mb-5 last:mb-0 leading-relaxed ${
                          idx === 0
                            ? "text-xl text-white/90 font-medium border-r-4 border-amber-400 pr-5"
                            : "text-base text-white/70"
                        }`}
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Read More Button */}
                {isLongDescription && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex justify-center"
                  >
                    <Button
                      onClick={() => setIsExpanded(!isExpanded)}
                      variant="ghost"
                      className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                    >
                      {isExpanded ? "הצג פחות" : "קרא עוד"}
                      <ChevronDown
                        className={`h-4 w-4 mr-2 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </motion.div>
                )}

                {/* Specs Row */}
                {specs.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="flex flex-wrap gap-8">
                      {specs.map((spec, idx) => {
                        const Icon = spec.icon;
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                              <Icon className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-white">
                                {spec.value}
                              </div>
                              <div className="text-sm text-white/60">
                                {spec.label}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Highlight Pills */}
                {highlights && highlights.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {highlights.map((highlight, idx) => {
                      const IconComponent = getIcon(highlight.icon);
                      const colors = [
                        "from-amber-500/20 to-amber-600/5 border-amber-500/30",
                        "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
                        "from-blue-500/20 to-blue-600/5 border-blue-500/30",
                        "from-purple-500/20 to-purple-600/5 border-purple-500/30",
                        "from-rose-500/20 to-rose-600/5 border-rose-500/30",
                        "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30",
                      ];
                      const iconColors = [
                        "text-amber-400",
                        "text-emerald-400",
                        "text-blue-400",
                        "text-purple-400",
                        "text-rose-400",
                        "text-cyan-400",
                      ];
                      const colorClass = colors[idx % colors.length];
                      const iconColor = iconColors[idx % iconColors.length];

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1, type: "spring" }}
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r ${colorClass} border backdrop-blur-sm`}
                        >
                          <IconComponent className={`h-4 w-4 ${iconColor}`} />
                          <span className="text-sm font-semibold text-white">
                            {highlight.value}
                          </span>
                          <span className="text-xs text-white/70">
                            {highlight.title}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Developer Info */}
                {developer && (
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-6 p-5 rounded-2xl bg-white/5">
                      {developerLogo && (
                        <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center p-2">
                          <img
                            src={developerLogo}
                            alt={`לוגו ${developer} - יזם הפרויקט`}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-xs uppercase tracking-widest text-white/50 mb-1">
                          יזם הפרויקט
                        </div>
                        <div className="text-xl font-bold text-white mb-1">
                          {developer}
                        </div>
                        <p className="text-sm text-white/60">
                          יזם מוביל עם ניסיון רב בפיתוח פרויקטים יוקרתיים בדובאי
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium">
                          <Check className="h-3.5 w-3.5" />
                          יזם מאומת
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Quick Facts (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6 rounded-2xl"
              >
                <h3 className="text-lg font-bold text-white mb-6">
                  פרטים מהירים
                </h3>

                <div className="space-y-4">
                  {quickFacts.map((fact, idx) => {
                    const Icon = fact.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-white/50 uppercase tracking-wide">
                            {fact.label}
                          </div>
                          <div className="text-white font-medium">
                            {fact.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Download Brochure Button */}
                {brochureUrl ? (
                  <a
                    href={brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-6"
                  >
                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10">
                      <Download className="h-4 w-4 ml-2" />
                      הורד ברושור
                    </Button>
                  </a>
                ) : (
                  <Button
                    className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    disabled
                  >
                    <Download className="h-4 w-4 ml-2" />
                    הורד ברושור
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default PropertyOverviewV2;
