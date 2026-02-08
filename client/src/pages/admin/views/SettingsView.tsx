import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Loader2,
  Lock,
  Instagram,
  Facebook,
  Linkedin,
  Search,
  Palette,
  Share2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCsrfToken } from "@/lib/queryClient";
import { clearCmsContentCache } from "@/lib/i18n";
import { clearSiteContentCache } from "@/hooks/useSiteContent";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SiteSettingsData {
  brandName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logoUrl: string;
  socialInstagram: string;
  socialFacebook: string;
  socialLinkedin: string;
  socialWhatsapp: string;
}

interface KVSetting {
  id: string;
  key: string;
  value: unknown;
  category: string | null;
  updatedAt: string | null;
}

// ---------------------------------------------------------------------------
// Key-value settings definitions (SEO + Branding)
// ---------------------------------------------------------------------------
const KV_CATEGORIES = {
  seo: {
    label: "SEO",
    labelEn: "SEO Settings",
    icon: Search,
    color: "bg-amber-500/10 text-amber-600",
    fields: [
      { key: "meta_title", label: "Meta Title", type: "text" as const, placeholder: "DDL - Dubai Real Estate Investments", dir: "ltr" as const },
      { key: "meta_title_he", label: "Meta Title (\u05E2\u05D1\u05E8\u05D9\u05EA)", type: "text" as const, placeholder: "DDL - \u05D4\u05E9\u05E7\u05E2\u05D5\u05EA \u05E0\u05D3\u05DC\u05F4\u05DF \u05D1\u05D3\u05D5\u05D1\u05D0\u05D9" },
      { key: "meta_description", label: "Meta Description", type: "textarea" as const, placeholder: "Your gateway to Dubai real estate...", dir: "ltr" as const },
      { key: "meta_description_he", label: "Meta Description (\u05E2\u05D1\u05E8\u05D9\u05EA)", type: "textarea" as const, placeholder: "\u05D4\u05D3\u05E8\u05DA \u05E9\u05DC\u05DA \u05DC\u05D4\u05E9\u05E7\u05E2\u05D5\u05EA \u05E0\u05D3\u05DC\u05F4\u05DF \u05D1\u05D3\u05D5\u05D1\u05D0\u05D9..." },
      { key: "meta_keywords", label: "Meta Keywords", type: "text" as const, placeholder: "dubai, real estate, investment", dir: "ltr" as const },
      { key: "og_image", label: "OG Image URL", type: "text" as const, placeholder: "https://...", dir: "ltr" as const },
      { key: "canonical_url", label: "Canonical URL", type: "text" as const, placeholder: "https://ddl-dubai.com", dir: "ltr" as const },
      { key: "google_analytics_id", label: "Google Analytics ID", type: "text" as const, placeholder: "G-XXXXXXXXXX", dir: "ltr" as const },
      { key: "google_tag_manager_id", label: "Google Tag Manager ID", type: "text" as const, placeholder: "GTM-XXXXXXX", dir: "ltr" as const },
    ],
  },
  branding: {
    label: "\u05DE\u05D5\u05EA\u05D2",
    labelEn: "Branding",
    icon: Palette,
    color: "bg-pink-500/10 text-pink-600",
    fields: [
      { key: "logo_url", label: "URL \u05DC\u05D5\u05D2\u05D5", type: "text" as const, placeholder: "/assets/logo.png", dir: "ltr" as const },
      { key: "logo_dark_url", label: "URL \u05DC\u05D5\u05D2\u05D5 (\u05DE\u05E6\u05D1 \u05DB\u05D4\u05D4)", type: "text" as const, placeholder: "/assets/logo-dark.png", dir: "ltr" as const },
      { key: "favicon_url", label: "URL Favicon", type: "text" as const, placeholder: "/favicon.ico", dir: "ltr" as const },
      { key: "primary_color", label: "\u05E6\u05D1\u05E2 \u05E8\u05D0\u05E9\u05D9", type: "text" as const, placeholder: "#2563EB", dir: "ltr" as const },
      { key: "secondary_color", label: "\u05E6\u05D1\u05E2 \u05DE\u05E9\u05E0\u05D9", type: "text" as const, placeholder: "#1a1a2e", dir: "ltr" as const },
      { key: "accent_color", label: "\u05E6\u05D1\u05E2 \u05DE\u05D3\u05D2\u05D9\u05E9", type: "text" as const, placeholder: "#FFD700", dir: "ltr" as const },
    ],
  },
} as const;

