import { memo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const benefits = [
  { text: "0% מס הכנסה" },
  { text: "100% בעלות לזרים" },
  { text: "תשלום גמיש" },
];

export const QuickBenefitsBar = memo(function QuickBenefitsBar() {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border-y border-amber-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-12 py-4 sm:py-5">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span className="text-white/90 text-sm sm:text-base font-medium">
                {benefit.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default QuickBenefitsBar;
