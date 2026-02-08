import {
  Waves,
  Droplets,
  Droplet,
  Snowflake,
  Dumbbell,
  Activity,
  Bike,
  Mountain,
  Flag,
  Target,
  Shield,
  Car,
  TreePine,
  Trees,
  Wifi,
  Coffee,
  Baby,
  PawPrint,
  Sparkles,
  Home,
  Ruler,
  Calendar,
  TrendingUp,
  DollarSign,
  MapPin,
  Landmark,
  Check,
  Clock,
  Layers,
  Star,
  Award,
  Building2,
  BedDouble,
  Sun,
  Flame,
  Heart,
  Umbrella,
  Wine,
  Bell,
  Shirt,
  Package,
  Trophy,
  Briefcase,
  Users,
  Eye,
  Square,
  Circle,
  Wind,
  Flower2,
  Flower,
  GraduationCap,
  Palette,
  Film,
  Gamepad2,
  Music,
  BookOpen,
  Mic,
  Monitor,
  Video,
  UtensilsCrossed,
  Anchor,
  Ship,
  Compass,
  Leaf,
  Footprints,
  Lock,
  Camera,
  Key,
  Zap,
  Plane,
  Smartphone,
  Globe,
  Store,
  ShoppingBag,
  Building,
  Battery,
  Tv,
  Phone,
  Timer,
  Wrench,
  Thermometer,
  Rocket,
  Gem,
  Crown,
  Lightbulb,
  Feather,
  Headphones,
  Radio,
} from "lucide-react";

import fallbackImage1 from "@assets/stock_images/dubai_luxury_skyline_b2576960.jpg";
import fallbackImage2 from "@assets/stock_images/dubai_luxury_skyline_9adbeac4.jpg";
import fallbackImage3 from "@assets/stock_images/dubai_luxury_skyline_94fdbb8d.jpg";
import fallbackImage4 from "@assets/stock_images/modern_luxury_apartm_6c4541a0.jpg";
import fallbackImage5 from "@assets/stock_images/modern_luxury_apartm_02664780.jpg";

import type { Project, GalleryItem, PaymentMilestone } from "./types";

export const FALLBACK_HERO_IMAGES = [
  fallbackImage1,
  fallbackImage2,
  fallbackImage4,
];

export const FALLBACK_GALLERY_IMAGES = [
  fallbackImage1,
  fallbackImage2,
  fallbackImage3,
  fallbackImage4,
  fallbackImage5,
];

export const iconMap: Record<string, React.ElementType> = {
  // Water & Pool
  waves: Waves,
  pool: Waves,
  droplets: Droplets,
  droplet: Droplet,
  snowflake: Snowflake,

  // Fitness & Wellness
  gym: Dumbbell,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  spa: Sparkles,
  heart: Heart,
  yoga: Heart,
  activity: Activity,

  // Sports
  trophy: Trophy,
  sport: Trophy,
  circle: Circle,
  tennis: Circle,
  target: Target,
  flag: Flag,
  mountain: Mountain,
  bike: Bike,
  square: Square,

  // Security
  security: Shield,
  shield: Shield,
  lock: Lock,
  key: Key,
  camera: Camera,

  // Transport & Parking
  parking: Car,
  car: Car,
  plane: Plane,
  zap: Zap,

  // Outdoor & Nature
  garden: TreePine,
  tree: TreePine,
  treepine: TreePine,
  trees: Trees,
  leaf: Leaf,
  flower: Flower,
  flower2: Flower2,
  footprints: Footprints,
  sun: Sun,
  rooftop: Sun,
  flame: Flame,
  bbq: Flame,
  umbrella: Umbrella,
  beach: Umbrella,
  wind: Wind,

  // Technology
  wifi: Wifi,
  smartphone: Smartphone,
  monitor: Monitor,
  tv: Tv,
  video: Video,
  globe: Globe,
  battery: Battery,
  thermometer: Thermometer,

  // Food & Beverage
  cafe: Coffee,
  coffee: Coffee,
  wine: Wine,
  lounge: Wine,
  bar: Wine,
  utensilscrossed: UtensilsCrossed,

  // Kids & Family
  kids: Baby,
  baby: Baby,
  child: Baby,
  graduationcap: GraduationCap,

  // Pets
  pets: PawPrint,
  paw: PawPrint,
  pawprint: PawPrint,

  // Services
  bell: Bell,
  concierge: Bell,
  shirt: Shirt,
  laundry: Shirt,
  package: Package,
  wrench: Wrench,
  timer: Timer,
  phone: Phone,

  // Entertainment
  film: Film,
  gamepad2: Gamepad2,
  music: Music,
  mic: Mic,
  palette: Palette,
  bookopen: BookOpen,

  // Business
  briefcase: Briefcase,
  business: Briefcase,
  users: Users,
  cowork: Users,

  // Marina
  anchor: Anchor,
  ship: Ship,
  compass: Compass,

  // Shopping & Retail
  store: Store,
  shoppingbag: ShoppingBag,

  // View
  eye: Eye,
  view: Eye,
  balcony: Square,

  // Building & Home
  building: Building,
  building2: Building2,
  home: Home,
  bed: BedDouble,
  beddouble: BedDouble,
  landmark: Landmark,

  // Measurement & Info
  ruler: Ruler,
  calendar: Calendar,
  trending: TrendingUp,
  trendingup: TrendingUp,
  dollar: DollarSign,
  dollarsign: DollarSign,
  mappin: MapPin,
  check: Check,
  clock: Clock,
  layers: Layers,
  floors: Layers,
  star: Star,
  award: Award,

  // Custom fallback icons
  rocket: Rocket,
  gem: Gem,
  crown: Crown,
  lightbulb: Lightbulb,
  feather: Feather,
  headphones: Headphones,
  radio: Radio,
};

