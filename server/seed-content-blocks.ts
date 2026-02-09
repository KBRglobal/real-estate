/**
 * Seed script for populating content_blocks table with initial homepage content
 * Run with: npx tsx server/seed-content-blocks.ts
 */

import { db } from "./db";
import { contentBlocks, settings } from "@shared/schema";
import { randomUUID } from "crypto";

// Content blocks seed data - extracted from i18n translations
const contentBlocksSeed = [
  // Hero Section
  { section: "hero", blockKey: "title1", value: "השקעות נדל״ן בדובאי", valueEn: "Real Estate Investment in Dubai" },
  { section: "hero", blockKey: "title2", value: "גישה ישירה לפרויקטים", valueEn: "Direct Access to Projects" },
  { section: "hero", blockKey: "title3", value: "ליווי מקצה לקצה", valueEn: "End-to-End Support" },
  { section: "hero", blockKey: "subtitle1", value: "פשוט. שקוף. מסודר.", valueEn: "Simple. Transparent. Organized." },
  { section: "hero", blockKey: "subtitle2", value: "סוכן מקומי מורשה בדובאי", valueEn: "Licensed Local Agent in Dubai" },
  { section: "hero", blockKey: "subtitle3", value: "מהשלב הראשון ועד קבלת המפתח", valueEn: "From First Step to Key Handover" },
  { section: "hero", blockKey: "tagline", value: "ליווי משקיעים להשקעות נדל״ן בדובאי בצורה פשוטה, שקופה ומסודרת", valueEn: "Guiding investors through Dubai real estate investments in a simple, transparent, and organized manner" },
  { section: "hero", blockKey: "cta", value: "התחל השקעה", valueEn: "Start Investing" },
  { section: "hero", blockKey: "calculator", value: "מחשבון ROI", valueEn: "ROI Calculator" },
  { section: "hero", blockKey: "stat_tax_value", value: "0%", valueEn: "0%" },
  { section: "hero", blockKey: "stat_tax_label", value: "מס הכנסה", valueEn: "Income Tax" },
  { section: "hero", blockKey: "stat_yield_value", value: "8-12%", valueEn: "8-12%" },
  { section: "hero", blockKey: "stat_yield_label", value: "תשואה ממוצעת", valueEn: "Average Yield" },
  { section: "hero", blockKey: "stat_ownership_value", value: "100%", valueEn: "100%" },
  { section: "hero", blockKey: "stat_ownership_label", value: "בעלות מלאה", valueEn: "Full Ownership" },
  { section: "hero", blockKey: "stat_support_value", value: "24/7", valueEn: "24/7" },
  { section: "hero", blockKey: "stat_support_label", value: "תמיכה וליווי", valueEn: "Support 24/7" },
  { section: "hero", blockKey: "trust_licensed", value: "מורשה RERA", valueEn: "RERA Licensed" },
  { section: "hero", blockKey: "trust_verified", value: "מאומת", valueEn: "Verified" },

  // About Section
  { section: "about", blockKey: "title", value: "מי אנחנו", valueEn: "Who We Are" },
  { section: "about", blockKey: "subtitle", value: "PropLine - הדרך שלך להשקעה חכמה בדובאי", valueEn: "PropLine - Your Path to Smart Investment in Dubai" },
  { section: "about", blockKey: "description", value: "PropLine היא חברת ליווי להשקעות נדל״ן בדובאי. אנחנו מתמחים בליווי משקיעים פרטיים בהשקעות נדל״ן בדובאי – מהשלב הראשון ועד לאחר סגירת העסקה.", valueEn: "PropLine is a real estate investment guidance company in Dubai. We specialize in guiding private investors in Dubai real estate investments – from the first step to after closing the deal." },
  { section: "about", blockKey: "license", value: "סוכן מקומי מורשה - רישיון 55545", valueEn: "Licensed Local Agent - License 55545" },
  { section: "about", blockKey: "card1_title", value: "סוכן מקומי בדובאי", valueEn: "Local Agent in Dubai" },
  { section: "about", blockKey: "card1_desc", value: "החברה פועלת מדובאי, הצוות נמצא בדובאי, והעבודה מתבצעת מתוך השוק עצמו", valueEn: "The company operates from Dubai, the team is in Dubai, and the work is done from within the market itself" },
  { section: "about", blockKey: "card2_title", value: "ליווי אישי", valueEn: "Personal Guidance" },
  { section: "about", blockKey: "card2_desc", value: "כל משקיע מקבל יחס אישי ומותאם לצרכים ולמטרות שלו", valueEn: "Every investor receives personalized attention tailored to their needs and goals" },
  { section: "about", blockKey: "card3_title", value: "שקיפות מלאה", valueEn: "Full Transparency" },
  { section: "about", blockKey: "card3_desc", value: "מציגים את התמונה המלאה - לא רק את ההזדמנות, גם את הסיכון", valueEn: "We present the full picture - not just the opportunity, but also the risk" },
  { section: "about", blockKey: "card4_title", value: "זמינות 24/7", valueEn: "24/7 Availability" },
  { section: "about", blockKey: "card4_desc", value: "תמיכה רציפה בכל שלב של התהליך, מתחילתו ועד סופו", valueEn: "Continuous support at every stage of the process, from start to finish" },

  // Why PropLine Section
  { section: "whyPropline", blockKey: "title", value: "מה מייחד אותנו?", valueEn: "What Makes Us Different?" },
  { section: "whyPropline", blockKey: "subtitle", value: "פשטות. שקיפות. ליווי אישי.", valueEn: "Simplicity. Transparency. Personal Support." },
  { section: "whyPropline", blockKey: "reason1_title", value: "סוכן מקומי בדובאי", valueEn: "Local Agent in Dubai" },
  { section: "whyPropline", blockKey: "reason1_desc", value: "אנחנו חיים ופועלים מדובאי - לא שליחים מרחוק. גישה אמיתית לפרויקטים ועבודה ישירה מול קבלנים.", valueEn: "We live and operate from Dubai - not remote agents. Real access to projects and direct work with developers." },
  { section: "whyPropline", blockKey: "reason2_title", value: "תהליך שקוף ומסודר", valueEn: "Transparent & Organized Process" },
  { section: "whyPropline", blockKey: "reason2_desc", value: "5 שלבים ברורים ללא הפתעות. אנחנו מציגים את התמונה המלאה - יתרונות לצד סיכונים.", valueEn: "5 clear steps with no surprises. We present the full picture - benefits alongside risks." },
  { section: "whyPropline", blockKey: "reason3_title", value: "ללא עמלות נסתרות", valueEn: "No Hidden Fees" },
  { section: "whyPropline", blockKey: "reason3_desc", value: "עמלות גלויות מראש. מה שסוכם - זה מה שקורה. בלי תוספות ובלי אותיות קטנות.", valueEn: "Transparent fees upfront. What's agreed is what happens. No extras and no fine print." },
  { section: "whyPropline", blockKey: "reason4_title", value: "ליווי אישי צמוד", valueEn: "Personal Support" },
  { section: "whyPropline", blockKey: "reason4_desc", value: "כל משקיע מקבל מנהל לקוח אישי שילווה אותו מהשלב הראשון ועד לאחר סגירת העסקה.", valueEn: "Every investor gets a personal account manager who guides them from the first step to beyond closing." },
  { section: "whyPropline", blockKey: "reason5_title", value: "זמינות 24/7", valueEn: "Available 24/7" },
  { section: "whyPropline", blockKey: "reason5_desc", value: "תמיד זמינים לשאלות ולעדכונים. הפרשי השעות לא מעכבים אותנו.", valueEn: "Always available for questions and updates. Time differences don't slow us down." },
  { section: "whyPropline", blockKey: "reason6_title", value: "ביטחון בעסקה", valueEn: "Transaction Security" },
  { section: "whyPropline", blockKey: "reason6_desc", value: "עובדים רק עם קבלנים מאושרים וליווי משפטי מלא בכל שלב.", valueEn: "We work only with approved developers and provide full legal support at every step." },
  { section: "whyPropline", blockKey: "quote", value: "המטרה שלנו אינה למכור נכס, אלא לבנות עסקה נכונה לטווח הנכון", valueEn: "Our goal is not to sell a property, but to build the right deal for the right timeline" },

  // Why Dubai Section
  { section: "whyDubai", blockKey: "title", value: "למה להשקיע בדובאי?", valueEn: "Why Invest in Dubai?" },
  { section: "whyDubai", blockKey: "subtitle", value: "הזדמנות השקעה ייחודית", valueEn: "A Unique Investment Opportunity" },
  { section: "whyDubai", blockKey: "description", value: "דובאי הפכה למוקד השקעות עולמי. מעיר אזורית – למרכז עולמי לעסקים, הון ואוכלוסייה", valueEn: "Dubai has become a global investment hub. From a regional city – to a global center for business, capital, and population" },
  { section: "whyDubai", blockKey: "advantage1", value: "0% מס על רווחי הון והכנסות משכירות", valueEn: "0% tax on capital gains and rental income" },
  { section: "whyDubai", blockKey: "advantage2", value: "תשואה ממוצעת של 8-12% על השכרת נכסים", valueEn: "Average yield of 8-12% on property rentals" },
  { section: "whyDubai", blockKey: "advantage3", value: "שוק נדל״ן יציב עם עלייה קבועה בערכי הנכסים", valueEn: "Stable real estate market with consistent property value appreciation" },
  { section: "whyDubai", blockKey: "advantage4", value: "בעלות מלאה לזרים באזורי Freehold", valueEn: "Full ownership for foreigners in Freehold areas" },
  { section: "whyDubai", blockKey: "advantage5", value: "תשתיות מתקדמות ורמת חיים גבוהה", valueEn: "Advanced infrastructure and high standard of living" },
  { section: "whyDubai", blockKey: "advantage6", value: "חזון 2040 - תוכנית פיתוח אורבנית שאפתנית", valueEn: "Vision 2040 - Ambitious urban development plan" },
  { section: "whyDubai", blockKey: "advantage7", value: "מערכת משפטית יציבה ובטוחה למשקיעים", valueEn: "Stable and secure legal system for investors" },
  { section: "whyDubai", blockKey: "advantage8", value: "נגישות בינלאומית עם נמל התעופה העמוס בעולם", valueEn: "International accessibility with the world's busiest airport" },
  { section: "whyDubai", blockKey: "advantage9", value: "אוכלוסייה צומחת ובוגרת", valueEn: "Growing and mature population" },
  { section: "whyDubai", blockKey: "advantage10", value: "תיירות פורחת שמניעה את שוק השכירות", valueEn: "Thriving tourism that drives the rental market" },

  // Process Timeline Section
  { section: "process", blockKey: "title", value: "10 שלבים להשקעה מוצלחת", valueEn: "10 Steps to Successful Investment" },
  { section: "process", blockKey: "subtitle", value: "תהליך מובנה ושקוף שמבטיח לכם שקט נפשי וביטחון בכל שלב", valueEn: "A structured and transparent process that ensures peace of mind and confidence at every step" },
  { section: "process", blockKey: "step1_title", value: "ייעוץ ראשוני", valueEn: "Initial Consultation" },
  { section: "process", blockKey: "step1_desc", value: "שיחת היכרות להבנת הצרכים והיעדים שלך", valueEn: "Introductory call to understand your needs and goals" },
  { section: "process", blockKey: "step2_title", value: "הגדרת מטרות", valueEn: "Define Goals" },
  { section: "process", blockKey: "step2_desc", value: "תקציב, תשואה רצויה וטווח השקעה", valueEn: "Budget, desired return and investment timeline" },
  { section: "process", blockKey: "step3_title", value: "בחירת נכס", valueEn: "Property Selection" },
  { section: "process", blockKey: "step3_desc", value: "התאמת פרויקטים לפי תקציב ומטרות השקעה", valueEn: "Matching projects based on budget and investment goals" },
  { section: "process", blockKey: "step4_title", value: "סיור בנכס", valueEn: "Property Tour" },
  { section: "process", blockKey: "step4_desc", value: "ביקור במיקום וצפייה בדירות לדוגמה", valueEn: "Location visit and viewing sample apartments" },
  { section: "process", blockKey: "step5_title", value: "הזמנת יחידה", valueEn: "Unit Reservation" },
  { section: "process", blockKey: "step5_desc", value: "חתימה על הסכם וביצוע תשלום ראשון", valueEn: "Signing agreement and making initial payment" },
  { section: "process", blockKey: "step6_title", value: "חתימה חוזה", valueEn: "Contract Signing" },
  { section: "process", blockKey: "step6_desc", value: "חתימה על חוזה מכר רשמי עם הקבלן", valueEn: "Signing official sales contract with developer" },
  { section: "process", blockKey: "step7_title", value: "מעקב בנייה", valueEn: "Construction Tracking" },
  { section: "process", blockKey: "step7_desc", value: "עדכונים שוטפים על התקדמות הפרויקט", valueEn: "Regular updates on project progress" },
  { section: "process", blockKey: "step8_title", value: "קבלת מפתח", valueEn: "Key Handover" },
  { section: "process", blockKey: "step8_desc", value: "מסירת הנכס וליווי בהשכרה או מכירה", valueEn: "Property delivery and support for rental or sale" },

  // Footer Section
  { section: "footer", blockKey: "tagline", value: "ליווי משקיעים להשקעות נדל״ן בדובאי בצורה פשוטה, שקופה ומסודרת.", valueEn: "Guiding investors through Dubai real estate investments in a simple, transparent, and organized manner." },
  { section: "footer", blockKey: "license", value: "סוכן מקומי מורשה - רישיון 55545", valueEn: "Licensed Local Agent - License 55545" },
  { section: "footer", blockKey: "copyright", value: "כל הזכויות שמורות.", valueEn: "All Rights Reserved." },
  { section: "footer", blockKey: "quickLinks", value: "ניווט מהיר", valueEn: "Quick Links" },
  { section: "footer", blockKey: "contactUs", value: "יצירת קשר", valueEn: "Contact Us" },
  { section: "footer", blockKey: "followUs", value: "עקבו אחרינו", valueEn: "Follow Us" },
  { section: "footer", blockKey: "location", value: "דובאי, איחוד האמירויות הערביות", valueEn: "Dubai, United Arab Emirates" },
  { section: "footer", blockKey: "terms", value: "תנאי שימוש", valueEn: "Terms of Use" },
  { section: "footer", blockKey: "privacy", value: "מדיניות פרטיות", valueEn: "Privacy Policy" },
  { section: "footer", blockKey: "disclaimer", value: "כתב ויתור", valueEn: "Investment Disclaimer" },

  // Navigation
  { section: "nav", blockKey: "home", value: "דף הבית", valueEn: "Home" },
  { section: "nav", blockKey: "projects", value: "פרויקטים", valueEn: "Projects" },
  { section: "nav", blockKey: "process", value: "תהליך ההשקעה", valueEn: "Investment Process" },
  { section: "nav", blockKey: "whyDubai", value: "למה דובאי", valueEn: "Why Dubai" },
  { section: "nav", blockKey: "contact", value: "צור קשר", valueEn: "Contact" },
  { section: "nav", blockKey: "freeConsultation", value: "דברו איתנו", valueEn: "Talk to Us" },
];

