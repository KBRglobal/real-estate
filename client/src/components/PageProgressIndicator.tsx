import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { scrollToSection } from "@/lib/utils";

interface Section {
  id: string;
  labelKey: string;
}

const sections: Section[] = [
  { id: "hero", labelKey: "nav.home" },
  { id: "about", labelKey: "nav.about" },
  { id: "calculator", labelKey: "nav.calculator" },
  { id: "process", labelKey: "nav.process" },
  { id: "projects", labelKey: "nav.projects" },
  { id: "why-dubai", labelKey: "nav.whyDubai" },
  { id: "contact", labelKey: "nav.contact" },
];

export function PageProgressIndicator() {
  const { t, isRTL } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Show indicator only after scrolling past hero
      setIsVisible(window.scrollY > 300);

      // Find active section
      const viewportMiddle = window.innerHeight / 2;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSectionClick = (id: string) => {
    scrollToSection(id);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-1/2 -translate-y-1/2 ${isRTL ? "left-4" : "right-4"} z-40 hidden lg:flex flex-col gap-3`}
        >
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const isHovered = hoveredSection === section.id;

            return (
              <div
                key={section.id}
                className="relative flex items-center"
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: isRTL ? 10 : -10, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: isRTL ? 10 : -10, scale: 0.8 }}
                      className={`absolute ${isRTL ? "left-6" : "right-6"} whitespace-nowrap bg-card/90 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-lg shadow-lg border border-primary/20`}
                    >
                      {t(section.labelKey)}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Dot */}
                <motion.button
                  onClick={() => handleSectionClick(section.id)}
                  className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-primary scale-125"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={t(section.labelKey)}
                >
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-primary"
                      layoutId="activeSection"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-primary"
                      animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              </div>
            );
          })}

          {/* Progress line */}
          <div
            className={`absolute ${isRTL ? "left-1.5" : "right-1.5"} top-0 bottom-0 w-px bg-muted-foreground/10 -z-10`}
          >
            <motion.div
              className="w-full bg-primary/50"
              style={{
                height: `${(sections.findIndex((s) => s.id === activeSection) / (sections.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
