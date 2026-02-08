import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";
import { requireAuth } from "../auth";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });

const router = Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Check if AI is configured
 */
export function isAIConfigured(): boolean {
  return !!process.env.GOOGLE_API_KEY;
}

/**
 * Clean JSON response from Gemini
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

  return cleaned.trim();
}

/**
 * Check AI status
 * GET /api/ai/status
 */
router.get("/status", (req: Request, res: Response) => {
  res.json({
    configured: isAIConfigured(),
    provider: "google-gemini",
  });
});

/**
 * Generate project description
 * POST /api/ai/generate-description
 */
router.post("/generate-description", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { name, developer, location, propertyType, bedrooms, priceFrom, roiPercent } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: "Missing required fields: name, location" });
    }

    const prompt = `כתוב תיאור קצר ותכליתי לפרויקט נדל"ן בדובאי. התיאור מיועד למשקיעים ישראלים.

פרטים:
- שם: ${name}
- יזם: ${developer || "לא צוין"}
- מיקום: ${location}
- סוג: ${propertyType || "דירה"}
- חדרים: ${bedrooms || "מגוון"}
${priceFrom ? `- מחיר התחלתי: ${priceFrom.toLocaleString()} AED` : ""}
${roiPercent ? `- תשואה: ${roiPercent}%` : ""}

דוגמאות לסגנון הנכון (כך נכתבים תיאורים אצלנו):
- "מרצדס-בנץ פלייסס בינגהאטי סיטי הוא פרויקט ענק בשווי 30 מיליארד דירהם, הכולל 12 מגדלים ו-13,386 יחידות דיור. הפרויקט משלב את העיצוב האייקוני של מרצדס-בנץ עם החזון הארכיטקטוני של בינגהאטי."
- "פרויקט The Symphony by Imtiaz בדובאי הוא מיזם יוקרתי עם עיצוב אדריכלי של Zaha Hadid, הכולל דירות 1–3 חדרים, פנטהאוזים, משרדים ושטחי מסחר באזור Meydan Horizon. הוא מציע נוף מרהיב, חנייה לכל יחידה ותמהיל שימושים מגורים‑עסקים בסטנדרט גבוה."

כללים:
- 2-3 משפטים בלבד. קצר, עניינ, כמו שבן אדם כותב.
- עובדות בלבד: מה הפרויקט, מי היזם, כמה יחידות/מגדלים, מה כולל, איפה.
- בלי סיסמאות שיווקיות ריקות, בלי "הזדמנות ייחודית", בלי פסקאות ארוכות.
- אם אין לך מידע - אל תמציא.

החזר JSON:
{
  "description": "התיאור בעברית",
  "descriptionEn": "Same content in English"
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = cleanJsonResponse(result.response.text());
    const data = JSON.parse(text);

    res.json(data);
  } catch (error) {
    console.error("AI generate description error:", error);
    res.status(500).json({
      error: "Failed to generate description",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Generate tagline
 * POST /api/ai/generate-tagline
 */
router.post("/generate-tagline", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { name, location, propertyType, highlights } = req.body;

    const prompt = `כתוב טאג-ליין (שורת משנה) לפרויקט נדל"ן בדובאי.
הטאג-ליין מופיע מתחת לשם הפרויקט בכרטיסייה ובעמוד הפרויקט.

פרטים:
- שם: ${name}
- מיקום: ${location}
- סוג: ${propertyType || "דירה"}
${highlights ? `- יתרונות בולטים: ${highlights}` : ""}

כללים:
- 4-8 מילים בלבד
- תמצת את הייחוד של הפרויקט - מה מבדיל אותו
- אם המיקום מרכזי - ציין. אם יש נוף - ציין. אם היזם ידוע - ציין.
- לא לכתוב דברים גנריים כמו "הזדמנות שלא תחזור" או "חיים ברמה אחרת"
- כן לכתוב דברים ספציפיים כמו "מגורי יוקרה על קו החוף" או "מגדל פרימיום ליד ברג' חליפה"

החזר JSON:
{
  "tagline": "הטאג-ליין בעברית",
  "taglineEn": "English tagline"
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const text = cleanJsonResponse(result.response.text());
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("AI generate tagline error:", error);
    res.status(500).json({ error: "Failed to generate tagline" });
  }
});

/**
 * Translate text Hebrew <-> English
 * POST /api/ai/translate
 */
