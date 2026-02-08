import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Folder, Upload, Search, Download, Trash2, Eye, Clock, FileCheck, FilePlus, FolderPlus, MoreVertical, File, FileImage, FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const MAX_BETA_VIEWS = 3;
const BETA_KEY = "ddl-document-manager-beta-views";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "image" | "spreadsheet" | "document";
  size: string;
  category: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface Folder {
  id: string;
  name: string;
  documentsCount: number;
  color: string;
}

const sampleFolders: Folder[] = [
  { id: "1", name: "חוזים", documentsCount: 12, color: "bg-blue-500" },
  { id: "2", name: "מסמכי נכס", documentsCount: 8, color: "bg-emerald-500" },
  { id: "3", name: "חשבוניות", documentsCount: 24, color: "bg-amber-500" },
  { id: "4", name: "דוחות", documentsCount: 6, color: "bg-purple-500" },
];

const sampleDocuments: Document[] = [
  { id: "1", name: "חוזה_מכירה_Palm_Heights.pdf", type: "pdf", size: "2.4 MB", category: "חוזים", uploadedAt: "2026-01-10", uploadedBy: "דוד כהן" },
  { id: "2", name: "תמונות_נכס_Downtown.zip", type: "image", size: "45.2 MB", category: "מסמכי נכס", uploadedAt: "2026-01-09", uploadedBy: "שרה לוי" },
  { id: "3", name: "הערכת_שווי_Marina.xlsx", type: "spreadsheet", size: "1.1 MB", category: "דוחות", uploadedAt: "2026-01-08", uploadedBy: "משה אברהם" },
  { id: "4", name: "חשבונית_עורך_דין.pdf", type: "pdf", size: "156 KB", category: "חשבוניות", uploadedAt: "2026-01-07", uploadedBy: "דוד כהן" },
  { id: "5", name: "נספח_תשלומים.pdf", type: "pdf", size: "890 KB", category: "חוזים", uploadedAt: "2026-01-06", uploadedBy: "שרה לוי" },
  { id: "6", name: "תוכנית_קומה_2BR.pdf", type: "document", size: "3.2 MB", category: "מסמכי נכס", uploadedAt: "2026-01-05", uploadedBy: "משה אברהם" },
];

export function DocumentManagerView() {
  const { language } = useLanguage();
  const isRTL = language === "he";

  const [betaViews] = useState(() => {
    try {
      const stored = localStorage.getItem(BETA_KEY);
      const currentViews = stored ? parseInt(stored, 10) : 0;
      if (currentViews < MAX_BETA_VIEWS) {
        const newViews = currentViews + 1;
        localStorage.setItem(BETA_KEY, String(newViews));
        window.dispatchEvent(new CustomEvent("ddl-beta-view-updated"));
        return newViews;
      }
      return currentViews;
    } catch {
      return 0;
    }
  });

  const isDemoLocked = betaViews > MAX_BETA_VIEWS;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const getFileIcon = (type: Document["type"]) => {
    switch (type) {
      case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
      case "image": return <FileImage className="h-5 w-5 text-purple-500" />;
      case "spreadsheet": return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      default: return <File className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredDocs = sampleDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder ? doc.category === sampleFolders.find(f => f.id === selectedFolder)?.name : true;
    return matchesSearch && matchesFolder;
  });


  if (isDemoLocked) {
    return (
      <div className="space-y-6">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm z-10 flex items-center justify-center">
            <Card className="max-w-md mx-4 bg-white/95 backdrop-blur shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isRTL ? "הדמו הסתיים" : "Demo Completed"}
                </h3>
                <p className="text-slate-600 mb-4">
                  {isRTL 
                    ? "צפית ב-3 הדגמות של מנהל מסמכים. שדרג לגרסה המלאה לגישה בלתי מוגבלת."
                    : "You've viewed 3 demos of Document Manager. Upgrade for unlimited access."}
                </p>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  {isRTL ? "שדרג עכשיו" : "Upgrade Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="opacity-30 pointer-events-none p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => (
                <Card key={i} className="bg-slate-100 h-24" />
              ))}
            </div>
            <Card className="h-96 bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
            BETA
          </Badge>
          <span className="text-sm text-slate-500">
            {isRTL ? `צפייה ${betaViews}/${MAX_BETA_VIEWS}` : `View ${betaViews}/${MAX_BETA_VIEWS}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FolderPlus className="h-4 w-4 mr-2" />
            {isRTL ? "תיקייה חדשה" : "New Folder"}
          </Button>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            {isRTL ? "העלה מסמך" : "Upload Document"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sampleFolders.map((folder, idx) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedFolder === folder.id ? "ring-2 ring-indigo-500 bg-indigo-50" : ""
              }`}
              onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${folder.color} flex items-center justify-center`}>
                    <Folder className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{folder.name}</p>
                    <p className="text-sm text-slate-500">
                      {folder.documentsCount} {isRTL ? "מסמכים" : "documents"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-500" />
              {selectedFolder 
                ? sampleFolders.find(f => f.id === selectedFolder)?.name 
                : (isRTL ? "כל המסמכים" : "All Documents")}
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={isRTL ? "חיפוש מסמכים..." : "Search documents..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredDocs.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    {getFileIcon(doc.type)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{doc.name}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {doc.uploadedAt}
                      </span>
                      <span>•</span>
                      <span>{doc.uploadedBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        {isRTL ? "תצוגה מקדימה" : "Preview"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        {isRTL ? "הורדה" : "Download"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isRTL ? "מחיקה" : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredDocs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500">
                {isRTL ? "לא נמצאו מסמכים" : "No documents found"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
