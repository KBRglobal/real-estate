import { GoogleGenerativeAI } from "@google/generative-ai";

// Validate Google API Key at module load
if (!process.env.GOOGLE_API_KEY) {
  console.warn("[Image Classifier] Warning: GOOGLE_API_KEY not set. Image classification will fail.");
}

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Image classification categories for real estate brochures
 */
export type ImageCategory =
  | "hero"           // Main exterior render - best for hero section
  | "exterior"       // Building exterior views
  | "interior_living" // Living room / general interior
  | "interior_bedroom" // Bedroom shots
  | "interior_kitchen" // Kitchen shots
  | "interior_bathroom" // Bathroom shots
  | "amenity_pool"   // Pool / water features
  | "amenity_gym"    // Fitness / gym
  | "amenity_kids"   // Kids play areas
  | "amenity_rooftop" // Rooftop amenities
  | "amenity_garden" // Gardens / landscaping
  | "amenity_lobby"  // Lobby / entrance
  | "amenity_other"  // Other amenities
  | "floor_plan"     // Floor plans / layouts
  | "location_map"   // Maps / location diagrams
  | "lifestyle"      // Lifestyle / mood images
  | "branding"       // Logos / decorative elements
  | "unknown";       // Could not classify

export type ImageRole =
  | "hero"       // Primary image for a section
  | "gallery"    // Supporting gallery image
  | "background" // Background/decorative image
  | "technical"; // Floor plans, maps

export type ImageQuality = "high" | "medium" | "low";

/**
 * Classified image with metadata
 */
export interface ClassifiedImage {
  url: string;
  page: number;
  width: number;
  height: number;

  // AI-assigned classification
  category: ImageCategory;
  subcategory?: string;  // e.g., "podium" or "rooftop" for amenities
  role: ImageRole;
  quality: ImageQuality;

  // AI-generated metadata
  description: string;
  descriptionHe?: string;
  alt: string;

  // Confidence and ranking
  confidence: number;  // 0-1 how confident AI is in classification
  sectionScore: number; // 0-1 how well it fits its assigned section

  // For hero selection
  isHeroCandidate: boolean;
}

/**
 * Structured image manifest for mini-site sections
 */
export interface ImageManifest {
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
  branding: ClassifiedImage[];
  gallery: ClassifiedImage[]; // All images sorted by quality for a general gallery
}

const CLASSIFICATION_PROMPT = `You are an expert real estate image classifier. Analyze this image from a Dubai property brochure and classify it.

Respond with a JSON object:
{
  "category": "hero|exterior|interior_living|interior_bedroom|interior_kitchen|interior_bathroom|amenity_pool|amenity_gym|amenity_kids|amenity_rooftop|amenity_garden|amenity_lobby|amenity_other|floor_plan|location_map|lifestyle|branding|unknown",
  "subcategory": "podium|rooftop|null (only for amenities)",
  "role": "hero|gallery|background|technical",
  "quality": "high|medium|low",
  "description": "Brief description in English (1-2 sentences)",
  "descriptionHe": "תיאור קצר בעברית (1-2 משפטים)",
  "alt": "Alt text for accessibility",
  "isHeroCandidate": true/false (true if this is a stunning exterior render that would work as main hero),
  "confidence": 0.0-1.0 (how confident you are in this classification),
  "sectionScore": 0.0-1.0 (how well this image represents its category)
}

Classification rules:
- "hero": Only for stunning exterior building renders that show the full building beautifully
- "exterior": Other building exterior shots (angles, details, street view)
- "interior_*": Based on room type shown
- "amenity_*": Pool, gym, kids area, rooftop features, gardens, lobby
- "floor_plan": Technical drawings showing apartment layouts
- "location_map": Maps showing project location, distances
- "lifestyle": People, lifestyle scenes, mood shots
- "branding": Logos, decorative elements, text-heavy images

Quality assessment:
- "high": Sharp, professional photography, good lighting, high resolution
- "medium": Acceptable quality, minor issues
- "low": Blurry, pixelated, or very small

Role assignment:
- "hero": Best image for that category, could be section header
- "gallery": Good supporting image
- "background": Lower priority, decorative use
- "technical": Floor plans, maps (zoomable, not decorative)

Subcategory for amenities:
- "podium": Ground level amenities (pools, gym, kids splash)
- "rooftop": Rooftop amenities (sky lounge, cinema, bbq)`;

