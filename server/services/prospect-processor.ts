import { db } from "../db";
import { prospects, miniSites, projects } from "@shared/schema";
import { eq, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  extractPdfContent,
  identifyPricingTables,
  extractPaymentMilestones,
  calculateConfidence
} from "./pdf-processor";
import { extractImagesFromPdf } from "./pdf-image-extractor";
import { classifyImages, type ImageManifest, type ClassifiedImage } from "./image-classifier";
import {
  mapToStructuredProject,
  translateToHebrew,
  generateSEO
} from "./ai-mapper";
import type { StructuredProject } from "@shared/prospect-schemas";

export interface ProcessingUpdate {
  prospectId: string;
  status: string;
  progress: number;
  message: string;
  data?: unknown;
}

export type ProcessingCallback = (update: ProcessingUpdate) => void;

/**
 * Validate required environment variables for processing
 * Returns error message in Hebrew if validation fails
 */
function validateEnvironment(): { valid: boolean; error?: string; warnings?: string[] } {
  const warnings: string[] = [];

  // Check for Google API key (Gemini) - this is the primary AI provider
  if (!process.env.GOOGLE_API_KEY) {
    return {
      valid: false,
      error: "⚠️ מפתח API של Google לא הוגדר!\n\nיש להגדיר את המשתנה GOOGLE_API_KEY בקובץ .env\n\nלקבלת מפתח: https://aistudio.google.com/app/apikey"
    };
  }

  if (!process.env.DATABASE_PUBLIC_URL) {
    return {
      valid: false,
      error: "⚠️ חיבור למסד נתונים Railway לא הוגדר!\n\nיש להגדיר את המשתנה DATABASE_PUBLIC_URL"
    };
  }

  return { valid: true, warnings };
}

/**
 * Main processor for converting PDF to structured project data
 */
