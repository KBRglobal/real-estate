import type { Project } from "@shared/schema";

export interface ProjectsViewProps {
  projects: Project[];
  onCreateProject: (data: Partial<Project>) => Promise<string | void>;
  onUpdateProject: (id: string, data: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  isLoading: boolean;
}

export interface SeoData {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface GalleryImage {
  url: string;
  alt?: string;
  type?: "image" | "video";
  category?: "exterior" | "interior" | "amenities" | "views";
}

export type GalleryCategory = "exterior" | "interior" | "amenities" | "views";

export interface HighlightItem {
  icon: string;
  title: string;
  titleHe?: string;
  value: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface NearbyPlaceItem {
  name: string;
  nameEn?: string;
  distance: string;
  type: string;
}

export interface NeighborhoodData {
  description: string;
  descriptionEn?: string;
  nearbyPlaces: NearbyPlaceItem[];
}

export interface UnitItem {
  type: string;
  typeHe: string;
  bedrooms: string;
  sizeFrom: number;
  sizeTo: number;
  priceFrom: number;
  priceTo: number;
  floor?: string;
  view?: string;
  status?: string;
  parking: number; // number of parking spots
}

export interface FloorPlanItem {
  name: string;
  image: string;
  size?: string;
  bedrooms?: string;
}

export interface SpecsData {
  totalFloors?: number;
  totalUnits?: number;
  totalParkingSpaces?: number;
  buildingHeight?: string;
  architecturalStyle?: string;
}

export interface InvestmentMetricsData {
  expectedRoiPercent?: number;
  rentalYieldPercent?: number;
  pricePerSqft?: number;
  capitalAppreciationForecast?: string;
  annualAppreciation?: number;
  rentalYield?: number;
  occupancyRate?: number;
  capRate?: number;
}

export interface UnitTypePricingItem {
  type: string;
  typeHe: string;
  startingPrice: number;
  sizeRange: string;
}

export interface CoordinatesData {
  lat: number;
  lng: number;
}

export interface PaymentMilestone {
  title: string; // e.g. "On Booking", "20% Construction", "Handover"
  titleHe?: string;
  percentage: number;
  dueDate?: string; // optional date
  isPostHandover?: boolean;
}

export interface PaymentPlanData {
  name: string; // e.g. "60/40 Plan", "70/30 Plan"
  isPostHandover: boolean;
  milestones: PaymentMilestone[];
}

export interface FormDataType {
  name: string;
  nameEn: string;
  developer: string;
  developerLogo: string;
  location: string;
  locationEn: string;
  priceFrom: number;
  priceCurrency: string;
  roiPercent: number;
  completionDate: string;
  propertyType: string;
  buildingType: string;
  bedrooms: string;
  description: string;
  descriptionEn: string;
  tagline: string;
  taglineEn: string;
  imageUrl: string;
  heroImage: string;
  gallery: GalleryImage[];
  featured: boolean;
  status: string;
  highlightsText: string;
  highlights: HighlightItem[];
  amenitiesText: string;
  paymentPlanText: string;
  faqs: FAQItem[];
  neighborhood: NeighborhoodData;
  units: UnitItem[];
  floorPlans: FloorPlanItem[];
  brochureUrl: string;
  videoUrl: string;
  coordinates: CoordinatesData | null;
  specs: SpecsData;
  investmentMetrics: InvestmentMetricsData;
  seo: SeoData;
  slug: string;
  unitTypePricing: UnitTypePricingItem[];

  // Dubai-specific fields (Step 1)
  projectStatus: "off-plan" | "under-construction" | "ready-to-move" | "completed";
  reraNumber: string;
  dldNumber: string;
  ownership: "freehold" | "leasehold" | "";
  constructionProgress: number; // 0-100
  furnishing: "furnished" | "semi-furnished" | "unfurnished" | "shell-core" | "";
  serviceCharge: number; // per sqft per year
  numberOfBuildings: number;
  commissionPercent: number;
  launchDate: string;
  googleMapsUrl: string;
  tags: string[]; // Labels like "Waterfront", "Branded Residence", etc.
  relatedProjects: string[]; // IDs of related projects

  // Payment plan improvements
  paymentPlans: PaymentPlanData[];
}

export interface OriginalProjectData {
  highlights: any;
  amenities: any;
  paymentPlan: any;
  faqs: any;
  neighborhood: any;
  units: any;
  floorPlans: any;
  highlightsText: string;
  amenitiesText: string;
  paymentPlanText: string;
}

export const emptyFormData: FormDataType = {
  name: "",
  nameEn: "",
  developer: "",
  developerLogo: "",
  location: "",
  locationEn: "",
  priceFrom: 0,
  priceCurrency: "AED",
  roiPercent: 0,
  completionDate: "",
  propertyType: "",
  buildingType: "",
  bedrooms: "",
  description: "",
  descriptionEn: "",
  tagline: "",
  taglineEn: "",
  imageUrl: "",
  heroImage: "",
  gallery: [],
  featured: false,
  status: "draft",
  highlightsText: "",
  highlights: [],
  amenitiesText: "",
  paymentPlanText: "",
  faqs: [],
  neighborhood: { description: "", descriptionEn: "", nearbyPlaces: [] },
  units: [],
  floorPlans: [],
  brochureUrl: "",
  videoUrl: "",
  coordinates: null,
  specs: {},
  investmentMetrics: {},
  seo: { title: "", description: "", ogImage: "" },
  slug: "",
  unitTypePricing: [],

  // Dubai-specific defaults
  projectStatus: "off-plan",
  reraNumber: "",
  dldNumber: "",
  ownership: "",
  constructionProgress: 0,
  furnishing: "",
  serviceCharge: 0,
  numberOfBuildings: 1,
  commissionPercent: 0,
  launchDate: "",
  googleMapsUrl: "",
  tags: [],
  relatedProjects: [],
  paymentPlans: [],
};
