import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import type { SiteStat } from "@shared/schema";

// Default fallback data
const defaultStatsData = [
  { key: "projects", labelKey: "stats.projects", value: 50, suffix: "+", color: "from-amber-500/20 border-amber-500/30" },
  { key: "investors", labelKey: "stats.investors", value: 200, suffix: "+", color: "from-blue-500/20 border-blue-500/30" },
  { key: "yield", labelKey: "stats.yield", value: 8, suffix: "%", color: "from-emerald-500/20 border-emerald-500/30" },
  { key: "experience", labelKey: "stats.experience", value: 5, suffix: "+", color: "from-purple-500/20 border-purple-500/30" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 1200; // Faster counter animation
    const steps = 50;
    const stepDuration = duration / steps;
    const increment = value / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const { t, language } = useLanguage();

  // Fetch dynamic stats from API
  const { data: apiStats } = useQuery<SiteStat[]>({
    queryKey: ["site-stats"],
    queryFn: async () => {
      const res = await fetch("/api/site-stats");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use API data if available, otherwise use defaults
  const statsData = apiStats && apiStats.length > 0
    ? apiStats
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((stat) => ({
          key: stat.key,
          labelKey: `stats.${stat.key}`,
          labelHe: stat.labelHe,
          labelEn: stat.labelEn,
          value: stat.value,
          suffix: stat.suffix,
          color: stat.color || "from-blue-500/20 border-blue-500/30",
        }))
    : defaultStatsData;

  return (
    <section
      className="py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden"
      data-testid="section-stats"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] decorative-orb orb-gold opacity-15" />
      
      <div className="absolute top-0 left-0 right-0 section-divider" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
            {t("stats.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("stats.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.3,
                delay: index * 0.08,
                type: "spring",
                stiffness: 100,
              }}
              className="text-center"
            >
              <div className={`bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-card-border relative group hover-elevate bg-gradient-to-br ${stat.color} to-transparent`}>

                {/* Background Number - smaller on mobile */}
                <div className="absolute bottom-1 right-1 text-[40px] sm:text-[60px] font-black text-white/[0.03] leading-none pointer-events-none select-none">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl" />

                <div className="absolute top-0 right-0 w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full opacity-50" />

                <div className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-1 sm:mb-2 relative z-10">
                  <span className="gradient-text-gold">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium relative z-10 group-hover:text-foreground transition-colors duration-200">
                  {/* Use dynamic labels if available, otherwise use translation key */}
                  {(stat as any).labelHe
                    ? (language === "en" ? (stat as any).labelEn : (stat as any).labelHe)
                    : t(stat.labelKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
}
