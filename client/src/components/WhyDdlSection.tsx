import { motion } from "framer-motion";
import { MapPin, ListChecks, BadgeCheck, Users, Clock, Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "map-pin": MapPin,
  "list-checks": ListChecks,
  "badge-check": BadgeCheck,
  "users": Users,
  "clock": Clock,
  "shield": Shield,
};

// Varied gradients for each card
const cardGradients = [
  "from-amber-500/10 via-transparent to-transparent",
  "from-blue-500/10 via-transparent to-transparent",
  "from-emerald-500/10 via-transparent to-transparent",
  "from-purple-500/10 via-transparent to-transparent",
  "from-rose-500/10 via-transparent to-transparent",
  "from-cyan-500/10 via-transparent to-transparent",
];

export function WhyDdlSection() {
  const { t } = useLanguage();

  const reasons = [
    { titleKey: "whyddl.reason1.title", descKey: "whyddl.reason1.desc", icon: "map-pin" },
    { titleKey: "whyddl.reason2.title", descKey: "whyddl.reason2.desc", icon: "list-checks" },
    { titleKey: "whyddl.reason3.title", descKey: "whyddl.reason3.desc", icon: "badge-check" },
    { titleKey: "whyddl.reason4.title", descKey: "whyddl.reason4.desc", icon: "users" },
    { titleKey: "whyddl.reason5.title", descKey: "whyddl.reason5.desc", icon: "clock" },
    { titleKey: "whyddl.reason6.title", descKey: "whyddl.reason6.desc", icon: "shield" },
  ];

  return (
    <section
      id="why-ddl"
      className="py-20 md:py-32 bg-muted/50"
      data-testid="section-why-ddl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary rounded-full" />
            {t("whyddl.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("whyddl.heading")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("whyddl.subheading")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reasons.map((reason, index) => {
            const Icon = iconMap[reason.icon] || MapPin;
            const gradient = cardGradients[index] || cardGradients[0];
            const displayNumber = String(index + 1).padStart(2, '0');

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
              >
                <div className={`glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 h-full hover-elevate premium-card group relative bg-gradient-to-br ${gradient}`}>
                  {/* Background Number - smaller on mobile */}
                  <div className="absolute bottom-2 right-2 text-[60px] sm:text-[80px] font-black text-white/[0.03] leading-none pointer-events-none select-none">
                    {displayNumber}
                  </div>

                  {/* Icon - inside the card, not floating outside */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 gold-glow group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground pt-1.5 sm:pt-2">
                      {t(reason.titleKey)}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {t(reason.descKey)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <blockquote className="text-xl md:text-2xl font-medium text-foreground italic max-w-3xl mx-auto">
            "{t("whyddl.quote1")}
            <br />
            <span className="gradient-text-gold gold-glow-text">
              {t("whyddl.quote2")}"
            </span>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
