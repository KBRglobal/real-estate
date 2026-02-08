import { z } from "zod";

// =====================
// Project Specs Schema (Building Facts)
// =====================
export const projectSpecsSchema = z.object({
  totalFloors: z.number().optional(),
  totalUnits: z.number().optional(),
  totalParkingSpaces: z.number().optional(),
  plotSizeSqft: z.number().optional(),
  builtUpAreaSqft: z.number().optional(),
  buildingHeight: z.string().optional(), // "45 floors" or "150m"
  completionQuarter: z.string().optional(), // "Q4 2026"
  constructionStatus: z.enum(["off-plan", "under-construction", "ready", "sold-out"]).optional(),
  launchDate: z.string().optional(),
  architecturalStyle: z.string().optional(), // "French", "Modern", "Mediterranean"
});

export type ProjectSpecs = z.infer<typeof projectSpecsSchema>;

// =====================
// Investment Metrics Schema
// =====================
export const investmentMetricsSchema = z.object({
  expectedRoiPercent: z.number().optional(), // 7-9
  rentalYieldPercent: z.number().optional(), // 6-8
  pricePerSqft: z.number().optional(), // Starting price per sqft
  serviceChargePerSqft: z.number().optional(), 
  capitalAppreciationForecast: z.string().optional(), // "15-20% by 2027"
  comparableProjects: z.array(z.object({
    name: z.string(),
    pricePerSqft: z.number().optional(),
    location: z.string().optional(),
  })).optional(),
});

export type InvestmentMetrics = z.infer<typeof investmentMetricsSchema>;

// =====================
// Unit Types Schema
// =====================
export const unitSchema = z.object({
  type: z.string(), // "1BR", "2BR", "Studio", "Penthouse"
  typeHe: z.string().optional(), // Hebrew: "סטודיו", "2 חדרים"
  sizeFrom: z.number().optional(), // sqft or sqm
  sizeTo: z.number().optional(),
  sizeUnit: z.enum(["sqft", "sqm"]).default("sqft"),
  priceFrom: z.number().optional(),
  priceTo: z.number().optional(),
  priceCurrency: z.string().default("AED"),
  availability: z.string().optional(), // "Available", "Sold Out", "Limited"
  floor: z.string().optional(), // "1-10", "11-20", etc.
  view: z.string().optional(), // "Sea View", "City View", "Garden View"
  features: z.array(z.string()).optional(), // ["Private Pool", "Maid's Room"]
  featuresHe: z.array(z.string()).optional(),
});

export type Unit = z.infer<typeof unitSchema>;

// =====================
// Payment Plan Schema
// =====================
export const paymentMilestoneSchema = z.object({
  percentage: z.number(), // 10, 20, 40, etc.
  description: z.string(), // "On Booking", "During Construction", "On Handover"
  timing: z.string().optional(), // "Immediate", "Within 30 days", "Q4 2025"
});

export const paymentPlanSchema = z.object({
  name: z.string().optional(), // "60/40 Plan", "5 Year Post-Handover"
  downPayment: z.number().optional(), // % on booking
  duringConstruction: z.number().optional(), // % during construction
  onHandover: z.number().optional(), // % on handover
  postHandover: z.number().optional(), // % post-handover (if applicable)
  postHandoverYears: z.number().optional(), // Number of years for post-handover
  milestones: z.array(paymentMilestoneSchema).optional(),
  notes: z.string().optional(),
});

export type PaymentPlan = z.infer<typeof paymentPlanSchema>;

// =====================
// Developer Schema
// =====================
export const developerSchema = z.object({
  name: z.string(),
  nameAr: z.string().optional(),
  logo: z.string().optional(), // URL
  description: z.string().optional(),
  established: z.string().optional(), // Year
  headquarters: z.string().optional(),
  notableProjects: z.array(z.string()).optional(),
  website: z.string().optional(),
});

export type Developer = z.infer<typeof developerSchema>;

// =====================
// Location Details Schema
// =====================
export const landmarkSchema = z.object({
  name: z.string(),
  nameHe: z.string().optional(),
  distance: z.string(), // "5 min", "500m", "2km"
  distanceKm: z.number().optional(), // Numeric for sorting/calculations
  travelTimeMinutes: z.number().optional(),
  travelMode: z.enum(["driving", "walking", "metro"]).optional(),
  type: z.enum(["metro", "mall", "beach", "airport", "highway", "school", "hospital", "landmark", "restaurant", "park"]).optional(),
  icon: z.string().optional(),
});

