import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Shield, Wallet, Award, Calendar, Globe, CheckCircle, TrendingUp } from "lucide-react";
import { useRef, useEffect } from "react";

interface InvestmentHighlight {
  icon: React.ElementType;
  label: string;
  value: string;
  numericValue?: number;
  description: string;
  gradient: string;
  iconColor: string;
  comparison?: {
    dubaiAverage: string;
    thisProject: string;
  };
}

// Animated counter component
function AnimatedCounter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest) + suffix;
      }
    });
    return () => unsubscribe();
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

interface InvestmentHighlightsProps {
  paymentPlan?: string;
  developer?: string;
  completionDate?: string;
  roiPercent?: number;
}

export function InvestmentHighlights({
  paymentPlan = "60/40",
  developer,
  completionDate,
  roiPercent,
}: InvestmentHighlightsProps) {
  const roiValue = roiPercent && roiPercent > 0 ? `${roiPercent}%` : "8-10%";
  const roiNumeric = roiPercent && roiPercent > 0 ? roiPercent : 9;

  const highlights: InvestmentHighlight[] = [
    {
      icon: Globe,
      label: "בעלות לזרים",
      value: "100%",
      numericValue: 100,
      description: "בעלות מלאה על הנכס",
      gradient: "from-emerald-500/30 via-emerald-500/10 to-transparent",
      iconColor: "text-emerald-400",
      comparison: {
        dubaiAverage: "100%",
        thisProject: "100%",
      },
    },
    {
      icon: Shield,
      label: "מס על שכירות",
      value: "0%",
      numericValue: 0,
      description: "פטור מלא ממס",
      gradient: "from-blue-500/30 via-blue-500/10 to-transparent",
      iconColor: "text-blue-400",
      comparison: {
        dubaiAverage: "0%",
        thisProject: "0%",
      },
    },
    {
      icon: TrendingUp,
      label: "תשואה צפויה",
      value: roiValue,
      numericValue: roiNumeric,
      description: "תשואה שנתית ממוצעת",
      gradient: "from-[#2563EB]/30 via-[#2563EB]/10 to-transparent",
      iconColor: "text-[#2563EB]",
      comparison: {
        dubaiAverage: "6-7%",
        thisProject: roiValue,
      },
    },
    {
      icon: Award,
      label: "יזם",
      value: developer || "מוביל",
      description: "אמינות מוכחת",
      gradient: "from-purple-500/30 via-purple-500/10 to-transparent",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#2563EB]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#2563EB]/20 via-[#2563EB]/10 to-[#2563EB]/20 border border-[#2563EB]/30 backdrop-blur-sm mb-6"
          >
            <CheckCircle className="h-4 w-4 text-[#2563EB]" />
            <span className="text-sm font-semibold text-[#2563EB]">למה להשקיע בדובאי?</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="text-white">יתרונות </span>
            <span className="bg-gradient-to-r from-[#2563EB] via-[#F5E6B8] to-[#2563EB] bg-clip-text text-transparent">
              ההשקעה
            </span>
          </h2>
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <motion.div
                key={highlight.label}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                {/* Card with Glassmorphism */}
                <div className="relative h-full rounded-2xl overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${highlight.gradient}`} />

                  {/* Glass Effect */}
                  <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl" />

                  {/* Border */}
                  <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors duration-500" />

                  {/* Glow Effect on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${highlight.gradient} blur-xl opacity-50`} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-5 md:p-6 h-full flex flex-col">
                    {/* Icon */}
                    <div className={`
                      w-14 h-14 rounded-xl mb-5
                      bg-white/10 backdrop-blur-sm border border-white/10
                      flex items-center justify-center
                      group-hover:scale-110 group-hover:bg-white/15 group-hover:shadow-lg
                      transition-all duration-300
                    `}>
                      <Icon className={`h-7 w-7 ${highlight.iconColor}`} />
                    </div>

                    {/* Label */}
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-2">
                      {highlight.label}
                    </p>

                    {/* Value with Animation */}
                    <p className={`text-3xl md:text-4xl font-bold mb-2 ${highlight.iconColor}`}>
                      {highlight.numericValue !== undefined ? (
                        <AnimatedCounter
                          value={highlight.numericValue}
                          suffix="%"
                          duration={1.5}
                        />
                      ) : (
                        highlight.value
                      )}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-white/60 mt-auto">
                      {highlight.description}
                    </p>

                    {/* Comparison */}
                    {highlight.comparison && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        whileInView={{ opacity: 1, height: "auto" }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="mt-4 pt-4 border-t border-white/10 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">דובאי ממוצע:</span>
                          <span className="text-white/60 font-medium">
                            {highlight.comparison.dubaiAverage}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">פרויקט זה:</span>
                          <span className={`font-bold ${highlight.iconColor}`}>
                            {highlight.comparison.thisProject}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info Bar */}
        {completionDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-8"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Calendar className="h-5 w-5 text-[#2563EB]" />
              <span className="text-sm text-white/80">מסירה: <span className="font-semibold text-white">{completionDate}</span></span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-white/80">בעלות מלאה לזרים</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Globe className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-white/80">ללא מס הכנסה</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default InvestmentHighlights;
