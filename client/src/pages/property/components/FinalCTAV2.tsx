import { useState, memo } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Phone,
  Mail,
  User,
  Send,
  Loader2,
  Check,
  Clock,
  Shield,
  AlertCircle,
  Zap,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { contactFormSchema, type ContactFormData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface FinalCTAV2Props {
  propertyName: string;
  propertyId: string;
}

const trustIndicators = [
  { icon: Shield, text: "ללא התחייבות" },
  { icon: Clock, text: "מענה תוך 24 שעות" },
];

export const FinalCTAV2 = memo(function FinalCTAV2({
  propertyName,
  propertyId,
}: FinalCTAV2Props) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/leads", {
        ...data,
        source: propertyName,
        sourceType: "project",
        sourceId: propertyId,
      });
      setIsSubmitted(true);
      toast({
        title: "הפנייה נשלחה בהצלחה!",
        description: "נחזור אליך בהקדם",
      });
    } catch {
      toast({
        title: "שגיאה בשליחת הטופס",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0D0D14] to-[#0A0A0F]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              מוכנים להפוך למשקיעים בדובאי?
            </h2>
            <p className="text-white/60 text-lg">
              השאירו פרטים ונחזור אליכם עם הצעה מותאמת אישית
            </p>

            {/* Limited Availability Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-300 px-4 py-2 rounded-full border border-orange-400/30"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">מקומות מוגבלים - הצטרפו עכשיו</span>
            </motion.div>
          </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 sm:p-8 rounded-2xl"
        >
          {isSubmitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                תודה על פנייתך!
              </h3>
              <p className="text-white/60 mb-6">
                קיבלנו את הפרטים שלך ונחזור אליך בהקדם האפשרי.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  form.reset();
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                שליחת פנייה נוספת
              </Button>
            </motion.div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                          <Input
                            {...field}
                            placeholder="שם מלא"
                            className="h-14 pr-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-amber-400/50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                          <Input
                            {...field}
                            placeholder="טלפון"
                            className="h-14 pr-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-amber-400/50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="אימייל"
                            className="h-14 pr-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-amber-400/50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button with Pulse Animation */}
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(212, 175, 55, 0)",
                      "0 0 0 10px rgba(212, 175, 55, 0.1)",
                      "0 0 0 0 rgba(212, 175, 55, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                  className="rounded-xl"
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#C5A028] hover:to-[#E5C130] text-[#0A0A0F] font-bold rounded-xl shadow-lg shadow-[#2563EB]/30"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        שולח...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        קבל הצעת מחיר עכשיו
                      </span>
                    )}
                  </Button>
                </motion.div>

                {/* Or Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/40 text-sm">או</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* WhatsApp Button */}
                <a
                  href={`https://wa.me/972508896702?text=${encodeURIComponent(`היי, אני מעוניין בפרויקט ${propertyName} ואשמח לקבל פרטים נוספים`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-14 text-lg font-bold rounded-xl text-white transition-colors"
                  style={{ backgroundColor: "#25D366" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1ebe5d")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#25D366")}
                >
                  <MessageCircle className="h-5 w-5" />
                  שלח הודעה בוואטסאפ
                </a>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-6 pt-4">
                  {trustIndicators.map((indicator, idx) => {
                    const Icon = indicator.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-white/50"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{indicator.text}</span>
                      </div>
                    );
                  })}
                </div>
              </form>
            </Form>
          )}
        </motion.div>
        </div>
      </section>

    </>
  );
});

export default FinalCTAV2;
