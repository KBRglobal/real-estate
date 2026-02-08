import { memo } from "react";
import { motion } from "framer-motion";
import { Users, Percent, CreditCard, Award } from "lucide-react";

interface WhyDubaiCompactProps {
  developer?: string;
}

export const WhyDubaiCompact = memo(function WhyDubaiCompact({
  developer,
}: WhyDubaiCompactProps) {
  const benefits = [
    {
      icon: Users,
      value: "100%",
      label: "בעלות לזרים",
      description: "זכויות בעלות מלאות למשקיעים זרים",
    },
    {
      icon: Percent,
      value: "0%",
      label: "מס הכנסה",
      description: "ללא מס על הכנסות משכירות",
    },
    {
      icon: CreditCard,
      value: "✓",
      label: "תשלום גמיש",
      description: "תכניות תשלום נוחות ללא ריבית",
    },
    {
      icon: Award,
      value: developer || "✓",
      label: developer ? "היזם" : "יזמים מובילים",
      description: developer ? `פרויקט מבית ${developer}` : "שיתוף פעולה עם היזמים הגדולים",
    },
  ];
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-[#0A0A0F] to-[#0D0D14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            למה להשקיע בדובאי?
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            דובאי מציעה סביבה ידידותית למשקיעים עם יתרונות ייחודיים
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 rounded-2xl text-center group hover:border-amber-400/30 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-7 w-7 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 break-words">
                  {benefit.value}
                </div>
                <div className="text-lg font-medium text-white/90 mb-2">
                  {benefit.label}
                </div>
                <p className="text-sm text-white/50 hidden sm:block">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default WhyDubaiCompact;
