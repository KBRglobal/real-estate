import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { getCsrfToken } from "@/lib/queryClient";
import {
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Phone,
  Mail,
  Clock,
  X,
  MessageSquare,
  Check,
  Loader2,
  Users,
  TrendingUp,
  Tag,
  Bell,
  Calendar,
  Plus,
  Trash2,
  Send,
  PhoneCall,
  Video,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Sparkles,
  Globe,
  Facebook,
  Instagram,
  UserPlus,
  Building2,
  FileSpreadsheet,
  Edit3,
  Save,
  RotateCcw,
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
import type { Lead, LeadNote, LeadReminder, Project } from "@shared/schema";

interface LeadsViewProps {
  leads: Lead[];
  projects: Project[];
  onUpdateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  onCreateLead?: (data: Partial<Lead>) => Promise<Lead>;
  onRefresh?: () => void;
  isLoading: boolean;
}

// Lead source configuration
const LEAD_SOURCE_CONFIG = {
  website: { label: "אתר", icon: Globe, color: "bg-blue-100 text-blue-700" },
  facebook: { label: "פייסבוק", icon: Facebook, color: "bg-indigo-100 text-indigo-700" },
  instagram: { label: "אינסטגרם", icon: Instagram, color: "bg-pink-100 text-pink-700" },
  google: { label: "גוגל", icon: Search, color: "bg-green-100 text-green-700" },
  referral: { label: "המלצה", icon: UserPlus, color: "bg-purple-100 text-purple-700" },
  phone: { label: "טלפון", icon: Phone, color: "bg-cyan-100 text-cyan-700" },
  whatsapp: { label: "וואטסאפ", icon: MessageSquare, color: "bg-emerald-100 text-emerald-700" },
  other: { label: "אחר", icon: Tag, color: "bg-gray-100 text-gray-700" },
};

const STATUS_CONFIG = {
  new: { label: "חדש", color: "bg-blue-100 text-blue-700 border-blue-200" },
  contacted: { label: "נוצר קשר", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  in_progress: { label: "בטיפול", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  negotiation: { label: "משא ומתן", color: "bg-purple-100 text-purple-700 border-purple-200" },
  closed_won: { label: "סגור - הצלחה", color: "bg-green-100 text-green-700 border-green-200" },
  closed_lost: { label: "סגור - אבוד", color: "bg-red-100 text-red-700 border-red-200" },
  handled: { label: "טופל", color: "bg-green-100 text-green-700 border-green-200" },
};

const PRIORITY_CONFIG = {
  low: { label: "נמוכה", color: "bg-gray-100 text-gray-700" },
  medium: { label: "בינונית", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "גבוהה", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "דחוף", color: "bg-red-100 text-red-700" },
};

const NOTE_TYPE_CONFIG = {
  note: { label: "הערה", icon: MessageSquare, color: "text-slate-500" },
  call: { label: "שיחה", icon: PhoneCall, color: "text-blue-600" },
  email: { label: "אימייל", icon: Mail, color: "text-purple-600" },
  meeting: { label: "פגישה", icon: Video, color: "text-green-600" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "text-green-500" },
  status_change: { label: "שינוי סטטוס", icon: Check, color: "text-yellow-600" },
};

// Helper to safely get tags array (handles both string and array formats from DB)
function getLeadTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function LeadsView({ leads, projects, onUpdateLead, onCreateLead, onRefresh, isLoading }: LeadsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [reminders, setReminders] = useState<LeadReminder[]>([]);
  const [updating, setUpdating] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newNoteType, setNewNoteType] = useState<string>("note");
  const [newTag, setNewTag] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");
  const [newReminderText, setNewReminderText] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "notes" | "reminders">("details");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvData, setCsvData] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const [location] = useLocation();
  const autoOpenedRef = useRef(false);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    name: "", phone: "", email: "", leadSource: "website", priority: "medium",
    message: "", interestedProjectId: "",
  });
  const [creatingLead, setCreatingLead] = useState(false);
  const [deletingLead, setDeletingLead] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [addingReminder, setAddingReminder] = useState(false);

  // Inline edit state for detail panel fields
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFieldValue, setEditFieldValue] = useState("");

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // New lead form validation
  const [newLeadErrors, setNewLeadErrors] = useState<Record<string, string>>({});

  // Bulk selection state
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Auto-open create form when navigating to /new
  useEffect(() => {
    if (autoOpenedRef.current) return;
    const isNewRoute = location.endsWith("/new") || window.location.pathname.endsWith("/new");
    if (isNewRoute) {
      setShowNewLeadForm(true);
      autoOpenedRef.current = true;
    }
  }, [location]);

  // Auto-select lead from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get("selected");
    if (selectedId && leads.length > 0) {
      const lead = leads.find(l => l.id === selectedId);
      if (lead) {
        setSelectedLead(lead);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [leads]);

  // Keep selectedLead in sync with the parent leads array so dropdown changes reflect immediately
  useEffect(() => {
    if (selectedLead) {
      const freshLead = leads.find(l => l.id === selectedLead.id);
      if (freshLead) {
        setSelectedLead(freshLead);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads]);

  // Calculate dashboard stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    inProgress: leads.filter(l => l.status === "in_progress").length,
    closedWon: leads.filter(l => l.status === "closed_won" || l.status === "handled").length,
    closedLost: leads.filter(l => l.status === "closed_lost").length,
    thisWeek: leads.filter(l => {
      if (!l.createdAt) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(l.createdAt) >= weekAgo;
    }).length,
    urgent: leads.filter(l => l.priority === "urgent" || l.priority === "high").length,
  };

  const filteredLeads = leads
    .filter((lead) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (lead.name ?? "").toLowerCase().includes(query) ||
          (lead.email ?? "").toLowerCase().includes(query) ||
          (lead.phone ?? "").toLowerCase().includes(query) ||
          getLeadTags(lead.tags).some(t => t.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter((lead) => {
      if (statusFilter === "all") return true;
      return lead.status === statusFilter;
    })
    .filter((lead) => {
      if (priorityFilter === "all") return true;
      return lead.priority === priorityFilter;
    })
    .filter((lead) => {
      if (sourceFilter === "all") return true;
      return lead.leadSource === sourceFilter;
    })
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3, null: 4 };
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
      if (priorityA !== priorityB) return priorityA - priorityB;
      const dateA = new Date(a.createdAt || "").getTime();
      const dateB = new Date(b.createdAt || "").getTime();
      return dateB - dateA;
    });

  const fetchLeadDetails = useCallback(async (leadId: string) => {
    setNotesLoading(true);
    try {
      const [notesRes, remindersRes] = await Promise.all([
        fetch(`/api/leads/${leadId}/notes`, { credentials: "include" }),
        fetch(`/api/leads/${leadId}/reminders`, { credentials: "include" }),
      ]);
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(Array.isArray(notesData) ? notesData : notesData.data || []);
      } else {
        setNotes([]);
      }
      if (remindersRes.ok) {
        const remindersData = await remindersRes.json();
        setReminders(Array.isArray(remindersData) ? remindersData : remindersData.data || []);
      } else {
        setReminders([]);
      }
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
      setNotes([]);
      setReminders([]);
    } finally {
      setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLead) {
      fetchLeadDetails(selectedLead.id);
      setActiveTab("details");
      setEditingField(null);
    }
  }, [selectedLead?.id, fetchLeadDetails]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("he-IL", {
      month: "short",
      day: "numeric",
    });
  };

  const getGoalLabel = (goal: string | null) => {
    switch (goal) {
      case "income": return "הכנסה שוטפת";
      case "appreciation": return "עליית ערך";
      case "both": return "שילוב";
      default: return "לא צוין";
    }
  };

  const getStatusBadge = (status: string | null) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
    if (!config) return null;
    return <Badge className={config.color} variant="outline">{config.label}</Badge>;
  };

  const getSourceBadge = (source: string | null) => {
    if (!source) return null;
    const config = LEAD_SOURCE_CONFIG[source as keyof typeof LEAD_SOURCE_CONFIG];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} gap-1`} variant="outline">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await onUpdateLead(leadId, { status: newStatus });
      // selectedLead is synced via the useEffect watching `leads`
      const csrfToken = await getCsrfToken();
      await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          type: "status_change",
          content: `סטטוס השתנה ל: ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label || newStatus}`,
          createdBy: "admin",
        }),
      });
      toast({ title: "הסטטוס עודכן" });
      fetchLeadDetails(leadId);
    } catch (error) {
      toast({ title: "שגיאה", description: "לא ניתן לעדכן את הסטטוס", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (leadId: string, newPriority: string) => {
    setUpdating(true);
    try {
      await onUpdateLead(leadId, { priority: newPriority });
      toast({ title: "העדיפות עודכנה" });
    } catch (error) {
      toast({ title: "שגיאה", description: "לא ניתן לעדכן את העדיפות", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddTag = async () => {
    if (!selectedLead || !newTag.trim()) return;
    const currentTags = getLeadTags(selectedLead.tags);
    if (currentTags.includes(newTag.trim())) {
      toast({ title: "התג כבר קיים", variant: "destructive" });
      return;
    }
    try {
      const updatedTags = [...currentTags, newTag.trim()];
      await onUpdateLead(selectedLead.id, { tags: updatedTags });
      setNewTag("");
      toast({ title: "התג נוסף" });
    } catch (error) {
      toast({ title: "שגיאה", description: "לא ניתן להוסיף את התג", variant: "destructive" });
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!selectedLead) return;
    const newTags = getLeadTags(selectedLead.tags).filter(t => t !== tagToRemove);
    try {
      await onUpdateLead(selectedLead.id, { tags: newTags });
      toast({ title: "התג הוסר" });
    } catch (error) {
      toast({ title: "שגיאה", variant: "destructive" });
    }
  };

  const handleAddNote = async () => {
    if (!selectedLead || !newNote.trim()) return;
    setAddingNote(true);
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/leads/${selectedLead.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          type: newNoteType,
          content: newNote.trim(),
          createdBy: "admin",
        }),
      });
      if (response.ok) {
        const noteRes = await response.json();
        const note = noteRes.data || noteRes;
        setNotes(prev => [note, ...prev]);
        setNewNote("");
        toast({ title: "ההערה נוספה" });
      } else {
        throw new Error("Failed to add note");
      }
    } catch (error) {
      toast({ title: "שגיאה", description: "לא ניתן להוסיף את ההערה", variant: "destructive" });
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedLead) return;
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/leads/${selectedLead.id}/notes/${noteId}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      });
      if (response.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
        toast({ title: "ההערה נמחקה" });
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (error) {
      toast({ title: "שגיאה", description: "לא ניתן למחוק את ההערה", variant: "destructive" });
    }
  };

  const handleAddReminder = async () => {
    if (!selectedLead || !newReminderDate || !newReminderText.trim()) return;
    setAddingReminder(true);
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/leads/${selectedLead.id}/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          dueDate: newReminderDate,
          title: newReminderText.trim(),
          createdBy: "admin",
        }),
      });
      if (response.ok) {
        const reminderRes = await response.json();
        const reminder = reminderRes.data || reminderRes;
        setReminders(prev => [...prev, reminder]);
        setNewReminderDate("");
        setNewReminderText("");
        toast({ title: "התזכורת נוספה" });
      } else {
        throw new Error("Failed to add reminder");
      }
    } catch (error) {
      toast({ title: "שגיאה", description: "לא ניתן להוסיף את התזכורת", variant: "destructive" });
    } finally {
      setAddingReminder(false);
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    if (!selectedLead) return;
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/leads/${selectedLead.id}/reminders/${reminderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ isCompleted: true, completedAt: new Date().toISOString() }),
      });
      if (response.ok) {
        setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, isCompleted: true } : r));
        toast({ title: "התזכורת סומנה כהושלמה" });
      } else {
        throw new Error("Failed to complete reminder");
      }
    } catch (error) {
      toast({ title: "שגיאה", variant: "destructive" });
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!selectedLead) return;
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/leads/${selectedLead.id}/reminders/${reminderId}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      });
      if (response.ok) {
        setReminders(prev => prev.filter(r => r.id !== reminderId));
        toast({ title: "התזכורת נמחקה" });
      } else {
        throw new Error("Failed to delete reminder");
      }
    } catch (error) {
      toast({ title: "שגיאה", variant: "destructive" });
    }
  };

  const handleDeleteSingleLead = async () => {
    if (!selectedLead) return;
    setDeletingLead(true);
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      });
      if (response.ok) {
        toast({ title: "הליד נמחק בהצלחה" });
        setSelectedLead(null);
        onRefresh?.();
      } else {
        throw new Error("Failed to delete lead");
      }
    } catch (error) {
      toast({ title: "שגיאה", description: "לא ניתן למחוק את הליד", variant: "destructive" });
    } finally {
      setDeletingLead(false);
    }
  };

  const handleInlineEdit = async (field: string, value: string) => {
    if (!selectedLead) return;
    try {
      await onUpdateLead(selectedLead.id, { [field]: value });
      setEditingField(null);
      toast({ title: "השדה עודכן" });
    } catch (error) {
      toast({ title: "שגיאה", description: "לא ניתן לעדכן את השדה", variant: "destructive" });
    }
  };

  const exportToCSV = () => {
    const headers = ["שם", "טלפון", "אימייל", "מטרה", "תקציב", "סטטוס", "עדיפות", "מקור", "פרויקט", "תגיות", "תאריך"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.phone,
      lead.email,
      getGoalLabel(lead.investmentGoal),
      lead.budgetRange || "",
      STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG]?.label || lead.status || "",
      PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG]?.label || "",
      LEAD_SOURCE_CONFIG[lead.leadSource as keyof typeof LEAD_SOURCE_CONFIG]?.label || lead.leadSource || "",
      projects.find(p => p.id === lead.interestedProjectId)?.name || "",
      getLeadTags(lead.tags).join("; "),
      formatDate(lead.createdAt),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "הקובץ הורד", description: `${filteredLeads.length} פניות יוצאו ל-CSV` });
  };

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const handleImportCSV = async () => {
    if (!csvData.trim() || !onCreateLead) return;
    setImporting(true);
    try {
      const lines = csvData.trim().split("\n");
      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

      const nameIdx = headers.findIndex(h => h.includes("שם") || h === "name");
      const phoneIdx = headers.findIndex(h => h.includes("טלפון") || h === "phone");
      const emailIdx = headers.findIndex(h => h.includes("אימייל") || h === "email");
      const sourceIdx = headers.findIndex(h => h.includes("מקור") || h === "source");

      const missingColumns: string[] = [];
      if (nameIdx === -1) missingColumns.push("שם");
      if (phoneIdx === -1) missingColumns.push("טלפון");
      if (emailIdx === -1) missingColumns.push("אימייל");

      if (missingColumns.length > 0) {
        toast({ title: "שגיאה", description: `חסרות עמודות: ${missingColumns.join(", ")}`, variant: "destructive" });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidPhone = (p: string) => p && /^[\d\s\-+()]+$/.test(p);

      let imported = 0;
      let skipped = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const name = values[nameIdx] || "";
        const phoneVal = values[phoneIdx] || "";
        const email = values[emailIdx] || "";

        if (!name && !phoneVal && !email) continue;

        const isValidEmail = emailRegex.test(email);
        const isPhoneValid = isValidPhone(phoneVal);

        if (!name || !isValidEmail || !isPhoneValid) {
          skipped++;
          continue;
        }

        await onCreateLead({
          name,
          phone: phoneVal,
          email,
          leadSource: values[sourceIdx] || "other",
          status: "new",
        });
        imported++;
      }

      const description = skipped > 0
        ? `יובאו ${imported} לידים, ${skipped} שורות נדלגו עקב נתונים לא תקינים`
        : `${imported} לידים יובאו בהצלחה`;
      toast({ title: "ייבוא הושלם", description });
      setCsvData("");
      setShowCsvImport(false);
      onRefresh?.();
    } catch (error) {
      toast({ title: "שגיאה בייבוא", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const validateNewLeadForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newLeadData.name.trim()) errors.name = "שם הוא שדה חובה";
    if (!newLeadData.phone.trim()) errors.phone = "טלפון הוא שדה חובה";
    else if (!/^[\d\s\-+()]+$/.test(newLeadData.phone)) errors.phone = "מספר טלפון לא תקין";
    if (newLeadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLeadData.email)) {
      errors.email = "כתובת אימייל לא תקינה";
    }
    setNewLeadErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNewLead = async () => {
    if (!validateNewLeadForm() || !onCreateLead) return;
    setCreatingLead(true);
    try {
      const payload: Partial<Lead> = {
        name: newLeadData.name,
        phone: newLeadData.phone,
        email: newLeadData.email || "",
        status: "new",
        leadSource: newLeadData.leadSource || "website",
        priority: newLeadData.priority || "medium",
        message: newLeadData.message || undefined,
        interestedProjectId: newLeadData.interestedProjectId || undefined,
      };
      await onCreateLead(payload);
      toast({ title: "הליד נוצר בהצלחה" });
      setShowNewLeadForm(false);
      setNewLeadData({ name: "", phone: "", email: "", leadSource: "website", priority: "medium", message: "", interestedProjectId: "" });
      setNewLeadErrors({});
      onRefresh?.();
    } catch {
      toast({ title: "שגיאה ביצירת הליד", variant: "destructive" });
    } finally {
      setCreatingLead(false);
    }
  };

  // Bulk selection handlers
  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelection = new Set(selectedLeadIds);
    if (checked) {
      newSelection.add(leadId);
    } else {
      newSelection.delete(leadId);
    }
    setSelectedLeadIds(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
    } else {
      setSelectedLeadIds(new Set());
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedLeadIds.size === 0) return;
    setBulkUpdating(true);
    try {
      const promises = Array.from(selectedLeadIds).map(id =>
        onUpdateLead(id, { status: newStatus })
      );
      await Promise.all(promises);
      toast({ title: `${selectedLeadIds.size} לידים עודכנו בהצלחה` });
      setSelectedLeadIds(new Set());
      setBulkStatusModalOpen(false);
      onRefresh?.();
    } catch (error) {
      toast({ title: "שגיאה בעדכון הלידים", variant: "destructive" });
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.size === 0) return;
    setBulkUpdating(true);
    try {
      const csrfToken = await getCsrfToken();
      const promises = Array.from(selectedLeadIds).map(id =>
        fetch(`/api/leads/${id}`, {
          method: "DELETE",
          headers: { "x-csrf-token": csrfToken },
          credentials: "include",
        })
      );
      await Promise.all(promises);
      toast({ title: `${selectedLeadIds.size} לידים נמחקו בהצלחה` });
      setSelectedLeadIds(new Set());
      onRefresh?.();
    } catch (error) {
      toast({ title: "שגיאה במחיקת הלידים", variant: "destructive" });
    } finally {
      setBulkUpdating(false);
    }
  };

  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.has(l.id));

  const handleUpdateLeadSource = async (leadId: string, source: string) => {
    try {
      await onUpdateLead(leadId, { leadSource: source });
      toast({ title: "מקור הליד עודכן" });
    } catch (error) {
      toast({ title: "שגיאה", variant: "destructive" });
    }
  };

  const handleUpdateLeadProject = async (leadId: string, projectId: string | null) => {
    try {
      await onUpdateLead(leadId, { interestedProjectId: projectId });
      toast({ title: "פרויקט עודכן" });
    } catch (error) {
      toast({ title: "שגיאה", variant: "destructive" });
    }
  };

  const openWhatsApp = (phoneNum: string) => {
    const cleaned = phoneNum.replace(/\D/g, "");
    // If starts with 0, assume Israeli number and prefix with 972
    const normalized = cleaned.startsWith("0") ? "972" + cleaned.slice(1) : cleaned;
    window.open(`https://wa.me/${normalized}`, "_blank");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSourceFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || priorityFilter !== "all" || sourceFilter !== "all";

  return (
    <TooltipProvider>
    <div dir="rtl" className="space-y-6">
      {/* Leads Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ניהול לידים</h1>
          <p className="text-sm text-slate-500 mt-1">{stats.total} לידים במערכת</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCsvImport(true)} className="border-slate-200">
            <Upload className="h-4 w-4 ms-2" />
            ייבוא CSV
          </Button>
          <Button
            onClick={() => setShowNewLeadForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-add-lead"
          >
            <Plus className="h-4 w-4 ms-2" />
            הוסף ליד
          </Button>
        </div>
      </div>

      {/* Dashboard Stats - Single consolidated row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => clearFilters()}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-xs text-blue-600">סה״כ</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { clearFilters(); setStatusFilter("new"); }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500 rounded-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-700">{stats.new}</p>
              <p className="text-xs text-cyan-600">חדשים</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { clearFilters(); setStatusFilter("in_progress"); }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{stats.inProgress}</p>
              <p className="text-xs text-yellow-600">בטיפול</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { clearFilters(); setStatusFilter("closed_won"); }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.closedWon}</p>
              <p className="text-xs text-green-600">נסגרו בהצלחה</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { clearFilters(); setStatusFilter("closed_lost"); }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <XCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{stats.closedLost}</p>
              <p className="text-xs text-red-600">אבודים</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{stats.thisWeek}</p>
              <p className="text-xs text-purple-600">השבוע</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { clearFilters(); setPriorityFilter("urgent"); }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{stats.urgent}</p>
              <p className="text-xs text-orange-600">דחופים</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 bg-white shadow-sm border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="חיפוש לפי שם, טלפון, אימייל או תג..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 bg-slate-50 border-slate-200"
              data-testid="input-lead-search"
            />
          </div>
          <Select dir="rtl" value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-50 border-slate-200" data-testid="select-status-filter">
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select dir="rtl" value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36 bg-slate-50 border-slate-200" data-testid="select-priority-filter">
              <SelectValue placeholder="עדיפות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל העדיפויות</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select dir="rtl" value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-36 bg-slate-50 border-slate-200" data-testid="select-source-filter">
              <SelectValue placeholder="מקור" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המקורות</SelectItem>
              {Object.entries(LEAD_SOURCE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-slate-700">
              <RotateCcw className="h-4 w-4 ms-1" />
              נקה
            </Button>
          )}
          <Button variant="outline" onClick={exportToCSV} className="border-slate-200" data-testid="button-export-csv">
            <Download className="h-4 w-4 ms-2" />
            ייצוא CSV
          </Button>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500">
            מציג {filteredLeads.length} מתוך {leads.length} לידים
          </div>
        )}
      </Card>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedLeadIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-4 bg-blue-50 border-blue-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">
                    {selectedLeadIds.size} לידים נבחרו
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkStatusModalOpen(true)}
                    disabled={bulkUpdating}
                    className="border-blue-300 bg-white hover:bg-blue-100"
                  >
                    {bulkUpdating ? <Loader2 className="h-4 w-4 ms-2 animate-spin" /> : <Check className="h-4 w-4 ms-2" />}
                    שנה סטטוס
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkDeleteConfirmOpen(true)}
                    disabled={bulkUpdating}
                    className="border-red-300 text-red-600 bg-white hover:bg-red-50 hover:text-red-700"
                  >
                    {bulkUpdating ? <Loader2 className="h-4 w-4 ms-2 animate-spin" /> : <Trash2 className="h-4 w-4 ms-2" />}
                    מחק נבחרים
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLeadIds(new Set())}
                    className="text-slate-600"
                  >
                    <X className="h-4 w-4 ms-1" />
                    בטל בחירה
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leads List */}
      <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-500">טוען לידים...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {hasActiveFilters
                ? "לא נמצאו תוצאות לסינון הנוכחי"
                : "אין לידים עדיין"}
            </p>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="mt-2 text-blue-600">
                נקה סינון
              </Button>
            )}
            {!hasActiveFilters && onCreateLead && (
              <Button variant="ghost" onClick={() => setShowNewLeadForm(true)} className="mt-2 text-blue-600">
                הוסף ליד ראשון
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Select All Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-4">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                aria-label="בחר הכל"
              />
              <span className="text-sm font-medium text-slate-600">בחר הכל</span>
              <span className="text-sm text-slate-400">({filteredLeads.length} לידים)</span>
            </div>
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                  selectedLead?.id === lead.id ? "bg-blue-50 border-s-4 border-s-blue-500" : ""
                }`}
                onClick={() => setSelectedLead(lead)}
                data-testid={`lead-row-${lead.id}`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.has(lead.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectLead(lead.id, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    aria-label={`בחר ${lead.name}`}
                  />
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{(lead.name ?? "?").charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-900">{lead.name || "ללא שם"}</h4>
                      {getStatusBadge(lead.status)}
                      {getPriorityBadge(lead.priority)}
                      {getSourceBadge(lead.leadSource)}
                      {getLeadTags(lead.tags).slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-slate-300">
                          {tag}
                        </Badge>
                      ))}
                      {getLeadTags(lead.tags).length > 2 && (
                        <Badge variant="outline" className="text-xs border-slate-300">
                          +{getLeadTags(lead.tags).length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          <span dir="ltr">{lead.phone}</span>
                        </span>
                      )}
                      {lead.email && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </span>
                      )}
                      {lead.createdAt && (
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDateShort(lead.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {lead.phone && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={(e) => { e.stopPropagation(); openWhatsApp(lead.phone); }}
                              data-testid={`button-whatsapp-${lead.id}`}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>WhatsApp</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }}
                              data-testid={`button-call-${lead.id}`}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>התקשר</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                    <ChevronLeft className="h-5 w-5 text-slate-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Lead Detail Slide Panel */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setSelectedLead(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 start-0 h-full w-full max-w-xl bg-white z-50 overflow-y-auto shadow-2xl border-e border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">{(selectedLead.name ?? "?").charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{selectedLead.name || "ללא שם"}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getStatusBadge(selectedLead.status)}
                        {getPriorityBadge(selectedLead.priority)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteConfirmOpen(true)}
                          disabled={deletingLead}
                        >
                          {deletingLead ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>מחק ליד</TooltipContent>
                    </Tooltip>
                    <button
                      onClick={() => setSelectedLead(null)}
                      className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Quick contact actions */}
                <div className="flex items-center gap-2 mt-3">
                  {selectedLead.phone && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => openWhatsApp(selectedLead.phone)}
                      >
                        <MessageSquare className="h-3.5 w-3.5 ms-1.5" />
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => window.open(`tel:${selectedLead.phone}`)}
                      >
                        <Phone className="h-3.5 w-3.5 ms-1.5" />
                        התקשר
                      </Button>
                    </>
                  )}
                  {selectedLead.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => window.open(`mailto:${selectedLead.email}`)}
                    >
                      <Mail className="h-3.5 w-3.5 ms-1.5" />
                      אימייל
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200 pb-2">
                  {(["details", "notes", "reminders"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {tab === "details" && "פרטים"}
                      {tab === "notes" && (
                        <span className="flex items-center gap-1.5">
                          הערות
                          {notes.length > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                              {notes.length}
                            </span>
                          )}
                        </span>
                      )}
                      {tab === "reminders" && (
                        <span className="flex items-center gap-1.5">
                          תזכורות
                          {reminders.filter(r => !r.isCompleted).length > 0 && (
                            <span className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full">
                              {reminders.filter(r => !r.isCompleted).length}
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="space-y-5">
                    {/* Status & Priority Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">סטטוס</label>
                        <Select
                          dir="rtl"
                          value={selectedLead.status || "new"}
                          onValueChange={(v) => handleStatusChange(selectedLead.id, v)}
                          disabled={updating}
                        >
                          <SelectTrigger className={`bg-slate-50 border-slate-200 ${updating ? "opacity-60" : ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">עדיפות</label>
                        <Select
                          dir="rtl"
                          value={selectedLead.priority || "medium"}
                          onValueChange={(v) => handlePriorityChange(selectedLead.id, v)}
                          disabled={updating}
                        >
                          <SelectTrigger className={`bg-slate-50 border-slate-200 ${updating ? "opacity-60" : ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Source & Project Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">מקור הליד</label>
                        <Select
                          dir="rtl"
                          value={selectedLead.leadSource || "website"}
                          onValueChange={(v) => handleUpdateLeadSource(selectedLead.id, v)}
                        >
                          <SelectTrigger className="bg-slate-50 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(LEAD_SOURCE_CONFIG).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">פרויקט מתעניין</label>
                        <Select
                          dir="rtl"
                          value={selectedLead.interestedProjectId || "none"}
                          onValueChange={(v) => handleUpdateLeadProject(selectedLead.id, v === "none" ? null : v)}
                        >
                          <SelectTrigger className="bg-slate-50 border-slate-200">
                            <SelectValue placeholder="בחר פרויקט" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">לא נבחר</SelectItem>
                            {projects.filter(p => p.id && p.id.trim().length > 0).map((project) => (
                              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">תגיות</label>
                      <div className="flex flex-wrap gap-2">
                        {getLeadTags(selectedLead.tags).map((tag) => (
                          <Badge key={tag} variant="outline" className="border-slate-300 flex items-center gap-1 pe-1">
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-500 p-0.5 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        <div className="flex gap-1">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="תג חדש..."
                            className="h-7 w-24 text-xs bg-slate-50 border-slate-200"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <Button size="sm" variant="ghost" onClick={handleAddTag} className="h-7 px-2" disabled={!newTag.trim()}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">פרטי קשר</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-500">שם</label>
                          {editingField === "name" ? (
                            <div className="flex gap-1 mt-1">
                              <Input
                                value={editFieldValue}
                                onChange={(e) => setEditFieldValue(e.target.value)}
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleInlineEdit("name", editFieldValue);
                                  if (e.key === "Escape") setEditingField(null);
                                }}
                              />
                              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleInlineEdit("name", editFieldValue)}>
                                <Save className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <p
                              className="text-slate-900 cursor-pointer hover:text-blue-600 group flex items-center gap-1"
                              onClick={() => { setEditingField("name"); setEditFieldValue(selectedLead.name || ""); }}
                            >
                              {selectedLead.name || "לא צוין"}
                              <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">טלפון</label>
                          {editingField === "phone" ? (
                            <div className="flex gap-1 mt-1">
                              <Input
                                value={editFieldValue}
                                onChange={(e) => setEditFieldValue(e.target.value)}
                                className="h-8 text-sm"
                                dir="ltr"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleInlineEdit("phone", editFieldValue);
                                  if (e.key === "Escape") setEditingField(null);
                                }}
                              />
                              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleInlineEdit("phone", editFieldValue)}>
                                <Save className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <p
                              className="text-slate-900 cursor-pointer hover:text-blue-600 group flex items-center gap-1"
                              dir="ltr"
                              onClick={() => { setEditingField("phone"); setEditFieldValue(selectedLead.phone || ""); }}
                            >
                              {selectedLead.phone || "לא צוין"}
                              <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">אימייל</label>
                          {editingField === "email" ? (
                            <div className="flex gap-1 mt-1">
                              <Input
                                value={editFieldValue}
                                onChange={(e) => setEditFieldValue(e.target.value)}
                                className="h-8 text-sm"
                                dir="ltr"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleInlineEdit("email", editFieldValue);
                                  if (e.key === "Escape") setEditingField(null);
                                }}
                              />
                              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleInlineEdit("email", editFieldValue)}>
                                <Save className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <p
                              className="text-slate-900 cursor-pointer hover:text-blue-600 group flex items-center gap-1"
                              dir="ltr"
                              onClick={() => { setEditingField("email"); setEditFieldValue(selectedLead.email || ""); }}
                            >
                              {selectedLead.email || "לא צוין"}
                              <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">תאריך פניה</label>
                          <p className="text-slate-900">{formatDate(selectedLead.createdAt) || "לא ידוע"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Investment Details */}
                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">פרטי השקעה</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-500">מטרת השקעה</label>
                          <p className="text-slate-900">{getGoalLabel(selectedLead.investmentGoal)}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">תקציב</label>
                          {editingField === "budgetRange" ? (
                            <div className="flex gap-1 mt-1">
                              <Input
                                value={editFieldValue}
                                onChange={(e) => setEditFieldValue(e.target.value)}
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleInlineEdit("budgetRange", editFieldValue);
                                  if (e.key === "Escape") setEditingField(null);
                                }}
                              />
                              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleInlineEdit("budgetRange", editFieldValue)}>
                                <Save className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <p
                              className="text-slate-900 cursor-pointer hover:text-blue-600 group flex items-center gap-1"
                              onClick={() => { setEditingField("budgetRange"); setEditFieldValue(selectedLead.budgetRange || ""); }}
                            >
                              {selectedLead.budgetRange || "לא צוין"}
                              <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                            </p>
                          )}
                        </div>
                        {selectedLead.timeline && (
                          <div>
                            <label className="text-xs text-slate-500">ציר זמן</label>
                            <p className="text-slate-900">{selectedLead.timeline}</p>
                          </div>
                        )}
                        {selectedLead.experience && (
                          <div>
                            <label className="text-xs text-slate-500">ניסיון</label>
                            <p className="text-slate-900">{selectedLead.experience}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    {selectedLead.message && (
                      <div className="pt-4 border-t border-slate-200">
                        <label className="text-xs font-medium text-slate-500">הודעה</label>
                        <p className="text-slate-900 mt-1 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 text-sm border border-slate-200">
                          {selectedLead.message}
                        </p>
                      </div>
                    )}

                    {/* Source info */}
                    {(selectedLead.source || selectedLead.sourceType) && (
                      <div className="pt-4 border-t border-slate-200">
                        <label className="text-xs font-medium text-slate-500">מקור הפניה</label>
                        <p className="text-slate-700 text-sm mt-1">
                          {selectedLead.sourceType && <span className="text-slate-500">{selectedLead.sourceType}: </span>}
                          {selectedLead.source || "לא ידוע"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <div className="space-y-4">
                    {/* Add note form */}
                    <div className="space-y-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex gap-2">
                        <Select dir="rtl" value={newNoteType} onValueChange={setNewNoteType}>
                          <SelectTrigger className="w-32 bg-white border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(NOTE_TYPE_CONFIG).filter(([k]) => k !== "status_change").map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="הוסף הערה..."
                        className="min-h-[80px] bg-white border-slate-200"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleAddNote();
                          }
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Ctrl+Enter לשליחה מהירה</span>
                        <Button
                          onClick={handleAddNote}
                          className="bg-blue-500 hover:bg-blue-600"
                          disabled={!newNote.trim() || addingNote}
                          size="sm"
                        >
                          {addingNote ? (
                            <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 ms-2" />
                          )}
                          הוסף הערה
                        </Button>
                      </div>
                    </div>

                    {/* Notes List */}
                    {notesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-500 text-sm">אין הערות עדיין</p>
                        <p className="text-slate-400 text-xs mt-1">הוסף הערה ראשונה למעקב אחר הליד</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notes.map((note) => {
                          const typeConfig = NOTE_TYPE_CONFIG[note.type as keyof typeof NOTE_TYPE_CONFIG] || NOTE_TYPE_CONFIG.note;
                          const Icon = typeConfig.icon;
                          return (
                            <div key={note.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 group">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Icon className={`h-4 w-4 ${typeConfig.color}`} />
                                  <span className="text-xs font-medium text-slate-700">{typeConfig.label}</span>
                                  <span className="text-xs text-slate-400">{formatDate(note.createdAt)}</span>
                                </div>
                                {note.type !== "status_change" && (
                                  <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1 rounded"
                                    title="מחק הערה"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-slate-900 whitespace-pre-wrap">{note.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Reminders Tab */}
                {activeTab === "reminders" && (
                  <div className="space-y-4">
                    {/* Add reminder form */}
                    <div className="space-y-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <Input
                        type="datetime-local"
                        value={newReminderDate}
                        onChange={(e) => setNewReminderDate(e.target.value)}
                        className="bg-white border-slate-200"
                      />
                      <Input
                        value={newReminderText}
                        onChange={(e) => setNewReminderText(e.target.value)}
                        placeholder="תוכן התזכורת..."
                        className="bg-white border-slate-200"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddReminder();
                          }
                        }}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleAddReminder}
                          className="bg-blue-500 hover:bg-blue-600"
                          disabled={!newReminderDate || !newReminderText.trim() || addingReminder}
                          size="sm"
                        >
                          {addingReminder ? (
                            <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                          ) : (
                            <Bell className="h-4 w-4 ms-2" />
                          )}
                          הוסף תזכורת
                        </Button>
                      </div>
                    </div>

                    {/* Reminders List */}
                    {reminders.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-500 text-sm">אין תזכורות</p>
                        <p className="text-slate-400 text-xs mt-1">הוסף תזכורת למעקב</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {[...reminders]
                          .sort((a, b) => {
                            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
                            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                          })
                          .map((reminder) => {
                            const isOverdue = !reminder.isCompleted && new Date(reminder.dueDate) < new Date();
                            return (
                              <div
                                key={reminder.id}
                                className={`p-3 rounded-lg border group ${
                                  reminder.isCompleted
                                    ? "bg-slate-50 border-slate-200"
                                    : isOverdue
                                    ? "bg-red-50 border-red-200"
                                    : "bg-yellow-50 border-yellow-200"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {reminder.isCompleted ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    ) : isOverdue ? (
                                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                    ) : (
                                      <Bell className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm truncate ${reminder.isCompleted ? "line-through text-slate-500" : "text-slate-900"}`}>
                                      {reminder.title}
                                    </span>
                                    {isOverdue && !reminder.isCompleted && (
                                      <Badge className="bg-red-100 text-red-700 text-xs flex-shrink-0">באיחור</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {!reminder.isCompleted && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleCompleteReminder(reminder.id)}
                                        className="h-7 px-2 text-green-600 hover:text-green-700"
                                        title="סמן כהושלמה"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteReminder(reminder.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1 rounded"
                                      title="מחק תזכורת"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 me-6">
                                  {formatDate(reminder.dueDate)}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CSV Import Modal */}
      <AnimatePresence>
        {showCsvImport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowCsvImport(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">ייבוא לידים מ-CSV</h3>
                    <p className="text-sm text-slate-500">הדבק את תוכן קובץ ה-CSV</p>
                  </div>
                </div>
                <button onClick={() => setShowCsvImport(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                  <p className="font-medium mb-1">פורמט נדרש:</p>
                  <code className="text-xs bg-slate-200 px-2 py-1 rounded">שם,טלפון,אימייל,מקור</code>
                  <p className="text-xs mt-2 text-slate-500">* השורה הראשונה צריכה להיות כותרות העמודות</p>
                </div>

                <Textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder={`שם,טלפון,אימייל,מקור\nישראל ישראלי,0501234567,israel@email.com,facebook\nשרה כהן,0529876543,sara@email.com,referral`}
                  className="min-h-[200px] font-mono text-sm"
                  dir="ltr"
                />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCsvImport(false)}>
                    ביטול
                  </Button>
                  <Button
                    onClick={handleImportCSV}
                    disabled={!csvData.trim() || importing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                        מייבא...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 ms-2" />
                        ייבא לידים
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Lead Form Modal */}
      <AnimatePresence>
        {showNewLeadForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowNewLeadForm(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-lead-dialog-title"
              data-testid="dialog-new-lead"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 id="new-lead-dialog-title" className="font-bold text-slate-900">ליד חדש</h3>
                    <p className="text-sm text-slate-500">הוסף ליד ידנית למערכת</p>
                  </div>
                </div>
                <button onClick={() => setShowNewLeadForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">שם מלא <span className="text-red-500">*</span></label>
                  <Input
                    value={newLeadData.name}
                    onChange={(e) => { setNewLeadData({ ...newLeadData, name: e.target.value }); setNewLeadErrors(prev => ({ ...prev, name: "" })); }}
                    placeholder="ישראל ישראלי"
                    className={`bg-slate-50 border-slate-200 text-slate-900 ${newLeadErrors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    data-testid="input-lead-name"
                  />
                  {newLeadErrors.name && <p className="text-xs text-red-500">{newLeadErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">טלפון <span className="text-red-500">*</span></label>
                  <Input
                    value={newLeadData.phone}
                    onChange={(e) => { setNewLeadData({ ...newLeadData, phone: e.target.value }); setNewLeadErrors(prev => ({ ...prev, phone: "" })); }}
                    placeholder="050-1234567"
                    className={`bg-slate-50 border-slate-200 text-slate-900 ${newLeadErrors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    dir="ltr"
                    data-testid="input-lead-phone"
                  />
                  {newLeadErrors.phone && <p className="text-xs text-red-500">{newLeadErrors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">אימייל</label>
                  <Input
                    value={newLeadData.email}
                    onChange={(e) => { setNewLeadData({ ...newLeadData, email: e.target.value }); setNewLeadErrors(prev => ({ ...prev, email: "" })); }}
                    placeholder="email@example.com"
                    className={`bg-slate-50 border-slate-200 text-slate-900 ${newLeadErrors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    dir="ltr"
                    data-testid="input-lead-email"
                  />
                  {newLeadErrors.email && <p className="text-xs text-red-500">{newLeadErrors.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">מקור</label>
                    <Select dir="rtl" value={newLeadData.leadSource} onValueChange={(v) => setNewLeadData({ ...newLeadData, leadSource: v })}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LEAD_SOURCE_CONFIG).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">עדיפות</label>
                    <Select dir="rtl" value={newLeadData.priority} onValueChange={(v) => setNewLeadData({ ...newLeadData, priority: v })}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {projects.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">פרויקט מתעניין</label>
                    <Select
                      dir="rtl"
                      value={newLeadData.interestedProjectId || "none"}
                      onValueChange={(v) => setNewLeadData({ ...newLeadData, interestedProjectId: v === "none" ? "" : v })}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="בחר פרויקט" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">לא נבחר</SelectItem>
                        {projects.filter(p => p.id && p.id.trim().length > 0).map((project) => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">הודעה</label>
                  <Textarea
                    value={newLeadData.message}
                    onChange={(e) => setNewLeadData({ ...newLeadData, message: e.target.value })}
                    placeholder="פרטים נוספים..."
                    className="bg-slate-50 border-slate-200 text-slate-900 min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowNewLeadForm(false)} data-testid="button-cancel-lead">
                    ביטול
                  </Button>
                  <Button
                    onClick={handleCreateNewLead}
                    disabled={!newLeadData.name || !newLeadData.phone || creatingLead}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-submit-lead"
                  >
                    {creatingLead ? (
                      <>
                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                        יוצר...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 ms-2" />
                        צור ליד
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bulk Status Change Modal */}
      <AnimatePresence>
        {bulkStatusModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setBulkStatusModalOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">שנה סטטוס ל-{selectedLeadIds.size} לידים</h3>
                <button onClick={() => setBulkStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => handleBulkStatusChange(key)}
                    disabled={bulkUpdating}
                    className={`w-full p-3 rounded-lg text-start transition-colors border ${color} hover:opacity-80 disabled:opacity-50`}
                  >
                    {bulkUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin inline ms-2" />
                    ) : null}
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Single Lead Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">מחיקת ליד</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              האם אתה בטוח שברצונך למחוק את הליד "{selectedLead?.name}"?
              <br />
              פעולה זו אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                setDeleteConfirmOpen(false);
                handleDeleteSingleLead();
              }}
            >
              <Trash2 className="h-4 w-4 me-2" />
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">מחיקת לידים</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              האם אתה בטוח שברצונך למחוק {selectedLeadIds.size} לידים?
              <br />
              פעולה זו אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                setBulkDeleteConfirmOpen(false);
                handleBulkDelete();
              }}
            >
              <Trash2 className="h-4 w-4 me-2" />
              מחק {selectedLeadIds.size} לידים
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
}
