import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, User, Phone, Send, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ExitIntentPopupProps {
  propertyName?: string;
}

const SESSION_STORAGE_KEY = "ddl_exit_popup_shown";

export function ExitIntentPopup({ propertyName }: ExitIntentPopupProps) {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [phone, setPhone] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track time on page
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnPage((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if popup was already shown this session
    const wasShown = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (wasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only show if user has been on page for at least 30 seconds
      if (timeOnPage < 30) return;

      // Detect mouse moving to top of page (exit intent)
      if (e.clientY <= 10 && e.movementY < 0) {
        setIsVisible(true);
        sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
        // Remove listener after showing once
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    // Only add mouse listener on desktop
    if (!isMobile && timeOnPage >= 30) {
      document.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [timeOnPage, isMobile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          source: "exit-intent-popup",
          propertyName,
          leadMagnet: "exclusive-pricing",
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      setIsSubmitted(true);

      toast({
        title: "תודה! המחירים הבלעדיים נשלחו אליך",
        description: "נציג יחזור אליך בהקדם עם פרטים נוספים",
      });

      // Close popup after success message
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (error) {
      toast({
        title: "שגיאה בשליחה",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Popup - Different animations for mobile vs desktop */}
          <motion.div
            initial={
              isMobile
                ? { opacity: 0, y: "100%" }
                : { opacity: 0, scale: 0.9, y: -20 }
            }
            animate={
              isMobile
                ? { opacity: 1, y: 0 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              isMobile
                ? { opacity: 0, y: "100%" }
                : { opacity: 0, scale: 0.9, y: -20 }
            }
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 w-full max-w-md mx-4",
              isMobile
                ? "bottom-0 left-0 right-0"
                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            )}
            dir="rtl"
          >
            <div
              className={cn(
                "relative bg-gradient-to-br from-background via-[#0D0D14] to-background shadow-2xl border border-primary/20 overflow-hidden",
                isMobile ? "rounded-t-2xl" : "rounded-2xl"
              )}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                aria-label="סגור"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"
              />

              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Header */}
                      <div className="text-center mb-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.1 }}
                          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/30"
                        >
                          <Sparkles className="h-10 w-10 text-primary" />
                        </motion.div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                          רוצים מחירים בלעדיים?
                        </h3>
                        <p className="text-white/70 text-base mb-2">
                          קבלו גישה למחירי השקה מיוחדים
                        </p>
                        <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full border border-primary/30 text-sm font-medium">
                          <Gift className="h-4 w-4" />
                          הנחה של עד 15% למשקיעים ראשונים
                        </div>
                      </div>

                      {/* Simplified One-Field Form */}
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="exit-phone" className="flex items-center gap-2 text-sm text-white/80">
                            <Phone className="h-4 w-4 text-primary" />
                            מספר טלפון
                          </Label>
                          <Input
                            id="exit-phone"
                            type="tel"
                            required
                            placeholder="050-123-4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-white/5 border-white/20 focus:border-primary/50 h-14 text-white placeholder:text-white/40 text-lg"
                            autoFocus
                          />
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary to-amber-400 hover:from-amber-600 hover:to-amber-500 text-background shadow-lg shadow-primary/30"
                          >
                            {isSubmitting ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Send className="h-5 w-5" />
                              </motion.div>
                            ) : (
                              <>
                                <Sparkles className="h-5 w-5 ml-2" />
                                קבל מחירים בלעדיים
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </form>

                      {/* Footer Note */}
                      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-1 text-xs text-white/50">
                          <CheckCircle className="h-3 w-3 text-emerald-400" />
                          <span>בטוח ומאובטח</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/50">
                          <CheckCircle className="h-3 w-3 text-emerald-400" />
                          <span>ללא ספאם</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50"
                      >
                        <CheckCircle className="h-10 w-10 text-white" strokeWidth={3} />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        תודה רבה!
                      </h3>
                      <p className="text-white/70 text-lg">
                        המחירים הבלעדיים נשלחו אליך
                      </p>
                      <p className="text-white/50 text-sm mt-2">
                        נציג יחזור אליך בהקדם
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ExitIntentPopup;