// Site settings seed data
const settingsSeed = [
  // General
  { key: "site_name", value: "PropLine Real Estate", category: "general" },
  { key: "site_name_he", value: "PropLine נדל״ן דובאי", category: "general" },
  { key: "site_description", value: "Your gateway to Dubai real estate investments", category: "general" },
  { key: "site_description_he", value: "הדרך שלך להשקעות נדל״ן בדובאי", category: "general" },
  { key: "default_language", value: "he", category: "general" },
  { key: "company_name", value: "PropLine Real Estate Ltd.", category: "general" },
  { key: "license_number", value: "55545", category: "general" },

  // Contact
  { key: "phone", value: "+972508896702", category: "contact" },
  { key: "phone_display", value: "050-889-6702", category: "contact" },
  { key: "whatsapp", value: "972508896702", category: "contact" },
  { key: "email", value: "info@propline.com", category: "contact" },
  { key: "email_sales", value: "sales@propline.com", category: "contact" },
  { key: "address", value: "Dubai, UAE", category: "contact" },
  { key: "address_he", value: "דובאי, איחוד האמירויות הערביות", category: "contact" },
  { key: "working_hours", value: "24/7", category: "contact" },

  // Social
  { key: "facebook_url", value: "https://www.facebook.com/share/1EpVjGVWkJ/", category: "social" },
  { key: "instagram_url", value: "https://www.instagram.com/proplinerealestate", category: "social" },
  { key: "linkedin_url", value: "", category: "social" },
  { key: "twitter_url", value: "", category: "social" },
  { key: "youtube_url", value: "", category: "social" },
  { key: "tiktok_url", value: "", category: "social" },

  // SEO
  { key: "meta_title", value: "PropLine - Dubai Real Estate Investments", category: "seo" },
  { key: "meta_title_he", value: "PropLine - השקעות נדל״ן בדובאי", category: "seo" },
  { key: "meta_description", value: "Your gateway to Dubai real estate investments. Simple. Transparent. Organized.", category: "seo" },
  { key: "meta_description_he", value: "הדרך שלך להשקעות נדל״ן בדובאי. פשוט. שקוף. מסודר.", category: "seo" },
  { key: "meta_keywords", value: "dubai, real estate, investment, property, freehold, roi", category: "seo" },

  // Branding
  { key: "primary_color", value: "#2563EB", category: "branding" },
  { key: "secondary_color", value: "#1a1a2e", category: "branding" },
  { key: "accent_color", value: "#FFD700", category: "branding" },
];

