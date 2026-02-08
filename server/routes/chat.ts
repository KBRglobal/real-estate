import { Router, Request, Response } from "express";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, convertToModelMessages, pipeUIMessageStreamToResponse, type UIMessage } from "ai";
import { storage } from "../storage";
import type { Project } from "@shared/schema";

const router = Router();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

// Cache project context - refresh every 5 minutes
let projectContextCache = "";
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function getProjectContext(): Promise<string> {
  const now = Date.now();
  if (projectContextCache && now - cacheTimestamp < CACHE_TTL) {
    return projectContextCache;
  }

  try {
    const allProjects = await storage.getAllProjects();
    const activeProjects = allProjects.filter((p: Project) => p.status === "active");

    if (activeProjects.length === 0) {
      projectContextCache = "אין פרויקטים פעילים כרגע.";
      cacheTimestamp = now;
      return projectContextCache;
    }

    const projectSummaries = activeProjects.map((p: Project) => {
      const parts: string[] = [];
      parts.push(`שם: ${p.name}`);
      if (p.developer) parts.push(`יזם: ${p.developer}`);
      if (p.location) parts.push(`מיקום: ${p.location}`);
      if (p.priceFrom) parts.push(`מחיר מ: ${p.priceFrom.toLocaleString()} ${p.priceCurrency || "AED"}`);
      if (p.roiPercent) parts.push(`תשואה: ${p.roiPercent}%`);
      if (p.propertyType) parts.push(`סוג: ${p.propertyType}`);
      if (p.bedrooms) parts.push(`חדרים: ${p.bedrooms}`);
      if (p.completionDate) parts.push(`מסירה: ${p.completionDate}`);
      if (p.ownership) parts.push(`בעלות: ${p.ownership}`);
      if (p.projectStatus) parts.push(`סטטוס: ${p.projectStatus}`);
      if (p.tagline) parts.push(`תיאור קצר: ${p.tagline}`);

      // Payment plan summary
      const paymentPlan = p.paymentPlan as { downPayment?: number; duringConstruction?: number; onHandover?: number } | null;
      if (paymentPlan) {
        const pp = [];
        if (paymentPlan.downPayment) pp.push(`${paymentPlan.downPayment}% מקדמה`);
        if (paymentPlan.duringConstruction) pp.push(`${paymentPlan.duringConstruction}% בבנייה`);
        if (paymentPlan.onHandover) pp.push(`${paymentPlan.onHandover}% במסירה`);
        if (pp.length) parts.push(`תכנית תשלום: ${pp.join(", ")}`);
      }

      // Units summary
      const units = p.units as Array<{ type?: string; typeHe?: string; priceFrom?: number; priceTo?: number }> | null;
      if (units && Array.isArray(units) && units.length > 0) {
        const unitTypes = units.map(u => u.typeHe || u.type).filter(Boolean).join(", ");
        if (unitTypes) parts.push(`סוגי יחידות: ${unitTypes}`);
      }

      // Highlights
      const highlights = p.highlights as Array<{ title?: string; titleHe?: string; value?: string }> | null;
      if (highlights && Array.isArray(highlights) && highlights.length > 0) {
        const highlightTexts = highlights.map(h => `${h.titleHe || h.title}: ${h.value}`).filter(h => h.includes(":")).slice(0, 5);
        if (highlightTexts.length) parts.push(`נקודות חשובות: ${highlightTexts.join("; ")}`);
      }

      if (p.slug) parts.push(`קישור: /project/${p.slug}`);

      return parts.join(" | ");
    });

    projectContextCache = projectSummaries.join("\n\n");
    cacheTimestamp = now;
    return projectContextCache;
  } catch (error) {
    console.error("[Chat] Failed to load projects:", error);
    return "לא ניתן לטעון מידע על פרויקטים כרגע.";
  }
}

function buildSystemPrompt(projectData: string): string {
  return `אתה באנדי, יועץ השקעות נדל"ן בדובאי של חברת DDL (Dubai Dream Living).
השם שלך הוא באנדי. אתה מדבר בעברית בלבד, בטון מקצועי אך חם וידידותי.

הידע הכללי שלך:
- DDL היא סוכנות נדל"ן מורשית (RERA) בדובאי, מתמחה בליווי משקיעים ישראלים
- דובאי: 0% מס הכנסה, 0% מס רווחי הון, 100% בעלות זרה
- תשואות שכירות ממוצעות: 6-12% בשנה
- תכניות תשלום גמישות מהיזמים
- DDL מלווה מקצה לקצה: בחירת נכס, משא ומתן, חוזים, ניהול הנכס

הפרויקטים שלנו כרגע:
${projectData}

כללים חשובים:
1. תענה תמיד בעברית בלבד, גם אם אתה חושב באנגלית - הפלט חייב להיות עברית
2. תענה בקצרה, טבעי ואנושי - 2-4 משפטים מקסימום, כמו שיחה רגילה
3. אל תציג חשיבה פנימית, הערות מטא, או תהליך מחשבה - רק את התשובה עצמה
4. כשמישהו שואל על פרויקט ספציפי - תן את המידע שיש לך עליו (מחיר, מיקום, תשואה, תכנית תשלום)
5. כשמישהו שואל "מה יש לכם" או "אילו פרויקטים" - תן סקירה קצרה של הפרויקטים הפעילים
6. אם יש לך קישור לפרויקט - שתף אותו כדי שהלקוח יוכל לראות פרטים מלאים
7. אם הלקוח מתעניין ברצינות - בקש שם, טלפון ואימייל כדי שהצוות יחזור אליו
8. אל תיתן ייעוץ משפטי או פיננסי - המלץ להתייעץ עם מומחים
9. אם שואלים על מיסוי ישראלי - ציין שיש לבדוק עם רו"ח, אבל הדגש שבדובאי אין מס
10. אל תמציא מידע שלא קיים בנתונים שקיבלת
11. אם הלקוח שואל שאלה כללית על דובאי (כמו מרחקים, מזג אוויר, חיים) - ענה בטבעיות מהידע הכללי שלך
12. אם הלקוח פונה באנגלית - ענה באנגלית

היה מקצועי וטבעי, ללא אימוג'ים מיותרים.`;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages: UIMessage[] };

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    if (!process.env.GOOGLE_API_KEY) {
      res.status(503).json({ error: "AI not configured" });
      return;
    }

    const projectData = await getProjectContext();
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: buildSystemPrompt(projectData),
      messages: modelMessages,
      providerOptions: {
        google: { thinkingConfig: { thinkingBudget: 0 } },
      },
    });

    pipeUIMessageStreamToResponse({
      stream: result.toUIMessageStream(),
      response: res,
    });
  } catch (error) {
    console.error("[Chat] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