router.post("/translate", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { text, direction } = req.body; // direction: "he-to-en" or "en-to-he"

    if (!text) {
      return res.status(400).json({ error: "Missing text to translate" });
    }

    const isHebrewToEnglish = direction === "he-to-en";

    const prompt = isHebrewToEnglish
      ? `תרגם את הטקסט הבא מעברית לאנגלית. שמור על סגנון שיווקי מקצועי לנדל"ן:

"${text}"

החזר JSON:
{ "translation": "the English translation" }`
      : `Translate the following text from English to Hebrew. Keep a professional real estate marketing style:

"${text}"

Return JSON:
{ "translation": "התרגום לעברית" }`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const resultText = cleanJsonResponse(result.response.text());
    res.json(JSON.parse(resultText));
  } catch (error) {
    console.error("AI translate error:", error);
    res.status(500).json({ error: "Failed to translate" });
  }
});

/**
 * Generate SEO metadata
 * POST /api/ai/generate-seo
 */
router.post("/generate-seo", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { name, location, developer, priceFrom, propertyType } = req.body;

    const prompt = `צור מטא-דאטה SEO לעמוד פרויקט נדל"ן בדובאי. הקהל: משקיעים ישראלים שמחפשים בגוגל.

פרויקט: ${name}
מיקום: ${location}
יזם: ${developer || ""}
${priceFrom ? `מחיר התחלתי: ${priceFrom.toLocaleString()} AED` : ""}
סוג: ${propertyType || "דירה"}

כללים:
- title: עד 60 תווים. מבנה: "שם הפרויקט | סוג + מיקום | DDL". דוגמה: "Creek Views | דירות יוקרה בדובאי קריק | DDL"
- description: עד 155 תווים. כולל: מה הפרויקט, מחיר התחלתי (אם יש), תשואה, וקריאה לפעולה.
- keywords: 6-8 מילות מפתח רלוונטיות בעברית. כולל: שם הפרויקט, סוג+מיקום, "השקעה בדובאי", "נדלן בדובאי", שם היזם.

החזר JSON:
{
  "title": "כותרת SEO בעברית",
  "description": "תיאור מטא בעברית",
  "keywords": ["מילה 1", "מילה 2", ...]
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const text = cleanJsonResponse(result.response.text());
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("AI generate SEO error:", error);
    res.status(500).json({ error: "Failed to generate SEO" });
  }
});

/**
 * Suggest amenities based on project type
 * POST /api/ai/suggest-amenities
 */
router.post("/suggest-amenities", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { propertyType, priceRange, location } = req.body;

    const prompt = `הצע רשימת מתקנים (amenities) ריאלית לפרויקט נדל"ן בדובאי.

סוג נכס: ${propertyType || "דירה"}
רמת מחיר: ${priceRange || "יוקרה"}
מיקום: ${location || "דובאי"}

הנחיות:
- 10-15 מתקנים שבאמת נמצאים בפרויקטים מהסוג הזה בדובאי
- אל תצע מתקנים לא ריאליים (כמו "חוף פרטי" לפרויקט פנים-עירוני)
- מתקנים טיפוסיים: בריכת שחייה, חדר כושר, לובי מפואר, חניון תת-קרקעי, גינת ילדים, BBQ, concierge, spa, sauna, jogging track, business center, cinema room, paddle court
- התאם לרמת הפרויקט: budget/mid/premium/ultra-luxury

קטגוריות: wellness, leisure, kids, outdoor, smart, convenience, security

החזר JSON:
{
  "amenities": [
    { "name": "Swimming Pool", "nameHe": "בריכת שחייה", "category": "leisure" },
    ...
  ]
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const text = cleanJsonResponse(result.response.text());
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("AI suggest amenities error:", error);
    res.status(500).json({ error: "Failed to suggest amenities" });
  }
});

/**
 * Generate payment plan description
 * POST /api/ai/generate-payment-plan
 */