/**
 * Helper function to clean JSON response from Gemini
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  
  cleaned = cleaned.trim();
  
  const jsonStart = cleaned.indexOf("{");
  const arrayStart = cleaned.indexOf("[");
  
  if (jsonStart === -1 && arrayStart === -1) {
    return cleaned;
  }
  
  const startIdx = jsonStart === -1 ? arrayStart : 
                   arrayStart === -1 ? jsonStart : 
                   Math.min(jsonStart, arrayStart);
  
  let depth = 0;
  let endIdx = startIdx;
  
  for (let i = startIdx; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === "{" || char === "[") depth++;
    if (char === "}" || char === "]") {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  
  return cleaned.slice(startIdx, endIdx + 1);
}

/**
 * Classify a single image using Gemini Vision
 */
export async function classifyImage(
  imageUrl: string,
  pageNumber: number,
  width: number,
  height: number
): Promise<ClassifiedImage> {
  try {
    // Download image and convert to base64
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = response.headers.get("content-type") || "image/jpeg";

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: CLASSIFICATION_PROMPT },
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const content = result.response.text();
    if (!content) {
      throw new Error("No response from Gemini Vision");
    }

    const parsed = JSON.parse(cleanJsonResponse(content));

    return {
      url: imageUrl,
      page: pageNumber,
      width,
      height,
      category: parsed.category || "unknown",
      subcategory: parsed.subcategory || undefined,
      role: parsed.role || "gallery",
      quality: parsed.quality || "medium",
      description: parsed.description || "",
      descriptionHe: parsed.descriptionHe || undefined,
      alt: parsed.alt || `Image from page ${pageNumber}`,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      sectionScore: typeof parsed.sectionScore === "number" ? parsed.sectionScore : 0.5,
      isHeroCandidate: parsed.isHeroCandidate === true,
    };
  } catch (error) {
    console.error(`[Image Classifier] Failed to classify image from page ${pageNumber}:`, error);

    // Return a default classification on error
    return {
      url: imageUrl,
      page: pageNumber,
      width,
      height,
      category: "unknown",
      role: "gallery",
      quality: "medium",
      description: "Image from brochure",
      alt: `Image from page ${pageNumber}`,
      confidence: 0,
      sectionScore: 0,
      isHeroCandidate: false,
    };
  }
}

/**
 * Classify multiple images and build a manifest
 */
export async function classifyImages(
  images: Array<{ url: string; page: number; width: number; height: number }>
): Promise<{ classified: ClassifiedImage[]; manifest: ImageManifest }> {
  console.log(`[Image Classifier] Classifying ${images.length} images using Gemini...`);

  // Classify images in parallel with rate limiting
  const BATCH_SIZE = 5;
  const classified: ClassifiedImage[] = [];

  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    console.log(`[Image Classifier] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(images.length / BATCH_SIZE)}`);

    const results = await Promise.all(
      batch.map((img) => classifyImage(img.url, img.page, img.width, img.height))
    );
    classified.push(...results);

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < images.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Build the manifest
  const manifest = buildManifest(classified);

  console.log(`[Image Classifier] Classification complete. Hero: ${manifest.hero ? "found" : "not found"}`);

  return { classified, manifest };
}

/**
 * Build structured manifest from classified images
 */
