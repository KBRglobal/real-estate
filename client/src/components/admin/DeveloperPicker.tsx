import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Check,
  ChevronsUpDown,
  ImagePlus,
  X,
  ExternalLink,
  Upload,
  Loader2,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";

// ========================================
// Predefined Dubai developer list
// ========================================
interface DeveloperEntry {
  name: string;
  defaultLogoUrl: string;
}

const DUBAI_DEVELOPERS: DeveloperEntry[] = [
  {
    name: "Emaar Properties",
    defaultLogoUrl: "https://cdn.emaar.com/wp-content/uploads/2019/05/Emaar-Logo.png",
  },
  {
    name: "DAMAC Properties",
    defaultLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Damac_logo.svg/1200px-Damac_logo.svg.png",
  },
  {
    name: "Nakheel",
    defaultLogoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Nakheel_PJSC_Logo.svg/1200px-Nakheel_PJSC_Logo.svg.png",
  },
  {
    name: "Dubai Properties",
    defaultLogoUrl: "https://logosandtypes.com/wp-content/uploads/2024/01/dubai-properties.svg",
  },
  {
    name: "Meraas",
    defaultLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Meraas_logo.png",
  },
  {
    name: "Azizi Developments",
    defaultLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/80/Azizi_Logo.png",
  },
  {
    name: "Sobha Realty",
    defaultLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Sobha_Realty_logo.svg/1200px-Sobha_Realty_logo.svg.png",
  },
  {
    name: "Danube Properties",
    defaultLogoUrl: "https://dfrproperties.ae/wp-content/uploads/2023/12/danube-properties-logo.png",
  },
  {
    name: "Omniyat",
    defaultLogoUrl: "https://www.omniyat.com/img/logo.svg",
  },
  {
    name: "Select Group",
    defaultLogoUrl: "https://selectgroup.ae/wp-content/themes/developer/assets/images/logo.svg",
  },
  {
    name: "Ellington Properties",
    defaultLogoUrl: "https://ellingtonproperties.ae/wp-content/uploads/2023/01/ellington-logo.svg",
  },
  {
    name: "Binghatti Developers",
    defaultLogoUrl: "https://www.binghatti.com/images/logo-dark.svg",
  },
  {
    name: "Samana Developers",
    defaultLogoUrl: "https://samanadevelopers.com/wp-content/uploads/2023/01/samana-logo.svg",
  },
  {
    name: "MAG Property Development",
    defaultLogoUrl: "https://magld.com/wp-content/uploads/2023/01/mag-logo.svg",
  },
  {
    name: "Tiger Properties",
    defaultLogoUrl: "https://tigerproperties.ae/wp-content/uploads/2022/12/tiger-logo.svg",
  },
  {
    name: "Reportage Properties",
    defaultLogoUrl: "https://reportageproperties.com/images/logo.svg",
  },
  {
    name: "Aldar Properties",
    defaultLogoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Aldar_Properties_logo.svg/1200px-Aldar_Properties_logo.svg.png",
  },
  {
    name: "Bloom Properties",
    defaultLogoUrl: "https://www.bloomholding.com/images/bloom-logo.svg",
  },
  {
    name: "Eagle Hills",
    defaultLogoUrl: "https://eaglehills.com/wp-content/themes/developer/assets/images/logo.svg",
  },
  {
    name: "Deyaar Development",
    defaultLogoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Deyaar_Development_logo.svg/1200px-Deyaar_Development_logo.svg.png",
  },
];

// ========================================
// Component props
// ========================================
interface DeveloperPickerProps {
  /** Current developer name */
  developerName: string;
  /** Current developer logo URL */
  developerLogo: string;
  /** Callback when developer name changes */
  onDeveloperNameChange: (name: string) => void;
  /** Callback when developer logo URL changes */
  onDeveloperLogoChange: (logoUrl: string) => void;
  /** Validation state */
  isValid?: boolean;
  /** Validation error message */
  validationMessage?: string;
  /** Whether to show the preview card */
  showPreview?: boolean;
}

