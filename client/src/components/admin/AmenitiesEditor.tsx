import { useState, useMemo } from "react";
import {
  Waves,
  Droplets,
  Droplet,
  Snowflake,
  Sun,
  Thermometer,
  Flame,
  Dumbbell,
  Activity,
  Bike,
  Mountain,
  Flag,
  Target,
  Trophy,
  Heart,
  Sparkles,
  Wind,
  Flower2,
  Baby,
  Users,
  GraduationCap,
  Palette,
  Film,
  Gamepad2,
  Music,
  BookOpen,
  Mic,
  Briefcase,
  Monitor,
  Video,
  Wifi,
  UtensilsCrossed,
  Coffee,
  Wine,
  Umbrella,
  Anchor,
  Ship,
  Compass,
  TreePine,
  Trees,
  Leaf,
  Flower,
  MapPin,
  Footprints,
  Bell,
  Star,
  Award,
  Shield,
  Lock,
  Eye,
  Camera,
  Key,
  Car,
  Zap,
  Plane,
  Smartphone,
  Home,
  Globe,
  Store,
  ShoppingBag,
  Package,
  Building,
  Landmark,
  Battery,
  Tv,
  Phone,
  Timer,
  Wrench,
  PawPrint,
  Square,
  Circle,
  Check,
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Rocket,
  Gem,
  Crown,
  Lightbulb,
  Feather,
  Headphones,
  Radio,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface AmenityDefinition {
  id: string;
  nameEn: string;
  nameHe: string;
  icon: string; // key that maps into the property-page iconMap
  category: string;
}

export interface SelectedAmenity {
  icon: string;
  name: string;
  nameHe: string;
  /** Stable amenity ID for lossless round-trip (master-list ID or "custom:..." key) */
  _id?: string;
}

export interface AmenityOutput {
  category: string;
  categoryEn: string;
  items: SelectedAmenity[];
}

// ----------------------------------------------------------------
// Categories metadata
// ----------------------------------------------------------------

interface CategoryMeta {
  id: string;
  nameHe: string;
  nameEn: string;
  Icon: LucideIcon;
}

const CATEGORIES: CategoryMeta[] = [
  { id: "pools", nameHe: "בריכות ומים", nameEn: "Pools & Water", Icon: Waves },
  { id: "fitness", nameHe: "כושר וחדר כושר", nameEn: "Fitness & Gym", Icon: Dumbbell },
  { id: "sports", nameHe: "ספורט ומגרשים", nameEn: "Sports & Courts", Icon: Trophy },
  { id: "wellness", nameHe: "ספא ווולנס", nameEn: "Spa & Wellness", Icon: Sparkles },
  { id: "kids", nameHe: "ילדים ומשפחה", nameEn: "Kids & Family", Icon: Baby },
  { id: "entertainment", nameHe: "בידור ופנאי", nameEn: "Entertainment & Leisure", Icon: Film },
  { id: "work", nameHe: "עבודה ועסקים", nameEn: "Work & Business", Icon: Briefcase },
  { id: "dining", nameHe: "אוכל וברביקיו", nameEn: "Dining & BBQ", Icon: UtensilsCrossed },
  { id: "beach", nameHe: "חוף וים", nameEn: "Beach & Waterfront", Icon: Umbrella },
  { id: "marina", nameHe: "מרינה ויאכטות", nameEn: "Marina & Yachts", Icon: Anchor },
  { id: "outdoors", nameHe: "גינות וחוץ", nameEn: "Gardens & Outdoors", Icon: TreePine },
  { id: "pets", nameHe: "חיות מחמד", nameEn: "Pets", Icon: Heart },
  { id: "services", nameHe: "שירותים וקונסיירז׳", nameEn: "Services & Concierge", Icon: Bell },
  { id: "security", nameHe: "ביטחון וגישה", nameEn: "Security & Access", Icon: Shield },
  { id: "parking", nameHe: "חניה ותחבורה", nameEn: "Parking & Transport", Icon: Car },
  { id: "tech", nameHe: "טכנולוגיה ובית חכם", nameEn: "Technology & Smart Home", Icon: Smartphone },
  { id: "retail", nameHe: "קניות ושירותים קהילתיים", nameEn: "Retail & Community", Icon: Store },
  { id: "religious", nameHe: "דת ותרבות", nameEn: "Religious & Cultural", Icon: BookOpen },
  { id: "sustainability", nameHe: "קיימות וירוק", nameEn: "Sustainability & Green", Icon: Leaf },
  { id: "unit", nameHe: "מאפייני יחידה", nameEn: "Unit Features", Icon: Home },
  { id: "views", nameHe: "נופים וסטטוס", nameEn: "Views & Status", Icon: Eye },
];

// ----------------------------------------------------------------
// Master amenity list (~350+ items)
// ----------------------------------------------------------------

const AMENITIES: AmenityDefinition[] = [
  // ── Pools & Water ──────────────────────────────────────────────
  { id: "swimming-pool", nameEn: "Swimming Pool", nameHe: "בריכת שחייה", icon: "waves", category: "pools" },
  { id: "infinity-pool", nameEn: "Infinity Pool", nameHe: "בריכת אינפיניטי", icon: "waves", category: "pools" },
  { id: "rooftop-infinity-pool", nameEn: "Rooftop Infinity Pool", nameHe: "בריכת אינפיניטי על הגג", icon: "waves", category: "pools" },
  { id: "indoor-pool", nameEn: "Indoor Swimming Pool", nameHe: "בריכה מקורה", icon: "waves", category: "pools" },
  { id: "outdoor-pool", nameEn: "Outdoor Swimming Pool", nameHe: "בריכת שחייה חיצונית", icon: "waves", category: "pools" },
  { id: "lap-pool", nameEn: "Lap Pool / 25m Pool", nameHe: "בריכת הקפות (25 מ׳)", icon: "waves", category: "pools" },
  { id: "temperature-pool", nameEn: "Temperature-Controlled Pool", nameHe: "בריכה מחוממת / מקוררת", icon: "thermometer", category: "pools" },
  { id: "children-pool", nameEn: "Children's Pool", nameHe: "בריכת ילדים", icon: "droplets", category: "pools" },
  { id: "splash-pad", nameEn: "Splash Pad", nameHe: "משטח התזה לילדים", icon: "droplets", category: "pools" },
  { id: "plunge-pool", nameEn: "Plunge Pool", nameHe: "בריכת צלילה", icon: "droplet", category: "pools" },
  { id: "cold-plunge-pool", nameEn: "Cold Plunge Pool", nameHe: "בריכת קור", icon: "snowflake", category: "pools" },
  { id: "private-pool", nameEn: "Private Pool (In-Unit)", nameHe: "בריכה פרטית ביחידה", icon: "waves", category: "pools" },
  { id: "hydrotherapy-pool", nameEn: "Hydrotherapy Pool", nameHe: "בריכת הידרותרפיה", icon: "heart", category: "pools" },
  { id: "thalassotherapy-pool", nameEn: "Thalassotherapy Pool", nameHe: "בריכת תלסותרפיה", icon: "heart", category: "pools" },
  { id: "aqua-gym-pool", nameEn: "Aqua Gym Pool", nameHe: "בריכת אקווה ג׳ים", icon: "activity", category: "pools" },
  { id: "jacuzzi", nameEn: "Jacuzzi / Hot Tub", nameHe: "ג׳קוזי / אמבט חם", icon: "flame", category: "pools" },
  { id: "private-jacuzzi", nameEn: "Private Jacuzzi", nameHe: "ג׳קוזי פרטי", icon: "flame", category: "pools" },
  { id: "crystal-lagoon", nameEn: "Crystal Lagoon", nameHe: "קריסטל לגון", icon: "sparkles", category: "pools" },
  { id: "swimmable-lagoon", nameEn: "Swimmable Lagoon", nameHe: "לגונה שחייתית", icon: "waves", category: "pools" },
  { id: "lazy-river", nameEn: "Lazy River", nameHe: "נהר עצלנים", icon: "waves", category: "pools" },
  { id: "wave-pool", nameEn: "Wave Pool / Surf Pool", nameHe: "בריכת גלים / סרף", icon: "waves", category: "pools" },
  { id: "water-slides", nameEn: "Water Slides", nameHe: "מגלשות מים", icon: "waves", category: "pools" },
  { id: "swim-up-bar", nameEn: "Swim-Up Bar / Pool Bar", nameHe: "בר בבריכה", icon: "wine", category: "pools" },
  { id: "sun-deck-cabanas", nameEn: "Sun Deck & Cabanas", nameHe: "דק שמש וקבאנות", icon: "sun", category: "pools" },
  { id: "water-features", nameEn: "Water Features / Fountains", nameHe: "מזרקות דקורטיביות", icon: "droplets", category: "pools" },
  { id: "waterfalls", nameEn: "Cascading Waterfalls", nameHe: "מפלים", icon: "waves", category: "pools" },
  { id: "flotation-pool", nameEn: "Flotation / Sensory Pool", nameHe: "בריכת צפה חושית", icon: "sparkles", category: "pools" },
  { id: "boating-lake", nameEn: "Boating / Paddle Board Lake", nameHe: "אגם שיט / סאפ", icon: "waves", category: "pools" },

  // ── Fitness & Gym ──────────────────────────────────────────────
  { id: "gym", nameEn: "State-of-the-Art Gym", nameHe: "חדר כושר מתקדם", icon: "dumbbell", category: "fitness" },
  { id: "private-gym", nameEn: "Private Gym (In-Unit)", nameHe: "חדר כושר פרטי ביחידה", icon: "dumbbell", category: "fitness" },
  { id: "outdoor-gym", nameEn: "Outdoor Gym / Fitness Stations", nameHe: "חדר כושר חיצוני", icon: "dumbbell", category: "fitness" },
  { id: "underwater-gym", nameEn: "Aquatic / Underwater Gym", nameHe: "חדר כושר מתחת למים", icon: "waves", category: "fitness" },
  { id: "yoga-studio", nameEn: "Yoga Studio", nameHe: "סטודיו יוגה", icon: "activity", category: "fitness" },
  { id: "yoga-deck", nameEn: "Yoga Deck / Pavilion", nameHe: "דק יוגה חיצוני", icon: "activity", category: "fitness" },
  { id: "pilates-studio", nameEn: "Pilates Studio", nameHe: "סטודיו פילאטיס", icon: "activity", category: "fitness" },
  { id: "spin-studio", nameEn: "Cycling / Spin Studio", nameHe: "סטודיו ספינינג", icon: "bike", category: "fitness" },
  { id: "boxing-studio", nameEn: "Boxing / Kickboxing Studio", nameHe: "סטודיו אגרוף / קיקבוקסינג", icon: "target", category: "fitness" },
  { id: "crossfit-area", nameEn: "CrossFit / Functional Training", nameHe: "אזור קרוספיט / פונקציונלי", icon: "dumbbell", category: "fitness" },
  { id: "dance-studio", nameEn: "Dance Studio", nameHe: "סטודיו ריקוד", icon: "music", category: "fitness" },
  { id: "aerobics-zone", nameEn: "Aerobics Zone", nameHe: "אזור אירובי", icon: "activity", category: "fitness" },
  { id: "health-club", nameEn: "Health Club", nameHe: "מועדון בריאות", icon: "heart", category: "fitness" },
  { id: "personal-trainers", nameEn: "Personal Trainers (On-Staff)", nameHe: "מאמנים אישיים (צוות)", icon: "users", category: "fitness" },

  // ── Sports & Courts ────────────────────────────────────────────
  { id: "tennis-court", nameEn: "Tennis Court", nameHe: "מגרש טניס", icon: "circle", category: "sports" },
  { id: "tennis-academy", nameEn: "Tennis Academy", nameHe: "אקדמיית טניס", icon: "trophy", category: "sports" },
  { id: "padel-court", nameEn: "Padel Court", nameHe: "מגרש פאדל", icon: "circle", category: "sports" },
  { id: "basketball-court", nameEn: "Basketball Court", nameHe: "מגרש כדורסל", icon: "circle", category: "sports" },
  { id: "indoor-basketball", nameEn: "Indoor Basketball Court", nameHe: "מגרש כדורסל מקורה", icon: "circle", category: "sports" },
  { id: "football-pitch", nameEn: "Football Pitch", nameHe: "מגרש כדורגל", icon: "circle", category: "sports" },
  { id: "volleyball-court", nameEn: "Volleyball Court", nameHe: "מגרש כדורעף", icon: "circle", category: "sports" },
  { id: "beach-volleyball", nameEn: "Beach Volleyball Court", nameHe: "מגרש כדורעף חופים", icon: "circle", category: "sports" },
  { id: "badminton-court", nameEn: "Badminton Court", nameHe: "מגרש בדמינטון", icon: "circle", category: "sports" },
  { id: "squash-court", nameEn: "Squash Court", nameHe: "מגרש סקווש", icon: "square", category: "sports" },
  { id: "cricket-pitch", nameEn: "Cricket Pitch / Nets", nameHe: "מגרש קריקט", icon: "circle", category: "sports" },
  { id: "bocce-court", nameEn: "Bocce Ball Court", nameHe: "מגרש בוצ׳ה", icon: "circle", category: "sports" },
  { id: "table-tennis", nameEn: "Table Tennis / Ping Pong", nameHe: "טניס שולחן / פינג פונג", icon: "circle", category: "sports" },
  { id: "billiards-room", nameEn: "Billiards / Snooker Room", nameHe: "חדר ביליארד / סנוקר", icon: "target", category: "sports" },
  { id: "bowling-alley", nameEn: "Bowling Alley", nameHe: "מסלול באולינג", icon: "target", category: "sports" },
  { id: "multipurpose-court", nameEn: "Multipurpose Sports Court", nameHe: "מגרש ספורט רב תכליתי", icon: "activity", category: "sports" },
  { id: "climbing-wall", nameEn: "Rock Climbing Wall", nameHe: "קיר טיפוס", icon: "mountain", category: "sports" },
  { id: "trampoline-area", nameEn: "Trampoline Area", nameHe: "אזור טרמפולינה", icon: "activity", category: "sports" },
  { id: "skate-park", nameEn: "Skate Park", nameHe: "סקייט פארק", icon: "activity", category: "sports" },
  { id: "mini-golf", nameEn: "Mini Golf", nameHe: "מיני גולף", icon: "flag", category: "sports" },
  { id: "golf-18", nameEn: "18-Hole Golf Course", nameHe: "מגרש גולף 18 גומות", icon: "flag", category: "sports" },
  { id: "golf-9", nameEn: "9-Hole / Par 3 Golf Course", nameHe: "מגרש גולף 9 גומות", icon: "flag", category: "sports" },
  { id: "driving-range", nameEn: "Driving Range", nameHe: "טווח נהיגה", icon: "flag", category: "sports" },
  { id: "putting-green", nameEn: "Putting Green", nameHe: "גרין אימון", icon: "flag", category: "sports" },
  { id: "golf-clubhouse", nameEn: "Golf Clubhouse", nameHe: "מועדון גולף", icon: "flag", category: "sports" },
  { id: "equestrian-centre", nameEn: "Equestrian Centre / Stables", nameHe: "מרכז רכיבה / אורוות", icon: "activity", category: "sports" },
  { id: "polo-club", nameEn: "Polo Club", nameHe: "מועדון פולו", icon: "trophy", category: "sports" },
  { id: "paintball-park", nameEn: "Paintball Park", nameHe: "פארק פיינטבול", icon: "target", category: "sports" },
  { id: "go-karting", nameEn: "Go-Karting Track", nameHe: "מסלול גו-קארט", icon: "car", category: "sports" },
  { id: "water-sports", nameEn: "Water Sports (Surf/Kayak)", nameHe: "ספורט מים (סרף/קיאק)", icon: "waves", category: "sports" },
  { id: "chess-area", nameEn: "Chess Area", nameHe: "אזור שחמט", icon: "target", category: "sports" },

  // ── Spa & Wellness ─────────────────────────────────────────────
  { id: "spa-wellness-centre", nameEn: "Full-Service Spa & Wellness Centre", nameHe: "ספא ומרכז וולנס", icon: "sparkles", category: "wellness" },
  { id: "shared-spa", nameEn: "Shared Spa", nameHe: "ספא משותף", icon: "heart", category: "wellness" },
  { id: "private-spa", nameEn: "Private Spa (In-Unit)", nameHe: "ספא פרטי ביחידה", icon: "sparkles", category: "wellness" },
  { id: "treatment-rooms", nameEn: "Treatment & Massage Rooms", nameHe: "חדרי טיפולים ועיסויים", icon: "heart", category: "wellness" },
  { id: "couples-spa", nameEn: "Couple's Spa Suite", nameHe: "סוויטת ספא לזוגות", icon: "heart", category: "wellness" },
  { id: "sauna", nameEn: "Sauna / Finnish Sauna", nameHe: "סאונה יבשה / פינית", icon: "flame", category: "wellness" },
  { id: "infrared-sauna", nameEn: "Infrared Sauna", nameHe: "סאונה אינפרא אדום", icon: "flame", category: "wellness" },
  { id: "steam-room", nameEn: "Steam Room / Steam Bath", nameHe: "חדר אדים / סטים", icon: "wind", category: "wellness" },
  { id: "steam-shower", nameEn: "Steam Shower", nameHe: "מקלחת אדים", icon: "wind", category: "wellness" },
  { id: "hammam", nameEn: "Turkish Hammam", nameHe: "חמאם טורקי", icon: "sparkles", category: "wellness" },
  { id: "ice-bath", nameEn: "Ice Bath / Cold Plunge", nameHe: "אמבט קרח", icon: "snowflake", category: "wellness" },
  { id: "snow-room", nameEn: "Snow Room", nameHe: "חדר שלג", icon: "snowflake", category: "wellness" },
  { id: "cryotherapy", nameEn: "Cryotherapy Chamber", nameHe: "קריותרפיה", icon: "snowflake", category: "wellness" },
  { id: "hyperbaric-chamber", nameEn: "Hyperbaric Oxygen Chamber", nameHe: "תא לחץ היפרברי", icon: "wind", category: "wellness" },
  { id: "salt-room", nameEn: "Salt Room (Halotherapy)", nameHe: "חדר מלח (הלותרפיה)", icon: "sparkles", category: "wellness" },
  { id: "aromatherapy-room", nameEn: "Aromatherapy Room", nameHe: "חדר ארומתרפיה", icon: "flower2", category: "wellness" },
  { id: "sound-healing", nameEn: "Sound Healing Room", nameHe: "חדר ריפוי בצליל", icon: "music", category: "wellness" },
  { id: "hydrotherapy-path", nameEn: "Hydrotherapy Path", nameHe: "נתיב הידרותרפיה", icon: "heart", category: "wellness" },
  { id: "flotation-tank", nameEn: "Flotation / Sensory Tank", nameHe: "אזור צפה / חושי", icon: "waves", category: "wellness" },
  { id: "iv-therapy", nameEn: "IV Therapy Room", nameHe: "חדר IV תרפיה", icon: "heart", category: "wellness" },
  { id: "sports-recovery", nameEn: "Sports Recovery Room", nameHe: "חדר התאוששות ספורטיבי", icon: "activity", category: "wellness" },
  { id: "wellness-lounge", nameEn: "Wellness / Relaxation Lounge", nameHe: "טרקלין וולנס / הרפיה", icon: "sparkles", category: "wellness" },
  { id: "wellness-concierge", nameEn: "Wellness Concierge", nameHe: "קונסיירז׳ וולנס", icon: "star", category: "wellness" },
  { id: "nutrition-consultation", nameEn: "Nutrition Consultation", nameHe: "ייעוץ תזונתי", icon: "heart", category: "wellness" },
  { id: "beauty-salon", nameEn: "Beauty Salon / Hair Salon", nameHe: "מספרה / סלון יופי", icon: "sparkles", category: "wellness" },
  { id: "health-bar", nameEn: "Health Bar / Juice Bar", nameHe: "בר בריאות / מיצים", icon: "coffee", category: "wellness" },
  { id: "doctor-on-call", nameEn: "Doctor on Call", nameHe: "רופא תורן", icon: "heart", category: "wellness" },
  { id: "first-aid-centre", nameEn: "First Aid Medical Centre", nameHe: "מרכז עזרה ראשונה", icon: "heart", category: "wellness" },
  { id: "longevity-programme", nameEn: "Longevity & Wellness Programme", nameHe: "תוכנית אריכות ימים", icon: "sparkles", category: "wellness" },

  // ── Kids & Family ──────────────────────────────────────────────
  { id: "outdoor-playground", nameEn: "Outdoor Playground", nameHe: "גן משחקים חיצוני", icon: "baby", category: "kids" },
  { id: "indoor-playroom", nameEn: "Indoor Play Area / Playroom", nameHe: "חדר משחקים פנימי", icon: "baby", category: "kids" },
  { id: "kids-wet-play", nameEn: "Children's Wet Play Area", nameHe: "אזור משחקי מים לילדים", icon: "droplets", category: "kids" },
  { id: "kids-dry-play", nameEn: "Children's Dry Play Area", nameHe: "אזור משחק יבש לילדים", icon: "baby", category: "kids" },
  { id: "kids-club", nameEn: "Kids' Club / Activity Centre", nameHe: "מועדון ילדים", icon: "star", category: "kids" },
  { id: "nursery", nameEn: "Nursery / Day Care", nameHe: "משפחתון / גן ילדים", icon: "baby", category: "kids" },
  { id: "teen-lounge", nameEn: "Teen Lounge / Youth Zone", nameHe: "טרקלין נוער", icon: "users", category: "kids" },
  { id: "co-study-area", nameEn: "Co-Study Area (Teens)", nameHe: "חדר לימוד שיתופי (נוער)", icon: "bookopen", category: "kids" },
  { id: "stem-room", nameEn: "STEM / Educational Room", nameHe: "חדר פעילות STEM / חינוכי", icon: "graduationcap", category: "kids" },
  { id: "kids-trampoline", nameEn: "Kids Trampoline Park", nameHe: "פארק טרמפולינות (ילדים)", icon: "activity", category: "kids" },
  { id: "mini-water-park", nameEn: "Mini Water Park (Kids)", nameHe: "מיני פארק מים / מגלשות", icon: "waves", category: "kids" },
  { id: "petting-farm", nameEn: "Petting Farm", nameHe: "פינת חי / חווה", icon: "heart", category: "kids" },
  { id: "butterfly-garden", nameEn: "Butterfly Garden", nameHe: "גן פרפרים", icon: "flower2", category: "kids" },
  { id: "community-schools", nameEn: "Schools (Within Community)", nameHe: "בתי ספר בקהילה", icon: "graduationcap", category: "kids" },
  { id: "creative-workshops", nameEn: "Creative Workshops (Art/Music)", nameHe: "סדנאות יצירה (אמנות/מוזיקה)", icon: "palette", category: "kids" },

  // ── Entertainment & Leisure ────────────────────────────────────
  { id: "private-cinema", nameEn: "Private Cinema / Screening Room", nameHe: "קולנוע פרטי / חדר הקרנה", icon: "film", category: "entertainment" },
  { id: "indoor-cinema", nameEn: "Indoor Cinema / Movie Theatre", nameHe: "קולנוע מקורה (40 מושבים)", icon: "film", category: "entertainment" },
  { id: "outdoor-cinema", nameEn: "Outdoor Cinema", nameHe: "קולנוע חיצוני", icon: "film", category: "entertainment" },
  { id: "floating-cinema", nameEn: "Floating Cinema", nameHe: "קולנוע צף", icon: "film", category: "entertainment" },
  { id: "home-cinema", nameEn: "Private Home Cinema (In-Unit)", nameHe: "קולנוע ביתי פרטי (ביחידה)", icon: "tv", category: "entertainment" },
  { id: "residents-lounge", nameEn: "Residents' Lounge", nameHe: "טרקלין דיירים", icon: "users", category: "entertainment" },
  { id: "rooftop-lounge", nameEn: "Rooftop Lounge / Terrace", nameHe: "טרקלין על הגג", icon: "sun", category: "entertainment" },
  { id: "sky-lounge", nameEn: "Sky Lounge", nameHe: "סקיי לאונג׳", icon: "star", category: "entertainment" },
  { id: "observation-deck", nameEn: "Observatory / Observation Deck", nameHe: "תצפית פנורמית 360°", icon: "eye", category: "entertainment" },
  { id: "cigar-lounge", nameEn: "Cigar Lounge", nameHe: "טרקלין סיגרים", icon: "wind", category: "entertainment" },
  { id: "wine-cellar", nameEn: "Wine Cellar / Wine Room", nameHe: "חדר יינות / מרתף", icon: "wine", category: "entertainment" },
  { id: "game-room", nameEn: "Game Room / Entertainment Room", nameHe: "חדר משחקים / בילוי", icon: "gamepad2", category: "entertainment" },
  { id: "gaming-lounge", nameEn: "Gaming / E-Sports Lounge", nameHe: "לאונג׳ גיימינג / E-Sports", icon: "gamepad2", category: "entertainment" },
  { id: "library", nameEn: "Library / Reading Room", nameHe: "ספרייה / חדר קריאה", icon: "bookopen", category: "entertainment" },
  { id: "art-gallery", nameEn: "Art Gallery / Exhibition Space", nameHe: "גלריית אמנות / תערוכות", icon: "palette", category: "entertainment" },
  { id: "music-room", nameEn: "Music Room / Piano Room", nameHe: "חדר מוזיקה / פסנתר", icon: "music", category: "entertainment" },
  { id: "karaoke-room", nameEn: "Karaoke Room", nameHe: "חדר קריוקי", icon: "mic", category: "entertainment" },
  { id: "event-hall", nameEn: "Multipurpose / Event Hall", nameHe: "אולם אירועים רב תכליתי", icon: "star", category: "entertainment" },
  { id: "ballroom", nameEn: "Ballroom", nameHe: "אולם נשפים", icon: "star", category: "entertainment" },
  { id: "private-members-club", nameEn: "Private Members Club", nameHe: "מועדון חברים פרטי", icon: "star", category: "entertainment" },
  { id: "vip-owner-lounge", nameEn: "VIP Owner Lounge", nameHe: "טרקלין VIP לבעלים", icon: "star", category: "entertainment" },
  { id: "amphitheatre", nameEn: "Outdoor Amphitheatre", nameHe: "אמפיתיאטרון חיצוני", icon: "sparkles", category: "entertainment" },
  { id: "sculpture-garden", nameEn: "Sculpture Garden", nameHe: "גן פסלים", icon: "sparkles", category: "entertainment" },

  // ── Work & Business ────────────────────────────────────────────
  { id: "business-centre", nameEn: "Business Centre", nameHe: "מרכז עסקים", icon: "briefcase", category: "work" },
  { id: "co-working-space", nameEn: "Co-Working Space", nameHe: "חלל עבודה משותף (קו-וורקינג)", icon: "monitor", category: "work" },
  { id: "meeting-rooms", nameEn: "Meeting Rooms / Boardroom", nameHe: "חדרי ישיבות / דירקטוריון", icon: "users", category: "work" },
  { id: "conference-room", nameEn: "Conference Room", nameHe: "חדר כנסים", icon: "users", category: "work" },
  { id: "video-conference-room", nameEn: "Video Conferencing Room", nameHe: "חדר וידאו קונפרנס", icon: "video", category: "work" },
  { id: "presentation-area", nameEn: "Presentation Area", nameHe: "אזור מצגות", icon: "monitor", category: "work" },
  { id: "study-rooms", nameEn: "Study Rooms", nameHe: "חדרי לימוד", icon: "bookopen", category: "work" },
  { id: "business-lounge", nameEn: "Business Lounge", nameHe: "טרקלין עסקים", icon: "briefcase", category: "work" },
  { id: "podcast-room", nameEn: "Podcast / Content Room", nameHe: "חדר פודקאסט / תוכן", icon: "mic", category: "work" },
  { id: "acoustic-music-room", nameEn: "Acoustic Music Room", nameHe: "חדר מוזיקה אקוסטי", icon: "music", category: "work" },

  // ── Dining & BBQ ───────────────────────────────────────────────
  { id: "bbq-area", nameEn: "BBQ Area / Barbecue Deck", nameHe: "אזור ברביקיו", icon: "flame", category: "dining" },
  { id: "outdoor-kitchen", nameEn: "Outdoor Kitchen / Grill Stations", nameHe: "מטבח חיצוני / עמדות גריל", icon: "flame", category: "dining" },
  { id: "rooftop-bbq", nameEn: "Rooftop BBQ Terrace", nameHe: "ברביקיו קהילתי על הגג", icon: "flame", category: "dining" },
  { id: "chefs-table", nameEn: "Chef's Table / Show Kitchen", nameHe: "שולחן שף / מטבח פתוח", icon: "utensilscrossed", category: "dining" },
  { id: "private-dining", nameEn: "Private Dining Room", nameHe: "חדר אוכל פרטי", icon: "utensilscrossed", category: "dining" },
  { id: "outdoor-dining", nameEn: "Outdoor Dining Area", nameHe: "אזור אכילה חיצוני", icon: "sun", category: "dining" },
  { id: "shared-kitchen", nameEn: "Shared / Community Kitchen", nameHe: "מטבח משותף", icon: "utensilscrossed", category: "dining" },
  { id: "cafeteria", nameEn: "Cafeteria / Canteen", nameHe: "קפיטריה", icon: "coffee", category: "dining" },
  { id: "onsite-restaurants", nameEn: "On-Site Restaurants & Cafés", nameHe: "מסעדות ובתי קפה במתחם", icon: "coffee", category: "dining" },
  { id: "fine-dining", nameEn: "Fine Dining Restaurant", nameHe: "מסעדת פיין דיינינג", icon: "star", category: "dining" },
  { id: "floating-restaurant", nameEn: "Floating Restaurant", nameHe: "מסעדה צפה", icon: "ship", category: "dining" },

  // ── Beach & Waterfront ─────────────────────────────────────────
  { id: "private-beach", nameEn: "Private Beach / Beach Access", nameHe: "חוף פרטי / גישה לחוף", icon: "umbrella", category: "beach" },
  { id: "beach-club", nameEn: "Residents Beach Club", nameHe: "מועדון חוף לדיירים", icon: "star", category: "beach" },
  { id: "beach-cabanas", nameEn: "Beachfront Cabanas", nameHe: "קבאנות חוף", icon: "sun", category: "beach" },
  { id: "beach-attendant", nameEn: "Beach Attendant Services", nameHe: "שירות מלצרים בחוף", icon: "users", category: "beach" },
  { id: "artificial-beach", nameEn: "Artificial Sandy Beach", nameHe: "חוף חולי מלאכותי", icon: "umbrella", category: "beach" },
  { id: "pet-beach", nameEn: "Pet-Friendly Beach", nameHe: "אזור חוף ידידותי לכלבים", icon: "heart", category: "beach" },

  // ── Marina & Yachts ────────────────────────────────────────────
  { id: "marina", nameEn: "Marina / Marina Berths", nameHe: "מרינה / רציפי עגינה", icon: "anchor", category: "marina" },
  { id: "yacht-club", nameEn: "Yacht Club", nameHe: "מועדון יאכטות", icon: "ship", category: "marina" },
  { id: "private-marina", nameEn: "Private Marina Access", nameHe: "גישה למרינה פרטית", icon: "anchor", category: "marina" },
  { id: "yacht-cruises", nameEn: "Yacht Cruises", nameHe: "שייט יאכטות", icon: "ship", category: "marina" },
  { id: "private-jetty", nameEn: "Private Jetty / Boat Dock", nameHe: "רציף פרטי / מעגן סירות", icon: "anchor", category: "marina" },
  { id: "kayak-storage", nameEn: "Kayak / Paddleboard Storage", nameHe: "אחסון קיאק / סאפ", icon: "waves", category: "marina" },

  // ── Gardens & Outdoors ─────────────────────────────────────────
  { id: "landscaped-gardens", nameEn: "Landscaped Gardens & Lawns", nameHe: "גנים מעוצבים ומדשאות", icon: "trees", category: "outdoors" },
  { id: "community-parks", nameEn: "Community Parks / Green Spaces", nameHe: "פארקים קהילתיים / שטחים ירוקים", icon: "treepine", category: "outdoors" },
  { id: "rooftop-garden", nameEn: "Rooftop / Sky Garden", nameHe: "גינת גג / סקיי גארדן", icon: "leaf", category: "outdoors" },
  { id: "podium-garden", nameEn: "Podium Garden", nameHe: "גינת פודיום", icon: "treepine", category: "outdoors" },
  { id: "botanical-garden", nameEn: "Botanical Garden", nameHe: "גינה בוטנית", icon: "flower", category: "outdoors" },
  { id: "zen-garden", nameEn: "Zen Garden", nameHe: "גינת זן", icon: "sparkles", category: "outdoors" },
  { id: "sensory-garden", nameEn: "Sensory Garden", nameHe: "גינה חושית", icon: "flower2", category: "outdoors" },
  { id: "fragrance-garden", nameEn: "Fragrance Garden", nameHe: "גינת ניחוחות (יסמין/לבנדר)", icon: "flower", category: "outdoors" },
  { id: "edible-garden", nameEn: "Edible / Hydroponic Garden", nameHe: "גינה אכילה / הידרופונית", icon: "leaf", category: "outdoors" },
  { id: "community-garden", nameEn: "Community Garden Plots", nameHe: "חלקות גינה קהילתיות", icon: "leaf", category: "outdoors" },
  { id: "courtyard", nameEn: "Courtyard", nameHe: "חצר פנימית", icon: "trees", category: "outdoors" },
  { id: "picnic-area", nameEn: "Picnic Area / Pavilion", nameHe: "אזור פיקניק", icon: "sun", category: "outdoors" },
  { id: "open-lawns", nameEn: "Open Lawns / Event Lawn", nameHe: "מדשאות פתוחות / אירועים", icon: "trees", category: "outdoors" },
  { id: "forest-walk", nameEn: "Forest Walk", nameHe: "טיילת יער", icon: "treepine", category: "outdoors" },
  { id: "nature-trails", nameEn: "Nature / Walking Trails", nameHe: "שבילי טבע / הליכה", icon: "footprints", category: "outdoors" },
  { id: "jogging-track", nameEn: "Jogging / Running Track", nameHe: "שביל ריצה / ג׳וגינג", icon: "footprints", category: "outdoors" },
  { id: "cycling-track", nameEn: "Cycling Track", nameHe: "שביל אופניים", icon: "bike", category: "outdoors" },
  { id: "shaded-walkways", nameEn: "Shaded Walkways", nameHe: "שבילים מוצלים / מדרכות", icon: "footprints", category: "outdoors" },
  { id: "waterfront-promenade", nameEn: "Waterfront Promenade / Boardwalk", nameHe: "טיילת חוף / בורדווק", icon: "waves", category: "outdoors" },
  { id: "sun-deck", nameEn: "Sun Deck / Sunbathing Terrace", nameHe: "דק שמש / מרפסת שיזוף", icon: "sun", category: "outdoors" },
  { id: "fire-pits", nameEn: "Bonfire / Fire Pits", nameHe: "מדורות / פיירפיט", icon: "flame", category: "outdoors" },
  { id: "hammock-zone", nameEn: "Hammock Zone", nameHe: "אזור ערסלים", icon: "sun", category: "outdoors" },
  { id: "green-corridors", nameEn: "Green Corridors", nameHe: "מסדרונות ירוקים", icon: "treepine", category: "outdoors" },

  // ── Pets ────────────────────────────────────────────────────────
  { id: "pet-friendly", nameEn: "Pets Allowed / Pet-Friendly", nameHe: "מדיניות ידידותית לחיות מחמד", icon: "check", category: "pets" },
  { id: "dog-park", nameEn: "Dog Park / Pet Park", nameHe: "פארק כלבים", icon: "trees", category: "pets" },
  { id: "pet-play-area", nameEn: "Pet Play Area (Fenced)", nameHe: "אזור משחק לחיות (גדר/אג׳יליטי)", icon: "activity", category: "pets" },
  { id: "pet-grooming", nameEn: "Pet Grooming Salon / Pet Spa", nameHe: "סלון טיפוח / ספא לחיות", icon: "sparkles", category: "pets" },
  { id: "pet-walking-paths", nameEn: "Pet-Friendly Walking Paths", nameHe: "שבילי הליכה ידידותיים לחיות", icon: "footprints", category: "pets" },

  // ── Services & Concierge ───────────────────────────────────────
  { id: "concierge-247", nameEn: "24/7 Concierge Service", nameHe: "שירות קונסיירז׳ 24/7", icon: "bell", category: "services" },
  { id: "ai-concierge", nameEn: "AI Virtual Concierge", nameHe: "קונסיירז׳ וירטואלי AI", icon: "smartphone", category: "services" },
  { id: "butler-service", nameEn: "Butler Service", nameHe: "שירות באטלר", icon: "star", category: "services" },
  { id: "doorman-porter", nameEn: "Doorman & Porter", nameHe: "שוער ופורטר", icon: "users", category: "services" },
  { id: "valet-parking", nameEn: "Valet Parking Service", nameHe: "שירות חניון (ולט)", icon: "car", category: "services" },
  { id: "housekeeping", nameEn: "Housekeeping / Maid Service", nameHe: "ניקיון / משק בית", icon: "sparkles", category: "services" },
  { id: "room-service", nameEn: "In-Villa Dining / Room Service", nameHe: "הגשת אוכל ליחידה", icon: "utensilscrossed", category: "services" },
  { id: "laundry-service", nameEn: "Laundry & Dry Cleaning", nameHe: "כביסה וניקוי יבש", icon: "sparkles", category: "services" },
  { id: "chauffeur-service", nameEn: "Chauffeur / Limousine Service", nameHe: "שירות נהג / לימוזינה", icon: "car", category: "services" },
  { id: "bodyguard-service", nameEn: "Bodyguard Service", nameHe: "שירות מאבטח אישי", icon: "shield", category: "services" },
  { id: "floristry", nameEn: "Floristry Services", nameHe: "שירותי פרחים", icon: "flower", category: "services" },
  { id: "personal-shopping", nameEn: "Personal Shopping", nameHe: "סיוע בקניות אישיות", icon: "shoppingbag", category: "services" },
  { id: "travel-coordination", nameEn: "Travel Coordination", nameHe: "תיאום נסיעות / הזמנות", icon: "plane", category: "services" },
  { id: "event-planning", nameEn: "Event Planning", nameHe: "תכנון אירועים", icon: "star", category: "services" },
  { id: "babysitting", nameEn: "Babysitting / Nanny Coordination", nameHe: "תיאום בייביסיטר / מטפלת", icon: "baby", category: "services" },
  { id: "car-wash", nameEn: "Automatic Car Wash", nameHe: "שטיפת רכב אוטומטית", icon: "car", category: "services" },
  { id: "pool-beach-service", nameEn: "Beach/Pool F&B Service", nameHe: "שירות מלצרים בחוף/בריכה", icon: "sun", category: "services" },
  { id: "maintenance-staff", nameEn: "Maintenance Staff", nameHe: "צוות תחזוקה", icon: "wrench", category: "services" },
  { id: "maintenance-24h", nameEn: "24-Hour Maintenance", nameHe: "תחזוקה 24 שעות", icon: "timer", category: "services" },

  // ── Security & Access ──────────────────────────────────────────
  { id: "security-247", nameEn: "24/7 Security", nameHe: "אבטחה 24/7", icon: "shield", category: "security" },
  { id: "cctv", nameEn: "CCTV Surveillance", nameHe: "מצלמות אבטחה (CCTV)", icon: "camera", category: "security" },
  { id: "gated-community", nameEn: "Gated Community", nameHe: "קהילה סגורה / גישה מבוקרת", icon: "lock", category: "security" },
  { id: "biometric-access", nameEn: "Biometric Access", nameHe: "כניסה ביומטרית", icon: "key", category: "security" },
  { id: "keycard-access", nameEn: "Key Card Access", nameHe: "כניסה בכרטיס", icon: "key", category: "security" },
  { id: "private-elevator", nameEn: "Private / Dedicated Elevator", nameHe: "מעלית פרטית / ייעודית", icon: "lock", category: "security" },
  { id: "access-elevators", nameEn: "Access-Controlled Elevators", nameHe: "מעליות עם בקרת גישה", icon: "lock", category: "security" },
  { id: "private-lobby", nameEn: "Private Lobby / Entrance", nameHe: "לובי פרטי / כניסה ייעודית", icon: "lock", category: "security" },
  { id: "staff-entrances", nameEn: "Discreet Staff Entrances", nameHe: "כניסות צוות נפרדות", icon: "eye", category: "security" },
  { id: "intercom", nameEn: "Intercom / Video Entry", nameHe: "אינטרקום / כניסת וידאו", icon: "phone", category: "security" },
  { id: "visitor-management", nameEn: "Visitor Management System", nameHe: "מערכת ניהול מבקרים", icon: "monitor", category: "security" },
  { id: "fire-safety", nameEn: "Fire Safety System", nameHe: "מערכת כיבוי אש", icon: "shield", category: "security" },
  { id: "guardhouse", nameEn: "Security Guardhouse", nameHe: "בית שמירה / שער כניסה", icon: "shield", category: "security" },
  { id: "accessible-facilities", nameEn: "Accessible / Disabled Facilities", nameHe: "מתקנים לבעלי מוגבלויות", icon: "users", category: "security" },

  // ── Parking & Transport ────────────────────────────────────────
  { id: "covered-parking", nameEn: "Covered / Underground Parking", nameHe: "חניה מקורה / תת קרקעית", icon: "car", category: "parking" },
  { id: "dedicated-parking", nameEn: "Dedicated Parking Spaces", nameHe: "חניה ייעודית", icon: "car", category: "parking" },
  { id: "visitor-parking", nameEn: "Guest / Visitor Parking", nameHe: "חניית אורחים", icon: "car", category: "parking" },
  { id: "private-garage", nameEn: "Private Garage (Multi-Car)", nameHe: "מוסך פרטי (רב-מכוני)", icon: "star", category: "parking" },
  { id: "car-elevator", nameEn: "Private Car Elevator / Car Lift", nameHe: "מעלית רכב פרטית", icon: "car", category: "parking" },
  { id: "show-garage", nameEn: "Show Garage (10+ Cars)", nameHe: "מוסך תצוגה (10+ רכבים)", icon: "star", category: "parking" },
  { id: "ev-charging", nameEn: "EV Charging Stations", nameHe: "עמדות טעינה לרכב חשמלי", icon: "zap", category: "parking" },
  { id: "bicycle-storage", nameEn: "Bicycle Storage", nameHe: "אחסון אופניים", icon: "bike", category: "parking" },
  { id: "helipad", nameEn: "Helipad", nameHe: "נחיתת מסוקים (הליפד)", icon: "plane", category: "parking" },
  { id: "airport-shuttle", nameEn: "Airport Shuttle / Limousine", nameHe: "שאטל לשדה תעופה", icon: "car", category: "parking" },
  { id: "mobility-hub", nameEn: "Mobility Hub", nameHe: "מרכז ניידות", icon: "car", category: "parking" },
  { id: "metro-access", nameEn: "Metro Station Access", nameHe: "גישה לתחנת מטרו", icon: "mappin", category: "parking" },
  { id: "monorail-access", nameEn: "Palm Monorail Access", nameHe: "גישה למונורייל", icon: "car", category: "parking" },
  { id: "high-speed-elevators", nameEn: "High-Speed Elevators", nameHe: "מעליות מהירות", icon: "activity", category: "parking" },
  { id: "panoramic-elevators", nameEn: "Panoramic / Glass Elevators", nameHe: "מעליות פנורמיות / זכוכית", icon: "eye", category: "parking" },
  { id: "drop-off-area", nameEn: "Drop-Off with Separate Entry", nameHe: "אזור הורדה עם כניסה נפרדת", icon: "car", category: "parking" },

  // ── Technology & Smart Home ────────────────────────────────────
  { id: "smart-home", nameEn: "Smart Home Automation", nameHe: "מערכת בית חכם (תאורה/AC/וילונות)", icon: "home", category: "tech" },
  { id: "voice-control", nameEn: "Voice-Controlled Systems", nameHe: "שליטה קולית (אלקסה/גוגל)", icon: "mic", category: "tech" },
  { id: "residents-app", nameEn: "Residents' App", nameHe: "אפליקציית דיירים", icon: "smartphone", category: "tech" },
  { id: "fiber-internet", nameEn: "High-Speed / Fiber Optic Internet", nameHe: "אינטרנט מהיר / סיבים אופטיים", icon: "wifi", category: "tech" },
  { id: "building-wifi", nameEn: "In-Building Wi-Fi", nameHe: "Wi-Fi בשטחים ציבוריים", icon: "wifi", category: "tech" },
  { id: "satellite-tv", nameEn: "Satellite / Cable TV", nameHe: "חיבור לוויין / כבלים", icon: "tv", category: "tech" },
  { id: "av-systems", nameEn: "Integrated AV Systems", nameHe: "מערכות אודיו/וידאו משולבות", icon: "monitor", category: "tech" },
  { id: "home-panels", nameEn: "Home Automation Panels", nameHe: "פאנלים לשליטה על הבית", icon: "smartphone", category: "tech" },
  { id: "energy-monitoring", nameEn: "Smart Energy Monitoring", nameHe: "ניטור אנרגיה חכם", icon: "zap", category: "tech" },
  { id: "district-cooling", nameEn: "District Cooling", nameHe: "מערכת קירור מרכזית", icon: "thermometer", category: "tech" },
  { id: "power-backup", nameEn: "Power Backup / Generator", nameHe: "גיבוי חשמל / גנרטור", icon: "battery", category: "tech" },
  { id: "5g-coverage", nameEn: "Full 5G Coverage", nameHe: "כיסוי 5G מלא", icon: "globe", category: "tech" },
  { id: "water-filtration", nameEn: "Central Water Filtration", nameHe: "מערכת סינון מים מרכזית", icon: "droplet", category: "tech" },

  // ── Retail & Community ─────────────────────────────────────────
  { id: "supermarket", nameEn: "Supermarket / Grocery", nameHe: "סופרמרקט / מכולת", icon: "shoppingbag", category: "retail" },
  { id: "retail-outlets", nameEn: "Retail Outlets / Boutiques", nameHe: "חנויות / בוטיקים", icon: "store", category: "retail" },
  { id: "shopping-mall", nameEn: "Shopping Mall (Within Community)", nameHe: "קניון בקהילה", icon: "store", category: "retail" },
  { id: "souk", nameEn: "Souk (Traditional Market)", nameHe: "שוק (סוק)", icon: "store", category: "retail" },
  { id: "retail-restaurants", nameEn: "Restaurants & Cafés", nameHe: "מסעדות ובתי קפה", icon: "coffee", category: "retail" },
  { id: "pharmacy", nameEn: "Pharmacy", nameHe: "בית מרקחת", icon: "heart", category: "retail" },
  { id: "medical-clinic", nameEn: "Medical Clinic", nameHe: "מרפאה / מרכז בריאות", icon: "heart", category: "retail" },
  { id: "bank-atm", nameEn: "Bank / ATM", nameHe: "בנק / כספומט", icon: "building", category: "retail" },
  { id: "parcel-room", nameEn: "Smart Parcel / Mail Room", nameHe: "חדר דואר וחבילות חכם", icon: "package", category: "retail" },
  { id: "dry-cleaners", nameEn: "Dry Cleaners", nameHe: "ניקוי יבש", icon: "store", category: "retail" },
  { id: "florist-shop", nameEn: "Florist", nameHe: "חנות פרחים", icon: "flower", category: "retail" },
  { id: "pet-shop", nameEn: "Pet Shop", nameHe: "חנות חיות מחמד", icon: "heart", category: "retail" },
  { id: "food-court", nameEn: "Food Court / Food Hall", nameHe: "פוד קורט / אולם אוכל", icon: "utensilscrossed", category: "retail" },
  { id: "onsite-salon", nameEn: "On-Site Salon / Barber", nameHe: "מספרה / סלון יופי במתחם", icon: "sparkles", category: "retail" },

  // ── Religious & Cultural ───────────────────────────────────────
  { id: "prayer-room", nameEn: "Prayer Room / Musalla", nameHe: "חדר תפילה / מוסאלה", icon: "bookopen", category: "religious" },
  { id: "mosque", nameEn: "Mosque (Community)", nameHe: "מסגד בקהילה / בסמוך", icon: "landmark", category: "religious" },
  { id: "community-centre", nameEn: "Community Centre", nameHe: "מרכז קהילתי", icon: "users", category: "religious" },
  { id: "cultural-space", nameEn: "Cultural / Performing Arts", nameHe: "חלל תרבות / אמנויות", icon: "palette", category: "religious" },
  { id: "music-hall", nameEn: "Music Hall", nameHe: "אולם מוזיקה", icon: "music", category: "religious" },

  // ── Sustainability & Green ─────────────────────────────────────
  { id: "solar-panels", nameEn: "Solar Panels", nameHe: "פאנלים סולאריים", icon: "sun", category: "sustainability" },
  { id: "leed-certification", nameEn: "LEED / Estidama Certification", nameHe: "תקן ירוק LEED / אסתדאמה", icon: "award", category: "sustainability" },
  { id: "efficient-hvac", nameEn: "Energy-Efficient HVAC", nameHe: "מערכת HVAC חסכונית", icon: "wind", category: "sustainability" },
  { id: "double-glazed", nameEn: "Double-Glazed Windows", nameHe: "חלונות זיגוג כפול", icon: "eye", category: "sustainability" },
  { id: "rainwater-recycling", nameEn: "Rainwater / Water Recycling", nameHe: "איסוף מי גשם / מיחזור מים", icon: "droplets", category: "sustainability" },
  { id: "greywater-recycling", nameEn: "Greywater Recycling", nameHe: "מיחזור מים אפורים", icon: "droplet", category: "sustainability" },
  { id: "green-materials", nameEn: "Green / Low-VOC Materials", nameHe: "חומרי בנייה ירוקים / Low-VOC", icon: "leaf", category: "sustainability" },
  { id: "recycling-stations", nameEn: "Recycling Stations", nameHe: "תחנות מיחזור", icon: "leaf", category: "sustainability" },
  { id: "energy-walkways", nameEn: "Energy-Generating Walkways", nameHe: "מדרכות מייצרות אנרגיה", icon: "zap", category: "sustainability" },

  // ── Unit Features ──────────────────────────────────────────────
  { id: "balcony-terrace", nameEn: "Balcony / Terrace", nameHe: "מרפסת / טרסה", icon: "sun", category: "unit" },
  { id: "private-garden-unit", nameEn: "Private Garden", nameHe: "גינה פרטית (קרקע/וילה)", icon: "trees", category: "unit" },
  { id: "private-rooftop", nameEn: "Private Rooftop", nameHe: "גג פרטי (פנטהאוז)", icon: "sun", category: "unit" },
  { id: "wraparound-balcony", nameEn: "Wraparound Balcony", nameHe: "מרפסת עוטפת", icon: "sun", category: "unit" },
  { id: "built-in-wardrobes", nameEn: "Built-in Wardrobes", nameHe: "ארונות קיר", icon: "home", category: "unit" },
  { id: "walk-in-closet", nameEn: "Walk-in Closet / Dressing Room", nameHe: "חדר ארונות / הלבשה", icon: "home", category: "unit" },
  { id: "maids-room", nameEn: "Maid's Room", nameHe: "חדר עוזרת בית", icon: "users", category: "unit" },
  { id: "drivers-room", nameEn: "Driver's Room", nameHe: "חדר נהג", icon: "car", category: "unit" },
  { id: "home-office", nameEn: "Study / Home Office", nameHe: "חדר עבודה / משרד ביתי", icon: "bookopen", category: "unit" },
  { id: "storage-room", nameEn: "Storage Room", nameHe: "מחסן", icon: "package", category: "unit" },
  { id: "laundry-room", nameEn: "Laundry Room", nameHe: "חדר כביסה", icon: "droplet", category: "unit" },
  { id: "fitted-kitchen", nameEn: "Fully Fitted Kitchen", nameHe: "מטבח מאובזר מלא", icon: "utensilscrossed", category: "unit" },
  { id: "kitchen-appliances", nameEn: "Kitchen Appliances", nameHe: "מכשירי חשמל למטבח", icon: "home", category: "unit" },
  { id: "central-ac", nameEn: "Central A/C", nameHe: "מיזוג מרכזי", icon: "thermometer", category: "unit" },
  { id: "marble-flooring", nameEn: "Marble / Stone Flooring", nameHe: "ריצוף שיש / אבן טבעית", icon: "sparkles", category: "unit" },
  { id: "wood-floors", nameEn: "Solid Wood Floors", nameHe: "פרקט עץ מלא", icon: "home", category: "unit" },
  { id: "building-lobby", nameEn: "Lobby in Building", nameHe: "לובי בבניין", icon: "building", category: "unit" },
  { id: "front-desk-24h", nameEn: "24-Hour Front Desk", nameHe: "קבלה / דלפק קדמי 24/7", icon: "users", category: "unit" },
  { id: "secure-storage", nameEn: "Secure Storage / Lockers", nameHe: "אחסון מאובטח / לוקרים", icon: "lock", category: "unit" },

  // ── Views & Status ─────────────────────────────────────────────
  { id: "sea-view", nameEn: "Sea / Water View", nameHe: "נוף לים / מים", icon: "waves", category: "views" },
  { id: "landmark-view", nameEn: "Landmark View", nameHe: "נוף לציון דרך", icon: "landmark", category: "views" },
  { id: "garden-view", nameEn: "Garden View", nameHe: "נוף לגינות", icon: "trees", category: "views" },
  { id: "golf-view", nameEn: "Golf Course View", nameHe: "נוף למגרש גולף", icon: "flag", category: "views" },
  { id: "park-view", nameEn: "Parkland View", nameHe: "נוף לפארק", icon: "trees", category: "views" },
  { id: "community-view", nameEn: "Community View", nameHe: "נוף קהילתי", icon: "building", category: "views" },
  { id: "furnished", nameEn: "Furnished", nameHe: "מרוהט", icon: "home", category: "views" },
  { id: "partly-furnished", nameEn: "Partly Furnished", nameHe: "מרוהט חלקית", icon: "home", category: "views" },
  { id: "unfurnished", nameEn: "Unfurnished", nameHe: "לא מרוהט", icon: "home", category: "views" },
  { id: "vastu-compliant", nameEn: "Vastu Compliant", nameHe: "תואם וואסטו", icon: "compass", category: "views" },
  { id: "freehold", nameEn: "Freehold", nameHe: "פריהולד", icon: "key", category: "views" },
  { id: "pets-allowed-status", nameEn: "Pets Allowed", nameHe: "מותר חיות מחמד", icon: "heart", category: "views" },
];

// ----------------------------------------------------------------
// Custom fallback icons – each custom amenity gets a unique icon
// ----------------------------------------------------------------

const CUSTOM_FALLBACK_ICONS: LucideIcon[] = [
  Rocket, Gem, Crown, Lightbulb, Feather, Compass, Palette, Radio,
  Globe, Headphones, Mic, Camera, Zap, Award, Star, Flag, Target,
  Flower2, Mountain, Anchor,
];

const CUSTOM_FALLBACK_KEYS: string[] = [
  "rocket", "gem", "crown", "lightbulb", "feather", "compass", "palette", "radio",
  "globe", "headphones", "mic", "camera", "zap", "award", "star", "flag", "target",
  "flower2", "mountain", "anchor",
];

// ----------------------------------------------------------------
// Icon resolver (local – only for the admin picker display)
// ----------------------------------------------------------------

const localIconMap: Record<string, LucideIcon> = {
  waves: Waves,
  pool: Waves,
  droplets: Droplets,
  droplet: Droplet,
  snowflake: Snowflake,
  sun: Sun,
  thermometer: Thermometer,
  flame: Flame,
  dumbbell: Dumbbell,
  activity: Activity,
  bike: Bike,
  mountain: Mountain,
  flag: Flag,
  target: Target,
  trophy: Trophy,
  heart: Heart,
  sparkles: Sparkles,
  wind: Wind,
  flower2: Flower2,
  flower: Flower,
  baby: Baby,
  users: Users,
  graduationcap: GraduationCap,
  palette: Palette,
  film: Film,
  gamepad2: Gamepad2,
  music: Music,
  bookopen: BookOpen,
  mic: Mic,
  briefcase: Briefcase,
  monitor: Monitor,
  video: Video,
  wifi: Wifi,
  utensilscrossed: UtensilsCrossed,
  coffee: Coffee,
  wine: Wine,
  umbrella: Umbrella,
  anchor: Anchor,
  ship: Ship,
  compass: Compass,
  treepine: TreePine,
  trees: Trees,
  leaf: Leaf,
  mappin: MapPin,
  footprints: Footprints,
  bell: Bell,
  star: Star,
  award: Award,
  shield: Shield,
  lock: Lock,
  eye: Eye,
  camera: Camera,
  key: Key,
  car: Car,
  zap: Zap,
  plane: Plane,
  smartphone: Smartphone,
  home: Home,
  globe: Globe,
  store: Store,
  shoppingbag: ShoppingBag,
  package: Package,
  building: Building,
  landmark: Landmark,
  battery: Battery,
  tv: Tv,
  phone: Phone,
  timer: Timer,
  wrench: Wrench,
  pawprint: PawPrint,
  square: Square,
  circle: Circle,
  check: Check,
  rocket: Rocket,
  gem: Gem,
  crown: Crown,
  lightbulb: Lightbulb,
  feather: Feather,
  headphones: Headphones,
  radio: Radio,
};

function resolveIcon(iconKey: string): LucideIcon {
  return localIconMap[iconKey] || Sparkles;
}

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------

interface AmenitiesEditorProps {
  /** Currently selected amenity IDs (stable across saves) */
  selectedIds: string[];
  /** Callback when selection changes – returns array of amenity IDs */
  onChange: (selectedIds: string[]) => void;
  /** Direction – for RTL support */
  dir?: "rtl" | "ltr";
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export function AmenitiesEditor({ selectedIds, onChange, dir = "rtl" }: AmenitiesEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customNameHe, setCustomNameHe] = useState("");
  const [customNameEn, setCustomNameEn] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSelectedPanel, setShowSelectedPanel] = useState(false);

  const isRtl = dir === "rtl";

  // Build a set for O(1) lookup
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Merge master list + any custom entries that were already selected
  // Custom IDs look like "custom-<slug>"
  const customIds = useMemo(
    () => selectedIds.filter((id) => id.startsWith("custom:")),
    [selectedIds],
  );

  // Parse custom amenity data from the ID (format: "custom:<nameHe>|<nameEn>")
  const parseCustomId = (id: string): { nameHe: string; nameEn: string } => {
    const payload = id.replace("custom:", "");
    const [nameHe, nameEn] = payload.split("|");
    return { nameHe: nameHe || "", nameEn: nameEn || "" };
  };

  // Popular amenities preset (most commonly used)
  const popularAmenityIds = useMemo(() => [
    "swimming-pool",
    "gym",
    "security-247",
    "covered-parking",
    "smart-home",
    "concierge-247",
    "bbq-area",
    "outdoor-playground",
    "ev-charging",
    "fiber-internet",
  ], []);

  // Search / filter with highlighting support
  const filteredAmenities = useMemo(() => {
    if (!searchQuery.trim()) return AMENITIES;
    const q = searchQuery.toLowerCase().trim();
    return AMENITIES.filter(
      (a) =>
        a.nameEn.toLowerCase().includes(q) ||
        a.nameHe.includes(q) ||
        a.id.includes(q),
    );
  }, [searchQuery]);

  // Group by category
  const groupedAmenities = useMemo(() => {
    const groups: Record<string, AmenityDefinition[]> = {};
    for (const cat of CATEGORIES) {
      groups[cat.id] = [];
    }
    for (const a of filteredAmenities) {
      if (groups[a.category]) {
        groups[a.category].push(a);
      }
    }
    return groups;
  }, [filteredAmenities]);

  // Toggle an amenity with animation
  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  // Add a custom amenity
  const addCustom = () => {
    const heVal = customNameHe.trim();
    if (!heVal) return;
    const enVal = customNameEn.trim() || heVal;
    const customId = `custom:${heVal}|${enVal}`;
    if (!selectedSet.has(customId)) {
      onChange([...selectedIds, customId]);
    }
    setCustomNameHe("");
    setCustomNameEn("");
  };

  // Toggle category collapse
  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  // Select/Deselect all in a category
  const selectAllInCategory = (catId: string) => {
    const items = groupedAmenities[catId] || [];
    const allIds = items.map(a => a.id);
    const allSelected = allIds.every(id => selectedSet.has(id));

    if (allSelected) {
      // Deselect all
      onChange(selectedIds.filter(id => !allIds.includes(id)));
    } else {
      // Select all
      const newIds = [...selectedIds];
      allIds.forEach(id => {
        if (!selectedSet.has(id)) {
          newIds.push(id);
        }
      });
      onChange(newIds);
    }
  };

  // Select popular amenities preset
  const selectPopularAmenities = () => {
    const newIds = [...selectedIds];
    popularAmenityIds.forEach(id => {
      if (!selectedSet.has(id)) {
        newIds.push(id);
      }
    });
    onChange(newIds);
  };

  // Count selected per category
  const selectedCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat.id] = 0;
    }
    for (const id of selectedIds) {
      if (id.startsWith("custom:")) {
        counts["views"] = (counts["views"] || 0) + 1;
        continue;
      }
      const def = AMENITIES.find((a) => a.id === id);
      if (def) {
        counts[def.category] = (counts[def.category] || 0) + 1;
      }
    }
    return counts;
  }, [selectedIds]);

  // Group selected amenities by category for the summary panel
  const selectedByCategory = useMemo(() => {
    const groups: Record<string, { category: CategoryMeta; items: { id: string; label: string; icon: LucideIcon }[] }> = {};

    for (const id of selectedIds) {
      if (id.startsWith("custom:")) {
        const catId = "views";
        if (!groups[catId]) {
          groups[catId] = {
            category: CATEGORIES.find(c => c.id === catId)!,
            items: []
          };
        }
        const parsed = parseCustomId(id);
        const customIndex = customIds.indexOf(id);
        groups[catId].items.push({
          id,
          label: isRtl ? parsed.nameHe : parsed.nameEn,
          icon: CUSTOM_FALLBACK_ICONS[customIndex >= 0 ? customIndex % CUSTOM_FALLBACK_ICONS.length : 0]
        });
        continue;
      }

      const def = AMENITIES.find(a => a.id === id);
      if (def) {
        if (!groups[def.category]) {
          groups[def.category] = {
            category: CATEGORIES.find(c => c.id === def.category)!,
            items: []
          };
        }
        groups[def.category].items.push({
          id,
          label: isRtl ? def.nameHe : def.nameEn,
          icon: resolveIcon(def.icon)
        });
      }
    }

    return Object.values(groups);
  }, [selectedIds, customIds, isRtl]);

  // Highlight matching text in search results
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    // Escape special regex characters to prevent ReDoS
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? `<mark class="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">${part}</mark>`
        : part
    ).join('');
  };

  // Scroll to category
  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const element = document.getElementById(`category-${catId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-4" dir={dir}>
      {/* Sticky header: search + actions */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-3 border-b">
        <div className="space-y-3">
          {/* Add custom amenity - prominent at top */}
          <Card className="p-3 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">
                {isRtl ? "הוסף מתקן מותאם אישית" : "Add Custom Amenity"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                value={customNameHe}
                onChange={(e) => setCustomNameHe(e.target.value)}
                placeholder={isRtl ? "שם בעברית *" : "Hebrew name *"}
                className="flex-1 min-w-[140px]"
                dir="rtl"
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                data-testid="input-custom-amenity-he"
              />
              <Input
                value={customNameEn}
                onChange={(e) => setCustomNameEn(e.target.value)}
                placeholder={isRtl ? "שם באנגלית" : "English name"}
                className="flex-1 min-w-[140px]"
                dir="ltr"
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                data-testid="input-custom-amenity-en"
              />
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={addCustom}
                disabled={!customNameHe.trim()}
                data-testid="button-add-custom-amenity"
                className="px-3"
              >
                <Plus className="h-4 w-4 me-1" />
                {isRtl ? "הוסף" : "Add"}
              </Button>
            </div>
          </Card>

          {/* Search bar */}
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? "right-3" : "left-3"}`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "חיפוש מתקן..." : "Search amenities..."}
              className={`${isRtl ? "pe-9 ps-9" : "ps-9 pe-9"}`}
              dir={dir}
              data-testid="input-amenity-search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-3" : "right-3"} text-muted-foreground hover:text-foreground transition-colors`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick actions bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectPopularAmenities}
              className="text-xs"
            >
              <Star className="h-3 w-3 me-1" />
              {isRtl ? "מתקנים פופולריים" : "Popular"}
            </Button>
            <Button
              type="button"
              variant={showSelectedPanel ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSelectedPanel(!showSelectedPanel)}
              className="text-xs"
            >
              <Check className="h-3 w-3 me-1" />
              {isRtl ? `נבחרו (${selectedIds.length})` : `Selected (${selectedIds.length})`}
            </Button>
            {selectedIds.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                onClick={() => onChange([])}
                data-testid="button-clear-amenities"
              >
                <X className="h-3 w-3 me-1" />
                {isRtl ? "נקה הכל" : "Clear all"}
              </Button>
            )}
          </div>

          {/* Category sidebar chips (mobile) / sidebar (desktop) */}
          <div className="lg:hidden">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                {CATEGORIES.map((cat) => {
                  const count = selectedCountByCategory[cat.id] || 0;
                  const CatIcon = cat.Icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => scrollToCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : count > 0
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-muted border-border hover:border-primary/50"
                      }`}
                    >
                      <CatIcon className="h-3 w-3" />
                      <span>{isRtl ? cat.nameHe : cat.nameEn}</span>
                      {count > 0 && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 min-w-[16px] rounded-full">
                          {count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Main layout with sidebar (desktop only) */}
      <div className="flex gap-4">
        {/* Sticky category sidebar - desktop only */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-[280px]">
            <Card className="p-2">
              <ScrollArea className="h-[calc(100vh-360px)]">
                <div className="space-y-1 pe-2">
                  {CATEGORIES.map((cat) => {
                    const count = selectedCountByCategory[cat.id] || 0;
                    const CatIcon = cat.Icon;
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => scrollToCategory(cat.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : count > 0
                              ? "bg-primary/10 text-primary hover:bg-primary/20"
                              : "hover:bg-muted"
                        }`}
                      >
                        <CatIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-start truncate">
                          {isRtl ? cat.nameHe : cat.nameEn}
                        </span>
                        {count > 0 && (
                          <Badge variant={isActive ? "secondary" : "default"} className="text-[10px] px-1.5 py-0 h-5 min-w-[20px]">
                            {count}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Selected amenities panel */}
          {showSelectedPanel && selectedIds.length > 0 && (
            <Card className="p-4 mb-4 border-2 border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  {isRtl ? `מתקנים שנבחרו (${selectedIds.length})` : `Selected Amenities (${selectedIds.length})`}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSelectedPanel(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {selectedByCategory.map(({ category, items }) => (
                  <div key={category.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <category.Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {isRtl ? category.nameHe : category.nameEn}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 ms-5">
                      {items.map(({ id, label, icon: Icon }) => (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="gap-1.5 cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-all text-xs group"
                          onClick={() => toggle(id)}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{label}</span>
                          <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Search results indicator */}
          {searchQuery && (
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>
                {isRtl
                  ? `נמצאו ${filteredAmenities.length} תוצאות עבור "${searchQuery}"`
                  : `Found ${filteredAmenities.length} results for "${searchQuery}"`
                }
              </span>
            </div>
          )}

          {/* Category groups */}
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const items = groupedAmenities[cat.id] || [];
              const isCollapsed = collapsedCategories.has(cat.id);
              const catCount = selectedCountByCategory[cat.id] || 0;
              const allSelected = items.length > 0 && items.every(a => selectedSet.has(a.id));

              // Hide categories with no matching items during search
              if (searchQuery.trim() && items.length === 0) return null;

              const CatIcon = cat.Icon;

              return (
                <Card key={cat.id} id={`category-${cat.id}`} className="overflow-hidden scroll-mt-4">
                  {/* Category header */}
                  <div className="flex items-center justify-between gap-2 p-3 bg-muted/30">
                    <button
                      type="button"
                      className="flex items-center gap-2 flex-1 min-w-0"
                      onClick={() => toggleCategory(cat.id)}
                      data-testid={`category-toggle-${cat.id}`}
                    >
                      <CatIcon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="font-semibold text-sm truncate">
                        {isRtl ? cat.nameHe : cat.nameEn}
                      </span>
                      {catCount > 0 && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center">
                          {catCount}
                        </Badge>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => selectAllInCategory(cat.id)}
                        className="text-xs h-7 px-2"
                      >
                        {allSelected
                          ? (isRtl ? "בטל הכל" : "Deselect")
                          : (isRtl ? "בחר הכל" : "Select all")
                        }
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategory(cat.id)}
                        className="h-7 w-7 p-0"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Amenity grid */}
                  {!isCollapsed && (
                    <div className="p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {items.map((amenity) => {
                          const isSelected = selectedSet.has(amenity.id);
                          const Icon = resolveIcon(amenity.icon);
                          const displayName = isRtl ? amenity.nameHe : amenity.nameEn;

                          return (
                            <button
                              key={amenity.id}
                              type="button"
                              onClick={() => toggle(amenity.id)}
                              className={`
                                group relative flex items-center gap-2.5 p-3 rounded-lg border text-sm transition-all duration-200
                                ${
                                  isSelected
                                    ? "bg-primary/10 border-primary text-primary font-medium shadow-md scale-[1.02]"
                                    : "bg-background border-border hover:bg-muted/80 hover:border-primary/30 hover:shadow-sm text-foreground"
                                }
                              `}
                              data-testid={`amenity-${amenity.id}`}
                            >
                              {/* Checkbox-style indicator */}
                              <div className={`
                                flex items-center justify-center w-5 h-5 rounded border-2 flex-shrink-0 transition-all
                                ${isSelected
                                  ? "bg-primary border-primary"
                                  : "border-muted-foreground/30 group-hover:border-primary/50"
                                }
                              `}>
                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>

                              <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${
                                isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                              }`} />

                              <span
                                className="truncate text-start flex-1"
                                dangerouslySetInnerHTML={{
                                  __html: searchQuery ? highlightText(displayName, searchQuery) : displayName
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Custom amenities section */}
          {customIds.length > 0 && (
            <Card className="p-4 mt-4 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">
                  {isRtl ? "מתקנים מותאמים אישית" : "Custom Amenities"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {customIds.map((id, idx) => {
                  const parsed = parseCustomId(id);
                  const FallbackIcon = CUSTOM_FALLBACK_ICONS[idx % CUSTOM_FALLBACK_ICONS.length];
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="gap-1.5 cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-all group"
                      onClick={() => toggle(id)}
                    >
                      <FallbackIcon className="h-3 w-3" />
                      <span>{isRtl ? parsed.nameHe : parsed.nameEn}</span>
                      <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Badge>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Helper: convert selectedIds into the amenities JSON structure
// that the project schema expects:
//   [{ category, items: [{ icon, name, nameHe }] }]
// ----------------------------------------------------------------

export function amenityIdsToSchema(selectedIds: string[]): AmenityOutput[] {
  const categoryMap = new Map<string, { categoryEn: string; items: SelectedAmenity[] }>();

  // Track custom index for fallback icon assignment
  let customIndex = 0;

  for (const id of selectedIds) {
    if (id.startsWith("custom:")) {
      const payload = id.replace("custom:", "");
      const [nameHe, nameEn] = payload.split("|");
      const catKey = "views";
      if (!categoryMap.has(catKey)) {
        const meta = CATEGORIES.find((c) => c.id === catKey)!;
        categoryMap.set(catKey, { categoryEn: meta.nameEn, items: [] });
      }
      categoryMap.get(catKey)!.items.push({
        icon: CUSTOM_FALLBACK_KEYS[customIndex % CUSTOM_FALLBACK_KEYS.length],
        name: nameEn || nameHe || "",
        nameHe: nameHe || "",
        _id: id,
      });
      customIndex++;
      continue;
    }

    const def = AMENITIES.find((a) => a.id === id);
    if (!def) continue;

    if (!categoryMap.has(def.category)) {
      const meta = CATEGORIES.find((c) => c.id === def.category);
      categoryMap.set(def.category, {
        categoryEn: meta?.nameEn || def.category,
        items: [],
      });
    }
    categoryMap.get(def.category)!.items.push({
      icon: def.icon,
      name: def.nameEn,
      nameHe: def.nameHe,
      _id: def.id,
    });
  }

  // Return in the same order as CATEGORIES
  const result: AmenityOutput[] = [];
  for (const cat of CATEGORIES) {
    const entry = categoryMap.get(cat.id);
    if (entry && entry.items.length > 0) {
      result.push({
        category: cat.nameHe,
        categoryEn: cat.nameEn,
        items: entry.items,
      });
    }
  }
  return result;
}

// ----------------------------------------------------------------
// Helper: convert schema amenities back to selectedIds (for editing)
// ----------------------------------------------------------------

export function schemaToAmenityIds(
  amenities: Array<{ category?: string; items?: Array<{ icon?: string; name?: string; nameHe?: string; _id?: string }> }> | null | undefined,
): string[] {
  if (!amenities) return [];
  const ids: string[] = [];

  for (const cat of amenities) {
    if (!cat || !cat.items) continue;
    for (const item of cat.items) {
      // If the item has a stored _id, use it directly for perfect round-trip
      if (item._id) {
        ids.push(item._id);
        continue;
      }

      // Try to match against the master list by name
      const match = AMENITIES.find(
        (a) =>
          a.nameHe === item.nameHe ||
          a.nameEn === item.name ||
          a.nameHe === item.name,
      );
      if (match) {
        ids.push(match.id);
      } else {
        // Detect corrupted data: comma-separated amenity IDs stored as a single name
        const rawName = item.nameHe || item.name || "";
        if (rawName.includes(",")) {
          const parts = rawName.split(",").map(s => s.trim()).filter(Boolean);
          const allAreIds = parts.length > 1 && parts.every(p => AMENITIES.some(a => a.id === p));
          if (allAreIds) {
            ids.push(...parts);
            continue;
          }
        }
        // Also check if the raw name IS a known amenity ID directly
        const idMatch = AMENITIES.find(a => a.id === rawName);
        if (idMatch) {
          ids.push(idMatch.id);
        } else if (rawName) {
          // Treat as custom
          const en = item.name || item.nameHe || "";
          ids.push(`custom:${rawName}|${en}`);
        }
      }
    }
  }

  return Array.from(new Set(ids)); // dedupe
}

/**
 * Repair corrupted amenities data in DB format.
 * Detects items whose name is comma-separated IDs and resolves them.
 */
export function repairCorruptedAmenities(
  amenities: Array<{ category?: string; items?: Array<{ icon?: string; name?: string; nameHe?: string }> }> | null | undefined,
): Array<{ category: string; items: Array<{ icon: string; name: string; nameHe: string }> }> | null {
  if (!amenities || amenities.length === 0) return null;
  const ids = schemaToAmenityIds(amenities);
  if (ids.length === 0) return null;
  return amenityIdsToSchema(ids);
}

// Re-export AMENITIES for external use
export { AMENITIES, CATEGORIES };
