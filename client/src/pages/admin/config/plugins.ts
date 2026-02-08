import {
  Target, TrendingUp, Layers, LineChart, Users, FileText, FileCheck, PenTool,
  Calendar, Mail, Phone, Share2, Megaphone, Home, Clock, ThumbsUp, Network,
  DollarSign, Wallet, Receipt, HardDrive, Bell, MapPin, School, AlertTriangle,
  Bus, Percent, CreditCard, CheckCircle, Landmark, ClipboardCheck, Search,
  Wrench, Truck, Zap, ShieldCheck, Shield, Camera, Plane, Video, Printer, Send,
  Map, RotateCcw, Briefcase, BarChart3, Building2, UserCheck, Banknote,
  UserPlus, BookOpen, Award, Star, Bot, Newspaper, Languages, Lightbulb,
  type LucideIcon
} from "lucide-react";

export interface PluginConfig {
  betaKey: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: LucideIcon;
  features: string[];
  featuresEn: string[];
  color?: string;
}

export const pluginConfigs: Record<string, PluginConfig> = {
  "lead-scoring": {
    betaKey: "ddl-lead-scoring-beta-views",
    title: "Lead Scoring",
    titleEn: "AI-Powered Lead Prioritization",
    description: "דירוג לידים חכם המבוסס על AI לזיהוי הלקוחות הפוטנציאליים הטובים ביותר",
    descriptionEn: "Identify your hottest prospects with AI-driven scoring",
    icon: Target,
    features: ["ניקוד אוטומטי", "התראות בזמן אמת", "היסטוריית אינטראקציות", "חיזוי סגירה"],
    featuresEn: ["Auto Scoring", "Real-time Alerts", "Interaction History", "Close Prediction"],
    color: "from-red-500 to-orange-600"
  },
  "property-valuation": {
    betaKey: "ddl-property-valuation-beta-views",
    title: "Property Valuation AI",
    titleEn: "Instant Property Value Estimates",
    description: "הערכת שווי נכסים מיידית באמצעות בינה מלאכותית ונתוני שוק",
    descriptionEn: "Get accurate valuations using AI and market data",
    icon: TrendingUp,
    features: ["הערכה מיידית", "השוואת מחירים", "מגמות שוק", "דוחות PDF"],
    featuresEn: ["Instant Valuation", "Price Comparison", "Market Trends", "PDF Reports"],
    color: "from-green-500 to-emerald-600"
  },
  "virtual-staging": {
    betaKey: "ddl-virtual-staging-beta-views",
    title: "Virtual Staging",
    titleEn: "AI-Powered Room Staging",
    description: "הלבשת חדרים וירטואלית באמצעות AI - הפוך נכסים ריקים לבתים מזמינים",
    descriptionEn: "Transform empty spaces into beautifully furnished rooms",
    icon: Layers,
    features: ["סגנונות מרובים", "עריכה מהירה", "תמונות HD", "לפני/אחרי"],
    featuresEn: ["Multiple Styles", "Quick Editing", "HD Images", "Before/After"],
    color: "from-purple-500 to-pink-600"
  },
  "market-analytics": {
    betaKey: "ddl-market-analytics-beta-views",
    title: "Market Analytics",
    titleEn: "Real-Time Market Intelligence",
    description: "ניתוח שוק מתקדם עם נתונים בזמן אמת וחיזוי מגמות",
    descriptionEn: "Stay ahead with real-time market data and trends",
    icon: LineChart,
    features: ["נתוני שוק", "חיזוי מחירים", "מפות חום", "דוחות מותאמים"],
    featuresEn: ["Market Data", "Price Prediction", "Heat Maps", "Custom Reports"],
    color: "from-blue-500 to-cyan-600"
  },
  "client-portal": {
    betaKey: "ddl-client-portal-beta-views",
    title: "Client Portal",
    titleEn: "Secure Client Dashboard",
    description: "פורטל מאובטח ללקוחות לצפייה בנכסים, מסמכים והתקדמות העסקה",
    descriptionEn: "Give clients 24/7 access to their transaction",
    icon: Users,
    features: ["כניסה מאובטחת", "שיתוף מסמכים", "מעקב התקדמות", "צ'אט מובנה"],
    featuresEn: ["Secure Login", "Doc Sharing", "Progress Tracking", "Built-in Chat"],
    color: "from-indigo-500 to-blue-600"
  },
  "document-manager": {
    betaKey: "ddl-document-manager-beta-views",
    title: "Document Manager",
    titleEn: "Smart Document Organization",
    description: "ניהול מסמכים חכם עם OCR, חיפוש מתקדם ותזכורות",
    descriptionEn: "Organize all your documents in one place",
    icon: FileText,
    features: ["זיהוי OCR", "חיפוש מתקדם", "תזכורות", "גיבוי ענן"],
    featuresEn: ["OCR Recognition", "Advanced Search", "Reminders", "Cloud Backup"],
    color: "from-slate-500 to-gray-600"
  },
  "contract-generator": {
    betaKey: "ddl-contract-generator-beta-views",
    title: "Contract Generator",
    titleEn: "Auto-Generate Legal Contracts",
    description: "יצירת חוזים אוטומטית עם תבניות משפטיות מוכנות",
    descriptionEn: "Create professional contracts in minutes",
    icon: FileCheck,
    features: ["תבניות מוכנות", "מילוי אוטומטי", "בדיקה משפטית", "ייצוא PDF"],
    featuresEn: ["Ready Templates", "Auto-Fill", "Legal Review", "PDF Export"],
    color: "from-teal-500 to-green-600"
  },
  "e-signature": {
    betaKey: "ddl-e-signature-beta-views",
    title: "E-Signature",
    titleEn: "Digital Signatures Made Easy",
    description: "חתימות דיגיטליות מאובטחות ותקפות משפטית",
    descriptionEn: "Sign documents electronically with legal validity",
    icon: PenTool,
    features: ["חתימה מאובטחת", "תוקף משפטי", "מעקב סטטוס", "תזכורות חתימה"],
    featuresEn: ["Secure Signing", "Legal Validity", "Status Tracking", "Sign Reminders"],
    color: "from-violet-500 to-purple-600"
  },
  "calendar-sync": {
    betaKey: "ddl-calendar-sync-beta-views",
    title: "Calendar Sync",
    titleEn: "Universal Calendar Integration",
    description: "סנכרון יומנים עם Google, Outlook ואפליקציות נוספות",
    descriptionEn: "Sync with all your favorite calendar apps",
    icon: Calendar,
    features: ["סנכרון דו-כיווני", "תזכורות חכמות", "זמינות אוטומטית", "הזמנות Zoom"],
    featuresEn: ["Two-way Sync", "Smart Reminders", "Auto Availability", "Zoom Links"],
    color: "from-blue-500 to-indigo-600"
  },
  "email-campaigns": {
    betaKey: "ddl-email-campaigns-beta-views",
    title: "Email Campaigns",
    titleEn: "Automated Email Marketing",
    description: "קמפיינים אוטומטיים לטיפוח לידים ושימור לקוחות",
    descriptionEn: "Nurture leads with automated email sequences",
    icon: Mail,
    features: ["דרייפ קמפיינים", "תבניות מעוצבות", "A/B Testing", "אנליטיקס"],
    featuresEn: ["Drip Campaigns", "Designer Templates", "A/B Testing", "Analytics"],
    color: "from-pink-500 to-rose-600"
  },
  "sms-marketing": {
    betaKey: "ddl-sms-marketing-beta-views",
    title: "SMS Marketing",
    titleEn: "Bulk SMS & Text Automation",
    description: "שליחת SMS המונית ואוטומציות טקסט ללקוחות",
    descriptionEn: "Reach clients instantly via text message",
    icon: Phone,
    features: ["SMS המוני", "אוטומציות", "תזמון שליחה", "דוחות משלוח"],
    featuresEn: ["Bulk SMS", "Automations", "Scheduled Send", "Delivery Reports"],
    color: "from-green-500 to-teal-600"
  },
  "social-media": {
    betaKey: "ddl-social-media-beta-views",
    title: "Social Media Manager",
    titleEn: "Multi-Platform Social Management",
    description: "ניהול כל הרשתות החברתיות ממקום אחד",
    descriptionEn: "Manage all your social accounts in one place",
    icon: Share2,
    features: ["פרסום מתוזמן", "תבניות פוסטים", "אנליטיקס", "ניהול תגובות"],
    featuresEn: ["Scheduled Posts", "Post Templates", "Analytics", "Reply Management"],
    color: "from-blue-500 to-sky-600"
  },
  "listing-syndication": {
    betaKey: "ddl-listing-syndication-beta-views",
    title: "Listing Syndication",
    titleEn: "Publish to 100+ Portals",
    description: "הפצת נכסים אוטומטית ליותר מ-100 פורטלים ואתרים",
    descriptionEn: "Syndicate listings to major real estate portals",
    icon: Megaphone,
    features: ["100+ פורטלים", "עדכון אוטומטי", "מעקב צפיות", "סטטיסטיקות"],
    featuresEn: ["100+ Portals", "Auto Update", "View Tracking", "Statistics"],
    color: "from-orange-500 to-amber-600"
  },
  "open-house": {
    betaKey: "ddl-open-house-beta-views",
    title: "Open House Manager",
    titleEn: "Open House Event Planning",
    description: "ניהול ימי בית פתוח - רישום, תזכורות ומעקב",
    descriptionEn: "Plan and manage open house events efficiently",
    icon: Home,
    features: ["רישום אונליין", "תזכורות SMS", "מעקב מבקרים", "משוב אוטומטי"],
    featuresEn: ["Online Registration", "SMS Reminders", "Visitor Tracking", "Auto Feedback"],
    color: "from-amber-500 to-yellow-600"
  },
  "showing-scheduler": {
    betaKey: "ddl-showing-scheduler-beta-views",
    title: "Showing Scheduler",
    titleEn: "Smart Showing Management",
    description: "תיאום סיורים אוטומטי עם לקוחות ובעלי נכסים",
    descriptionEn: "Coordinate showings with clients and owners",
    icon: Clock,
    features: ["תיאום אוטומטי", "אישור מיידי", "תזכורות", "מסלול אופטימלי"],
    featuresEn: ["Auto Scheduling", "Instant Confirm", "Reminders", "Route Optimization"],
    color: "from-cyan-500 to-blue-600"
  },
  "feedback-collector": {
    betaKey: "ddl-feedback-collector-beta-views",
    title: "Feedback Collector",
    titleEn: "Automated Showing Feedback",
    description: "איסוף משוב אוטומטי לאחר סיורים בנכסים",
    descriptionEn: "Collect feedback automatically after showings",
    icon: ThumbsUp,
    features: ["שאלונים אוטומטיים", "ניתוח סנטימנט", "דוחות מפורטים", "התראות מוכר"],
    featuresEn: ["Auto Surveys", "Sentiment Analysis", "Detailed Reports", "Seller Alerts"],
    color: "from-green-500 to-emerald-600"
  },
  "referral-tracker": {
    betaKey: "ddl-referral-tracker-beta-views",
    title: "Referral Tracker",
    titleEn: "Track & Manage Referrals",
    description: "מעקב הפניות ושותפויות עם סוכנים אחרים",
    descriptionEn: "Track referrals and partnerships with other agents",
    icon: Network,
    features: ["מעקב הפניות", "חישוב עמלות", "תזכורות תשלום", "דוחות שנתיים"],
    featuresEn: ["Referral Tracking", "Commission Calc", "Payment Reminders", "Annual Reports"],
    color: "from-purple-500 to-violet-600"
  },
  "commission-calc": {
    betaKey: "ddl-commission-calc-beta-views",
    title: "Commission Calculator",
    titleEn: "Advanced Commission Tracking",
    description: "מחשבון עמלות מתקדם עם חלוקה לצוות",
    descriptionEn: "Calculate and track all your commissions",
    icon: DollarSign,
    features: ["חישוב מדויק", "חלוקת צוות", "מעקב תשלומים", "דוחות מס"],
    featuresEn: ["Accurate Calc", "Team Split", "Payment Tracking", "Tax Reports"],
    color: "from-green-500 to-teal-600"
  },
  "expense-tracker": {
    betaKey: "ddl-expense-tracker-beta-views",
    title: "Expense Tracker",
    titleEn: "Business Expense Management",
    description: "מעקב הוצאות עסקיות וניהול קבלות",
    descriptionEn: "Track and categorize business expenses",
    icon: Wallet,
    features: ["סריקת קבלות", "קטגוריות אוטומטיות", "דוחות הוצאות", "ייצוא לחשבון"],
    featuresEn: ["Receipt Scanning", "Auto Categories", "Expense Reports", "Accountant Export"],
    color: "from-slate-500 to-gray-600"
  },
  "tax-reporter": {
    betaKey: "ddl-tax-reporter-beta-views",
    title: "Tax Reporter",
    titleEn: "Tax-Ready Financial Reports",
    description: "דוחות פיננסיים מוכנים לרואה חשבון ורשויות המס",
    descriptionEn: "Generate tax-ready reports for accountants",
    icon: Receipt,
    features: ["דוחות מס", "סיכום שנתי", "ניכויים אוטומטיים", "תמיכה בייצוא"],
    featuresEn: ["Tax Reports", "Annual Summary", "Auto Deductions", "Export Support"],
    color: "from-blue-500 to-indigo-600"
  },
  "mls-integration": {
    betaKey: "ddl-mls-integration-beta-views",
    title: "MLS Integration",
    titleEn: "Direct MLS Connection",
    description: "חיבור ישיר למערכות MLS לסנכרון נכסים",
    descriptionEn: "Connect directly to MLS for listing sync",
    icon: HardDrive,
    features: ["סנכרון אוטומטי", "עדכונים בזמן אמת", "היסטוריית נכסים", "Comps"],
    featuresEn: ["Auto Sync", "Real-time Updates", "Property History", "Comps"],
    color: "from-indigo-500 to-purple-600"
  },
  "property-alerts": {
    betaKey: "ddl-property-alerts-beta-views",
    title: "Property Alerts",
    titleEn: "Smart Property Notifications",
    description: "התראות חכמות על נכסים חדשים ושינויי מחיר",
    descriptionEn: "Alert clients when matching properties appear",
    icon: Bell,
    features: ["התראות מותאמות", "פילטרים מתקדמים", "שליחה אוטומטית", "מעקב פתיחות"],
    featuresEn: ["Custom Alerts", "Advanced Filters", "Auto Send", "Open Tracking"],
    color: "from-yellow-500 to-orange-600"
  },
  "neighborhood-insights": {
    betaKey: "ddl-neighborhood-insights-beta-views",
    title: "Neighborhood Insights",
    titleEn: "Local Area Intelligence",
    description: "מידע מקיף על שכונות - דמוגרפיה, שירותים ומגמות",
    descriptionEn: "Comprehensive neighborhood data for clients",
    icon: MapPin,
    features: ["דמוגרפיה", "שירותים קרובים", "מגמות מחירים", "איכות חיים"],
    featuresEn: ["Demographics", "Nearby Services", "Price Trends", "Quality of Life"],
    color: "from-green-500 to-emerald-600"
  },
  "school-data": {
    betaKey: "ddl-school-data-beta-views",
    title: "School District Data",
    titleEn: "School Ratings & Info",
    description: "מידע על בתי ספר, דירוגים ואזורי רישום",
    descriptionEn: "Help families find the best school districts",
    icon: School,
    features: ["דירוגי בתי ספר", "אזורי רישום", "סטטיסטיקות", "השוואות"],
    featuresEn: ["School Ratings", "District Zones", "Statistics", "Comparisons"],
    color: "from-blue-500 to-cyan-600"
  },
  "crime-stats": {
    betaKey: "ddl-crime-stats-beta-views",
    title: "Crime Stats",
    titleEn: "Neighborhood Safety Data",
    description: "נתוני פשיעה ובטיחות לפי אזורים",
    descriptionEn: "Provide clients with safety information",
    icon: AlertTriangle,
    features: ["מפות פשיעה", "מגמות בטיחות", "השוואת אזורים", "התראות"],
    featuresEn: ["Crime Maps", "Safety Trends", "Area Comparison", "Alerts"],
    color: "from-red-500 to-rose-600"
  },
  "transit-scores": {
    betaKey: "ddl-transit-scores-beta-views",
    title: "Transit Scores",
    titleEn: "Transportation & Walkability",
    description: "ציוני נגישות, תחבורה ציבורית והליכתיות",
    descriptionEn: "Walk, transit, and bike scores for properties",
    icon: Bus,
    features: ["ציון הליכה", "תחבורה ציבורית", "נגישות אופניים", "זמני נסיעה"],
    featuresEn: ["Walk Score", "Transit Score", "Bike Score", "Commute Times"],
    color: "from-teal-500 to-green-600"
  },
  "mortgage-calc": {
    betaKey: "ddl-mortgage-calc-beta-views",
    title: "Mortgage Calculator",
    titleEn: "Advanced Mortgage Tools",
    description: "מחשבון משכנתא מתקדם עם השוואת הצעות",
    descriptionEn: "Help clients understand their financing options",
    icon: Percent,
    features: ["חישוב תשלומים", "השוואת הצעות", "לוח סילוקין", "תרחישים"],
    featuresEn: ["Payment Calc", "Offer Comparison", "Amortization", "Scenarios"],
    color: "from-green-500 to-emerald-600"
  },
  "affordability-checker": {
    betaKey: "ddl-affordability-checker-beta-views",
    title: "Affordability Checker",
    titleEn: "Client Budget Analysis",
    description: "בדיקת יכולת רכישה ללקוחות לפי הכנסה והוצאות",
    descriptionEn: "Determine what clients can afford",
    icon: CreditCard,
    features: ["ניתוח הכנסות", "חישוב DTI", "טווח מחירים", "המלצות"],
    featuresEn: ["Income Analysis", "DTI Calculation", "Price Range", "Recommendations"],
    color: "from-blue-500 to-indigo-600"
  },
  "pre-approval": {
    betaKey: "ddl-pre-approval-beta-views",
    title: "Pre-Approval Tool",
    titleEn: "Instant Pre-Approval Letters",
    description: "הפקת מכתבי אישור עקרוני מהירים",
    descriptionEn: "Generate pre-approval letters quickly",
    icon: CheckCircle,
    features: ["אישור מהיר", "חיבור למלווים", "מכתבים דיגיטליים", "מעקב"],
    featuresEn: ["Quick Approval", "Lender Connect", "Digital Letters", "Tracking"],
    color: "from-green-500 to-teal-600"
  },
  "lender-network": {
    betaKey: "ddl-lender-network-beta-views",
    title: "Lender Network",
    titleEn: "Preferred Lender Directory",
    description: "רשת מלווים מומלצים עם מעקב הפניות",
    descriptionEn: "Connect clients with trusted lenders",
    icon: Landmark,
    features: ["מלווים מומלצים", "מעקב הפניות", "השוואת ריביות", "עמלות"],
    featuresEn: ["Trusted Lenders", "Referral Tracking", "Rate Comparison", "Commissions"],
    color: "from-amber-500 to-yellow-600"
  },
  "title-connect": {
    betaKey: "ddl-title-connect-beta-views",
    title: "Title Company Connect",
    titleEn: "Title & Escrow Management",
    description: "חיבור לחברות טייטל וניהול Escrow",
    descriptionEn: "Streamline title and escrow processes",
    icon: ClipboardCheck,
    features: ["הזמנת טייטל", "מעקב סטטוס", "מסמכים משותפים", "תזכורות"],
    featuresEn: ["Title Orders", "Status Tracking", "Shared Docs", "Reminders"],
    color: "from-slate-500 to-gray-600"
  },
  "inspection-scheduler": {
    betaKey: "ddl-inspection-scheduler-beta-views",
    title: "Inspection Scheduler",
    titleEn: "Home Inspection Coordination",
    description: "תיאום בדיקות נכסים עם מפקחים מוסמכים",
    descriptionEn: "Schedule and manage property inspections",
    icon: Search,
    features: ["מפקחים מוסמכים", "תיאום אוטומטי", "דוחות דיגיטליים", "מעקב תיקונים"],
    featuresEn: ["Certified Inspectors", "Auto Scheduling", "Digital Reports", "Repair Tracking"],
    color: "from-orange-500 to-red-600"
  },
  "repair-estimator": {
    betaKey: "ddl-repair-estimator-beta-views",
    title: "Repair Estimator",
    titleEn: "Renovation Cost Calculator",
    description: "הערכת עלויות שיפוץ ותיקונים",
    descriptionEn: "Estimate repair and renovation costs",
    icon: Wrench,
    features: ["הערכת עלויות", "קבלנים מומלצים", "השוואת הצעות", "לוחות זמנים"],
    featuresEn: ["Cost Estimates", "Contractor Referrals", "Quote Comparison", "Timelines"],
    color: "from-amber-500 to-orange-600"
  },
  "moving-services": {
    betaKey: "ddl-moving-services-beta-views",
    title: "Moving Services",
    titleEn: "Moving Company Directory",
    description: "חיבור לחברות הובלה ושירותי מעבר",
    descriptionEn: "Connect clients with movers",
    icon: Truck,
    features: ["חברות הובלה", "הצעות מחיר", "דירוגים", "תיאום מועדים"],
    featuresEn: ["Moving Companies", "Quotes", "Ratings", "Date Coordination"],
    color: "from-blue-500 to-indigo-600"
  },
  "utility-setup": {
    betaKey: "ddl-utility-setup-beta-views",
    title: "Utility Setup",
    titleEn: "Utility Transfer Assistance",
    description: "סיוע בהעברת חשמל, מים ושירותים נוספים",
    descriptionEn: "Help clients set up utilities quickly",
    icon: Zap,
    features: ["העברת שירותים", "רשימת ספקים", "תזכורות", "טפסים דיגיטליים"],
    featuresEn: ["Service Transfer", "Provider List", "Reminders", "Digital Forms"],
    color: "from-yellow-500 to-amber-600"
  },
  "home-warranty": {
    betaKey: "ddl-home-warranty-beta-views",
    title: "Home Warranty",
    titleEn: "Home Warranty Solutions",
    description: "הצעות אחריות לבית ומעקב תביעות",
    descriptionEn: "Offer warranty options to clients",
    icon: ShieldCheck,
    features: ["השוואת תוכניות", "הצעות מחיר", "ניהול תביעות", "חידוש אוטומטי"],
    featuresEn: ["Plan Comparison", "Quotes", "Claim Management", "Auto Renewal"],
    color: "from-green-500 to-teal-600"
  },
  "insurance-quotes": {
    betaKey: "ddl-insurance-quotes-beta-views",
    title: "Insurance Quotes",
    titleEn: "Home Insurance Marketplace",
    description: "הצעות ביטוח דירה מחברות מובילות",
    descriptionEn: "Get quotes from top insurance providers",
    icon: Shield,
    features: ["הצעות מחיר", "השוואת כיסויים", "חיבור לסוכנים", "מעקב פוליסות"],
    featuresEn: ["Price Quotes", "Coverage Comparison", "Agent Connect", "Policy Tracking"],
    color: "from-blue-500 to-cyan-600"
  },
  "photo-scheduler": {
    betaKey: "ddl-photo-scheduler-beta-views",
    title: "Photography Scheduler",
    titleEn: "Professional Photo Booking",
    description: "הזמנת צילום מקצועי לנכסים",
    descriptionEn: "Book professional property photographers",
    icon: Camera,
    features: ["צלמים מקצועיים", "תיאום אוטומטי", "גלריה דיגיטלית", "עריכה"],
    featuresEn: ["Pro Photographers", "Auto Scheduling", "Digital Gallery", "Editing"],
    color: "from-purple-500 to-pink-600"
  },
  "drone-services": {
    betaKey: "ddl-drone-services-beta-views",
    title: "Drone Services",
    titleEn: "Aerial Photography Booking",
    description: "צילום אווירי מקצועי בדרונים",
    descriptionEn: "Book aerial photography and video",
    icon: Plane,
    features: ["צילום אווירי", "וידאו HD", "עריכה מקצועית", "תיאום מועדים"],
    featuresEn: ["Aerial Shots", "HD Video", "Pro Editing", "Date Scheduling"],
    color: "from-sky-500 to-blue-600"
  },
  "floor-plan": {
    betaKey: "ddl-floor-plan-beta-views",
    title: "Floor Plan Creator",
    titleEn: "Interactive Floor Plans",
    description: "יצירת תוכניות קומה אינטראקטיביות",
    descriptionEn: "Create professional floor plans",
    icon: Layers,
    features: ["יצירה מהירה", "2D ו-3D", "מידות מדויקות", "ייצוא PDF"],
    featuresEn: ["Quick Creation", "2D & 3D", "Accurate Dimensions", "PDF Export"],
    color: "from-indigo-500 to-purple-600"
  },
  "tour-3d": {
    betaKey: "ddl-tour-3d-beta-views",
    title: "3D Tour Builder",
    titleEn: "Virtual 3D Property Tours",
    description: "בניית סיורים וירטואליים ב-360°",
    descriptionEn: "Create immersive 3D property tours",
    icon: Video,
    features: ["סיורים 360°", "הוספת Hotspots", "שיתוף קל", "אנליטיקס"],
    featuresEn: ["360° Tours", "Hotspot Addition", "Easy Sharing", "Analytics"],
    color: "from-violet-500 to-fuchsia-600"
  },
  "video-marketing": {
    betaKey: "ddl-video-marketing-beta-views",
    title: "Video Marketing",
    titleEn: "Real Estate Video Tools",
    description: "כלי וידאו שיווקי לנכסים",
    descriptionEn: "Create engaging property videos",
    icon: Video,
    features: ["עריכת וידאו", "תבניות מוכנות", "מוזיקה מותאמת", "שיתוף לרשתות"],
    featuresEn: ["Video Editing", "Ready Templates", "Licensed Music", "Social Sharing"],
    color: "from-red-500 to-pink-600"
  },
  "brochure-designer": {
    betaKey: "ddl-brochure-designer-beta-views",
    title: "Brochure Designer",
    titleEn: "Property Brochure Creator",
    description: "עיצוב חוברות נכסים מקצועיות",
    descriptionEn: "Design beautiful property brochures",
    icon: Printer,
    features: ["תבניות יפות", "מיתוג אישי", "ייצוא PDF", "הדפסה"],
    featuresEn: ["Beautiful Templates", "Personal Branding", "PDF Export", "Print Ready"],
    color: "from-amber-500 to-orange-600"
  },
  "postcard-mailer": {
    betaKey: "ddl-postcard-mailer-beta-views",
    title: "Postcard Mailer",
    titleEn: "Direct Mail Campaigns",
    description: "משלוח גלויות ודואר ישיר לשטח",
    descriptionEn: "Send postcards to your farm area",
    icon: Send,
    features: ["עיצוב גלויות", "רשימות תפוצה", "משלוח אוטומטי", "מעקב מסירה"],
    featuresEn: ["Postcard Design", "Mailing Lists", "Auto Send", "Delivery Tracking"],
    color: "from-blue-500 to-indigo-600"
  },
  "door-knocker": {
    betaKey: "ddl-door-knocker-beta-views",
    title: "Door Knocker Route",
    titleEn: "Optimized Canvassing Routes",
    description: "תכנון מסלולי דפיקת דלתות אופטימליים",
    descriptionEn: "Plan efficient door-to-door routes",
    icon: Map,
    features: ["מסלולים אופטימליים", "מפות אינטראקטיביות", "מעקב ביקורים", "הערות שטח"],
    featuresEn: ["Optimal Routes", "Interactive Maps", "Visit Tracking", "Field Notes"],
    color: "from-green-500 to-emerald-600"
  },
  "farm-area": {
    betaKey: "ddl-farm-area-beta-views",
    title: "Farm Area Manager",
    titleEn: "Geographic Farming Tools",
    description: "ניהול אזורי פעילות גאוגרפיים",
    descriptionEn: "Manage and track your farm areas",
    icon: MapPin,
    features: ["הגדרת אזורים", "מעקב בעלי נכסים", "היסטוריית מכירות", "קמפיינים ממוקדים"],
    featuresEn: ["Zone Definition", "Owner Tracking", "Sales History", "Targeted Campaigns"],
    color: "from-teal-500 to-green-600"
  },
  "fsbo-finder": {
    betaKey: "ddl-fsbo-finder-beta-views",
    title: "FSBO Finder",
    titleEn: "For Sale By Owner Leads",
    description: "איתור בעלי נכסים המוכרים עצמאית",
    descriptionEn: "Find FSBO listings for prospecting",
    icon: Search,
    features: ["איתור אוטומטי", "פרטי קשר", "סקריפטים מוכנים", "מעקב פניות"],
    featuresEn: ["Auto Detection", "Contact Info", "Ready Scripts", "Outreach Tracking"],
    color: "from-orange-500 to-red-600"
  },
  "expired-listings": {
    betaKey: "ddl-expired-listings-beta-views",
    title: "Expired Listing Tracker",
    titleEn: "Expired & Withdrawn Leads",
    description: "מעקב נכסים שפג תוקפם או הורדו מהמכירה",
    descriptionEn: "Track expired and withdrawn listings",
    icon: RotateCcw,
    features: ["התראות יומיות", "היסטוריית נכסים", "סקריפטים", "מעקב פניות"],
    featuresEn: ["Daily Alerts", "Property History", "Scripts", "Outreach Tracking"],
    color: "from-red-500 to-rose-600"
  },
  "investor-finder": {
    betaKey: "ddl-investor-finder-beta-views",
    title: "Investor Finder",
    titleEn: "Real Estate Investor Database",
    description: "מציאת משקיעי נדל\"ן פעילים",
    descriptionEn: "Connect with active real estate investors",
    icon: Briefcase,
    features: ["מאגר משקיעים", "פילטרים מתקדמים", "היסטוריית עסקאות", "התאמת נכסים"],
    featuresEn: ["Investor Database", "Advanced Filters", "Deal History", "Property Matching"],
    color: "from-amber-500 to-yellow-600"
  },
  "rental-analysis": {
    betaKey: "ddl-rental-analysis-beta-views",
    title: "Rental Analysis",
    titleEn: "Rental Income Calculator",
    description: "ניתוח הכנסות משכירות ותשואה",
    descriptionEn: "Calculate rental income and ROI",
    icon: BarChart3,
    features: ["חישוב תשואה", "השוואת נכסים", "תחזית שכירות", "דוחות משקיעים"],
    featuresEn: ["ROI Calculation", "Property Comparison", "Rent Forecast", "Investor Reports"],
    color: "from-green-500 to-teal-600"
  },
  "property-management": {
    betaKey: "ddl-property-management-beta-views",
    title: "Property Management",
    titleEn: "Rental Property Dashboard",
    description: "ניהול נכסים להשכרה",
    descriptionEn: "Manage rental properties efficiently",
    icon: Building2,
    features: ["ניהול דיירים", "גביית שכירות", "תחזוקה", "דוחות פיננסיים"],
    featuresEn: ["Tenant Management", "Rent Collection", "Maintenance", "Financial Reports"],
    color: "from-blue-500 to-indigo-600"
  },
  "tenant-screening": {
    betaKey: "ddl-tenant-screening-beta-views",
    title: "Tenant Screening",
    titleEn: "Background & Credit Checks",
    description: "בדיקת רקע ואשראי לדיירים פוטנציאליים",
    descriptionEn: "Screen tenants with background checks",
    icon: UserCheck,
    features: ["בדיקת אשראי", "בדיקת רקע", "אימות הכנסות", "דוחות מפורטים"],
    featuresEn: ["Credit Check", "Background Check", "Income Verification", "Detailed Reports"],
    color: "from-slate-500 to-gray-600"
  },
  "rent-collection": {
    betaKey: "ddl-rent-collection-beta-views",
    title: "Rent Collection",
    titleEn: "Online Rent Payments",
    description: "גביית שכירות אונליין אוטומטית",
    descriptionEn: "Collect rent payments online",
    icon: Banknote,
    features: ["תשלום אונליין", "הוראות קבע", "תזכורות", "דוחות גבייה"],
    featuresEn: ["Online Payment", "Auto-Pay", "Reminders", "Collection Reports"],
    color: "from-green-500 to-emerald-600"
  },
  "maintenance-tracker": {
    betaKey: "ddl-maintenance-tracker-beta-views",
    title: "Maintenance Tracker",
    titleEn: "Property Maintenance Hub",
    description: "מעקב תחזוקה ותיקונים בנכסים",
    descriptionEn: "Track and manage property maintenance",
    icon: Wrench,
    features: ["פתיחת קריאות", "מעקב סטטוס", "קבלנים מועדפים", "היסטוריה"],
    featuresEn: ["Open Tickets", "Status Tracking", "Preferred Vendors", "History"],
    color: "from-orange-500 to-amber-600"
  },
  "team-management": {
    betaKey: "ddl-team-management-beta-views",
    title: "Team Management",
    titleEn: "Real Estate Team Hub",
    description: "ניהול צוות סוכני נדל\"ן",
    descriptionEn: "Manage your real estate team",
    icon: Users,
    features: ["ניהול סוכנים", "חלוקת לידים", "מעקב ביצועים", "הרשאות"],
    featuresEn: ["Agent Management", "Lead Distribution", "Performance Tracking", "Permissions"],
    color: "from-purple-500 to-violet-600"
  },
  "agent-onboarding": {
    betaKey: "ddl-agent-onboarding-beta-views",
    title: "Agent Onboarding",
    titleEn: "New Agent Training System",
    description: "מערכת קליטת סוכנים חדשים",
    descriptionEn: "Streamline new agent onboarding",
    icon: UserPlus,
    features: ["רשימות משימות", "הדרכות וידאו", "מעקב התקדמות", "מנטורינג"],
    featuresEn: ["Task Checklists", "Video Training", "Progress Tracking", "Mentoring"],
    color: "from-blue-500 to-cyan-600"
  },
  "training-hub": {
    betaKey: "ddl-training-hub-beta-views",
    title: "Training Hub",
    titleEn: "Continuous Learning Platform",
    description: "פלטפורמת הדרכות והכשרות מתמשכות",
    descriptionEn: "Access training courses and resources",
    icon: BookOpen,
    features: ["קורסים אונליין", "וובינרים", "תעודות", "מעקב למידה"],
    featuresEn: ["Online Courses", "Webinars", "Certificates", "Learning Tracking"],
    color: "from-indigo-500 to-purple-600"
  },
  "performance-dashboard": {
    betaKey: "ddl-performance-dashboard-beta-views",
    title: "Performance Dashboard",
    titleEn: "Agent Performance Analytics",
    description: "דשבורד ביצועי סוכנים וצוות",
    descriptionEn: "Track individual and team performance",
    icon: LineChart,
    features: ["מדדי ביצוע", "השוואת סוכנים", "מגמות", "דוחות מנהלים"],
    featuresEn: ["KPI Metrics", "Agent Comparison", "Trends", "Manager Reports"],
    color: "from-teal-500 to-green-600"
  },
  "goal-tracker": {
    betaKey: "ddl-goal-tracker-beta-views",
    title: "Goal Tracker",
    titleEn: "Sales Goal Management",
    description: "הגדרת ומעקב יעדי מכירות",
    descriptionEn: "Set and track sales goals",
    icon: Award,
    features: ["הגדרת יעדים", "מעקב התקדמות", "תחרויות צוות", "תגמולים"],
    featuresEn: ["Goal Setting", "Progress Tracking", "Team Competitions", "Rewards"],
    color: "from-amber-500 to-yellow-600"
  },
  "review-manager": {
    betaKey: "ddl-review-manager-beta-views",
    title: "Review Manager",
    titleEn: "Online Reputation Manager",
    description: "ניהול ביקורות ומוניטין אונליין",
    descriptionEn: "Manage your online reviews",
    icon: Star,
    features: ["בקשת ביקורות", "מענה לביקורות", "ניטור מוניטין", "התראות"],
    featuresEn: ["Review Requests", "Reply to Reviews", "Reputation Monitoring", "Alerts"],
    color: "from-yellow-500 to-orange-600"
  },
  "ai-assistant": {
    betaKey: "ddl-ai-assistant-beta-views",
    title: "AI Assistant",
    titleEn: "Personal AI Real Estate Assistant",
    description: "עוזר AI אישי לסוכני נדל\"ן",
    descriptionEn: "Your personal AI assistant for real estate",
    icon: Bot,
    features: ["מענה לשאלות", "כתיבת תיאורים", "ניתוח שוק", "אוטומציות"],
    featuresEn: ["Answer Questions", "Write Descriptions", "Market Analysis", "Automations"],
    color: "from-violet-500 to-purple-600"
  },
  "market-news": {
    betaKey: "ddl-market-news-beta-views",
    title: "Market News Feed",
    titleEn: "Real Estate News Aggregator",
    description: "עדכוני חדשות נדל\"ן בזמן אמת",
    descriptionEn: "Stay updated with market news",
    icon: Newspaper,
    features: ["חדשות בזמן אמת", "פילטרים אישיים", "שיתוף קל", "התראות"],
    featuresEn: ["Real-time News", "Personal Filters", "Easy Sharing", "Alerts"],
    color: "from-blue-500 to-indigo-600"
  },
  "translation-pro": {
    betaKey: "ddl-translation-pro-beta-views",
    title: "Translation Pro",
    titleEn: "Multi-Language Support",
    description: "תרגום אוטומטי לתכנים ומסמכים",
    descriptionEn: "Translate content for international clients",
    icon: Languages,
    features: ["תרגום אוטומטי", "מסמכים", "תיאורי נכסים", "צ'אט רב-לשוני"],
    featuresEn: ["Auto Translation", "Documents", "Property Descriptions", "Multi-lingual Chat"],
    color: "from-cyan-500 to-blue-600"
  },
  "deal-analyzer": {
    betaKey: "ddl-deal-analyzer-beta-views",
    title: "Deal Analyzer",
    titleEn: "Investment Deal Analysis",
    description: "ניתוח עסקאות השקעה מתקדם",
    descriptionEn: "Analyze investment deals thoroughly",
    icon: Lightbulb,
    features: ["ניתוח תזרים", "חישוב Cap Rate", "השוואת עסקאות", "דוחות משקיעים"],
    featuresEn: ["Cash Flow Analysis", "Cap Rate Calc", "Deal Comparison", "Investor Reports"],
    color: "from-amber-500 to-orange-600"
  }
};

/**
 * Get plugin configuration by ID
 */
export function getPluginConfig(pluginId: string): PluginConfig | undefined {
  return pluginConfigs[pluginId];
}

/**
 * Get plugin title from URL path
 */
export function getPluginTitle(location: string): string | null {
  const match = location.match(/^\/admin\/plugin\/([^/]+)/);
  if (match) {
    const pluginId = match[1];
    const config = pluginConfigs[pluginId];
    return config ? config.title : null;
  }
  return null;
}
