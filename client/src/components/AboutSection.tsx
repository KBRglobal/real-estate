import { motion } from "framer-motion";
import { MapPin, Users, Shield, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import ddlLogo from "@assets/ddl_logo_1768141898381.png";

export function AboutSection() {
  const { t, isRTL } = useLanguage();

  const features = [
    { icon: MapPin, titleKey: "about.feat1.title", descKey: "about.feat1.desc" },
    { icon: Users, titleKey: "about.feat2.title", descKey: "about.feat2.desc" },
    { icon: Shield, titleKey: "about.feat3.title", descKey: "about.feat3.desc" },
    { icon: Clock, titleKey: "about.feat4.title", descKey: "about.feat4.desc" },
  ];

  return (
    <section
      id="about"
      className="py-20 md:py-32 bg-background"
      data-testid="section-about"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full" />
              {t("about.badge")}
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {t("about.heading")}
            </h2>

            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {t("about.p1")}
            </p>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              <span className="text-primary font-semibold">{t("about.p2")}</span>{" "}
              {t("about.p2b")}
            </p>

            <div className="glass-card rounded-xl p-6 gold-border-animated">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center gold-glow">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{t("about.license")}</p>
                  <p className="text-sm text-muted-foreground">{t("about.licenseNum")}</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                {t("about.licenseDesc")}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative glass-card rounded-xl sm:rounded-2xl p-4 sm:p-8 lg:p-12 overflow-hidden gold-border-animated">
              <div className="absolute top-0 left-0 w-20 h-20 sm:w-40 sm:h-40 decorative-orb orb-gold" />
              <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-60 sm:h-60 decorative-orb orb-gold" />

              <div className="relative z-10 flex justify-center mb-4 sm:mb-8">
                <img
                  src={ddlLogo}
                  alt="PropLine Real Estate"
                  className="h-16 sm:h-24 lg:h-32 w-auto"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))",
                  }}
                />
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-4">
                {features.map((feature, index) => {
                  const isFirst = index === 0;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      className={`
                        glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 hover-elevate premium-card
                        ${isFirst ? "border-l-2 sm:border-l-4 border-l-primary" : ""}
                      `}
                    >
                      <feature.icon className="h-5 w-5 sm:h-7 sm:w-7 text-primary mb-2 sm:mb-3" />
                      <h3 className="font-semibold text-foreground text-xs sm:text-sm mb-1">
                        {t(feature.titleKey)}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {t(feature.descKey)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
