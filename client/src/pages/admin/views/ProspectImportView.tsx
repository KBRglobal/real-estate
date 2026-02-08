import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Image,
  Table,
  Loader2,
  Check,
  X,
  AlertCircle,
  Eye,
  ArrowRight,
  RefreshCw,
  Trash2,
  Sparkles,
  Building2,
  Lock,
  Rocket,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Prospect } from "@shared/schema";

// Beta mode configuration
const BETA_STORAGE_KEY = "ddl-prospect-import-beta-views";
const MAX_BETA_VIEWS = 3;

interface ProspectImportViewProps {
  prospects: Prospect[];
  onCreateProspect: (data: Partial<Prospect>) => Promise<Prospect>;
  onUpdateProspect: (id: string, data: Partial<Prospect>) => Promise<void>;
  onDeleteProspect: (id: string) => Promise<void>;
  isLoading: boolean;
}

interface ProcessingUpdate {
  prospectId: string;
  status: string;
  progress: number;
  message: string;
}

// Beta mockup helper - tracks views in localStorage
function getBetaViews(): number {
  try {
    return parseInt(localStorage.getItem(BETA_STORAGE_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function incrementBetaViews(): number {
  const current = getBetaViews();
  const next = current + 1;
  try {
    localStorage.setItem(BETA_STORAGE_KEY, String(next));
    // Dispatch custom event for same-tab updates (storage event only fires cross-tab)
    window.dispatchEvent(new CustomEvent("ddl-beta-view-updated"));
  } catch {}
  return next;
}

export function ProspectImportView({
  prospects,
  onCreateProspect,
  onUpdateProspect,
  onDeleteProspect,
  isLoading,
}: ProspectImportViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editedContent, setEditedContent] = useState<{
    title: string;
    description: string;
    sections: unknown[];
  } | null>(null);
  const [processingStatus, setProcessingStatus] = useState<Record<string, ProcessingUpdate>>({});
  const [isReprocessing, setIsReprocessing] = useState<string | null>(null);
  const [betaViews, setBetaViews] = useState(getBetaViews);
  const [showBetaDemo, setShowBetaDemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventSourcesRef = useRef<Record<string, EventSource>>({});
  const retryCountRef = useRef<Record<string, number>>({});
  const retryTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const { toast } = useToast();

  const MAX_RETRIES = 3;
  const getRetryDelay = (retryCount: number) => Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
  
  // Check if beta demo should be hidden (after 3 views)
  const isBetaHidden = betaViews >= MAX_BETA_VIEWS;

  useEffect(() => {
    return () => {
      Object.values(eventSourcesRef.current).forEach(es => es.close());
      Object.values(retryTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const isLegacyBlobUrl = (url: string | null) => url?.startsWith("blob:");

  const getFileTypeFromNameOrMime = (name: string, contentType: string): string => {
    if (contentType.includes("pdf") || name.toLowerCase().endsWith(".pdf")) return "pdf";
    if (contentType.includes("zip") || name.toLowerCase().endsWith(".zip")) return "zip";
    if (name.toLowerCase().endsWith(".pptx") || name.toLowerCase().endsWith(".ppt")) return "ppt";
    if (contentType.includes("powerpoint") || contentType.includes("presentation")) return "ppt";
    return "pdf";
  };

  const { uploadFile, isUploading, progress: uploadProgress } = useUpload({
    onSuccess: async (response) => {
      try {
        const prospect = await onCreateProspect({
          fileName: response.metadata.name,
          fileType: getFileTypeFromNameOrMime(response.metadata.name, response.metadata.contentType),
          fileUrl: response.objectPath,
          status: "uploaded",
        });
        
        toast({ 
          title: "הקובץ הועלה בהצלחה", 
          description: "לחץ על 'עבד עם AI' כדי להתחיל בעיבוד" 
        });

        startProcessing(prospect.id);
      } catch (error) {
        toast({
          title: "שגיאה ביצירת רשומה",
          description: "לא ניתן לשמור את הקובץ",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "שגיאה בהעלאה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (file: File) => {
    // File size validation - max 50MB
    const maxSizeBytes = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSizeBytes) {
      toast({
        title: "הקובץ גדול מדי",
        description: "גודל הקובץ המקסימלי הוא 50MB",
        variant: "destructive",
      });
      return;
    }

    const validMimeTypes = [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    const validExtensions = [".pdf", ".zip", ".ppt", ".pptx"];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

    const isValidType = validMimeTypes.includes(file.type) || validExtensions.includes(fileExtension);

    if (!isValidType) {
      toast({
        title: "סוג קובץ לא נתמך",
        description: "יש להעלות קובץ PDF, ZIP או PPT",
        variant: "destructive",
      });
      return;
    }

    await uploadFile(file);
  };

  const startProcessing = async (prospectId: string, isRetry = false) => {
    // Clean up existing connection
    if (eventSourcesRef.current[prospectId]) {
      eventSourcesRef.current[prospectId].close();
      delete eventSourcesRef.current[prospectId];
    }

    // Clear any pending retry timeout
    if (retryTimeoutRef.current[prospectId]) {
      clearTimeout(retryTimeoutRef.current[prospectId]);
      delete retryTimeoutRef.current[prospectId];
    }

    // Initialize retry count if not a retry
    if (!isRetry) {
      retryCountRef.current[prospectId] = 0;
    }

    const currentRetry = retryCountRef.current[prospectId] || 0;

    setProcessingStatus((prev) => ({
      ...prev,
      [prospectId]: {
        prospectId,
        status: "starting",
        progress: 0,
        message: currentRetry > 0 ? `מתחבר מחדש (ניסיון ${currentRetry}/${MAX_RETRIES})...` : "מתחיל עיבוד..."
      },
    }));

    const createEventSource = () => {
      try {
        const eventSource = new EventSource(`/api/prospects/${prospectId}/process-stream`);
        eventSourcesRef.current[prospectId] = eventSource;

        eventSource.onmessage = (event) => {
          // Reset retry count on successful message
          retryCountRef.current[prospectId] = 0;

          const update = JSON.parse(event.data);

          if (update.type === "complete") {
            eventSource.close();
            delete eventSourcesRef.current[prospectId];
            delete retryCountRef.current[prospectId];
            setProcessingStatus((prev) => {
              const newStatus = { ...prev };
              delete newStatus[prospectId];
              return newStatus;
            });
            queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
            queryClient.invalidateQueries({ queryKey: ["/api/projects"] });

            if (update.success && update.projectSlug) {
              toast({
                title: "הפרויקט נוצר בהצלחה!",
                description: (
                  <div className="flex flex-col gap-2">
                    <span>הפרויקט מוכן לצפייה</span>
                    <a
                      href={`/project/${update.projectSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline font-medium"
                    >
                      לחץ כאן לצפייה בפרויקט
                    </a>
                  </div>
                ),
                duration: 10000,
              });
            } else if (update.error) {
              toast({
                title: "שגיאה בעיבוד",
                description: update.error,
                variant: "destructive"
              });
            } else {
              toast({ title: "העיבוד הושלם!", description: "הפרויקט מוכן" });
            }
          } else if (update.type === "error") {
            eventSource.close();
            delete eventSourcesRef.current[prospectId];
            delete retryCountRef.current[prospectId];
            setProcessingStatus((prev) => ({
              ...prev,
              [prospectId]: { ...prev[prospectId], status: "failed", message: update.message },
            }));
            toast({ title: "שגיאה בעיבוד", description: update.message, variant: "destructive" });
          } else {
            setProcessingStatus((prev) => ({
              ...prev,
              [prospectId]: update,
            }));
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          delete eventSourcesRef.current[prospectId];

          const currentRetryCount = retryCountRef.current[prospectId] || 0;

          if (currentRetryCount < MAX_RETRIES) {
            // Increment retry count
            retryCountRef.current[prospectId] = currentRetryCount + 1;
            const delay = getRetryDelay(currentRetryCount);

            setProcessingStatus((prev) => ({
              ...prev,
              [prospectId]: {
                ...prev[prospectId],
                status: "retrying",
                message: `חיבור נכשל, מנסה שוב בעוד ${delay / 1000} שניות...`
              },
            }));

            // Schedule retry with exponential backoff
            retryTimeoutRef.current[prospectId] = setTimeout(() => {
              startProcessing(prospectId, true);
            }, delay);
          } else {
            // All retries exhausted
            delete retryCountRef.current[prospectId];
            setProcessingStatus((prev) => ({
              ...prev,
              [prospectId]: { ...prev[prospectId], status: "failed", message: "חיבור נכשל" },
            }));
            toast({
              title: "שגיאה בחיבור",
              description: "לא ניתן להתחבר לשרת לאחר מספר ניסיונות",
              variant: "destructive",
            });
          }
        };
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "לא ניתן להתחיל עיבוד",
          variant: "destructive",
        });
      }
    };

    createEventSource();
  };

  const reprocessProspect = async (prospectId: string) => {
    setIsReprocessing(prospectId);
    try {
      const result = await apiRequest("POST", `/api/prospects/${prospectId}/reprocess`);
      const data = await result.json();
      
      if (data.success && data.projectSlug) {
        toast({ title: "עובד מחדש בהצלחה!", description: "הפרויקט עודכן" });
        queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        setIsPreviewOpen(false);
        window.open(`/project/${data.projectSlug}`, "_blank");
      } else {
        throw new Error(data.error || "Failed to reprocess prospect");
      }
    } catch (error) {
      toast({
        title: "שגיאה בעיבוד מחדש",
        description: error instanceof Error ? error.message : "נסה שוב",
        variant: "destructive",
      });
    } finally {
      setIsReprocessing(null);
    }
  };

  const createProjectManually = async (prospectId: string) => {
    try {
      const result = await apiRequest("POST", `/api/prospects/${prospectId}/create-project`);
      const data = await result.json();
      
      if (data.success) {
        toast({ 
          title: "הפרויקט נוצר בהצלחה!", 
          description: (
            <a 
              href={`/project/${data.projectSlug}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              לחץ לצפייה בפרויקט
            </a>
          ) as unknown as string
        });
        queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      } else {
        throw new Error(data.error || "Failed to create project");
      }
    } catch (error) {
      toast({
        title: "שגיאה ביצירת פרויקט",
        description: error instanceof Error ? error.message : "נסה שוב",
        variant: "destructive",
      });
    }
  };

  const createMiniSiteManually = async (prospectId: string) => {
    try {
      const result = await apiRequest("POST", `/api/prospects/${prospectId}/create-minisite`);
      const data = await result.json();
      
      if (data.success) {
        toast({ 
          title: "המיני-סייט נוצר בהצלחה!", 
          description: (
            <a 
              href={`/s/${data.miniSiteSlug}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              לחץ לצפייה במיני-סייט
            </a>
          ) as unknown as string
        });
        queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
        queryClient.invalidateQueries({ queryKey: ["/api/mini-sites"] });
      } else {
        throw new Error(data.error || "Failed to create mini-site");
      }
    } catch (error) {
      toast({
        title: "שגיאה ביצירת מיני-סייט",
        description: error instanceof Error ? error.message : "נסה שוב",
        variant: "destructive",
      });
    }
  };

  const openPreview = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setEditedContent({
      title: prospect.generatedTitle || "",
      description: prospect.generatedDescription || "",
      sections: (prospect.generatedSections as unknown[]) || [],
    });
    setIsPreviewOpen(true);
  };

  const handleDelete = async (prospect: Prospect) => {
    if (!confirm(`למחוק את "${prospect.fileName}"?`)) return;

    try {
      await onDeleteProspect(prospect.id);
      toast({ title: "נמחק בהצלחה" });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null, prospectId: string) => {
    const processing = processingStatus[prospectId];
    
    if (processing) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> {processing.message}
        </span>
      );
    }

    switch (status) {
      case "uploaded":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1">
            <Upload className="h-3 w-3" /> הועלה
          </span>
        );
      case "processing":
      case "extracting":
      case "mapping":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> מעבד
          </span>
        );
      case "ready":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
            <Check className="h-3 w-3" /> מוכן
          </span>
        );
      case "published":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
            <Building2 className="h-3 w-3" /> פורסם
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
            <X className="h-3 w-3" /> נכשל
          </span>
        );
      default:
        return null;
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (fileType === "pdf") return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType === "zip") return <FileText className="h-8 w-8 text-yellow-500" />;
    if (fileType === "ppt" || fileType === "pptx")
      return <FileText className="h-8 w-8 text-orange-500" />;
    return <FileText className="h-8 w-8 text-slate-400" />;
  };

  // Handle demo button click
  const handleShowDemo = () => {
    const newViews = incrementBetaViews();
    setBetaViews(newViews);
    setShowBetaDemo(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If beta views exceeded, don't show this feature at all
  if (isBetaHidden) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Beta Banner */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Card className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 border-0 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Rocket className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">ייבוא חכם</h2>
                  <Badge className="bg-amber-400 text-amber-900 border-0 font-bold">
                    BETA
                  </Badge>
                </div>
                <p className="text-white/80">הפיכת פרוספקטים לדפי נחיתה באמצעות AI</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Upload className="h-6 w-6 mb-2" />
                <h3 className="font-semibold mb-1">העלה PDF</h3>
                <p className="text-sm text-white/70">גרור ושחרר פרוספקט של פרויקט נדל"ן</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Sparkles className="h-6 w-6 mb-2" />
                <h3 className="font-semibold mb-1">חילוץ אוטומטי</h3>
                <p className="text-sm text-white/70">AI מחלץ תמונות, מחירים ופרטים</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Building2 className="h-6 w-6 mb-2" />
                <h3 className="font-semibold mb-1">דף מוכן</h3>
                <p className="text-sm text-white/70">פרויקט מלא נוצר אוטומטית</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Lock className="h-4 w-4" />
                <span>פיצ'ר זה בפיתוח ויהיה זמין בקרוב</span>
              </div>
              {!showBetaDemo && (
                <Button 
                  onClick={handleShowDemo}
                  className="bg-white text-indigo-600 hover:bg-white/90"
                  data-testid="button-show-demo"
                >
                  <Eye className="h-4 w-4 ml-2" />
                  צפה בהדגמה ({MAX_BETA_VIEWS - betaViews} צפיות נותרו)
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Demo Section - Only show when user clicks */}
      {showBetaDemo && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Mockup Upload Area */}
          <Card className="bg-white shadow-sm border-2 border-dashed border-slate-300 p-8 opacity-75 cursor-not-allowed">
            <div className="text-center">
              <div className="relative inline-block">
                <Upload className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  BETA
                </div>
              </div>
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                גרור ושחרר קובץ כאן
              </h3>
              <p className="text-slate-400 mb-4">
                PDF, ZIP, PPT • עד 50MB
              </p>
              <Button disabled className="bg-slate-200 text-slate-400 cursor-not-allowed">
                <Lock className="h-4 w-4 ml-2" />
                פיצ'ר בפיתוח
              </Button>
            </div>
          </Card>

          {/* Example Result Mockup */}
          <Card className="bg-white shadow-lg border-slate-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">דוגמה לתוצאה</h3>
                  <p className="text-sm text-green-600">כך ייראה פרויקט שיובא אוטומטית</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Mockup Project Preview */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left - Image Gallery Mockup */}
                <div className="space-y-3">
                  <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 right-4 text-white">
                      <h4 className="text-xl font-bold">Provenza Residences</h4>
                      <p className="text-white/80 text-sm">JVC, Dubai</p>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-amber-500 text-white border-0">Premium</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="aspect-square bg-slate-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>

                {/* Right - Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">יזם</p>
                    <p className="font-semibold text-slate-900">IKR Development</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">סוגי יחידות</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">סטודיו</Badge>
                      <Badge variant="outline">1 חדר</Badge>
                      <Badge variant="outline">2 חדרים</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">מחיר התחלתי</p>
                    <p className="text-2xl font-bold text-primary">AED 750,000</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">מאפיינים שחולצו</p>
                    <div className="flex flex-wrap gap-2">
                      {["בריכה פרטית", "חדר כושר", "Smart Home", "קולנוע גג"].map(f => (
                        <span key={f} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex gap-2">
                      <a 
                        href="/s/provenza-residences" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          <Eye className="h-4 w-4 ml-2" />
                          צפה בהדגמה
                        </Button>
                      </a>
                      <a 
                        href="/s/provenza-residences" 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Coming Soon Note */}
          <Card className="bg-amber-50 border-amber-200 p-4">
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium mb-1">פיצ'ר זה בגרסת Beta</p>
                <p className="text-amber-700">
                  הייבוא החכם יהיה זמין בקרוב. בינתיים, תוכל ליצור פרויקטים באופן ידני דרך "פרויקטים חדש".
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}


    </div>
  );
}
