/**
 * Seed script for site content (stats, zones, case studies)
 * Run with: npx tsx server/seed-site-content.ts
 */

import { db } from "./db";
import { siteStats, investmentZones, caseStudies } from "@shared/schema";
import { randomUUID } from "crypto";

async function seed() {
  console.log("Seeding site content...");

  // Check if data already exists
  const existingStats = await db.select().from(siteStats);
  const existingZones = await db.select().from(investmentZones);
  const existingCases = await db.select().from(caseStudies);

  // Seed Stats
  if (existingStats.length === 0) {
    console.log("Seeding site stats...");
    await db.insert(siteStats).values([
      {
        id: randomUUID(),
        key: "projects",
        value: 50,
        suffix: "+",
        labelHe: "פרויקטים פעילים",
        labelEn: "Active Projects",
        color: "from-amber-500/20 border-amber-500/30",
        order: 0,
      },
      {
        id: randomUUID(),
        key: "investors",
        value: 200,
        suffix: "+",
        labelHe: "משקיעים מרוצים",
        labelEn: "Happy Investors",
        color: "from-blue-500/20 border-blue-500/30",
        order: 1,
      },
      {
        id: randomUUID(),
        key: "yield",
        value: 8,
        suffix: "%",
        labelHe: "תשואה ממוצעת",
        labelEn: "Average Yield",
        color: "from-emerald-500/20 border-emerald-500/30",
        order: 2,
      },
      {
        id: randomUUID(),
        key: "experience",
        value: 5,
        suffix: "+",
        labelHe: "שנות ניסיון",
        labelEn: "Years Experience",
        color: "from-purple-500/20 border-purple-500/30",
        order: 3,
      },
    ]);
    console.log("Stats seeded!");
  } else {
    console.log("Stats already exist, skipping...");
  }

  // Seed Investment Zones
  if (existingZones.length === 0) {
    console.log("Seeding investment zones...");
    await db.insert(investmentZones).values([
      {
        id: randomUUID(),
        name: "פאלם ג'ומיירה",
        nameEn: "Palm Jumeirah",
        avgRoi: 50, // 5.0%
        rentalYield: 45, // 4.5%
        appreciation: 7,
        demand: "premium",
        description: "האי המלאכותי המפורסם בעולם - סמל של יוקרה",
        descriptionEn: "The world-famous artificial island - a symbol of luxury",
        coordinates: [25.1124, 55.1390],
        order: 0,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "דובאי מרינה",
        nameEn: "Dubai Marina",
        avgRoi: 65, // 6.5%
        rentalYield: 62, // 6.2%
        appreciation: 10,
        demand: "high",
        description: "אזור יוקרתי עם מרינה מרהיבה וחיי לילה תוססים",
        descriptionEn: "Luxury area with stunning marina and vibrant nightlife",
        coordinates: [25.0805, 55.1403],
        order: 1,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "JVC",
        nameEn: "JVC",
        avgRoi: 95, // 9.5%
        rentalYield: 85, // 8.5%
        appreciation: 15,
        demand: "very-high",
        description: "אזור צומח במהירות עם תשואות גבוהות ומחירי כניסה נוחים",
        descriptionEn: "Fast-growing area with high yields and affordable entry prices",
        coordinates: [25.0550, 55.2094],
        order: 2,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "דאון טאון",
        nameEn: "Downtown",
        avgRoi: 55, // 5.5%
        rentalYield: 50, // 5.0%
        appreciation: 8,
        demand: "medium",
        description: "הלב הפועם של דובאי עם בורג' חליפה והמזרקה המפורסמת",
        descriptionEn: "The beating heart of Dubai with Burj Khalifa and the famous fountain",
        coordinates: [25.1972, 55.2744],
        order: 3,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "ביזנס ביי",
        nameEn: "Business Bay",
        avgRoi: 75, // 7.5%
        rentalYield: 68, // 6.8%
        appreciation: 12,
        demand: "high",
        description: "מרכז עסקים מוביל עם גישה מצוינת לכל חלקי העיר",
        descriptionEn: "Leading business center with excellent access to all parts of the city",
        coordinates: [25.1850, 55.2650],
        order: 4,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: "MBR סיטי",
        nameEn: "MBR City",
        avgRoi: 80, // 8.0%
        rentalYield: 70, // 7.0%
        appreciation: 14,
        demand: "high",
        description: "אזור חדש ומתפתח עם פרויקטים יוקרתיים",
        descriptionEn: "New developing area with luxury projects",
        coordinates: [25.1700, 55.3100],
        order: 5,
        isActive: true,
      },
    ]);
    console.log("Investment zones seeded!");
  } else {
    console.log("Investment zones already exist, skipping...");
  }

  // Seed Case Studies
  if (existingCases.length === 0) {
    console.log("Seeding case studies...");
    await db.insert(caseStudies).values([
      {
        id: randomUUID(),
        investmentAmount: 800000,
        currentValue: 1120000,
        roiPercent: 40,
        investmentYear: "2022",
        exitYear: "2024",
        location: "JVC",
        locationEn: "JVC",
        propertyType: "דירת 2 חדרים",
        propertyTypeEn: "2 Bedroom Apartment",
        testimonial: "התהליך היה מסודר ושקוף לחלוטין. קיבלתי ליווי צמוד מהרגע הראשון ועד קבלת המפתח.",
        testimonialEn: "The process was organized and completely transparent. I received close support from day one until key handover.",
        order: 0,
        isActive: true,
      },
      {
        id: randomUUID(),
        investmentAmount: 1500000,
        currentValue: 1950000,
        roiPercent: 30,
        investmentYear: "2021",
        exitYear: "2024",
        location: "ביזנס ביי",
        locationEn: "Business Bay",
        propertyType: "דירת 3 חדרים",
        propertyTypeEn: "3 Bedroom Apartment",
        testimonial: "השקעתי בפרויקט על הנייר וקיבלתי תשואה מעולה. ההמלצה הייתה מדויקת והתאימה בדיוק לצרכים שלי.",
        testimonialEn: "I invested in an off-plan project and received excellent returns. The recommendation was precise and perfectly matched my needs.",
        order: 1,
        isActive: true,
      },
      {
        id: randomUUID(),
        investmentAmount: 2200000,
        currentValue: 2860000,
        roiPercent: 30,
        investmentYear: "2020",
        exitYear: "2024",
        location: "דובאי מרינה",
        locationEn: "Dubai Marina",
        propertyType: "דירת 2 חדרים + שכירות",
        propertyTypeEn: "2 Bedroom Apartment + Rental",
        testimonial: "הנכס מניב לי הכנסה חודשית קבועה ובנוסף עלה בערכו משמעותית. השילוב המושלם.",
        testimonialEn: "The property provides me with steady monthly income and has also appreciated significantly in value. The perfect combination.",
        order: 2,
        isActive: true,
      },
    ]);
    console.log("Case studies seeded!");
  } else {
    console.log("Case studies already exist, skipping...");
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
