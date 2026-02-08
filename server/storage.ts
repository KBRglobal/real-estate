import {
  type User, type InsertUser,
  type Lead, type InsertLead,
  type LeadNote, type InsertLeadNote,
  type LeadReminder, type InsertLeadReminder,
  type Project, type InsertProject,
  type Page, type InsertPage,
  type Media, type InsertMedia,
  type MiniSite, type InsertMiniSite,
  type Prospect, type InsertProspect,
  type Template, type InsertTemplate,
  type GlobalArea, type InsertGlobalArea,
  type Language, type InsertLanguage,
  type Translation, type InsertTranslation,
  type SiteStat, type InsertSiteStat,
  type InvestmentZone, type InsertInvestmentZone,
  type CaseStudy, type InsertCaseStudy,
  type ContentBlock, type InsertContentBlock,
  type Settings, type InsertSettings,
  type SiteSettings, type InsertSiteSettings,
  users, leads, leadNotes, leadReminders, projects, pages, media, miniSites, prospects, templates, globalAreas, languages, translations,
  siteStats, investmentZones, caseStudies, contentBlocks, settings, siteSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// =====================
// Storage Interface
// =====================
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Projects
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  getFeaturedProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Leads
  getAllLeads(): Promise<Lead[]>;
  getLeadById(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;

  // Lead Notes
  getLeadNotes(leadId: string): Promise<LeadNote[]>;
  createLeadNote(note: InsertLeadNote): Promise<LeadNote>;
  deleteLeadNote(id: string): Promise<boolean>;

  // Lead Reminders
  getLeadReminders(leadId: string): Promise<LeadReminder[]>;
  getAllPendingReminders(): Promise<LeadReminder[]>;
  createLeadReminder(reminder: InsertLeadReminder): Promise<LeadReminder>;
  updateLeadReminder(id: string, data: Partial<InsertLeadReminder>): Promise<LeadReminder | undefined>;
  deleteLeadReminder(id: string): Promise<boolean>;

  // Pages
  getAllPages(): Promise<Page[]>;
  getPageById(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, data: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: string): Promise<boolean>;

  // Media
  getAllMedia(): Promise<Media[]>;
  getMediaById(id: string): Promise<Media | undefined>;
  getMediaByFolder(folder: string): Promise<Media[]>;
  createMedia(mediaItem: InsertMedia): Promise<Media>;
  updateMedia(id: string, data: Partial<InsertMedia>): Promise<Media | undefined>;
  deleteMedia(id: string): Promise<boolean>;

  // Mini-Sites
  getAllMiniSites(): Promise<MiniSite[]>;
  getMiniSiteById(id: string): Promise<MiniSite | undefined>;
  getMiniSiteBySlug(slug: string): Promise<MiniSite | undefined>;
  createMiniSite(miniSite: InsertMiniSite): Promise<MiniSite>;
  updateMiniSite(id: string, data: Partial<InsertMiniSite>): Promise<MiniSite | undefined>;
  deleteMiniSite(id: string): Promise<boolean>;
  incrementMiniSiteViews(id: string): Promise<void>;

  // Prospects
  getAllProspects(): Promise<Prospect[]>;
  getProspectById(id: string): Promise<Prospect | undefined>;
  getProspectByHash(hash: string): Promise<Prospect | undefined>;
  createProspect(prospect: InsertProspect): Promise<Prospect>;
  updateProspect(id: string, data: Partial<InsertProspect>): Promise<Prospect | undefined>;
  deleteProspect(id: string): Promise<boolean>;

  // Templates
  getAllTemplates(): Promise<Template[]>;
  getTemplateById(id: string): Promise<Template | undefined>;
  getTemplatesByType(type: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, data: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;

  // Global Areas
  getAllGlobalAreas(): Promise<GlobalArea[]>;
  getGlobalAreaById(id: string): Promise<GlobalArea | undefined>;
  getGlobalAreaByType(type: string): Promise<GlobalArea | undefined>;
  createGlobalArea(area: InsertGlobalArea): Promise<GlobalArea>;
  updateGlobalArea(id: string, data: Partial<InsertGlobalArea>): Promise<GlobalArea | undefined>;

  // Languages
  getAllLanguages(): Promise<Language[]>;
  getActiveLanguages(): Promise<Language[]>;
  createLanguage(language: InsertLanguage): Promise<Language>;
  updateLanguage(id: string, data: Partial<InsertLanguage>): Promise<Language | undefined>;
  deleteLanguage(id: string): Promise<boolean>;

  // Translations
  getTranslations(entityType: string, entityId: string): Promise<Translation[]>;
  getTranslation(entityType: string, entityId: string, languageCode: string, field: string): Promise<Translation | undefined>;
  setTranslation(translation: InsertTranslation): Promise<Translation>;

  // Site Stats
  getAllSiteStats(): Promise<SiteStat[]>;
  getSiteStatById(id: string): Promise<SiteStat | undefined>;
  getSiteStatByKey(key: string): Promise<SiteStat | undefined>;
  createSiteStat(stat: InsertSiteStat): Promise<SiteStat>;
  updateSiteStat(id: string, data: Partial<InsertSiteStat>): Promise<SiteStat | undefined>;
  deleteSiteStat(id: string): Promise<boolean>;

  // Investment Zones
  getAllInvestmentZones(): Promise<InvestmentZone[]>;
  getActiveInvestmentZones(): Promise<InvestmentZone[]>;
  getInvestmentZoneById(id: string): Promise<InvestmentZone | undefined>;
  createInvestmentZone(zone: InsertInvestmentZone): Promise<InvestmentZone>;
  updateInvestmentZone(id: string, data: Partial<InsertInvestmentZone>): Promise<InvestmentZone | undefined>;
  deleteInvestmentZone(id: string): Promise<boolean>;

  // Case Studies
  getAllCaseStudies(): Promise<CaseStudy[]>;
  getActiveCaseStudies(): Promise<CaseStudy[]>;
  getCaseStudyById(id: string): Promise<CaseStudy | undefined>;
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  updateCaseStudy(id: string, data: Partial<InsertCaseStudy>): Promise<CaseStudy | undefined>;
  deleteCaseStudy(id: string): Promise<boolean>;

  // Content Blocks
  getAllContentBlocks(): Promise<ContentBlock[]>;
  getContentBlocksBySection(section: string): Promise<ContentBlock[]>;
  getContentBlockById(id: string): Promise<ContentBlock | undefined>;
  getContentBlockBySectionAndKey(section: string, blockKey: string): Promise<ContentBlock | undefined>;
  createContentBlock(block: InsertContentBlock): Promise<ContentBlock>;
  updateContentBlock(id: string, data: Partial<InsertContentBlock>): Promise<ContentBlock | undefined>;
  deleteContentBlock(id: string): Promise<boolean>;
  upsertContentBlock(section: string, blockKey: string, data: Partial<InsertContentBlock>): Promise<ContentBlock>;

  // Site Settings
  getAllSettings(): Promise<Settings[]>;
  getSettingsByCategory(category: string): Promise<Settings[]>;
  getSettingByKey(key: string): Promise<Settings | undefined>;
  createSetting(setting: InsertSettings): Promise<Settings>;
  updateSetting(key: string, value: unknown): Promise<Settings | undefined>;
  deleteSetting(key: string): Promise<boolean>;

  // Site Settings (Single Row)
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings>;
}


// =====================
// Database Storage Implementation
// =====================
export class DatabaseStorage implements IStorage {
  private projectsCache: Map<string, Project> = new Map();
  private projectsCacheLoaded = false;

  private async loadProjectsCache() {
    if (this.projectsCacheLoaded) return;
    const allProjects = await db.select().from(projects);
    allProjects.forEach(p => this.projectsCache.set(p.id, p));
    this.projectsCacheLoaded = true;
  }

  // =====================
  // Users
  // =====================
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, id })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Projects
  // =====================
  async getAllProjects(): Promise<Project[]> {
    // Always return fresh data from database - no stale cache
    const dbProjects = await db.select().from(projects);
    // Update cache with current DB state
    this.projectsCache.clear();
    for (const p of dbProjects) {
      this.projectsCache.set(p.id, p);
    }
    this.projectsCacheLoaded = true;
    return dbProjects;
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    // Check cache first (if loaded)
    if (this.projectsCacheLoaded) {
      const cached = this.projectsCache.get(id);
      if (cached) return cached;
    }
    // Get from database
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    // Check cache first (if loaded)
    if (this.projectsCacheLoaded) {
      const cached = Array.from(this.projectsCache.values()).find((p) => p.slug === slug);
      if (cached) return cached;
    }
    // Get from database
    const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
    return project || undefined;
  }

  async getFeaturedProjects(): Promise<Project[]> {
    // Always get fresh data from database
    const dbFeatured = await db.select().from(projects).where(eq(projects.featured, true));
    return dbFeatured;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const [project] = await db
      .insert(projects)
      .values({ ...insertProject, id })
      .returning();
    this.projectsCache.set(id, project);
    return project;
  }

  async updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined> {
    await this.loadProjectsCache();
    const [updated] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    if (updated) {
      this.projectsCache.set(id, updated);
    }
    return updated || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    await this.loadProjectsCache();
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    if (result.length > 0) {
      this.projectsCache.delete(id);
      return true;
    }
    return false;
  }

  // =====================
  // Leads
  // =====================
  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    // FK validation: validate interestedProjectId exists if provided
    if (insertLead.interestedProjectId) {
      const project = await this.getProjectById(insertLead.interestedProjectId);
      if (!project) {
        throw new Error(`Invalid interestedProjectId: Project with ID "${insertLead.interestedProjectId}" does not exist`);
      }
    }

    const id = randomUUID();
    const [lead] = await db
      .insert(leads)
      .values({ ...insertLead, id })
      .returning();
    return lead;
  }

  async updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updated] = await db
      .update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLead(id: string): Promise<boolean> {
    return await db.transaction(async (tx) => {
      // Delete associated lead notes first
      await tx.delete(leadNotes).where(eq(leadNotes.leadId, id));
      // Delete associated lead reminders
      await tx.delete(leadReminders).where(eq(leadReminders.leadId, id));
      // Finally delete the lead itself
      const result = await tx.delete(leads).where(eq(leads.id, id)).returning();
      return result.length > 0;
    });
  }

  // =====================
  // Lead Notes
  // =====================
  async getLeadNotes(leadId: string): Promise<LeadNote[]> {
    return await db.select().from(leadNotes).where(eq(leadNotes.leadId, leadId));
  }

  async createLeadNote(insertNote: InsertLeadNote): Promise<LeadNote> {
    const id = randomUUID();
    const [note] = await db
      .insert(leadNotes)
      .values({ ...insertNote, id })
      .returning();
    return note;
  }

  async deleteLeadNote(id: string): Promise<boolean> {
    const result = await db.delete(leadNotes).where(eq(leadNotes.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Lead Reminders
  // =====================
  async getLeadReminders(leadId: string): Promise<LeadReminder[]> {
    return await db.select().from(leadReminders).where(eq(leadReminders.leadId, leadId));
  }

  async getAllPendingReminders(): Promise<LeadReminder[]> {
    return await db.select().from(leadReminders).where(eq(leadReminders.isCompleted, false));
  }

  async createLeadReminder(insertReminder: InsertLeadReminder): Promise<LeadReminder> {
    const id = randomUUID();
    const [reminder] = await db
      .insert(leadReminders)
      .values({ ...insertReminder, id })
      .returning();
    return reminder;
  }

  async updateLeadReminder(id: string, data: Partial<InsertLeadReminder>): Promise<LeadReminder | undefined> {
    const [updated] = await db
      .update(leadReminders)
      .set(data)
      .where(eq(leadReminders.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLeadReminder(id: string): Promise<boolean> {
    const result = await db.delete(leadReminders).where(eq(leadReminders.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Pages
  // =====================
  async getAllPages(): Promise<Page[]> {
    return await db.select().from(pages);
  }

  async getPageById(id: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page || undefined;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page || undefined;
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const id = randomUUID();
    const [page] = await db
      .insert(pages)
      .values({ ...insertPage, id })
      .returning();
    return page;
  }

  async updatePage(id: string, data: Partial<InsertPage>): Promise<Page | undefined> {
    const [updated] = await db
      .update(pages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePage(id: string): Promise<boolean> {
    const result = await db.delete(pages).where(eq(pages.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Media
  // =====================
  async getAllMedia(): Promise<Media[]> {
    return await db.select().from(media).orderBy(desc(media.createdAt));
  }

  async getMediaById(id: string): Promise<Media | undefined> {
    const [item] = await db.select().from(media).where(eq(media.id, id));
    return item || undefined;
  }

  async getMediaByFolder(folder: string): Promise<Media[]> {
    return await db
      .select()
      .from(media)
      .where(eq(media.folder, folder))
      .orderBy(desc(media.createdAt));
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = randomUUID();
    const [mediaItem] = await db
      .insert(media)
      .values({ ...insertMedia, id })
      .returning();
    return mediaItem;
  }

  async updateMedia(id: string, data: Partial<InsertMedia>): Promise<Media | undefined> {
    const [updated] = await db
      .update(media)
      .set({ ...data })
      .where(eq(media.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteMedia(id: string): Promise<boolean> {
    const result = await db.delete(media).where(eq(media.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Mini-Sites
  // =====================
  async getAllMiniSites(): Promise<MiniSite[]> {
    return await db.select().from(miniSites);
  }

  async getMiniSiteById(id: string): Promise<MiniSite | undefined> {
    const [site] = await db.select().from(miniSites).where(eq(miniSites.id, id));
    return site || undefined;
  }

  async getMiniSiteBySlug(slug: string): Promise<MiniSite | undefined> {
    const [site] = await db.select().from(miniSites).where(eq(miniSites.slug, slug));
    return site || undefined;
  }

  async createMiniSite(insertMiniSite: InsertMiniSite): Promise<MiniSite> {
    const id = randomUUID();
    const [site] = await db
      .insert(miniSites)
      .values({ ...insertMiniSite, id })
      .returning();
    return site;
  }

  async updateMiniSite(id: string, data: Partial<InsertMiniSite>): Promise<MiniSite | undefined> {
    const [updated] = await db
      .update(miniSites)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(miniSites.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteMiniSite(id: string): Promise<boolean> {
    const result = await db.delete(miniSites).where(eq(miniSites.id, id)).returning();
    return result.length > 0;
  }

  async incrementMiniSiteViews(id: string): Promise<void> {
    await db
      .update(miniSites)
      .set({ views: sql`COALESCE(${miniSites.views}, 0) + 1` })
      .where(eq(miniSites.id, id));
  }

  // =====================
  // Prospects
  // =====================
  async getAllProspects(): Promise<Prospect[]> {
    return await db.select().from(prospects);
  }

  async getProspectById(id: string): Promise<Prospect | undefined> {
    const [prospect] = await db.select().from(prospects).where(eq(prospects.id, id));
    return prospect || undefined;
  }

  async getProspectByHash(hash: string): Promise<Prospect | undefined> {
    const [prospect] = await db.select().from(prospects).where(eq(prospects.fileHash, hash));
    return prospect || undefined;
  }

  async createProspect(insertProspect: InsertProspect): Promise<Prospect> {
    // FK validation: validate projectId exists if provided
    if (insertProspect.projectId) {
      const project = await this.getProjectById(insertProspect.projectId);
      if (!project) {
        throw new Error(`Invalid projectId: Project with ID "${insertProspect.projectId}" does not exist`);
      }
    }

    const id = randomUUID();
    const [prospect] = await db
      .insert(prospects)
      .values({ ...insertProspect, id })
      .returning();
    return prospect;
  }

  async updateProspect(id: string, data: Partial<InsertProspect>): Promise<Prospect | undefined> {
    const [updated] = await db
      .update(prospects)
      .set(data)
      .where(eq(prospects.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProspect(id: string): Promise<boolean> {
    const result = await db.delete(prospects).where(eq(prospects.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Templates
  // =====================
  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getTemplateById(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getTemplatesByType(type: string): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.type, type));
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const [template] = await db
      .insert(templates)
      .values({ ...insertTemplate, id })
      .returning();
    return template;
  }

  async updateTemplate(id: string, data: Partial<InsertTemplate>): Promise<Template | undefined> {
    const [updated] = await db
      .update(templates)
      .set(data)
      .where(eq(templates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await db.delete(templates).where(eq(templates.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Global Areas
  // =====================
  async getAllGlobalAreas(): Promise<GlobalArea[]> {
    return await db.select().from(globalAreas);
  }

  async getGlobalAreaById(id: string): Promise<GlobalArea | undefined> {
    const [area] = await db.select().from(globalAreas).where(eq(globalAreas.id, id));
    return area || undefined;
  }

  async getGlobalAreaByType(type: string): Promise<GlobalArea | undefined> {
    const [area] = await db.select().from(globalAreas).where(eq(globalAreas.type, type));
    return area || undefined;
  }

  async createGlobalArea(insertArea: InsertGlobalArea): Promise<GlobalArea> {
    const id = randomUUID();
    const [area] = await db
      .insert(globalAreas)
      .values({ ...insertArea, id })
      .returning();
    return area;
  }

  async updateGlobalArea(id: string, data: Partial<InsertGlobalArea>): Promise<GlobalArea | undefined> {
    const [updated] = await db
      .update(globalAreas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(globalAreas.id, id))
      .returning();
    return updated || undefined;
  }

  // =====================
  // Languages
  // =====================
  async getAllLanguages(): Promise<Language[]> {
    return await db.select().from(languages);
  }

  async getActiveLanguages(): Promise<Language[]> {
    return await db.select().from(languages).where(eq(languages.isActive, true));
  }

  async createLanguage(insertLanguage: InsertLanguage): Promise<Language> {
    const id = randomUUID();
    const [language] = await db
      .insert(languages)
      .values({ ...insertLanguage, id })
      .returning();
    return language;
  }

  async updateLanguage(id: string, data: Partial<InsertLanguage>): Promise<Language | undefined> {
    const [updated] = await db
      .update(languages)
      .set(data)
      .where(eq(languages.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLanguage(id: string): Promise<boolean> {
    const result = await db.delete(languages).where(eq(languages.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Translations
  // =====================
  async getTranslations(entityType: string, entityId: string): Promise<Translation[]> {
    return await db
      .select()
      .from(translations)
      .where(and(eq(translations.entityType, entityType), eq(translations.entityId, entityId)));
  }

  async getTranslation(
    entityType: string,
    entityId: string,
    languageCode: string,
    field: string
  ): Promise<Translation | undefined> {
    const [translation] = await db
      .select()
      .from(translations)
      .where(
        and(
          eq(translations.entityType, entityType),
          eq(translations.entityId, entityId),
          eq(translations.languageCode, languageCode),
          eq(translations.field, field)
        )
      );
    return translation || undefined;
  }

  async setTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    // Check if translation exists
    const existing = await this.getTranslation(
      insertTranslation.entityType,
      insertTranslation.entityId,
      insertTranslation.languageCode,
      insertTranslation.field
    );

    if (existing) {
      // Update
      const [updated] = await db
        .update(translations)
        .set({ value: insertTranslation.value, updatedAt: new Date() })
        .where(eq(translations.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create
      const id = randomUUID();
      const [translation] = await db
        .insert(translations)
        .values({ ...insertTranslation, id })
        .returning();
      return translation;
    }
  }

  // =====================
  // Site Stats
  // =====================
  async getAllSiteStats(): Promise<SiteStat[]> {
    return await db.select().from(siteStats);
  }

  async getSiteStatById(id: string): Promise<SiteStat | undefined> {
    const [stat] = await db.select().from(siteStats).where(eq(siteStats.id, id));
    return stat || undefined;
  }

  async getSiteStatByKey(key: string): Promise<SiteStat | undefined> {
    const [stat] = await db.select().from(siteStats).where(eq(siteStats.key, key));
    return stat || undefined;
  }

  async createSiteStat(insertStat: InsertSiteStat): Promise<SiteStat> {
    const id = randomUUID();
    const [stat] = await db
      .insert(siteStats)
      .values({ ...insertStat, id })
      .returning();
    return stat;
  }

  async updateSiteStat(id: string, data: Partial<InsertSiteStat>): Promise<SiteStat | undefined> {
    const [updated] = await db
      .update(siteStats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(siteStats.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSiteStat(id: string): Promise<boolean> {
    const result = await db.delete(siteStats).where(eq(siteStats.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Investment Zones
  // =====================
  async getAllInvestmentZones(): Promise<InvestmentZone[]> {
    return await db.select().from(investmentZones);
  }

  async getActiveInvestmentZones(): Promise<InvestmentZone[]> {
    return await db.select().from(investmentZones).where(eq(investmentZones.isActive, true));
  }

  async getInvestmentZoneById(id: string): Promise<InvestmentZone | undefined> {
    const [zone] = await db.select().from(investmentZones).where(eq(investmentZones.id, id));
    return zone || undefined;
  }

  async createInvestmentZone(insertZone: InsertInvestmentZone): Promise<InvestmentZone> {
    const id = randomUUID();
    const [zone] = await db
      .insert(investmentZones)
      .values({ ...insertZone, id })
      .returning();
    return zone;
  }

  async updateInvestmentZone(id: string, data: Partial<InsertInvestmentZone>): Promise<InvestmentZone | undefined> {
    const [updated] = await db
      .update(investmentZones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(investmentZones.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteInvestmentZone(id: string): Promise<boolean> {
    const result = await db.delete(investmentZones).where(eq(investmentZones.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Case Studies
  // =====================
  async getAllCaseStudies(): Promise<CaseStudy[]> {
    return await db.select().from(caseStudies);
  }

  async getActiveCaseStudies(): Promise<CaseStudy[]> {
    return await db.select().from(caseStudies).where(eq(caseStudies.isActive, true));
  }

  async getCaseStudyById(id: string): Promise<CaseStudy | undefined> {
    const [study] = await db.select().from(caseStudies).where(eq(caseStudies.id, id));
    return study || undefined;
  }

  async createCaseStudy(insertStudy: InsertCaseStudy): Promise<CaseStudy> {
    const id = randomUUID();
    const [study] = await db
      .insert(caseStudies)
      .values({ ...insertStudy, id })
      .returning();
    return study;
  }

  async updateCaseStudy(id: string, data: Partial<InsertCaseStudy>): Promise<CaseStudy | undefined> {
    const [updated] = await db
      .update(caseStudies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(caseStudies.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCaseStudy(id: string): Promise<boolean> {
    const result = await db.delete(caseStudies).where(eq(caseStudies.id, id)).returning();
    return result.length > 0;
  }

  // =====================
  // Content Blocks
  // =====================
  async getAllContentBlocks(): Promise<ContentBlock[]> {
    return await db.select().from(contentBlocks);
  }

  async getContentBlocksBySection(section: string): Promise<ContentBlock[]> {
    return await db.select().from(contentBlocks).where(eq(contentBlocks.section, section));
  }

  async getContentBlockById(id: string): Promise<ContentBlock | undefined> {
    const [block] = await db.select().from(contentBlocks).where(eq(contentBlocks.id, id));
    return block || undefined;
  }

  async getContentBlockBySectionAndKey(section: string, blockKey: string): Promise<ContentBlock | undefined> {
    const [block] = await db.select().from(contentBlocks).where(
      and(eq(contentBlocks.section, section), eq(contentBlocks.blockKey, blockKey))
    );
    return block || undefined;
  }

  async createContentBlock(insertBlock: InsertContentBlock): Promise<ContentBlock> {
    const id = randomUUID();
    const [block] = await db
      .insert(contentBlocks)
      .values({ ...insertBlock, id })
      .returning();
    return block;
  }

  async updateContentBlock(id: string, data: Partial<InsertContentBlock>): Promise<ContentBlock | undefined> {
    const [updated] = await db
      .update(contentBlocks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contentBlocks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteContentBlock(id: string): Promise<boolean> {
    const result = await db.delete(contentBlocks).where(eq(contentBlocks.id, id)).returning();
    return result.length > 0;
  }

  async upsertContentBlock(section: string, blockKey: string, data: Partial<InsertContentBlock>): Promise<ContentBlock> {
    const existing = await this.getContentBlockBySectionAndKey(section, blockKey);
    if (existing) {
      const updated = await this.updateContentBlock(existing.id, data);
      return updated!;
    } else {
      return await this.createContentBlock({
        section,
        blockKey,
        ...data,
      } as InsertContentBlock);
    }
  }

  // =====================
  // Site Settings
  // =====================
  async getAllSettings(): Promise<Settings[]> {
    return await db.select().from(settings);
  }

  async getSettingsByCategory(category: string): Promise<Settings[]> {
    return await db.select().from(settings).where(eq(settings.category, category));
  }

  async getSettingByKey(key: string): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async createSetting(insertSetting: InsertSettings): Promise<Settings> {
    const id = randomUUID();
    const [setting] = await db
      .insert(settings)
      .values({ ...insertSetting, id })
      .returning();
    return setting;
  }

  async updateSetting(key: string, value: unknown): Promise<Settings | undefined> {
    const existing = await this.getSettingByKey(key);
    if (!existing) {
      // Create new setting if it doesn't exist
      const [setting] = await db
        .insert(settings)
        .values({ id: randomUUID(), key, value: value as never, updatedAt: new Date() })
        .returning();
      return setting;
    }
    const [updated] = await db
      .update(settings)
      .set({ value: value as never, updatedAt: new Date() })
      .where(eq(settings.key, key))
      .returning();
    return updated || undefined;
  }

  async deleteSetting(key: string): Promise<boolean> {
    const result = await db.delete(settings).where(eq(settings.key, key)).returning();
    return result.length > 0;
  }

  // =====================
  // Site Settings (Single Row)
  // =====================
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [result] = await db.select().from(siteSettings).where(eq(siteSettings.id, "main"));
    return result || undefined;
  }

  async updateSiteSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();

    if (existing) {
      // Update existing row
      const [updated] = await db
        .update(siteSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(siteSettings.id, "main"))
        .returning();
      return updated;
    } else {
      // Create new row with id='main'
      const [created] = await db
        .insert(siteSettings)
        .values({ ...data, id: "main" })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
