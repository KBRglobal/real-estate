import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Lead, Project } from "@shared/schema";
import ddlLogo from "@assets/ddl_logo_1768141898381.png";

interface DashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: DashboardProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"leads" | "projects">("leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, projectsRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/projects"),
      ]);

      const extractArray = (json: unknown): unknown[] => {
        if (Array.isArray(json)) return json;
        if (json && typeof json === "object" && "data" in json && Array.isArray((json as { data: unknown[] }).data)) {
          return (json as { data: unknown[] }).data;
        }
        return [];
      };

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(extractArray(leadsData) as typeof leads);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(extractArray(projectsData) as typeof projects);
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את הנתונים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    {
      title: "סה״כ לידים",
      value: leads.length,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "לידים היום",
      value: leads.filter((l) => {
        const today = new Date();
        const leadDate = new Date(l.createdAt || "");
        return leadDate.toDateString() === today.toDateString();
      }).length,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "פרויקטים פעילים",
      value: projects.length,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "פרויקטים מומלצים",
      value: projects.filter((p) => p.featured).length,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const filteredLeads = leads
    .filter((lead) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(query) ||
        (lead.email || "").toLowerCase().includes(query) ||
        lead.phone.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt || "").getTime();
        const dateB = new Date(b.createdAt || "").getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "לא ידוע";
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGoalLabel = (goal: string | null) => {
    switch (goal) {
      case "income":
        return "הכנסה שוטפת";
      case "appreciation":
        return "עליית ערך";
      case "both":
        return "שילוב";
      default:
        return "לא צוין";
    }
  };

  const getTimelineLabel = (timeline: string | null) => {
    switch (timeline) {
      case "short":
        return "קצר (1-3 שנים)";
      case "long":
        return "ארוך (5+ שנים)";
      default:
        return "לא צוין";
    }
  };

  const getExperienceLabel = (exp: string | null) => {
    switch (exp) {
      case "first":
        return "משקיע חדש";
      case "experienced":
        return "מנוסה";
      default:
        return "לא צוין";
    }
  };

  const exportLeadsToCSV = () => {
    const headers = ["שם", "טלפון", "אימייל", "מטרה", "תקציב", "תאריך"];
    const rows = leads.map((lead) => [
      lead.name,
      lead.phone,
      lead.email,
      getGoalLabel(lead.investmentGoal),
      lead.budgetRange || "לא צוין",
      formatDate(lead.createdAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "הקובץ הורד בהצלחה",
      description: `${leads.length} לידים יוצאו ל-CSV`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={ddlLogo} alt="PropLine Real Estate - לוגו מערכת ניהול" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  מערכת ניהול
                </h1>
                <p className="text-sm text-muted-foreground">PropLine Admin Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ml-2 ${isLoading ? "animate-spin" : ""}`}
                />
                רענן
              </Button>
              <Button variant="destructive" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                התנתק
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "leads" ? "default" : "outline"}
            onClick={() => setActiveTab("leads")}
          >
            <Users className="h-4 w-4 ml-2" />
            לידים ({leads.length})
          </Button>
          <Button
            variant={activeTab === "projects" ? "default" : "outline"}
            onClick={() => setActiveTab("projects")}
          >
            <Building2 className="h-4 w-4 ml-2" />
            פרויקטים ({projects.length})
          </Button>
        </div>

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <Card className="p-6">
            {/* Search and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="חיפוש לפי שם, טלפון או אימייל..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select
                  value={sortOrder}
                  onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="מיון" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">חדש ביותר</SelectItem>
                    <SelectItem value="asc">ישן ביותר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={exportLeadsToCSV}>
                <Download className="h-4 w-4 ml-2" />
                ייצא ל-CSV
              </Button>
            </div>

            {/* Leads Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">טוען נתונים...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-4">
                  {searchQuery ? "לא נמצאו תוצאות" : "אין לידים עדיין"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שם</TableHead>
                      <TableHead className="text-right">טלפון</TableHead>
                      <TableHead className="text-right">אימייל</TableHead>
                      <TableHead className="text-right">מטרה</TableHead>
                      <TableHead className="text-right">תקציב</TableHead>
                      <TableHead className="text-right">תאריך</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.name}
                        </TableCell>
                        <TableCell dir="ltr" className="text-right">
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-primary hover:underline"
                          >
                            {lead.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-primary hover:underline"
                          >
                            {lead.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getGoalLabel(lead.investmentGoal)}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.budgetRange || "לא צוין"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(lead.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <Card className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground">
                        {project.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {project.developer}
                      </p>
                    </div>
                    {project.featured && (
                      <Badge className="bg-primary text-primary-foreground">
                        מומלץ
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">מיקום:</span>
                      <span>{project.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">מחיר התחלתי:</span>
                      <span className="font-semibold text-primary">
                        {new Intl.NumberFormat("he-IL").format(project.priceFrom)}{" "}
                        AED
                      </span>
                    </div>
                    {(project.roiPercent ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROI:</span>
                        <span className="text-green-600">{project.roiPercent}%</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Lead Detail Modal */}
        {selectedLead && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">פרטי ליד</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLead(null)}
                >
                  סגור
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">שם</p>
                    <p className="font-medium">{selectedLead.name}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">טלפון</p>
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {selectedLead.phone}
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">אימייל</p>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {selectedLead.email}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      מטרת השקעה
                    </p>
                    <p className="font-medium">
                      {getGoalLabel(selectedLead.investmentGoal)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">תקציב</p>
                    <p className="font-medium">
                      {selectedLead.budgetRange || "לא צוין"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">טווח זמן</p>
                    <p className="font-medium">
                      {getTimelineLabel(selectedLead.timeline)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">ניסיון</p>
                    <p className="font-medium">
                      {getExperienceLabel(selectedLead.experience)}
                    </p>
                  </div>
                </div>

                {selectedLead.message && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">הודעה</p>
                    <p className="font-medium">{selectedLead.message}</p>
                  </div>
                )}

                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">תאריך פנייה</p>
                  <p className="font-medium text-primary">
                    {formatDate(selectedLead.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  className="flex-1"
                  onClick={() => window.open(`tel:${selectedLead.phone}`)}
                >
                  <Phone className="h-4 w-4 ml-2" />
                  התקשר
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    window.open(`https://wa.me/${selectedLead.phone.replace(/\D/g, "")}`)
                  }
                >
                  <Mail className="h-4 w-4 ml-2" />
                  WhatsApp
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
