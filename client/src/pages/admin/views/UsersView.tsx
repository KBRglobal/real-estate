import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Mail,
  Calendar,
  Save,
  Key,
  Filter,
  X,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface UsersViewProps {
  users: User[];
  onCreateUser: (data: Partial<User>) => Promise<void>;
  onUpdateUser: (id: string, data: Partial<User>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  isLoading: boolean;
}

const roleLabels: Record<string, string> = {
  admin: "מנהל",
  editor: "עורך",
  viewer: "צופה",
};

const roleDescriptions: Record<string, string> = {
  admin: "גישה מלאה לכל המערכת",
  editor: "עריכת תוכן, ניהול לידים ופרויקטים",
  viewer: "צפייה בלבד, ללא עריכה",
};

const permissionLabels: Record<string, string> = {
  pages: "עמודים",
  projects: "פרויקטים",
  miniSites: "מיני-סייטים",
  media: "מדיה",
  leads: "פניות",
  prospects: "ייבוא פרוספקטים",
  users: "משתמשים",
  settings: "הגדרות",
  analytics: "אנליטיקס",
};

export function UsersView({
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  isLoading,
}: UsersViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "viewer" as "admin" | "editor" | "viewer",
    permissions: {
      pages: false,
      projects: false,
      miniSites: false,
      media: false,
      leads: false,
      prospects: false,
      users: false,
      settings: false,
      analytics: false,
    },
  });

  const [newPassword, setNewPassword] = useState("");

  const hasActiveFilters = roleFilter !== "all" || searchTerm.length > 0;

  const clearFilters = () => {
    setRoleFilter("all");
    setSearchTerm("");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setFormErrors({});
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "viewer",
      permissions: {
        pages: false,
        projects: false,
        miniSites: false,
        media: false,
        leads: false,
        prospects: false,
        users: false,
        settings: false,
        analytics: false,
      },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormErrors({});
    const permissions = (user.permissions as Record<string, boolean>) || {};
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: (user.role as "admin" | "editor" | "viewer") || "viewer",
      permissions: {
        pages: permissions.pages || false,
        projects: permissions.projects || false,
        miniSites: permissions.miniSites || false,
        media: permissions.media || false,
        leads: permissions.leads || false,
        prospects: permissions.prospects || false,
        users: permissions.users || false,
        settings: permissions.settings || false,
        analytics: permissions.analytics || false,
      },
    });
    setIsModalOpen(true);
  };

  const openPasswordModal = (user: User) => {
    setEditingUser(user);
    setNewPassword("");
    setIsPasswordModalOpen(true);
  };

  const handleRoleChange = (role: "admin" | "editor" | "viewer") => {
    let permissions = { ...formData.permissions };

    if (role === "admin") {
      Object.keys(permissions).forEach((key) => {
        permissions[key as keyof typeof permissions] = true;
      });
    } else if (role === "editor") {
      permissions = {
        pages: true,
        projects: true,
        miniSites: true,
        media: true,
        leads: true,
        prospects: true,
        users: false,
        settings: false,
        analytics: true,
      };
    } else {
      Object.keys(permissions).forEach((key) => {
        permissions[key as keyof typeof permissions] = false;
      });
    }

    setFormData({ ...formData, role, permissions });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.username.trim()) errors.username = "שדה חובה";
    if (!formData.email.trim()) errors.email = "שדה חובה";
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) errors.email = "כתובת אימייל לא תקינה";
    }
    if (!editingUser && !formData.password) errors.password = "שדה חובה למשתמש חדש";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל שדות החובה",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
        ...(formData.password ? { password: formData.password } : {}),
      };

      if (editingUser) {
        await onUpdateUser(editingUser.id, userData);
        toast({ title: "המשתמש עודכן בהצלחה" });
      } else {
        await onCreateUser(userData as any);
        toast({ title: "המשתמש נוצר בהצלחה" });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את המשתמש",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!editingUser || !newPassword) {
      toast({
        title: "שגיאה",
        description: "יש להזין סיסמה חדשה",
        variant: "destructive",
      });
      return;
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasMinLength = newPassword.length >= 8;

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      toast({
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה ומספר",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await onUpdateUser(editingUser.id, { password: newPassword });
      toast({ title: "הסיסמה שונתה בהצלחה" });
      setIsPasswordModalOpen(false);
      setNewPassword("");
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשנות את הסיסמה",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await onDeleteUser(deleteTarget.id);
      toast({ title: "המשתמש נמחק בהצלחה" });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את המשתמש",
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
            <ShieldAlert className="h-3 w-3 me-1" />
            מנהל
          </Badge>
        );
      case "editor":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
            <ShieldCheck className="h-3 w-3 me-1" />
            עורך
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100">
            <Eye className="h-3 w-3 me-1" />
            צופה
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">משתמשים</h1>
          <p className="text-sm text-slate-500 mt-1">
            {users.length} משתמשים במערכת
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
          <Plus className="h-4 w-4 me-2" />
          משתמש חדש
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white shadow-sm border-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">סינון:</span>
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="חיפוש לפי שם או אימייל..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pe-10 bg-slate-50 border-slate-200"
            />
          </div>
          <Select dir="rtl" value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36 bg-slate-50 border-slate-200">
              <SelectValue placeholder="תפקיד" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל התפקידים</SelectItem>
              <SelectItem value="admin">מנהל</SelectItem>
              <SelectItem value="editor">עורך</SelectItem>
              <SelectItem value="viewer">צופה</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5 me-1" />
              נקה סינון
            </Button>
          )}
          <div className="flex-1" />
          <span className="text-sm text-slate-500">
            {filteredUsers.length} מתוך {users.length}
          </span>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="text-start">
                <span className="text-sm font-semibold text-slate-600">משתמש</span>
              </TableHead>
              <TableHead className="text-start">
                <span className="text-sm font-semibold text-slate-600">תפקיד</span>
              </TableHead>
              <TableHead className="text-start">
                <span className="text-sm font-semibold text-slate-600">כניסה אחרונה</span>
              </TableHead>
              <TableHead className="text-start w-[140px]">
                <span className="text-sm font-semibold text-slate-600">פעולות</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-900 font-medium mb-1">
                      {hasActiveFilters ? "לא נמצאו תוצאות" : "אין משתמשים עדיין"}
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                      {hasActiveFilters ? "נסה לשנות את פרמטרי החיפוש" : "צור את המשתמש הראשון"}
                    </p>
                    {hasActiveFilters ? (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        נקה סינון
                      </Button>
                    ) : (
                      <Button size="sm" onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 me-2" />
                        צור משתמש
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-900 font-medium">
                          {user.username}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString("he-IL", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "אף פעם"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider delayDuration={300}>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(user)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">ערוך</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openPasswordModal(user)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">שנה סיסמה</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteTarget(user)}
                              className="h-8 w-8 p-0 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">מחק</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl" className="bg-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-slate-900">מחיקת משתמש</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600">
              {"האם אתה בטוח שברצונך למחוק את המשתמש "}
              <strong>"{deleteTarget?.username}"</strong>?
              <br />
              פעולה זו אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
            <AlertDialogCancel className="mt-0">ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 me-2" />
              מחק משתמש
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit User Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingUser ? "עריכת משתמש" : "משתמש חדש"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  שם משתמש <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.username}
                  onChange={(e) => {
                    setFormErrors((prev) => ({ ...prev, username: "" }));
                    setFormData({ ...formData, username: e.target.value });
                  }}
                  className={`bg-slate-50 border-slate-200 ${formErrors.username ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  placeholder="john_doe"
                />
                {formErrors.username && (
                  <p className="text-xs text-red-500">{formErrors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  אימייל <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormErrors((prev) => ({ ...prev, email: "" }));
                    setFormData({ ...formData, email: e.target.value });
                  }}
                  className={`bg-slate-50 border-slate-200 ${formErrors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  dir="ltr"
                  placeholder="john@example.com"
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    סיסמה <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormErrors((prev) => ({ ...prev, password: "" }));
                      setFormData({ ...formData, password: e.target.value });
                    }}
                    className={`bg-slate-50 border-slate-200 ${formErrors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    placeholder="לפחות 8 תווים"
                  />
                  {formErrors.password && (
                    <p className="text-xs text-red-500">{formErrors.password}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">תפקיד</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["admin", "editor", "viewer"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleChange(role)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      formData.role === role
                        ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {role === "admin" && <ShieldAlert className="h-5 w-5 text-red-600" />}
                      {role === "editor" && <ShieldCheck className="h-5 w-5 text-blue-600" />}
                      {role === "viewer" && <Eye className="h-5 w-5 text-slate-500" />}
                    </div>
                    <p className="text-sm font-medium text-slate-900">{roleLabels[role]}</p>
                    <p className="text-xs text-slate-500 mt-1">{roleDescriptions[role]}</p>
                  </button>
                ))}
              </div>
            </div>

            {formData.role !== "admin" && (
              <div className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <Label className="text-sm font-medium text-slate-700">הרשאות מותאמות</Label>
                <div className="space-y-2">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-100 transition-colors" dir="rtl">
                      <label htmlFor={`perm-${key}`} className="text-sm text-slate-700 cursor-pointer">
                        {label}
                      </label>
                      <Switch
                        id={`perm-${key}`}
                        checked={formData.permissions[key as keyof typeof formData.permissions]}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              [key]: checked,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                ביטול
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 me-2" />
                )}
                {editingUser ? "עדכן" : "צור"} משתמש
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              איפוס סיסמה - {editingUser?.username}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                סיסמה חדשה <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-50 border-slate-200"
                placeholder="לפחות 8 תווים"
              />
              <p className="text-xs text-slate-500">
                חייבת להכיל אות גדולה, אות קטנה ומספר
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
              <Button
                variant="ghost"
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={saving}
              >
                ביטול
              </Button>
              <Button
                onClick={handlePasswordReset}
                disabled={saving || !newPassword}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 me-2" />
                )}
                שנה סיסמה
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
