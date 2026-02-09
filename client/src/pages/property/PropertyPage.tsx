import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SEO, injectJsonLd, generateRealEstateListingSchema, generateBreadcrumbSchema } from "@/components/SEO";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  Loader2,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  Building2,
  ChevronDown,
  Home,
  BedDouble,
  Check,
  Phone,
  MessageSquare,
  Award,
  Sparkles,
  Wallet,
  AlertTriangle,
  Eye,
  Users,
  ExternalLink,
  Play,
  Tag,
  FileText,
  Percent,
  HardHat,
  Layers,
  Sofa,
  Map,
  Link2,
  Car,
  Ruler,
  TrendingUp,
  BarChart3,
  Shield,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";

import { PropertyContactForm, FAQItem, PhotoSwipeLightbox } from "./components";
import { TrustBadgesRow } from "./components/TrustBadgesRow";
import { InvestmentHighlights } from "./components/InvestmentHighlights";
import { PropertyUnitsShowcase, UnitData } from "./components/PropertyUnitsShowcase";
import { PropertyContactCTA } from "./components/PropertyContactCTA";
import { PropertyLocationIntelligence } from "./components/PropertyLocationIntelligence";
import { ExitIntentPopup } from "./components/ExitIntentPopup";
import { FloatingContactButtons } from "@/components/FloatingContactButtons";
import {
  getIcon,
  formatPrice,
  getHeroImage,
  getGalleryImages,
  normalizePaymentPlan,
  sectionNav,
  FALLBACK_HERO_IMAGES,
} from "./utils";
import { repairCorruptedAmenities } from "@/components/admin/AmenitiesEditor";
import type {
  Project,
  Highlight,
  AmenityCategory,
  Unit,
  PaymentMilestone,
  GalleryItem,
  Neighborhood,
  FAQ,
} from "./types";

