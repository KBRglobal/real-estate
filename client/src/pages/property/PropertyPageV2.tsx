import { useState, useRef, useMemo, useCallback, useEffect, lazy, Suspense } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Building2, ArrowLeft, Phone, Share2, Check, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// V2 Components
import { HeroV2 } from "./components/HeroV2";
import { GalleryBento } from "./components/GalleryBento";
import { QuickBenefitsBar } from "./components/QuickBenefitsBar";
import { PropertyOverviewV2 } from "./components/PropertyOverviewV2";
import { UnitsGridV2, type UnitDataV2 } from "./components/UnitsGridV2";
import { PaymentTimelineV2 } from "./components/PaymentTimelineV2";
import { LocationAmenitiesV2 } from "./components/LocationAmenitiesV2";
import { TrustSectionV2 } from "./components/TrustSectionV2";
import { FinalCTAV2 } from "./components/FinalCTAV2";

// Lazy-loaded V2 components
const InvestmentHighlights = lazy(() => import("./components/InvestmentHighlights"));
const PropertyRoiCalculator = lazy(() => import("./components/PropertyRoiCalculator"));

// Section loading skeleton
function SectionSkeleton() {
  return (
    <div className="py-20 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-amber-400/50" />
    </div>
  );
}

// Shared components
import { PhotoSwipeLightbox } from "./components";
import { FloatingContactButtons } from "@/components/FloatingContactButtons";

// Utils and types
import {
  getHeroImage,
  getGalleryImages,
  formatPrice,
  normalizePaymentPlan,
  FALLBACK_HERO_IMAGES,
} from "./utils";
import { repairCorruptedAmenities } from "@/components/admin/AmenitiesEditor";
import type {
  Project,
  Highlight,
  AmenityCategory,
  Unit,
  PaymentMilestone,
  Neighborhood,
  FAQ,
} from "./types";