function buildManifest(images: ClassifiedImage[]): ImageManifest {
  const manifest: ImageManifest = {
    hero: null,
    exterior: [],
    interiors: {
      living: [],
      bedroom: [],
      kitchen: [],
      bathroom: [],
    },
    amenities: {
      podium: [],
      rooftop: [],
      special: [],
    },
    floorPlans: [],
    locationMaps: [],
    lifestyle: [],
    branding: [],
    gallery: [],
  };

  // Sort by quality and confidence for hero selection
  const heroCandidates = images
    .filter((img) => img.isHeroCandidate && img.quality === "high")
    .sort((a, b) => b.confidence * b.sectionScore - a.confidence * a.sectionScore);

  if (heroCandidates.length > 0) {
    manifest.hero = heroCandidates[0];
  } else {
    // Fallback: best exterior image
    const exteriors = images
      .filter((img) => img.category === "exterior" || img.category === "hero")
      .sort((a, b) => b.confidence - a.confidence);
    if (exteriors.length > 0) {
      manifest.hero = exteriors[0];
    }
  }

  // Categorize all images
  for (const img of images) {
    // Skip hero from other lists if it's the main hero
    if (manifest.hero && img.url === manifest.hero.url) continue;

    switch (img.category) {
      case "hero":
      case "exterior":
        manifest.exterior.push(img);
        break;
      case "interior_living":
        manifest.interiors.living.push(img);
        break;
      case "interior_bedroom":
        manifest.interiors.bedroom.push(img);
        break;
      case "interior_kitchen":
        manifest.interiors.kitchen.push(img);
        break;
      case "interior_bathroom":
        manifest.interiors.bathroom.push(img);
        break;
      case "amenity_pool":
      case "amenity_gym":
      case "amenity_kids":
      case "amenity_lobby":
      case "amenity_garden":
      case "amenity_other":
        if (img.subcategory === "rooftop") {
          manifest.amenities.rooftop.push(img);
        } else {
          manifest.amenities.podium.push(img);
        }
        break;
      case "amenity_rooftop":
        manifest.amenities.rooftop.push(img);
        break;
      case "floor_plan":
        manifest.floorPlans.push(img);
        break;
      case "location_map":
        manifest.locationMaps.push(img);
        break;
      case "lifestyle":
        manifest.lifestyle.push(img);
        break;
      case "branding":
        manifest.branding.push(img);
        break;
    }
  }

  // Build general gallery sorted by quality
  manifest.gallery = [...images]
    .filter((img) => img.category !== "branding" && img.category !== "floor_plan")
    .sort((a, b) => {
      const qualityOrder = { high: 3, medium: 2, low: 1 };
      const aScore = qualityOrder[a.quality] * a.confidence;
      const bScore = qualityOrder[b.quality] * b.confidence;
      return bScore - aScore;
    });

  return manifest;
}

/**
 * Get best images for specific mini-site sections
 */
export function getImagesForSection(
  manifest: ImageManifest,
  section: string,
  count: number = 4
): ClassifiedImage[] {
  let candidates: ClassifiedImage[] = [];

  switch (section) {
    case "hero":
      return manifest.hero ? [manifest.hero] : [];
    case "about":
    case "overview":
      candidates = [...manifest.exterior, ...manifest.lifestyle];
      break;
    case "interiors":
    case "units":
      candidates = [
        ...manifest.interiors.living,
        ...manifest.interiors.bedroom,
        ...manifest.interiors.kitchen,
        ...manifest.interiors.bathroom,
      ];
      break;
    case "amenities":
      candidates = [
        ...manifest.amenities.podium,
        ...manifest.amenities.rooftop,
        ...manifest.amenities.special,
      ];
      break;
    case "location":
      candidates = [...manifest.locationMaps, ...manifest.exterior];
      break;
    case "gallery":
      candidates = manifest.gallery;
      break;
    default:
      candidates = manifest.gallery;
  }

  // Sort by quality and return top N
  return candidates
    .sort((a, b) => {
      const qualityOrder = { high: 3, medium: 2, low: 1 };
      return qualityOrder[b.quality] - qualityOrder[a.quality];
    })
    .slice(0, count);
}
