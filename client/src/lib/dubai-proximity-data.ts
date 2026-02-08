// ============================================================================
// Dubai Proximity / Nearby Landmarks Data
// Hardcoded data for auto-filling proximity information on real estate projects.
// 75 Dubai areas with detailed nearby landmarks.
// NO AI, NO database, NO external API calls.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LandmarkCategory =
  | "mall"
  | "beach"
  | "airport"
  | "landmark"
  | "entertainment"
  | "business"
  | "transport"
  | "leisure"
  | "park";

/** Suggested icon name per category (lucide-react compatible) */
export const CATEGORY_ICONS: Record<LandmarkCategory, string> = {
  mall: "shopping-bag",
  beach: "waves",
  airport: "plane",
  landmark: "landmark",
  entertainment: "ferris-wheel",
  business: "briefcase",
  transport: "train",
  leisure: "trophy",
  park: "trees",
};

/** Hebrew label per category */
export const CATEGORY_LABELS_HE: Record<LandmarkCategory, string> = {
  mall: "קניון",
  beach: "חוף",
  airport: "שדה תעופה",
  landmark: "ציון דרך",
  entertainment: "בילוי",
  business: "עסקים",
  transport: "תחבורה",
  leisure: "פנאי",
  park: "פארק",
};

export const CATEGORY_LABELS_EN: Record<LandmarkCategory, string> = {
  mall: "Mall",
  beach: "Beach",
  airport: "Airport",
  landmark: "Landmark",
  entertainment: "Entertainment",
  business: "Business",
  transport: "Transport",
  leisure: "Leisure",
  park: "Park",
};

export interface ProximityLandmark {
  /** English name of the landmark */
  name: string;
  /** Hebrew name of the landmark */
  nameHe: string;
  /** Approximate distance in kilometres (null when walking-only / on-site) */
  distance: number | null;
  /** Human-readable drive / walk time, e.g. "5 min", "walking" */
  driveTime: string;
  /** Hebrew drive time label */
  driveTimeHe: string;
  /** Landmark category */
  category: LandmarkCategory;
}

export interface AreaProximity {
  /** English area / neighbourhood name (canonical key) */
  area: string;
  /** Hebrew area name */
  areaNameHe: string;
  /** Alternative English names used for fuzzy matching */
  aliases: string[];
  /** Nearby landmarks with distances */
  landmarks: ProximityLandmark[];
}

// ---------------------------------------------------------------------------
// Helper to build a landmark entry concisely
// ---------------------------------------------------------------------------

function lm(
  name: string,
  nameHe: string,
  category: LandmarkCategory,
  minutes: number,
): ProximityLandmark {
  const driveTime = minutes === 0 ? "Walking distance" : `${minutes} min`;
  const driveTimeHe = minutes === 0 ? "מרחק הליכה" : `${minutes} דקות`;
  const distance = minutes === 0 ? null : Math.round(minutes * 0.85);
  return { name, nameHe, distance, driveTime, driveTimeHe, category };
}

// ---------------------------------------------------------------------------
// Full proximity dataset — 75 Dubai areas
// ---------------------------------------------------------------------------

