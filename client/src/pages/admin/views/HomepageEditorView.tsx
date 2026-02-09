import { useState, useEffect } from "react";
import { clearCmsContentCache } from "@/lib/i18n";
import { clearSiteContentCache } from "@/hooks/useSiteContent";
import { getCsrfToken } from "@/lib/queryClient";
import { motion } from "framer-motion";
import {
  Save,
  Eye,
  RotateCcw,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  FileText,
  Home,
  Info,
  Sparkles,
  Building2,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { ContentBlock } from "@shared/schema";

// Section definitions for the homepage
const HOMEPAGE_SECTIONS = {
  hero: {
    label: "Hero Section",
    labelHe: "סקשן Hero",
    icon: Home,
    color: "bg-amber-500/10 text-amber-600",
    fields: [
      { key: "title1", label: "כותרת 1", labelEn: "Title 1", type: "text" },
      { key: "title2", label: "כותרת 2", labelEn: "Title 2", type: "text" },
      { key: "title3", label: "כותרת 3", labelEn: "Title 3", type: "text" },
      { key: "subtitle1", label: "תת-כותרת 1", labelEn: "Subtitle 1", type: "text" },
      { key: "subtitle2", label: "תת-כותרת 2", labelEn: "Subtitle 2", type: "text" },
      { key: "subtitle3", label: "תת-כותרת 3", labelEn: "Subtitle 3", type: "text" },
      { key: "tagline", label: "שורת תגלית", labelEn: "Tagline", type: "textarea" },
      { key: "cta", label: "טקסט CTA", labelEn: "CTA Text", type: "text" },
      { key: "calculator", label: "טקסט מחשבון", labelEn: "Calculator Text", type: "text" },
      { key: "stat_tax_value", label: "ערך מס", labelEn: "Tax Value", type: "text" },
      { key: "stat_tax_label", label: "תווית מס", labelEn: "Tax Label", type: "text" },
      { key: "stat_yield_value", label: "ערך תשואה", labelEn: "Yield Value", type: "text" },
      { key: "stat_yield_label", label: "תווית תשואה", labelEn: "Yield Label", type: "text" },
      { key: "stat_ownership_value", label: "ערך בעלות", labelEn: "Ownership Value", type: "text" },
      { key: "stat_ownership_label", label: "תווית בעלות", labelEn: "Ownership Label", type: "text" },
      { key: "stat_support_value", label: "ערך תמיכה", labelEn: "Support Value", type: "text" },
      { key: "stat_support_label", label: "תווית תמיכה", labelEn: "Support Label", type: "text" },
      { key: "trust_licensed", label: "תג רישיון", labelEn: "Licensed Badge", type: "text" },
      { key: "trust_verified", label: "תג אימות", labelEn: "Verified Badge", type: "text" },
    ],
  },
  about: {
    label: "About Section",
    labelHe: "סקשן אודות",
    icon: Info,
    color: "bg-blue-500/10 text-blue-600",
    fields: [
      { key: "title", label: "כותרת", labelEn: "Title", type: "text" },
      { key: "subtitle", label: "תת-כותרת", labelEn: "Subtitle", type: "text" },
      { key: "description", label: "תיאור", labelEn: "Description", type: "textarea" },
      { key: "license", label: "פרטי רישיון", labelEn: "License Details", type: "text" },
      { key: "card1_title", label: "כרטיס 1 - כותרת", labelEn: "Card 1 Title", type: "text" },
      { key: "card1_desc", label: "כרטיס 1 - תיאור", labelEn: "Card 1 Description", type: "textarea" },
      { key: "card2_title", label: "כרטיס 2 - כותרת", labelEn: "Card 2 Title", type: "text" },
      { key: "card2_desc", label: "כרטיס 2 - תיאור", labelEn: "Card 2 Description", type: "textarea" },
      { key: "card3_title", label: "כרטיס 3 - כותרת", labelEn: "Card 3 Title", type: "text" },
      { key: "card3_desc", label: "כרטיס 3 - תיאור", labelEn: "Card 3 Description", type: "textarea" },
      { key: "card4_title", label: "כרטיס 4 - כותרת", labelEn: "Card 4 Title", type: "text" },
      { key: "card4_desc", label: "כרטיס 4 - תיאור", labelEn: "Card 4 Description", type: "textarea" },
    ],
  },
  whyPropline: {
    label: "Why PropLine Section",
    labelHe: "סקשן למה PropLine",
    icon: Sparkles,
    color: "bg-purple-500/10 text-purple-600",
    fields: [
      { key: "title", label: "כותרת", labelEn: "Title", type: "text" },
      { key: "subtitle", label: "תת-כותרת", labelEn: "Subtitle", type: "text" },
      { key: "reason1_title", label: "סיבה 1 - כותרת", labelEn: "Reason 1 Title", type: "text" },
      { key: "reason1_desc", label: "סיבה 1 - תיאור", labelEn: "Reason 1 Description", type: "textarea" },
      { key: "reason2_title", label: "סיבה 2 - כותרת", labelEn: "Reason 2 Title", type: "text" },
      { key: "reason2_desc", label: "סיבה 2 - תיאור", labelEn: "Reason 2 Description", type: "textarea" },
      { key: "reason3_title", label: "סיבה 3 - כותרת", labelEn: "Reason 3 Title", type: "text" },
      { key: "reason3_desc", label: "סיבה 3 - תיאור", labelEn: "Reason 3 Description", type: "textarea" },
      { key: "reason4_title", label: "סיבה 4 - כותרת", labelEn: "Reason 4 Title", type: "text" },
      { key: "reason4_desc", label: "סיבה 4 - תיאור", labelEn: "Reason 4 Description", type: "textarea" },
      { key: "reason5_title", label: "סיבה 5 - כותרת", labelEn: "Reason 5 Title", type: "text" },
      { key: "reason5_desc", label: "סיבה 5 - תיאור", labelEn: "Reason 5 Description", type: "textarea" },
      { key: "reason6_title", label: "סיבה 6 - כותרת", labelEn: "Reason 6 Title", type: "text" },
      { key: "reason6_desc", label: "סיבה 6 - תיאור", labelEn: "Reason 6 Description", type: "textarea" },
      { key: "quote", label: "ציטוט", labelEn: "Quote", type: "textarea" },
    ],
  },
  whyDubai: {
    label: "Why Dubai Section",
    labelHe: "סקשן למה דובאי",
    icon: Building2,
    color: "bg-emerald-500/10 text-emerald-600",
    fields: [
      { key: "title", label: "כותרת", labelEn: "Title", type: "text" },
      { key: "subtitle", label: "תת-כותרת", labelEn: "Subtitle", type: "text" },
      { key: "description", label: "תיאור", labelEn: "Description", type: "textarea" },
      { key: "advantage1", label: "יתרון 1", labelEn: "Advantage 1", type: "text" },
      { key: "advantage2", label: "יתרון 2", labelEn: "Advantage 2", type: "text" },
      { key: "advantage3", label: "יתרון 3", labelEn: "Advantage 3", type: "text" },
      { key: "advantage4", label: "יתרון 4", labelEn: "Advantage 4", type: "text" },
      { key: "advantage5", label: "יתרון 5", labelEn: "Advantage 5", type: "text" },
      { key: "advantage6", label: "יתרון 6", labelEn: "Advantage 6", type: "text" },
      { key: "advantage7", label: "יתרון 7", labelEn: "Advantage 7", type: "text" },
      { key: "advantage8", label: "יתרון 8", labelEn: "Advantage 8", type: "text" },
      { key: "advantage9", label: "יתרון 9", labelEn: "Advantage 9", type: "text" },
      { key: "advantage10", label: "יתרון 10", labelEn: "Advantage 10", type: "text" },
    ],
  },
  process: {
    label: "Process Timeline",
    labelHe: "סקשן תהליך",
    icon: Clock,
    color: "bg-orange-500/10 text-orange-600",
    fields: [
      { key: "title", label: "כותרת", labelEn: "Title", type: "text" },
      { key: "subtitle", label: "תת-כותרת", labelEn: "Subtitle", type: "text" },
      { key: "step1_title", label: "שלב 1 - כותרת", labelEn: "Step 1 Title", type: "text" },
      { key: "step1_desc", label: "שלב 1 - תיאור", labelEn: "Step 1 Description", type: "textarea" },
      { key: "step2_title", label: "שלב 2 - כותרת", labelEn: "Step 2 Title", type: "text" },
      { key: "step2_desc", label: "שלב 2 - תיאור", labelEn: "Step 2 Description", type: "textarea" },
      { key: "step3_title", label: "שלב 3 - כותרת", labelEn: "Step 3 Title", type: "text" },
      { key: "step3_desc", label: "שלב 3 - תיאור", labelEn: "Step 3 Description", type: "textarea" },
      { key: "step4_title", label: "שלב 4 - כותרת", labelEn: "Step 4 Title", type: "text" },
      { key: "step4_desc", label: "שלב 4 - תיאור", labelEn: "Step 4 Description", type: "textarea" },
      { key: "step5_title", label: "שלב 5 - כותרת", labelEn: "Step 5 Title", type: "text" },
      { key: "step5_desc", label: "שלב 5 - תיאור", labelEn: "Step 5 Description", type: "textarea" },
      { key: "step6_title", label: "שלב 6 - כותרת", labelEn: "Step 6 Title", type: "text" },
      { key: "step6_desc", label: "שלב 6 - תיאור", labelEn: "Step 6 Description", type: "textarea" },
      { key: "step7_title", label: "שלב 7 - כותרת", labelEn: "Step 7 Title", type: "text" },
      { key: "step7_desc", label: "שלב 7 - תיאור", labelEn: "Step 7 Description", type: "textarea" },
      { key: "step8_title", label: "שלב 8 - כותרת", labelEn: "Step 8 Title", type: "text" },
      { key: "step8_desc", label: "שלב 8 - תיאור", labelEn: "Step 8 Description", type: "textarea" },
    ],
  },
  footer: {
    label: "Footer Section",
    labelHe: "סקשן פוטר",
    icon: MessageSquare,
    color: "bg-slate-500/10 text-slate-600",
    fields: [
      { key: "tagline", label: "שורת תגלית", labelEn: "Tagline", type: "textarea" },
      { key: "license", label: "פרטי רישיון", labelEn: "License", type: "text" },
      { key: "copyright", label: "זכויות יוצרים", labelEn: "Copyright", type: "text" },
      { key: "quickLinks", label: "כותרת קישורים מהירים", labelEn: "Quick Links Title", type: "text" },
      { key: "contactUs", label: "כותרת צור קשר", labelEn: "Contact Us Title", type: "text" },
      { key: "followUs", label: "כותרת עקבו אחרינו", labelEn: "Follow Us Title", type: "text" },
      { key: "location", label: "מיקום", labelEn: "Location", type: "text" },
      { key: "terms", label: "תנאי שימוש", labelEn: "Terms", type: "text" },
      { key: "privacy", label: "פרטיות", labelEn: "Privacy", type: "text" },
      { key: "disclaimer", label: "הצהרת אחריות", labelEn: "Disclaimer", type: "text" },
    ],
  },
};

type SectionKey = keyof typeof HOMEPAGE_SECTIONS;

interface SectionEditorProps {
  section: SectionKey;
  blocks: ContentBlock[];
  onUpdate: (blockKey: string, value: string, valueEn: string) => void;
}

function SectionEditor({ section, blocks, onUpdate }: SectionEditorProps) {
  const sectionConfig = HOMEPAGE_SECTIONS[section];
  const [localValues, setLocalValues] = useState<Record<string, { he: string; en: string }>>({});

  useEffect(() => {
    // Initialize local values from blocks
    const values: Record<string, { he: string; en: string }> = {};
    sectionConfig.fields.forEach((field) => {
      const block = blocks.find((b) => b.blockKey === field.key);
      values[field.key] = {
        he: block?.value || "",
        en: block?.valueEn || "",
      };
    });
    setLocalValues(values);
  }, [blocks, sectionConfig.fields]);

  const handleChange = (blockKey: string, lang: "he" | "en", value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [blockKey]: {
        ...prev[blockKey],
        [lang]: value,
      },
    }));
    onUpdate(
      blockKey,
      lang === "he" ? value : localValues[blockKey]?.he || "",
      lang === "en" ? value : localValues[blockKey]?.en || ""
    );
  };

  return (
    <div className="space-y-6">
      {sectionConfig.fields.map((field) => (
        <div key={field.key} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-sm font-medium">{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                value={localValues[field.key]?.he || ""}
                onChange={(e) => handleChange(field.key, "he", e.target.value)}
                className="mt-1.5"
                rows={3}
                dir="rtl"
                placeholder={`${field.label} בעברית`}
              />
            ) : (
              <Input
                value={localValues[field.key]?.he || ""}
                onChange={(e) => handleChange(field.key, "he", e.target.value)}
                className="mt-1.5"
                dir="rtl"
                placeholder={`${field.label} בעברית`}
              />
            )}
          </div>
          <div>
            <Label className="text-sm font-medium">{field.labelEn}</Label>
            {field.type === "textarea" ? (
              <Textarea
                value={localValues[field.key]?.en || ""}
                onChange={(e) => handleChange(field.key, "en", e.target.value)}
                className="mt-1.5"
                rows={3}
                dir="ltr"
                placeholder={`${field.labelEn} in English`}
              />
            ) : (
              <Input
                value={localValues[field.key]?.en || ""}
                onChange={(e) => handleChange(field.key, "en", e.target.value)}
                className="mt-1.5"
                dir="ltr"
                placeholder={`${field.labelEn} in English`}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomepageEditorView() {
  const [activeTab, setActiveTab] = useState<SectionKey>("hero");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, { section: string; blockKey: string; value: string; valueEn: string }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch all content blocks
  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/content-blocks");
      if (res.ok) {
        const data = await res.json();
        setBlocks(data);
      }
    } catch (error) {
      console.error("Failed to fetch content blocks:", error);
      toast({
        title: "שגיאה",
        description: "נכשל בטעינת תוכן",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (section: SectionKey, blockKey: string, value: string, valueEn: string) => {
    const changeKey = `${section}:${blockKey}`;
    setPendingChanges((prev) => ({
      ...prev,
      [changeKey]: { section, blockKey, value, valueEn },
    }));
  };

  const handleSave = async () => {
    const changes = Object.values(pendingChanges);
    if (changes.length === 0) {
      toast({
        title: "אין שינויים",
        description: "לא בוצעו שינויים לשמירה",
      });
      return;
    }

    setIsSaving(true);
    try {
      const blocksToUpsert = changes.map((change) => ({
        section: change.section,
        blockKey: change.blockKey,
        value: change.value,
        valueEn: change.valueEn,
        contentType: "text",
        isActive: true,
      }));

      const csrfToken = await getCsrfToken();
      const res = await fetch("/api/content-blocks/bulk-upsert", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ blocks: blocksToUpsert }),
      });

      if (!res.ok) throw new Error("Failed to save");

      // Clear the CMS caches so changes reflect on frontend immediately
      clearCmsContentCache();
      clearSiteContentCache();

      toast({
        title: "נשמר בהצלחה",
        description: `${changes.length} שינויים נשמרו`,
      });

      setPendingChanges({});
      await fetchBlocks();
    } catch (error) {
      console.error("Failed to save:", error);
      toast({
        title: "שגיאה בשמירה",
        description: "נכשל בשמירת השינויים",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPendingChanges({});
    fetchBlocks();
    toast({
      title: "איפוס",
      description: "כל השינויים בוטלו",
    });
  };

  const getSectionBlocks = (section: SectionKey) => {
    return blocks.filter((b) => b.section === section);
  };

  const pendingCount = Object.keys(pendingChanges).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">עורך דף הבית</h2>
          <p className="text-muted-foreground">
            עריכת כל התוכן שמוצג בדף הבית - בעברית ובאנגלית
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-sm">
              {pendingCount} שינויים ממתינים
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="w-4 h-4 ml-2" />
            איפוס
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || pendingCount === 0}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            שמור שינויים
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SectionKey)}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-1 p-1">
          {Object.entries(HOMEPAGE_SECTIONS).map(([key, section]) => {
            const Icon = section.icon;
            const sectionPendingCount = Object.keys(pendingChanges).filter((k) =>
              k.startsWith(`${key}:`)
            ).length;
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="relative flex flex-col items-center gap-1 py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{section.labelHe}</span>
                {sectionPendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                    {sectionPendingCount}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(HOMEPAGE_SECTIONS).map(([key, section]) => {
          const Icon = section.icon;
          return (
            <TabsContent key={key} value={key} className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle>{section.labelHe}</CardTitle>
                      <CardDescription>
                        עריכת תוכן סקשן {section.labelHe} - {section.fields.length} שדות
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <SectionEditor
                    section={key as SectionKey}
                    blocks={getSectionBlocks(key as SectionKey)}
                    onUpdate={(blockKey, value, valueEn) =>
                      handleUpdate(key as SectionKey, blockKey, value, valueEn)
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Quick Stats */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{blocks.length}</p>
              <p className="text-sm text-muted-foreground">בלוקי תוכן</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">שינויים ממתינים</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {Object.keys(HOMEPAGE_SECTIONS).length}
              </p>
              <p className="text-sm text-muted-foreground">סקשנים</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Object.values(HOMEPAGE_SECTIONS).reduce(
                  (acc, s) => acc + s.fields.length,
                  0
                )}
              </p>
              <p className="text-sm text-muted-foreground">שדות</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
