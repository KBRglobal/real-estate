import type { Project } from "@shared/schema";
import type {
  FormDataType,
  SeoData,
  OriginalProjectData,
  GalleryImage,
  HighlightItem,
  FAQItem,
  UnitItem,
  FloorPlanItem,
  UnitTypePricingItem,
  NeighborhoodData,
  SpecsData,
  InvestmentMetricsData,
  CoordinatesData,
  PaymentPlanData,
  PaymentMilestone,
} from "./types";

/**
 * Convert a Project to FormDataType for editing
 */
export function projectToFormData(project: Project): FormDataType {
  const highlights = project.highlights as any[] | null;
  const amenities = project.amenities as any | null;
  const paymentPlan = project.paymentPlan as any | null;
  const seo = project.seo as SeoData | null;
  const gallery = project.gallery as GalleryImage[] | null;
  const faqs = project.faqs as any[] | null;
  const neighborhood = project.neighborhood as any | null;
  const units = project.units as any[] | null;
  const floorPlans = project.floorPlans as any[] | null;
  const specs = project.specs as SpecsData | null;
  const investmentMetrics = project.investmentMetrics as InvestmentMetricsData | null;
  const coordinates = project.coordinates as CoordinatesData | null;
  const unitTypePricing = (investmentMetrics as any)?.unitTypePricing as UnitTypePricingItem[] | null;

  return {
    name: project.name || "",
    nameEn: project.nameEn || "",
    developer: project.developer || "",
    developerLogo: project.developerLogo || "",
    location: project.location || "",
    locationEn: project.locationEn || "",
    priceFrom: project.priceFrom || 0,
    priceCurrency: project.priceCurrency || "AED",
    roiPercent: project.roiPercent || 0,
    completionDate: project.completionDate || "",
    propertyType: project.propertyType || "",
    buildingType: project.buildingType || "",
    bedrooms: project.bedrooms || "",
    description: project.description || "",
    descriptionEn: project.descriptionEn || "",
    tagline: project.tagline || "",
    taglineEn: project.taglineEn || "",
    imageUrl: project.imageUrl || "",
    heroImage: project.heroImage || "",
    gallery: gallery?.map(img => ({
      url: img.url,
      alt: img.alt,
      ...(img.type && { type: img.type }),
      ...(img.category && { category: img.category }),
    })) || [],
    featured: project.featured || false,
    status: project.status || "draft",
    highlightsText: extractHighlightsText(highlights),
    highlights: extractHighlightsArray(highlights),
    amenitiesText: extractAmenitiesText(amenities),
    paymentPlanText: typeof paymentPlan === "string" ? paymentPlan : (paymentPlan?.name || paymentPlan?.description || ""),
    faqs: extractFaqs(faqs),
    neighborhood: extractNeighborhood(neighborhood),
    units: extractUnits(units),
    floorPlans: extractFloorPlans(floorPlans),
    brochureUrl: project.brochureUrl || "",
    videoUrl: project.videoUrl || "",
    coordinates: coordinates || null,
    specs: specs || {},
    investmentMetrics: investmentMetrics || {},
    seo: seo || { title: "", description: "", ogImage: "" },
    slug: project.slug || "",
    unitTypePricing: unitTypePricing?.map(utp => ({
      type: utp.type || "",
      typeHe: utp.typeHe || "",
      startingPrice: utp.startingPrice || 0,
      sizeRange: utp.sizeRange || "",
    })) || [],

    // Dubai-specific fields
    projectStatus: (project.projectStatus as FormDataType["projectStatus"]) || "off-plan",
    reraNumber: project.reraNumber || "",
    dldNumber: project.dldNumber || "",
    ownership: (project.ownership as FormDataType["ownership"]) || "",
    constructionProgress: project.constructionProgress ?? 0,
    furnishing: (project.furnishing as FormDataType["furnishing"]) || "",
    serviceCharge: Number(project.serviceCharge) || 0,
    numberOfBuildings: project.numberOfBuildings ?? 1,
    commissionPercent: Number(project.commissionPercent) || 0,
    launchDate: project.launchDate || "",
    googleMapsUrl: project.googleMapsUrl || "",
    tags: project.tags || [],
    relatedProjects: project.relatedProjects || [],
    paymentPlans: paymentPlanToFormPlans(paymentPlan),
  };
}

