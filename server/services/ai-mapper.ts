import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { z } from "zod";
import { 
  structuredProjectSchema, 
  type StructuredProject,
  type ExtractedBlock 
} from "@shared/prospect-schemas";

// Validate Google API Key at module load
if (!process.env.GOOGLE_API_KEY) {
  console.warn("[AI Mapper] Warning: GOOGLE_API_KEY not set. AI mapping will fail.");
}

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SYSTEM_PROMPT = `You are an elite real estate marketing specialist creating premium property listings for Israeli investors in Dubai. Your task is to transform raw PDF brochure content into comprehensive structured data for a high-conversion mini-site.

You will receive raw text and tables from a real estate brochure. Extract ALL information thoroughly.

CRITICAL: Generate Hebrew content (עברית) for ALL text fields. The output powers a bilingual marketing mini-site.

REQUIRED JSON STRUCTURE:

{
  "name": "Project Name in English (keep original)",
  "nameHe": "שם הפרויקט בעברית",
  "tagline": "English tagline if found",
  "taglineHe": "סלוגן שיווקי קצר ומרשים בעברית",
  "propertyType": "Residential|Commercial|Mixed-Use",
  "buildingType": "Tower|Villa|Townhouse|Low-Rise",
  
  "description": "Full English description - 2-3 paragraphs about the project, lifestyle, and design",
  "descriptionHe": "תיאור שיווקי מפורט ומרשים בעברית. 3-5 פסקאות. כתוב כמו סוכן נדל\"ן מקצועי. תאר את אורח החיים, העיצוב האדריכלי, היתרונות להשקעה, והחוויה הייחודית. השתמש בשפה עשירה ומפתה.",
  
  "developer": {
    "name": "Developer Name",
    "description": "About the developer",
    "established": "2005",
    "notableProjects": ["Project 1", "Project 2"]
  },
  
  "location": {
    "area": "Jumeirah Village Circle",
    "areaHe": "ג'ומיירה וילג' סירקל",
    "city": "Dubai",
    "country": "UAE",
    "address": "Full address if available",
    "description": "Location description in English",
    "descriptionHe": "תיאור המיקום בעברית - יתרונות, נגישות, סביבה",
    "nearbyLandmarks": [
      {"name": "Dubai Mall", "nameHe": "דובאי מול", "distance": "15 min", "distanceKm": 12, "travelTimeMinutes": 15, "travelMode": "driving", "type": "mall"},
      {"name": "Dubai Marina", "nameHe": "דובאי מרינה", "distance": "10 min", "distanceKm": 8, "travelTimeMinutes": 10, "travelMode": "driving", "type": "landmark"},
      {"name": "Metro Station", "nameHe": "תחנת מטרו", "distance": "5 min", "distanceKm": 2, "travelTimeMinutes": 5, "travelMode": "driving", "type": "metro"}
    ],
    "connectivity": [
      {"destination": "Downtown Dubai", "destinationHe": "דאונטאון דובאי", "timeMinutes": 25, "distance": "20km"},
      {"destination": "Dubai Airport", "destinationHe": "נמל התעופה", "timeMinutes": 30, "distance": "25km"}
    ]
  },
  
  "specs": {
    "totalFloors": 25,
    "totalUnits": 320,
    "totalParkingSpaces": 400,
    "plotSizeSqft": 50000,
    "builtUpAreaSqft": 250000,
    "buildingHeight": "25 floors",
    "completionQuarter": "Q4 2026",
    "constructionStatus": "under-construction",
    "launchDate": "2024",
    "architecturalStyle": "French Contemporary"
  },
  
  "units": [
    {
      "type": "Studio",
      "typeHe": "סטודיו",
      "sizeFrom": 400,
      "sizeTo": 500,
      "sizeUnit": "sqft",
      "priceFrom": 650000,
      "priceTo": 750000,
      "availability": "available",
      "view": "Garden View",
      "features": ["Smart Home", "Fitted Kitchen"],
      "featuresHe": ["בית חכם", "מטבח מאובזר"]
    },
    {
      "type": "1BR",
      "typeHe": "חדר שינה אחד",
      "sizeFrom": 700,
      "sizeTo": 900,
      "sizeUnit": "sqft",
      "priceFrom": 900000,
      "priceTo": 1200000,
      "availability": "available",
      "view": "Pool View",
      "features": ["Balcony", "Walk-in Closet"],
      "featuresHe": ["מרפסת", "ארון הליכה"]
    },
    {
      "type": "2BR",
      "typeHe": "שני חדרי שינה",
      "sizeFrom": 1100,
      "sizeTo": 1400,
      "sizeUnit": "sqft",
      "priceFrom": 1400000,
      "priceTo": 1800000,
      "availability": "available",
      "view": "City View",
      "features": ["Private Pool", "Maid's Room"],
      "featuresHe": ["בריכה פרטית", "חדר עוזרת בית"]
    }
  ],
  
  "amenities": [
    {"name": "Infinity Pool", "nameHe": "בריכת אינפיניטי", "category": "leisure", "subcategory": "Rooftop", "icon": "Waves", "isHighlight": true},
    {"name": "Lap Pool", "nameHe": "בריכת שחייה", "category": "leisure", "subcategory": "Podium", "icon": "Waves"},
    {"name": "Kids Splash Pad", "nameHe": "משטח שפריץ לילדים", "category": "kids", "subcategory": "Podium", "icon": "Baby"},
    {"name": "State-of-the-art Gym", "nameHe": "חדר כושר מתקדם", "category": "wellness", "subcategory": "Podium", "icon": "Dumbbell", "isHighlight": true},
    {"name": "Yoga Terrace", "nameHe": "מרפסת יוגה", "category": "wellness", "subcategory": "Rooftop", "icon": "Heart"},
    {"name": "Sauna & Steam", "nameHe": "סאונה וחמאם", "category": "wellness", "subcategory": "Podium", "icon": "Sparkles"},
    {"name": "Jacuzzi", "nameHe": "ג'קוזי", "category": "wellness", "subcategory": "Rooftop", "icon": "Waves"},
    {"name": "Rooftop Cinema", "nameHe": "קולנוע על הגג", "category": "leisure", "subcategory": "Rooftop", "icon": "Film", "isHighlight": true},
    {"name": "Rooftop Lounge", "nameHe": "לאונג' על הגג", "category": "leisure", "subcategory": "Rooftop", "icon": "Sun"},
    {"name": "BBQ Area", "nameHe": "אזור ברביקיו", "category": "outdoor", "subcategory": "Rooftop", "icon": "Flame"},
    {"name": "Zen Garden", "nameHe": "גן זן", "category": "outdoor", "subcategory": "Podium", "icon": "TreePine"},
    {"name": "Vertical Garden", "nameHe": "גינה אנכית", "category": "outdoor", "subcategory": "Facade", "icon": "Leaf"},
    {"name": "Kids Indoor Play", "nameHe": "משחקיית ילדים מקורה", "category": "kids", "subcategory": "Podium", "icon": "Baby"},
    {"name": "Kids Outdoor Play", "nameHe": "מגרש משחקים חיצוני", "category": "kids", "subcategory": "Podium", "icon": "Baby"},
    {"name": "Smart Home System", "nameHe": "מערכת בית חכם", "category": "smart", "icon": "Smartphone", "isHighlight": true},
    {"name": "EV Charging", "nameHe": "עמדת טעינה לרכב חשמלי", "category": "smart", "icon": "Zap"},
    {"name": "Underground Parking", "nameHe": "חניה תת-קרקעית", "category": "convenience", "icon": "Car"},
    {"name": "Concierge Service", "nameHe": "שירותי קונסיירז'", "category": "convenience", "icon": "Bell"},
    {"name": "24/7 Security", "nameHe": "אבטחה 24/7", "category": "security", "icon": "Shield"},
    {"name": "CCTV Surveillance", "nameHe": "מצלמות אבטחה", "category": "security", "icon": "Eye"},
    {"name": "Multipurpose Hall", "nameHe": "אולם רב תכליתי", "category": "convenience", "icon": "Building"}
  ],
  
  "highlights": [
    {"title": "Total Units", "titleHe": "סה\"כ יחידות", "value": "320", "icon": "Building2"},
    {"title": "Floors", "titleHe": "קומות", "value": "25", "icon": "Layers"},
    {"title": "Completion", "titleHe": "מסירה", "value": "Q4 2026", "icon": "Calendar"},
    {"title": "Architecture", "titleHe": "אדריכלות", "value": "French Design", "icon": "Award"},
    {"title": "ROI", "titleHe": "תשואה צפויה", "value": "7-9%", "icon": "TrendingUp"},
    {"title": "Starting Price", "titleHe": "מחיר התחלתי", "value": "650K AED", "icon": "DollarSign"}
  ],
  
  "paymentPlan": {
    "name": "Flexible 60/40 Plan",
    "downPayment": 20,
    "duringConstruction": 40,
    "onHandover": 40,
    "postHandover": 0,
    "milestones": [
      {"percentage": 20, "description": "On Booking", "timing": "Immediate"},
      {"percentage": 10, "description": "Within 30 days", "timing": "Month 1"},
      {"percentage": 10, "description": "30% Construction", "timing": "Month 6"},
      {"percentage": 10, "description": "50% Construction", "timing": "Month 12"},
      {"percentage": 10, "description": "70% Construction", "timing": "Month 18"},
      {"percentage": 40, "description": "On Handover", "timing": "Q4 2026"}
    ]
  },
  
  "investmentMetrics": {
    "expectedRoiPercent": 8,
    "rentalYieldPercent": 7,
    "pricePerSqft": 1200,
    "serviceChargePerSqft": 15,
    "capitalAppreciationForecast": "15-20% by 2028"
  },
  
  "completionDate": "Q4 2026",
  "priceFrom": 650000,
  "priceTo": 3500000,
  "priceCurrency": "AED",
  "totalUnits": 320,
  "floors": 25,
  "roiPercent": 8,
  
  "faq": [
    {
      "question": "What is the payment plan?",
      "questionHe": "מהי תכנית התשלומים?",
      "answer": "Flexible 60/40 payment plan with 20% on booking",
      "answerHe": "תכנית תשלומים גמישה 60/40: 20% במעמד החתימה, 40% במהלך הבנייה, ו-40% במסירה.",
      "category": "payment"
    },
    {
      "question": "When is the expected handover?",
      "questionHe": "מתי המסירה הצפויה?",
      "answer": "Q4 2026",
      "answerHe": "המסירה צפויה ברבעון הרביעי של 2026.",
      "category": "timeline"
    },
    {
      "question": "What is the expected ROI?",
      "questionHe": "מהי התשואה הצפויה?",
      "answer": "7-9% rental yield expected",
      "answerHe": "תשואת שכירות צפויה של 7-9% לשנה, עם פוטנציאל לעליית ערך של 15-20% עד 2028.",
      "category": "investment"
    },
    {
      "question": "Is financing available for foreign buyers?",
      "questionHe": "האם יש מימון לרוכשים זרים?",
      "answer": "Yes, mortgage options available for international buyers",
      "answerHe": "כן, קיימות אפשרויות מימון ומשכנתא גם עבור רוכשים בינלאומיים מישראל.",
      "category": "payment"
    },
    {
      "question": "What amenities are included?",
      "questionHe": "אילו מתקנים כלולים?",
      "answer": "Premium amenities including pools, gym, rooftop cinema, and smart home features",
      "answerHe": "מתקני פרימיום כולל בריכות, חדר כושר, קולנוע על הגג, מערכת בית חכם, ועוד.",
      "category": "amenities"
    }
  ]
}

EXTRACTION RULES - CRITICAL:
1. Extract ACTUAL data from the PDF - NEVER invent prices, dates, or unit counts
2. Prices as numbers: 850000 (not "850,000 AED")
3. Dates as "Q1 2025" format
4. Extract ALL amenities mentioned, grouped by category (wellness/leisure/kids/outdoor/smart/convenience/security)
5. Extract unit types from pricing tables with size ranges and price ranges
6. Extract payment plan percentages and milestones accurately
7. Extract nearby landmarks with distances/travel times
8. Map icons to Lucide icon names: Waves, Dumbbell, Shield, Car, TreePine, Baby, Coffee, Sparkles, Sun, Flame, Bell, Smartphone, Zap, Heart, Film, Eye, Leaf, Building, Award, Calendar, TrendingUp, DollarSign, Layers, Building2

CATEGORIES for amenities:
- wellness: gym, spa, sauna, yoga, jacuzzi
- leisure: pools, cinema, lounge, game room
- kids: play areas, splash pad
- outdoor: gardens, BBQ, terraces
- smart: smart home, EV charging
- convenience: parking, concierge, lobby
- security: CCTV, guards, access control

Respond with valid JSON only. No markdown, no explanations.`;