export const DUBAI_PROXIMITY_DATA: AreaProximity[] = [
  // 1. Downtown Dubai
  {
    area: "Downtown Dubai",
    areaNameHe: "דאונטאון דובאי",
    aliases: [
      "downtown dubai",
    ],
    landmarks: [
      lm("Burj Khalifa & Dubai Mall", "בורג׳ ח׳ליפה ודובאי מול", "landmark", 0),
      lm("DIFC Financial Centre", "DIFC — מרכז פיננסי", "business", 5),
      lm("Business Bay", "ביזנס ביי", "business", 5),
      lm("City Walk", "סיטי ווק", "landmark", 7),
      lm("Dubai Water Canal", "תעלת דובאי", "landmark", 5),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
      lm("Madinat Jumeirah / Burj Al Arab", "מדינת ג׳ומיירה / בורג׳ אל ערב", "landmark", 15),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 18),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 22),
      lm("Palm Jumeirah", "פאלם ג׳ומיירה", "landmark", 25),
    ],
  },

  // 2. Business Bay
  {
    area: "Business Bay",
    areaNameHe: "ביזנס ביי",
    aliases: [
      "business bay",
    ],
    landmarks: [
      lm("Downtown Dubai / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 5),
      lm("Burj Khalifa", "בורג׳ ח׳ליפה", "landmark", 5),
      lm("DIFC Financial Centre", "DIFC", "business", 7),
      lm("Dubai Water Canal", "תעלת דובאי", "landmark", 0),
      lm("City Walk", "סיטי ווק", "landmark", 8),
      lm("Dubai Creek", "דובאי קריק", "landmark", 10),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 18),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 22),
      lm("Dubai Hills Estate", "דובאי הילס", "landmark", 13),
    ],
  },

  // 3. DIFC
  {
    area: "DIFC",
    areaNameHe: "מרכז הפיננסי",
    aliases: [
      "difc",
    ],
    landmarks: [
      lm("Downtown Dubai / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 5),
      lm("Business Bay", "ביזנס ביי", "business", 7),
      lm("City Walk", "סיטי ווק", "landmark", 5),
      lm("Gate Avenue", "גייט אוונה", "business", 0),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 12),
      lm("Jumeirah Beach", "ג׳ומיירה ביץ׳", "beach", 12),
      lm("Burj Al Arab", "בורג׳ אל ערב", "landmark", 15),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 20),
    ],
  },

  // 4. Dubai Marina
  {
    area: "Dubai Marina",
    areaNameHe: "דובאי מרינה",
    aliases: [
      "dubai marina",
      "marina",
    ],
    landmarks: [
      lm("JBR Beach & The Walk", "JBR ביץ׳", "beach", 5),
      lm("Bluewaters Island (Ain Dubai)", "בלו ווטרס (עין דובאי)", "entertainment", 5),
      lm("Palm Jumeirah", "פאלם ג׳ומיירה", "landmark", 8),
      lm("Dubai Marina Mall", "דובאי מרינה מול", "mall", 0),
      lm("Jumeirah Lake Towers", "JLT", "business", 5),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 12),
      lm("Burj Al Arab", "בורג׳ אל ערב", "landmark", 12),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 30),
    ],
  },

  // 5. JBR
  {
    area: "JBR",
    areaNameHe: "ג׳ומיירה ביץ׳ רזידנס",
    aliases: [
      "jbr",
    ],
    landmarks: [
      lm("JBR Public Beach", "חוף JBR", "beach", 0),
      lm("The Walk JBR", "דה ווק", "entertainment", 0),
      lm("Bluewaters Island (Ain Dubai)", "בלו ווטרס (עין דובאי)", "entertainment", 5),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 5),
      lm("Palm Jumeirah", "פאלם ג׳ומיירה", "landmark", 8),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
    ],
  },

  // 6. Bluewaters Island
  {
    area: "Bluewaters Island",
    areaNameHe: "בלו ווטרס",
    aliases: [
      "bluewaters island",
    ],
    landmarks: [
      lm("Ain Dubai", "עין דובאי", "entertainment", 0),
      lm("JBR Beach", "JBR ביץ׳", "beach", 5),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 5),
      lm("Palm Jumeirah", "פאלם ג׳ומיירה", "landmark", 10),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
    ],
  },

  // 7. Palm Jumeirah
  {
    area: "Palm Jumeirah",
    areaNameHe: "פאלם ג׳ומיירה",
    aliases: [
      "palm jumeirah",
    ],
    landmarks: [
      lm("Atlantis The Palm & Aquaventure", "אטלנטיס", "entertainment", 5),
      lm("Nakheel Mall", "נח׳יל מול", "mall", 5),
      lm("Dubai Marina / JBR", "דובאי מרינה / JBR", "entertainment", 8),
      lm("Bluewaters Island (Ain Dubai)", "בלו ווטרס (עין דובאי)", "entertainment", 10),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
      lm("Burj Al Arab", "בורג׳ אל ערב", "landmark", 15),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 25),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 30),
    ],
  },

  // 8. JLT
  {
    area: "JLT",
    areaNameHe: "ג׳ומיירה לייק טאוורס",
    aliases: [
      "jlt",
    ],
    landmarks: [
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 5),
      lm("JBR Beach", "JBR ביץ׳", "beach", 7),
      lm("Palm Jumeirah", "פאלם ג׳ומיירה", "landmark", 10),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 12),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 10),
      lm("DMCC Metro Station", "תחנת מטרו DMCC", "transport", 3),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
    ],
  },

  // 9. Emaar Beachfront
  {
    area: "Emaar Beachfront",
    areaNameHe: "אמאר ביצ׳פרונט",
    aliases: [
      "emaar beachfront",
    ],
    landmarks: [
      lm("Private Beach", "חוף פרטי", "beach", 0),
      lm("Dubai Harbour", "דובאי הרבור", "landmark", 0),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 5),
      lm("JBR Beach", "JBR ביץ׳", "beach", 5),
      lm("Palm Jumeirah", "פאלם ג׳ומיירה", "landmark", 8),
      lm("Bluewaters Island (Ain Dubai)", "בלו ווטרס (עין דובאי)", "entertainment", 5),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
    ],
  },

  // 10. Dubai Hills Estate
  {
    area: "Dubai Hills Estate",
    areaNameHe: "דובאי הילס",
    aliases: [
      "dubai hills estate",
      "hills estate",
    ],
    landmarks: [
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 0),
      lm("18-Hole Championship Golf Course", "מגרש גולף 18 גומות", "leisure", 0),
      lm("Dubai Hills Park", "דובאי הילס פארק", "park", 0),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 17),
      lm("Burj Al Arab / Madinat Jumeirah", "בורג׳ אל ערב / מדינת ג׳ומיירה", "landmark", 15),
      lm("Business Bay / DIFC", "ביזנס ביי / DIFC", "business", 13),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 18),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 21),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 20),
    ],
  },

  // 11. MBR City
  {
    area: "MBR City",
    areaNameHe: "עיר מוחמד בן ראשד",
    aliases: [
      "mbr city",
    ],
    landmarks: [
      lm("Meydan Racecourse", "מיידאן רייסקורס", "entertainment", 5),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 12),
      lm("Business Bay", "ביזנס ביי", "business", 10),
      lm("DIFC Financial Centre", "DIFC", "business", 12),
      lm("Ras Al Khor Wildlife Sanctuary", "רס אל-ח׳ור שמורת טבע", "park", 10),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 18),
    ],
  },

  // 12. City Walk
  {
    area: "City Walk",
    areaNameHe: "סיטי ווק",
    aliases: [
      "city walk",
    ],
    landmarks: [
      lm("City Walk Retail & Dining", "סיטי ווק שופינג", "mall", 0),
      lm("Coca-Cola Arena", "קוקה קולה ארנה", "entertainment", 5),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 7),
      lm("DIFC Financial Centre", "DIFC", "business", 5),
      lm("Jumeirah Beach", "ג׳ומיירה ביץ׳", "beach", 10),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
      lm("Burj Al Arab", "בורג׳ אל ערב", "landmark", 15),
    ],
  },

  // 13. Jumeirah
  {
    area: "Jumeirah",
    areaNameHe: "ג׳ומיירה",
    aliases: [
      "jumeirah",
    ],
    landmarks: [
      lm("Jumeirah Beach (Kite Beach / La Mer)", "חוף ג׳ומיירה", "beach", 0),
      lm("Burj Al Arab", "בורג׳ אל ערב", "landmark", 5),
      lm("Madinat Jumeirah", "מדינת ג׳ומיירה", "landmark", 5),
      lm("Wild Wadi Waterpark", "ווילד וואדי", "entertainment", 5),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 15),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 15),
      lm("City Walk", "סיטי ווק", "landmark", 8),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 25),
    ],
  },

  // 14. Umm Suqeim
  {
    area: "Umm Suqeim",
    areaNameHe: "אום סוקיים",
    aliases: [
      "umm suqeim",
    ],
    landmarks: [
      lm("Burj Al Arab", "בורג׳ אל ערב", "landmark", 3),
      lm("Madinat Jumeirah", "מדינת ג׳ומיירה", "landmark", 3),
      lm("Wild Wadi Waterpark", "ווילד וואדי", "entertainment", 3),
      lm("Kite Beach", "קייט ביץ׳", "beach", 5),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 18),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 15),
      lm("Palm Jumeirah", "פאלם ג׳ומיירה", "landmark", 12),
    ],
  },

  // 15. Al Barsha
  {
    area: "Al Barsha",
    areaNameHe: "אל ברשא",
    aliases: [
      "al barsha",
      "barsha",
    ],
    landmarks: [
      lm("Mall of the Emirates (Ski Dubai)", "מול האמירויות (סקי דובאי)", "mall", 5),
      lm("Mall of the Emirates Metro", "תחנת מטרו MOE", "transport", 5),
      lm("Burj Al Arab", "בורג׳ אל ערב", "landmark", 10),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 12),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 18),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 12),
      lm("Dubai Hills Estate", "דובאי הילס", "landmark", 12),
    ],
  },

  // 16. Al Sufouh
  {
    area: "Al Sufouh",
    areaNameHe: "אל סופוח",
    aliases: [
      "al sufouh",
      "sufouh",
    ],
    landmarks: [
      lm("Al Sufouh Beach", "חוף אל-סופוח", "beach", 3),
      lm("Dubai Media City / Internet City", "דובאי מדיה סיטי / אינטרנט סיטי", "business", 5),
      lm("Knowledge Park / Universities", "אוניברסיטת נולדג׳ פארק", "landmark", 5),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 8),
      lm("Palm Jumeirah", "פאלם ג׳ומיירה", "landmark", 8),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 10),
    ],
  },

  // 17. JVC
  {
    area: "JVC",
    areaNameHe: "JVC",
    aliases: [
      "jvc",
    ],
    landmarks: [
      lm("Mall of the Emirates", "מול האמירויות", "mall", 10),
      lm("Dubai Marina / JBR Beach", "דובאי מרינה / JBR ביץ׳", "entertainment", 15),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 12),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 12),
      lm("Dubai Sports City", "דובאי ספורטס סיטי", "leisure", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 20),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 30),
      lm("Sheikh Zayed Road", "כביש שייח׳ זאיד", "transport", 5),
    ],
  },

  // 18. JVT
  {
    area: "JVT",
    areaNameHe: "JVT",
    aliases: [
      "jvt",
    ],
    landmarks: [
      lm("Mall of the Emirates", "מול האמירויות", "mall", 10),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 12),
      lm("Jumeirah Lake Towers", "JLT", "business", 8),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 20),
      lm("Dubai Hills Estate", "דובאי הילס", "landmark", 15),
    ],
  },

  // 19. Al Furjan
  {
    area: "Al Furjan",
    areaNameHe: "אל פורג׳ן",
    aliases: [
      "al furjan",
      "furjan",
    ],
    landmarks: [
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 5),
      lm("Ibn Battuta Metro Station", "תחנת מטרו אבן בטוטה", "transport", 5),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 12),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
      lm("Discovery Gardens", "דיסקברי גארדנס", "landmark", 5),
      lm("JVC / JVT", "JVC / JVT", "landmark", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 25),
    ],
  },

  // 20. Discovery Gardens
  {
    area: "Discovery Gardens",
    areaNameHe: "דיסקברי גארדנס",
    aliases: [
      "discovery gardens",
    ],
    landmarks: [
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 3),
      lm("Ibn Battuta Metro", "תחנת מטרו", "transport", 5),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 12),
      lm("Al Furjan", "אל פורג׳ן", "landmark", 5),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
    ],
  },

  // 21. Arabian Ranches
  {
    area: "Arabian Ranches",
    areaNameHe: "ערביאן ראנצ׳ס",
    aliases: [
      "arabian ranches",
    ],
    landmarks: [
      lm("Arabian Ranches Golf Club", "ערביאן ראנצ׳ס גולף קלאב", "leisure", 0),
      lm("Dubai Polo & Equestrian Club", "דובאי פולו קלאב", "leisure", 5),
      lm("Dubai Outlet Mall", "דובאי אאוטלט מול", "mall", 10),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 15),
      lm("Motor City / Sports City", "מוטור סיטי / ספורטס סיטי", "leisure", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 25),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 22),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 26),
    ],
  },

  // 22. Motor City
  {
    area: "Motor City",
    areaNameHe: "מוטור סיטי",
    aliases: [
      "motor city",
    ],
    landmarks: [
      lm("Dubai Autodrome", "דובאי אוטודרום", "entertainment", 0),
      lm("Dubai Sports City", "דובאי ספורטס סיטי", "leisure", 5),
      lm("Arabian Ranches", "ערביאן ראנצ׳ס", "landmark", 10),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 20),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 15),
      lm("Global Village", "גלובל וילג׳", "entertainment", 12),
    ],
  },

  // 23. Dubai Sports City
  {
    area: "Dubai Sports City",
    areaNameHe: "דובאי ספורטס סיטי",
    aliases: [
      "dubai sports city",
      "sports city",
    ],
    landmarks: [
      lm("Dubai International Cricket Stadium", "אצטדיון הקריקט", "leisure", 0),
      lm("Els Club Golf Course", "מגרשי גולף", "leisure", 0),
      lm("Motor City / Autodrome", "מוטור סיטי / אוטודרום", "entertainment", 5),
      lm("JVC", "JVC", "landmark", 10),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 18),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 15),
    ],
  },

  // 24. Emirates Hills
  {
    area: "Emirates Hills",
    areaNameHe: "אמירייטס הילס",
    aliases: [
      "emirates hills",
    ],
    landmarks: [
      lm("Emirates Golf Club", "מגרש גולף אמירייטס", "leisure", 0),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 10),
      lm("JBR Beach", "JBR ביץ׳", "beach", 12),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 10),
      lm("Dubai Media City", "דובאי מדיה סיטי", "business", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
    ],
  },

  // 25. The Meadows & The Springs
  {
    area: "The Meadows & The Springs",
    areaNameHe: "דה מדוז & דה ספרינגס",
    aliases: [
      "the meadows & the springs",
      "the meadows",
      "the springs",
    ],
    landmarks: [
      lm("Emirates Golf Club", "אמירייטס גולף קלאב", "leisure", 5),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 12),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 10),
      lm("Jumeirah Lake Towers", "JLT", "business", 8),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
    ],
  },

  // 26. The Lakes
  {
    area: "The Lakes",
    areaNameHe: "דה לייקס",
    aliases: [
      "the lakes",
    ],
    landmarks: [
      lm("Emirates Golf Club", "אמירייטס גולף קלאב", "leisure", 3),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 10),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 10),
      lm("Jumeirah Lake Towers", "JLT", "business", 7),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
    ],
  },

  // 27. Jumeirah Islands
  {
    area: "Jumeirah Islands",
    areaNameHe: "ג׳ומיירה איילנדס",
    aliases: [
      "jumeirah islands",
    ],
    landmarks: [
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 12),
      lm("Jumeirah Lake Towers", "JLT", "business", 8),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 12),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
    ],
  },

  // 28. Jumeirah Heights
  {
    area: "Jumeirah Heights",
    areaNameHe: "ג׳ומיירה הייטס",
    aliases: [
      "jumeirah heights",
    ],
    landmarks: [
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 10),
      lm("Jumeirah Lake Towers", "JLT", "business", 5),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 10),
      lm("Emirates Golf Club", "אמירייטס גולף קלאב", "leisure", 5),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
    ],
  },

  // 29. Jumeirah Golf Estates
  {
    area: "Jumeirah Golf Estates",
    areaNameHe: "ג׳ומיירה גולף אסטייטס",
    aliases: [
      "jumeirah golf estates",
    ],
    landmarks: [
      lm("Earth & Fire Golf Courses", "מגרשי גולף (ארת׳ & פייר)", "leisure", 0),
      lm("Dubai Sports City", "דובאי ספורטס סיטי", "leisure", 8),
      lm("Motor City", "מוטור סיטי", "landmark", 8),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 12),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 18),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 18),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 28),
    ],
  },

  // 30. Dubai Creek Harbour
  {
    area: "Dubai Creek Harbour",
    areaNameHe: "דובאי קריק הרבור",
    aliases: [
      "dubai creek harbour",
      "creek harbour",
    ],
    landmarks: [
      lm("Dubai Creek Tower (Under Const.)", "דובאי קריק טאואר (בבנייה)", "landmark", 0),
      lm("Ras Al Khor Wildlife Sanctuary", "רס אל-ח׳ור שמורת טבע", "park", 5),
      lm("Dubai Festival City Mall", "דובאי פסטיבל סיטי מול", "mall", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 10),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
      lm("Business Bay", "ביזנס ביי", "business", 10),
      lm("DIFC Financial Centre", "DIFC", "business", 12),
    ],
  },

  // 31. Dubai Festival City
  {
    area: "Dubai Festival City",
    areaNameHe: "דובאי פסטיבל סיטי",
    aliases: [
      "dubai festival city",
      "festival city",
    ],
    landmarks: [
      lm("Dubai Festival City Mall", "דובאי פסטיבל סיטי מול", "mall", 0),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 10),
      lm("Dubai Creek", "דובאי קריק", "landmark", 5),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 15),
      lm("Deira / Gold Souk", "דירה / גולד סוק", "landmark", 10),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 30),
    ],
  },

  // 32. Al Jaddaf
  {
    area: "Al Jaddaf",
    areaNameHe: "אל ג׳דאף",
    aliases: [
      "al jaddaf",
      "jaddaf",
    ],
    landmarks: [
      lm("Dubai Creek", "דובאי קריק", "landmark", 3),
      lm("Dubai Festival City", "דובאי פסטיבל סיטי", "mall", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 12),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 12),
      lm("Business Bay", "ביזנס ביי", "business", 10),
      lm("Al Shindagha Museum", "מוזיאון אל שינדגה", "landmark", 8),
      lm("Al Jaddaf Metro Station", "תחנת מטרו אל ג׳דאף", "transport", 3),
    ],
  },

  // 33. Meydan
  {
    area: "Meydan",
    areaNameHe: "מיידאן",
    aliases: [
      "meydan",
    ],
    landmarks: [
      lm("Meydan Racecourse", "מיידאן רייסקורס", "entertainment", 0),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 15),
      lm("Business Bay", "ביזנס ביי", "business", 10),
      lm("Ras Al Khor Wildlife Sanctuary", "רס אל-ח׳ור שמורת טבע", "park", 8),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 18),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 25),
    ],
  },

  // 34. Nad Al Sheba
  {
    area: "Nad Al Sheba",
    areaNameHe: "נאד אל שבא",
    aliases: [
      "nad al sheba",
    ],
    landmarks: [
      lm("Meydan Racecourse", "מיידאן רייסקורס", "entertainment", 5),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 15),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 12),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("Dubai Creek Harbour", "דובאי קריק הרבור", "landmark", 10),
    ],
  },

  // 35. Sobha Hartland
  {
    area: "Sobha Hartland",
    areaNameHe: "סובחה הרטלנד",
    aliases: [
      "sobha hartland",
    ],
    landmarks: [
      lm("Ras Al Khor Wildlife Sanctuary", "רס אל-ח׳ור שמורת טבע", "park", 5),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 12),
      lm("Business Bay", "ביזנס ביי", "business", 8),
      lm("Meydan", "מיידאן", "entertainment", 5),
      lm("Dubai Hills Estate", "דובאי הילס", "landmark", 10),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 17),
    ],
  },

  // 36. Tilal Al Ghaf
  {
    area: "Tilal Al Ghaf",
    areaNameHe: "תלאל אל ע׳אף",
    aliases: [
      "tilal al ghaf",
    ],
    landmarks: [
      lm("Crystal Lagoon", "לגונת קריסטל", "leisure", 0),
      lm("Dubai Sports City", "דובאי ספורטס סיטי", "leisure", 8),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 18),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 15),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 22),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 25),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
    ],
  },

  // 37. DAMAC Hills
  {
    area: "DAMAC Hills",
    areaNameHe: "דמאק הילס",
    aliases: [
      "damac hills",
    ],
    landmarks: [
      lm("Trump International Golf Club", "גולף קלאב טראמפ", "leisure", 0),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 18),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 20),
      lm("Arabian Ranches", "ערביאן ראנצ׳ס", "landmark", 10),
      lm("Motor City", "מוטור סיטי", "landmark", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 25),
      lm("Dubai Hills Estate", "דובאי הילס", "landmark", 15),
    ],
  },

  // 38. DAMAC Hills 2
  {
    area: "DAMAC Hills 2",
    areaNameHe: "דמאק הילס 2",
    aliases: [
      "damac hills 2",
    ],
    landmarks: [
      lm("Community Parks & Amenities", "פארקים ומתקני קהילה", "park", 0),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("IMG Worlds of Adventure", "IMG עולמות הרפתקאות", "entertainment", 15),
      lm("Dubai Outlet Mall", "דובאי אאוטלט מול", "mall", 10),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 20),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 25),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 30),
    ],
  },

  // 39. DAMAC Lagoons
  {
    area: "DAMAC Lagoons",
    areaNameHe: "דמאק לגונס",
    aliases: [
      "damac lagoons",
    ],
    landmarks: [
      lm("Crystal Lagoon", "קריסטל לגון", "leisure", 0),
      lm("DAMAC Hills", "דמאק הילס", "landmark", 8),
      lm("Motor City", "מוטור סיטי", "landmark", 10),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 18),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 22),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 25),
    ],
  },

  // 40. DAMAC Islands
  {
    area: "DAMAC Islands",
    areaNameHe: "דמאק איילנדס",
    aliases: [
      "damac islands",
    ],
    landmarks: [
      lm("Resort-Style Attractions", "מתחמי אטרקציות ופנאי", "entertainment", 0),
      lm("DAMAC Hills 2", "דמאק הילס 2", "landmark", 5),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("IMG Worlds of Adventure", "IMG עולמות הרפתקאות", "entertainment", 15),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 22),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 30),
    ],
  },

  // 41. Dubai South (Expo City)
  {
    area: "Dubai South (Expo City)",
    areaNameHe: "דובאי סאות׳",
    aliases: [
      "dubai south (expo city)",
      "dubai south",
      "south (expo city)",
    ],
    landmarks: [
      lm("Expo City Dubai", "אקספו סיטי דובאי", "landmark", 5),
      lm("Al Maktoum Airport (DWC)", "נמל תעופה אל-מכתום DWC", "airport", 10),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 15),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 25),
      lm("Palm Jebel Ali (Under Const.)", "פאלם ג׳בל עלי (בבנייה)", "landmark", 15),
      lm("Jebel Ali Free Zone (JAFZA)", "ג׳בל עלי פרי זון", "business", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 30),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 35),
    ],
  },

  // 42. Dubai Investment Park (DIP)
  {
    area: "Dubai Investment Park (DIP)",
    areaNameHe: "DIP",
    aliases: [
      "dubai investment park (dip)",
      "dubai investment park",
      "dip",
      "investment park (dip)",
    ],
    landmarks: [
      lm("Expo City Dubai", "אקספו סיטי", "landmark", 8),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 15),
      lm("Al Maktoum Airport (DWC)", "נמל תעופה אל-מכתום DWC", "airport", 12),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 22),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 20),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 28),
    ],
  },

  // 43. Jebel Ali
  {
    area: "Jebel Ali",
    areaNameHe: "ג׳בל עלי",
    aliases: [
      "jebel ali",
    ],
    landmarks: [
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 8),
      lm("Jebel Ali Free Zone (JAFZA)", "ג׳בל עלי פרי זון (JAFZA)", "business", 5),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 18),
      lm("Palm Jebel Ali (Under Const.)", "פאלם ג׳בל עלי (בבנייה)", "landmark", 5),
      lm("Expo City Dubai", "אקספו סיטי", "landmark", 12),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 30),
    ],
  },

  // 44. Palm Jebel Ali
  {
    area: "Palm Jebel Ali",
    areaNameHe: "פאלם ג׳בל עלי",
    aliases: [
      "palm jebel ali",
    ],
    landmarks: [
      lm("Jebel Ali", "ג׳בל עלי", "landmark", 5),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 18),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 10),
      lm("Expo City Dubai", "אקספו סיטי", "landmark", 15),
      lm("Al Maktoum Airport (DWC)", "נמל תעופה אל-מכתום DWC", "airport", 18),
    ],
  },

  // 45. Madinat Jumeirah Living
  {
    area: "Madinat Jumeirah Living",
    areaNameHe: "מדינת ג׳ומיירה ליבינג",
    aliases: [
      "madinat jumeirah living",
    ],
    landmarks: [
      lm("Madinat Jumeirah Souk & Hotels", "מדינת ג׳ומיירה סוק ומלונות", "landmark", 3),
      lm("Burj Al Arab", "בורג׳ אל ערב", "landmark", 3),
      lm("Wild Wadi Waterpark", "ווילד וואדי", "entertainment", 3),
      lm("Kite Beach", "קייט ביץ׳", "beach", 5),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 15),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 12),
    ],
  },

  // 46. Port de La Mer
  {
    area: "Port de La Mer",
    areaNameHe: "פורט דה לה מר",
    aliases: [
      "port de la mer",
    ],
    landmarks: [
      lm("Private Marina (190+ Berths)", "מרינה ונמל פרטי (190+ רציפים)", "landmark", 0),
      lm("La Mer Beach", "לה מר ביץ׳", "beach", 3),
      lm("City Walk", "סיטי ווק", "landmark", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 12),
      lm("DIFC Financial Centre", "DIFC", "business", 10),
      lm("Jumeirah Beach", "ג׳ומיירה ביץ׳", "beach", 5),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
    ],
  },

  // 47. La Mer
  {
    area: "La Mer",
    areaNameHe: "לה מר",
    aliases: [
      "la mer",
    ],
    landmarks: [
      lm("La Mer Beach", "חוף לה מר", "beach", 0),
      lm("City Walk", "סיטי ווק", "landmark", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 12),
      lm("DIFC Financial Centre", "DIFC", "business", 10),
      lm("Jumeirah", "ג׳ומיירה", "landmark", 5),
    ],
  },

  // 48. Pearl Jumeirah
  {
    area: "Pearl Jumeirah",
    areaNameHe: "פרל ג׳ומיירה",
    aliases: [
      "pearl jumeirah",
    ],
    landmarks: [
      lm("Jumeirah 1 Beach", "חוף ג׳ומיירה 1", "beach", 3),
      lm("City Walk", "סיטי ווק", "landmark", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 12),
      lm("DIFC", "DIFC", "business", 10),
      lm("La Mer", "לה מר", "beach", 5),
    ],
  },

  // 49. Dubai Silicon Oasis (DSO)
  {
    area: "Dubai Silicon Oasis (DSO)",
    areaNameHe: "DSO",
    aliases: [
      "dubai silicon oasis (dso)",
      "dubai silicon oasis",
      "dso",
      "silicon oasis (dso)",
    ],
    landmarks: [
      lm("DSO Tech Hub", "DSO מרכז טכנולוגי", "business", 0),
      lm("Dubai Academic City", "דובאי אקדמי סיטי", "landmark", 5),
      lm("Global Village", "גלובל וילג׳", "entertainment", 12),
      lm("Dubai Outlet Mall", "דובאי אאוטלט מול", "mall", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 20),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
      lm("Dubai Festival City", "דובאי פסטיבל סיטי", "mall", 15),
    ],
  },

  // 50. Dubai Production City (IMPZ)
  {
    area: "Dubai Production City (IMPZ)",
    areaNameHe: "IMPZ",
    aliases: [
      "dubai production city (impz)",
      "dubai production city",
      "impz",
      "production city (impz)",
    ],
    landmarks: [
      lm("JVC", "JVC", "landmark", 8),
      lm("Dubai Sports City", "דובאי ספורטס סיטי", "leisure", 8),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 18),
      lm("Ibn Battuta Mall", "אבן בטוטה מול", "mall", 12),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
    ],
  },

  // 51. International City
  {
    area: "International City",
    areaNameHe: "אינטרנשיונל סיטי",
    aliases: [
      "international city",
    ],
    landmarks: [
      lm("Dragon Mart", "דראגון מארט", "mall", 5),
      lm("Dubai Silicon Oasis", "DSO", "business", 8),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 25),
    ],
  },

  // 52. Dubailand / Arjan
  {
    area: "Dubailand / Arjan",
    areaNameHe: "ארג׳אן",
    aliases: [
      "dubailand / arjan",
      "dubailand",
      "arjan",
    ],
    landmarks: [
      lm("Dubai Miracle Garden", "מירקל גארדן", "entertainment", 5),
      lm("Dubai Butterfly Garden", "דובאי באטרפליי גארדן", "entertainment", 5),
      lm("Global Village", "גלובל וילג׳", "entertainment", 10),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 12),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
      lm("IMG Worlds of Adventure", "IMG עולמות הרפתקאות", "entertainment", 12),
    ],
  },

  // 53. The Oasis (Emaar)
  {
    area: "The Oasis (Emaar)",
    areaNameHe: "דה אואזיס",
    aliases: [
      "the oasis (emaar)",
      "the oasis",
    ],
    landmarks: [
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 10),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 20),
      lm("Business Bay", "ביזנס ביי", "business", 18),
      lm("Arabian Ranches", "ערביאן ראנצ׳ס", "landmark", 10),
    ],
  },

  // 54. District One (MBR City)
  {
    area: "District One (MBR City)",
    areaNameHe: "דיסטריקט וואן",
    aliases: [
      "district one (mbr city)",
      "district one",
      "mbr city",
    ],
    landmarks: [
      lm("Crystal Lagoon & White Sand Beach", "קריסטל לגון", "leisure", 0),
      lm("Meydan Racecourse", "מיידאן", "entertainment", 5),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 10),
      lm("Business Bay", "ביזנס ביי", "business", 10),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 10),
      lm("DIFC Financial Centre", "DIFC", "business", 12),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
    ],
  },

  // 55. Al Wasl
  {
    area: "Al Wasl",
    areaNameHe: "אל וצל",
    aliases: [
      "al wasl",
      "wasl",
    ],
    landmarks: [
      lm("City Walk", "סיטי ווק", "landmark", 3),
      lm("Jumeirah Beach", "ג׳ומיירה ביץ׳", "beach", 8),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 10),
      lm("DIFC Financial Centre", "DIFC", "business", 7),
      lm("Burj Al Arab", "בורג׳ אל ערב", "landmark", 12),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 12),
    ],
  },

  // 56. Zabeel
  {
    area: "Zabeel",
    areaNameHe: "זבאל",
    aliases: [
      "zabeel",
    ],
    landmarks: [
      lm("Dubai Frame", "דובאי פריים", "landmark", 3),
      lm("Zabeel Park", "פארק זבאל", "park", 0),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 8),
      lm("DIFC Financial Centre", "DIFC", "business", 5),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 12),
      lm("Dubai Creek", "דובאי קריק", "landmark", 8),
    ],
  },

  // 57. Al Quoz
  {
    area: "Al Quoz",
    areaNameHe: "אל קוז",
    aliases: [
      "al quoz",
      "quoz",
    ],
    landmarks: [
      lm("Alserkal Avenue (Art District)", "אלסרכאל אוונה (אמנות)", "landmark", 0),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 8),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 15),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 15),
    ],
  },

  // 58. Mirdif
  {
    area: "Mirdif",
    areaNameHe: "מירדיף",
    aliases: [
      "mirdif",
    ],
    landmarks: [
      lm("Mirdif City Centre", "מירדיף סיטי סנטר", "mall", 5),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 10),
      lm("Mushrif Park", "מושריף פארק", "park", 5),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 20),
      lm("Dubai Festival City", "דובאי פסטיבל סיטי", "mall", 12),
    ],
  },

  // 59. Al Warqa
  {
    area: "Al Warqa",
    areaNameHe: "אל ורקא",
    aliases: [
      "al warqa",
      "warqa",
    ],
    landmarks: [
      lm("Mirdif City Centre", "מירדיף סיטי סנטר", "mall", 5),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 10),
      lm("Dragon Mart", "דראגון מארט", "mall", 8),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 20),
    ],
  },

  // 60. Deira
  {
    area: "Deira",
    areaNameHe: "דירה",
    aliases: [
      "deira",
    ],
    landmarks: [
      lm("Gold Souk", "גולד סוק", "landmark", 3),
      lm("Spice Souk", "ספייס סוק", "landmark", 3),
      lm("Deira City Centre", "דירה סיטי סנטר", "mall", 5),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 10),
      lm("Dubai Creek (Abra Crossing)", "דובאי קריק (עברה)", "landmark", 3),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 15),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 30),
    ],
  },

  // 61. Bur Dubai
  {
    area: "Bur Dubai",
    areaNameHe: "בור דובאי",
    aliases: [
      "bur dubai",
    ],
    landmarks: [
      lm("Dubai Creek", "דובאי קריק", "landmark", 3),
      lm("Dubai Museum / Al Fahidi", "דובאי מוזיאום / אל פהידי", "landmark", 3),
      lm("Textile Souk", "טקסטיל סוק", "landmark", 3),
      lm("Dubai Frame", "דובאי פריים", "landmark", 5),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 10),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 12),
      lm("BurJuman Mall", "ברג׳ומאן מול", "mall", 3),
    ],
  },

  // 62. Al Nahda
  {
    area: "Al Nahda",
    areaNameHe: "אל נהדה",
    aliases: [
      "al nahda",
      "nahda",
    ],
    landmarks: [
      lm("Sahara Centre (Sharjah border)", "סחארה סנטר", "mall", 5),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 12),
      lm("Deira City Centre", "דירה סיטי סנטר", "mall", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 18),
      lm("Sharjah Border", "גבול שארג׳ה", "landmark", 3),
    ],
  },

  // 63. Town Square
  {
    area: "Town Square",
    areaNameHe: "טאון סקוור",
    aliases: [
      "town square",
    ],
    landmarks: [
      lm("Community Park & Skate Park", "פארק קהילתי", "park", 0),
      lm("Arabian Ranches", "ערביאן ראנצ׳ס", "landmark", 10),
      lm("Global Village", "גלובל וילג׳", "entertainment", 12),
      lm("IMG Worlds of Adventure", "IMG עולמות הרפתקאות", "entertainment", 12),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 18),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 20),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 25),
    ],
  },

  // 64. Mudon
  {
    area: "Mudon",
    areaNameHe: "מודון",
    aliases: [
      "mudon",
    ],
    landmarks: [
      lm("Arabian Ranches", "ערביאן ראנצ׳ס", "landmark", 8),
      lm("Global Village", "גלובל וילג׳", "entertainment", 12),
      lm("Dubai Outlet Mall", "דובאי אאוטלט מול", "mall", 10),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 18),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 22),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 28),
    ],
  },

  // 65. Villanova
  {
    area: "Villanova",
    areaNameHe: "וילנובה",
    aliases: [
      "villanova",
    ],
    landmarks: [
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 12),
      lm("Arabian Ranches", "ערביאן ראנצ׳ס", "landmark", 10),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 18),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
    ],
  },

  // 66. The Valley (Emaar)
  {
    area: "The Valley (Emaar)",
    areaNameHe: "דה ואלי",
    aliases: [
      "the valley (emaar)",
      "the valley",
    ],
    landmarks: [
      lm("Dubai Outlet Mall", "דובאי אאוטלט מול", "mall", 10),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("IMG Worlds of Adventure", "IMG עולמות הרפתקאות", "entertainment", 15),
      lm("Arabian Ranches", "ערביאן ראנצ׳ס", "landmark", 12),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 30),
      lm("Al Maktoum Airport (DWC)", "נמל תעופה אל-מכתום DWC", "airport", 20),
    ],
  },

  // 67. Emaar South
  {
    area: "Emaar South",
    areaNameHe: "אמאר סאות׳",
    aliases: [
      "emaar south",
    ],
    landmarks: [
      lm("Expo City Dubai", "אקספו סיטי דובאי", "landmark", 5),
      lm("Al Maktoum Airport (DWC)", "נמל תעופה אל-מכתום DWC", "airport", 8),
      lm("Emaar South Golf Club", "מגרש גולף אמאר סאות׳", "leisure", 0),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 25),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 30),
    ],
  },

  // 68. Dubai Harbour
  {
    area: "Dubai Harbour",
    areaNameHe: "דובאי הרבור",
    aliases: [
      "dubai harbour",
      "harbour",
    ],
    landmarks: [
      lm("Dubai Harbour Marina", "מרינה דובאי הרבור", "landmark", 0),
      lm("Beach", "חוף", "beach", 0),
      lm("Dubai Marina", "דובאי מרינה", "entertainment", 5),
      lm("JBR Beach", "JBR", "beach", 5),
      lm("Palm Jumeirah", "פאלם ג׳ומיירה", "landmark", 8),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 15),
    ],
  },

  // 69. Ghaf Woods
  {
    area: "Ghaf Woods",
    areaNameHe: "ע׳אף וודס",
    aliases: [
      "ghaf woods",
    ],
    landmarks: [
      lm("Global Village", "גלובל וילג׳", "entertainment", 5),
      lm("Dubai Outlet Mall", "דובאי אאוטלט מול", "mall", 8),
      lm("IMG Worlds of Adventure", "IMG עולמות הרפתקאות", "entertainment", 10),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 15),
      lm("Arabian Ranches", "ערביאן ראנצ׳ס", "landmark", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 25),
    ],
  },

  // 70. Athlon (Aldar)
  {
    area: "Athlon (Aldar)",
    areaNameHe: "אתלון",
    aliases: [
      "athlon (aldar)",
      "athlon",
    ],
    landmarks: [
      lm("Arabian Ranches III", "ערביאן ראנצ׳ס 3", "landmark", 3),
      lm("Global Village", "גלובל וילג׳", "entertainment", 12),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 15),
      lm("Mall of the Emirates", "מול האמירויות", "mall", 20),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 25),
    ],
  },

  // 71. The Acres (Meraas)
  {
    area: "The Acres (Meraas)",
    areaNameHe: "דה אייקרס",
    aliases: [
      "the acres (meraas)",
      "the acres",
    ],
    landmarks: [
      lm("DAMAC Hills 2", "דמאק הילס 2", "landmark", 8),
      lm("Global Village", "גלובל וילג׳", "entertainment", 12),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 18),
      lm("Arabian Ranches", "ערביאן ראנצ׳ס", "landmark", 12),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 28),
    ],
  },

  // 72. Dubai Islands
  {
    area: "Dubai Islands",
    areaNameHe: "דובאי איילנדס",
    aliases: [
      "dubai islands",
      "islands",
    ],
    landmarks: [
      lm("Beachfront", "חוף", "beach", 0),
      lm("Deira / Gold Souk", "דירה / גולד סוק", "landmark", 10),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 18),
      lm("Dubai Creek", "דובאי קריק", "landmark", 10),
    ],
  },

  // 73. Maritime City
  {
    area: "Maritime City",
    areaNameHe: "מריטיים סיטי",
    aliases: [
      "maritime city",
    ],
    landmarks: [
      lm("Dubai Creek", "דובאי קריק", "landmark", 3),
      lm("Dubai Festival City", "דובאי פסטיבל סיטי", "mall", 8),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 10),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 12),
    ],
  },

  // 74. Al Khawaneej
  {
    area: "Al Khawaneej",
    areaNameHe: "אל-ח׳וואניג׳",
    aliases: [
      "al khawaneej",
      "khawaneej",
    ],
    landmarks: [
      lm("Last Exit Al Khawaneej", "לאסט אקזיט (אל-ח׳וואניג׳)", "entertainment", 5),
      lm("Mushrif Park", "מושריף פארק", "park", 5),
      lm("Mirdif City Centre", "מירדיף סיטי סנטר", "mall", 10),
      lm("Dubai Int'l Airport (DXB)", "נמל תעופה DXB", "airport", 15),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 22),
    ],
  },

  // 75. Reem Hills
  {
    area: "Reem Hills",
    areaNameHe: "ריים הילס",
    aliases: [
      "reem hills",
    ],
    landmarks: [
      lm("DAMAC Hills 2", "דמאק הילס 2", "landmark", 8),
      lm("Global Village", "גלובל וילג׳", "entertainment", 15),
      lm("Arabian Ranches", "ערביאן ראנצ׳ס", "landmark", 12),
      lm("Dubai Hills Mall", "דובאי הילס מול", "mall", 18),
      lm("Downtown / Dubai Mall", "דאונטאון / דובאי מול", "landmark", 28),
    ],
  },

];

