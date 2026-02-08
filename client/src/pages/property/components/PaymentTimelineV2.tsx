import { memo } from "react";
import { motion } from "framer-motion";
import { Wallet, Check, Building2, Key } from "lucide-react";
import type { PaymentMilestone } from "../types";

interface PaymentTimelineV2Props {
  paymentPlan?: PaymentMilestone[] | null;
}

// Default payment structure if none provided
const defaultMilestones: Array<{
  percentage: number;
  milestone: string;
  description?: string;
  icon: typeof Check;
}> = [
  { percentage: 20, milestone: "בהזמנה", icon: Check },
  { percentage: 50, milestone: "בבנייה", icon: Building2 },
  { percentage: 30, milestone: "במסירה", icon: Key },
];

const benefits = [
  "ללא בנק",
  "ללא ריבית",
  "ללא בירוקרטיה",
];

export const PaymentTimelineV2 = memo(function PaymentTimelineV2({
  paymentPlan,
}: PaymentTimelineV2Props) {
  // Use provided payment plan or default
  const milestones = paymentPlan && paymentPlan.length > 0
    ? paymentPlan.map((m, idx) => ({
        percentage: m.percentage || 0,
        milestone: m.milestone || "",
        description: m.description,
        icon: idx === 0 ? Check : idx === paymentPlan.length - 1 ? Key : Building2,
      }))
    : defaultMilestones;

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 mb-4">
            <Wallet className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            תוכנית תשלומים נוחה
          </h2>
          <p className="text-white/60">
            גמישה, המותאמת לצרכים שלך
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 sm:p-8 rounded-2xl"
        >
          {/* Vertical Timeline */}
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical Progress Line */}
            <div className="absolute right-5 sm:right-8 top-0 bottom-0 w-1 bg-white/10 rounded-full">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: "100%" }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                className="w-full bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"
              />
            </div>

            {/* Milestone Points */}
            <div className="relative space-y-12">
              {milestones.map((milestone, idx) => {
                const Icon = milestone.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      delay: 0.3 + idx * 0.2,
                      duration: 0.6,
                      type: "spring",
                      stiffness: 100
                    }}
                    className="flex items-center gap-3 sm:gap-6 relative"
                  >
                    {/* Circle with Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.5 + idx * 0.2,
                        type: "spring",
                        stiffness: 200
                      }}
                      className="relative z-10 flex-shrink-0"
                    >
                      <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-4 border-background flex items-center justify-center">
                        <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/50">
                          <Icon className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                        </div>
                      </div>
                      {/* Glow effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: [0, 0.5, 0] }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.5 + idx * 0.2,
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                        className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl"
                      />
                    </motion.div>

                    {/* Content Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + idx * 0.2 }}
                      className="flex-1 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="text-sm sm:text-base text-white/60 font-medium">
                          {milestone.milestone}
                        </div>
                        {/* Percentage Badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: 0.7 + idx * 0.2,
                            type: "spring"
                          }}
                          className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30 flex-shrink-0"
                        >
                          <span className="text-lg sm:text-2xl font-bold text-white">
                            {milestone.percentage}%
                          </span>
                        </motion.div>
                      </div>
                      {milestone.description && (
                        <div className="text-xs text-white/50">
                          {milestone.description}
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-10 pt-8 border-t border-white/10"
          >
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="text-white/80 text-sm sm:text-base">
                  {benefit}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});

export default PaymentTimelineV2;
