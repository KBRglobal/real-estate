import { motion } from "framer-motion";
import { Shield, Award, CheckCircle, Building2 } from "lucide-react";

interface TrustBadgesRowProps {
  developer?: string;
  className?: string;
}

export function TrustBadgesRow({ developer, className = "" }: TrustBadgesRowProps) {
  const badges = [
    {
      icon: Shield,
      label: "רישיון RERA",
      color: "text-emerald-400",
      gradient: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/30",
      shadowColor: "shadow-emerald-500/10",
    },
    {
      icon: Award,
      label: "יזם מאומת",
      color: "text-[#2563EB]",
      gradient: "from-[#2563EB]/20 to-[#2563EB]/5",
      borderColor: "border-[#2563EB]/30",
      shadowColor: "shadow-[#2563EB]/10",
    },
    {
      icon: CheckCircle,
      label: "עסקה מאובטחת",
      color: "text-blue-400",
      gradient: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/30",
      shadowColor: "shadow-blue-500/10",
    },
    ...(developer
      ? [
          {
            icon: Building2,
            label: developer,
            color: "text-purple-400",
            gradient: "from-purple-500/20 to-purple-500/5",
            borderColor: "border-purple-500/30",
            shadowColor: "shadow-purple-500/10",
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className={`flex flex-wrap items-center justify-start gap-3 ${className}`}
    >
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: 0.7 + index * 0.1,
              duration: 0.4,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-full
              bg-gradient-to-r ${badge.gradient}
              ${badge.borderColor} border
              backdrop-blur-md
              shadow-lg ${badge.shadowColor}
              cursor-default
              transition-shadow duration-300
              hover:shadow-xl
            `}
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />

            <Icon className={`h-4 w-4 ${badge.color} relative z-10`} />
            <span className="text-sm font-medium text-white/90 relative z-10">{badge.label}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default TrustBadgesRow;