// ---------------------------------------------------------------------------
// Exported utility functions
// ---------------------------------------------------------------------------

/**
 * Normalise a string for fuzzy comparison: lowercase, trim, strip common noise
 * words, and collapse whitespace.
 */
function normalise(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['\u2018\u2019`]/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Check whether needle appears as a substring of candidate or vice versa
 * after normalisation, or if there is strong word-level overlap.
 */
function fuzzyMatch(needle: string, candidate: string): boolean {
  const n = normalise(needle);
  const c = normalise(candidate);
  if (n === c) return true;
  if (c.includes(n) || n.includes(c)) return true;
  // Word-level containment: all words in needle exist in candidate
  const nWords = n.split(" ");
  const cWords = c.split(" ");
  if (
    nWords.length > 0 &&
    nWords.every((w) => cWords.some((cw) => cw.includes(w) || w.includes(cw)))
  ) {
    return true;
  }
  return false;
}

/**
 * Look up nearby landmarks for a given area name. Performs fuzzy matching
 * against area names, Hebrew area names, and aliases.
 *
 * Returns an empty array if no area matches.
 */
export function getProximityByArea(areaName: string): ProximityLandmark[] {
  if (!areaName || typeof areaName !== "string") return [];

  const input = normalise(areaName);

  for (const entry of DUBAI_PROXIMITY_DATA) {
    // Match against canonical English name
    if (fuzzyMatch(input, entry.area)) return entry.landmarks;

    // Match against Hebrew name
    if (entry.areaNameHe === areaName.trim()) return entry.landmarks;

    // Match against aliases
    for (const alias of entry.aliases) {
      if (fuzzyMatch(input, alias)) return entry.landmarks;
    }
  }

  return [];
}

/**
 * Return the full AreaProximity object (including area metadata) for a given
 * area name. Returns null if no match is found.
 */
export function getAreaProximity(areaName: string): AreaProximity | null {
  if (!areaName || typeof areaName !== "string") return null;

  const input = normalise(areaName);

  for (const entry of DUBAI_PROXIMITY_DATA) {
    if (fuzzyMatch(input, entry.area)) return entry;
    if (entry.areaNameHe === areaName.trim()) return entry;
    for (const alias of entry.aliases) {
      if (fuzzyMatch(input, alias)) return entry;
    }
  }

  return null;
}

/**
 * Return all canonical area names (English).
 */
export function getAllAreas(): string[] {
  return DUBAI_PROXIMITY_DATA.map((entry) => entry.area);
}

/**
 * Return all area names as objects with English and Hebrew labels.
 */
export function getAllAreasWithTranslations(): Array<{ en: string; he: string }> {
  return DUBAI_PROXIMITY_DATA.map((entry) => ({
    en: entry.area,
    he: entry.areaNameHe,
  }));
}

/**
 * Given a landmark category, return the suggested icon name (lucide-react).
 */
export function getCategoryIcon(category: LandmarkCategory): string {
  return CATEGORY_ICONS[category];
}

/**
 * Given a landmark category, return the Hebrew label.
 */
export function getCategoryLabelHe(category: LandmarkCategory): string {
  return CATEGORY_LABELS_HE[category];
}

/**
 * Given a landmark category, return the English label.
 */
export function getCategoryLabelEn(category: LandmarkCategory): string {
  return CATEGORY_LABELS_EN[category];
}

/**
 * Filter landmarks by category.
 */
export function filterLandmarksByCategory(
  landmarks: ProximityLandmark[],
  category: LandmarkCategory,
): ProximityLandmark[] {
  return landmarks.filter((l) => l.category === category);
}

/**
 * Get all unique landmark names across all areas.
 */
export function getAllLandmarkNames(): string[] {
  const names = new Set<string>();
  for (const entry of DUBAI_PROXIMITY_DATA) {
    for (const landmark of entry.landmarks) {
      names.add(landmark.name);
    }
  }
  return Array.from(names).sort();
}
