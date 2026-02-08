import { memo } from "react";
import { motion } from "framer-motion";
import { Quote, Users, Shield, Award, Building2 } from "lucide-react";

interface TrustSectionV2Props {
  developer?: string | null;
  developerLogo?: string | null;
}

const testimonials = [
  {
    quote: "השקעתי עם DDL והתהליך היה מקצועי ונוח מההתחלה ועד הסוף. ממליץ בחום!",
    author: "אבי כ.",
    role: "משקיע",
    year: "2024",
  },
];

const trustBadges = [
  { label: "200+", description: "משקיעים מרוצים", icon: Users },
  { label: "RERA", description: "מורשה", icon: Shield },
  { label: "5+", description: "שנות ניסיון", icon: Award },
];

export const TrustSectionV2 = memo(function TrustSectionV2({
  developer,
  developerLogo,
}: TrustSectionV2Props) {
  const testimonial = testimonials[0];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-[#0D0D14]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 sm:p-12 rounded-2xl text-center mb-12 relative overflow-hidden"
        >
          {/* Quote Icon */}
          <div className="absolute top-6 right-6 opacity-10">
            <Quote className="h-20 w-20 text-amber-400" />
          </div>

          <div className="relative z-10">
            <blockquote className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-light leading-relaxed mb-6">
              "{testimonial.quote}"
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-lg">
                  {testimonial.author.charAt(0)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  {testimonial.author}
                </div>
                <div className="text-white/50 text-sm">
                  {testimonial.role}, {testimonial.year}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-6 sm:gap-10"
        >
          {/* Developer Logo */}
          {developer && (
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-xl border border-white/10">
              {developerLogo ? (
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
                  <img
                    src={developerLogo}
                    alt={`לוגו ${developer} - יזם הפרויקט`}
                    className="max-w-full max-h-full object-contain"
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.opacity = "0";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.className = "w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center";
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-amber-400" />
                </div>
              )}
              <span className="text-white/80 font-medium">{developer}</span>
            </div>
          )}

          {/* Trust Badges */}
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-white font-bold">{badge.label}</div>
                  <div className="text-white/50 text-xs">
                    {badge.description}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
});

export default TrustSectionV2;
