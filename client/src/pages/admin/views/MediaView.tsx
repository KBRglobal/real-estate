import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  Upload,
  Trash2,
  Search,
  Loader2,
  Grid,
  List,
  File,
  Video,
  FileText,
  Download,
  Copy,
  Check,
  Folder,
  FolderPlus,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  Home,
  Move,
  Eye,
  Info,
  CheckSquare,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { Media } from "@shared/schema";

interface MediaViewProps {
  media: Media[];
  onUpload: (file: File, folder?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateAlt: (id: string, altText: string) => Promise<void>;
  onUpdateMedia: (id: string, data: Partial<Media>) => Promise<void>;
  onSyncR2?: () => Promise<{ newlySynced: number; totalR2Files: number }>;
  isLoading: boolean;
}

// Helper to get media type from type field
function getMediaType(type: string): "image" | "video" | "document" | "other" {
  if (!type) return "other";
  if (type.startsWith("image/") || type === "image") return "image";
  if (type.startsWith("video/") || type === "video") return "video";
  if (
    type.startsWith("application/pdf") ||
    type.includes("document") ||
    type === "document"
  )
    return "document";
  return "other";
}

// Helper: get unique folders from media items
function getFoldersFromMedia(mediaItems: Media[]): string[] {
  const folderSet = new Set<string>();
  mediaItems.forEach((item) => {
    if (item.folder) {
      folderSet.add(item.folder);
    }
  });
  return Array.from(folderSet).sort();
}

// Format file size
function formatFileSize(bytes: number | null) {
  if (!bytes) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

// Storage limit displayed to client (2 GB default plan)
const STORAGE_LIMIT_GB = 2;
const STORAGE_LIMIT = STORAGE_LIMIT_GB * 1024 * 1024 * 1024;

// Format date
function formatDate(date: Date | string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function MediaView({
  media,
  onUpload,
  onDelete,
  onUpdateAlt,
  onUpdateMedia,
  onSyncR2,
  isLoading,
}: MediaViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveTargetFolder, setMoveTargetFolder] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const altTextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  // Debounced alt text update function
  const debouncedUpdateAlt = useCallback(
    (id: string, altText: string) => {
      if (altTextTimeoutRef.current) {
        clearTimeout(altTextTimeoutRef.current);
      }
      altTextTimeoutRef.current = setTimeout(() => {
        onUpdateAlt(id, altText);
      }, 500);
    },
    [onUpdateAlt]
  );

  // Get all unique folders
  const folders = useMemo(() => getFoldersFromMedia(media), [media]);

  // Count items per folder
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: media.length, unfiled: 0 };
    media.forEach((item) => {
      if (item.folder) {
        counts[item.folder] = (counts[item.folder] || 0) + 1;
      } else {
        counts["unfiled"]++;
      }
    });
    return counts;
  }, [media]);

  // Total storage used
  const storageUsed = useMemo(() => {
    return media.reduce((sum, item) => sum + (item.size || 0), 0);
  }, [media]);

  const storagePercent = Math.min((storageUsed / STORAGE_LIMIT) * 100, 100);

  // Filter media based on search, type, and current folder
  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const mediaType = getMediaType(item.type);
      const matchesType = typeFilter === "all" || mediaType === typeFilter;
      const matchesFolder =
        currentFolder === null ||
        (currentFolder === "__unfiled__"
          ? !item.folder
          : item.folder === currentFolder);
      return matchesSearch && matchesType && matchesFolder;
    });
  }, [media, searchTerm, typeFilter, currentFolder]);

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await onUpload(
          files[i],
          currentFolder && currentFolder !== "__unfiled__"
            ? currentFolder
            : undefined
        );
      }
      toast({
        title:
          files.length > 1
            ? `${files.length} \u05E7\u05D1\u05E6\u05D9\u05DD \u05D4\u05D5\u05E2\u05DC\u05D5 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4`
            : "\u05D4\u05E7\u05D5\u05D1\u05E5 \u05D4\u05D5\u05E2\u05DC\u05D4 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4",
      });
    } catch (error) {
      toast({
        title: "\u05E9\u05D2\u05D9\u05D0\u05D4",
        description: "\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05D4\u05E2\u05DC\u05D5\u05EA \u05D0\u05EA \u05D4\u05E7\u05D5\u05D1\u05E5",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Delete single item
  const handleDelete = async (item: Media) => {
    setDeleteTarget(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
      toast({ title: "\u05D4\u05E7\u05D5\u05D1\u05E5 \u05E0\u05DE\u05D7\u05E7 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4" });
      setIsDetailOpen(false);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
    } catch (error) {
      toast({
        title: "\u05E9\u05D2\u05D9\u05D0\u05D4",
        description: "\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05DE\u05D7\u05D5\u05E7 \u05D0\u05EA \u05D4\u05E7\u05D5\u05D1\u05E5",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await onDelete(id);
      }
      toast({ title: `${ids.length} \u05E7\u05D1\u05E6\u05D9\u05DD \u05E0\u05DE\u05D7\u05E7\u05D5 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4` });
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      toast({
        title: "\u05E9\u05D2\u05D9\u05D0\u05D4",
        description: "\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05DE\u05D7\u05D5\u05E7 \u05D7\u05DC\u05E7 \u05DE\u05D4\u05E7\u05D1\u05E6\u05D9\u05DD",
        variant: "destructive",
      });
    } finally {
      setShowBulkDeleteDialog(false);
    }
  };

  // Move media to folder
  const handleMoveMedia = async () => {
    try {
      const ids = Array.from(selectedIds);
      const folder =
        moveTargetFolder === "__unfiled__" ? null : moveTargetFolder;
      for (const id of ids) {
        await onUpdateMedia(id, { folder } as Partial<Media>);
      }
      toast({
        title: `${ids.length} \u05E7\u05D1\u05E6\u05D9\u05DD \u05D4\u05D5\u05E2\u05D1\u05E8\u05D5${
          folder ? ` \u05DC\u05EA\u05D9\u05E7\u05D9\u05D9\u05EA ${folder}` : " \u05DC\u05DC\u05D0 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"
        }`,
      });
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      toast({
        title: "\u05E9\u05D2\u05D9\u05D0\u05D4",
        description: "\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05D4\u05E2\u05D1\u05D9\u05E8 \u05D0\u05EA \u05D4\u05E7\u05D1\u05E6\u05D9\u05DD",
        variant: "destructive",
      });
    } finally {
      setShowMoveDialog(false);
      setMoveTargetFolder("");
    }
  };

  // Create new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const folderName = newFolderName.trim().toLowerCase().replace(/\s+/g, "-");
    setCurrentFolder(folderName);
    setShowNewFolderDialog(false);
    setNewFolderName("");
    toast({ title: `\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4 "${folderName}" \u05E0\u05D5\u05E6\u05E8\u05D4` });
  };

  // Copy URL
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast({ title: "\u05D4\u05E7\u05D9\u05E9\u05D5\u05E8 \u05D4\u05D5\u05E2\u05EA\u05E7" });
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Sync from R2
  const handleSyncR2 = async () => {
    if (!onSyncR2) return;
    setSyncing(true);
    try {
      const result = await onSyncR2();
      toast({
        title: "סנכרון הושלם",
        description: result.newlySynced > 0
          ? `${result.newlySynced} קבצים חדשים סונכרנו מתוך ${result.totalR2Files} ב-R2`
          : `כל ${result.totalR2Files} הקבצים כבר מסונכרנים`,
      });
    } catch (error) {
      toast({
        title: "שגיאה בסנכרון",
        description: "לא ניתן לסנכרן מ-R2",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all visible items
  const selectAll = () => {
    if (selectedIds.size === filteredMedia.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMedia.map((m) => m.id)));
    }
  };

  // Get media icon
  const getMediaIcon = (
    mimeType: string,
    size: "sm" | "md" | "lg" = "md"
  ) => {
    const sizeClass =
      size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
    const type = getMediaType(mimeType);
    switch (type) {
      case "image":
        return <Image className={`${sizeClass} text-blue-500`} />;
      case "video":
        return <Video className={`${sizeClass} text-purple-500`} />;
      case "document":
        return <FileText className={`${sizeClass} text-orange-500`} />;
      default:
        return <File className={`${sizeClass} text-slate-400`} />;
    }
  };

  // Open detail panel
  const openDetail = (item: Media) => {
    if (isSelectionMode) {
      toggleSelection(item.id);
      return;
    }
    setSelectedMedia(item);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-120px)]" dir="rtl">
        {/* Folder Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 border-e border-slate-200 bg-slate-50/50"
            >
              <div className="w-[240px] h-full flex flex-col">
                <div className="p-3 flex items-center justify-between border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {"\u05EA\u05D9\u05E7\u05D9\u05D5\u05EA"}
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowNewFolderDialog(true)}
                        className="h-7 w-7 p-0"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{"\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4 \u05D7\u05D3\u05E9\u05D4"}</TooltipContent>
                  </Tooltip>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-0.5">
                    {/* All files */}
                    <button
                      onClick={() => setCurrentFolder(null)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-start ${
                        currentFolder === null
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Home className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{"\u05DB\u05DC \u05D4\u05E7\u05D1\u05E6\u05D9\u05DD"}</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-1.5"
                      >
                        {folderCounts.all}
                      </Badge>
                    </button>

                    {/* Unfiled */}
                    <button
                      onClick={() => setCurrentFolder("__unfiled__")}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-start ${
                        currentFolder === "__unfiled__"
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <File className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{"\u05DC\u05DC\u05D0 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"}</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-1.5"
                      >
                        {folderCounts.unfiled || 0}
                      </Badge>
                    </button>

                    <Separator className="my-2" />

                    {/* Folders */}
                    {folders.map((folder) => (
                      <button
                        key={folder}
                        onClick={() => setCurrentFolder(folder)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-start ${
                          currentFolder === folder
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {currentFolder === folder ? (
                          <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-500" />
                        ) : (
                          <Folder className="h-4 w-4 flex-shrink-0 text-amber-500" />
                        )}
                        <span className="flex-1 truncate">{folder}</span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1.5"
                        >
                          {folderCounts[folder] || 0}
                        </Badge>
                      </button>
                    ))}

                    {folders.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4 px-2">
                        {"\u05D0\u05D9\u05DF \u05EA\u05D9\u05E7\u05D9\u05D5\u05EA \u05E2\u05D3\u05D9\u05D9\u05DF. \u05E6\u05D5\u05E8 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4 \u05D7\u05D3\u05E9\u05D4 \u05DB\u05D3\u05D9 \u05DC\u05D0\u05E8\u05D2\u05DF \u05D0\u05EA \u05D4\u05E7\u05D1\u05E6\u05D9\u05DD \u05E9\u05DC\u05DA."}
                      </p>
                    )}
                  </div>
                </ScrollArea>

                {/* Storage indicator */}
                <div className="p-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                    <span>{"אחסון"}</span>
                    <span dir="ltr">{formatFileSize(storageUsed)} / {STORAGE_LIMIT_GB} GB</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        storagePercent >= 100
                          ? "bg-red-600"
                          : storagePercent > 90
                          ? "bg-red-500"
                          : storagePercent > 70
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.max(storagePercent, 0.5)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {media.length} {"קבצים"} · {storagePercent.toFixed(1)}%
                  </p>
                  {storagePercent >= 80 && storagePercent < 100 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        {"האחסון כמעט מלא"}
                      </p>
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        {"צור קשר לשדרוג חבילת האחסון"}
                      </p>
                    </div>
                  )}
                  {storagePercent >= 100 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-[11px] text-red-700 font-medium flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        {"האחסון מלא!"}
                      </p>
                      <p className="text-[10px] text-red-600 mt-0.5">
                        {"לא ניתן להעלות קבצים חדשים. צור קשר לשדרוג."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex-shrink-0 border-b border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-3">
              {/* Breadcrumb Row */}
              <div className="flex items-center gap-2 text-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="h-7 w-7 p-0"
                >
                  {isSidebarOpen ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <button
                  onClick={() => setCurrentFolder(null)}
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                >
                  {"\u05E1\u05E4\u05E8\u05D9\u05D9\u05EA \u05DE\u05D3\u05D9\u05D4"}
                </button>
                {currentFolder && (
                  <>
                    <ChevronLeft className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-900 font-medium">
                      {currentFolder === "__unfiled__"
                        ? "\u05DC\u05DC\u05D0 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"
                        : currentFolder}
                    </span>
                  </>
                )}
                <div className="flex-1" />
                <span className="text-slate-400 text-xs">
                  {filteredMedia.length} {"\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD"}
                </span>
              </div>

              {/* Actions Row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Upload button (right side in RTL) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.svg"
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
                <Button
                  onClick={() => {
                    if (storagePercent >= 100) {
                      toast({
                        title: "האחסון מלא",
                        description: "לא ניתן להעלות קבצים חדשים. צור קשר לשדרוג חבילת האחסון.",
                        variant: "destructive",
                      });
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
                  disabled={uploading || storagePercent >= 100}
                  className={`h-9 ${storagePercent >= 100 ? "bg-slate-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 ms-2" />
                  )}
                  {"\u05D4\u05E2\u05DC\u05D0\u05EA \u05E7\u05D1\u05E6\u05D9\u05DD"}
                </Button>

                {/* Sync from R2 button */}
                {onSyncR2 && (
                  <Button
                    onClick={handleSyncR2}
                    disabled={syncing}
                    variant="outline"
                    className="h-9 border-slate-200"
                  >
                    {syncing ? (
                      <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 ms-2" />
                    )}
                    {"סנכרון מ-R2"}
                  </Button>
                )}

                <div className="flex-1" />

                {/* Selection actions */}
                {isSelectionMode && selectedIds.size > 0 && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowBulkDeleteDialog(true)}
                          className="h-9 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 ms-1" />
                          {"\u05DE\u05D7\u05E7"} ({selectedIds.size})
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{"\u05DE\u05D7\u05E7 \u05E0\u05D1\u05D7\u05E8\u05D9\u05DD"}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowMoveDialog(true)}
                          className="h-9"
                        >
                          <Move className="h-4 w-4 ms-1" />
                          {"\u05D4\u05E2\u05D1\u05E8"} ({selectedIds.size})
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{"\u05D4\u05E2\u05D1\u05E8 \u05DC\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"}</TooltipContent>
                    </Tooltip>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={selectAll}
                      className="h-9 text-sm"
                    >
                      {selectedIds.size === filteredMedia.length
                        ? "\u05D1\u05D8\u05DC \u05D1\u05D7\u05D9\u05E8\u05D4"
                        : "\u05D1\u05D7\u05E8 \u05D4\u05DB\u05DC"}
                    </Button>
                  </>
                )}

                {/* Selection mode toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={isSelectionMode ? "default" : "outline"}
                      onClick={() => {
                        setIsSelectionMode(!isSelectionMode);
                        if (isSelectionMode) {
                          setSelectedIds(new Set());
                        }
                      }}
                      className={`h-9 ${
                        isSelectionMode
                          ? "bg-blue-500 hover:bg-blue-600"
                          : ""
                      }`}
                    >
                      <CheckSquare className="h-4 w-4 ms-1" />
                      {"\u05D1\u05D7\u05D9\u05E8\u05D4"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{"\u05DE\u05E6\u05D1 \u05D1\u05D7\u05D9\u05E8\u05D4 \u05DE\u05E8\u05D5\u05D1\u05D4"}</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-6" />

                {/* View toggles */}
                <div className="flex border border-slate-200 rounded-md overflow-hidden">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        onClick={() => setViewMode("grid")}
                        className={`rounded-none h-9 w-9 p-0 ${
                          viewMode === "grid"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : ""
                        }`}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{"\u05EA\u05E6\u05D5\u05D2\u05EA \u05E8\u05E9\u05EA"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={viewMode === "list" ? "default" : "ghost"}
                        onClick={() => setViewMode("list")}
                        className={`rounded-none h-9 w-9 p-0 ${
                          viewMode === "list"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : ""
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{"\u05EA\u05E6\u05D5\u05D2\u05EA \u05E8\u05E9\u05D9\u05DE\u05D4"}</TooltipContent>
                  </Tooltip>
                </div>

                {/* Type filter */}
                <Select dir="rtl" value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-28 h-9 bg-white border-slate-200 text-sm">
                    <SelectValue placeholder={"\u05E1\u05D5\u05D2"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"\u05D4\u05DB\u05DC"}</SelectItem>
                    <SelectItem value="image">{"\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA"}</SelectItem>
                    <SelectItem value="video">{"\u05E1\u05E8\u05D8\u05D5\u05E0\u05D9\u05DD"}</SelectItem>
                    <SelectItem value="document">{"\u05DE\u05E1\u05DE\u05DB\u05D9\u05DD"}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search (left side in RTL) */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={"\u05D7\u05D9\u05E4\u05D5\u05E9 \u05E7\u05D1\u05E6\u05D9\u05DD..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pe-10 h-9 bg-white border-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <ScrollArea className="flex-1 bg-white">
            <div className="p-4">
              {filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    {searchTerm || typeFilter !== "all" ? (
                      <Search className="h-8 w-8 text-slate-300" />
                    ) : currentFolder ? (
                      <FolderOpen className="h-8 w-8 text-slate-300" />
                    ) : (
                      <Image className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <p className="text-lg text-slate-500 font-medium">
                    {searchTerm || typeFilter !== "all"
                      ? "\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05EA\u05D5\u05E6\u05D0\u05D5\u05EA"
                      : currentFolder
                      ? "\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4 \u05E8\u05D9\u05E7\u05D4"
                      : "\u05E1\u05E4\u05E8\u05D9\u05D9\u05EA \u05D4\u05DE\u05D3\u05D9\u05D4 \u05E8\u05D9\u05E7\u05D4"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {searchTerm || typeFilter !== "all"
                      ? "\u05E0\u05E1\u05D4 \u05DC\u05E9\u05E0\u05D5\u05EA \u05D0\u05EA \u05DE\u05D5\u05E0\u05D7\u05D9 \u05D4\u05D7\u05D9\u05E4\u05D5\u05E9"
                      : "\u05D4\u05E2\u05DC\u05D4 \u05E7\u05D1\u05E6\u05D9\u05DD \u05DB\u05D3\u05D9 \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC"}
                  </p>
                  {!searchTerm && typeFilter === "all" && (
                    <div className="flex gap-2 mt-4">
                      {onSyncR2 && (
                        <Button
                          onClick={handleSyncR2}
                          disabled={syncing}
                          variant="outline"
                          className="border-slate-200"
                        >
                          {syncing ? (
                            <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 ms-2" />
                          )}
                          {"סנכרון מ-R2"}
                        </Button>
                      )}
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Upload className="h-4 w-4 ms-2" />
                        {"\u05D4\u05E2\u05DC\u05D0\u05EA \u05E7\u05D1\u05E6\u05D9\u05DD"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                /* GRID VIEW */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredMedia.map((item) => {
                    const mediaType = getMediaType(item.type);
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className="group relative"
                      >
                        <Card
                          className={`bg-white shadow-sm overflow-hidden cursor-pointer transition-all ${
                            isSelected
                              ? "ring-2 ring-blue-500 border-blue-300"
                              : "border-slate-200 hover:border-blue-300 hover:shadow-md"
                          }`}
                          onClick={() => openDetail(item)}
                        >
                          {/* Selection checkbox */}
                          {isSelectionMode && (
                            <div className="absolute top-2 end-2 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelection(item.id);
                                }}
                                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-blue-500 text-white"
                                    : "bg-white/80 border border-slate-300 text-transparent hover:border-blue-400"
                                }`}
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          {/* Thumbnail */}
                          <div className="aspect-square relative bg-slate-50 overflow-hidden">
                            {mediaType === "image" ? (
                              <img
                                src={item.url}
                                alt={item.altText || item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                {getMediaIcon(item.type, "lg")}
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                  {item.type.split("/").pop() || item.type}
                                </span>
                              </div>
                            )}

                            {/* Hover overlay */}
                            {!isSelectionMode && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDetail(item);
                                      }}
                                      className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30"
                                    >
                                      <Eye className="h-4 w-4 text-white" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{"\u05EA\u05E6\u05D5\u05D2\u05D4 \u05DE\u05E7\u05D3\u05D9\u05DE\u05D4"}</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyUrl(item.url);
                                      }}
                                      className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30"
                                    >
                                      {copiedUrl === item.url ? (
                                        <Check className="h-4 w-4 text-green-400" />
                                      ) : (
                                        <Copy className="h-4 w-4 text-white" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{"\u05D4\u05E2\u05EA\u05E7 \u05E7\u05D9\u05E9\u05D5\u05E8"}</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item);
                                      }}
                                      className="h-8 w-8 p-0 bg-white/20 hover:bg-red-500/50"
                                    >
                                      <Trash2 className="h-4 w-4 text-white" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{"\u05DE\u05D7\u05E7"}</TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-2">
                            <p className="text-xs text-slate-900 truncate font-medium">
                              {item.name}
                            </p>
                            <div className="flex items-center justify-between mt-0.5">
                              {item.folder ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] h-4 px-1"
                                >
                                  {item.folder}
                                </Badge>
                              ) : (
                                <span />
                              )}
                              <span className="text-[10px] text-slate-400">
                                {formatFileSize(item.size)}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW */
                <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50">
                          {isSelectionMode && (
                            <th className="px-3 py-2.5 w-10">
                              <button
                                onClick={selectAll}
                                className="w-5 h-5 rounded flex items-center justify-center border border-slate-300 hover:border-blue-400 transition-colors"
                              >
                                {selectedIds.size === filteredMedia.length &&
                                filteredMedia.length > 0 ? (
                                  <Check className="h-3 w-3 text-blue-600" />
                                ) : null}
                              </button>
                            </th>
                          )}
                          <th className="px-3 py-2.5 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {"\u05E7\u05D5\u05D1\u05E5"}
                          </th>
                          <th className="px-3 py-2.5 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {"\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"}
                          </th>
                          <th className="px-3 py-2.5 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {"\u05E1\u05D5\u05D2"}
                          </th>
                          <th className="px-3 py-2.5 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {"\u05D2\u05D5\u05D3\u05DC"}
                          </th>
                          <th className="px-3 py-2.5 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {"\u05EA\u05D0\u05E8\u05D9\u05DA"}
                          </th>
                          <th className="px-3 py-2.5 text-start text-xs font-medium text-slate-500 uppercase tracking-wider w-28">
                            {"\u05E4\u05E2\u05D5\u05DC\u05D5\u05EA"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredMedia.map((item) => {
                          const mediaType = getMediaType(item.type);
                          const isSelected = selectedIds.has(item.id);
                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-slate-50"
                              }`}
                              onClick={() => openDetail(item)}
                            >
                              {isSelectionMode && (
                                <td className="px-3 py-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSelection(item.id);
                                    }}
                                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? "bg-blue-500 text-white"
                                        : "border border-slate-300 hover:border-blue-400"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </button>
                                </td>
                              )}
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {mediaType === "image" ? (
                                      <img
                                        src={item.url}
                                        alt={item.altText || item.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    ) : (
                                      getMediaIcon(item.type, "sm")
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm text-slate-900 truncate max-w-[200px]">
                                      {item.name}
                                    </p>
                                    {item.altText && (
                                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                        {item.altText}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                {item.folder ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Folder className="h-3 w-3 ms-1" />
                                    {item.folder}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                  {getMediaIcon(item.type, "sm")}
                                  <span className="text-xs text-slate-500">
                                    {item.type.split("/").pop() || item.type}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-xs text-slate-500">
                                {formatFileSize(item.size)}
                              </td>
                              <td className="px-3 py-2 text-xs text-slate-500">
                                {formatDate(item.createdAt)}
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyUrl(item.url);
                                        }}
                                        className="h-7 w-7 p-0"
                                      >
                                        {copiedUrl === item.url ? (
                                          <Check className="h-3.5 w-3.5 text-green-600" />
                                        ) : (
                                          <Copy className="h-3.5 w-3.5" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{"\u05D4\u05E2\u05EA\u05E7 \u05E7\u05D9\u05E9\u05D5\u05E8"}</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(item.url, "_blank");
                                        }}
                                        className="h-7 w-7 p-0"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{"\u05D4\u05D5\u05E8\u05D3"}</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(item);
                                        }}
                                        className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{"\u05DE\u05D7\u05E7"}</TooltipContent>
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ============= DIALOGS ============= */}

        {/* Media Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent
            className="bg-white border-slate-200 max-w-3xl max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                {"\u05E4\u05E8\u05D8\u05D9 \u05E7\u05D5\u05D1\u05E5"}
              </DialogTitle>
            </DialogHeader>

            {selectedMedia && (
              <div className="space-y-5 pt-2">
                {/* Preview */}
                <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                  <div className="max-h-[400px] flex items-center justify-center p-4">
                    {getMediaType(selectedMedia.type) === "image" ? (
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.altText || selectedMedia.name}
                        className="max-w-full max-h-[380px] object-contain rounded"
                      />
                    ) : getMediaType(selectedMedia.type) === "video" ? (
                      <video
                        src={selectedMedia.url}
                        controls
                        className="max-w-full max-h-[380px]"
                      />
                    ) : (
                      <div className="text-center text-slate-500 py-12">
                        {getMediaIcon(selectedMedia.type, "lg")}
                        <p className="mt-3 font-medium">
                          {selectedMedia.name}
                        </p>
                        <p className="text-sm mt-1 text-slate-400">
                          {selectedMedia.type}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">
                      {"\u05E9\u05DD \u05E7\u05D5\u05D1\u05E5"}
                    </Label>
                    <p className="text-sm text-slate-900 font-medium">
                      {selectedMedia.name}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">
                      {"\u05D2\u05D5\u05D3\u05DC"}
                    </Label>
                    <p className="text-sm text-slate-900">
                      {formatFileSize(selectedMedia.size)}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">
                      {"\u05E1\u05D5\u05D2"}
                    </Label>
                    <div className="flex items-center gap-1.5">
                      {getMediaIcon(selectedMedia.type, "sm")}
                      <span className="text-sm text-slate-900">
                        {selectedMedia.type}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">
                      {"\u05EA\u05D0\u05E8\u05D9\u05DA \u05D4\u05E2\u05DC\u05D0\u05D4"}
                    </Label>
                    <p className="text-sm text-slate-900">
                      {formatDate(selectedMedia.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">
                      {"\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"}
                    </Label>
                    <div>
                      <Select
                        dir="rtl"
                        value={selectedMedia.folder || "__unfiled__"}
                        onValueChange={(val) => {
                          const folder =
                            val === "__unfiled__" ? null : val;
                          onUpdateMedia(selectedMedia.id, {
                            folder,
                          } as Partial<Media>);
                          setSelectedMedia({
                            ...selectedMedia,
                            folder,
                          });
                        }}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__unfiled__">
                            {"\u05DC\u05DC\u05D0 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"}
                          </SelectItem>
                          {folders.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">
                      {"\u05DE\u05D6\u05D4\u05D4"}
                    </Label>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {selectedMedia.id}
                    </p>
                  </div>
                </div>

                {/* URL */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">
                    {"\u05DB\u05EA\u05D5\u05D1\u05EA URL"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={selectedMedia.url}
                      readOnly
                      className="bg-slate-50 border-slate-200 text-sm font-mono"
                      dir="ltr"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyUrl(selectedMedia.url)}
                      className="shrink-0 h-9 w-9"
                    >
                      {copiedUrl === selectedMedia.url ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Alt text */}
                {getMediaType(selectedMedia.type) === "image" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">
                      {"\u05D8\u05E7\u05E1\u05D8 \u05D7\u05DC\u05D5\u05E4\u05D9 (Alt)"}
                    </Label>
                    <Input
                      defaultValue={selectedMedia.altText || ""}
                      onChange={(e) => {
                        if (selectedMedia) {
                          debouncedUpdateAlt(
                            selectedMedia.id,
                            e.target.value
                          );
                        }
                      }}
                      className="bg-white border-slate-200 text-sm"
                      placeholder={"\u05EA\u05D9\u05D0\u05D5\u05E8 \u05D4\u05EA\u05DE\u05D5\u05E0\u05D4 \u05DC\u05E0\u05D2\u05D9\u05E9\u05D5\u05EA"}
                    />
                  </div>
                )}

                {/* Actions */}
                <Separator />
                <div className="flex gap-3 justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selectedMedia)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 ms-2" />
                    {"\u05DE\u05D7\u05E7 \u05E7\u05D5\u05D1\u05E5"}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(selectedMedia.url, "_blank")
                      }
                    >
                      <Download className="h-4 w-4 ms-2" />
                      {"\u05D4\u05D5\u05E8\u05D3"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyUrl(selectedMedia.url)}
                    >
                      <Copy className="h-4 w-4 ms-2" />
                      {"\u05D4\u05E2\u05EA\u05E7 \u05E7\u05D9\u05E9\u05D5\u05E8"}
                    </Button>
                    <Button
                      onClick={() => setIsDetailOpen(false)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {"\u05E1\u05D2\u05D5\u05E8"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        >
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>{"\u05DE\u05D7\u05D9\u05E7\u05EA \u05E7\u05D5\u05D1\u05E5"}</AlertDialogTitle>
              <AlertDialogDescription>
                {"\u05D4\u05D0\u05DD \u05D0\u05EA\u05D4 \u05D1\u05D8\u05D5\u05D7 \u05E9\u05D1\u05E8\u05E6\u05D5\u05E0\u05DA \u05DC\u05DE\u05D7\u05D5\u05E7 \u05D0\u05EA"} &quot;{deleteTarget?.name}&quot;?
                <br />
                {"\u05E4\u05E2\u05D5\u05DC\u05D4 \u05D6\u05D5 \u05D0\u05D9\u05E0\u05D4 \u05E0\u05D9\u05EA\u05E0\u05EA \u05DC\u05D1\u05D9\u05D8\u05D5\u05DC."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2 sm:flex-row-reverse">
              <AlertDialogCancel>{"\u05D1\u05D9\u05D8\u05D5\u05DC"}</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 ms-2" />
                {"\u05DE\u05D7\u05E7"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog
          open={showBulkDeleteDialog}
          onOpenChange={setShowBulkDeleteDialog}
        >
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>{"\u05DE\u05D7\u05D9\u05E7\u05EA \u05E7\u05D1\u05E6\u05D9\u05DD \u05DE\u05E8\u05D5\u05D1\u05D9\u05DD"}</AlertDialogTitle>
              <AlertDialogDescription>
                {"\u05D4\u05D0\u05DD \u05D0\u05EA\u05D4 \u05D1\u05D8\u05D5\u05D7 \u05E9\u05D1\u05E8\u05E6\u05D5\u05E0\u05DA \u05DC\u05DE\u05D7\u05D5\u05E7"} {selectedIds.size} {"\u05E7\u05D1\u05E6\u05D9\u05DD?"}
                <br />
                {"\u05E4\u05E2\u05D5\u05DC\u05D4 \u05D6\u05D5 \u05D0\u05D9\u05E0\u05D4 \u05E0\u05D9\u05EA\u05E0\u05EA \u05DC\u05D1\u05D9\u05D8\u05D5\u05DC."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2 sm:flex-row-reverse">
              <AlertDialogCancel>{"\u05D1\u05D9\u05D8\u05D5\u05DC"}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 ms-2" />
                {"\u05DE\u05D7\u05E7"} {selectedIds.size} {"\u05E7\u05D1\u05E6\u05D9\u05DD"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* New Folder Dialog */}
        <Dialog
          open={showNewFolderDialog}
          onOpenChange={setShowNewFolderDialog}
        >
          <DialogContent
            className="bg-white border-slate-200 max-w-sm"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-amber-500" />
                {"\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4 \u05D7\u05D3\u05E9\u05D4"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>{"\u05E9\u05DD \u05D4\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"}</Label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="hero, gallery, documents..."
                  className="bg-white border-slate-200"
                  dir="ltr"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                  }}
                />
                <p className="text-xs text-slate-400">
                  {"\u05D4\u05E9\u05DD \u05D9\u05D5\u05DE\u05E8 \u05DC\u05D0\u05D5\u05EA\u05D9\u05D5\u05EA \u05E7\u05D8\u05E0\u05D5\u05EA \u05D5\u05E8\u05D5\u05D5\u05D7\u05D9\u05DD \u05D9\u05D5\u05D7\u05DC\u05E4\u05D5 \u05D1\u05DE\u05E7\u05E4\u05D9\u05DD"}
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewFolderDialog(false);
                    setNewFolderName("");
                  }}
                >
                  {"\u05D1\u05D9\u05D8\u05D5\u05DC"}
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <FolderPlus className="h-4 w-4 ms-2" />
                  {"\u05E6\u05D5\u05E8 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Move to Folder Dialog */}
        <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
          <DialogContent
            className="bg-white border-slate-200 max-w-sm"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <Move className="h-5 w-5 text-blue-500" />
                {"\u05D4\u05E2\u05D1\u05E8 \u05DC\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-slate-500">
                {"\u05D4\u05E2\u05D1\u05E8"} {selectedIds.size} {"\u05E7\u05D1\u05E6\u05D9\u05DD \u05E0\u05D1\u05D7\u05E8\u05D9\u05DD \u05DC\u05EA\u05D9\u05E7\u05D9\u05D9\u05D4:"}
              </p>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => setMoveTargetFolder("__unfiled__")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-start ${
                    moveTargetFolder === "__unfiled__"
                      ? "bg-blue-50 text-blue-700 font-medium border border-blue-200"
                      : "text-slate-600 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  <File className="h-4 w-4" />
                  {"\u05DC\u05DC\u05D0 \u05EA\u05D9\u05E7\u05D9\u05D9\u05D4"}
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setMoveTargetFolder(folder)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-start ${
                      moveTargetFolder === folder
                        ? "bg-blue-50 text-blue-700 font-medium border border-blue-200"
                        : "text-slate-600 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <Folder className="h-4 w-4 text-amber-500" />
                    {folder}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMoveDialog(false);
                    setMoveTargetFolder("");
                  }}
                >
                  {"\u05D1\u05D9\u05D8\u05D5\u05DC"}
                </Button>
                <Button
                  onClick={handleMoveMedia}
                  disabled={!moveTargetFolder}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Move className="h-4 w-4 ms-2" />
                  {"\u05D4\u05E2\u05D1\u05E8"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
