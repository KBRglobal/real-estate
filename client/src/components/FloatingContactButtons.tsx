import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useLanguage } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";

const DEFAULT_PHONE_NUMBER = "+972508896702";
const DEFAULT_WHATSAPP_MESSAGE = "היי DDL הגעתי אליכם דרך האתר אשמח לשמוע פרטים נוספים";

interface FloatingContactButtonsProps {
  phoneNumber?: string;
  whatsappMessage?: string;
}

export function FloatingContactButtons({
  phoneNumber = DEFAULT_PHONE_NUMBER,
  whatsappMessage = DEFAULT_WHATSAPP_MESSAGE,
}: FloatingContactButtonsProps = {}) {
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
  const { t, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const buttonVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 1 + i * 0.1,
      },
    }),
    hover: {
      scale: 1.1,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.95 },
  };

  const tooltipVariants = {
    hidden: { opacity: 0, x: isRTL ? -10 : 10, scale: 0.8 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 25 }
    },
  };

  return (
    <div
      className={`fixed bottom-6 ${isRTL ? "right-6" : "left-6"} z-50 flex flex-col gap-3`}
      data-testid="floating-contact-buttons"
    >
      {/* Phone Button */}
      <motion.a
        href={`tel:${phoneNumber}`}
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover={isMobile ? undefined : "hover"}
        whileTap="tap"
        custom={0}
        onMouseEnter={() => !isMobile && setHoveredButton("phone")}
        onMouseLeave={() => !isMobile && setHoveredButton(null)}
        className="relative w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg gold-glow"
        data-testid="button-floating-phone"
        aria-label={isRTL ? "התקשר אלינו" : "Call us"}
      >
        <Phone className="h-5 w-5" aria-hidden="true" />

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredButton === "phone" && (
            <motion.span
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={`absolute ${isRTL ? "right-14" : "left-14"} whitespace-nowrap bg-foreground text-background text-xs px-3 py-1.5 rounded-lg shadow-lg`}
            >
              {isRTL ? "התקשר אלינו" : "Call us"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.a>

      {/* WhatsApp Button with Pulse */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover={isMobile ? undefined : "hover"}
        whileTap="tap"
        custom={1}
        onMouseEnter={() => !isMobile && setHoveredButton("whatsapp")}
        onMouseLeave={() => !isMobile && setHoveredButton(null)}
        className="relative w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-lg"
        data-testid="button-floating-whatsapp"
        aria-label={isRTL ? "שלח הודעה בוואצאפ" : "Send WhatsApp message"}
      >
        {/* Pulse Ring Animation - simplified on mobile */}
        {!isMobile && (
          <>
            <span className="absolute inset-0 rounded-xl bg-[#25D366] animate-ping opacity-30" />
            <span className="absolute inset-0 rounded-xl bg-[#25D366] animate-pulse opacity-20" />
          </>
        )}
        {isMobile && (
          <span className="absolute inset-0 rounded-xl bg-[#25D366] animate-pulse opacity-20" />
        )}

        <SiWhatsapp className="h-6 w-6 relative z-10" aria-hidden="true" />

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredButton === "whatsapp" && (
            <motion.span
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={`absolute ${isRTL ? "right-14" : "left-14"} whitespace-nowrap bg-foreground text-background text-xs px-3 py-1.5 rounded-lg shadow-lg`}
            >
              {isRTL ? "שלח הודעה בוואצאפ" : "WhatsApp us"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.a>
    </div>
  );
}
