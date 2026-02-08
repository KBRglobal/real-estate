import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertPageSchema, insertMiniSiteSchema, insertMediaSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { requireAuth, requireAdmin } from "./auth";
import r2UploadRoutes from "./routes/r2-uploads";
import { isR2Configured } from "./services/cloudflare-r2";
import aiAssistRoutes, { isAIConfigured } from "./routes/ai-assist";
import chatRoutes from "./routes/chat";
import mediaRoutes from "./routes/media";

// Sanitize string input to prevent XSS - strips dangerous patterns, idempotent
function sanitizeString(value: string): string {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')
    .trim();
}

// Legacy alias used by prospect content update endpoint
const sanitizeInput = sanitizeString;

// Decode HTML entities from previously-encoded stored data (backward compat)
function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&amp;/g, "&");
}

// Sanitize object recursively - handles arrays and nested objects
function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => {
        if (typeof item === "string") return sanitizeString(item);
        if (item !== null && typeof item === "object") return sanitizeObject(item as Record<string, unknown>);
        return item;
      });
    } else if (value !== null && typeof value === "object") {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register Cloudflare R2 routes
  app.use("/api/r2", r2UploadRoutes);

  // Register AI assist routes
  app.use("/api/ai", aiAssistRoutes);

  // Register chat routes
  app.use("/api/chat", chatRoutes);

  // Register media management routes (unified R2 + DB)
  app.use("/api/media", mediaRoutes);

  if (isR2Configured()) {
    console.log("✅ Cloudflare R2 - אחסון תמונות מוגדר");
  } else {
    console.log("⚠️  Cloudflare R2 - לא מוגדר");
  }

  // Log AI configuration
  if (isAIConfigured()) {
    console.log("✅ Google Gemini AI - מוגדר לסיוע בכתיבה");
  } else {
    console.log("⚠️  Google Gemini AI - לא מוגדר (GOOGLE_API_KEY חסר)");
  }

  // Rate limiting is handled by express-rate-limit in index.ts

  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // SEO: Sitemap.xml
  app.get("/sitemap.xml", async (req, res) => {
    const baseUrl = `https://${req.get("host")}`;
    const lastMod = new Date().toISOString().split("T")[0];
    
    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "weekly" },
      { url: "/real-estate-dubai/", priority: "0.9", changefreq: "weekly" },
      { url: "/real-estate-dubai/investment/", priority: "0.8", changefreq: "monthly" },
      { url: "/real-estate-dubai/areas/", priority: "0.8", changefreq: "monthly" },
      { url: "/real-estate-dubai/prices/", priority: "0.8", changefreq: "weekly" },
      { url: "/real-estate-dubai/tax-regulation/", priority: "0.8", changefreq: "monthly" },
      { url: "/real-estate-dubai/faq/", priority: "0.8", changefreq: "monthly" },
      { url: "/legal/privacy", priority: "0.3", changefreq: "yearly" },
      { url: "/legal/terms", priority: "0.3", changefreq: "yearly" },
      { url: "/legal/disclaimer", priority: "0.3", changefreq: "yearly" },
    ];

    // Dynamic project pages - only include published/active projects
    let projectUrls: { url: string; priority: string; changefreq: string }[] = [];
    try {
      const projects = await storage.getAllProjects();
      projectUrls = projects
        .filter((p) => p.slug && p.status === "active") // Only active/published projects
        .map((p) => ({
          url: `/project/${p.slug}`,
          priority: "0.7",
          changefreq: "weekly",
        }));
    } catch (error) {
      console.error("Error fetching projects for sitemap:", error);
    }

    const allPages = [...staticPages, ...projectUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(xml);
  });

  // SEO: Robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = `https://${req.get("host")}`;
    const robotsTxt = `User-agent: *
Allow: /

# SEO Content Hub
Allow: /real-estate-dubai/
Allow: /real-estate-dubai/investment/
Allow: /real-estate-dubai/areas/
Allow: /real-estate-dubai/prices/
Allow: /real-estate-dubai/tax-regulation/
Allow: /real-estate-dubai/faq/

# Block admin pages
Disallow: /admin
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml`;

    res.set("Content-Type", "text/plain");
    res.send(robotsTxt);
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const allProjects = await storage.getAllProjects();
      // Check if request is from admin (authenticated) - show all projects
      // Otherwise, only show active (published) projects
      const isAdmin = req.user?.role === "admin";
      const filteredProjects = isAdmin
        ? allProjects
        : allProjects.filter(p => p.status === "active" || !p.status); // Show active or legacy projects without status

      // Parse pagination parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

      const total = filteredProjects.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedProjects = filteredProjects.slice(startIndex, startIndex + limit);

      res.json({
        success: true,
        data: paginatedProjects,
        total,
        page,
        pages
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ success: false, error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/featured", async (req, res) => {
    try {
      const allFeatured = await storage.getFeaturedProjects();
      // Only show active (published) featured projects to public
      const filteredProjects = allFeatured.filter(p => p.status === "active" || !p.status);
      res.json({ success: true, data: filteredProjects });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch featured projects" });
    }
  });

  // Search projects with filters
  app.get("/api/projects/search", async (req, res) => {
    try {
      const allProjects = await storage.getAllProjects();
      const isAdmin = req.user?.role === "admin";

      // Start with active projects for public, all projects for admin
      let filteredProjects = isAdmin
        ? allProjects
        : allProjects.filter(p => p.status === "active" || !p.status);

      // Apply filters
      const { priceMin, priceMax, location, propertyType, status } = req.query;

      if (priceMin) {
        const minPrice = parseFloat(priceMin as string);
        if (!isNaN(minPrice)) {
          filteredProjects = filteredProjects.filter(p => (p.priceFrom || 0) >= minPrice);
        }
      }

      if (priceMax) {
        const maxPrice = parseFloat(priceMax as string);
        if (!isNaN(maxPrice)) {
          filteredProjects = filteredProjects.filter(p => (p.priceFrom || Infinity) <= maxPrice);
        }
      }

      if (location) {
        const locationLower = (location as string).toLowerCase();
        filteredProjects = filteredProjects.filter(p =>
          p.location?.toLowerCase().includes(locationLower)
        );
      }

      if (propertyType) {
        const typeLower = (propertyType as string).toLowerCase();
        filteredProjects = filteredProjects.filter(p =>
          p.propertyType?.toLowerCase() === typeLower
        );
      }

      if (status && isAdmin) {
        filteredProjects = filteredProjects.filter(p => p.status === status);
      }

      // Pagination
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

      const total = filteredProjects.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedProjects = filteredProjects.slice(startIndex, startIndex + limit);

      res.json({
        success: true,
        data: paginatedProjects,
        total,
        page,
        pages
      });
    } catch (error) {
      console.error("Error searching projects:", error);
      res.status(500).json({ success: false, error: "Failed to search projects" });
    }
  });

  app.get("/api/projects/slug/:slug", async (req, res) => {
    try {
      const project = await storage.getProjectBySlug(req.params.slug);
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch project" });
    }
  });

  // Get draft projects (protected) - MUST be before :id to avoid "drafts" matching as an id
  app.get("/api/projects/drafts", requireAuth, async (req, res) => {
    try {
      const allProjects = await storage.getAllProjects();
      const drafts = allProjects
        .filter(p => p.status === "draft")
        .sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
      res.json({ success: true, data: drafts });
    } catch (error) {
      console.error("Error fetching drafts:", error);
      res.status(500).json({ success: false, error: "Failed to fetch drafts" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch project" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      // Honeypot anti-spam check - if hidden field is filled, it's a bot
      if (req.body.website_url || req.body.company_fax) {
        return res.status(201).json({ success: true, data: { id: "ok" }, message: "Lead created successfully" });
      }

      // Sanitize input before validation
      const sanitizedBody = sanitizeObject(req.body);

      // Whitelist only public-facing fields - block admin-only fields like status, priority, assignedTo, tags
      const allowedPublicFields = ['name', 'phone', 'email', 'investmentGoal', 'budgetRange', 'timeline', 'experience', 'message', 'source', 'sourceType', 'sourceId', 'interestedProjectId'];
      const publicData: Record<string, unknown> = {};
      for (const field of allowedPublicFields) {
        if (sanitizedBody[field] !== undefined) {
          publicData[field] = sanitizedBody[field];
        }
      }

      const parsed = insertLeadSchema.safeParse(publicData);
      if (!parsed.success) {
        const validationError = fromZodError(parsed.error);
        return res.status(400).json({ success: false, error: validationError.message });
      }

      const lead = await storage.createLead(parsed.data);
      res.status(201).json({
        success: true,
        data: { id: lead.id },
        message: "Lead created successfully"
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      // Handle FK validation errors
      if (error instanceof Error && error.message.includes("Invalid interestedProjectId")) {
        return res.status(400).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: "Failed to create lead" });
    }
  });

  // Get all leads (protected - contains personal data)
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      // Parse pagination parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

      const allLeads = await storage.getAllLeads();
      const total = allLeads.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedLeads = allLeads.slice(startIndex, startIndex + limit);

      res.json({
        success: true,
        data: paginatedLeads,
        total,
        page,
        pages
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch leads" });
    }
  });

  // Update lead (protected)
  app.put("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);

      const updateLeadSchema = insertLeadSchema.partial();
      const validation = updateLeadSchema.safeParse(sanitizedBody);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: "Validation failed", message: validation.error.errors.map(e => e.message).join(", ") });
      }

      const updated = await storage.updateLead(req.params.id, validation.data);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ success: false, error: "Failed to update lead" });
    }
  });

  // Get single lead (protected - contains personal data)
  app.get("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const lead = await storage.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }
      res.json({ success: true, data: lead });
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ success: false, error: "Failed to fetch lead" });
    }
  });

  // Delete lead (protected)
  app.delete("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteLead(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }
      res.json({ success: true, message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ success: false, error: "Failed to delete lead" });
    }
  });

  // =====================
  // Lead Notes API
  // =====================
  app.get("/api/leads/:leadId/notes", requireAuth, async (req, res) => {
    try {
      const notes = await storage.getLeadNotes(req.params.leadId);
      res.json({ success: true, data: notes });
    } catch (error) {
      console.error("Error fetching lead notes:", error);
      res.status(500).json({ success: false, error: "Failed to fetch lead notes" });
    }
  });

  app.post("/api/leads/:leadId/notes", requireAuth, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const note = await storage.createLeadNote({
        ...sanitizedBody,
        leadId: req.params.leadId
      });
      res.status(201).json({ success: true, data: note, message: "Note created successfully" });
    } catch (error) {
      console.error("Error creating lead note:", error);
      res.status(500).json({ success: false, error: "Failed to create lead note" });
    }
  });

  app.delete("/api/leads/:leadId/notes/:noteId", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteLeadNote(req.params.noteId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Note not found" });
      }
      res.json({ success: true, message: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead note:", error);
      res.status(500).json({ success: false, error: "Failed to delete lead note" });
    }
  });

  // =====================
  // Lead Reminders API
  // =====================
  app.get("/api/leads/:leadId/reminders", requireAuth, async (req, res) => {
    try {
      const reminders = await storage.getLeadReminders(req.params.leadId);
      res.json({ success: true, data: reminders });
    } catch (error) {
      console.error("Error fetching lead reminders:", error);
      res.status(500).json({ success: false, error: "Failed to fetch lead reminders" });
    }
  });

  app.get("/api/reminders/pending", requireAuth, async (req, res) => {
    try {
      const reminders = await storage.getAllPendingReminders();
      res.json({ success: true, data: reminders });
    } catch (error) {
      console.error("Error fetching pending reminders:", error);
      res.status(500).json({ success: false, error: "Failed to fetch pending reminders" });
    }
  });

  app.post("/api/leads/:leadId/reminders", requireAuth, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);

      // Validate dueDate is a valid date string
      if (isNaN(new Date(sanitizedBody.dueDate as string).getTime())) {
        return res.status(400).json({ success: false, error: "תאריך לא תקין" });
      }

      const reminder = await storage.createLeadReminder({
        ...sanitizedBody,
        leadId: req.params.leadId,
        dueDate: new Date(sanitizedBody.dueDate as string)
      });
      res.status(201).json({ success: true, data: reminder, message: "Reminder created successfully" });
    } catch (error) {
      console.error("Error creating lead reminder:", error);
      res.status(500).json({ success: false, error: "Failed to create lead reminder" });
    }
  });

  app.put("/api/leads/:leadId/reminders/:reminderId", requireAuth, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      if (sanitizedBody.dueDate) {
        sanitizedBody.dueDate = new Date(sanitizedBody.dueDate as string);
      }
      const updated = await storage.updateLeadReminder(req.params.reminderId, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Reminder not found" });
      }
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("Error updating lead reminder:", error);
      res.status(500).json({ success: false, error: "Failed to update lead reminder" });
    }
  });

  app.delete("/api/leads/:leadId/reminders/:reminderId", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteLeadReminder(req.params.reminderId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Reminder not found" });
      }
      res.json({ success: true, message: "Reminder deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead reminder:", error);
      res.status(500).json({ success: false, error: "Failed to delete lead reminder" });
    }
  });

  // =====================
  // Translations API
  // =====================
  const translationsStore: Map<string, { he: string; en: string }> = new Map();

  // Initialize translations from default data
  const defaultTranslations: Record<string, { he: string; en: string }> = {
    "nav.home": { he: "דף הבית", en: "Home" },
    "nav.projects": { he: "פרויקטים", en: "Projects" },
    "nav.process": { he: "תהליך ההשקעה", en: "Investment Process" },
    "nav.whyDubai": { he: "למה דובאי", en: "Why Dubai" },
    "nav.contact": { he: "צור קשר", en: "Contact" },
    "nav.freeConsultation": { he: "שיחת ייעוץ חינם", en: "Free Consultation" },
    "hero.title1": { he: "השקעות נדל״ן בדובאי", en: "Dubai Real Estate Investments" },
    "hero.subtitle1": { he: "פשוט. שקוף. מסודר.", en: "Simple. Transparent. Organized." },
    "hero.cta": { he: "התחל השקעה", en: "Start Investing" },
    "hero.calculator": { he: "מחשבון ROI", en: "ROI Calculator" },
    "about.title": { he: "מי אנחנו", en: "About Us" },
    "about.subtitle": { he: "DDL - הדרך שלך להשקעה חכמה בדובאי", en: "DDL - Your Path to Smart Dubai Investment" },
    "whyDubai.title": { he: "למה דובאי?", en: "Why Dubai?" },
    "whyDubai.subtitle": { he: "הזדמנות השקעה ייחודית", en: "Unique Investment Opportunity" },
    "whyDubai.tax.title": { he: "0% מס הכנסה", en: "0% Income Tax" },
    "whyDubai.tax.desc": { he: "ללא מס על רווחי הון או הכנסות משכירות", en: "No tax on capital gains or rental income" },
    "whyDubai.yield.title": { he: "תשואות גבוהות", en: "High Yields" },
    "whyDubai.yield.desc": { he: "תשואה ממוצעת של 8-12% על השכרת נכסים", en: "Average yield of 8-12% on rental properties" },
    "process.title": { he: "תהליך ההשקעה", en: "Investment Process" },
    "process.subtitle": { he: "5 צעדים פשוטים להשקעה מוצלחת", en: "5 Simple Steps to Successful Investment" },
    "contact.title": { he: "צור קשר", en: "Contact Us" },
    "contact.subtitle": { he: "מעוניינים לשמוע עוד? השאירו פרטים ונחזור אליכם", en: "Interested? Leave your details and we'll get back to you" },
    "contact.name": { he: "שם מלא", en: "Full Name" },
    "contact.phone": { he: "טלפון", en: "Phone" },
    "contact.email": { he: "אימייל", en: "Email" },
    "contact.message": { he: "הודעה", en: "Message" },
    "contact.send": { he: "שלח הודעה", en: "Send Message" },
    "footer.rights": { he: "כל הזכויות שמורות", en: "All Rights Reserved" },
    "projects.title": { he: "הפרויקטים שלנו", en: "Our Projects" },
    "projects.subtitle": { he: "מגוון הזדמנויות השקעה מובילות", en: "Leading Investment Opportunities" },
  };

  // Initialize store with default translations
  for (const [key, value] of Object.entries(defaultTranslations)) {
    translationsStore.set(key, value);
  }

  app.get("/api/translations", async (req, res) => {
    try {
      const translations = Array.from(translationsStore.entries()).map(([key, value]) => ({
        key,
        he: value.he,
        en: value.en,
      }));
      res.json({ success: true, data: translations });
    } catch (error) {
      console.error("Error fetching translations:", error);
      res.status(500).json({ success: false, error: "Failed to fetch translations" });
    }
  });

  app.put("/api/translations/:key", requireAdmin, async (req, res) => {
    try {
      const key = decodeURIComponent(req.params.key);
      const { he, en } = req.body;
      translationsStore.set(key, { he, en });
      res.json({ key, he, en });
    } catch (error) {
      console.error("Error updating translation:", error);
      res.status(500).json({ error: "Failed to update translation" });
    }
  });

  // Create project (admin only)
  app.post("/api/projects", requireAdmin, async (req, res) => {
    try {
      const bodySize = JSON.stringify(req.body).length;
      console.log(`[create-project] Received request, body size: ${bodySize} bytes`);

      const sanitizedBody = sanitizeObject(req.body);
      console.log(`[create-project] Sanitized body for: "${sanitizedBody.name}"`);

      // Server-side validation for required fields
      const isDraft = sanitizedBody.status === "draft";
      const errors: string[] = [];
      if (!sanitizedBody.name?.trim()) {
        errors.push("שם הפרויקט הוא שדה חובה");
      }
      // For non-draft projects, require developer and location
      if (!isDraft) {
        if (!sanitizedBody.developer?.trim()) {
          errors.push("שם היזם הוא שדה חובה");
        }
        if (!sanitizedBody.location?.trim()) {
          errors.push("מיקום הוא שדה חובה");
        }
      }
      if (sanitizedBody.priceFrom !== undefined && sanitizedBody.priceFrom !== null && sanitizedBody.priceFrom !== 0) {
        const priceFromNum = Number(sanitizedBody.priceFrom);
        if (isNaN(priceFromNum) || priceFromNum < 0) {
          errors.push("מחיר התחלתי חייב להיות מספר חיובי");
        }
      }
      if (!sanitizedBody.propertyType?.trim()) {
        sanitizedBody.propertyType = "apartment";
      }

      // Validate new project fields
      if (sanitizedBody.constructionProgress !== undefined && sanitizedBody.constructionProgress !== null) {
        const cp = Number(sanitizedBody.constructionProgress);
        if (isNaN(cp) || cp < 0 || cp > 100) {
          errors.push("אחוז התקדמות בנייה חייב להיות בין 0 ל-100");
        }
      }
      const validProjectStatuses = ["off-plan", "under-construction", "ready-to-move", "completed"];
      if (sanitizedBody.projectStatus && !validProjectStatuses.includes(sanitizedBody.projectStatus)) {
        errors.push("סטטוס פרויקט לא תקין. ערכים אפשריים: off-plan, under-construction, ready-to-move, completed");
      }
      const validOwnership = ["freehold", "leasehold"];
      if (sanitizedBody.ownership && !validOwnership.includes(sanitizedBody.ownership)) {
        errors.push("סוג בעלות לא תקין. ערכים אפשריים: freehold, leasehold");
      }

      // Default priceFrom to 0 if not provided (DB requires NOT NULL)
      if (sanitizedBody.priceFrom === undefined || sanitizedBody.priceFrom === null || sanitizedBody.priceFrom === "") {
        sanitizedBody.priceFrom = 0;
      } else {
        sanitizedBody.priceFrom = Number(sanitizedBody.priceFrom);
      }

      if (errors.length > 0) {
        console.log(`[create-project] Validation failed: ${errors.join(", ")}`);
        return res.status(400).json({
          success: false,
          error: "שדות חובה חסרים",
          message: errors.join(", ")
        });
      }

      // Handle duplicate slugs
      if (sanitizedBody.slug) {
        let slug = sanitizedBody.slug;
        let existing = await storage.getProjectBySlug(slug);
        let suffix = 2;
        while (existing) {
          slug = `${sanitizedBody.slug}-${suffix}`;
          existing = await storage.getProjectBySlug(slug);
          suffix++;
        }
        sanitizedBody.slug = slug;
        console.log(`[create-project] Using slug: "${slug}"`);
      }

      console.log(`[create-project] Inserting into database...`);
      const project = await storage.createProject(sanitizedBody);
      console.log(`[create-project] Created project id=${project.id}, slug=${project.slug}`);
      res.status(201).json({ success: true, data: project, message: "Project created successfully" });
    } catch (error) {
      console.error("[create-project] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ success: false, error: "Failed to create project", message: errorMessage });
    }
  });

  // Update project (admin only)
  app.put("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      const bodySize = JSON.stringify(req.body).length;
      console.log(`[update-project] id=${req.params.id}, body size: ${bodySize} bytes`);

      const sanitizedBody = sanitizeObject(req.body);

      // Validate new project fields on update
      const updateErrors: string[] = [];
      if (sanitizedBody.constructionProgress !== undefined && sanitizedBody.constructionProgress !== null) {
        const cp = Number(sanitizedBody.constructionProgress);
        if (isNaN(cp) || cp < 0 || cp > 100) {
          updateErrors.push("אחוז התקדמות בנייה חייב להיות בין 0 ל-100");
        }
      }
      const validProjectStatuses = ["off-plan", "under-construction", "ready-to-move", "completed"];
      if (sanitizedBody.projectStatus && !validProjectStatuses.includes(sanitizedBody.projectStatus)) {
        updateErrors.push("סטטוס פרויקט לא תקין. ערכים אפשריים: off-plan, under-construction, ready-to-move, completed");
      }
      const validOwnership = ["freehold", "leasehold"];
      if (sanitizedBody.ownership && !validOwnership.includes(sanitizedBody.ownership)) {
        updateErrors.push("סוג בעלות לא תקין. ערכים אפשריים: freehold, leasehold");
      }
      if (updateErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: "שגיאות ולידציה",
          message: updateErrors.join(", ")
        });
      }

      const updated = await storage.updateProject(req.params.id, sanitizedBody);
      if (!updated) {
        console.log(`[update-project] Not found: ${req.params.id}`);
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      console.log(`[update-project] Updated project id=${updated.id}`);
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("[update-project] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ success: false, error: "Failed to update project", message: errorMessage });
    }
  });

  // Delete project (admin only)
  app.delete("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ success: false, error: "Failed to delete project" });
    }
  });

  app.get("/api/config/mapbox", (req, res) => {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Mapbox token not configured" });
    }
    res.json({ token });
  });

  // =====================
  // Pages API
  // =====================
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getAllPages();
      res.json({ success: true, data: pages });
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ success: false, error: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:id", async (req, res) => {
    try {
      const page = await storage.getPageById(req.params.id);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  app.post("/api/pages", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const parsed = insertPageSchema.safeParse(sanitizedBody);
      if (!parsed.success) {
        const validationError = fromZodError(parsed.error);
        return res.status(400).json({ success: false, error: validationError.message });
      }
      const page = await storage.createPage(parsed.data);
      res.status(201).json({ success: true, data: page });
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(500).json({ success: false, error: "Failed to create page" });
    }
  });

  app.put("/api/pages/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updatePage(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  app.delete("/api/pages/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deletePage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  // =====================
  // Media API
  // =====================
  app.get("/api/media", async (req, res) => {
    try {
      const mediaItems = await storage.getAllMedia();
      res.json({ success: true, data: mediaItems });
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ success: false, error: "Failed to fetch media" });
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const mediaItem = await storage.getMediaById(req.params.id);
      if (!mediaItem) {
        return res.status(404).json({ error: "Media not found" });
      }
      res.json(mediaItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  app.post("/api/media", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const parsed = insertMediaSchema.safeParse(sanitizedBody);
      if (!parsed.success) {
        const validationError = fromZodError(parsed.error);
        return res.status(400).json({ success: false, error: validationError.message });
      }
      const mediaItem = await storage.createMedia(parsed.data);
      res.status(201).json({ success: true, data: mediaItem });
    } catch (error) {
      console.error("Error creating media:", error);
      res.status(500).json({ success: false, error: "Failed to create media" });
    }
  });

  app.put("/api/media/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updateMedia(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Media not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating media:", error);
      res.status(500).json({ error: "Failed to update media" });
    }
  });

  app.delete("/api/media/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteMedia(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Media not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ error: "Failed to delete media" });
    }
  });

  // =====================
  // Mini-Sites API
  // =====================
  app.get("/api/mini-sites", async (req, res) => {
    try {
      const miniSites = await storage.getAllMiniSites();
      res.json({ success: true, data: miniSites });
    } catch (error) {
      console.error("Error fetching mini-sites:", error);
      res.status(500).json({ success: false, error: "Failed to fetch mini-sites" });
    }
  });

  app.get("/api/mini-sites/:id", async (req, res) => {
    try {
      const miniSite = await storage.getMiniSiteById(req.params.id);
      if (!miniSite) {
        return res.status(404).json({ error: "Mini-site not found" });
      }
      res.json(miniSite);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mini-site" });
    }
  });

  app.get("/api/mini-sites/slug/:slug", async (req, res) => {
    try {
      const miniSite = await storage.getMiniSiteBySlug(req.params.slug);
      if (!miniSite) {
        return res.status(404).json({ error: "Mini-site not found" });
      }
      // Increment views
      await storage.incrementMiniSiteViews(miniSite.id);
      res.json(miniSite);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mini-site" });
    }
  });

  app.post("/api/mini-sites", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const parsed = insertMiniSiteSchema.safeParse(sanitizedBody);
      if (!parsed.success) {
        const validationError = fromZodError(parsed.error);
        return res.status(400).json({ success: false, error: validationError.message });
      }
      const miniSite = await storage.createMiniSite(parsed.data);
      res.status(201).json({ success: true, data: miniSite });
    } catch (error) {
      console.error("Error creating mini-site:", error);
      res.status(500).json({ success: false, error: "Failed to create mini-site" });
    }
  });

  app.put("/api/mini-sites/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updateMiniSite(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Mini-site not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating mini-site:", error);
      res.status(500).json({ error: "Failed to update mini-site" });
    }
  });

  app.delete("/api/mini-sites/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteMiniSite(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Mini-site not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting mini-site:", error);
      res.status(500).json({ error: "Failed to delete mini-site" });
    }
  });

  // Export all mini-sites as JSON (for syncing to production)
  app.get("/api/mini-sites/admin/export", requireAdmin, async (req, res) => {
    try {
      const miniSites = await storage.getAllMiniSites();
      res.json({
        exportedAt: new Date().toISOString(),
        count: miniSites.length,
        miniSites: miniSites
      });
    } catch (error) {
      console.error("Error exporting mini-sites:", error);
      res.status(500).json({ error: "Failed to export mini-sites" });
    }
  });

  // Import mini-sites from JSON (for syncing from development)
  app.post("/api/mini-sites/admin/import", requireAdmin, async (req, res) => {
    try {
      const { miniSites, overwrite = false } = req.body;
      
      if (!Array.isArray(miniSites)) {
        return res.status(400).json({ error: "miniSites must be an array" });
      }

      const results = { imported: 0, skipped: 0, updated: 0, errors: [] as string[] };

      for (const site of miniSites) {
        try {
          // Check if mini-site with this slug already exists
          const existing = await storage.getMiniSiteBySlug(site.slug);
          
          if (existing) {
            if (overwrite) {
              // Update existing mini-site
              await storage.updateMiniSite(existing.id, {
                name: site.name,
                hero: site.hero,
                about: site.about,
                features: site.features,
                gallery: site.gallery,
                pricing: site.pricing,
                location: site.location,
                contact: site.contact,
                faq: site.faq,
                seo: site.seo,
                status: site.status
              });
              results.updated++;
            } else {
              results.skipped++;
            }
          } else {
            // Create new mini-site
            await storage.createMiniSite({
              name: site.name,
              slug: site.slug,
              projectId: site.projectId,
              status: site.status || "draft",
              templateId: site.templateId,
              hero: site.hero,
              about: site.about,
              features: site.features,
              gallery: site.gallery,
              pricing: site.pricing,
              location: site.location,
              contact: site.contact,
              faq: site.faq,
              seo: site.seo
            });
            results.imported++;
          }
        } catch (siteError: any) {
          results.errors.push(`${site.slug}: ${siteError.message}`);
        }
      }

      res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error("Error importing mini-sites:", error);
      res.status(500).json({ error: "Failed to import mini-sites" });
    }
  });

  // =====================
  // Prospects API
  // =====================
  app.get("/api/prospects", requireAuth, async (req, res) => {
    try {
      const prospects = await storage.getAllProspects();
      res.json({ success: true, data: prospects });
    } catch (error) {
      console.error("Error fetching prospects:", error);
      res.status(500).json({ success: false, error: "Failed to fetch prospects" });
    }
  });

  app.get("/api/prospects/:id", requireAuth, async (req, res) => {
    try {
      const prospect = await storage.getProspectById(req.params.id);
      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      res.json(prospect);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prospect" });
    }
  });

  app.post("/api/prospects", requireAuth, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const prospect = await storage.createProspect(sanitizedBody);
      res.status(201).json({ success: true, data: prospect, message: "Prospect created successfully" });
    } catch (error) {
      console.error("Error creating prospect:", error);
      // Handle FK validation errors
      if (error instanceof Error && error.message.includes("Invalid projectId")) {
        return res.status(400).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: "Failed to create prospect" });
    }
  });

  app.put("/api/prospects/:id", requireAuth, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updateProspect(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating prospect:", error);
      res.status(500).json({ error: "Failed to update prospect" });
    }
  });

  app.delete("/api/prospects/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteProspect(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting prospect:", error);
      res.status(500).json({ error: "Failed to delete prospect" });
    }
  });

  // File validation constants
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

  // Compute file hash for duplicate detection
  async function computeFileHash(buffer: Buffer): Promise<string> {
    const crypto = await import("crypto");
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  // Check for duplicate file by hash
  async function checkDuplicateFile(hash: string): Promise<{ isDuplicate: boolean; existingProspect?: any }> {
    const existing = await storage.getProspectByHash(hash);
    if (existing) {
      return { isDuplicate: true, existingProspect: existing };
    }
    return { isDuplicate: false };
  }

  // Validate PDF file
  function validatePdfBuffer(buffer: Buffer): { valid: boolean; error?: string } {
    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `הקובץ גדול מדי. גודל מקסימלי: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Check magic bytes (PDF signature)
    if (buffer.length < 4) {
      return { valid: false, error: "הקובץ ריק או פגום" };
    }

    const header = buffer.slice(0, 4);
    if (!header.equals(PDF_MAGIC_BYTES)) {
      return {
        valid: false,
        error: "הקובץ אינו קובץ PDF תקין",
      };
    }

    return { valid: true };
  }

  function isPrivateUrl(urlString: string): boolean {
    try {
      const parsed = new URL(urlString);
      const hostname = parsed.hostname.toLowerCase();
      // Block localhost and common private hostnames
      if (hostname === "localhost" || hostname === "[::1]") return true;
      // Block private IP ranges
      const ipParts = hostname.split(".").map(Number);
      if (ipParts.length === 4 && ipParts.every(n => !isNaN(n))) {
        if (ipParts[0] === 127) return true; // 127.x.x.x
        if (ipParts[0] === 10) return true; // 10.x.x.x
        if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) return true; // 172.16-31.x.x
        if (ipParts[0] === 192 && ipParts[1] === 168) return true; // 192.168.x.x
        if (ipParts[0] === 169 && ipParts[1] === 254) return true; // 169.254.x.x
        if (ipParts[0] === 0) return true; // 0.x.x.x
      }
      return false;
    } catch {
      return true; // If URL can't be parsed, block it
    }
  }

  async function fetchPdfFromStorage(fileUrl: string): Promise<Buffer> {
    const decodedUrl = decodeHtmlEntities(fileUrl);

    if (!decodedUrl.startsWith("http")) {
      throw new Error("Invalid file URL format - only HTTP URLs are supported");
    }

    if (isPrivateUrl(decodedUrl)) {
      throw new Error("Access to private/internal URLs is not allowed");
    }

    const response = await fetch(decodedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = validatePdfBuffer(buffer);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return buffer;
  }

  // Process prospect PDF with AI (protected)
  app.post("/api/prospects/:id/process", requireAuth, async (req, res) => {
    try {
      const { processProspect, getProspectProcessingStatus } = await import("./services/prospect-processor");
      const prospect = await storage.getProspectById(req.params.id);

      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }

      if (!prospect.fileUrl) {
        return res.status(400).json({ error: "No PDF file associated with this prospect" });
      }

      // Fetch PDF from storage and start processing
      const pdfBuffer = await fetchPdfFromStorage(prospect.fileUrl);

      // Compute hash and check for duplicates
      const fileHash = await computeFileHash(pdfBuffer);
      const duplicateCheck = await checkDuplicateFile(fileHash);

      if (duplicateCheck.isDuplicate && duplicateCheck.existingProspect?.id !== req.params.id) {
        return res.status(409).json({
          error: "קובץ זהה כבר הועלה בעבר",
          existingProspectId: duplicateCheck.existingProspect.id,
          existingFileName: duplicateCheck.existingProspect.fileName,
        });
      }

      // Save the hash to the prospect
      await storage.updateProspect(req.params.id, { fileHash });

      // Start processing in background and return immediately
      processProspect(req.params.id, pdfBuffer).catch(err => {
        console.error("Background processing error:", err);
      });

      const status = await getProspectProcessingStatus(req.params.id);

      res.json({
        message: "Processing started",
        prospectId: req.params.id,
        currentStatus: status
      });
    } catch (error) {
      console.error("Error processing prospect:", error);
      res.status(500).json({ error: "Failed to process prospect" });
    }
  });

  // Process prospect with SSE for real-time updates (protected)
  app.get("/api/prospects/:id/process-stream", requireAuth, async (req, res) => {
    try {
      const { processProspect } = await import("./services/prospect-processor");
      const prospect = await storage.getProspectById(req.params.id);
      
      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }

      if (!prospect.fileUrl) {
        return res.status(400).json({ error: "No PDF file associated with this prospect" });
      }

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const pdfBuffer = await fetchPdfFromStorage(prospect.fileUrl);
      
      const result = await processProspect(
        req.params.id,
        pdfBuffer,
        (update) => {
          res.write(`data: ${JSON.stringify(update)}\n\n`);
        }
      );

      // Send completion with projectSlug for navigation
      res.write(`data: ${JSON.stringify({
        type: "complete",
        success: result.success,
        projectSlug: result.projectSlug,
        error: result.error
      })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error processing prospect:", error);
      const errorMsg = error instanceof Error ? error.message : "שגיאה בעיבוד הקובץ";
      res.write(`data: ${JSON.stringify({ type: "error", message: errorMsg })}\n\n`);
      res.end();
    }
  });

  // Get processing status
  app.get("/api/prospects/:id/status", requireAuth, async (req, res) => {
    try {
      const { getProspectProcessingStatus } = await import("./services/prospect-processor");
      const status = await getProspectProcessingStatus(req.params.id);
      res.json(status);
    } catch (error) {
      console.error("Error getting prospect status:", error);
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  // Create mini-site from processed prospect (protected)
  app.post("/api/prospects/:id/create-minisite", requireAuth, async (req, res) => {
    try {
      const { createMiniSiteFromProspect } = await import("./services/prospect-processor");
      const result = await createMiniSiteFromProspect(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json({ 
        success: true, 
        miniSiteId: result.miniSiteSlug, // Return slug for URL navigation (legacy compatibility)
        miniSiteSlug: result.miniSiteSlug,
        message: "Mini-site created successfully"
      });
    } catch (error) {
      console.error("Error creating mini-site:", error);
      res.status(500).json({ error: "Failed to create mini-site" });
    }
  });

  // Reprocess prospect and recreate mini-site (protected)
  app.post("/api/prospects/:id/reprocess", requireAuth, async (req, res) => {
    try {
      const { processProspect, createMiniSiteFromProspect } = await import("./services/prospect-processor");
      const prospect = await storage.getProspectById(req.params.id);

      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }

      if (!prospect.fileUrl) {
        return res.status(400).json({ error: "No PDF file associated with this prospect" });
      }

      // Store original status for rollback
      const originalStatus = prospect.status;
      const originalGeneratedSections = prospect.generatedSections as Record<string, unknown> | null;
      const originalMiniSiteId = prospect.miniSiteId;
      const originalMiniSiteSlug = prospect.miniSiteSlug;

      // Delete existing mini-site if exists
      if (prospect.miniSiteId) {
        await storage.deleteMiniSite(prospect.miniSiteId);
      }

      // Reset prospect status to allow reprocessing
      await storage.updateProspect(req.params.id, {
        status: "uploaded",
        generatedSections: null,
        miniSiteId: null,
        miniSiteSlug: null
      });

      // Fetch PDF and reprocess (auto-creates project now)
      const pdfBuffer = await fetchPdfFromStorage(prospect.fileUrl);

      try {
        const result = await processProspect(req.params.id, pdfBuffer);

        if (!result.success) {
          // Rollback prospect status on failure
          await storage.updateProspect(req.params.id, {
            status: originalStatus,
            generatedSections: originalGeneratedSections,
            miniSiteId: originalMiniSiteId,
            miniSiteSlug: originalMiniSiteSlug
          });
          return res.status(400).json({ error: result.error });
        }

        res.json({
          success: true,
          message: "עובד מחדש בהצלחה - הפרויקט עודכן",
          projectSlug: result.projectSlug,
          // Legacy mini-site support (project is now auto-created)
          miniSiteSlug: result.projectSlug
        });
      } catch (processError) {
        // Rollback prospect status on processing error
        await storage.updateProspect(req.params.id, {
          status: originalStatus,
          generatedSections: originalGeneratedSections,
          miniSiteId: originalMiniSiteId,
          miniSiteSlug: originalMiniSiteSlug
        });
        throw processError;
      }
    } catch (error) {
      console.error("Error reprocessing prospect:", error);
      res.status(500).json({ error: "Failed to reprocess prospect" });
    }
  });

  // Retry failed prospect processing (protected)
  app.post("/api/prospects/:id/retry", requireAuth, async (req, res) => {
    try {
      const { processProspect } = await import("./services/prospect-processor");
      const prospect = await storage.getProspectById(req.params.id);

      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }

      // Only allow retry for failed prospects
      if (prospect.status !== "failed") {
        return res.status(400).json({
          error: "Only failed prospects can be retried",
          currentStatus: prospect.status
        });
      }

      if (!prospect.fileUrl) {
        return res.status(400).json({ error: "No PDF file associated with this prospect" });
      }

      // Increment retry count
      const retryCount = ((prospect as any).retryCount || 0) + 1;
      await storage.updateProspect(req.params.id, {
        status: "processing",
        lastError: null,
        retryCount,
      });

      // Fetch PDF and reprocess
      const pdfBuffer = await fetchPdfFromStorage(prospect.fileUrl);
      const result = await processProspect(req.params.id, pdfBuffer);

      if (!result.success) {
        await storage.updateProspect(req.params.id, {
          status: "failed",
          lastError: result.error,
        });
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: "עיבוד מחדש הושלם בהצלחה",
        projectSlug: result.projectSlug,
        miniSiteSlug: result.miniSiteSlug,
        retryCount,
      });
    } catch (error) {
      console.error("Error retrying prospect:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await storage.updateProspect(req.params.id, {
        status: "failed",
        lastError: errorMessage,
      });
      res.status(500).json({ error: "Failed to retry prospect processing" });
    }
  });

  // Update prospect content after extraction (protected)
  app.put("/api/prospects/:id/content", requireAuth, async (req, res) => {
    try {
      const prospect = await storage.getProspectById(req.params.id);

      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }

      // Only allow editing for ready or failed prospects
      if (!["ready", "failed", "extracted", "mapped"].includes(prospect.status || "")) {
        return res.status(400).json({
          error: "Can only edit content after extraction",
          currentStatus: prospect.status,
        });
      }

      const { generatedSections, generatedTitle, generatedDescription } = req.body;

      // Validate that at least one field is provided
      if (!generatedSections && !generatedTitle && !generatedDescription) {
        return res.status(400).json({
          error: "At least one field must be provided for update",
        });
      }

      // Build update object
      const updateData: Record<string, unknown> = {};
      if (generatedSections) {
        updateData.generatedSections = generatedSections;
      }
      if (generatedTitle) {
        updateData.generatedTitle = sanitizeInput(generatedTitle);
      }
      if (generatedDescription) {
        updateData.generatedDescription = sanitizeInput(generatedDescription);
      }

      const updated = await storage.updateProspect(req.params.id, updateData);

      res.json({
        success: true,
        message: "התוכן עודכן בהצלחה",
        prospect: updated,
      });
    } catch (error) {
      console.error("Error updating prospect content:", error);
      res.status(500).json({ error: "Failed to update prospect content" });
    }
  });

  // Create project from processed prospect (protected)
  app.post("/api/prospects/:id/create-project", requireAuth, async (req, res) => {
    try {
      const { createProjectFromProspect } = await import("./services/prospect-processor");
      const result = await createProjectFromProspect(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json({ 
        success: true, 
        projectId: result.projectId,
        projectSlug: result.projectSlug,
        message: "Project created successfully"
      });
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // =====================
  // Users API (admin only)
  // =====================
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't return passwords
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      // Hash the password before storing
      const { hashPassword } = await import("./auth");
      if (sanitizedBody.password) {
        sanitizedBody.password = await hashPassword(sanitizedBody.password as string);
      }
      const user = await storage.createUser(sanitizedBody);
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      // Hash new password if provided
      if (sanitizedBody.password) {
        const { hashPassword } = await import("./auth");
        sanitizedBody.password = await hashPassword(sanitizedBody.password as string);
      }
      const updated = await storage.updateUser(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // =====================
  // Templates API
  // =====================
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/type/:type", async (req, res) => {
    try {
      const templates = await storage.getTemplatesByType(req.params.type);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const template = await storage.createTemplate(sanitizedBody);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updateTemplate(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // =====================
  // Global Areas API
  // =====================
  app.get("/api/global-areas", async (req, res) => {
    try {
      const areas = await storage.getAllGlobalAreas();
      res.json(areas);
    } catch (error) {
      console.error("Error fetching global areas:", error);
      res.status(500).json({ error: "Failed to fetch global areas" });
    }
  });

  app.get("/api/global-areas/type/:type", async (req, res) => {
    try {
      const area = await storage.getGlobalAreaByType(req.params.type);
      if (!area) {
        return res.status(404).json({ error: "Global area not found" });
      }
      res.json(area);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch global area" });
    }
  });

  app.post("/api/global-areas", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const area = await storage.createGlobalArea(sanitizedBody);
      res.status(201).json(area);
    } catch (error) {
      console.error("Error creating global area:", error);
      res.status(500).json({ error: "Failed to create global area" });
    }
  });

  app.put("/api/global-areas/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updateGlobalArea(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Global area not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating global area:", error);
      res.status(500).json({ error: "Failed to update global area" });
    }
  });

  // =====================
  // Languages API
  // =====================
  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await storage.getAllLanguages();
      res.json(languages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      res.status(500).json({ error: "Failed to fetch languages" });
    }
  });

  app.get("/api/languages/active", async (req, res) => {
    try {
      const languages = await storage.getActiveLanguages();
      res.json(languages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active languages" });
    }
  });

  app.post("/api/languages", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const language = await storage.createLanguage(sanitizedBody);
      res.status(201).json(language);
    } catch (error) {
      console.error("Error creating language:", error);
      res.status(500).json({ error: "Failed to create language" });
    }
  });

  app.put("/api/languages/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updateLanguage(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Language not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating language:", error);
      res.status(500).json({ error: "Failed to update language" });
    }
  });

  app.delete("/api/languages/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteLanguage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Language not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting language:", error);
      res.status(500).json({ error: "Failed to delete language" });
    }
  });

  // =====================
  // Translations API
  // =====================
  app.get("/api/translations/:entityType/:entityId", async (req, res) => {
    try {
      const translations = await storage.getTranslations(
        req.params.entityType,
        req.params.entityId
      );
      res.json(translations);
    } catch (error) {
      console.error("Error fetching translations:", error);
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  app.post("/api/translations", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const translation = await storage.setTranslation(sanitizedBody);
      res.status(201).json(translation);
    } catch (error) {
      console.error("Error creating translation:", error);
      res.status(500).json({ error: "Failed to create translation" });
    }
  });

  // =====================
  // Site Stats API (Dynamic Statistics)
  // =====================
  app.get("/api/site-stats", async (req, res) => {
    try {
      const stats = await storage.getAllSiteStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching site stats:", error);
      res.status(500).json({ error: "Failed to fetch site stats" });
    }
  });

  app.get("/api/site-stats/:id", async (req, res) => {
    try {
      const stat = await storage.getSiteStatById(req.params.id);
      if (!stat) {
        return res.status(404).json({ error: "Stat not found" });
      }
      res.json(stat);
    } catch (error) {
      console.error("Error fetching site stat:", error);
      res.status(500).json({ error: "Failed to fetch site stat" });
    }
  });

  app.post("/api/site-stats", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const stat = await storage.createSiteStat(sanitizedBody);
      res.status(201).json(stat);
    } catch (error) {
      console.error("Error creating site stat:", error);
      res.status(500).json({ error: "Failed to create site stat" });
    }
  });

  app.put("/api/site-stats/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updateSiteStat(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Stat not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating site stat:", error);
      res.status(500).json({ error: "Failed to update site stat" });
    }
  });

  app.delete("/api/site-stats/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSiteStat(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Stat not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting site stat:", error);
      res.status(500).json({ error: "Failed to delete site stat" });
    }
  });

  // =====================
  // Investment Zones API
  // =====================
  app.get("/api/investment-zones", async (req, res) => {
    try {
      const zones = await storage.getActiveInvestmentZones();
      res.json(zones);
    } catch (error) {
      console.error("Error fetching investment zones:", error);
      res.status(500).json({ error: "Failed to fetch investment zones" });
    }
  });

  app.get("/api/investment-zones/all", requireAuth, async (req, res) => {
    try {
      const zones = await storage.getAllInvestmentZones();
      res.json(zones);
    } catch (error) {
      console.error("Error fetching all investment zones:", error);
      res.status(500).json({ error: "Failed to fetch investment zones" });
    }
  });

  app.get("/api/investment-zones/:id", async (req, res) => {
    try {
      const zone = await storage.getInvestmentZoneById(req.params.id);
      if (!zone) {
        return res.status(404).json({ error: "Investment zone not found" });
      }
      res.json(zone);
    } catch (error) {
      console.error("Error fetching investment zone:", error);
      res.status(500).json({ error: "Failed to fetch investment zone" });
    }
  });

  app.post("/api/investment-zones", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const zone = await storage.createInvestmentZone(sanitizedBody);
      res.status(201).json(zone);
    } catch (error) {
      console.error("Error creating investment zone:", error);
      res.status(500).json({ error: "Failed to create investment zone" });
    }
  });

  app.put("/api/investment-zones/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updateInvestmentZone(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Investment zone not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating investment zone:", error);
      res.status(500).json({ error: "Failed to update investment zone" });
    }
  });

  app.delete("/api/investment-zones/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteInvestmentZone(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Investment zone not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting investment zone:", error);
      res.status(500).json({ error: "Failed to delete investment zone" });
    }
  });

  // =====================
  // Case Studies API
  // =====================
  app.get("/api/case-studies", async (req, res) => {
    try {
      const studies = await storage.getActiveCaseStudies();
      res.json(studies);
    } catch (error) {
      console.error("Error fetching case studies:", error);
      res.status(500).json({ error: "Failed to fetch case studies" });
    }
  });

  app.get("/api/case-studies/all", requireAuth, async (req, res) => {
    try {
      const studies = await storage.getAllCaseStudies();
      res.json(studies);
    } catch (error) {
      console.error("Error fetching all case studies:", error);
      res.status(500).json({ error: "Failed to fetch case studies" });
    }
  });

  app.get("/api/case-studies/:id", async (req, res) => {
    try {
      const study = await storage.getCaseStudyById(req.params.id);
      if (!study) {
        return res.status(404).json({ error: "Case study not found" });
      }
      res.json(study);
    } catch (error) {
      console.error("Error fetching case study:", error);
      res.status(500).json({ error: "Failed to fetch case study" });
    }
  });

  app.post("/api/case-studies", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const study = await storage.createCaseStudy(sanitizedBody);
      res.status(201).json(study);
    } catch (error) {
      console.error("Error creating case study:", error);
      res.status(500).json({ error: "Failed to create case study" });
    }
  });

  app.put("/api/case-studies/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updateCaseStudy(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Case study not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating case study:", error);
      res.status(500).json({ error: "Failed to update case study" });
    }
  });

  app.delete("/api/case-studies/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteCaseStudy(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Case study not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting case study:", error);
      res.status(500).json({ error: "Failed to delete case study" });
    }
  });

  // =====================
  // Content Blocks API (CMS)
  // =====================
  app.get("/api/content-blocks", async (req, res) => {
    try {
      const blocks = await storage.getAllContentBlocks();
      res.json(blocks);
    } catch (error) {
      console.error("Error fetching content blocks:", error);
      res.status(500).json({ error: "Failed to fetch content blocks" });
    }
  });

  app.get("/api/content-blocks/section/:section", async (req, res) => {
    try {
      const blocks = await storage.getContentBlocksBySection(req.params.section);
      res.json(blocks);
    } catch (error) {
      console.error("Error fetching content blocks by section:", error);
      res.status(500).json({ error: "Failed to fetch content blocks" });
    }
  });

  app.get("/api/content-blocks/:id", async (req, res) => {
    try {
      const block = await storage.getContentBlockById(req.params.id);
      if (!block) {
        return res.status(404).json({ error: "Content block not found" });
      }
      res.json(block);
    } catch (error) {
      console.error("Error fetching content block:", error);
      res.status(500).json({ error: "Failed to fetch content block" });
    }
  });

  app.post("/api/content-blocks", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const block = await storage.createContentBlock(sanitizedBody);
      res.status(201).json(block);
    } catch (error) {
      console.error("Error creating content block:", error);
      res.status(500).json({ error: "Failed to create content block" });
    }
  });

  app.put("/api/content-blocks/:id", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const updated = await storage.updateContentBlock(req.params.id, sanitizedBody);
      if (!updated) {
        return res.status(404).json({ error: "Content block not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating content block:", error);
      res.status(500).json({ error: "Failed to update content block" });
    }
  });

  // Bulk upsert for content blocks (for homepage editor)
  app.post("/api/content-blocks/bulk-upsert", requireAdmin, async (req, res) => {
    try {
      const { blocks } = req.body;
      if (!Array.isArray(blocks)) {
        return res.status(400).json({ error: "blocks must be an array" });
      }

      const results = [];
      for (const block of blocks) {
        const sanitizedBlock = sanitizeObject(block);
        const result = await storage.upsertContentBlock(
          sanitizedBlock.section,
          sanitizedBlock.blockKey,
          sanitizedBlock
        );
        results.push(result);
      }

      res.json({ success: true, count: results.length, blocks: results });
    } catch (error) {
      console.error("Error bulk upserting content blocks:", error);
      res.status(500).json({ error: "Failed to bulk upsert content blocks" });
    }
  });

  app.delete("/api/content-blocks/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteContentBlock(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Content block not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting content block:", error);
      res.status(500).json({ error: "Failed to delete content block" });
    }
  });

  // =====================
  // Site Settings API
  // =====================
  app.get("/api/site-settings", async (req, res) => {
    try {
      const allSettings = await storage.getAllSettings();
      res.json(allSettings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ error: "Failed to fetch site settings" });
    }
  });

  app.get("/api/site-settings/category/:category", async (req, res) => {
    try {
      const categorySettings = await storage.getSettingsByCategory(req.params.category);
      res.json(categorySettings);
    } catch (error) {
      console.error("Error fetching settings by category:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/site-settings/key/:key", async (req, res) => {
    try {
      const setting = await storage.getSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.put("/api/site-settings/:key", requireAdmin, async (req, res) => {
    try {
      const { value, category } = req.body;

      // Check if setting exists
      const existing = await storage.getSettingByKey(req.params.key);

      if (existing) {
        const updated = await storage.updateSetting(req.params.key, value);
        res.json(updated);
      } else {
        // Create new setting
        const created = await storage.createSetting({
          key: req.params.key,
          value,
          category: category || "general",
        });
        res.status(201).json(created);
      }
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ error: "Failed to update site setting" });
    }
  });

  // Bulk update settings
  app.post("/api/site-settings/bulk-update", requireAdmin, async (req, res) => {
    try {
      const { settings: settingsToUpdate } = req.body;
      if (!Array.isArray(settingsToUpdate)) {
        return res.status(400).json({ error: "settings must be an array" });
      }

      const results = [];
      for (const setting of settingsToUpdate) {
        const { key, value, category } = setting;
        const existing = await storage.getSettingByKey(key);

        if (existing) {
          const updated = await storage.updateSetting(key, value);
          results.push(updated);
        } else {
          const created = await storage.createSetting({
            key,
            value,
            category: category || "general",
          });
          results.push(created);
        }
      }

      res.json({ success: true, count: results.length, settings: results });
    } catch (error) {
      console.error("Error bulk updating settings:", error);
      res.status(500).json({ error: "Failed to bulk update settings" });
    }
  });

  app.delete("/api/site-settings/:key", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSetting(req.params.key);
      if (!deleted) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting site setting:", error);
      res.status(500).json({ error: "Failed to delete site setting" });
    }
  });

  // =====================
  // Settings API (Unified Site Settings Object)
  // =====================

  // GET /api/settings - Returns current site settings (public, no auth required)
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      if (!settings) {
        // Return empty settings object if none exist yet
        return res.json({
          success: true,
          data: {
            brandName: null,
            email: null,
            phone: null,
            address: null,
            website: null,
            logoUrl: null,
            socialInstagram: null,
            socialFacebook: null,
            socialLinkedin: null,
            socialWhatsapp: null
          }
        });
      }
      res.json({ success: true, data: settings });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ success: false, error: "Failed to fetch settings" });
    }
  });

  // PUT /api/settings - Updates site settings (requires admin auth)
  app.put("/api/settings", requireAdmin, async (req, res) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);

      // Only allow updating specific fields
      const allowedFields = [
        'brandName', 'email', 'phone', 'address', 'website',
        'logoUrl', 'socialInstagram', 'socialFacebook', 'socialLinkedin', 'socialWhatsapp'
      ];

      const updateData: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (field in sanitizedBody) {
          updateData[field] = sanitizedBody[field];
        }
      }

      const updated = await storage.updateSiteSettings(updateData);
      res.json({ success: true, data: updated, message: "Settings updated successfully" });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ success: false, error: "Failed to update settings" });
    }
  });

  return httpServer;
}
