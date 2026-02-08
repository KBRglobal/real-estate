import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, MapPin, Calendar, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { caseStudies as defaultCaseStudies } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import type { CaseStudy } from "@shared/schema";

// Convert API case study to display format
interface DisplayCaseStudy {
  id: string;
  investmentAmount: number;
  currentValue: number;
  roiPercent: number;
  investmentYear: string;
  exitYear: string;
  location: string;
  locationEn: string;
  type: string;
  typeEn: string;
  testimonial: string;
  testimonialEn: string;
}

function convertApiToDisplay(study: CaseStudy): DisplayCaseStudy {
  return {
    id: study.id,
    investmentAmount: study.investmentAmount,
    currentValue: study.currentValue,
    roiPercent: study.roiPercent,
    investmentYear: study.investmentYear,
    exitYear: study.exitYear,
    location: study.location,
    locationEn: study.locationEn,
    type: study.propertyType,
    typeEn: study.propertyTypeEn,
    testimonial: study.testimonial,
    testimonialEn: study.testimonialEn,
  };
}

export function CaseStudies() {
  const { t, isRTL, language } = useLanguage();

  // Fetch dynamic case studies from API
  const { data: apiStudies, isError } = useQuery<CaseStudy[]>({
    queryKey: ["case-studies"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/case-studies");
        if (!res.ok) return [];
        return res.json();
      } catch (error) {
        // Network error or other fetch failure - return empty array for graceful degradation
        console.error("Failed to fetch case studies:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once to avoid blocking the page
  });

  // Use API data if available, otherwise use defaults
  const caseStudies = useMemo(() => {
    if (apiStudies && apiStudies.length > 0) {
      return apiStudies
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(convertApiToDisplay);
    }
    return defaultCaseStudies;
  }, [apiStudies]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isRTL ? "he-IL" : "en-US").format(value);
  };

  const getStudyField = (study: DisplayCaseStudy | typeof defaultCaseStudies[0], field: "location" | "type" | "testimonial") => {
    if (language === "en") {
      const enField = `${field}En` as keyof typeof study;
      return (study[enField] as string) || study[field as keyof typeof study];
    }
    return study[field as keyof typeof study] as string;
  };

  return (
    <section
      id="case-studies"
      className="py-20 md:py-32 bg-muted/50"
      data-testid="section-case-studies"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="h-4 w-4" />
            {t("cases.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("cases.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("cases.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card className="p-6 h-full hover-elevate" data-testid={`card-case-study-${study.id}`}>
                <div className="flex items-center justify-between mb-6">
                  <Badge className="bg-green-900/30 text-green-400 text-lg px-3 py-1">
                    +{study.roiPercent}% ROI
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {getStudyField(study, "location")}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">{t("cases.initial")}</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(study.investmentAmount)} AED
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-0.5 h-6 bg-primary" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="text-sm text-muted-foreground">{t("cases.current")}</span>
                    <span className="font-bold text-primary text-lg">
                      {formatCurrency(study.currentValue)} AED
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t("cases.invested")}{study.investmentYear} | {study.exitYear === "2024" ? t("cases.yielding") : `${t("cases.sold")}${study.exitYear}`}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <span>{getStudyField(study, "type")}</span>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Quote className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      "{getStudyField(study, "testimonial")}"
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {t("cases.disclaimer")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