export type Landmark = z.infer<typeof landmarkSchema>;

export const locationSchema = z.object({
  area: z.string(), // "Business Bay", "Dubai Marina"
  areaHe: z.string().optional(), // Hebrew: "ביזנס ביי"
  areaAr: z.string().optional(),
  city: z.string().default("Dubai"),
  country: z.string().default("UAE"),
  address: z.string().optional(),
  description: z.string().optional(), // "Located in the heart of JVC with direct access to main roads"
  descriptionHe: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  nearbyLandmarks: z.array(landmarkSchema).optional(),
  connectivity: z.array(z.object({
    destination: z.string(), // "Downtown Dubai"
    destinationHe: z.string().optional(),
    timeMinutes: z.number(),
    distance: z.string().optional(),
  })).optional(),
  mapEmbed: z.string().optional(), // Google Maps embed URL
});

export type LocationDetails = z.infer<typeof locationSchema>;

// =====================
// Amenities Schema (Enhanced with categories)
// =====================
export const amenityCategoryEnum = z.enum([
  "wellness", // Gym, Spa, Sauna, Yoga
  "leisure", // Pool, Cinema, Lounge, Game Room  
  "convenience", // Parking, Concierge, Lobby
  "security", // CCTV, Access Control, Guards
  "outdoor", // Gardens, BBQ, Terrace
  "kids", // Play areas, Splash pad
  "smart", // Smart home, EV charging
  "other"
]);

export type AmenityCategory = z.infer<typeof amenityCategoryEnum>;

export const amenitySchema = z.object({
  name: z.string(),
  nameHe: z.string().optional(),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  category: amenityCategoryEnum.optional(),
  subcategory: z.string().optional(), // "Podium", "Rooftop", "Ground Floor"
  icon: z.string().optional(),
  isHighlight: z.boolean().optional(), // Featured amenity
});

export type Amenity = z.infer<typeof amenitySchema>;

// Grouped amenities for display
export const amenitiesByCategorySchema = z.record(
  amenityCategoryEnum,
  z.array(amenitySchema)
);

export type AmenitiesByCategory = z.infer<typeof amenitiesByCategorySchema>;

// =====================
// Gallery Image Schema
// =====================
export const galleryImageSchema = z.object({
  url: z.string(),
  thumbnailUrl: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  type: z.enum(["exterior", "interior", "amenity", "location", "floorplan", "render"]).optional(),
  page: z.number().optional(), // PDF page number it came from
});

export type GalleryImage = z.infer<typeof galleryImageSchema>;

// =====================
// Classified Image Schema (AI Vision)
// =====================
export const imageCategoryEnum = z.enum([
  "hero",
  "exterior",
  "interior_living",
  "interior_bedroom",
  "interior_kitchen",
  "interior_bathroom",
  "amenity_pool",
  "amenity_gym",
  "amenity_kids",
  "amenity_rooftop",
  "amenity_garden",
  "amenity_lobby",
  "amenity_other",
  "floor_plan",
  "location_map",
  "lifestyle",
  "branding",
  "unknown"
]);

export type ImageCategory = z.infer<typeof imageCategoryEnum>;

export const imageRoleEnum = z.enum(["hero", "gallery", "background", "technical"]);
export type ImageRole = z.infer<typeof imageRoleEnum>;

export const imageQualityEnum = z.enum(["high", "medium", "low"]);
export type ImageQuality = z.infer<typeof imageQualityEnum>;

export const classifiedImageSchema = z.object({
  url: z.string(),
  page: z.number(),
  width: z.number(),
  height: z.number(),

  // AI-assigned classification
  category: imageCategoryEnum,
  subcategory: z.string().optional(),
  role: imageRoleEnum,
  quality: imageQualityEnum,

  // AI-generated metadata
  description: z.string(),
  descriptionHe: z.string().optional(),
  alt: z.string(),

  // Confidence and ranking
  confidence: z.number(),
  sectionScore: z.number(),
  isHeroCandidate: z.boolean(),
});

export type ClassifiedImage = z.infer<typeof classifiedImageSchema>;

