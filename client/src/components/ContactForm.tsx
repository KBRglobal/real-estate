import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Mail, Send, Check, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { contactFormSchema, type ContactFormData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Confetti particle component
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color, left: `${x}%` }}
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{
        y: [0, -100, 200],
        opacity: [1, 1, 0],
        scale: [1, 1.2, 0.5],
        rotate: [0, 180, 360],
        x: [0, (Math.random() - 0.5) * 100],
      }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

// Success animation with confetti - fewer particles on mobile
function SuccessAnimation({ isMobile }: { isMobile: boolean }) {
  const colors = ["#2563EB", "#FFD700", "#FFA500", "#22C55E", "#3B82F6"];
  const particleCount = isMobile ? 10 : 20; // Fewer particles on mobile
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    delay: i * 0.05,
    x: 20 + Math.random() * 60,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle, i) => (
        <ConfettiParticle key={i} {...particle} />
      ))}
    </div>
  );
}

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: "onBlur", // Trigger validation on blur for real-time inline feedback
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/leads", data);
      form.reset();
      // Only show confetti if user doesn't prefer reduced motion
      if (!prefersReducedMotion) {
        setShowConfetti(true);
        setTimeout(() => {
          setIsSubmitted(true);
          setShowConfetti(false);
        }, 500);
      } else {
        setIsSubmitted(true);
      }
      toast({
        title: t("contact.success.title"),
        description: t("contact.success.desc"),
      });
    } catch (error) {
      // Shake animation on error
      const formElement = document.querySelector('[data-testid="contact-form-card"]');
      if (formElement) {
        formElement.classList.add("shake-error");
        setTimeout(() => formElement.classList.remove("shake-error"), 500);
      }
      toast({
        title: t("contact.error.title"),
        description: t("contact.error.desc"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="contact" className="py-20 md:py-32 bg-muted/30" data-testid="section-contact">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="glass-card rounded-2xl p-10 text-center gold-border-animated relative overflow-hidden"
          >
            {/* Success checkmark with animation */}
            <motion.div
              className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 gold-glow relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              >
                <Check className="h-10 w-10 text-primary-foreground" aria-hidden="true" />
              </motion.div>

              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1, delay: 0.3, repeat: 2 }}
              />
            </motion.div>

            <motion.h2
              className="text-2xl font-bold text-foreground mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {t("contact.success.heading")}
            </motion.h2>
            <motion.p
              className="text-muted-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {t("contact.success.text")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                data-testid="button-send-another"
              >
                {t("contact.success.another")}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact"
      className="py-20 md:py-32 bg-muted/30"
      data-testid="section-contact"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t("contact.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {t("contact.heading")}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("contact.subheading")}
          </p>
        </div>

        <div className="relative">
          {/* Confetti overlay */}
          <AnimatePresence>
            {showConfetti && <SuccessAnimation isMobile={isMobile} />}
          </AnimatePresence>

          <Card
            className="p-6 md:p-8 glass-card gold-border-animated transition-transform"
            data-testid="contact-form-card"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.name.label")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} aria-hidden="true" />
                            <Input
                              {...field}
                              placeholder={t("contact.name.placeholder")}
                              className={`${isRTL ? "pr-10" : "pl-10"} transition-all focus:ring-2 focus:ring-primary/30`}
                              aria-label={t("contact.name.label")}
                              aria-invalid={!!form.formState.errors.name}
                              aria-describedby={form.formState.errors.name ? "name-error" : undefined}
                              data-testid="input-name"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.phone.label")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} aria-hidden="true" />
                            <Input
                              {...field}
                              placeholder={t("contact.phone.placeholder")}
                              className={`${isRTL ? "pr-10" : "pl-10"} transition-all focus:ring-2 focus:ring-primary/30`}
                              aria-label={t("contact.phone.label")}
                              aria-invalid={!!form.formState.errors.phone}
                              aria-describedby={form.formState.errors.phone ? "phone-error" : undefined}
                              data-testid="input-phone"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("contact.email.label")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} aria-hidden="true" />
                          <Input
                            {...field}
                            type="email"
                            placeholder={t("contact.email.placeholder")}
                            className={`${isRTL ? "pr-10" : "pl-10"} transition-all focus:ring-2 focus:ring-primary/30`}
                            aria-label={t("contact.email.label")}
                            aria-invalid={!!form.formState.errors.email}
                            aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                            data-testid="input-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base luxury-button"
                  disabled={isSubmitting}
                  data-testid="button-submit-contact"
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {t("contact.submitting")}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        {t("contact.submit")}
                        <Send className={`h-4 w-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`} aria-hidden="true" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  {t("contact.responseTime")}
                </p>
              </form>
            </Form>
          </Card>

          {/* WhatsApp Alternative */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 w-full max-w-xs mx-auto">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">{isRTL ? "או" : "or"}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <a
              href="https://wa.me/972508896702?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%95%D7%93%20%D7%A2%D7%9C%20%D7%94%D7%A9%D7%A7%D7%A2%D7%95%D7%AA%20%D7%A0%D7%93%D7%9C%22%D7%9F%20%D7%91%D7%93%D7%95%D7%91%D7%90%D7%99"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium px-6 py-3 rounded-full transition-colors text-sm"
              data-testid="button-whatsapp-contact"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {isRTL ? "דברו איתנו בוואטסאפ" : "Chat with us on WhatsApp"}
            </a>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <motion.a
              href="tel:+972508896702"
              className="flex items-center gap-2 hover:text-primary transition-colors group"
              data-testid="link-phone"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="h-4 w-4 group-hover:animate-pulse" aria-hidden="true" />
              <span dir="ltr">+972 50-889-6702</span>
            </motion.a>
            <motion.a
              href="mailto:info@ddl-dubai.com"
              className="flex items-center gap-2 hover:text-primary transition-colors group"
              data-testid="link-email"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="h-4 w-4 group-hover:animate-pulse" aria-hidden="true" />
              <span>info@ddl-dubai.com</span>
            </motion.a>
          </div>
        </div>
      </div>

    </section>
  );
}
