import { useState, type ElementType } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { 
  Loader2, MapPin, Phone, ArrowLeft, Building2, 
  TrendingUp, Calendar, CheckCircle2, ChevronDown,
  Sparkles, Shield, DollarSign, Layers, Car, Eye, Award,
  Users, Clock, Navigation, Percent, Home, Waves, Dumbbell,
  Baby, TreePine, Flame, Film, Zap, Heart, Bell, Smartphone,
  ChevronRight, MessageCircle, Star, Crown, Gem, Coffee,
  Utensils, Sun, Moon, Wifi, Lock, Camera, Music,
  Palette, Droplets, Wind, Thermometer, PlayCircle,
  Download, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MiniSite, Project } from "@shared/schema";
import ddlLogo from "@assets/ddl_logo_1768141898381.png";

const iconMap: Record<string, ElementType> = {
  Building2, TrendingUp, Calendar, Layers, DollarSign, Eye, Award, Users, Clock,
  Waves, Dumbbell, Shield, Car, TreePine, Baby, Flame, Film, Zap, Heart, Bell,
  Smartphone, Home, Sparkles, CheckCircle2, MapPin, Navigation, Percent, Star,
  Crown, Gem, Coffee, Utensils, Sun, Moon, Wifi, Lock, Camera, Music,
  Palette, Droplets, Wind, Thermometer, PlayCircle
};

const getIcon = (iconName?: string): ElementType => {
  if (!iconName) return CheckCircle2;
  return iconMap[iconName] || CheckCircle2;
};

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true }
};

const staggerItem = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

interface MiniSiteHero {
  title?: string;
  subtitle?: string;
  image?: string;
}

interface MiniSiteAbout {
  title?: string;
  content?: string;
}

interface MiniSiteFeature {
  title?: string;
  description?: string;
  icon?: string;
}

interface MiniSitePricingItem {
  name?: string;
  price?: string;
  details?: string;
}

interface MiniSitePricing {
  title?: string;
  items?: MiniSitePricingItem[];
}

interface MiniSiteLocation {
  address?: string;
}

interface MiniSiteContact {
  phone?: string;
  email?: string;
  whatsapp?: string;
  form?: boolean;
}

// Fallback luxury stock images (only used if no real images available)
const CDN = "https://cdn.ddl-uae.com/gallery/mbp-bc-all-assets/mbp-bc-project-images";
const FALLBACK_IMAGES = {
  hero: `${CDN}/Exterior%20Images/25006_aerialNight_shot%20-Final-Full.jpg`,
  exterior: `${CDN}/Exterior%20Images/250850_Binghatti_MasterCommunity_View07.jpg`,
  interior: `${CDN}/Interior%20Images/Living/Living_%20CAM01%20DAY%20JPEG.jpg`,
  kitchen: `${CDN}/Interior%20Images/Kitchen/Kitchen-P1-002_Post%20copy00.jpg`,
  pool: `${CDN}/Exterior%20Images/250850_Binghatti_MasterCommunity_View06.jpg`,
  gym: `${CDN}/Exterior%20Images/250850_Binghatti_MasterCommunity_View09.jpg`,
  cinema: `${CDN}/Interior%20Images/Living/Living_%20CAM01%20Night%20JPEG.jpg`,
  garden: `${CDN}/Exterior%20Images/250850_Binghatti_MasterCommunity_View10.jpg`,
  kids: `${CDN}/Exterior%20Images/25006_Blue_Semi_Bird.jpg`,
  bbq: `${CDN}/Exterior%20Images/25006_Street%20Shot.jpg`,
  lobby: `${CDN}/Interior%20Images/Lobby/LOBBY_DAY%20REV02%2001%20JPEG.jpg`,
  smartHome: `${CDN}/Interior%20Images/Living/Bedroom_Cam01.jpg`,
  location: `${CDN}/Exterior%20Images/25006_aerial%20shot-fog-logo.jpg`,
};

// Classified image type from manifest
interface ClassifiedImage {
  url: string;
  category: string;
  subcategory?: string;
  role: string;
  quality: string;
  description: string;
  descriptionHe?: string;
  alt: string;
}

// Image manifest structure from PDF processing
interface ImageManifest {
  hero: ClassifiedImage | null;
  exterior: ClassifiedImage[];
  interiors: {
    living: ClassifiedImage[];
    bedroom: ClassifiedImage[];
    kitchen: ClassifiedImage[];
    bathroom: ClassifiedImage[];
  };
  amenities: {
    podium: ClassifiedImage[];
    rooftop: ClassifiedImage[];
    special: ClassifiedImage[];
  };
  floorPlans: ClassifiedImage[];
  locationMaps: ClassifiedImage[];
  lifestyle: ClassifiedImage[];
  gallery: ClassifiedImage[];
}

// Helper to get image with fallback
function getImage(manifest: ImageManifest | null, section: string, fallback: string): string {
  if (!manifest) return fallback;

  switch (section) {
    case "hero":
      return manifest.hero?.url || fallback;
    case "exterior":
      return manifest.exterior[0]?.url || manifest.hero?.url || fallback;
    case "interior":
    case "living":
      return manifest.interiors.living[0]?.url || fallback;
    case "kitchen":
      return manifest.interiors.kitchen[0]?.url || fallback;
    case "bedroom":
      return manifest.interiors.bedroom[0]?.url || fallback;
    case "pool":
      return manifest.amenities.podium.find(img => img.category === "amenity_pool")?.url ||
             manifest.amenities.podium[0]?.url || fallback;
    case "gym":
      return manifest.amenities.podium.find(img => img.category === "amenity_gym")?.url || fallback;
    case "rooftop":
      return manifest.amenities.rooftop[0]?.url || fallback;
    case "garden":
      return manifest.amenities.podium.find(img => img.category === "amenity_garden")?.url || fallback;
    case "kids":
      return manifest.amenities.podium.find(img => img.category === "amenity_kids")?.url || fallback;
    case "lobby":
      return manifest.interiors.living[0]?.url || fallback;
    case "location":
      return manifest.locationMaps[0]?.url || fallback;
    default:
      return manifest.gallery[0]?.url || fallback;
  }
}