async function seedContentBlocks() {
  console.log("Seeding content blocks...");

  for (const block of contentBlocksSeed) {
    try {
      const id = randomUUID();
      await db.insert(contentBlocks).values({
        id,
        section: block.section,
        blockKey: block.blockKey,
        value: block.value,
        valueEn: block.valueEn,
        contentType: "text",
        isActive: true,
        order: 0,
      }).onConflictDoNothing();
      console.log(`  Added: ${block.section}.${block.blockKey}`);
    } catch (error) {
      console.error(`  Error adding ${block.section}.${block.blockKey}:`, error);
    }
  }

  console.log(`Seeded ${contentBlocksSeed.length} content blocks.`);
}

async function seedSettings() {
  console.log("Seeding site settings...");

  for (const setting of settingsSeed) {
    try {
      const id = randomUUID();
      await db.insert(settings).values({
        id,
        key: setting.key,
        value: setting.value,
        category: setting.category,
      }).onConflictDoNothing();
      console.log(`  Added: ${setting.key}`);
    } catch (error) {
      console.error(`  Error adding ${setting.key}:`, error);
    }
  }

  console.log(`Seeded ${settingsSeed.length} settings.`);
}

async function main() {
  console.log("Starting seed process...\n");

  await seedContentBlocks();
  console.log("");
  await seedSettings();

  console.log("\nSeed process completed!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