export function getIcon(iconName?: string): React.ElementType {
  if (!iconName) return Sparkles;
  const normalizedName = iconName.toLowerCase().replace(/[-_\s]/g, "");
  return iconMap[normalizedName] || Sparkles;
}

export function formatPrice(price: number | null | undefined, currency: string = "AED"): string {
  if (!price || price === 0) return "מתעדכן";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: currency === "AED" ? "AED" : currency,
    maximumFractionDigits: 0,
  }).format(price);
}

// Check if URL is a valid image URL
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  // These local paths don't work - they're placeholder values from failed PDF extraction
  if (url.startsWith('/assets/') || url.startsWith('/attached_assets/')) {
    return false;
  }
  return url.startsWith('http') || url.startsWith('data:') || url.includes('/@fs/') || url.startsWith('/projects/');
}

export function getHeroImage(project: Project): string {
  if (isValidImageUrl(project.heroImage)) return project.heroImage!;
  if (isValidImageUrl(project.imageUrl)) return project.imageUrl!;
  const galleryItems = project.gallery as GalleryItem[] | null;
  if (galleryItems && galleryItems.length > 0 && isValidImageUrl(galleryItems[0].url)) {
    return galleryItems[0].url!;
  }
  const code = (project.id ?? "").charCodeAt(0);
  const hash = (Number.isNaN(code) ? 0 : code) % FALLBACK_HERO_IMAGES.length;
  return FALLBACK_HERO_IMAGES[hash];
}

export function getGalleryImages(project: Project): GalleryItem[] {
  const galleryItems = project.gallery as GalleryItem[] | null;
  if (galleryItems && galleryItems.length > 0) {
    // Filter only items with valid external URLs
    const filteredItems = galleryItems.filter(item => isValidImageUrl(item.url));
    if (filteredItems.length > 0) {
      // Preserve all fields including category from the original gallery items
      return filteredItems.map(item => ({
        url: item.url,
        alt: item.alt,
        type: item.type || "image" as const,
        category: item.category, // Preserve category field
      }));
    }
  }
  // Fallback images get no category (could default to "exterior" if needed)
  return FALLBACK_GALLERY_IMAGES.map((url, idx) => ({
    url,
    alt: `${project.name} - תמונה ${idx + 1}`,
    type: "image" as const,
  }));
}

/**
 * Normalize paymentPlan from DB into PaymentMilestone[] regardless of stored format.
 * Handles:
 *   1. New structured: [{ name, isPostHandover, milestones: [{ title, titleHe, percentage, dueDate }] }]
 *   2. Legacy flat array: [{ milestone, percentage, description }]
 *   3. Object with .milestones sub-array
 *   4. Object with downPayment/duringConstruction/onHandover
 *   5. string, null
 */
export function normalizePaymentPlan(raw: any): PaymentMilestone[] | null {
  if (!raw) return null;

  if (Array.isArray(raw)) {
    // New structured format: array of plans with milestones sub-arrays
    if (raw.length > 0 && raw[0].milestones && Array.isArray(raw[0].milestones)) {
      const allMilestones: PaymentMilestone[] = [];
      for (const plan of raw) {
        if (!Array.isArray(plan.milestones)) continue;
        for (const m of plan.milestones) {
          allMilestones.push({
            milestone: m.titleHe || m.title || "",
            percentage: m.percentage || 0,
            description: m.dueDate || undefined,
          });
        }
      }
      return allMilestones.length > 0 ? allMilestones : null;
    }

    // Legacy flat array: [{ milestone, percentage, description }]
    const valid = raw.filter((m: any) => m && typeof m === "object" && (m.percentage > 0 || m.milestone));
    if (valid.length > 0) {
      return valid.map((m: any) => ({
        milestone: m.milestone || m.description || m.descriptionEn || "",
        percentage: m.percentage || 0,
        description: m.description || m.descriptionEn || undefined,
      }));
    }
    return null;
  }

  // Object format: { milestones: [...], downPayment, duringConstruction, onHandover }
  if (typeof raw === "object") {
    // Has milestones sub-array
    if (Array.isArray(raw.milestones) && raw.milestones.length > 0) {
      return raw.milestones.map((m: any) => ({
        milestone: m.milestone || m.titleHe || m.title || m.description || m.descriptionEn || "",
        percentage: m.percentage || 0,
        description: m.dueDate || m.description || m.descriptionEn || undefined,
      }));
    }
    // Has downPayment/duringConstruction/onHandover fields
    if (raw.downPayment || raw.duringConstruction || raw.onHandover) {
      const milestones: PaymentMilestone[] = [];
      if (raw.downPayment) milestones.push({ milestone: "מקדמה", percentage: raw.downPayment });
      if (raw.duringConstruction) milestones.push({ milestone: "בבנייה", percentage: raw.duringConstruction });
      if (raw.onHandover) milestones.push({ milestone: "במסירה", percentage: raw.onHandover });
      return milestones;
    }
  }

  return null;
}

export const sectionNav = [
  { id: "hero", label: "סקירה" },
  { id: "about", label: "אודות" },
  { id: "amenities", label: "מתקנים" },
  { id: "units", label: "יחידות" },
  { id: "payment", label: "תכנית תשלום" },
  { id: "gallery", label: "גלריה" },
  { id: "location", label: "מיקום" },
];