const UNIT_EXTRACTION_PROMPT = `Extract unit types and pricing from this real estate data. For each unit type, extract:
- type (e.g., "1BR", "2BR", "Studio", "Penthouse")
- sizeFrom and sizeTo (in sqft or sqm)
- priceFrom and priceTo (in AED or mentioned currency)
- availability status

Respond with a JSON array of units.`;

const PAYMENT_PLAN_PROMPT = `Extract the payment plan from this real estate data. Look for:
- Down payment percentage (on booking)
- During construction percentage
- On handover percentage
- Post-handover percentage and duration (if applicable)
- Individual milestones with percentages and timing

Respond with a JSON object matching this structure:
{
  "name": "plan name if mentioned",
  "downPayment": percentage,
  "duringConstruction": percentage,
  "onHandover": percentage,
  "postHandover": percentage,
  "postHandoverYears": number,
  "milestones": [{ "percentage": %, "description": "text", "timing": "optional" }]
}`;

export interface AIMapperResult {
  success: boolean;
  data?: StructuredProject;
  errors?: string[];
  confidence: number;
  rawResponse?: unknown;
}

/**
 * Helper function to clean JSON response from Gemini
 * Handles markdown fences, preambles, and other common issues
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  
  // Remove markdown code fences
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  
  cleaned = cleaned.trim();
  
  // Try to find JSON object or array
  const jsonStart = cleaned.indexOf("{");
  const arrayStart = cleaned.indexOf("[");
  
  if (jsonStart === -1 && arrayStart === -1) {
    return cleaned;
  }
  
  // Use whichever comes first
  const startIdx = jsonStart === -1 ? arrayStart : 
                   arrayStart === -1 ? jsonStart : 
                   Math.min(jsonStart, arrayStart);
  
  // Find the matching end brace/bracket
  const isArray = cleaned[startIdx] === "[";
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
 * Helper function to call Gemini and get JSON response
 */