router.post("/generate-payment-plan", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { developer, projectName, priceFrom } = req.body;

    const prompt = `הצע תכנית תשלום ריאלית לפרויקט נדל"ן off-plan בדובאי.

פרויקט: ${projectName || "פרויקט"}
יזם: ${developer || "לא צוין"}
${priceFrom ? `מחיר התחלתי: ${priceFrom.toLocaleString()} AED` : ""}

הנחיות:
- תכניות תשלום טיפוסיות בדובאי: 10-20% מקדמה, 30-50% בבנייה (תשלומים חודשיים/רבעוניים), 30-50% במסירה
- אם היזם ידוע (Emaar, DAMAC, Sobha, Nakheel וכו') - התבסס על תכניות אמיתיות של אותו יזם
- הסכום חייב להסתכם ל-100%
- אל תמציא תכניות לא ריאליות

החזר JSON:
{
  "planText": "תיאור קצר בעברית, למשל: 20% מקדמה, 50% במהלך הבנייה, 30% במסירה",
  "plan": {
    "downPayment": 20,
    "duringConstruction": 50,
    "onHandover": 30
  }
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const text = cleanJsonResponse(result.response.text());
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("AI generate payment plan error:", error);
    res.status(500).json({ error: "Failed to generate payment plan" });
  }
});

/**
 * Extract project data from brochure PDF
 * POST /api/ai/extract-from-brochure
 */
router.post("/extract-from-brochure", requireAuth, upload.single("brochure"), async (req: Request, res: Response) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    if (mimeType !== "application/pdf" && !mimeType.startsWith("image/")) {
      return res.status(400).json({ error: "Only PDF and image files are supported" });
    }

    const base64Data = fileBuffer.toString("base64");

    const prompt = `אתה מנתח ברושורים של פרויקטי נדל"ן בדובאי. קרא את הברושור הזה וחלץ את כל המידע שאתה מוצא.

חלץ את הנתונים הבאים (אם קיימים בברושור):

החזר JSON בלבד עם השדות הבאים. אם שדה לא קיים בברושור - השאר null.

{
  "name": "שם הפרויקט באנגלית כפי שמופיע בברושור",
  "nameEn": "שם הפרויקט באנגלית",
  "developer": "שם היזם/קבלן",
  "location": "מיקום בעברית (למשל: דובאי מרינה, ביזנס ביי)",
  "locationEn": "Location in English",
  "propertyType": "apartment / villa / townhouse / penthouse",
  "buildingType": "tower / villa-compound / mixed-use",
  "bedrooms": "טווח חדרים, למשל: 1-3 / Studio-3BR",
  "priceFrom": 0,
  "priceCurrency": "AED",
  "roiPercent": 0,
  "completionDate": "Q4 2027 או תאריך משוער",
  "projectStatus": "off-plan / under-construction / ready-to-move",
  "ownership": "freehold / leasehold",
  "furnishing": "furnished / semi-furnished / unfurnished",
  "numberOfBuildings": 0,
  "description": "תיאור קצר של הפרויקט בעברית, 2-3 משפטים תכליתיים. עובדות בלבד.",
  "descriptionEn": "Same description in English, 2-3 sentences.",
  "tagline": "טאג-ליין קצר בעברית, 4-8 מילים",
  "taglineEn": "Short tagline in English",
  "paymentPlan": {
    "downPayment": 0,
    "duringConstruction": 0,
    "onHandover": 0
  },
  "units": [
    { "type": "Studio", "typeHe": "סטודיו", "sizeFrom": 0, "sizeTo": 0, "priceFrom": 0, "priceTo": 0 }
  ],
  "amenities": ["Swimming Pool", "Gym", "..."],
  "highlights": [
    { "title": "Total Units", "titleHe": "סה\"כ יחידות", "value": "500" },
    { "title": "Floors", "titleHe": "קומות", "value": "40" }
  ],
  "specs": {
    "totalFloors": 0,
    "totalUnits": 0,
    "totalParkingSpaces": 0,
    "architecturalStyle": ""
  },
  "serviceCharge": "15 AED/sqft",
  "reraNumber": "",
  "dldNumber": ""
}

כללים:
- חלץ רק מידע שקיים בברושור. אל תמציא נתונים.
- מחירים תמיד במספרים (בלי פסיקים, בלי מטבע בשדה המספר).
- שדות שלא מופיעים = null.
- תיאור בעברית: קצר ועניני, 2-3 משפטים, עובדות בלבד.
- amenities: רשימה פשוטה של שמות באנגלית.`;

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt },
        ],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = cleanJsonResponse(result.response.text());
    const data = JSON.parse(text);

    res.json(data);
  } catch (error) {
    console.error("AI extract from brochure error:", error);
    res.status(500).json({
      error: "Failed to extract data from brochure",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