// Get array of images for gallery sections
function getImages(manifest: ImageManifest | null, section: string, limit: number = 6): string[] {
  if (!manifest) return [];

  let images: ClassifiedImage[] = [];
  switch (section) {
    case "exterior":
      images = manifest.exterior;
      break;
    case "interior":
      images = [...manifest.interiors.living, ...manifest.interiors.bedroom, ...manifest.interiors.kitchen];
      break;
    case "amenities_podium":
      images = manifest.amenities.podium;
      break;
    case "amenities_rooftop":
      images = manifest.amenities.rooftop;
      break;
    case "amenities":
      images = [...manifest.amenities.podium, ...manifest.amenities.rooftop, ...manifest.amenities.special];
      break;
    case "floor_plans":
      images = manifest.floorPlans;
      break;
    case "gallery":
    default:
      images = manifest.gallery;
  }
  return images.slice(0, limit).map(img => img.url);
}

// Amenity category icons and styling
const amenityCategoryConfig: Record<string, { icon: ElementType; color: string; label: string }> = {
  wellness: { icon: Dumbbell, color: "from-emerald-400 to-emerald-600", label: "בריאות וספורט" },
  leisure: { icon: Waves, color: "from-blue-400 to-blue-600", label: "פנאי ובידור" },
  kids: { icon: Baby, color: "from-pink-400 to-pink-600", label: "לילדים" },
  outdoor: { icon: TreePine, color: "from-green-400 to-green-600", label: "שטחים פתוחים" },
  smart: { icon: Smartphone, color: "from-purple-400 to-purple-600", label: "בית חכם" },
  convenience: { icon: Coffee, color: "from-orange-400 to-orange-600", label: "נוחות ושירותים" },
  security: { icon: Shield, color: "from-slate-400 to-slate-600", label: "ביטחון" },
  other: { icon: Sparkles, color: "from-amber-400 to-amber-600", label: "מתקנים נוספים" }
};

// Parse features into categorized amenities
function categorizeFeatures(features: MiniSiteFeature[]): Record<string, MiniSiteFeature[]> {
  const categories: Record<string, MiniSiteFeature[]> = {};
  
  features.forEach(feature => {
    const category = feature.description || "other";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(feature);
  });
  
  return categories;
}

// Separate podium vs rooftop amenities based on keywords
function separateAmenityLevels(features: MiniSiteFeature[]): { podium: MiniSiteFeature[]; rooftop: MiniSiteFeature[]; other: MiniSiteFeature[] } {
  const podiumKeywords = ["pool", "jacuzzi", "fitness", "yoga", "splash", "sunken", "swimming", "court", "barbecue", "bbq"];
  const rooftopKeywords = ["rooftop", "cinema", "zen", "lap pool", "lounge", "skyline"];
  
  const podium: MiniSiteFeature[] = [];
  const rooftop: MiniSiteFeature[] = [];
  const other: MiniSiteFeature[] = [];
  
  features.forEach(feature => {
    const title = (feature.title || "").toLowerCase();
    if (rooftopKeywords.some(k => title.includes(k))) {
      rooftop.push(feature);
    } else if (podiumKeywords.some(k => title.includes(k))) {
      podium.push(feature);
    } else {
      other.push(feature);
    }
  });
  
  return { podium, rooftop, other };
}

// Extract key features from the content
function extractKeyFeatures(content: string): string[] {
  const keyFeaturePatterns = [
    /metro/i, /lobby/i, /ev charging/i, /glass panel/i, /wardrobe/i,
    /porcelain/i, /european/i, /elevator/i, /facade/i, /smart home/i,
    /alexa/i, /appliance/i
  ];
  
  const features: string[] = [];
  const sentences = content.split(/[.•\n]/);
  
  sentences.forEach(sentence => {
    if (keyFeaturePatterns.some(p => p.test(sentence)) && sentence.trim().length > 10 && sentence.trim().length < 100) {
      features.push(sentence.trim());
    }
  });
  
  return features.slice(0, 12);
}

function DeveloperLogo({ logoUrl, developerName }: { logoUrl?: string | null; developerName: string }) {
  const [logoFailed, setLogoFailed] = useState(false);

  if (!logoUrl || logoFailed) {
    return (
      <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
        <Crown className="h-10 w-10 text-slate-900" />
      </div>
    );
  }

  return (
    <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center p-3">
      <img
        src={logoUrl}
        alt={developerName}
        className="max-w-full max-h-full object-contain"
        loading="lazy"
        decoding="async"
        onError={() => setLogoFailed(true)}
      />
    </div>
  );
}