// Inline FAQ accordion component for V2 dark theme
function FAQV2Item({ question, answer, index }: { question?: string; answer?: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!question || !answer) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-right hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-white text-sm sm:text-base">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown className="h-5 w-5 text-amber-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-white/5 pt-3">
              <p className="text-white/70 text-sm leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PropertyPageV2() {
  const params = useParams();
  const slug = params.slug;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Section refs for scrolling and IntersectionObserver
  const heroRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const unitsRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery<Project>({
    queryKey: ["/api/projects/slug", slug],
    queryFn: async () => {
      let res = await fetch(`/api/projects/slug/${slug}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
      res = await fetch(`/api/projects/${slug}`);
      if (!res.ok) throw new Error("Project not found");
      const json = await res.json();
      return json.data || json;
    },
    enabled: !!slug,
  });

  // Memoized data transformations
  const highlights = useMemo(
    () => project?.highlights as Highlight[] | null,
    [project?.highlights]
  );
  const amenities = useMemo(
    () => repairCorruptedAmenities(project?.amenities as AmenityCategory[] | null) || (project?.amenities as AmenityCategory[] | null),
    [project?.amenities]
  );
  const units = useMemo(
    () => project?.units as Unit[] | null,
    [project?.units]
  );
  const paymentPlan = useMemo(
    () => normalizePaymentPlan(project?.paymentPlan),
    [project?.paymentPlan]
  );
  const gallery = useMemo(
    () => (project ? getGalleryImages(project) : []),
    [project]
  );
  const heroImage = useMemo(
    () => (project ? getHeroImage(project) : FALLBACK_HERO_IMAGES[0]),
    [project]
  );
  const neighborhood = useMemo(
    () => project?.neighborhood as Neighborhood | null,
    [project?.neighborhood]
  );
  const faqs = useMemo(
    () => project?.faqs as FAQ[] | null,
    [project?.faqs]
  );
  const hasValidPrice = useMemo(
    () => project?.priceFrom && project.priceFrom > 0,
    [project?.priceFrom]
  );

  // Transform units for V2 component
  const unitsV2: UnitDataV2[] = useMemo(() => {
    if (!units) return [];
    return units.map((unit: Unit, idx: number) => ({
      id: `unit-${idx}`,
      type: unit.typeHe || unit.type || "יחידה",
      bedrooms:
        unit.type?.includes("Studio") || unit.type?.includes("סטודיו")
          ? 0
          : parseInt(unit.type?.match(/\d+/)?.[0] || "1") || 1,
      size:
        unit.sizeFrom ||
        (typeof unit.size === "string"
          ? parseInt(unit.size.replace(/[^0-9]/g, ""))
          : 0) ||
        0,
      sizeUnit: unit.sizeUnit || "sqft",
      price:
        unit.priceFrom ||
        (typeof unit.price === "string"
          ? parseInt(unit.price.replace(/[^0-9]/g, ""))
          : 0) ||
        0,
      priceCurrency: unit.priceCurrency || "AED",
      isAvailable: unit.status !== "sold",
      floor: unit.floor,
      view: unit.view,
    }));
  }, [units]);

  // Scroll handlers
  const scrollToGallery = useCallback(() => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToContact = useCallback(() => {
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleImageClick = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleUnitInterest = useCallback(
    (_unit: UnitDataV2) => {
      scrollToContact();
    },
    [scrollToContact]
  );

  // Section navigation items
  const navSections = useMemo(() => [
    { id: "hero", label: "פרטים", ref: heroRef },
    { id: "gallery", label: "גלריה", ref: galleryRef },
    { id: "overview", label: "מידע כללי", ref: overviewRef },
    { id: "units", label: "יחידות", ref: unitsRef },
    { id: "payment", label: "תשלומים", ref: paymentRef },
    { id: "location", label: "מיקום", ref: locationRef },
    { id: "contact", label: "צור קשר", ref: contactRef },
  ], []);

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const observers = navSections.map(({ id, ref }) => {
      const element = ref.current;
      if (!element) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        {
          threshold: 0.3,
          rootMargin: "-100px 0px -50% 0px",
        }
      );

      observer.observe(element);
      return { observer, element };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.disconnect();
      });
    };
  }, [navSections]);

  // Scroll to section handler
  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Share handlers
  const handleShare = useCallback(() => {
    setShareMenuOpen(!shareMenuOpen);
  }, [shareMenuOpen]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShareMenuOpen(false);
    }, 2000);
  }, []);

  const shareWhatsApp = useCallback(() => {
    const message = `היי, תראה את הפרויקט המדהים הזה בדובאי: ${project?.name}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    setShareMenuOpen(false);
  }, [project?.name]);

  // Loading state with top progress bar
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        dir="rtl"
      >
        {/* Top loading progress bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          />
        </div>

        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto" />
          <p className="text-white/60 mt-4">טוען פרטי הפרויקט...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center space-y-4">
          <Building2 className="h-16 w-16 text-white/30 mx-auto" />
          <h1 className="text-2xl font-bold text-white">הפרויקט לא נמצא</h1>
          <p className="text-white/60">הפרויקט המבוקש אינו קיים או הוסר</p>
          <Link href="/">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <ArrowLeft className="h-4 w-4 ml-2" />
              חזרה לדף הבית
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
      {/* PhotoSwipe Lightbox Gallery */}
      {lightboxOpen && gallery.length > 0 && (
        <PhotoSwipeLightbox
          images={gallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Minimal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזרה
              </Button>
            </Link>

            <Button
              size="sm"
              onClick={scrollToContact}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Phone className="h-4 w-4 ml-2" />
              צור קשר
            </Button>
          </div>
        </div>
      </nav>

      {/* Sticky Section Navigation Bar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed top-16 left-0 right-0 z-30 bg-background/95 backdrop-blur-lg border-b border-white/5 hidden md:block"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-1 py-3">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.ref)}
                className={`
                  relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300
                  ${
                    activeSection === section.id
                      ? "text-amber-400"
                      : "text-white/60 hover:text-white/80 hover:bg-white/5"
                  }
                `}
              >
                {section.label}
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 1. IMMERSIVE HERO */}
      <div ref={heroRef}>
        <HeroV2
          projectName={project.name}
          location={project.location || "דובאי"}
          heroImage={heroImage}
          gallery={gallery}
          developer={project.developer}
          developerLogo={project.developerLogo}
          priceFrom={project.priceFrom}
          priceCurrency={project.priceCurrency || "AED"}
          completionDate={project.completionDate}
          bedrooms={project.bedrooms}
          sizeRange={(project as any).sizeRange}
          videoUrl={(project as any).videoUrl}
          onContactClick={scrollToContact}
          onVideoClick={(project as any).videoUrl ? () => {} : undefined}
          onScrollDown={scrollToGallery}
        />
      </div>

      {/* 2. GALLERY SHOWCASE - Right after Hero! */}
      <div ref={galleryRef}>
        <GalleryBento
          images={gallery}
          projectName={project.name}
          onImageClick={handleImageClick}
        />
      </div>

      {/* 3. QUICK BENEFITS BAR */}
      <QuickBenefitsBar />

      {/* 4. PROPERTY OVERVIEW */}
      <div ref={overviewRef}>
        {project.description && (
          <PropertyOverviewV2
            description={project.description}
            highlights={highlights}
            developer={project.developer}
            developerLogo={project.developerLogo}
            location={project.location || "דובאי"}
            completionDate={project.completionDate}
            propertyType={project.propertyType}
            bedrooms={project.bedrooms}
            bathrooms={(project as any).bathrooms}
            parking={(project as any).parking}
            brochureUrl={(project as any).brochureUrl}
          />
        )}
      </div>

      {/* 4.5. INVESTMENT HIGHLIGHTS */}
      <Suspense fallback={<SectionSkeleton />}>
        <InvestmentHighlights
          developer={project.developer ?? undefined}
          completionDate={project.completionDate ?? undefined}
          roiPercent={(project as any).roiPercent}
        />
      </Suspense>

      {/* 5. AVAILABLE UNITS */}
      <div ref={unitsRef}>
        {unitsV2.length > 0 && (
          <UnitsGridV2
            propertyName={project.name}
            units={unitsV2}
            onUnitInterest={handleUnitInterest}
          />
        )}
      </div>

      {/* 6. ROI CALCULATOR */}
      <Suspense fallback={<SectionSkeleton />}>
        <PropertyRoiCalculator
          propertyName={project.name}
          onContactClick={scrollToContact}
        />
      </Suspense>

      {/* 7. PAYMENT PLAN */}
      <div ref={paymentRef}>
        <PaymentTimelineV2 paymentPlan={paymentPlan} />
      </div>

      {/* 8. LOCATION + AMENITIES */}
      <div ref={locationRef}>
        <LocationAmenitiesV2
          location={project.location || "דובאי"}
          neighborhood={neighborhood}
          amenities={amenities}
          coordinates={project.coordinates as { lat: number; lng: number } | null}
        />
      </div>

      {/* 9. TRUST SECTION */}
      <TrustSectionV2
        developer={project.developer}
        developerLogo={project.developerLogo}
      />

      {/* 9.5 FAQ SECTION */}
      {faqs && faqs.length > 0 && (
        <section className="py-12 sm:py-16 bg-background" data-testid="section-faq-v2">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-6 w-6 text-amber-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">שאלות נפוצות</h2>
              <p className="text-white/60 text-sm mt-2">תשובות לשאלות הנפוצות ביותר על הפרויקט</p>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <FAQV2Item key={idx} question={faq.question} answer={faq.answer} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. FINAL CTA */}
      <div ref={contactRef}>
        <FinalCTAV2 propertyName={project.name} propertyId={project.id} />
      </div>

      {/* Floating Contact Buttons */}
      <FloatingContactButtons
        phoneNumber="+972508896702"
        whatsappMessage={`היי, אני מתעניין בפרויקט ${project.name} ואשמח לקבל פרטים נוספים.`}
      />

      {/* Share Button - aligned with floating contact buttons */}
      <div className="fixed bottom-[8.5rem] right-6 z-50">
        <AnimatePresence>
          {shareMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-14 right-0 bg-background/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-2 min-w-[180px]"
            >
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400">הועתק!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">העתק קישור</span>
                  </>
                )}
              </button>
              <button
                onClick={shareWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-sm">שתף בוואטסאפ</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg gold-glow transition-colors"
        >
          <Share2 className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Mobile CTA Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-white/10 p-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {hasValidPrice ? (
              <div>
                <p className="text-xs text-white/50">החל מ-</p>
                <p className="text-lg font-bold text-amber-400">
                  {formatPrice(project.priceFrom, project.priceCurrency || "AED")}
                </p>
              </div>
            ) : project.completionDate ? (
              <div>
                <p className="text-xs text-white/50">מסירה צפויה</p>
                <p className="text-lg font-bold text-white">
                  {project.completionDate}
                </p>
              </div>
            ) : null}
          </div>
          <Button
            onClick={scrollToContact}
            className="h-12 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
          >
            <Phone className="h-4 w-4 ml-2" />
            קבל הצעת מחיר
          </Button>
        </div>
      </motion.div>

      {/* Bottom padding for mobile CTA */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
