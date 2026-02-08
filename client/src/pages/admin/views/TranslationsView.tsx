import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCsrfToken } from "@/lib/queryClient";
import {
  Search,
  Languages,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Save,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Translation {
  key: string;
  he: string;
  en: string;
}

interface TranslationsViewProps {
  isLoading?: boolean;
}

export function TranslationsView({ isLoading = false }: TranslationsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ he: string; en: string }>({ he: "", en: "" });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      const response = await fetch("/api/translations");
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      }
    } catch (error) {
      console.error("Failed to fetch translations:", error);
    }
  };

  const categories = Array.from(new Set(
    translations
      .map(t => t.key.split(".")[0])
      .filter((cat): cat is string => typeof cat === 'string' && cat.trim().length > 0)
  )).sort();

  const filteredTranslations = translations
    .filter((t) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          t.key.toLowerCase().includes(query) ||
          t.he.toLowerCase().includes(query) ||
          t.en.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((t) => {
      if (categoryFilter === "all") return true;
      return t.key.startsWith(categoryFilter + ".");
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  const handleEdit = (translation: Translation) => {
    setEditingKey(translation.key);
    setEditValues({ he: translation.he, en: translation.en });
  };

  const handleSave = async () => {
    if (!editingKey) return;
    setSaving(true);
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/translations/${encodeURIComponent(editingKey)}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(editValues),
      });
      if (response.ok) {
        setTranslations(prev =>
          prev.map(t =>
            t.key === editingKey ? { ...t, ...editValues } : t
          )
        );
        toast({ title: "התרגום עודכן בהצלחה" });
        setEditingKey(null);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את התרגום",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValues({ he: "", en: "" });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "הטקסט הועתק" });
  };

  const getMissingTranslations = () => {
    return translations.filter(t => !t.en || t.en.trim() === "");
  };

  const stats = {
    total: translations.length,
    categories: categories.length,
    missing: getMissingTranslations().length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Languages className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-500">סה״כ תרגומים</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white shadow-sm border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Languages className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.categories}</p>
              <p className="text-sm text-slate-500">קטגוריות</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white shadow-sm border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total - stats.missing}</p>
              <p className="text-sm text-slate-500">מתורגמים</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white shadow-sm border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-50">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.missing}</p>
              <p className="text-sm text-slate-500">חסרים</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-white shadow-sm border-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="חיפוש לפי מפתח או טקסט..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-slate-50 border-slate-200"
              data-testid="input-translation-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-slate-50 border-slate-200" data-testid="select-category-filter">
              <SelectValue placeholder="קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={fetchTranslations}
            className="border-slate-200"
            data-testid="button-refresh-translations"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            רענן
          </Button>
        </div>
      </Card>

      <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredTranslations.length === 0 ? (
          <div className="text-center py-12">
            <Languages className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">
              {searchQuery || categoryFilter !== "all"
                ? "לא נמצאו תרגומים"
                : "אין תרגומים עדיין"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTranslations.map((translation, index) => (
              <motion.div
                key={translation.key}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.01 }}
                className={`p-4 ${editingKey === translation.key ? "bg-blue-50" : "hover:bg-slate-50"} transition-colors`}
                data-testid={`translation-row-${translation.key}`}
              >
                {editingKey === translation.key ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-slate-300 font-mono">
                        {translation.key}
                      </Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="font-bold">עברית</span>
                          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">RTL</span>
                        </label>
                        <Textarea
                          value={editValues.he}
                          onChange={(e) => setEditValues({ ...editValues, he: e.target.value })}
                          className="bg-white border-slate-200 min-h-[80px]"
                          dir="rtl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="font-bold">English</span>
                          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">LTR</span>
                        </label>
                        <Textarea
                          value={editValues.en}
                          onChange={(e) => setEditValues({ ...editValues, en: e.target.value })}
                          className="bg-white border-slate-200 min-h-[80px]"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 ml-2" />
                            שמור
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="border-slate-200"
                      >
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => handleEdit(translation)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs border-slate-300 font-mono">
                        {translation.key}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {!translation.en && (
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                            חסר תרגום לאנגלית
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-slate-500 hover:text-slate-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(translation.key, translation.key);
                          }}
                        >
                          {copied === translation.key ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 text-xs">עברית: </span>
                        <span className="text-slate-900" dir="rtl">{translation.he || "-"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs">English: </span>
                        <span className={`${translation.en ? "text-slate-900" : "text-yellow-600"}`} dir="ltr">
                          {translation.en || "(missing)"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