// Section component for consistent styling
function Section({ 
  children, 
  className = "", 
  id,
  dark = false,
  gradient = false
}: { 
  children: React.ReactNode; 
  className?: string; 
  id?: string;
  dark?: boolean;
  gradient?: boolean;
}) {
  return (
    <section 
      id={id}
      className={`py-20 md:py-28 relative ${dark ? "bg-slate-900" : "bg-slate-800"} ${className}`}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-amber-900/10" />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ 
  badge, 
  title, 
  subtitle,
  icon: Icon
}: { 
  badge?: string; 
  title: string; 
  subtitle?: string;
  icon?: ElementType;
}) {
  return (
    <motion.div {...fadeInUp} className="text-center mb-16">
      {badge && (
        <Badge className="mb-4 bg-amber-400/20 text-amber-300 border-amber-400/30 px-4 py-1">
          {Icon && <Icon className="h-4 w-4 ml-2" />}
          {badge}
        </Badge>
      )}
      <h2 className="text-3xl md:text-5xl font-bold text-white">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-lg md:text-xl text-white/60 max-w-3xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`bg-white/5 backdrop-blur-xl border-white/10 ${className}`}>
      {children}
    </Card>
  );
}

export default function MiniSitePage() {
  const params = useParams();
  const slug = params.slug;
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  const { data: miniSite, isLoading: miniSiteLoading } = useQuery<MiniSite>({
    queryKey: ["/api/mini-sites/slug", slug],
    queryFn: async () => {
      const res = await fetch(`/api/mini-sites/slug/${slug}`);
      if (!res.ok) throw new Error("Mini-site not found");
      const json = await res.json();
      return json.data || json;
    },
    enabled: !!slug,
  });

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", miniSite?.projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${miniSite?.projectId}`);
      if (!res.ok) throw new Error("Project not found");
      const json = await res.json();
      return json.data || json;
    },
    enabled: !!miniSite?.projectId,
  });

  const isLoading = miniSiteLoading || (miniSite?.projectId && projectLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="w-16 h-16 rounded-full bg-amber-400/30" />
            </div>
            <Loader2 className="h-16 w-16 animate-spin text-amber-400 relative" />
          </div>
          <p className="mt-4 text-white/70">טוען...</p>
        </motion.div>
      </div>
    );
  }

  if (!miniSite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 px-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">הדף לא נמצא</h1>
          <p className="text-white/60 max-w-md">המיני-סייט המבוקש אינו קיים או שהכתובת שגויה</p>
          <Button onClick={() => window.location.href = "/"} className="bg-amber-400 text-slate-900 font-semibold" data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4 ml-2" />
            חזרה לדף הבית
          </Button>
        </motion.div>
      </div>
    );
  }

  // Extract data from mini-site
  const hero = miniSite.hero as MiniSiteHero | null;
  const about = miniSite.about as MiniSiteAbout | null;
  const features = (miniSite.features as MiniSiteFeature[] | null) || [];
  const pricing = miniSite.pricing as MiniSitePricing | null;
  const location = miniSite.location as MiniSiteLocation | null;
  const contact = miniSite.contact as MiniSiteContact | null;

  // Prepare phone number for WhatsApp and tel links (remove non-digits, ensure proper format)
  const getPhoneForLinks = (phone?: string): string => {
    if (!phone) return "";
    // Remove all non-digit characters except leading +
    return phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  };

  const phoneNumber = getPhoneForLinks(contact?.whatsapp || contact?.phone);
  const hasPhoneNumber = !!phoneNumber;

  // Get AI-classified image manifest (if available)
  const imageManifest = (miniSite as Record<string, unknown>).imageManifest as ImageManifest | null;
  const hasRealImages = imageManifest && (imageManifest.hero || imageManifest.gallery.length > 0);

  // Derived data
  const projectName = hero?.title || miniSite.name;
  const developerMatch = (hero?.subtitle || "").match(/(?:מאת|By)\s+(.+)/i);
  const developerName = developerMatch ? developerMatch[1] : "IKR Development";
  const aboutContent = about?.content || "";
  // Use classified hero image, then hero.image from mini-site, then fallback
  const heroImage = getImage(imageManifest, "hero", hero?.image || FALLBACK_IMAGES.hero);
  
  // Parse content for sections
  const categorizedAmenities = categorizeFeatures(features);
  const { podium: podiumAmenities, rooftop: rooftopAmenities, other: otherAmenities } = separateAmenityLevels(features);
  const keyFeatures = extractKeyFeatures(aboutContent);
  const unitTypes = pricing?.items || [];

  // Extract paragraphs from about content for different sections
  const paragraphs = aboutContent.split("\n\n").filter(p => p.trim().length > 50);
  const introText = paragraphs[0] || "";
  const architectureText = paragraphs.find(p => /architect|french|design/i.test(p)) || "";
  const communityText = paragraphs.find(p => /community|JVC|Jumeirah Village/i.test(p)) || "";
  const interiorText = paragraphs.find(p => /interior|kitchen|finish/i.test(p)) || "";
  const smartText = paragraphs.find(p => /smart|alexa|technology/i.test(p)) || "";
  const developerText = paragraphs.find(p => /IKR|developer|legacy/i.test(p)) || "";

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white" dir="rtl">
      
      {/* ========== 1. HERO SECTION ========== */}
      <section className="relative h-screen overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src={heroImage}
            alt={`${projectName} - תמונת הירו של פרויקט נדל״ן יוקרתי בדובאי`}
            fallbackSrc={FALLBACK_IMAGES.hero}
            priority
            blurUp
            wrapperClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900" />
        </motion.div>

        <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Badge className="mb-6 bg-amber-400/20 text-amber-300 border-amber-400/30 px-6 py-2 text-sm">
              <Crown className="h-4 w-4 ml-2" />
              {developerName}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            <span className="bg-gradient-to-l from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              {projectName}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-2xl md:text-3xl text-white/80 font-light mb-4"
          >
            {hero?.subtitle || project?.tagline || project?.taglineEn || "Discover the New Luxury"}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-lg text-white/60 mb-12"
          >
            {location?.address || "Dubai"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button 
              size="lg" 
              onClick={scrollToContact}
              className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold text-lg px-8 shadow-2xl shadow-amber-400/30"
              data-testid="button-hero-cta"
            >
              קבלו פרטים
              <ChevronRight className="h-5 w-5 mr-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white bg-white/10 backdrop-blur-sm"
              onClick={() => document.getElementById("units")?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-hero-units"
            >
              צפו ביחידות
            </Button>
            {project?.brochureUrl && (
              <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-amber-400/30 text-amber-300 bg-amber-400/10 backdrop-blur-sm w-full sm:w-auto"
                  data-testid="button-hero-brochure"
                >
                  <Download className="h-5 w-5 ml-2" />
                  הורדת ברושור
                </Button>
              </a>
            )}
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-8 w-8 text-amber-400" />
        </motion.div>
      </section>

      {/* ========== 2. INTRODUCTION - Discover the New Luxury ========== */}
      <Section gradient>
        <SectionTitle 
          badge="גלו את היוקרה החדשה"
          title="חוויית מגורים ברמה אחרת"
          icon={Gem}
        />
        
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <GlassCard className="p-8 md:p-12">
            <p className="text-lg md:text-xl text-white/80 leading-relaxed text-center">
              {introText || `חוו את פסגת היוקרה ב-${projectName}, ממוקם באזור היוקרתי של ${location?.address || "דובאי"}. 
              התענגו על דירות מודרניות ומפוארות עם מתקנים חדישים ועיצוב מרהיב, המגדירים מחדש את הסופיסטיקציה העירונית.`}
            </p>
          </GlassCard>
        </motion.div>

        {/* Unit type badges */}
        {unitTypes.length > 0 && (
          <motion.div 
            {...fadeInUp} 
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            {unitTypes.map((unit, idx) => (
              <Badge 
                key={idx}
                className="bg-white/10 text-white border-white/20 px-6 py-3 text-lg"
              >
                <Home className="h-5 w-5 ml-2 text-amber-400" />
                {unit.name}
                {unit.details && <span className="text-white/50 mr-2">| {unit.details}</span>}
              </Badge>
            ))}
          </motion.div>
        )}
      </Section>

      {/* ========== 3. ARCHITECTURAL CONCEPT - A French Connection ========== */}
      {architectureText && (
        <Section dark>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <Badge className="mb-4 bg-amber-400/20 text-amber-300 border-amber-400/30">
                <Palette className="h-4 w-4 ml-2" />
                קונספט אדריכלי
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                A French Connection
              </h2>
              <p className="text-lg text-white/70 leading-relaxed">
                {architectureText}
              </p>
            </motion.div>
            
            <motion.div {...fadeInUp} className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <OptimizedImage
                  src={getImage(imageManifest, "exterior", FALLBACK_IMAGES.exterior)}
                  alt="עיצוב אדריכלי - חזית הבניין היוקרתי"
                  fallbackSrc={FALLBACK_IMAGES.exterior}
                  observerLazy
                  wrapperClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-6 right-6 left-6">
                <GlassCard className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <Award className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">אדריכל עטור פרסים</div>
                    <div className="text-white/60 text-sm">עיצוב צרפתי מקורי</div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          </div>
        </Section>
      )}

      {/* ========== 4. DEVELOPER SECTION ========== */}
      <Section gradient>
        <SectionTitle 
          badge="אודות היזם"
          title={developerName}
          icon={Building2}
        />
        
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <GlassCard className="p-8 md:p-12 text-center">
            <DeveloperLogo
              logoUrl={project?.developerLogo}
              developerName={developerName}
            />
            <p className="text-lg text-white/80 leading-relaxed">
              {developerText || `${developerName} היא חברת בנייה מובילה בדובאי עם מורשת עשירה של עשרות שנים של ניסיון בביצוע פרויקטים למגורים ומסחר. 
              החברה מתמקדת באיכות פרימיום, עיצובים חדשניים, שיטות בנייה בנות-קיימא, מלאכת יד מעולה וניהול פרויקטים יעיל.`}
            </p>
            {project?.brochureUrl && (
              <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-8">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold"
                  data-testid="button-developer-brochure"
                >
                  <FileText className="h-5 w-5 ml-2" />
                  הורדת ברושור הפרויקט
                </Button>
              </a>
            )}
          </GlassCard>
        </motion.div>
      </Section>

      {/* ========== 5. UNIQUE FEATURE - Private Plunge Pool ========== */}
      <Section dark>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeInUp} className="order-2 md:order-1">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <OptimizedImage
                src={getImage(imageManifest, "pool", FALLBACK_IMAGES.interior)}
                alt="בריכה פרטית - מרפסת עם נוף מרהיב"
                fallbackSrc={FALLBACK_IMAGES.interior}
                observerLazy
                wrapperClassName="w-full h-full"
              />
            </div>
          </motion.div>
          
          <motion.div {...fadeInUp} className="order-1 md:order-2">
            <Badge className="mb-4 bg-amber-400/20 text-amber-300 border-amber-400/30">
              <Waves className="h-4 w-4 ml-2" />
              פיצ'ר ייחודי
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Private Plunge Pool
            </h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              דירות נבחרות מציעות בריכה או ג'קוזי פרטי על המרפסת - יצירת נאות אישית שבה מפגש הרגיעה עם היוקרה.
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge className="bg-white/10 text-white px-4 py-2">
                <Waves className="h-4 w-4 ml-2 text-amber-400" />
                בריכה פרטית
              </Badge>
              <Badge className="bg-white/10 text-white px-4 py-2">
                <Sun className="h-4 w-4 ml-2 text-amber-400" />
                מרפסת מרווחת
              </Badge>
              <Badge className="bg-white/10 text-white px-4 py-2">
                <Eye className="h-4 w-4 ml-2 text-amber-400" />
                נוף פנורמי
              </Badge>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ========== 6. DESIGN PHILOSOPHY ========== */}
      <Section gradient>
        <SectionTitle
          badge="פילוסופיית עיצוב"
          title={project?.taglineEn || "Designed for Luxury"}
          subtitle="כל פרט עוצב בקפידה להעניק חוויית מגורים יוקרתית ללא פשרות"
          icon={Gem}
        />
        
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: "גימור יוקרתי", desc: "חומרי גמר מהשורה הראשונה מאירופה" },
            { icon: Palette, title: "עיצוב אלגנטי", desc: "שילוב מושלם של אסתטיקה ופונקציונליות" },
            { icon: Award, title: "איכות ללא פשרות", desc: "סטנדרטים בינלאומיים בכל פרט" }
          ].map((item, idx) => (
            <motion.div key={idx} variants={staggerItem}>
              <GlassCard className="p-8 text-center h-full hover:bg-white/10 transition-all">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ========== 7. COMMUNITY & AREA ========== */}
      {communityText && (
        <Section dark>
          <SectionTitle 
            badge="הקהילה"
            title="The Perfect Community"
            subtitle="JVC - קהילה משפחתית ייחודית בלב דובאי"
            icon={Users}
          />
          
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
            <GlassCard className="p-8 md:p-12">
              <p className="text-lg text-white/80 leading-relaxed text-center">
                {communityText}
              </p>
            </GlassCard>
          </motion.div>
        </Section>
      )}

      {/* ========== 8. LOCATION & CONNECTIVITY ========== */}
      <Section gradient id="location">
        <SectionTitle 
          badge="מיקום"
          title="Location & Connectivity"
          subtitle={location?.address}
          icon={MapPin}
        />
        
        <motion.div {...fadeInUp} className="grid md:grid-cols-2 gap-8">
          {/* Map placeholder */}
          <GlassCard className="aspect-[4/3] overflow-hidden">
            <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-50" style={{
                backgroundImage: `url('${getImage(imageManifest, "location", FALLBACK_IMAGES.location)}')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }} />
              <div className="relative z-10 text-center">
                <MapPin className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <p className="text-white text-xl font-semibold">{location?.address || "Jumeirah Village Circle"}</p>
              </div>
            </div>
          </GlassCard>

          {/* Travel times */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">זמני נסיעה</h3>
            {[
              { dest: "Downtown Dubai", time: "15 min" },
              { dest: "Dubai Marina", time: "12 min" },
              { dest: "Dubai Mall", time: "15 min" },
              { dest: "DXB Airport", time: "25 min" },
              { dest: "Mall of Emirates", time: "10 min" },
              { dest: "Burj Al Arab", time: "15 min" }
            ].map((item, idx) => (
              <motion.div key={idx} variants={staggerItem} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
                <GlassCard className="p-4 flex items-center justify-between hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-amber-400" />
                    <span className="text-white">{item.dest}</span>
                  </div>
                  <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30">
                    <Clock className="h-3 w-3 ml-1" />
                    {item.time}
                  </Badge>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ========== 9. INTERIOR EXPERIENCE ========== */}
      <Section dark>
        <SectionTitle 
          badge="חוויית פנים"
          title="Luxury in Every Detail"
          icon={Sparkles}
        />
        
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
          {[
            { title: "לובי מעוצב", desc: "כניסה מרשימה עם עיצוב יוקרתי", img: getImage(imageManifest, "lobby", FALLBACK_IMAGES.lobby) },
            { title: "חללים משותפים", desc: "אזורים משותפים ברמה גבוהה", img: getImage(imageManifest, "living", FALLBACK_IMAGES.interior) },
            { title: "חומרי גמר", desc: "פורצלן אירופאי ואבן טבעית", img: getImage(imageManifest, "interior", FALLBACK_IMAGES.interior) }
          ].map((item, idx) => (
            <motion.div key={idx} variants={staggerItem}>
              <GlassCard className="overflow-hidden h-full">
                <div className="aspect-video relative">
                  <OptimizedImage src={item.img} alt={`${item.title} - ${item.desc}`} fallbackSrc={FALLBACK_IMAGES.interior} observerLazy wrapperClassName="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.desc}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ========== 10. KITCHENS & LIVING QUALITY ========== */}
      <Section gradient>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeInUp}>
            <Badge className="mb-4 bg-amber-400/20 text-amber-300 border-amber-400/30">
              <Utensils className="h-4 w-4 ml-2" />
              מטבחים ואיכות חיים
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {project?.taglineEn || "Elevate Quality of Life"}
            </h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              {interiorText || "מטבחים מאובזרים במלואם עם מכשירי חשמל מודרניים ואלגנטיים, תוכננו להעלות את חוויית הבישול ולהשלים אורח חיים מתוחכם."}
            </p>
            <div className="space-y-4">
              {[
                "מכשירי חשמל אירופאיים מהמותגים המובילים",
                "משטחי עבודה איכותיים",
                "עיצוב מודרני ופונקציונלי"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  <span className="text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div {...fadeInUp}>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <OptimizedImage
                src={getImage(imageManifest, "kitchen", FALLBACK_IMAGES.kitchen)}
                alt="מטבח מודרני - עיצוב יוקרתי עם מכשירי חשמל אירופאיים"
                fallbackSrc={FALLBACK_IMAGES.kitchen}
                observerLazy
                wrapperClassName="w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ========== 11. UNIT TYPES ========== */}
      <Section dark id="units">
        <SectionTitle 
          badge="סוגי דירות"
          title="בחרו את הדירה המושלמת"
          icon={Home}
        />
        
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
          {unitTypes.length > 0 ? unitTypes.map((unit, idx) => {
            // Get unit image from interiors (cycle through living, bedroom, kitchen)
            const unitImages = imageManifest ? [
              ...imageManifest.interiors.living,
              ...imageManifest.interiors.bedroom,
              ...imageManifest.interiors.kitchen
            ] : [];
            const unitImage = unitImages[idx % unitImages.length]?.url || FALLBACK_IMAGES.interior;
            return (
            <motion.div key={idx} variants={staggerItem}>
              <GlassCard className="overflow-hidden h-full group hover:border-amber-400/50 transition-all">
                <div className="aspect-video relative overflow-hidden">
                  <OptimizedImage
                    src={unitImage}
                    alt={`${unit.name} - ${unit.details || 'יחידת מגורים יוקרתית'}`}
                    fallbackSrc={FALLBACK_IMAGES.interior}
                    observerLazy
                    className="group-hover:scale-110 transition-transform duration-700"
                    wrapperClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <Badge className="absolute top-4 right-4 bg-amber-400 text-slate-900">
                    {unit.name}
                  </Badge>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{unit.name}</h3>
                  {unit.details && (
                    <p className="text-white/60 mb-4 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-amber-400" />
                      {unit.details}
                    </p>
                  )}
                  <div className="text-2xl font-bold bg-gradient-to-l from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-6">
                    {unit.price || "לשאלה"}
                  </div>
                  <Button
                    onClick={scrollToContact}
                    className="w-full bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400 hover:text-slate-900"
                    data-testid={`button-unit-${idx}`}
                  >
                    קבלו הצעת מחיר
                    <ChevronRight className="h-4 w-4 mr-2" />
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          );
          }) : (
            // Default unit types if none provided
            [
              { name: "Studio", details: "436 sqft", desc: "מושלם לרווקים ואנשי מקצוע צעירים" },
              { name: "1 Bedroom", details: "684 - 804 sqft", desc: "אידיאלי ליחידים או זוגות" },
              { name: "2 Bedroom", details: "1191 - 1641 sqft", desc: "מרחב נוח למשפחות" }
            ].map((unit, idx) => {
              // Get unit image from interiors (cycle through living, bedroom, kitchen)
              const fallbackUnitImages = imageManifest ? [
                ...imageManifest.interiors.living,
                ...imageManifest.interiors.bedroom,
                ...imageManifest.interiors.kitchen
              ] : [];
              const fallbackUnitImage = fallbackUnitImages[idx % fallbackUnitImages.length]?.url || FALLBACK_IMAGES.interior;
              return (
              <motion.div key={idx} variants={staggerItem}>
                <GlassCard className="overflow-hidden h-full group hover:border-amber-400/50 transition-all">
                  <div className="aspect-video relative overflow-hidden">
                    <OptimizedImage
                      src={fallbackUnitImage}
                      alt={`${unit.name} - ${unit.desc}`}
                      fallbackSrc={FALLBACK_IMAGES.interior}
                      observerLazy
                      className="group-hover:scale-110 transition-transform duration-700"
                      wrapperClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <Badge className="mb-4 bg-amber-400/20 text-amber-300 border-amber-400/30">
                      {unit.name}
                    </Badge>
                    <h3 className="text-2xl font-bold text-white mb-2">{unit.name}</h3>
                    <p className="text-white/60 mb-2 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-amber-400" />
                      {unit.details}
                    </p>
                    <p className="text-white/50 text-sm mb-6">{unit.desc}</p>
                    <Button
                      onClick={scrollToContact}
                      className="w-full bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400 hover:text-slate-900"
                      data-testid={`button-unit-${idx}`}
                    >
                      קבלו הצעת מחיר
                      <ChevronRight className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            );
            })
          )}
        </motion.div>
      </Section>

      {/* ========== 12. INTERIOR QUALITY & FINISH ========== */}
      <Section gradient>
        <SectionTitle 
          badge="איכות גמר"
          title="חומרים ברמה הגבוהה ביותר"
          icon={Gem}
        />
        
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Layers, title: "פורצלן אירופאי" },
            { icon: Shield, title: "זכוכית אדריכלית" },
            { icon: Sparkles, title: "גימור יוקרתי" },
            { icon: Award, title: "סטנדרט בינלאומי" }
          ].map((item, idx) => (
            <motion.div key={idx} variants={staggerItem}>
              <GlassCard className="p-6 text-center h-full hover:bg-white/10 transition-all">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-amber-400/20 flex items-center justify-center">
                  <item.icon className="h-7 w-7 text-amber-400" />
                </div>
                <h4 className="text-white font-semibold">{item.title}</h4>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ========== 13. SMART LIVING ========== */}
      <Section dark>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeInUp} className="order-2 md:order-1">
            <div className="aspect-square rounded-2xl overflow-hidden relative">
              <OptimizedImage
                src={getImage(imageManifest, "interior", FALLBACK_IMAGES.smartHome)}
                alt="בית חכם - מערכת שליטה חכמה בתאורה וטמפרטורה"
                fallbackSrc={FALLBACK_IMAGES.smartHome}
                observerLazy
                wrapperClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            </div>
          </motion.div>
          
          <motion.div {...fadeInUp} className="order-1 md:order-2">
            <Badge className="mb-4 bg-amber-400/20 text-amber-300 border-amber-400/30">
              <Smartphone className="h-4 w-4 ml-2" />
              בית חכם
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {`Smart Home at ${projectName}`}
            </h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              {smartText || "שדרגו את חיי היומיום עם מערכת בית חכם מתקדמת. שלטו בתאורה, טמפרטורה ואבטחה בנגיעה אחת, עם אינטגרציית Alexa מלאה."}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Sun, title: "תאורה" },
                { icon: Thermometer, title: "טמפרטורה" },
                { icon: Lock, title: "אבטחה" },
                { icon: Wifi, title: "Alexa" }
              ].map((item, idx) => (
                <GlassCard key={idx} className="p-4 flex items-center gap-3 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-white">{item.title}</span>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ========== 14. QUALITY STATEMENTS / BRAND VALUES ========== */}
      <Section gradient>
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Sparkles, title: "Luxurious Finishes", titleHe: "גימור יוקרתי" },
            { icon: Award, title: "Premium Fixtures", titleHe: "אביזרים פרימיום" },
            { icon: Palette, title: "Artful Detailing", titleHe: "דיוק אומנותי" },
            { icon: Shield, title: "Supreme Quality", titleHe: "איכות עליונה" }
          ].map((item, idx) => (
            <motion.div key={idx} variants={staggerItem}>
              <GlassCard className="p-8 text-center h-full hover:bg-white/10 transition-all group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400/30 to-amber-600/30 flex items-center justify-center group-hover:from-amber-400/50 group-hover:to-amber-600/50 transition-all">
                  <item.icon className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.titleHe}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ========== 15. KEY FEATURES ========== */}
      <Section dark>
        <SectionTitle 
          badge="מאפיינים עיקריים"
          title="Key Features"
          icon={Star}
        />
        
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { icon: Navigation, title: "תחנת מטרו עתידית" },
            { icon: Building2, title: "לובי מעוצב" },
            { icon: Zap, title: "עמדת טעינה EV" },
            { icon: Eye, title: "פאנלים זכוכית גדולים" },
            { icon: Layers, title: "ארונות עץ יוקרתיים" },
            { icon: Sparkles, title: "ריצוף פורצלן אירופאי" },
            { icon: Utensils, title: "מכשירים אירופאיים" },
            { icon: TrendingUp, title: "מעליות מהירות במיוחד" },
            { icon: Palette, title: "חזית אייקונית" },
            { icon: Smartphone, title: "טכנולוגיית בית חכם" },
            { icon: Wifi, title: "אינטגרציית Alexa" },
            { icon: Shield, title: "אבטחה 24/7" }
          ].map((item, idx) => (
            <motion.div key={idx} variants={staggerItem}>
              <GlassCard className="p-4 flex items-center gap-3 hover:bg-white/10 transition-all h-full">
                <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-white text-sm">{item.title}</span>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ========== 16. DISTANCE MAP / LANDMARKS ========== */}
      <Section gradient>
        <SectionTitle 
          badge="יעדים קרובים"
          title="Landmarks"
          icon={MapPin}
        />
        
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            "Burj Al Arab",
            "Mall of the Emirates",
            "Dubai Marina",
            "Business Bay",
            "Media City",
            "Internet City"
          ].map((landmark, idx) => (
            <motion.div key={idx} variants={staggerItem}>
              <GlassCard className="p-4 text-center hover:bg-white/10 transition-all h-full">
                <MapPin className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                <span className="text-white text-sm">{landmark}</span>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ========== 17. AMENITIES - PODIUM LEVEL ========== */}
      <Section dark id="amenities">
        <SectionTitle 
          badge="קומת פודיום"
          title="Podium Level Amenities"
          icon={Layers}
        />
        
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(podiumAmenities.length > 0 ? podiumAmenities : [
            { title: "Leisure Pool" },
            { title: "Jacuzzi" },
            { title: "Fitness Studio" },
            { title: "Yoga Terrace" },
            { title: "Kids Splash Pad" },
            { title: "Sunken Seating" },
            { title: "Swimming Pool" },
            { title: "Multipurpose Court" }
          ]).map((amenity, idx) => (
            <motion.div key={idx} variants={staggerItem}>
              <GlassCard className="p-4 flex items-center gap-3 hover:bg-white/10 transition-all h-full group">
                <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center group-hover:bg-blue-400/20 transition-colors flex-shrink-0">
                  <Waves className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-white text-sm">{amenity.title}</span>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ========== 18. AMENITIES - ROOFTOP LEVEL ========== */}
      <Section gradient>
        <SectionTitle 
          badge="גג"
          title="Rooftop Level Amenities"
          icon={Moon}
        />
        
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(rooftopAmenities.length > 0 ? rooftopAmenities : [
            { title: "Rooftop Lounge" },
            { title: "Open Air Cinema" },
            { title: "BBQ Area" },
            { title: "Zen Garden" },
            { title: "Lap Pool" },
            { title: "Outdoor Kids Play" },
            { title: "Indoor Kids Arena" },
            { title: "Multipurpose Hall" }
          ]).map((amenity, idx) => (
            <motion.div key={idx} variants={staggerItem}>
              <GlassCard className="p-4 flex items-center gap-3 hover:bg-white/10 transition-all h-full group">
                <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center group-hover:bg-purple-400/20 transition-colors flex-shrink-0">
                  <Star className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-white text-sm">{amenity.title}</span>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ========== 19. AMENITIES - INDIVIDUAL HIGHLIGHTS ========== */}
      <Section dark>
        <SectionTitle 
          badge="מתקנים מיוחדים"
          title="Special Amenities"
          icon={Crown}
        />
        
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Waves, title: "Swimming Pool", titleHe: "בריכת שחייה יוקרתית", img: getImage(imageManifest, "pool", FALLBACK_IMAGES.pool) },
            { icon: Dumbbell, title: "Fitness Studio", titleHe: "חדר כושר מאובזר", img: getImage(imageManifest, "gym", FALLBACK_IMAGES.gym) },
            { icon: Film, title: "Rooftop Cinema", titleHe: "קולנוע על הגג", img: getImage(imageManifest, "rooftop", FALLBACK_IMAGES.cinema) },
            { icon: TreePine, title: "Zen Garden", titleHe: "גינת זן ירוקה", img: getImage(imageManifest, "garden", FALLBACK_IMAGES.garden) },
            { icon: Baby, title: "Kids Play Area", titleHe: "אזור משחקים לילדים", img: getImage(imageManifest, "kids", FALLBACK_IMAGES.kids) },
            { icon: Flame, title: "BBQ Area", titleHe: "אזור ברביקיו", img: getImage(imageManifest, "rooftop", FALLBACK_IMAGES.bbq) }
          ].map((item, idx) => (
            <motion.div key={idx} variants={staggerItem}>
              <GlassCard className="overflow-hidden h-full group">
                <div className="aspect-video relative overflow-hidden">
                  <OptimizedImage
                    src={item.img}
                    alt={`${item.title} - ${item.titleHe}`}
                    observerLazy
                    className="group-hover:scale-110 transition-transform duration-700"
                    wrapperClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-4 right-4 left-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-400/30 backdrop-blur-sm flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-white font-semibold">{item.title}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ========== 20. FLOOR PLANS (placeholder) ========== */}
      <Section gradient>
        <SectionTitle 
          badge="תוכניות קומה"
          title="Floor Plans"
          subtitle="צרו קשר לקבלת תוכניות מפורטות"
          icon={Layers}
        />
        
        <motion.div {...fadeInUp} className="text-center">
          <Button 
            size="lg" 
            onClick={scrollToContact}
            className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold text-lg px-8"
            data-testid="button-floorplans"
          >
            קבלו תוכניות קומה
            <ChevronRight className="h-5 w-5 mr-2" />
          </Button>
        </motion.div>
      </Section>

      {/* ========== 21. CLOSING STATEMENTS ========== */}
      <Section dark>
        <motion.div {...fadeInUp} className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-l from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              {hero?.subtitle || project?.taglineEn || `Discover ${projectName}`}
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 font-light">
            {project?.tagline || "Crafted for Extraordinary Living"}
          </p>
        </motion.div>
      </Section>

      {/* ========== 22. ABOUT THE DEVELOPER ========== */}
      <Section gradient>
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Building2 className="h-12 w-12 text-slate-900" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white">{developerName}</h2>
          </motion.div>
          
          <motion.div {...fadeInUp}>
            <GlassCard className="p-8 md:p-12">
              <p className="text-lg text-white/80 leading-relaxed text-center">
                {developerText || `${developerName} היא חברת בנייה מובילה בדובאי עם מורשת של עשרות שנים בתעשיית הבנייה. 
                החברה מרחיבה את פעילותה לדובאי ומנצלת את הניסיון העשיר שלה כדי לתרום לקו הרקיע הדינמי של העיר עם פיתוחים ברמה עולמית. 
                החזון שלנו הוא ליצור כתובות לחיים יוצאי דופן, שם מתגלים הרגעים הטובים ביותר בחיים בסביבת מגורים מעודנת ויוקרתית.`}
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </Section>

      {/* ========== CONTACT CTA ========== */}
      <section id="contact" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-amber-500/10 to-amber-600/20" />
          <motion.div 
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }} 
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }} 
            className="absolute inset-0 opacity-30" 
            style={{ 
              backgroundImage: "radial-gradient(circle at center, rgba(212, 175, 55, 0.3) 0%, transparent 50%)", 
              backgroundSize: "100% 100%" 
            }} 
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <div className="inline-block mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-2xl shadow-amber-400/30">
                <Phone className="h-10 w-10 text-slate-900" />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              מעוניינים לשמוע עוד?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              השאירו פרטים ונציג מטעמנו יחזור אליכם עם כל המידע על הפרויקט, כולל מחירים עדכניים ויחידות זמינות
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasPhoneNumber && (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold shadow-2xl shadow-amber-400/30 text-lg px-8"
                  onClick={() => window.open(`https://wa.me/${phoneNumber}`, "_blank")}
                  data-testid="button-contact-whatsapp"
                >
                  <MessageCircle className="h-5 w-5 ml-2" />
                  WhatsApp
                </Button>
              )}
              {hasPhoneNumber && (
                <Button
                  size="lg"
                  className="bg-white text-slate-900 font-bold text-lg px-8"
                  onClick={() => window.open(`tel:+${phoneNumber}`)}
                  data-testid="button-contact-phone"
                >
                  <Phone className="h-5 w-5 ml-2" />
                  התקשרו עכשיו
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== 23. FOOTER ========== */}
      <footer className="bg-slate-950 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={ddlLogo} alt="PropLine Real Estate - לוגו חברת נדל״ן יוקרה בדובאי" className="h-12" loading="lazy" decoding="async" />
              <div className="h-8 w-px bg-white/20" />
              <span className="text-white font-bold text-lg">{projectName}</span>
            </div>
            
            <div className="text-center md:text-left">
              <p className="text-white/50 text-sm">
                {developerName} | {location?.address || "Dubai"}
              </p>
            </div>
            
            {hasPhoneNumber && (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/50 hover:text-amber-400"
                  onClick={() => window.open(`https://wa.me/${phoneNumber}`, "_blank")}
                  data-testid="button-footer-whatsapp"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/50 hover:text-amber-400"
                  onClick={() => window.open(`tel:+${phoneNumber}`)}
                  data-testid="button-footer-phone"
                >
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()} PropLine Real Estate. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