/**
 * Extract highlights text from highlights array.
 * Includes icon and value in a parseable format so round-trip doesn't lose data.
 */
function extractHighlightsText(highlights: any[] | null): string {
  if (!highlights || !Array.isArray(highlights)) return "";
  return highlights
    .map((h: any) => {
      const title = h.title || h.titleHe || (typeof h === 'string' ? h : '');
      if (!title) return '';
      const parts: string[] = [];
      if (h.icon && h.icon !== 'star') parts.push(`[${h.icon}]`);
      parts.push(title);
      if (h.value) parts.push(`(${h.value})`);
      return parts.join(' ');
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * Extract highlights as structured array, preserving all fields exactly.
 */
function extractHighlightsArray(highlights: any[] | null): HighlightItem[] {
  if (!highlights || !Array.isArray(highlights)) return [];
  return highlights.map((h: any) => ({
    icon: typeof h.icon === 'string' ? h.icon : "star",
    title: h.title || h.titleHe || "",
    titleHe: h.titleHe || h.title || "",
    value: h.value != null ? String(h.value) : "",
  }));
}

/**
 * Extract amenities text from amenities data
 */
function extractAmenitiesText(amenities: any): string {
  if (!amenities) return "";

  if (!Array.isArray(amenities) && amenities.items) {
    return amenities.items
      .map((item: any) => item.name || item.nameHe || "")
      .filter(Boolean)
      .join("\n");
  }

  if (Array.isArray(amenities)) {
    return amenities
      .flatMap((a: any) =>
        a.items?.map((item: any) => item.name || item.nameHe) || [a.name || a]
      )
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

/**
 * Extract FAQs from project data
 */
function extractFaqs(faqs: any[] | null): FAQItem[] {
  if (!faqs || !Array.isArray(faqs)) return [];
  return faqs.map((f: any) => ({
    question: f.question || f.questionHe || "",
    answer: f.answer || f.answerHe || "",
  }));
}

/**
 * Extract neighborhood from project data
 */
function extractNeighborhood(neighborhood: any | null): NeighborhoodData {
  if (!neighborhood) return { description: "", descriptionEn: "", nearbyPlaces: [] };
  return {
    description: neighborhood.description || "",
    descriptionEn: neighborhood.descriptionEn || "",
    nearbyPlaces: (neighborhood.nearbyPlaces || []).map((p: any) => ({
      name: p.name || "",
      nameEn: p.nameEn || "",
      distance: p.distance || "",
      type: p.type || "landmark",
    })),
  };
}

/**
 * Extract units from project data
 */
function extractUnits(units: any[] | null): UnitItem[] {
  if (!units || !Array.isArray(units)) return [];
  return units.map((u: any) => ({
    type: u.type || "",
    typeHe: u.typeHe || u.type || "",
    bedrooms: u.bedrooms || "",
    sizeFrom: u.sizeFrom || 0,
    sizeTo: u.sizeTo || 0,
    priceFrom: u.priceFrom || 0,
    priceTo: u.priceTo || 0,
    floor: u.floor || "",
    view: u.view || "",
    status: u.status || "available",
    parking: u.parking || 0,
  }));
}

/**
 * Extract floor plans from project data
 */
function extractFloorPlans(floorPlans: any[] | null): FloorPlanItem[] {
  if (!floorPlans || !Array.isArray(floorPlans)) return [];
  return floorPlans.map((fp: any) => ({
    name: fp.name || "",
    image: fp.image || "",
    size: fp.size || "",
    bedrooms: fp.bedrooms || "",
  }));
}

/**
 * Convert DB paymentPlan (singular) back to form paymentPlans format.
 * Supports multiple DB formats for backward compatibility:
 *   1. New structured: [{ name, isPostHandover, milestones: [{ title, titleHe, percentage, dueDate }] }]
 *   2. Legacy flat: [{ milestone, percentage, description }]
 *   3. Object with text name: { name: "..." }
 *   4. Plain string
 */
function paymentPlanToFormPlans(paymentPlan: any): PaymentPlanData[] {
  if (!paymentPlan) return [];

  // If it's a string, return empty (handled by paymentPlanText)
  if (typeof paymentPlan === "string") return [];

  // If it's an object with 'name' but no array structure and no milestones (old text format)
  if (!Array.isArray(paymentPlan) && paymentPlan.name && !paymentPlan.milestones && !paymentPlan.milestone) return [];

  // If it's an array
  if (Array.isArray(paymentPlan) && paymentPlan.length > 0) {
    // New structured format: items have 'milestones' sub-array
    if (paymentPlan[0].milestones) {
      return paymentPlan.map((plan: any) => ({
        name: plan.name || "",
        isPostHandover: plan.isPostHandover || false,
        milestones: Array.isArray(plan.milestones)
          ? plan.milestones.map((m: any): PaymentMilestone => ({
              title: m.title || "",
              titleHe: m.titleHe || m.title || undefined,
              percentage: m.percentage || 0,
              dueDate: m.dueDate || undefined,
              isPostHandover: m.isPostHandover || false,
            }))
          : [],
      }));
    }
    // Legacy flat format: items have 'milestone' key
    if (paymentPlan[0].milestone !== undefined || paymentPlan[0].percentage !== undefined) {
      return [{
        name: "תכנית תשלומים",
        isPostHandover: false,
        milestones: paymentPlan.map((m: any) => ({
          title: "",
          titleHe: m.milestone || "",
          percentage: m.percentage || 0,
          dueDate: m.description || undefined,
        })),
      }];
    }
  }

  return [];
}

/**
 * Convert FormDataType back to Partial<Project> for saving
 */
export function formDataToProject(
  formData: FormDataType,
  originalData: OriginalProjectData | null
): Partial<Project> {
  let highlights: any = null;
  let amenities: any = null;
  let paymentPlan: any = null;

  const highlightsTextChanged = originalData
    ? formData.highlightsText !== originalData.highlightsText
    : formData.highlightsText.trim() !== "";

  const amenitiesTextChanged = originalData
    ? formData.amenitiesText !== originalData.amenitiesText
    : formData.amenitiesText.trim() !== "";

  const paymentPlanTextChanged = originalData
    ? formData.paymentPlanText !== originalData.paymentPlanText
    : formData.paymentPlanText.trim() !== "";

  // Use structured highlights if available, otherwise fall back to text
  if (formData.highlights && formData.highlights.length > 0) {
    const validHighlights = formData.highlights.filter(h => h.title.trim() || (h.titleHe && h.titleHe.trim()));
    highlights = validHighlights.length > 0
      ? validHighlights.map(h => ({
          icon: h.icon || "star",
          title: h.title,
          titleHe: h.titleHe || h.title,
          value: h.value || "",
        }))
      : null;
  } else if (highlightsTextChanged) {
    const lines = formData.highlightsText.split("\n").filter(h => h.trim());
    highlights = lines.length > 0
      ? lines.map(line => {
          // Parse optional [icon] prefix and (value) suffix from text
          let icon = "star";
          let value = "";
          let title = line.trim();
          const iconMatch = title.match(/^\[([^\]]+)\]\s*/);
          if (iconMatch) {
            icon = iconMatch[1];
            title = title.slice(iconMatch[0].length);
          }
          const valueMatch = title.match(/\s*\(([^)]+)\)$/);
          if (valueMatch) {
            value = valueMatch[1];
            title = title.slice(0, -valueMatch[0].length);
          }
          return { title, titleHe: title, icon, value };
        })
      : null;
  } else if (originalData?.highlights) {
    highlights = originalData.highlights;
  }

  if (amenitiesTextChanged) {
    const lines = formData.amenitiesText.split("\n").filter(a => a.trim());
    amenities = lines.length > 0
      ? [{ category: "general", items: lines.map(name => ({ icon: "check", name, nameHe: name })) }]
      : null;
  } else if (originalData?.amenities) {
    amenities = originalData.amenities;
  }

  // Use structured paymentPlans if available — save full-fidelity data to DB
  if (formData.paymentPlans && formData.paymentPlans.length > 0) {
    const validPlans = formData.paymentPlans.filter(p => p.name.trim() && p.milestones.length > 0);
    if (validPlans.length > 0) {
      // Save full structured format: plan names, isPostHandover, bilingual titles, dueDate
      paymentPlan = validPlans.map(plan => ({
        name: plan.name,
        isPostHandover: plan.isPostHandover || false,
        milestones: plan.milestones
          .filter(m => m.percentage > 0)
          .map(m => ({
            title: m.title || "",
            titleHe: m.titleHe || m.title || "",
            percentage: m.percentage,
            dueDate: m.dueDate || undefined,
            isPostHandover: m.isPostHandover || false,
          })),
      }));
    }
  }
  // Fall back to text-based payment plan
  if (!paymentPlan && paymentPlanTextChanged) {
    paymentPlan = formData.paymentPlanText
      ? { name: formData.paymentPlanText }
      : null;
  } else if (!paymentPlan && originalData?.paymentPlan) {
    paymentPlan = originalData.paymentPlan;
  }

  // Build units for saving
  const unitsForSave = formData.units.length > 0
    ? formData.units.filter(u => u.type || u.typeHe).map(u => ({
        type: u.type || u.typeHe,
        typeHe: u.typeHe || u.type,
        bedrooms: u.bedrooms,
        sizeFrom: u.sizeFrom,
        sizeTo: u.sizeTo,
        priceFrom: u.priceFrom,
        priceTo: u.priceTo,
        floor: u.floor || undefined,
        view: u.view || undefined,
        status: u.status || "available",
        parking: u.parking || 0,
        sizeUnit: "sqm" as const,
        priceCurrency: formData.priceCurrency,
      }))
    : (originalData?.units || null);

  // Build FAQs for saving
  const faqsForSave = formData.faqs.length > 0
    ? formData.faqs.filter(f => f.question.trim() && f.answer.trim())
    : null;

  // Build neighborhood for saving
  const neighborhoodForSave = (formData.neighborhood.description || formData.neighborhood.nearbyPlaces.length > 0)
    ? {
        description: formData.neighborhood.description,
        descriptionEn: formData.neighborhood.descriptionEn || null,
        nearbyPlaces: formData.neighborhood.nearbyPlaces.filter(p => p.name.trim()),
      }
    : (originalData?.neighborhood || null);

  // Build floor plans for saving
  const floorPlansForSave = formData.floorPlans.length > 0
    ? formData.floorPlans.filter(fp => fp.name.trim() && fp.image.trim())
    : (originalData?.floorPlans || null);

  // Build specs (use != null for numbers to preserve 0 values)
  const specsForSave = (formData.specs.totalFloors != null || formData.specs.totalUnits != null || formData.specs.totalParkingSpaces != null || formData.specs.buildingHeight || formData.specs.architecturalStyle)
    ? formData.specs
    : null;

  // Build investment metrics (use != null for numbers to preserve 0 values)
  const hasInvestmentMetrics = formData.investmentMetrics.expectedRoiPercent != null || formData.investmentMetrics.rentalYieldPercent != null || formData.investmentMetrics.pricePerSqft != null || formData.investmentMetrics.capitalAppreciationForecast || formData.investmentMetrics.annualAppreciation != null || formData.investmentMetrics.rentalYield != null || formData.investmentMetrics.occupancyRate != null || formData.investmentMetrics.capRate != null;
  const unitTypePricingForSave = formData.unitTypePricing.length > 0
    ? formData.unitTypePricing.filter(utp => utp.type.trim() || utp.typeHe.trim())
    : undefined;
  const investmentMetricsForSave = (hasInvestmentMetrics || unitTypePricingForSave)
    ? {
        ...formData.investmentMetrics,
        ...(unitTypePricingForSave && { unitTypePricing: unitTypePricingForSave }),
      }
    : null;

  return {
    name: formData.name,
    nameEn: formData.nameEn || null,
    developer: formData.developer,
    developerLogo: formData.developerLogo || null,
    location: formData.location,
    locationEn: formData.locationEn || null,
    priceFrom: formData.priceFrom,
    priceCurrency: formData.priceCurrency,
    roiPercent: formData.roiPercent,
    completionDate: formData.completionDate,
    propertyType: formData.propertyType,
    buildingType: formData.buildingType || null,
    bedrooms: formData.bedrooms,
    description: formData.description,
    descriptionEn: formData.descriptionEn || null,
    tagline: formData.tagline || null,
    taglineEn: formData.taglineEn || null,
    imageUrl: formData.imageUrl,
    heroImage: formData.heroImage || formData.imageUrl || null,
    gallery: formData.gallery?.length > 0
      ? formData.gallery.map(img => ({
          url: img.url,
          alt: img.alt,
          ...(img.type && { type: img.type }),
          ...(img.category && { category: img.category }),
        }))
      : null,
    featured: formData.featured,
    status: formData.status || "draft",
    highlights,
    amenities,
    paymentPlan,
    units: unitsForSave,
    faqs: faqsForSave,
    neighborhood: neighborhoodForSave,
    floorPlans: floorPlansForSave,
    brochureUrl: formData.brochureUrl || null,
    videoUrl: formData.videoUrl || null,
    coordinates: formData.coordinates,
    specs: specsForSave,
    investmentMetrics: investmentMetricsForSave,
    seo: formData.seo.title || formData.seo.description || formData.seo.ogImage ? formData.seo : null,
    slug: formData.slug || generateSlugFromName(formData.nameEn || formData.name || "") || null,

    // Dubai-specific fields
    projectStatus: formData.projectStatus || "off-plan",
    reraNumber: formData.reraNumber || null,
    dldNumber: formData.dldNumber || null,
    ownership: formData.ownership || null,
    constructionProgress: Math.min(100, Math.max(0, formData.constructionProgress || 0)),
    furnishing: formData.furnishing || null,
    serviceCharge: formData.serviceCharge ? String(formData.serviceCharge) : null,
    numberOfBuildings: formData.numberOfBuildings ?? 1,
    commissionPercent: formData.commissionPercent ? String(formData.commissionPercent) : null,
    launchDate: formData.launchDate || null,
    googleMapsUrl: formData.googleMapsUrl || null,
    tags: formData.tags.length > 0 ? formData.tags : null,
    relatedProjects: formData.relatedProjects.length > 0 ? formData.relatedProjects : null,
    paymentPlans: (() => {
      const filtered = formData.paymentPlans.filter(p => p.name.trim());
      return filtered.length > 0 ? filtered : null;
    })(),
  } as Partial<Project>;
}

/**
 * Basic Hebrew-to-Latin transliteration map for slug generation
 */
const HEBREW_TRANSLITERATION: Record<string, string> = {
  "א": "", "ב": "b", "ג": "g", "ד": "d", "ה": "h", "ו": "v",
  "ז": "z", "ח": "ch", "ט": "t", "י": "y", "כ": "k", "ך": "k",
  "ל": "l", "מ": "m", "ם": "m", "נ": "n", "ן": "n", "ס": "s",
  "ע": "", "פ": "p", "ף": "f", "צ": "ts", "ץ": "ts", "ק": "k",
  "ר": "r", "ש": "sh", "ת": "t",
};

/**
 * Generate a URL-friendly slug from a name.
 * Supports Hebrew text via transliteration to Latin characters.
 */
export function generateSlugFromName(name: string): string {
  if (!name || !name.trim()) return `project-${Date.now()}`;

  // Transliterate Hebrew characters to Latin
  let transliterated = "";
  for (const char of name) {
    if (HEBREW_TRANSLITERATION[char] !== undefined) {
      transliterated += HEBREW_TRANSLITERATION[char];
    } else {
      transliterated += char;
    }
  }

  // Strip nikud / diacritics (Unicode range 0x0591-0x05C7)
  transliterated = transliterated.replace(/[\u0591-\u05C7]/g, "");

  const slug = transliterated
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
  return slug || `project-${Date.now()}`;
}

/**
 * Format a price number for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("he-IL").format(price);
}

/**
 * Filter projects by search query
 */
export function filterProjects(projects: any[], searchQuery: string): any[] {
  if (!searchQuery) return projects;
  const query = searchQuery.toLowerCase();
  return projects.filter((project) =>
    (project.name || "").toLowerCase().includes(query) ||
    (project.developer || "").toLowerCase().includes(query) ||
    (project.location || "").toLowerCase().includes(query)
  );
}
