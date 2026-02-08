import { motion } from "framer-motion";
import { developers } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";

export function DeveloperLogos() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-background border-y border-border" data-testid="section-developers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("developers.title")}
          </p>
        </motion.div>

        <div className="relative overflow-hidden" role="marquee" aria-label={t("developers.title")}>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-transparent to-background z-10" />
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-background z-10" />

          <motion.div
            className="flex gap-12 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            {[...developers, ...developers].map((developer, index) => (
              <div
                key={index}
                className="flex-shrink-0 group"
              >
                <div className="bg-card rounded-xl px-8 py-4 border border-card-border hover-elevate transition-all duration-300 grayscale hover:grayscale-0">
                  <span className="text-xl font-bold text-foreground tracking-wider">
                    {developer.name}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