export default function PropertyPage() {
  const params = useParams();
  const slug = params.slug;
  const [activeSection, setActiveSection] = useState("hero");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const { data: project, isLoading, error } = useQuery<Project>({
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of sectionNav) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const highlights = useMemo(() => project?.highlights as Highlight[] | null, [project?.highlights]);
  const amenities = useMemo(() => repairCorruptedAmenities(project?.amenities as AmenityCategory[] | null) || (project?.amenities as AmenityCategory[] | null), [project?.amenities]);
  const units = useMemo(() => project?.units as Unit[] | null, [project?.units]);
  const paymentPlan = useMemo(() => normalizePaymentPlan(project?.paymentPlan), [project?.paymentPlan]);
  const gallery = useMemo(() => project ? getGalleryImages(project) : [], [project]);
  const heroImage = useMemo(() => project ? getHeroImage(project) : FALLBACK_HERO_IMAGES[0], [project]);
  const neighborhood = useMemo(() => project?.neighborhood as Neighborhood | null, [project?.neighborhood]);
  const faqs = useMemo(() => project?.faqs as FAQ[] | null, [project?.faqs]);
  const hasValidPrice = useMemo(() => project?.priceFrom && project.priceFrom > 0, [project?.priceFrom]);

  // Calculate units remaining (available units that aren't sold)
  const unitsRemaining = useMemo(() => {
    if (!units) return undefined;
    const availableUnits = units.filter((unit) => unit.status !== "sold");
    return availableUnits.length;
  }, [units]);

  // Simulated current viewers (random between 3-12, seeded by project id for consistency)
  const currentViewers = useMemo(() => {
    if (!project?.id) return 0;
    // Simple hash from project id to get consistent "random" number
    const hash = project.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 3 + (hash % 10); // Returns 3-12
  }, [project?.id]);

  const filteredUnits = useMemo(() => {
    if (!units) return [];
    if (unitFilter === "all") return units;
    return units.filter((unit) => unit.bedrooms === unitFilter);
  }, [units, unitFilter]);

  const uniqueBedrooms = useMemo(() => {
    if (!units) return [];
    return Array.from(new Set(units.map((u) => u.bedrooms).filter(Boolean)));
  }, [units]);

  const filteredSectionNav = useMemo(() => {
    if (!project) return sectionNav;
    return sectionNav.filter((section) => {
      switch (section.id) {
        case "amenities":
          return amenities && amenities.length > 0 && amenities.some(cat => cat.items && cat.items.length > 0);
        case "units":
          return units && units.length > 0;
        case "payment":
          return paymentPlan && paymentPlan.length > 0;
        case "location":
          return neighborhood && (neighborhood.description || (neighborhood.nearbyPlaces && neighborhood.nearbyPlaces.length > 0));
        default:
          return true;
      }
    });
  }, [project, amenities, units, paymentPlan, neighborhood]);

  // Inject RealEstateListing and BreadcrumbList schemas when project data is available
  useEffect(() => {
    if (!project) return;

    // Generate and inject RealEstateListing schema
    const realEstateSchema = generateRealEstateListingSchema({
      name: project.name,
      description: project.description || undefined,
      price: project.priceFrom || undefined,
      priceCurrency: project.priceCurrency || "AED",
      location: project.location || "Dubai",
      image: heroImage,
      url: `https://propline.com/project/${slug}`
    });
    injectJsonLd(realEstateSchema, "property-real-estate-listing");

    // Generate and inject BreadcrumbList schema
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "דף הבית", url: "/" },
      { name: "פרויקטים", url: "/#projects" },
      { name: project.name, url: `/project/${slug}` }
    ]);
    injectJsonLd(breadcrumbSchema, "property-breadcrumb");

    // Cleanup on unmount
    return () => {
      const realEstateScript = document.getElementById("property-real-estate-listing");
      const breadcrumbScript = document.getElementById("property-breadcrumb");
      if (realEstateScript) realEstateScript.remove();
      if (breadcrumbScript) breadcrumbScript.remove();
    };
  }, [project, slug, heroImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">טוען פרטי הפרויקט...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">הפרויקט לא נמצא</h1>
          <p className="text-muted-foreground">הפרויקט המבוקש אינו קיים או הוסר</p>
          <Link href="/">
            <Button data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 ml-2" />
              חזרה לדף הבית
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* SEO Component for canonical URLs and hreflang */}
      <SEO
        title={`${project.name} - נדל״ן בדובאי | PropLine`}
        description={project.description?.slice(0, 160) || `${project.name} - פרויקט נדל״ן יוקרתי בדובאי. ליווי מקצועי להשקעות נדל״ן.`}
        image={heroImage}
        type="product"
      />

      {/* PhotoSwipe Lightbox Gallery */}
      {lightboxOpen && gallery.length > 0 && (
        <PhotoSwipeLightbox
          images={gallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-nav-home">
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזרה
              </Button>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {filteredSectionNav.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === section.id
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid={`nav-section-${section.id}`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            <Button size="sm" onClick={() => scrollToSection("contact")} data-testid="button-nav-contact">
              <Phone className="h-4 w-4 ml-2" />
              צור קשר
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        ref={(el) => (sectionRefs.current["hero"] = el)}
        className="relative min-h-[85vh] flex items-end pt-16"
        data-testid="section-hero"
      >
        <div className="absolute inset-0">
          <OptimizedImage
            src={heroImage}
            alt={`${project.name} - פרויקט נדל״ן יוקרתי בדובאי`}
            fallbackSrc={FALLBACK_HERO_IMAGES[0]}
            priority
            blurUp
            className="scale-105"
            style={{ filter: "brightness(0.9)" }}
            wrapperClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </div>

        {project.developer && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="absolute top-24 right-8 z-20"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl px-6 py-4 border border-white/20">
              <div className="flex items-center gap-4">
                {project.developerLogo && (
                  <img
                    src={project.developerLogo}
                    alt={`לוגו ${project.developer} - יזם הפרויקט`}
                    className="h-12 w-auto"
                    width={120}
                    height={48}
                    loading="eager"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                  />
                )}
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">יזם הפרויקט</div>
                  <div className="font-bold text-gray-900">{project.developer}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="relative z-10 w-full pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/90 to-amber-600/90 backdrop-blur-md text-white px-5 py-2 rounded-full mb-6 shadow-lg"
              >
                <Award className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">הזדמנות השקעה פרימיום</span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                <span className="block">{project.name}</span>
              </h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 text-white/90 text-xl mb-10"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="font-light tracking-wide">{project.location}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {project.propertyType && (
                  <div className="group bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-5 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-widest mb-2">
                      <Home className="h-4 w-4" />
                      סוג נכס
                    </div>
                    <div className="text-xl font-bold">{project.propertyType}</div>
                  </div>
                )}

                {hasValidPrice && (
                  <div className="group bg-gradient-to-br from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 backdrop-blur-xl border border-amber-400/30 rounded-2xl px-5 py-5 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 text-amber-200/80 text-xs uppercase tracking-widest mb-2">
                      <DollarSign className="h-4 w-4" />
                      החל מ-
                    </div>
                    <div className="text-xl font-bold text-amber-100">
                      {formatPrice(project.priceFrom, project.priceCurrency || "AED")}
                    </div>
                  </div>
                )}


                {project.completionDate && (
                  <div className="group bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-5 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-widest mb-2">
                      <Calendar className="h-4 w-4" />
                      מסירה
                    </div>
                    <div className="text-xl font-bold">{project.completionDate}</div>
                  </div>
                )}

                {project.bedrooms && (
                  <div className="group bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-5 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-widest mb-2">
                      <BedDouble className="h-4 w-4" />
                      חדרים
                    </div>
                    <div className="text-xl font-bold">{project.bedrooms}</div>
                  </div>
                )}
              </motion.div>

              {/* Trust Badges Row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-6"
              >
                <TrustBadgesRow developer={project.developer} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-4 mt-8"
              >
                <Button
                  size="lg"
                  onClick={() => scrollToSection("property-contact")}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-xl shadow-amber-500/25 text-lg px-8"
                >
                  <Phone className="h-5 w-5 ml-2" />
                  קבל הצעת מחיר
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("gallery")}
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8"
                >
                  <Sparkles className="h-5 w-5 ml-2" />
                  צפה בגלריה
                </Button>
              </motion.div>

              {/* Social Proof & Urgency Badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-6 flex flex-wrap gap-3"
              >
                {/* Units Remaining Badge */}
                {unitsRemaining !== undefined && unitsRemaining > 0 && unitsRemaining <= 20 && (
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-200 px-4 py-2 rounded-full"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">{unitsRemaining} יחידות נותרו</span>
                  </motion.div>
                )}

                {/* Fallback: General Limited Availability */}
                {(unitsRemaining === undefined || unitsRemaining > 20) && (
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-200 px-4 py-2 rounded-full"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">יחידות מוגבלות זמינות</span>
                  </motion.div>
                )}

                {/* Current Viewers Indicator */}
                {currentViewers > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                    className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-200 px-4 py-2 rounded-full"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">צפו בנכס הזה היום: {currentViewers} אנשים</span>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/60"
          >
            <span className="text-xs tracking-widest uppercase">גלול למטה</span>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Investment Highlights Section - Without ROI (legal compliance) */}
      <InvestmentHighlights
        paymentPlan={paymentPlan && paymentPlan.length > 0 ? `${paymentPlan[0]?.percentage || 0}/${100 - (paymentPlan[0]?.percentage || 0)}` : undefined}
        developer={project.developer ?? undefined}
        completionDate={project.completionDate ?? undefined}
        roiPercent={project.roiPercent ?? undefined}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* About Section */}
            {project.description && (
              <section id="about" ref={(el) => (sectionRefs.current["about"] = el)} data-testid="section-about">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">אודות הפרויקט</h2>
                      <p className="text-muted-foreground">הזדמנות השקעה ייחודית</p>
                    </div>
                  </div>

                  <Card className="overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl">
                    <div className="p-8">
                      <div className="prose prose-lg max-w-none">
                        {project.description.split("\n").filter(p => p.trim()).map((paragraph, idx) => (
                          <motion.p
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`mb-5 last:mb-0 text-foreground/90 leading-relaxed ${
                              idx === 0 ? "text-xl font-medium text-foreground border-r-4 border-primary pr-5" : "text-base"
                            }`}
                          >
                            {paragraph}
                          </motion.p>
                        ))}
                      </div>

                      {highlights && highlights.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-border/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {highlights.slice(0, 4).map((highlight, idx) => {
                              const IconComponent = getIcon(highlight.icon);
                              return (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="text-center"
                                >
                                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                    <IconComponent className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="text-2xl font-bold text-foreground">{highlight.value}</div>
                                  <div className="text-sm text-muted-foreground">{highlight.title}</div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {project.developer && (
                        <div className="mt-8 pt-8 border-t border-border/50">
                          <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30">
                            {project.developerLogo && (
                              <div className="flex-shrink-0 w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center p-3">
                                <img
                                  src={project.developerLogo}
                                  alt={`לוגו ${project.developer} - יזם הפרויקט`}
                                  className="max-w-full max-h-full object-contain"
                                  loading="lazy"
                                  decoding="async"
                                  width={80}
                                  height={80}
                                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">יזם הפרויקט</div>
                              <div className="text-xl font-bold text-foreground mb-2">{project.developer}</div>
                              <p className="text-sm text-muted-foreground">יזם מוביל עם ניסיון רב בפיתוח פרויקטים יוקרתיים בדובאי</p>
                            </div>
                            <div className="hidden md:block">
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">
                                <Check className="h-3 w-3 ml-1" />
                                יזם מאומת
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Amenities Section */}
            {amenities && amenities.length > 0 && (
              <section id="amenities" ref={(el) => (sectionRefs.current["amenities"] = el)} data-testid="section-amenities">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    מתקנים ושירותים
                  </h2>
                  <div className="space-y-6">
                    {amenities.map((category, catIdx) => (
                      <Card key={catIdx} className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">{category.category}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {category.items?.map((item, itemIdx) => {
                            const IconComponent = getIcon(item.icon);
                            return (
                              <div key={itemIdx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                                <span className="text-foreground">{(item as any).nameHe || item.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              </section>
            )}

            {/* Units Section - Using New Card-based Showcase */}
            {units && units.length > 0 && (
              <section id="units" ref={(el) => (sectionRefs.current["units"] = el)} data-testid="section-units">
                <PropertyUnitsShowcase
                  propertyName={project.name}
                  units={units.map((unit: Unit, idx: number): UnitData => ({
                    id: `unit-${idx}`,
                    type: unit.typeHe || unit.type || "יחידה",
                    bedrooms: unit.bedrooms != null && unit.bedrooms !== ""
                              ? (parseInt(String(unit.bedrooms)) || 0)
                              : (unit.type?.includes("Studio") || unit.type?.includes("סטודיו") ? 0 :
                                parseInt(unit.type?.match(/\d+/)?.[0] || "1") || 1),
                    size: unit.sizeFrom || (typeof unit.size === "string" ? parseInt(unit.size.replace(/[^0-9]/g, "")) : 0) || 0,
                    price: unit.priceFrom || (typeof unit.price === "string" ? parseInt(unit.price.replace(/[^0-9]/g, "")) : 0) || 0,
                    isAvailable: unit.status !== "sold",
                    floor: unit.floor,
                    view: unit.view,
                  }))}
                  onUnitInterest={(unit) => {
                    scrollToSection("property-contact");
                  }}
                  className="px-0"
                />
              </section>
            )}

            {/* Payment Plan Section */}
            {paymentPlan && paymentPlan.length > 0 && (
              <section id="payment" ref={(el) => (sectionRefs.current["payment"] = el)} data-testid="section-payment">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Wallet className="h-6 w-6 text-primary" />
                    תכנית תשלומים
                  </h2>
                  <Card className="p-6">
                    <div className="space-y-6">
                      {paymentPlan.map((milestone, idx) => {
                        const cumulativePercentage = paymentPlan
                          .slice(0, idx + 1)
                          .reduce((sum, m) => sum + (m.percentage || 0), 0);
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xl font-bold text-primary">{milestone.percentage}%</span>
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-foreground text-xl md:text-2xl">{milestone.milestone}</div>
                                {milestone.description && (
                                  <div className="text-muted-foreground mt-1 text-base">{milestone.description}</div>
                                )}
                                <div className="mt-3">
                                  <Progress value={cumulativePercentage} className="h-2" />
                                  <div className="text-xs text-muted-foreground mt-1 text-left">{cumulativePercentage}% סה"כ</div>
                                </div>
                              </div>
                            </div>
                            {idx < paymentPlan.length - 1 && (
                              <div className="absolute top-16 right-8 w-px h-8 bg-border" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Gallery Section */}
            {gallery.length > 0 && (
              <section id="gallery" ref={(el) => (sectionRefs.current["gallery"] = el)} data-testid="section-gallery">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Sparkles className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-foreground">גלריית הפרויקט</h2>
                        <p className="text-muted-foreground">{gallery.length} תמונות מהברושור</p>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="masonry" className="w-full">
                    <TabsList className="bg-muted/50 mb-4">
                      <TabsTrigger value="masonry" data-testid="tab-gallery-masonry" className="text-xs">תצוגה מתקדמת</TabsTrigger>
                      <TabsTrigger value="carousel" data-testid="tab-gallery-carousel" className="text-xs">קרוסלה</TabsTrigger>
                    </TabsList>

                    <TabsContent value="masonry" className="mt-0">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {gallery.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="col-span-2 row-span-2"
                          >
                            <div
                              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-xl"
                              onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                              data-testid="gallery-featured"
                            >
                              <OptimizedImage
                                src={gallery[0].url || ""}
                                alt={gallery[0].alt || `${project.name} - תמונה ראשית`}
                                observerLazy
                                rootMargin="200px"
                                className="transition-transform duration-700 group-hover:scale-110"
                                wrapperClassName="w-full h-full"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <div className="absolute bottom-4 right-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Badge className="bg-white/90 text-gray-900 border-0">
                                  <Sparkles className="h-3 w-3 ml-1" />
                                  תמונה ראשית
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {gallery.slice(1).map((item, idx) => (
                          <motion.div
                            key={idx + 1}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: (idx + 1) * 0.05 }}
                          >
                            <div
                              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={() => { setLightboxIndex(idx + 1); setLightboxOpen(true); }}
                              data-testid={`gallery-item-${idx + 1}`}
                            >
                              <OptimizedImage
                                src={item.url || ""}
                                alt={item.alt || `${project.name} - תמונה ${idx + 2}`}
                                observerLazy
                                rootMargin="100px"
                                className="transition-transform duration-500 group-hover:scale-110"
                                wrapperClassName="w-full h-full"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                  <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex justify-center mt-6">
                        <Button variant="outline" onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }} className="gap-2">
                          <Sparkles className="h-4 w-4" />
                          צפה בכל {gallery.length} התמונות
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="carousel" className="mt-0">
                      <Carousel opts={{ direction: "rtl" }} className="w-full">
                        <CarouselContent className="-ml-4">
                          {gallery.map((item, idx) => (
                            <CarouselItem key={idx} className="pl-4 md:basis-1/2 lg:basis-1/3">
                              <div
                                className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group shadow-lg"
                                onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                                data-testid={`gallery-carousel-${idx}`}
                              >
                                <OptimizedImage
                                  src={item.url || ""}
                                  alt={item.alt || `תמונה ${idx + 1}`}
                                  observerLazy
                                  className="transition-transform duration-500 group-hover:scale-105"
                                  wrapperClassName="w-full h-full"
                                />
                                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                                  {idx + 1} / {gallery.length}
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="right-2" />
                        <CarouselNext className="left-2" />
                      </Carousel>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </section>
            )}

            {/* Location Intelligence Section */}
            {(neighborhood || project.location) && (
              <section id="location" ref={(el) => (sectionRefs.current["location"] = el)} data-testid="section-location">
                <PropertyLocationIntelligence
                  locationName={project.location || "דובאי"}
                  demand="high"
                  coordinates={project.coordinates ? [(project.coordinates as any).lat, (project.coordinates as any).lng] : undefined}
                  nearbyPOIs={neighborhood?.nearbyPlaces
                    ?.filter((place) => place.name && place.distance)
                    .slice(0, 4)
                    .map((place) => ({
                      name: place.name!,
                      distance: place.distance!,
                      type: (place.type as "landmark" | "transport" | "shopping" | "education" | "medical" | "beach" | "restaurant" | "park") || "landmark",
                    }))}
                  transportLinks={["מטרו דובאי", "קו RTA"]}
                  className="px-0"
                />
              </section>
            )}

            {/* FAQ Section */}
            {faqs && faqs.length > 0 && (
              <section id="faq" data-testid="section-faq">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">שאלות נפוצות</h2>
                      <p className="text-muted-foreground">תשובות לשאלות הנפוצות ביותר</p>
                    </div>
                  </div>

                  <Card className="overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl">
                    <div className="divide-y divide-white/10">
                      {faqs.map((faq, idx) => (
                        <FAQItem key={idx} question={faq.question} answer={faq.answer} index={idx} />
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </section>
            )}
            {/* Project Status & Construction Progress */}
            {(project.projectStatus || (project.constructionProgress != null && project.constructionProgress > 0)) && (
              <section data-testid="section-status">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                      <HardHat className="h-7 w-7 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">סטטוס הפרויקט</h2>
                      <p className="text-muted-foreground">מצב הבנייה והתקדמות</p>
                    </div>
                  </div>
                  <Card className="overflow-hidden border border-blue-500/20 shadow-xl bg-gradient-to-br from-blue-500/[0.03] to-transparent backdrop-blur-xl">
                    <div className="p-8 space-y-6">
                      {project.projectStatus && (
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-sm">סטטוס:</span>
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {project.projectStatus === 'off-plan' ? 'טרום בנייה' :
                             project.projectStatus === 'under-construction' ? 'בבנייה' :
                             project.projectStatus === 'ready-to-move' ? 'מוכן לאכלוס' :
                             project.projectStatus === 'completed' ? 'הושלם' : String(project.projectStatus)}
                          </Badge>
                        </div>
                      )}
                      {project.constructionProgress != null && project.constructionProgress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">התקדמות בנייה</span>
                            <span className="text-foreground font-bold">{project.constructionProgress}%</span>
                          </div>
                          <Progress value={project.constructionProgress} className="h-3" />
                        </div>
                      )}
                      {project.launchDate && (
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span className="text-muted-foreground text-sm">תאריך השקה:</span>
                          <span className="text-foreground font-medium">{String(project.launchDate)}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Property Specifications */}
            {(project.ownership || project.furnishing || project.serviceCharge || project.numberOfBuildings) && (
              <section data-testid="section-specs">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                      <Layers className="h-7 w-7 text-purple-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">מפרט הנכס</h2>
                      <p className="text-muted-foreground">פרטים טכניים ומאפיינים</p>
                    </div>
                  </div>
                  <Card className="overflow-hidden border border-purple-500/20 shadow-xl bg-gradient-to-br from-purple-500/[0.03] to-transparent backdrop-blur-xl">
                    <div className="p-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {project.ownership && (
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                            <Shield className="h-6 w-6 text-purple-400 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">סוג בעלות</div>
                              <div className="text-foreground font-bold">
                                {project.ownership === 'freehold' ? 'בעלות מלאה (Freehold)' :
                                 project.ownership === 'leasehold' ? 'חכירה (Leasehold)' : String(project.ownership)}
                              </div>
                            </div>
                          </div>
                        )}
                        {project.furnishing && (
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                            <Sofa className="h-6 w-6 text-purple-400 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ריהוט</div>
                              <div className="text-foreground font-bold">
                                {project.furnishing === 'furnished' ? 'מרוהט' :
                                 project.furnishing === 'semi-furnished' ? 'מרוהט חלקית' :
                                 project.furnishing === 'unfurnished' ? 'ללא ריהוט' :
                                 project.furnishing === 'shell-core' ? 'שלד וליבה' : String(project.furnishing)}
                              </div>
                            </div>
                          </div>
                        )}
                        {project.serviceCharge && (
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                            <Wallet className="h-6 w-6 text-purple-400 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">דמי ניהול</div>
                              <div className="text-foreground font-bold" dir="ltr">{String(project.serviceCharge)} AED/sqft</div>
                            </div>
                          </div>
                        )}
                        {project.numberOfBuildings != null && project.numberOfBuildings > 0 && (
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                            <Building2 className="h-6 w-6 text-purple-400 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">מספר בניינים</div>
                              <div className="text-foreground font-bold">{project.numberOfBuildings}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Commission & Agent Info */}
            {project.commissionPercent && (
              <section data-testid="section-commission">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <Card className="overflow-hidden border border-amber-500/20 shadow-xl bg-gradient-to-br from-amber-500/[0.03] to-transparent backdrop-blur-xl">
                    <div className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Percent className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">עמלת סוכן</div>
                        <div className="text-foreground font-bold text-xl" dir="ltr">{String(project.commissionPercent)}%</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Regulatory Details - RERA & DLD */}
            {(project.reraNumber || project.dldNumber) && (
              <section data-testid="section-regulatory">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                      <Shield className="h-7 w-7 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">פרטים רגולטוריים</h2>
                      <p className="text-muted-foreground">אישורים ורישיונות רשמיים</p>
                    </div>
                  </div>
                  <Card className="overflow-hidden border border-emerald-500/20 shadow-xl bg-gradient-to-br from-emerald-500/[0.03] to-transparent backdrop-blur-xl">
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.reraNumber && (
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                              <Check className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">RERA Registration</div>
                              <div className="text-foreground font-bold text-lg" dir="ltr">{String(project.reraNumber)}</div>
                            </div>
                          </div>
                        )}
                        {project.dldNumber && (
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">DLD Permit</div>
                              <div className="text-foreground font-bold text-lg" dir="ltr">{String(project.dldNumber)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Video */}
            {project.videoUrl && (
              <section data-testid="section-video">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <Card className="overflow-hidden border border-white/10 shadow-xl">
                    <a
                      href={String(project.videoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Play className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground font-bold">צפו בסרטון הפרויקט</div>
                        <div className="text-muted-foreground text-sm">לחצו לצפייה</div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </a>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Brochure Download */}
            {project.brochureUrl && (
              <section data-testid="section-brochure">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <Card className="overflow-hidden border border-white/10 shadow-xl">
                    <a
                      href={String(project.brochureUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Download className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground font-bold">הורידו את הברושור</div>
                        <div className="text-muted-foreground text-sm">PDF עם כל פרטי הפרויקט</div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </a>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Google Maps Link */}
            {project.googleMapsUrl && (
              <section data-testid="section-map-link">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <Card className="overflow-hidden border border-white/10 shadow-xl">
                    <a
                      href={String(project.googleMapsUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Map className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground font-bold">מיקום במפות גוגל</div>
                        <div className="text-muted-foreground text-sm">לחצו לניווט</div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </a>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Tags */}
            {Array.isArray(project.tags) && (project.tags as string[]).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-wrap gap-2">
                {(project.tags as string[]).map((tag: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    <Tag className="h-3 w-3 ml-1" />
                    {tag}
                  </Badge>
                ))}
              </motion.div>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 space-y-6"
              id="contact"
              ref={(el) => (sectionRefs.current["contact"] = el)}
              data-testid="section-contact-sidebar"
            >
              <PropertyContactForm projectName={project.name} projectId={project.id} />

              <Card className="p-4 bg-muted/50">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">או התקשרו ישירות</p>
                  <a
                    href="tel:+972508896702"
                    className="flex items-center justify-center gap-2 text-primary font-semibold hover:underline"
                    data-testid="link-call-direct"
                  >
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">+972 50-889-6702</span>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <PropertyContactCTA
        propertyId={project.id}
        propertyName={project.name}
        unitsRemaining={unitsRemaining}
      />

      {/* Floating Contact Buttons */}
      <FloatingContactButtons
        phoneNumber="+972508896702"
        whatsappMessage={`היי, אני מתעניין בפרויקט ${project.name} ואשמח לקבל פרטים נוספים.`}
      />

      {/* Mobile CTA - Enhanced */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {hasValidPrice && (
              <div>
                <p className="text-xs text-muted-foreground">החל מ-</p>
                <p className="text-lg font-bold gradient-text-gold">
                  {formatPrice(project.priceFrom, project.priceCurrency || "AED")}
                </p>
              </div>
            )}
            {!hasValidPrice && project.completionDate && (
              <div>
                <p className="text-xs text-muted-foreground">מסירה צפויה</p>
                <p className="text-lg font-bold text-white/90">{project.completionDate}</p>
              </div>
            )}
          </div>
          <Button
            className="luxury-button h-12 px-6"
            onClick={() => scrollToSection("property-contact")}
            data-testid="button-mobile-contact"
          >
            <Phone className="h-4 w-4 ml-2" />
            קבל הצעת מחיר
          </Button>
        </div>
      </div>

      {/* Bottom padding for mobile CTA */}
      <div className="lg:hidden h-20" />

      {/* Exit Intent Popup */}
      <ExitIntentPopup propertyName={project.name} />
    </div>
  );
}