export async function processProspect(
  prospectId: string,
  pdfBuffer: Buffer,
  onProgress?: ProcessingCallback
): Promise<{ success: boolean; projectData?: StructuredProject; error?: string; projectSlug?: string; miniSiteSlug?: string }> {
  const sendUpdate = (status: string, progress: number, message: string, data?: unknown) => {
    onProgress?.({ prospectId, status, progress, message, data });
  };

  try {
    // Step 0: Validate environment before processing
    const envValidation = validateEnvironment();
    if (!envValidation.valid) {
      console.error("[Prospect Processor] Environment validation failed:", envValidation.error);
      sendUpdate("failed", 0, envValidation.error!);
      await updateProspectStatus(prospectId, "failed");
      return { success: false, error: envValidation.error };
    }

    // Log warnings but continue
    if (envValidation.warnings && envValidation.warnings.length > 0) {
      envValidation.warnings.forEach(w => sendUpdate("warning", 5, w));
    }

    // Step 1: Update status to extracting
    sendUpdate("extracting", 10, "מחלץ תוכן מה-PDF...");
    await updateProspectStatus(prospectId, "extracting", "started");
    
    // Step 2: Extract PDF content
    const extractedContent = await extractPdfContent(pdfBuffer);
    sendUpdate("extracting", 30, `חולצו ${extractedContent.pageCount} עמודים, ${extractedContent.blocks.length} בלוקים`);
    
    // Step 2.5: Extract images from PDF
    sendUpdate("extracting", 35, "מחלץ תמונות מה-PDF...");
    const extractedImages = await extractImagesFromPdf(pdfBuffer, prospectId);
    sendUpdate("extracting", 38, `חולצו ${extractedImages.length} תמונות`);

    // Step 2.6: Classify images using AI Vision
    let classifiedImages: ClassifiedImage[] = [];
    let imageManifest: ImageManifest | null = null;

    if (extractedImages.length > 0) {
      sendUpdate("extracting", 42, "מסווג תמונות באמצעות AI Vision...");
      try {
        const classificationResult = await classifyImages(extractedImages);
        classifiedImages = classificationResult.classified;
        imageManifest = classificationResult.manifest;
        sendUpdate("extracting", 48, `סווגו ${classifiedImages.length} תמונות (hero: ${imageManifest.hero ? 'נמצא' : 'לא נמצא'})`);
      } catch (classifyError) {
        console.warn("[Prospect Processor] Image classification failed, continuing without:", classifyError);
        sendUpdate("warning", 45, "סיווג תמונות נכשל - ממשיך ללא סיווג");
      }
    }

    // Save extracted content
    await db.update(prospects)
      .set({
        extractedText: extractedContent.text,
        extractedTables: extractedContent.tables,
        extractedImages: extractedImages,
        classifiedImages: classifiedImages.length > 0 ? classifiedImages : undefined,
        imageManifest: imageManifest || undefined,
      })
      .where(eq(prospects.id, prospectId));

    // Step 3: Identify pricing tables
    sendUpdate("extracting", 40, "מזהה טבלאות מחירים...");
    const pricingTables = identifyPricingTables(extractedContent.tables);
    const paymentMilestones = extractPaymentMilestones(extractedContent.tables);
    
    sendUpdate("extracted", 50, `נמצאו ${pricingTables.length} טבלאות מחירים`);
    await updateProspectStatus(prospectId, "extracted", "content_extracted");

    // Step 4: AI Mapping
    sendUpdate("mapping", 60, "ממפה לנתונים מובנים באמצעות AI...");
    await updateProspectStatus(prospectId, "mapping", "ai_mapping_started");
    
    const mappingResult = await mapToStructuredProject(
      extractedContent.text,
      extractedContent.tables,
      extractedContent.metadata
    );

    if (!mappingResult.success || !mappingResult.data) {
      const errorMsg = mappingResult.errors?.join(', ') || "Mapping failed";
      sendUpdate("failed", 100, `שגיאה במיפוי: ${errorMsg}`);
      await saveProspectError(prospectId, errorMsg);
      return {
        success: false,
        error: errorMsg,
        projectData: mappingResult.data
      };
    }

    sendUpdate("mapped", 75, `מיפוי הושלם (רמת ביטחון: ${Math.round(mappingResult.confidence * 100)}%)`);
    await updateProspectStatus(prospectId, "mapped", "ai_mapping_complete");

    // Step 5: Generate Hebrew translations and SEO in parallel
    sendUpdate("validating", 80, "מתרגם לעברית ויוצר SEO (במקביל)...");

    // Run translation and SEO generation in parallel
    const [hebrewContent, seoData] = await Promise.all([
      translateToHebrew(mappingResult.data),
      generateSEO(mappingResult.data),
    ]);

    sendUpdate("validating", 90, "משלב תוצאות...");

    // Merge Hebrew content - prioritize AI-generated Hebrew, then translation
    const projectData: StructuredProject = {
      ...mappingResult.data,
      // Hebrew name - prefer AI-generated, then translation, then original
      nameHe: mappingResult.data.nameHe || hebrewContent.nameHe || mappingResult.data.name,
      // Hebrew description - prefer AI-generated (should be rich), then translation
      descriptionHe: mappingResult.data.descriptionHe || hebrewContent.descriptionHe || mappingResult.data.description,
      // Merge amenities with Hebrew translations
      amenities: hebrewContent.amenities || mappingResult.data.amenities,
      // Merge highlights with Hebrew translations
      highlights: hebrewContent.highlights || mappingResult.data.highlights,
      // Merge FAQ with Hebrew translations
      faq: hebrewContent.faq || mappingResult.data.faq,
      // AI-Classified Images from PDF
      imageManifest: imageManifest || undefined,
      classifiedImages: classifiedImages.length > 0 ? classifiedImages : undefined,
      // Hero image from manifest
      heroImage: imageManifest?.hero?.url || mappingResult.data.heroImage,
      // SEO data from parallel call
      seo: seoData,
      // Metadata
      sourceProspectId: prospectId,
      confidence: mappingResult.confidence,
      extractedAt: new Date().toISOString(),
    };

    // Log Hebrew content quality
    console.log(`[Prospect Processor] Hebrew content stats: description length=${projectData.descriptionHe?.length || 0}, amenities=${projectData.amenities?.length || 0}, highlights=${projectData.highlights?.length || 0}`);

    // Step 7: Save structured data
    sendUpdate("validating", 92, "שומר נתונים מובנים...");
    
    await db.update(prospects)
      .set({
        generatedTitle: projectData.name,
        generatedDescription: projectData.description,
        generatedSections: projectData as unknown as Record<string, unknown>,
        status: "ready",
        processedAt: new Date(),
      })
      .where(eq(prospects.id, prospectId));

    // Step 8: Auto-create project AND mini-site
    sendUpdate("publishing", 93, "יוצר פרויקט באתר...");
    const projectResult = await createProjectFromProspect(prospectId);
    
    if (!projectResult.success) {
      // Project creation failed but data is saved - mark as ready for manual retry
      sendUpdate("ready", 100, `העיבוד הושלם, אך יצירת הפרויקט נכשלה: ${projectResult.error}`);
      return { success: true, projectData };
    }
    
    // Step 9: Auto-create mini-site (only if projectId is valid)
    if (!projectResult.projectId) {
      console.warn(`Project creation returned success but no projectId for prospect ${prospectId}`);
      sendUpdate("published", 100, `הפרויקט נוצר, אך לא ניתן ליצור מיני-סייט (חסר מזהה פרויקט)`);
      await updateProspectStatus(prospectId, "published");
      return { success: true, projectData, projectSlug: projectResult.projectSlug };
    }
    
    sendUpdate("publishing", 97, "יוצר מיני-סייט...");
    const miniSiteResult = await createMiniSiteFromProspectInternal(prospectId, projectResult.projectId);
    
    if (miniSiteResult.success) {
      sendUpdate("published", 100, `הפרויקט והמיני-סייט נוצרו בהצלחה! slug: ${projectResult.projectSlug}`);
      await updateProspectStatus(prospectId, "published");
      return { 
        success: true, 
        projectData, 
        projectSlug: projectResult.projectSlug,
        miniSiteSlug: miniSiteResult.miniSiteSlug 
      };
    } else {
      // Mini-site creation failed but project was created
      console.warn(`Mini-site creation failed for prospect ${prospectId}: ${miniSiteResult.error}`);
      sendUpdate("published", 100, `הפרויקט נוצר, אך יצירת המיני-סייט נכשלה: ${miniSiteResult.error}`);
      await updateProspectStatus(prospectId, "published");
      return { success: true, projectData, projectSlug: projectResult.projectSlug };
    }

  } catch (error) {
    console.error("Prospect processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    sendUpdate("failed", 100, `שגיאה: ${errorMessage}`);
    await saveProspectError(prospectId, errorMessage);

    return { success: false, error: errorMessage };
  }
}

/**
 * Create Mini-Site from processed prospect data (public API with status check)
 */
export async function createMiniSiteFromProspect(
  prospectId: string
): Promise<{ success: boolean; miniSiteId?: string; miniSiteSlug?: string; error?: string }> {
  const [prospect] = await db.select().from(prospects).where(eq(prospects.id, prospectId));
  
  if (!prospect) {
    return { success: false, error: "Prospect not found" };
  }

  if (prospect.status !== "ready" && prospect.status !== "published") {
    return { success: false, error: "Prospect not ready for mini-site creation" };
  }

  if (!prospect.projectId) {
    return { success: false, error: "יש ליצור פרויקט לפני יצירת מיני-סייט" };
  }

  return createMiniSiteFromProspectInternal(prospectId, prospect.projectId);
}

/**
 * Internal mini-site creation (called during processing, no status check)
 * Requires a valid projectId to ensure mini-sites are always linked to projects.
 */
async function createMiniSiteFromProspectInternal(
  prospectId: string,
  projectId: string
): Promise<{ success: boolean; miniSiteId?: string; miniSiteSlug?: string; error?: string }> {
  try {
    // Validate projectId is provided (required)
    if (!projectId) {
      console.error("[Mini-site Creation] Cannot create mini-site without a project");
      return { success: false, error: "Project ID is required to create a mini-site" };
    }

    // Get the prospect data
    const [prospect] = await db.select().from(prospects).where(eq(prospects.id, prospectId));
    
    if (!prospect) {
      return { success: false, error: "Prospect not found" };
    }

    // Guard against duplicate mini-sites - check if one already exists for this prospect
    if (prospect.miniSiteId) {
      // Ensure we have the slug - if missing, look it up from the mini-sites table
      let miniSiteSlug: string | undefined = prospect.miniSiteSlug || undefined;
      if (!miniSiteSlug) {
        const [existingMiniSite] = await db.select().from(miniSites).where(eq(miniSites.id, prospect.miniSiteId));
        miniSiteSlug = existingMiniSite?.slug || undefined;
      }
      console.log(`[Mini-site Creation] Mini-site already exists for prospect ${prospectId}: ${miniSiteSlug}`);
      return { 
        success: true, 
        miniSiteId: prospect.miniSiteId, 
        miniSiteSlug 
      };
    }

    const projectData = prospect.generatedSections as unknown as StructuredProject;
    if (!projectData) {
      return { success: false, error: "No structured data available" };
    }

    // Generate unique slug from project name
    const baseSlug = generateSlug(projectData.name);
    const slug = await ensureUniqueSlug(baseSlug);

    // Create mini-site
    const miniSiteId = uuidv4();
    
    // Build location string from available data
    const locationStr = [
      projectData.location.address,
      projectData.location.area,
      projectData.location.city,
    ].filter(Boolean).join(', ');

    // Build subtitle from highlights or tagline
    const heroSubtitle = projectData.tagline || 
      (projectData.developer?.name ? `מאת ${projectData.developer.name}` : undefined) ||
      (projectData.location.area ? `ב-${projectData.location.area}` : undefined);

    // Extract gallery URLs from gallery images
    const galleryUrls = projectData.gallery?.map(img => typeof img === 'string' ? img : img.url).filter(Boolean);

    // Get image manifest from project data
    const imageManifest = projectData.imageManifest || null;
    const heroImageUrl = imageManifest?.hero?.url || projectData.heroImage;

    await db.insert(miniSites).values({
      id: miniSiteId,
      name: projectData.name,
      slug,
      projectId,
      status: "draft",
      hero: {
        title: projectData.nameHe || projectData.name,
        subtitle: heroSubtitle,
        image: heroImageUrl,
      },
      about: {
        title: "אודות הפרויקט",
        content: projectData.descriptionHe || projectData.description,
      },
      features: projectData.amenities?.map(a => ({
        icon: a.icon,
        title: a.nameHe || a.name,
        description: a.category || "",
        subcategory: a.subcategory,
      })) || projectData.highlights?.map(h => ({
        title: h.titleHe || h.title,
        description: h.value,
      })),
      gallery: galleryUrls,
      pricing: {
        title: "מחירים ויחידות",
        items: projectData.units?.map(u => ({
          name: u.type,
          price: u.priceFrom ? `החל מ-${u.priceFrom.toLocaleString()} ${projectData.priceCurrency}` : "לשאלה",
          details: u.sizeFrom && u.sizeTo ? `${u.sizeFrom} - ${u.sizeTo} ${u.sizeUnit || 'sqft'}` :
                   u.sizeFrom ? `${u.sizeFrom} ${u.sizeUnit || 'sqft'}` : "",
        })),
      },
      location: {
        address: locationStr || projectData.location.area,
        coordinates: projectData.location.coordinates,
        mapEmbed: projectData.location.mapEmbed,
        nearbyLandmarks: projectData.location.nearbyLandmarks,
        connectivity: projectData.location.connectivity,
      },
      faq: projectData.faq?.map(f => ({
        question: f.questionHe || f.question,
        answer: f.answerHe || f.answer,
      })),
      // AI-Classified images manifest for section-bound display
      imageManifest: imageManifest,
      seo: projectData.seo,
    });

    // Update prospect with mini-site reference
    await db.update(prospects)
      .set({ miniSiteId, miniSiteSlug: slug })
      .where(eq(prospects.id, prospectId));

    console.log(`[Mini-site Created] ${miniSiteId} (slug: ${slug}) linked to project ${projectId}`);

    return { success: true, miniSiteId, miniSiteSlug: slug };

  } catch (error) {
    console.error("Mini-site creation error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Create Project from processed prospect data - Full PropertyPage support
 */
export async function createProjectFromProspect(
  prospectId: string
): Promise<{ success: boolean; projectId?: string; projectSlug?: string; error?: string }> {
  try {
    const [prospect] = await db.select().from(prospects).where(eq(prospects.id, prospectId));
    
    if (!prospect) {
      return { success: false, error: "Prospect not found" };
    }

    const projectData = prospect.generatedSections as unknown as StructuredProject;
    if (!projectData) {
      return { success: false, error: "No structured data available" };
    }

    const projectId = uuidv4();
    
    // Generate unique slug for the project
    const baseSlug = generateSlug(projectData.name);
    const slug = await ensureUniqueProjectSlug(baseSlug);

    // Build location string
    const locationStr = [
      projectData.location.areaAr,
      projectData.location.area,
    ].filter(Boolean)[0] || projectData.location.city;

    // Map amenities to PropertyPage format: [{ category, items: [{ icon, name }] }]
    const amenitiesGrouped = groupAmenitiesByCategory(projectData.amenities || []);

    // Map units to PropertyPage format: [{ type, bedrooms, size, price, status }]
    const unitsFormatted = (projectData.units || []).map(u => ({
      type: u.type,
      bedrooms: u.type,
      size: u.sizeFrom && u.sizeTo 
        ? `${u.sizeFrom}-${u.sizeTo} ${u.sizeUnit || 'sqft'}`
        : u.sizeFrom ? `${u.sizeFrom} ${u.sizeUnit || 'sqft'}` : undefined,
      price: u.priceFrom 
        ? `${(u.priceFrom / 1000000).toFixed(1)}M ${projectData.priceCurrency || 'AED'}`
        : undefined,
      status: u.availability || "available",
    }));

    // Map payment plan to PropertyPage format: [{ milestone, percentage, description }]
    const paymentPlanFormatted = formatPaymentPlan(projectData.paymentPlan);

    // Map gallery to PropertyPage format: [{ url, alt, type }]
    // First, use extracted images from PDF if available (these are the REAL brochure images!)
    const extractedImagesFromProspect = (prospect.extractedImages as Array<{ url: string; alt?: string; page?: number; width?: number; height?: number }>) || [];

    console.log(`[Project Creation] Found ${extractedImagesFromProspect.length} extracted images from PDF`);

    // Sort extracted images - larger images first (likely more important)
    const sortedExtractedImages = [...extractedImagesFromProspect].sort((a, b) => {
      const sizeA = (a.width || 0) * (a.height || 0);
      const sizeB = (b.width || 0) * (b.height || 0);
      return sizeB - sizeA;
    });

    const galleryFromExtracted = sortedExtractedImages.map((img, idx) => ({
      url: img.url,
      alt: img.alt || `${projectData.nameHe || projectData.name} - תמונה ${idx + 1}`,
      type: "image" as const,
    }));

    // Then add any gallery images from AI mapping (usually URLs found in text)
    const galleryFromAI = (projectData.gallery || []).map(img => ({
      url: typeof img === 'string' ? img : img.url,
      alt: typeof img === 'string' ? (projectData.nameHe || projectData.name) : (img.alt || projectData.nameHe || projectData.name),
      type: "image" as const,
    }));

    // Combine extracted images first (priority!), then AI-mapped ones
    // Filter out any duplicates by URL
    const seenUrls = new Set<string>();
    const galleryFormatted = [...galleryFromExtracted, ...galleryFromAI].filter(img => {
      if (seenUrls.has(img.url)) return false;
      seenUrls.add(img.url);
      return true;
    });

    console.log(`[Project Creation] Final gallery has ${galleryFormatted.length} images (${galleryFromExtracted.length} from PDF, ${galleryFromAI.length} from AI)`);

    // Map highlights to PropertyPage format: [{ icon, title, value }]
    // Use Hebrew titles for display on the page
    const highlightsFormatted = (projectData.highlights || []).map(h => ({
      icon: h.icon || mapHighlightToIcon(h.title),
      title: h.titleHe || h.title, // Hebrew preferred
      titleEn: h.title, // Keep English for reference
      value: h.value,
    }));

    // Build neighborhood from location
    const neighborhood = {
      description: `${projectData.location.area}, ${projectData.location.city}`,
      nearbyPlaces: (projectData.location.nearbyLandmarks || []).map(l => ({
        name: l.name,
        distance: l.distance,
        type: l.type || "landmark",
      })),
    };

    // Map FAQs - use Hebrew content for display
    const faqsFormatted = (projectData.faq || []).map(f => ({
      question: f.questionHe || f.question, // Hebrew preferred
      answer: f.answerHe || f.answer, // Hebrew preferred
      questionEn: f.question, // Keep English for reference
      answerEn: f.answer,
    }));

    // Calculate ROI from highlights if available
    let roiPercent = projectData.roiPercent;
    if (!roiPercent) {
      const roiHighlight = projectData.highlights?.find(h => 
        h.title.toLowerCase().includes('roi') || h.title.includes('תשואה')
      );
      if (roiHighlight) {
        const roiMatch = roiHighlight.value.match(/(\d+)/);
        if (roiMatch) roiPercent = parseInt(roiMatch[1]);
      }
    }

    // Build amenities by category for new schema
    const amenitiesByCategory: Record<string, Array<{ name: string; nameHe?: string; icon?: string; subcategory?: string }>> = {};
    for (const amenity of projectData.amenities || []) {
      const cat = amenity.category || 'other';
      if (!amenitiesByCategory[cat]) amenitiesByCategory[cat] = [];
      amenitiesByCategory[cat].push({
        name: amenity.name,
        nameHe: amenity.nameHe,
        icon: amenity.icon,
        subcategory: amenity.subcategory,
      });
    }

    // Create extended units format that includes all extracted data for MiniSitePage
    // but also includes formatted fields for PropertyPage compatibility
    const unitsExtended = (projectData.units || []).map(u => ({
      // Raw data for MiniSitePage
      type: u.type,
      typeHe: u.typeHe,
      sizeFrom: u.sizeFrom,
      sizeTo: u.sizeTo,
      sizeUnit: u.sizeUnit || 'sqft',
      priceFrom: u.priceFrom,
      priceTo: u.priceTo,
      view: u.view,
      features: u.features,
      featuresHe: u.featuresHe,
      // Formatted fields for PropertyPage compatibility
      bedrooms: u.type,
      size: u.sizeFrom && u.sizeTo 
        ? `${u.sizeFrom}-${u.sizeTo} ${u.sizeUnit || 'sqft'}`
        : u.sizeFrom ? `${u.sizeFrom} ${u.sizeUnit || 'sqft'}` : undefined,
      price: u.priceFrom 
        ? `${(u.priceFrom / 1000000).toFixed(1)}M ${projectData.priceCurrency || 'AED'}`
        : undefined,
      status: u.availability || "available",
    }));

    await db.insert(projects).values({
      id: projectId,
      slug,
      name: projectData.nameHe || projectData.name,
      nameEn: projectData.name,
      developer: projectData.developer?.name || "Unknown Developer",
      developerLogo: projectData.developer?.logo,
      developerInfo: projectData.developer,
      location: locationStr,
      locationEn: projectData.location.area,
      coordinates: projectData.location.coordinates,
      locationDetails: projectData.location,
      priceFrom: projectData.priceFrom || 0,
      priceCurrency: projectData.priceCurrency || "AED",
      roiPercent,
      completionDate: projectData.completionDate || projectData.specs?.completionQuarter,
      propertyType: projectData.propertyType || "Residential",
      buildingType: projectData.buildingType,
      bedrooms: projectData.units?.map(u => u.type).join(", "),
      description: projectData.descriptionHe || projectData.description,
      descriptionEn: projectData.description,
      tagline: projectData.taglineHe || projectData.tagline,
      taglineEn: projectData.tagline,
      imageUrl: galleryFormatted[0]?.url || projectData.heroImage,
      featured: false,
      status: "draft",
      heroImage: galleryFormatted[0]?.url || projectData.heroImage,
      highlights: highlightsFormatted,
      amenities: amenitiesGrouped,
      amenitiesByCategory,
      units: unitsExtended,
      paymentPlan: projectData.paymentPlan,
      gallery: galleryFormatted,
      neighborhood,
      floorPlans: undefined,
      faqs: faqsFormatted,
      specs: projectData.specs,
      investmentMetrics: projectData.investmentMetrics,
      prospectId,
      miniSiteId: prospect.miniSiteId,
      seo: projectData.seo,
    });

    // Update prospect with project reference (including slug for easy navigation)
    await db.update(prospects)
      .set({ projectId, projectSlug: slug })
      .where(eq(prospects.id, prospectId));

    return { success: true, projectId, projectSlug: slug };

  } catch (error) {
    console.error("Project creation error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Group amenities by category for PropertyPage format
 * Enhanced to properly use Hebrew names and organize by categories
 */
function groupAmenitiesByCategory(amenities: Array<{ name: string; nameHe?: string; category?: string; icon?: string }>): Array<{ category: string; items: Array<{ icon: string; name: string }> }> {
  const categoryMap = new Map<string, Array<{ icon: string; name: string }>>();

  const categoryTranslations: Record<string, string> = {
    wellness: "בריאות וספורט",
    leisure: "פנאי ובידור",
    convenience: "נוחות ושירותים",
    security: "ביטחון ופרטיות",
    outdoor: "שטחים פתוחים",
    other: "מתקנים נוספים",
  };

  // Define category order for consistent display
  const categoryOrder = ["בריאות וספורט", "פנאי ובידור", "שטחים פתוחים", "נוחות ושירותים", "ביטחון ופרטיות", "מתקנים נוספים"];

  for (const amenity of amenities) {
    const category = categoryTranslations[amenity.category || "other"] || "מתקנים נוספים";
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push({
      icon: amenity.icon || mapAmenityToIcon(amenity.name),
      name: amenity.nameHe || amenity.name, // Hebrew preferred
    });
  }

  // Sort by defined order
  return categoryOrder
    .filter(cat => categoryMap.has(cat))
    .map(category => ({
      category,
      items: categoryMap.get(category)!,
    }));
}

/**
 * Format payment plan for PropertyPage
 */
function formatPaymentPlan(plan?: { downPayment?: number; duringConstruction?: number; onHandover?: number; postHandover?: number; milestones?: Array<{ percentage: number; description: string }> }): Array<{ milestone: string; percentage: number; description?: string }> {
  if (!plan) return [];
  
  const milestones: Array<{ milestone: string; percentage: number; description?: string }> = [];
  
  if (plan.downPayment) {
    milestones.push({ milestone: "בעת הזמנה", percentage: plan.downPayment, description: "תשלום ראשוני" });
  }
  if (plan.duringConstruction) {
    milestones.push({ milestone: "במהלך הבנייה", percentage: plan.duringConstruction, description: "תשלומים שוטפים" });
  }
  if (plan.onHandover) {
    milestones.push({ milestone: "במסירה", percentage: plan.onHandover, description: "תשלום סופי" });
  }
  if (plan.postHandover) {
    milestones.push({ milestone: "לאחר מסירה", percentage: plan.postHandover, description: "תשלומים נדחים" });
  }
  
  // Add custom milestones if available
  if (plan.milestones) {
    for (const m of plan.milestones) {
      if (!milestones.some(existing => existing.percentage === m.percentage)) {
        milestones.push({ milestone: m.description, percentage: m.percentage });
      }
    }
  }
  
  return milestones;
}

/**
 * Map amenity name to icon - comprehensive mapping for real estate amenities
 */
function mapAmenityToIcon(name: string): string {
  const lower = name.toLowerCase();

  // Pool & Water
  if (lower.includes('pool') || lower.includes('swim') || lower.includes('בריכה') || lower.includes('infinity')) return 'Waves';

  // Fitness & Wellness
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('חדר כושר') || lower.includes('workout')) return 'Dumbbell';
  if (lower.includes('spa') || lower.includes('sauna') || lower.includes('ספא') || lower.includes('steam') || lower.includes('massage')) return 'Sparkles';
  if (lower.includes('yoga') || lower.includes('meditation') || lower.includes('יוגה')) return 'Heart';

  // Security
  if (lower.includes('security') || lower.includes('guard') || lower.includes('אבטחה') || lower.includes('cctv') || lower.includes('24/7')) return 'Shield';

  // Outdoor & Nature
  if (lower.includes('park') || lower.includes('garden') || lower.includes('גינה') || lower.includes('landscape')) return 'TreePine';
  if (lower.includes('bbq') || lower.includes('grill') || lower.includes('ברביקיו')) return 'Flame';
  if (lower.includes('rooftop') || lower.includes('terrace') || lower.includes('גג')) return 'Sun';
  if (lower.includes('beach') || lower.includes('חוף')) return 'Umbrella';

  // Technology
  if (lower.includes('wifi') || lower.includes('internet') || lower.includes('smart')) return 'Wifi';

  // Food & Beverage
  if (lower.includes('cafe') || lower.includes('coffee') || lower.includes('קפה') || lower.includes('restaurant')) return 'Coffee';
  if (lower.includes('lounge') || lower.includes('bar') || lower.includes('לאונג')) return 'Wine';

  // Kids & Family
  if (lower.includes('kid') || lower.includes('child') || lower.includes('ילד') || lower.includes('play')) return 'Baby';
  if (lower.includes('nursery') || lower.includes('daycare')) return 'Baby';

  // Pets
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('חיות')) return 'PawPrint';

  // Parking & Transport
  if (lower.includes('parking') || lower.includes('car') || lower.includes('חניה') || lower.includes('valet')) return 'Car';

  // Concierge & Services
  if (lower.includes('concierge') || lower.includes('reception') || lower.includes('lobby') || lower.includes('קונסיירז')) return 'Bell';
  if (lower.includes('laundry') || lower.includes('dry clean') || lower.includes('כביסה')) return 'Shirt';
  if (lower.includes('mail') || lower.includes('package') || lower.includes('delivery')) return 'Package';

  // Sports & Recreation
  if (lower.includes('tennis') || lower.includes('squash') || lower.includes('court')) return 'Circle';
  if (lower.includes('basketball') || lower.includes('sport')) return 'Trophy';

  // Business & Work
  if (lower.includes('business') || lower.includes('meeting') || lower.includes('conference') || lower.includes('office')) return 'Briefcase';
  if (lower.includes('co-work') || lower.includes('cowork')) return 'Users';

  // View & Location
  if (lower.includes('view') || lower.includes('panoram') || lower.includes('נוף')) return 'Eye';
  if (lower.includes('balcon') || lower.includes('מרפסת')) return 'Square';

  // Default
  return 'Building2';
}

/**
 * Map highlight title to icon
 */
function mapHighlightToIcon(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('roi') || lower.includes('return') || lower.includes('תשואה')) return 'TrendingUp';
  if (lower.includes('completion') || lower.includes('handover') || lower.includes('מסירה')) return 'Calendar';
  if (lower.includes('unit') || lower.includes('apartment') || lower.includes('יחיד')) return 'Home';
  if (lower.includes('floor') || lower.includes('קומ')) return 'Building2';
  if (lower.includes('size') || lower.includes('area') || lower.includes('שטח')) return 'Ruler';
  if (lower.includes('price') || lower.includes('מחיר')) return 'DollarSign';
  return 'Award';
}

/**
 * Ensure unique project slug
 */
async function ensureUniqueProjectSlug(baseSlug: string): Promise<string> {
  const existingSlugs = await db.select({ slug: projects.slug })
    .from(projects)
    .where(like(projects.slug, `${baseSlug}%`));
  
  if (existingSlugs.length === 0) {
    return baseSlug;
  }
  
  const slugSet = new Set(existingSlugs.map(r => r.slug).filter(Boolean));
  
  if (!slugSet.has(baseSlug)) {
    return baseSlug;
  }
  
  let counter = 2;
  while (slugSet.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  
  return `${baseSlug}-${counter}`;
}

/**
 * Update prospect status and checkpoint
 */
async function updateProspectStatus(prospectId: string, status: string, checkpoint?: string): Promise<void> {
  const updateData: Record<string, unknown> = { status };
  if (checkpoint) {
    updateData.processingCheckpoint = checkpoint;
  }
  await db.update(prospects)
    .set(updateData)
    .where(eq(prospects.id, prospectId));
}

/**
 * Save error to prospect for debugging
 */
async function saveProspectError(prospectId: string, error: string): Promise<void> {
  await db.update(prospects)
    .set({
      status: "failed",
      lastError: error.slice(0, 1000), // Limit error message length
    })
    .where(eq(prospects.id, prospectId));
}

/**
 * Generate URL slug from text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Ensure unique slug by appending incremental suffix if needed
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  // Check if base slug exists
  const existingSlugs = await db.select({ slug: miniSites.slug })
    .from(miniSites)
    .where(like(miniSites.slug, `${baseSlug}%`));
  
  if (existingSlugs.length === 0) {
    return baseSlug;
  }
  
  const slugSet = new Set(existingSlugs.map(r => r.slug));
  
  // If exact slug doesn't exist, use it
  if (!slugSet.has(baseSlug)) {
    return baseSlug;
  }
  
  // Find the next available number suffix
  let counter = 2;
  while (slugSet.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  
  return `${baseSlug}-${counter}`;
}

/**
 * Get processing status for a prospect
 */
export async function getProspectProcessingStatus(prospectId: string): Promise<{
  status: string;
  hasStructuredData: boolean;
  hasMiniSite: boolean;
  hasProject: boolean;
  confidence?: number;
}> {
  const [prospect] = await db.select().from(prospects).where(eq(prospects.id, prospectId));
  
  if (!prospect) {
    return {
      status: "not_found",
      hasStructuredData: false,
      hasMiniSite: false,
      hasProject: false,
    };
  }

  const projectData = prospect.generatedSections as unknown as StructuredProject;

  return {
    status: prospect.status || "unknown",
    hasStructuredData: !!projectData,
    hasMiniSite: !!prospect.miniSiteId,
    hasProject: !!prospect.projectId,
    confidence: projectData?.confidence,
  };
}