type KVCategoryKey = keyof typeof KV_CATEGORIES;

export function SettingsView() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // site_settings (single-row)
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>({
    brandName: "", email: "", phone: "", address: "", website: "", logoUrl: "",
    socialInstagram: "", socialFacebook: "", socialLinkedin: "", socialWhatsapp: "",
  });
  const [originalSiteSettings, setOriginalSiteSettings] = useState<SiteSettingsData | null>(null);

  // key-value settings
  const [kvValues, setKvValues] = useState<Record<string, string>>({});
  const [originalKvValues, setOriginalKvValues] = useState<Record<string, string>>({});
  const [kvPendingChanges, setKvPendingChanges] = useState<Set<string>>(new Set());

  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("general");

  // --- Data loading ---
  const fetchAllSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [siteRes, kvRes] = await Promise.all([
        fetch("/api/settings", { credentials: "include" }),
        fetch("/api/site-settings", { credentials: "include" }),
      ]);
      if (siteRes.ok) {
        const siteJson = await siteRes.json();
        const data = siteJson?.data || siteJson;
        const parsed: SiteSettingsData = {
          brandName: data?.brandName || "", email: data?.email || "",
          phone: data?.phone || "", address: data?.address || "",
          website: data?.website || "", logoUrl: data?.logoUrl || "",
          socialInstagram: data?.socialInstagram || "", socialFacebook: data?.socialFacebook || "",
          socialLinkedin: data?.socialLinkedin || "", socialWhatsapp: data?.socialWhatsapp || "",
        };
        setSiteSettings(parsed);
        setOriginalSiteSettings(parsed);
      }
      if (kvRes.ok) {
        const kvData: KVSetting[] = await kvRes.json();
        const values: Record<string, string> = {};
        if (Array.isArray(kvData)) {
          kvData.forEach((s) => {
            values[s.key] = typeof s.value === "string" ? s.value : JSON.stringify(s.value ?? "");
          });
        }
        setKvValues(values);
        setOriginalKvValues(values);
        setKvPendingChanges(new Set());
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast({ title: "שגיאה", description: "לא ניתן לטעון את ההגדרות", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAllSettings(); }, [fetchAllSettings]);

  // --- Dirty tracking ---
  const isSiteSettingsDirty = useCallback(() => {
    if (!originalSiteSettings) return false;
    return (Object.keys(siteSettings) as (keyof SiteSettingsData)[]).some(
      (k) => siteSettings[k] !== originalSiteSettings[k]
    );
  }, [siteSettings, originalSiteSettings]);

  const totalPendingCount = kvPendingChanges.size + (isSiteSettingsDirty() ? 1 : 0);

  // --- Save site_settings (PUT /api/settings) ---
  const handleSaveSiteSettings = async () => {
    setSaving(true);
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        credentials: "include",
        body: JSON.stringify({
          brandName: siteSettings.brandName, email: siteSettings.email,
          phone: siteSettings.phone, address: siteSettings.address,
          website: siteSettings.website, logoUrl: siteSettings.logoUrl,
          socialInstagram: siteSettings.socialInstagram, socialFacebook: siteSettings.socialFacebook,
          socialLinkedin: siteSettings.socialLinkedin, socialWhatsapp: siteSettings.socialWhatsapp,
        }),
      });
      if (!response.ok) {
        let errorMessage = "לא ניתן לשמור את ההגדרות";
        try { const d = await response.json(); errorMessage = d.message || d.error || errorMessage; } catch { /* not JSON */ }
        throw new Error(errorMessage);
      }
      setOriginalSiteSettings({ ...siteSettings });
      toast({ title: "נשמר בהצלחה", description: "הגדרות האתר נשמרו" });
      return true;
    } catch (error) {
      toast({ title: "שגיאה", description: error instanceof Error ? error.message : "לא ניתן לשמור את ההגדרות", variant: "destructive" });
      return false;
    } finally { setSaving(false); }
  };

  // --- Save key-value settings (POST /api/site-settings/bulk-update) ---
  const handleSaveKvSettings = async () => {
    if (kvPendingChanges.size === 0) return true;
    setSaving(true);
    try {
      const settingsToUpdate = Array.from(kvPendingChanges).map((key) => {
        let category = "general";
        for (const [catKey, catConfig] of Object.entries(KV_CATEGORIES)) {
          if (catConfig.fields.some((f) => f.key === key)) { category = catKey; break; }
        }
        return { key, value: kvValues[key] || "", category };
      });
      const csrfToken = await getCsrfToken();
      const res = await fetch("/api/site-settings/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        credentials: "include",
        body: JSON.stringify({ settings: settingsToUpdate }),
      });
      if (!res.ok) {
        let errorMessage = "לא ניתן לשמור את ההגדרות";
        try { const d = await res.json(); errorMessage = d.message || d.error || errorMessage; } catch { /* not JSON */ }
        throw new Error(errorMessage);
      }
      setOriginalKvValues({ ...kvValues });
      setKvPendingChanges(new Set());
      clearCmsContentCache();
      clearSiteContentCache();
      toast({ title: "נשמר בהצלחה", description: `${settingsToUpdate.length} הגדרות נשמרו` });
      return true;
    } catch (error) {
      toast({ title: "שגיאה", description: error instanceof Error ? error.message : "לא ניתן לשמור את ההגדרות", variant: "destructive" });
      return false;
    } finally { setSaving(false); }
  };

  // --- Save all ---
  const handleSaveAll = async () => {
    if (totalPendingCount === 0) { toast({ title: "אין שינויים", description: "לא בוצעו שינויים לשמירה" }); return; }
    setSaving(true);
    let siteOk = true, kvOk = true;
    if (isSiteSettingsDirty()) siteOk = await handleSaveSiteSettings();
    if (kvPendingChanges.size > 0) kvOk = await handleSaveKvSettings();
    setSaving(false);
    if (siteOk && kvOk) toast({ title: "נשמר בהצלחה", description: "כל ההגדרות נשמרו" });
  };

  // --- Reset ---
  const handleResetAll = () => {
    if (originalSiteSettings) setSiteSettings({ ...originalSiteSettings });
    setKvValues({ ...originalKvValues });
    setKvPendingChanges(new Set());
    toast({ title: "איפוס", description: "כל השינויים בוטלו" });
  };

  // --- KV change handler ---
  const handleKvChange = (key: string, value: string) => {
    setKvValues((prev) => ({ ...prev, [key]: value }));
    if (value !== (originalKvValues[key] || "")) {
      setKvPendingChanges((prev) => new Set(prev).add(key));
    } else {
      setKvPendingChanges((prev) => { const next = new Set(prev); next.delete(key); return next; });
    }
  };

  // --- Password change ---
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "שגיאה", description: "הסיסמאות לא תואמות", variant: "destructive" }); return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "שגיאה", description: "הסיסמה חייבת להכיל לפחות 6 תווים", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        credentials: "include",
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      });
      if (!response.ok) {
        let errorMessage = "לא ניתן לשנות את הסיסמה";
        try { const d = await response.json(); errorMessage = d.message || d.error || errorMessage; } catch { /* not JSON */ }
        throw new Error(errorMessage);
      }
      toast({ title: "הסיסמה שונתה בהצלחה" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({ title: "שגיאה", description: error instanceof Error ? error.message : "לא ניתן לשנות את הסיסמה", variant: "destructive" });
    } finally { setSaving(false); }
  };

  // --- Render helper: KV category card ---
  function renderKvCategory(catKey: KVCategoryKey) {
    const category = KV_CATEGORIES[catKey];
    const Icon = category.icon;
    const categoryPendingCount = category.fields.filter((f) => kvPendingChanges.has(f.key)).length;
    return (
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${category.color}`}><Icon className="w-5 h-5" /></div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {category.label}
                {categoryPendingCount > 0 && <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200">{categoryPendingCount} שינויים</Badge>}
              </CardTitle>
              <CardDescription>{category.labelEn} - {category.fields.length} הגדרות</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {category.fields.map((field) => {
              const hasChanged = kvPendingChanges.has(field.key);
              const fieldDir = "dir" in field ? field.dir : undefined;
              return (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">{field.label}</Label>
                    {hasChanged && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">שונה</Badge>}
                  </div>
                  {field.type === "textarea" ? (
                    <Textarea value={kvValues[field.key] || ""} onChange={(e) => handleKvChange(field.key, e.target.value)} placeholder={field.placeholder} rows={3} className={`bg-slate-50 border-slate-200 ${hasChanged ? "border-amber-300" : ""} ${fieldDir === "ltr" ? "text-left" : ""}`} dir={fieldDir} />
                  ) : (
                    <Input value={kvValues[field.key] || ""} onChange={(e) => handleKvChange(field.key, e.target.value)} placeholder={field.placeholder} className={`bg-slate-50 border-slate-200 ${hasChanged ? "border-amber-300" : ""} ${fieldDir === "ltr" ? "text-left" : ""}`} dir={fieldDir} />
                  )}
                  <p className="text-xs text-slate-400">{field.key}</p>
                </div>
              );
            })}
          </div>
          <div className="pt-6 border-t border-slate-200 mt-6 flex justify-end">
            <Button onClick={handleSaveKvSettings} disabled={saving || categoryPendingCount === 0} className="bg-blue-500 hover:bg-blue-600">
              {saving ? <Loader2 className="h-4 w-4 ms-2 animate-spin" /> : <Save className="h-4 w-4 ms-2" />}
              שמור {category.label}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-slate-500">טוען הגדרות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">הגדרות</h2>
          <p className="text-sm text-slate-500 mt-1">ניהול הגדרות האתר, פרטי קשר, רשתות חברתיות, SEO ואבטחה</p>
        </div>
        <div className="flex items-center gap-3">
          {totalPendingCount > 0 && (
            <Badge variant="secondary" className="text-sm bg-amber-50 text-amber-700 border-amber-200">{totalPendingCount} שינויים ממתינים</Badge>
          )}
          <Button variant="outline" onClick={handleResetAll} disabled={saving || totalPendingCount === 0} size="sm">
            <RotateCcw className="h-4 w-4 ms-2" />איפוס
          </Button>
          <Button onClick={handleSaveAll} disabled={saving || totalPendingCount === 0} className="bg-blue-500 hover:bg-blue-600 min-w-[130px]" size="sm">
            {saving ? <Loader2 className="h-4 w-4 ms-2 animate-spin" /> : <Save className="h-4 w-4 ms-2" />}שמור הכל
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList dir="rtl" className="bg-white border border-slate-200 p-1 mb-6 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Building2 className="h-4 w-4 ms-2" />כללי</TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Share2 className="h-4 w-4 ms-2" />רשתות חברתיות</TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Search className="h-4 w-4 ms-2" />SEO</TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Palette className="h-4 w-4 ms-2" />מותג</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Lock className="h-4 w-4 ms-2" />אבטחה</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="p-6 bg-white shadow-sm border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">פרטי העסק ויצירת קשר</h3>
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" />שם המותג</Label>
                    <Input value={siteSettings.brandName} onChange={(e) => setSiteSettings((p) => ({ ...p, brandName: e.target.value }))} className="bg-slate-50 border-slate-200" placeholder="DDL Real Estate" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-400" />כתובת האתר</Label>
                    <Input value={siteSettings.website} onChange={(e) => setSiteSettings((p) => ({ ...p, website: e.target.value }))} className="bg-slate-50 border-slate-200 text-left" dir="ltr" placeholder="https://ddl-dubai.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" />אימייל</Label>
                    <Input type="email" value={siteSettings.email} onChange={(e) => setSiteSettings((p) => ({ ...p, email: e.target.value }))} className="bg-slate-50 border-slate-200 text-left" dir="ltr" placeholder="info@ddl-dubai.com" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />טלפון</Label>
                    <Input value={siteSettings.phone} onChange={(e) => setSiteSettings((p) => ({ ...p, phone: e.target.value }))} className="bg-slate-50 border-slate-200 text-left" dir="ltr" placeholder="+972 50-889-6702" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />כתובת</Label>
                  <Input value={siteSettings.address} onChange={(e) => setSiteSettings((p) => ({ ...p, address: e.target.value }))} className="bg-slate-50 border-slate-200" placeholder="דובאי, איחוד האמירויות" />
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <Button onClick={handleSaveSiteSettings} disabled={saving || !isSiteSettingsDirty()} className="bg-blue-500 hover:bg-blue-600">
                    {saving ? <Loader2 className="h-4 w-4 ms-2 animate-spin" /> : <Save className="h-4 w-4 ms-2" />}שמור פרטי עסק
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="p-6 bg-white shadow-sm border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">רשתות חברתיות</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-500" />Instagram</Label>
                  <Input value={siteSettings.socialInstagram} onChange={(e) => setSiteSettings((p) => ({ ...p, socialInstagram: e.target.value }))} className="bg-slate-50 border-slate-200 text-left" dir="ltr" placeholder="https://instagram.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-500" />Facebook</Label>
                  <Input value={siteSettings.socialFacebook} onChange={(e) => setSiteSettings((p) => ({ ...p, socialFacebook: e.target.value }))} className="bg-slate-50 border-slate-200 text-left" dir="ltr" placeholder="https://facebook.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-blue-600" />LinkedIn</Label>
                  <Input value={siteSettings.socialLinkedin} onChange={(e) => setSiteSettings((p) => ({ ...p, socialLinkedin: e.target.value }))} className="bg-slate-50 border-slate-200 text-left" dir="ltr" placeholder="https://linkedin.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-green-500" />WhatsApp (מספר בלבד)</Label>
                  <Input value={siteSettings.socialWhatsapp} onChange={(e) => setSiteSettings((p) => ({ ...p, socialWhatsapp: e.target.value }))} className="bg-slate-50 border-slate-200 text-left" dir="ltr" placeholder="972501234567" />
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <Button onClick={handleSaveSiteSettings} disabled={saving || !isSiteSettingsDirty()} className="bg-blue-500 hover:bg-blue-600">
                    {saving ? <Loader2 className="h-4 w-4 ms-2 animate-spin" /> : <Save className="h-4 w-4 ms-2" />}שמור רשתות חברתיות
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>{renderKvCategory("seo")}</motion.div>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>{renderKvCategory("branding")}</motion.div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="p-6 bg-white shadow-sm border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">שינוי סיסמה</h3>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>סיסמה נוכחית</Label>
                  <Input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))} className="bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label>סיסמה חדשה</Label>
                  <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))} className="bg-slate-50 border-slate-200" />
                  {passwordData.newPassword.length > 0 && passwordData.newPassword.length < 6 && (
                    <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />הסיסמה חייבת להכיל לפחות 6 תווים</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>אימות סיסמה חדשה</Label>
                  <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))} className="bg-slate-50 border-slate-200" />
                  {passwordData.confirmPassword.length > 0 && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />הסיסמאות לא תואמות</p>
                  )}
                  {passwordData.confirmPassword.length > 0 && passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword.length >= 6 && (
                    <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" />הסיסמאות תואמות</p>
                  )}
                </div>
                <div className="pt-4">
                  <Button onClick={handleChangePassword} disabled={saving || !passwordData.currentPassword || passwordData.newPassword.length < 6 || passwordData.newPassword !== passwordData.confirmPassword} className="bg-blue-500 hover:bg-blue-600">
                    {saving ? <Loader2 className="h-4 w-4 ms-2 animate-spin" /> : <Lock className="h-4 w-4 ms-2" />}שנה סיסמה
                  </Button>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white shadow-sm border-slate-200 mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">פרטי המערכת</h3>
              <p className="text-slate-500 text-sm">KBR CMC v1.0</p>
              <p className="text-slate-400 text-xs mt-1">&copy; 2024 KBR Global. כל הזכויות שמורות.</p>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
