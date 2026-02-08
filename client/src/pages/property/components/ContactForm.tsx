import { useState, memo } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, MessageSquare, User, Phone, Mail, Send, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { contactFormSchema, type ContactFormData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface PropertyContactFormProps {
  projectName: string;
  projectId: string;
}

// Country codes for phone input
const COUNTRY_CODES = [
  { code: "+972", flag: "🇮🇱", country: "ישראל" },
  { code: "+971", flag: "🇦🇪", country: "איחוד האמירויות" },
] as const;

// Enhanced validation schema with phone number formatting
const enhancedContactFormSchema = contactFormSchema.extend({
  phone: z.string()
    .min(1, "נא להזין מספר טלפון")
    .refine((val) => {
      // Remove all non-digits
      const digits = val.replace(/\D/g, "");
      // Check for Israeli format (9-10 digits after country code)
      // or UAE format (9 digits after country code)
      return digits.length >= 9 && digits.length <= 13;
    }, "מספר טלפון לא תקין"),
  name: z.string()
    .min(2, "שם חייב להכיל לפחות 2 תווים")
    .regex(/^[\u0590-\u05FF\u0600-\u06FFa-zA-Z\s'.\-]+$/, "שם לא תקין"),
  email: z.string()
    .min(1, "נא להזין כתובת אימייל")
    .email("כתובת אימייל לא תקינה"),
});

export const PropertyContactForm = memo(function PropertyContactForm({
  projectName,
  projectId,
}: PropertyContactFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState<string>(COUNTRY_CODES[0].code);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(enhancedContactFormSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      investmentGoal: undefined,
      budgetRange: "",
      timeline: undefined,
      experience: undefined,
      message: "",
    },
  });

  // Format phone number as user types
  const formatPhoneNumber = (value: string, countryCode: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    if (countryCode === "+972") {
      // Israeli format: 050-123-4567
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else {
      // UAE format: 50-123-4567
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`;
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Add country code to phone number
      const phoneWithCountryCode = `${countryCode}${data.phone.replace(/\D/g, "")}`;

      await apiRequest("POST", "/api/leads", {
        ...data,
        phone: phoneWithCountryCode,
        source: projectName,
        sourceType: "project",
        sourceId: projectId,
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

  // WhatsApp contact
  const whatsappNumber = "972508896702";
  const whatsappMessage = encodeURIComponent(
    `היי, אני מתעניין בפרויקט ${projectName} ואשמח לקבל פרטים נוספים.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  if (isSubmitted) {
    return (
      <Card className="p-6 bg-card/90 backdrop-blur-md text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/50"
        >
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          תודה על פנייתך!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-6 text-lg"
        >
          נחזור אליך בהקדם האפשרי
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}
            data-testid="button-send-another-property"
            className="border-primary/20 hover:border-primary/50"
          >
            שליחת פנייה נוספת
          </Button>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/90 backdrop-blur-md border-primary/20">
      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        מעוניין בפרויקט?
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שם מלא *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} placeholder="הזן שם" className="pr-10" data-testid="input-property-name" />
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
                <FormLabel>טלפון *</FormLabel>
                <FormControl>
                  <div className="relative flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-32 bg-background/50">
                        <SelectValue>
                          {COUNTRY_CODES.find((c) => c.code === countryCode)?.flag}{" "}
                          {countryCode}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                              <span className="text-muted-foreground text-xs">
                                {country.country}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value, countryCode);
                          field.onChange(formatted);
                        }}
                        placeholder={countryCode === "+972" ? "050-123-4567" : "50-123-4567"}
                        className="pr-10"
                        data-testid="input-property-phone"
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>אימייל *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} type="email" placeholder="your@email.com" className="pr-10" data-testid="input-property-email" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>הודעה</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="שאלות נוספות..." className="min-h-[80px]" data-testid="textarea-property-message" />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#C5A028] hover:to-[#E5C130] text-[#0A0A0F] font-semibold"
              disabled={isSubmitting || !form.formState.isValid}
              data-testid="button-submit-property-contact"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  שולח...
                </span>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  שליחת פנייה
                </>
              )}
            </Button>

            {/* WhatsApp Alternative */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">או</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 ml-2" />
                צור קשר בוואטסאפ
              </a>
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
});

export default PropertyContactForm;
