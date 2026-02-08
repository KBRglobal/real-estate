import { motion } from "framer-motion";
import { Phone, Target, Search, FileSignature, Handshake, CheckCircle, BarChart3, Video, Shield, Building2, Key } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { investmentSteps } from "@/lib/data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  target: Target,
  search: Search,
  chart: BarChart3,
  video: Video,
  shield: Shield,
  "file-signature": FileSignature,
  handshake: Handshake,
  building: Building2,
  key: Key,
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Step color variants for visual differentiation
const stepColors = [
  "from-amber-500/20 border-l-amber-500",
  "from-blue-500/20 border-l-blue-500",
  "from-emerald-500/20 border-l-emerald-500",
  "from-purple-500/20 border-l-purple-500",
  "from-rose-500/20 border-l-rose-500",
  "from-cyan-500/20 border-l-cyan-500",
  "from-indigo-500/20 border-l-indigo-500",
  "from-orange-500/20 border-l-orange-500",
  "from-teal-500/20 border-l-teal-500",
  "from-pink-500/20 border-l-pink-500",
];

export function ProcessTimeline() {
  const { t, isRTL, language } = useLanguage();

  const translatedSteps = investmentSteps.map((step) => ({
    ...step,
    title: language === "en" ? step.titleEn || step.title : step.title,
    description: language === "en" ? step.descriptionEn || step.description : step.description,
  }));

  return (
    <section
      id="process"
      className="py-20 md:py-32 bg-background"
      data-testid="section-process"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full" />
            {t("process.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("process.heading")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("process.subheading")}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {translatedSteps.map((step, index) => {
            const Icon = iconMap[step.icon] || Phone;
            const colorClass = stepColors[index % stepColors.length];
            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="group"
              >
                <div className={`glass-card rounded-xl p-3 sm:p-4 h-full flex flex-col items-center text-center transition-all duration-300 group-hover:border-primary/50 border-l-2 sm:border-l-4 bg-gradient-to-br ${colorClass} to-transparent relative`}>
                  {/* Background step number - smaller on mobile */}
                  <div className="absolute bottom-1 right-1 text-[40px] sm:text-[60px] font-black text-white/[0.03] leading-none pointer-events-none select-none">
                    {step.number}
                  </div>

                  {/* Step number badge - top right corner */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
                    {step.number}
                  </div>

                  {/* Icon container */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/30 to-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:from-primary/40 group-hover:to-primary/20 transition-all duration-300">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1 sm:mb-2 leading-tight line-clamp-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {step.description}
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
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 glass-card rounded-full px-6 py-3 gold-border-animated">
            <CheckCircle className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            <span className="text-foreground font-medium">
              {t("process.bottom")}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