async function callGemini(systemPrompt: string, userContent: string): Promise<string | null> {
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n---\n\n${userContent}` }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });
    
    const response = result.response;
    const text = response.text();
    
    // Clean the response to handle markdown fences
    return cleanJsonResponse(text);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

/**
 * Map raw extracted content to structured project data using AI
 */
export async function mapToStructuredProject(
  text: string,
  tables: Array<{ headers: string[]; rows: string[][] }>,
  metadata: Record<string, unknown> = {}
): Promise<AIMapperResult> {
  try {
    // Prepare the content for AI
    const tableText = tables.map((t, i) => {
      const headerRow = t.headers.join(' | ');
      const dataRows = t.rows.map(r => r.join(' | ')).join('\n');
      return `\nTable ${i + 1}:\n${headerRow}\n${dataRows}`;
    }).join('\n');

    const content = `
DOCUMENT TEXT:
${text.substring(0, 15000)} ${text.length > 15000 ? '... [truncated]' : ''}

EXTRACTED TABLES:
${tableText || 'No tables extracted'}

METADATA:
${JSON.stringify(metadata, null, 2)}
`;

    const rawContent = await callGemini(SYSTEM_PROMPT, content);
    
    if (!rawContent) {
      return {
        success: false,
        errors: ["No response from AI"],
        confidence: 0,
      };
    }

    // Parse and validate the response
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return {
        success: false,
        errors: ["Invalid JSON response from AI"],
        confidence: 0,
        rawResponse: rawContent,
      };
    }

    // Validate against schema
    const validation = structuredProjectSchema.safeParse(parsed);
    
    if (validation.success) {
      return {
        success: true,
        data: validation.data,
        confidence: calculateMappingConfidence(validation.data),
      };
    } else {
      // Try to extract what we can
      const partialData = parsed as Record<string, unknown>;
      const errors = validation.error.errors.map(e => 
        `${e.path.join('.')}: ${e.message}`
      );
      
      console.log("AI mapper validation failed:");
      console.log("Errors:", JSON.stringify(errors, null, 2));
      console.log("Raw AI response keys:", Object.keys(partialData));
      
      // Attempt partial parsing for required fields
      const minimalProject = extractMinimalProject(partialData);
      
      if (minimalProject) {
        // If we got a minimal project, return success with lower confidence
        return {
          success: true,
          data: minimalProject,
          confidence: 0.5,
          rawResponse: parsed,
        };
      }
      
      return {
        success: false,
        data: minimalProject,
        errors,
        confidence: 0.3,
        rawResponse: parsed,
      };
    }
  } catch (error) {
    console.error("AI mapping error:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Unknown error occurred during AI mapping"],
      confidence: 0,
    };
  }
}

/**
 * Extract units from text with AI assistance
 */
export async function extractUnitsWithAI(
  text: string,
  tables: Array<{ headers: string[]; rows: string[][] }>
): Promise<z.infer<typeof structuredProjectSchema>['units']> {
  try {
    const tableText = tables.map((t, i) => {
      const headerRow = t.headers.join(' | ');
      const dataRows = t.rows.map(r => r.join(' | ')).join('\n');
      return `Table ${i + 1}:\n${headerRow}\n${dataRows}`;
    }).join('\n\n');

    const content = await callGemini(
      UNIT_EXTRACTION_PROMPT,
      `Text:\n${text.substring(0, 8000)}\n\nTables:\n${tableText}`
    );

    if (!content) return [];

    const parsed = JSON.parse(content);
    return Array.isArray(parsed.units) ? parsed.units : 
           Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unit extraction error:", error);
    return [];
  }
}

/**
 * Extract payment plan from text with AI assistance
 */
export async function extractPaymentPlanWithAI(
  text: string,
  tables: Array<{ headers: string[]; rows: string[][] }>
): Promise<z.infer<typeof structuredProjectSchema>['paymentPlan']> {
  try {
    const tableText = tables.map((t, i) => {
      const headerRow = t.headers.join(' | ');
      const dataRows = t.rows.map(r => r.join(' | ')).join('\n');
      return `Table ${i + 1}:\n${headerRow}\n${dataRows}`;
    }).join('\n\n');

    const content = await callGemini(
      PAYMENT_PLAN_PROMPT,
      `Text:\n${text.substring(0, 8000)}\n\nTables:\n${tableText}`
    );

    if (!content) return undefined;

    return JSON.parse(content);
  } catch (error) {
    console.error("Payment plan extraction error:", error);
    return undefined;
  }
}

/**
 * Generate Hebrew translation for extracted content
 * Enhanced to translate ALL content including amenities, highlights, and FAQs
 */
export async function translateToHebrew(
  project: StructuredProject
): Promise<Partial<StructuredProject>> {
  try {
    // If AI already generated Hebrew content, enhance it
    if (project.descriptionHe && project.descriptionHe.length > 100) {
      // AI mapper already generated Hebrew content, just enhance if needed
      return {
        nameHe: project.nameHe,
        taglineHe: (project as Record<string, unknown>).taglineHe as string,
        descriptionHe: project.descriptionHe,
      };
    }

    // Build comprehensive translation request
    const toTranslate = {
      name: project.name,
      tagline: project.tagline,
      description: project.description,
      amenities: project.amenities?.map(a => a.name).slice(0, 20),
      highlights: project.highlights?.map(h => ({ title: h.title, value: h.value })).slice(0, 10),
      faq: project.faq?.slice(0, 5),
    };

    const translationPrompt = `You are an elite Hebrew translator and real estate marketing copywriter for Israeli investors.

Transform the content into compelling Hebrew marketing material.

CRITICAL REQUIREMENTS:
1. nameHe: Transliterate the project name to Hebrew (keep English name recognizable)
2. taglineHe: Create a short, compelling Hebrew tagline (max 10 words)
3. descriptionHe: Write 3-5 rich marketing paragraphs in Hebrew:
   - Describe the lifestyle and luxury experience
   - Highlight investment benefits for Israelis
   - Mention architectural vision and quality
   - Include location advantages
   - Use persuasive, professional language

4. amenitiesHe: Array of Hebrew translations for each amenity
5. highlightsHe: Array of {titleHe, value} for each highlight
6. faqHe: Array of {questionHe, answerHe} for each FAQ

Make it read like a premium Israeli real estate brochure - compelling and professional.

Respond with JSON:
{
  "nameHe": "שם הפרויקט",
  "taglineHe": "סלוגן מרשים",
  "descriptionHe": "תיאור ארוך ומפורט...",
  "amenitiesHe": ["בריכת אינפיניטי", "חדר כושר", ...],
  "highlightsHe": [{"titleHe": "יחידות", "value": "320"}, ...],
  "faqHe": [{"questionHe": "שאלה?", "answerHe": "תשובה"}, ...]
}`;

    const content = await callGemini(translationPrompt, JSON.stringify(toTranslate));

    if (!content) return {};

    const translated = JSON.parse(content);

    // Merge translated amenities back
    const result: Partial<StructuredProject> = {
      nameHe: translated.nameHe,
      descriptionHe: translated.descriptionHe,
    };

    // Update amenities with Hebrew names
    if (translated.amenitiesHe && project.amenities) {
      result.amenities = project.amenities.map((a, idx) => ({
        ...a,
        nameHe: translated.amenitiesHe[idx] || a.nameHe || a.name,
      }));
    }

    // Update highlights with Hebrew titles
    if (translated.highlightsHe && project.highlights) {
      result.highlights = project.highlights.map((h, idx) => ({
        ...h,
        titleHe: translated.highlightsHe[idx]?.titleHe || h.titleHe || h.title,
      }));
    }

    // Update FAQ with Hebrew content
    if (translated.faqHe && project.faq) {
      result.faq = project.faq.map((f, idx) => ({
        ...f,
        questionHe: translated.faqHe[idx]?.questionHe || f.questionHe || f.question,
        answerHe: translated.faqHe[idx]?.answerHe || f.answerHe || f.answer,
      }));
    }

    return result;
  } catch (error) {
    console.error("Translation error:", error);
    return {};
  }
}

/**
 * Generate SEO metadata for the project
 */
export async function generateSEO(
  project: StructuredProject
): Promise<NonNullable<StructuredProject['seo']>> {
  try {
    const seoPrompt = "Generate SEO metadata for a real estate project page targeting Israeli investors interested in Dubai properties. Create a compelling title (max 60 chars), description (max 160 chars), and relevant keywords. The content should be in Hebrew. Respond with JSON: { title, description, keywords: [] }";
    
    const userContent = `Project: ${project.name}\nDeveloper: ${project.developer?.name}\nLocation: ${project.location?.area}\nPrice from: ${project.priceFrom} ${project.priceCurrency}\nType: ${project.propertyType}`;

    const content = await callGemini(seoPrompt, userContent);

    if (!content) {
      return {
        title: project.name,
        description: project.description?.substring(0, 160),
        keywords: [],
      };
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("SEO generation error:", error);
    return {
      title: project.name,
      description: project.description?.substring(0, 160),
      keywords: [],
    };
  }
}

/**
 * Calculate confidence score for mapped data
 */
function calculateMappingConfidence(data: StructuredProject): number {
  let score = 0;
  let maxScore = 0;

  // Required fields
  maxScore += 20;
  if (data.name) score += 10;
  if (data.location) score += 10;

  // Developer info
  maxScore += 15;
  if (data.developer?.name) score += 15;

  // Unit info
  maxScore += 20;
  if (data.units && data.units.length > 0) score += 20;

  // Payment plan
  maxScore += 15;
  if (data.paymentPlan) score += 15;

  // Pricing
  maxScore += 15;
  if (data.priceFrom) score += 15;

  // Amenities
  maxScore += 10;
  if (data.amenities && data.amenities.length > 0) score += 10;

  // Completion date
  maxScore += 5;
  if (data.completionDate) score += 5;

  return score / maxScore;
}

/**
 * Extract minimal project data from partial response
 */
function extractMinimalProject(data: Record<string, unknown>): StructuredProject {
  // Handle various field name formats from AI response
  const projectName = String(
    data.name || 
    data.projectName || 
    data.project_name || 
    data.project_name_en || 
    data.projectNameEn ||
    "Unknown Project"
  );
  
  const propertyType = String(
    data.propertyType || 
    data.property_type || 
    "Residential"
  );
  
  // Extract location - handle nested and flat formats
  const locationData = data.location as Record<string, unknown> | undefined;
  const area = String(
    locationData?.area || 
    locationData?.district ||
    locationData?.neighborhood ||
    data.area || 
    data.district ||
    "Dubai"
  );
  
  // Extract developer info
  const developerData = data.developer as Record<string, unknown> | undefined;
  const developerName = String(
    developerData?.name ||
    data.developer_name ||
    data.developerName ||
    ""
  );
  
  // Extract description - critical for marketing content
  const description = String(
    data.description ||
    data.projectDescription ||
    data.project_description ||
    data.overview ||
    data.about ||
    ""
  );
  
  const result: StructuredProject = {
    name: projectName,
    propertyType,
    location: {
      area,
      city: String(locationData?.city || "Dubai"),
      country: String(locationData?.country || "UAE"),
      address: String(locationData?.address || ""),
    },
    priceCurrency: "AED",
  };
  
  // Add developer if found
  if (developerName) {
    result.developer = { name: developerName };
  }
  
  // Add description if found
  if (description) {
    result.description = description;
  }
  
  // Extract amenities - handle various formats
  const validCategories = ["wellness", "leisure", "convenience", "security", "outdoor", "other"] as const;
  type AmenityCategory = typeof validCategories[number];
  
  const rawAmenities = data.amenities || data.facilities || data.features || [];
  if (Array.isArray(rawAmenities) && rawAmenities.length > 0) {
    result.amenities = rawAmenities.map((a: unknown) => {
      if (typeof a === 'string') {
        return { name: a };
      }
      if (typeof a === 'object' && a !== null) {
        const obj = a as Record<string, unknown>;
        const rawCategory = obj.category as string | undefined;
        const category: AmenityCategory | undefined = rawCategory && validCategories.includes(rawCategory as AmenityCategory) 
          ? rawCategory as AmenityCategory 
          : undefined;
        return {
          name: String(obj.name || obj.title || obj.feature || ''),
          category,
        };
      }
      return { name: String(a) };
    }).filter(a => a.name);
  }
  
  // Extract highlights - handle various formats
  const rawHighlights = data.highlights || data.keyFeatures || data.key_features || [];
  if (Array.isArray(rawHighlights) && rawHighlights.length > 0) {
    result.highlights = rawHighlights.map((h: unknown) => {
      if (typeof h === 'object' && h !== null) {
        const obj = h as Record<string, unknown>;
        return {
          title: String(obj.title || obj.key || obj.name || ''),
          value: String(obj.value || obj.detail || ''),
        };
      }
      return { title: String(h), value: '' };
    }).filter(h => h.title);
  }
  
  // Extract units - handle various formats
  const rawUnits = data.units || data.unitTypes || data.unit_types || [];
  if (Array.isArray(rawUnits) && rawUnits.length > 0) {
    result.units = rawUnits.map((u: unknown) => {
      if (typeof u === 'object' && u !== null) {
        const obj = u as Record<string, unknown>;
        return {
          type: String(obj.type || obj.unitType || obj.name || ''),
          sizeFrom: Number(obj.sizeFrom || obj.size_from || obj.minSize || 0),
          sizeTo: Number(obj.sizeTo || obj.size_to || obj.maxSize || 0),
          sizeUnit: "sqft" as const,
          priceFrom: Number(obj.priceFrom || obj.price_from || obj.minPrice || 0),
          priceTo: Number(obj.priceTo || obj.price_to || obj.maxPrice || 0),
          priceCurrency: "AED",
        };
      }
      return { type: String(u), sizeUnit: "sqft" as const, priceCurrency: "AED" };
    }).filter(u => u.type);
  }
  
  // Extract payment plan - handle various formats
  const rawPaymentPlan = data.paymentPlan || data.payment_plan || data.paymentTerms || {};
  if (typeof rawPaymentPlan === 'object' && rawPaymentPlan !== null) {
    const pp = rawPaymentPlan as Record<string, unknown>;
    result.paymentPlan = {
      downPayment: Number(pp.downPayment || pp.down_payment || pp.booking || 0),
      duringConstruction: Number(pp.duringConstruction || pp.during_construction || pp.construction || 0),
      onHandover: Number(pp.onHandover || pp.on_handover || pp.handover || 0),
    };
    if (pp.name) {
      result.paymentPlan.name = String(pp.name);
    }
  }
  
  // Extract pricing
  if (data.priceFrom || data.price_from || data.startingPrice) {
    result.priceFrom = Number(data.priceFrom || data.price_from || data.startingPrice);
  }
  if (data.priceTo || data.price_to || data.maxPrice) {
    result.priceTo = Number(data.priceTo || data.price_to || data.maxPrice);
  }
  
  // Extract completion date
  if (data.completionDate || data.completion_date || data.handover) {
    result.completionDate = String(data.completionDate || data.completion_date || data.handover);
  }
  
  // Extract Hebrew fields if available
  if (data.nameHe || data.name_he) {
    result.nameHe = String(data.nameHe || data.name_he);
  }
  if (data.descriptionHe || data.description_he) {
    result.descriptionHe = String(data.descriptionHe || data.description_he);
  }
  
  // Extract FAQ if available
  const rawFaq = data.faq || data.faqs || [];
  if (Array.isArray(rawFaq) && rawFaq.length > 0) {
    result.faq = rawFaq.map((f: unknown) => {
      if (typeof f === 'object' && f !== null) {
        const obj = f as Record<string, unknown>;
        return {
          question: String(obj.question || obj.q || ''),
          answer: String(obj.answer || obj.a || ''),
          questionHe: obj.questionHe ? String(obj.questionHe) : undefined,
          answerHe: obj.answerHe ? String(obj.answerHe) : undefined,
        };
      }
      return { question: '', answer: '' };
    }).filter(f => f.question && f.answer);
  }
  
  return result;
}

/**
 * Map extracted blocks to sections (for visual editor)
 */
export async function mapBlocksToSections(
  blocks: ExtractedBlock[],
  projectContext: Partial<StructuredProject>
): Promise<Record<string, ExtractedBlock[]>> {
  const sections: Record<string, ExtractedBlock[]> = {
    hero: [],
    about: [],
    features: [],
    location: [],
    gallery: [],
    pricing: [],
    payment: [],
    developer: [],
    other: [],
  };

  // Simple heuristic-based section mapping
  for (const block of blocks) {
    const content = (block.content || '').toLowerCase();
    
    if (content.includes('about') || content.includes('overview') || content.includes('introduction')) {
      sections.about.push(block);
    } else if (content.includes('feature') || content.includes('amenity') || content.includes('facility')) {
      sections.features.push(block);
    } else if (content.includes('location') || content.includes('map') || content.includes('nearby')) {
      sections.location.push(block);
    } else if (content.includes('price') || content.includes('unit') || content.includes('bedroom')) {
      sections.pricing.push(block);
    } else if (content.includes('payment') || content.includes('plan') || content.includes('schedule')) {
      sections.payment.push(block);
    } else if (content.includes('developer') || content.includes('about us') || content.includes('company')) {
      sections.developer.push(block);
    } else if (block.type === 'image') {
      sections.gallery.push(block);
    } else {
      sections.other.push(block);
    }
  }

  return sections;
}