export function DeveloperPicker({
  developerName,
  developerLogo,
  onDeveloperNameChange,
  onDeveloperLogoChange,
  isValid,
  validationMessage,
  showPreview = true,
}: DeveloperPickerProps) {
  const [open, setOpen] = useState(false);
  const [logoInput, setLogoInput] = useState("");
  const [showLogoUrlInput, setShowLogoUrlInput] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newDeveloperName, setNewDeveloperName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [logoHovered, setLogoHovered] = useState(false);

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile: uploadLogo, isUploading: logoUploading, progress: logoProgress } = useUpload({
    onSuccess: (response) => {
      onDeveloperLogoChange(response.objectPath);
      setUploadSuccess(true);
      setUploadError(null);
      setTimeout(() => setUploadSuccess(false), 3000);
    },
    onError: (error) => {
      setUploadError(error?.message || "שגיאה בהעלאת הקובץ");
      setTimeout(() => setUploadError(null), 5000);
    },
  });

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadLogo(file, "hero");
    }
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
  };

  // Reset logo error state when logo URL changes
  useEffect(() => {
    setLogoLoadError(false);
    setUploadSuccess(false);
    setUploadError(null);
  }, [developerLogo]);

  // Find matching developer entry from the predefined list
  const matchedDeveloper = DUBAI_DEVELOPERS.find(
    (d) => d.name.toLowerCase() === developerName.toLowerCase()
  );

  /**
   * Handle selecting a developer from the dropdown.
   * Auto-fills the logo URL with the developer's default logo.
   */
  const handleSelectDeveloper = (name: string) => {
    // cmdk lowercases the value; find the original cased name
    const dev = DUBAI_DEVELOPERS.find(
      (d) => d.name.toLowerCase() === name.toLowerCase()
    );
    if (dev) {
      onDeveloperNameChange(dev.name);
      onDeveloperLogoChange(dev.defaultLogoUrl);
    } else {
      onDeveloperNameChange(name);
    }
    setOpen(false);
  };

  /**
   * Handle applying a custom logo URL from the input field.
   */
  const handleApplyLogoUrl = () => {
    const url = logoInput.trim();
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      onDeveloperLogoChange(url);
      setLogoInput("");
      setShowLogoUrlInput(false);
    }
  };

  /**
   * Clear the developer logo
   */
  const handleClearLogo = () => {
    onDeveloperLogoChange("");
    setLogoLoadError(false);
    setUploadSuccess(false);
    setUploadError(null);
  };

  /**
   * Handle creating a new developer
   */
  const handleCreateNewDeveloper = () => {
    if (newDeveloperName.trim()) {
      onDeveloperNameChange(newDeveloperName.trim());
      setNewDeveloperName("");
      setShowCreateNew(false);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Developer Name - Combobox */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="developer-picker">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              שם היזם *
            </span>
          </Label>
          {isValid !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs",
                isValid ? "text-green-600" : "text-red-500"
              )}
            >
              {isValid ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  תקין
                </>
              ) : (
                validationMessage || ""
              )}
            </span>
          )}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between h-11 text-end",
                !developerName && "text-muted-foreground",
                isValid === true && "border-green-300",
                isValid === false && developerName && "border-red-300"
              )}
              data-testid="button-developer-picker"
            >
              <span className="flex items-center gap-2 truncate">
                {developerLogo && !logoLoadError && (
                  <img
                    src={developerLogo}
                    alt=""
                    className="h-5 w-5 object-contain flex-shrink-0"
                    onError={() => setLogoLoadError(true)}
                  />
                )}
                {developerName || "בחר יזם או הקלד שם חדש..."}
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command shouldFilter={true}>
              <div className="flex items-center border-b px-3">
                <Search className="h-4 w-4 shrink-0 text-slate-400 ml-2" />
                <CommandInput
                  placeholder="חפש יזם..."
                  dir="ltr"
                  className="flex-1"
                  data-testid="input-developer-search"
                />
              </div>
              <CommandList>
                <CommandEmpty>
                  <div className="py-6 text-center space-y-3">
                    <Building2 className="h-10 w-10 mx-auto text-slate-300" />
                    <div>
                      <p className="text-sm text-slate-600 font-medium">לא נמצא יזם מתאים</p>
                      <p className="text-xs text-slate-400 mt-1">צור יזם חדש או הקלד שם ידנית</p>
                    </div>
                  </div>
                </CommandEmpty>
                <CommandGroup heading={`יזמים מובילים בדובאי (${DUBAI_DEVELOPERS.length})`}>
                  {DUBAI_DEVELOPERS.map((dev) => (
                    <CommandItem
                      key={dev.name}
                      value={dev.name}
                      onSelect={(value) => handleSelectDeveloper(value)}
                      className="flex items-center gap-3 py-3 cursor-pointer hover:bg-blue-50"
                      data-testid={`developer-option-${dev.name.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={dev.defaultLogoUrl}
                          alt=""
                          className="w-7 h-7 object-contain"
                          width={28}
                          height={28}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = "0";
                          }}
                        />
                      </div>
                      <span className="flex-1 text-sm font-medium">{dev.name}</span>
                      {developerName.toLowerCase() === dev.name.toLowerCase() && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <div className="border-t p-2">
                  {!showCreateNew ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => setShowCreateNew(true)}
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      צור יזם חדש
                    </Button>
                  ) : (
                    <div className="space-y-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-slate-600 font-medium">יזם חדש:</p>
                      <div className="flex gap-2">
                        <Input
                          value={newDeveloperName}
                          onChange={(e) => setNewDeveloperName(e.target.value)}
                          placeholder="הקלד שם היזם..."
                          className="h-9 text-sm flex-1"
                          dir="auto"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateNewDeveloper();
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={handleCreateNewDeveloper}
                          disabled={!newDeveloperName.trim()}
                          className="h-9 bg-blue-600 hover:bg-blue-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCreateNew(false);
                            setNewDeveloperName("");
                          }}
                          className="h-9"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Custom name input below the combobox */}
        <div className="mt-2">
          <Input
            value={developerName}
            onChange={(e) => onDeveloperNameChange(e.target.value)}
            placeholder="או הקלד שם יזם ידנית..."
            className="text-sm h-9"
            dir="auto"
            data-testid="input-developer-name-manual"
          />
        </div>
      </div>

      {/* Developer Logo Section */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          <span className="flex items-center gap-1.5">
            <ImagePlus className="h-4 w-4 text-blue-500" />
            לוגו היזם
          </span>
        </Label>

        {/* Upload Status Messages */}
        {uploadSuccess && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">הלוגו הועלה בהצלחה!</span>
          </div>
        )}
        {uploadError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{uploadError}</span>
          </div>
        )}

        {developerLogo && !logoLoadError ? (
          <div className="space-y-3">
            {/* Large Logo Preview with Hover Zoom */}
            <div
              className="relative group"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
            >
              <div className="w-full aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center p-6 overflow-hidden">
                <img
                  src={developerLogo}
                  alt={`${developerName} logo`}
                  className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
                    logoHovered ? "scale-150" : "scale-100"
                  }`}
                  onError={() => setLogoLoadError(true)}
                />
              </div>
              {logoHovered && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                  <ZoomIn className="h-3 w-3" />
                  תצוגה מוגדלת
                </div>
              )}
            </div>

            {/* Logo URL and Actions */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">כתובת הלוגו:</p>
                <p className="text-xs text-slate-700 truncate font-mono" dir="ltr">
                  {developerLogo}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600"
                  onClick={() => setShowLogoUrlInput(!showLogoUrlInput)}
                  title="שנה URL"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleClearLogo}
                  title="הסר לוגו"
                  data-testid="button-remove-developer-logo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {logoLoadError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  הלוגו לא נטען כראוי. נסה URL אחר או העלה קובץ.
                </span>
              </div>
            )}
            {matchedDeveloper && !developerLogo && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-sm h-10 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => onDeveloperLogoChange(matchedDeveloper.defaultLogoUrl)}
                data-testid="button-use-default-logo"
              >
                <ImagePlus className="h-4 w-4 ms-1.5" />
                השתמש בלוגו ברירת המחדל של {matchedDeveloper.name}
              </Button>
            )}
            <button
              onClick={() => logoFileInputRef.current?.click()}
              disabled={logoUploading}
              className={`w-full py-8 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${
                logoUploading
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {logoUploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  <div className="space-y-1">
                    <span className="text-sm text-blue-600 font-medium block">מעלה לוגו...</span>
                    <div className="w-32 h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${logoProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-500">{logoProgress}%</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400" />
                  <div>
                    <span className="text-sm text-slate-700 font-medium block">לחץ להעלאת לוגו</span>
                    <span className="text-xs text-slate-400">PNG, JPG, SVG עד 5MB</span>
                  </div>
                </>
              )}
            </button>
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* URL input - always shown when no logo, toggled when logo exists */}
        {(!developerLogo || showLogoUrlInput || logoLoadError) && (
          <div className="flex gap-2 mt-2">
            <Input
              value={logoInput}
              onChange={(e) => setLogoInput(e.target.value)}
              placeholder="או הדבק URL של לוגו היזם..."
              dir="ltr"
              className="text-sm h-9 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyLogoUrl();
                }
              }}
              data-testid="input-developer-logo-url"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3"
              onClick={handleApplyLogoUrl}
              disabled={!logoInput.trim()}
              data-testid="button-apply-logo-url"
            >
              החל
            </Button>
          </div>
        )}
      </div>

      {/* Preview Card */}
      {showPreview && developerName && (
        <div className="mt-4">
          <Label className="text-xs text-slate-500 mb-2 block font-medium">
            תצוגה מקדימה - כך ייראה היזם בעמוד הפרויקט:
          </Label>
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              {developerLogo && !logoLoadError ? (
                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center p-2.5 border-2 border-slate-100">
                  <img
                    src={developerLogo}
                    alt={`${developerName} logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={() => setLogoLoadError(true)}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center border-2 border-slate-100">
                  <Building2 className="h-8 w-8 text-slate-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                  יזם הפרויקט
                </p>
                <p className="font-bold text-slate-900 text-xl truncate">
                  {developerName}
                </p>
                {matchedDeveloper && (
                  <Badge variant="secondary" className="mt-1.5 text-xs bg-blue-100 text-blue-700 border-blue-200">
                    <Check className="h-3 w-3 ml-1" />
                    יזם מוכר
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeveloperPicker;
