import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Phone,
  CheckCircle,
  Shield,
  Award,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface PropertyContactCTAProps {
  propertyId?: string;
  propertyName?: string;
  className?: string;
  unitsRemaining?: number;
}

interface FormData {
  name: string;
  phone: string;
}

export function PropertyContactCTA({
  propertyId,
  propertyName,
  className = "",
  unitsRemaining,
}: PropertyContactCTAProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
  });

  const whatsappNumber = "972508896702";
  const whatsappMessage = encodeURIComponent(
    `היי, אני מתעניין בפרויקט ${propertyName || "נדל״ן בדובאי"} ואשמח לקבל פרטים נוספים.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#2563EB", "#FFD700", "#B8860B"],
    });
    fire(0.2, {
      spread: 60,
      colors: ["#2563EB", "#FFD700", "#B8860B"],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#2563EB", "#FFD700", "#B8860B"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ["#2563EB", "#FFD700", "#B8860B"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ["#2563EB", "#FFD700", "#B8860B"],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "property-page-cta",
          propertyId,
          propertyName,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      setIsSubmitted(true);
      triggerConfetti();

      toast({
        title: "הפנייה נשלחה בהצלחה!",
        description: "נציג יחזור אליך בהקדם",
      });
    } catch (error) {
      toast({
        title: "שגיאה בשליחה",
        description: "אנא נסה שוב או צור קשר בטלפון",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const trustBadges = [
    { icon: BadgeCheck, text: "סוכן מורשה", color: "text-emerald-400" },
    { icon: Shield, text: "ללא התחייבות", color: "text-blue-400" },
    { icon: Award, text: "ייעוץ חינם", color: "text-amber-400" },
  ];

  // Real estate agent info
  const agent = {
    name: "יוסי כהן",
    phone: "+972-50-889-6702",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=agent1",
  };

  const showUrgency = unitsRemaining !== undefined && unitsRemaining > 0 && unitsRemaining <= 10;

  return (
    <section
      id="property-contact"
      className={cn(
        "py-16 md:py-24 relative overflow-hidden",
        "bg-gradient-to-b from-background via-muted/50 to-background",
        className
      )}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] decorative-orb orb-gold opacity-20 -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] decorative-orb orb-gold opacity-15 translate-y-1/2" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-medium mb-6 border border-primary/20"
          >
            <Sparkles className="h-4 w-4" />
            הצעד הבא להשקעה שלך
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            מוכנים להפוך למשקיעים בדובאי?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            השאירו פרטים ונציג מומחה יחזור אליכם עם הצעה מותאמת אישית
          </p>

          {/* Urgency Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {showUrgency && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 px-4 py-2 rounded-full border border-red-400/30 shadow-lg shadow-red-500/10"
              >
                <AlertTriangle className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-bold">
                  רק {unitsRemaining} יחידות נותרו!
                </span>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 px-4 py-2 rounded-full border border-amber-400/30"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">עליית מחיר צפויה בקרוב</span>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 md:p-8 rounded-2xl gold-border-animated"
            >
              {/* Agent Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 mb-6"
              >
                <div className="relative">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-16 h-16 rounded-full border-2 border-primary/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    {agent.name}
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </h4>
                  <p className="text-sm text-muted-foreground">סוכן נדל"ן מוסמך</p>
                  <a
                    href={`tel:${agent.phone}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <Phone className="h-3 w-3" />
                    {agent.phone}
                  </a>
                </div>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Simplified 2-field form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta-name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      שם מלא *
                    </Label>
                    <Input
                      id="cta-name"
                      required
                      placeholder="הזן את שמך"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-primary/50 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta-phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      טלפון *
                    </Label>
                    <Input
                      id="cta-phone"
                      type="tel"
                      required
                      placeholder="+972-XX-XXX-XXXX"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-primary/50 h-12"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="luxury-button h-14 text-lg font-semibold"
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
                        <Send className="h-5 w-5 ml-2" />
                        שלח פנייה
                        <ArrowLeft className="h-5 w-5 mr-2" />
                      </>
                    )}
                  </Button>

                  {/* WhatsApp Button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-14 px-6 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#25D366]/25"
                  >
                    <MessageCircle className="h-5 w-5" />
                    דברו איתנו בוואטסאפ
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-white/10">
                  {trustBadges.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={badge.text}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <Icon className={cn("h-4 w-4", badge.color)} />
                        <span className="text-sm text-muted-foreground">
                          {badge.text}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 md:p-12 rounded-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
              >
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                תודה על הפנייה!
              </h3>
              <p className="text-muted-foreground mb-6">
                נציג מומחה יחזור אליך תוך 24 שעות עם הצעה מותאמת אישית
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="border-white/20 hover:border-primary/50"
              >
                שלח פנייה נוספת
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default PropertyContactCTA;