// =====================
// Image Manifest Schema (Section-Bound Images)
// =====================
export const imageManifestSchema = z.object({
  hero: classifiedImageSchema.nullable(),
  exterior: z.array(classifiedImageSchema),
  interiors: z.object({
    living: z.array(classifiedImageSchema),
    bedroom: z.array(classifiedImageSchema),
    kitchen: z.array(classifiedImageSchema),
    bathroom: z.array(classifiedImageSchema),
  }),
  amenities: z.object({
    podium: z.array(classifiedImageSchema),
    rooftop: z.array(classifiedImageSchema),
    special: z.array(classifiedImageSchema),
  }),
  floorPlans: z.array(classifiedImageSchema),
  locationMaps: z.array(classifiedImageSchema),
  lifestyle: z.array(classifiedImageSchema),
  gallery: z.array(classifiedImageSchema),
});

export type ImageManifest = z.infer<typeof imageManifestSchema>;

// =====================
// FAQ Schema
// =====================
export const faqSchema = z.object({
  question: z.string(),
  questionHe: z.string().optional(),
  answer: z.string(),
  answerHe: z.string().optional(),
  category: z.string().optional(),
});

export type FAQ = z.infer<typeof faqSchema>;

// =====================
// Project Highlights Schema
// =====================
export const highlightSchema = z.object({
  title: z.string(),
  titleHe: z.string().optional(),
  value: z.string(),
  icon: z.string().optional(),
});

export type Highlight = z.infer<typeof highlightSchema>;

// =====================
// Full Structured Project Data
// =====================
export const structuredProjectSchema = z.object({
  // Basic Info
  name: z.string(),
  nameHe: z.string().optional(),
  tagline: z.string().optional(),
  taglineHe: z.string().optional(),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  
  // Developer
  developer: developerSchema.optional(),
  
  // Location
  location: locationSchema,
  
  // Pricing
  priceFrom: z.number().optional(),
  priceTo: z.number().optional(),
  priceCurrency: z.string().default("AED"),
  
  // Units
  units: z.array(unitSchema).optional(),
  totalUnits: z.number().optional(),
  
  // Payment
  paymentPlan: paymentPlanSchema.optional(),
  
  // Project Details & Specs
  propertyType: z.string(), // "Residential", "Commercial", "Mixed-Use"
  buildingType: z.string().optional(), // "Tower", "Villa", "Townhouse"
  floors: z.number().optional(),
  completionDate: z.string().optional(), // "Q4 2026", "Ready"
  handoverDate: z.string().optional(),
  status: z.enum(["off-plan", "under-construction", "ready", "sold-out"]).optional(),
  
  // NEW: Detailed Project Specifications
  specs: projectSpecsSchema.optional(),
  
  // NEW: Investment Metrics
  investmentMetrics: investmentMetricsSchema.optional(),
  
  // Features
  amenities: z.array(amenitySchema).optional(),
  amenitiesByCategory: amenitiesByCategorySchema.optional(), // Grouped for display
  highlights: z.array(highlightSchema).optional(),
  
  // Media
  gallery: z.array(galleryImageSchema).optional(),
  heroImage: z.string().optional(),
  brochureUrl: z.string().optional(),
  videoUrl: z.string().optional(),

  // AI-Classified Images (from PDF)
  imageManifest: imageManifestSchema.optional(),
  classifiedImages: z.array(classifiedImageSchema).optional(),
  
  // ROI & Investment (legacy - use investmentMetrics for new data)
  roiPercent: z.number().optional(),
  rentalYield: z.number().optional(),
  serviceCharge: z.number().optional(), // per sqft
  
  // FAQ
  faq: z.array(faqSchema).optional(),
  
  // SEO (auto-generated)
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
  
  // Metadata
  sourceProspectId: z.string().optional(),
  confidence: z.number().optional(), // 0-1 extraction confidence
  extractedAt: z.string().optional(),
});

export type StructuredProject = z.infer<typeof structuredProjectSchema>;

// =====================
// Extracted Blocks (Raw from PDF)
// =====================
export const extractedBlockSchema = z.object({
  type: z.enum(["title", "text", "table", "image", "list", "header", "footer", "unknown"]),
  content: z.string().optional(),
  page: z.number(),
  boundingBox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
  confidence: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ExtractedBlock = z.infer<typeof extractedBlockSchema>;

// =====================
// Processing Status
// =====================
export const processingStatusSchema = z.enum([
  "uploaded",
  "extracting",
  "extracted",
  "mapping",
  "mapped",
  "validating",
  "ready",
  "published",
  "failed"
]);

export type ProcessingStatus = z.infer<typeof processingStatusSchema>;
