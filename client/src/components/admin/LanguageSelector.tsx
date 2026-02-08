import { useState } from "react";
import {
  Globe,
  Plus,
  Check,
  Languages,
  ChevronDown,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
  isDefault?: boolean;
  isActive?: boolean;
}

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  languages: Language[];
  onAddLanguage?: (language: Partial<Language>) => Promise<void>;
  onRemoveLanguage?: (code: string) => Promise<void>;
  onSetDefault?: (code: string) => Promise<void>;
  showManagement?: boolean;
}

// Available language templates
const availableLanguages: Omit<Language, "id" | "isDefault" | "isActive">[] = [
  { code: "he", name: "Hebrew", nativeName: "עברית", direction: "rtl" },
  { code: "en", name: "English", nativeName: "English", direction: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl" },
  { code: "ru", name: "Russian", nativeName: "Русский", direction: "ltr" },
  { code: "zh", name: "Chinese", nativeName: "中文", direction: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", direction: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", direction: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", direction: "ltr" },
  { code: "it", name: "Italian", nativeName: "Italiano", direction: "ltr" },
];

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
  languages,
  onAddLanguage,
  onRemoveLanguage,
  onSetDefault,
  showManagement = false,
}: LanguageSelectorProps) {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("");

  const currentLang = languages.find((l) => l.code === currentLanguage);

  const handleAddLanguage = async () => {
    if (!selectedLanguageCode || !onAddLanguage) return;

    const template = availableLanguages.find((l) => l.code === selectedLanguageCode);
    if (!template) return;

    setAdding(true);
    try {
      await onAddLanguage({
        ...template,
        isActive: true,
      });
      setIsAddOpen(false);
      setSelectedLanguageCode("");
    } catch (error) {
      console.error("Failed to add language:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveLanguage = async (code: string) => {
    if (!onRemoveLanguage) return;
    if (!confirm(`להסיר את השפה ${languages.find((l) => l.code === code)?.nativeName}?`)) return;

    try {
      await onRemoveLanguage(code);
    } catch (error) {
      console.error("Failed to remove language:", error);
    }
  };

  const handleSetDefault = async (code: string) => {
    if (!onSetDefault) return;

    try {
      await onSetDefault(code);
    } catch (error) {
      console.error("Failed to set default language:", error);
    }
  };

  // Languages not yet added
  const availableToAdd = availableLanguages.filter(
    (al) => !languages.some((l) => l.code === al.code)
  );

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector Dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10"
          >
            <Globe className="h-4 w-4 ml-2" />
            {currentLang?.nativeName || "שפה"}
            <ChevronDown className="h-4 w-4 mr-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2 bg-[#1a1a24] border-white/10" align="start">
          <div className="space-y-1">
            {languages
              .filter((l) => l.isActive)
              .map((language) => (
                <button
                  key={language.code}
                  onClick={() => onLanguageChange(language.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentLanguage === language.code
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {language.nativeName}
                    {language.isDefault && (
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                        ברירת מחדל
                      </Badge>
                    )}
                  </span>
                  {currentLanguage === language.code && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
          </div>

          {showManagement && (
            <>
              <div className="my-2 border-t border-white/10" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsManageOpen(true)}
                className="w-full justify-start text-gray-400 hover:text-white"
              >
                <Languages className="h-4 w-4 ml-2" />
                ניהול שפות
              </Button>
            </>
          )}
        </PopoverContent>
      </Popover>

      {/* Language Management Dialog */}
      {showManagement && (
        <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
          <DialogContent className="bg-[#12121a] border-white/10 max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Languages className="h-5 w-5" />
                ניהול שפות
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {/* Active Languages */}
              <div className="space-y-2">
                <Label>שפות פעילות</Label>
                <div className="space-y-2">
                  {languages.map((language) => (
                    <div
                      key={language.code}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-white font-medium">
                            {language.nativeName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {language.name} ({language.code.toUpperCase()})
                            {language.direction === "rtl" && " - RTL"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {language.isDefault ? (
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            ברירת מחדל
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSetDefault(language.code)}
                              className="text-xs text-gray-400 hover:text-white"
                            >
                              הגדר כברירת מחדל
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveLanguage(language.code)}
                              className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Language */}
              {availableToAdd.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddOpen(true)}
                    className="w-full border-dashed border-white/20 hover:border-white/40"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    הוסף שפה
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Language Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#12121a] border-white/10 max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white">הוספת שפה</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>בחר שפה</Label>
              <Select value={selectedLanguageCode} onValueChange={setSelectedLanguageCode}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="בחר שפה להוספה" />
                </SelectTrigger>
                <SelectContent>
                  {availableToAdd.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                disabled={adding}
              >
                ביטול
              </Button>
              <Button
                onClick={handleAddLanguage}
                disabled={!selectedLanguageCode || adding}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 ml-2" />
                )}
                הוסף
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LanguageSelector;
