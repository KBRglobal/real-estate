import { motion } from "framer-motion";
import { Percent, Key, Shield, TrendingUp, Calendar, Globe, Landmark, Wallet, BarChart3, Plane } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { whyDubaiReasons } from "@/lib/data";
import dubaiSkyline from "@assets/stock_images/luxury_dubai_skyscra_a7d0c185.jpg";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  percent: Percent,
  key: Key,
  shield: Shield,
  "trending-up": TrendingUp,
  calendar: Calendar,
  passport: Plane,
  globe: Globe,
  landmark: Landmark,
  wallet: Wallet,
  chart: BarChart3,
};

// Category color coding based on icon type
const categoryColors: Record<string, { gradient: string; border: string }> = {
  percent: { gradient: "from-emerald-500/20", border: "border-l-emerald-500" },
  key: { gradient: "from-blue-500/20", border: "border-l-blue-500" },
  shield: { gradient: "from-violet-500/20", border: "border-l-violet-500" },
  "trending-up": { gradient: "from-amber-500/20", border: "border-l-amber-500" },
  calendar: { gradient: "from-cyan-500/20", border: "border-l-cyan-500" },
  passport: { gradient: "from-rose-500/20", border: "border-l-rose-500" },
  globe: { gradient: "from-indigo-500/20", border: "border-l-indigo-500" },
  landmark: { gradient: "from-purple-500/20", border: "border-l-purple-500" },
  wallet: { gradient: "from-teal-500/20", border: "border-l-teal-500" },
  chart: { gradient: "from-orange-500/20", border: "border-l-orange-500" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export function WhyDubaiSection() {
  const { t, isRTL, language } = useLanguage();

  const translatedReasons = whyDubaiReasons.map((reason) => ({
    ...reason,
    title: language === "en" ? reason.titleEn || reason.title : reason.title,
    description: language === "en" ? reason.descriptionEn || reason.description : reason.description,
  }));

  return (
    <section
      id="why-dubai"
      className="py-20 md:py-32 bg-background relative overflow-hidden"
      data-testid="section-why-dubai"
    >
      {/* Background Image with Dark Wash */}
      <div className="absolute inset-0 z-0">
        <img
          src={dubaiSkyline}
          alt=""
          className="w-full h-full object-cover opacity-20"
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20">
            <TrendingUp className="h-4 w-4" />
            <span>{t("whyDubai.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("whyDubai.heading")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("whyDubai.subheading")}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {translatedReasons.map((reason, index) => {
            const Icon = iconMap[reason.icon] || Shield;
            const colors = categoryColors[reason.icon] || { gradient: "from-primary/20", border: "border-l-primary" };

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group"
              >
                <div
                  className={`
                    glass-card rounded-xl h-full hover-elevate premium-card transition-all duration-300
                    flex flex-col items-center text-center p-3 sm:p-4
                    border-l-2 sm:border-l-4 ${colors.border}
                  `}
                >
                  <div
                    className={`
                      bg-gradient-to-br ${colors.gradient} to-transparent
                      rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3
                      group-hover:scale-105 transition-transform
                      w-9 h-9 sm:w-12 sm:h-12
                    `}
                  >
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1 sm:mb-2 leading-tight line-clamp-2">
                    {reason.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-16 glass-premium rounded-2xl p-8 gold-border-animated"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t("whyDubai.bottom.title")}
            </h3>
            <p className="text-lg text-muted-foreground">
              {t("whyDubai.bottom.text")}{" "}
              <span className="text-primary font-semibold">
                {t("whyDubai.bottom.highlight")}
              </span>
              {t("whyDubai.bottom.text2")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
