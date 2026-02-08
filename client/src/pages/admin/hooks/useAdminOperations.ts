import { useCallback } from "react";
import { csrfFetch } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lead, Project, Page, Media, MiniSite, Prospect, User } from "@shared/schema";

interface DataSetters {
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  setMedia: React.Dispatch<React.SetStateAction<Media[]>>;
  setMiniSites: React.Dispatch<React.SetStateAction<MiniSite[]>>;
  setProspects: React.Dispatch<React.SetStateAction<Prospect[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export interface AdminOperations {
  // Lead operations
  handleUpdateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  handleCreateLead: (data: Partial<Lead>) => Promise<Lead>;

  // Project operations
  handleCreateProject: (data: Partial<Project>) => Promise<string | void>;
  handleUpdateProject: (id: string, data: Partial<Project>) => Promise<void>;
  handleDeleteProject: (id: string) => Promise<void>;

  // Page operations
  handleCreatePage: (data: Partial<Page>) => Promise<void>;
  handleUpdatePage: (id: string, data: Partial<Page>) => Promise<void>;
  handleDeletePage: (id: string) => Promise<void>;

  // Media operations
  handleUploadMedia: (file: File, folder?: string) => Promise<void>;
  handleDeleteMedia: (id: string) => Promise<void>;
  handleUpdateMediaAlt: (id: string, altText: string) => Promise<void>;
  handleUpdateMedia: (id: string, data: Partial<Media>) => Promise<void>;
  handleSyncR2: () => Promise<{ newlySynced: number; totalR2Files: number }>;

  // Mini-Site operations
  handleCreateMiniSite: (data: Partial<MiniSite>) => Promise<void>;
  handleUpdateMiniSite: (id: string, data: Partial<MiniSite>) => Promise<void>;
  handleDeleteMiniSite: (id: string) => Promise<void>;

  // Prospect operations
  handleCreateProspect: (data: Partial<Prospect>) => Promise<Prospect>;
  handleUpdateProspect: (id: string, data: Partial<Prospect>) => Promise<void>;
  handleDeleteProspect: (id: string) => Promise<void>;

  // User operations
  handleCreateUser: (data: Partial<User>) => Promise<void>;
  handleUpdateUser: (id: string, data: Partial<User>) => Promise<void>;
  handleDeleteUser: (id: string) => Promise<void>;

  // Settings
  handleSaveSettings: (settings: any) => Promise<void>;
}

/**
 * Custom hook for admin CRUD operations
 */
export function useAdminOperations(setters: DataSetters): AdminOperations {
  const {
    setLeads,
    setProjects,
    setPages,
    setMedia,
    setMiniSites,
    setProspects,
    setUsers,
  } = setters;

  const { toast } = useToast();

  // Lead operations
  const handleUpdateLead = useCallback(async (id: string, data: Partial<Lead>) => {
    const response = await csrfFetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const res = await response.json();
      const updated = res.data || res;
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, ...updated } : lead))
      );
    } else {
      toast({ title: "שגיאה בעדכון ליד", description: "לא ניתן לעדכן את הליד", variant: "destructive" });
      throw new Error("Failed to update lead");
    }
  }, [setLeads, toast]);

  const handleCreateLead = useCallback(async (data: Partial<Lead>) => {
    const response = await csrfFetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const res = await response.json();
      const newLead = res.data || res;
      setLeads((prev) => [newLead, ...prev]);
      return newLead;
    } else {
      toast({ title: "שגיאה ביצירת ליד", description: "לא ניתן ליצור את הליד", variant: "destructive" });
      throw new Error("Failed to create lead");
    }
  }, [setLeads, toast]);

  // Project operations
  const handleCreateProject = useCallback(async (data: Partial<Project>): Promise<string | void> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await csrfFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.ok) {
        const res = await response.json();
        const newProject = res.data || res;
        setProjects((prev) => [...prev, newProject]);
        return newProject.id;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.details?.join(", ") || errorData.error || "שגיאה ביצירת הפרויקט";
        toast({ title: "שגיאה ביצירת פרויקט", description: errorMessage, variant: "destructive" });
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        toast({ title: "פסק זמן", description: "השרת לא הגיב תוך 30 שניות. נסה שוב.", variant: "destructive" });
        throw new Error("Request timed out");
      }
      throw err;
    }
  }, [setProjects, toast]);

  const handleUpdateProject = useCallback(async (id: string, data: Partial<Project>) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await csrfFetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.ok) {
        const res = await response.json();
        const updated = res.data || res;
        setProjects((prev) =>
          prev.map((project) => (project.id === id ? { ...project, ...updated } : project))
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.details?.join(", ") || errorData.error || "שגיאה בעדכון הפרויקט";
        toast({ title: "שגיאה בעדכון פרויקט", description: errorMessage, variant: "destructive" });
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        toast({ title: "פסק זמן", description: "השרת לא הגיב תוך 30 שניות. נסה שוב.", variant: "destructive" });
        throw new Error("Request timed out");
      }
      throw err;
    }
  }, [setProjects, toast]);

  const handleDeleteProject = useCallback(async (id: string) => {
    const response = await csrfFetch(`/api/projects/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } else {
      toast({ title: "שגיאה במחיקת פרויקט", description: "לא ניתן למחוק את הפרויקט", variant: "destructive" });
      throw new Error("Failed to delete project");
    }
  }, [setProjects, toast]);

  // Page operations
  const handleCreatePage = useCallback(async (data: Partial<Page>) => {
    const response = await csrfFetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const newPage = await response.json();
      setPages((prev) => [...prev, newPage]);
    } else {
      toast({ title: "שגיאה ביצירת עמוד", description: "לא ניתן ליצור את העמוד", variant: "destructive" });
      throw new Error("Failed to create page");
    }
  }, [setPages, toast]);

  const handleUpdatePage = useCallback(async (id: string, data: Partial<Page>) => {
    const response = await csrfFetch(`/api/pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const updated = await response.json();
      setPages((prev) =>
        prev.map((page) => (page.id === id ? updated : page))
      );
    } else {
      toast({ title: "שגיאה בעדכון עמוד", description: "לא ניתן לעדכן את העמוד", variant: "destructive" });
      throw new Error("Failed to update page");
    }
  }, [setPages, toast]);

  const handleDeletePage = useCallback(async (id: string) => {
    const response = await csrfFetch(`/api/pages/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setPages((prev) => prev.filter((page) => page.id !== id));
    } else {
      toast({ title: "שגיאה במחיקת עמוד", description: "לא ניתן למחוק את העמוד", variant: "destructive" });
      throw new Error("Failed to delete page");
    }
  }, [setPages, toast]);

  // Media operations
  const handleUploadMedia = useCallback(async (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) {
      formData.append("folder", folder);
    }
    formData.append("altText", file.name.split(".")[0]);

    // Try optimized upload first (R2), fall back to JSON-based creation
    const response = await csrfFetch("/api/media/upload-optimized", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      const newMedia = result.media || result;
      setMedia((prev) => [newMedia, ...prev]);
    } else {
      // Fall back to simple JSON creation (for when R2 is not configured)
      const mediaData = {
        name: file.name,
        type: file.type || "document",
        url: URL.createObjectURL(file),
        size: file.size,
        folder: folder || null,
      };

      const fallbackResponse = await csrfFetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mediaData),
      });
      if (fallbackResponse.ok) {
        const newMedia = await fallbackResponse.json();
        setMedia((prev) => [newMedia, ...prev]);
      } else {
        toast({ title: "שגיאה בהעלאת קובץ", description: "לא ניתן להעלות את הקובץ", variant: "destructive" });
        throw new Error("Failed to upload media");
      }
    }
  }, [setMedia, toast]);

  const handleDeleteMedia = useCallback(async (id: string) => {
    const response = await csrfFetch(`/api/media/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setMedia((prev) => prev.filter((item) => item.id !== id));
    } else {
      toast({ title: "שגיאה במחיקת קובץ", description: "לא ניתן למחוק את הקובץ", variant: "destructive" });
      throw new Error("Failed to delete media");
    }
  }, [setMedia, toast]);

  const handleUpdateMediaAlt = useCallback(async (id: string, altText: string) => {
    const response = await csrfFetch(`/api/media/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altText }),
    });
    if (response.ok) {
      const updated = await response.json();
      setMedia((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } else {
      toast({ title: "שגיאה בעדכון", description: "לא ניתן לעדכן את הטקסט החלופי", variant: "destructive" });
      throw new Error("Failed to update media");
    }
  }, [setMedia, toast]);

  const handleUpdateMedia = useCallback(async (id: string, data: Partial<Media>) => {
    const response = await csrfFetch(`/api/media/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const updated = await response.json();
      setMedia((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } else {
      toast({ title: "שגיאה בעדכון מדיה", description: "לא ניתן לעדכן את הקובץ", variant: "destructive" });
      throw new Error("Failed to update media");
    }
  }, [setMedia, toast]);

  // Mini-Site operations
  const handleCreateMiniSite = useCallback(async (data: Partial<MiniSite>) => {
    const response = await csrfFetch("/api/mini-sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const newMiniSite = await response.json();
      setMiniSites((prev) => [...prev, newMiniSite]);
    } else {
      toast({ title: "שגיאה ביצירת מיני-סייט", description: "לא ניתן ליצור את המיני-סייט", variant: "destructive" });
      throw new Error("Failed to create mini-site");
    }
  }, [setMiniSites, toast]);

  const handleUpdateMiniSite = useCallback(async (id: string, data: Partial<MiniSite>) => {
    const response = await csrfFetch(`/api/mini-sites/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const updated = await response.json();
      setMiniSites((prev) =>
        prev.map((site) => (site.id === id ? updated : site))
      );
    } else {
      toast({ title: "שגיאה בעדכון מיני-סייט", description: "לא ניתן לעדכן את המיני-סייט", variant: "destructive" });
      throw new Error("Failed to update mini-site");
    }
  }, [setMiniSites, toast]);

  const handleDeleteMiniSite = useCallback(async (id: string) => {
    const response = await csrfFetch(`/api/mini-sites/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setMiniSites((prev) => prev.filter((site) => site.id !== id));
    } else {
      toast({ title: "שגיאה במחיקת מיני-סייט", description: "לא ניתן למחוק את המיני-סייט", variant: "destructive" });
      throw new Error("Failed to delete mini-site");
    }
  }, [setMiniSites, toast]);

  // Prospect operations
  const handleCreateProspect = useCallback(async (data: Partial<Prospect>): Promise<Prospect> => {
    const response = await csrfFetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const newProspect = await response.json();
      setProspects((prev) => [...prev, newProspect]);
      return newProspect;
    } else {
      toast({ title: "שגיאה ביצירת פרוספקט", description: "לא ניתן ליצור את הפרוספקט", variant: "destructive" });
      throw new Error("Failed to create prospect");
    }
  }, [setProspects, toast]);

  const handleUpdateProspect = useCallback(async (id: string, data: Partial<Prospect>) => {
    const response = await csrfFetch(`/api/prospects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const updated = await response.json();
      setProspects((prev) =>
        prev.map((prospect) => (prospect.id === id ? updated : prospect))
      );
    } else {
      toast({ title: "שגיאה בעדכון פרוספקט", description: "לא ניתן לעדכן את הפרוספקט", variant: "destructive" });
      throw new Error("Failed to update prospect");
    }
  }, [setProspects, toast]);

  const handleDeleteProspect = useCallback(async (id: string) => {
    const response = await csrfFetch(`/api/prospects/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setProspects((prev) => prev.filter((prospect) => prospect.id !== id));
    } else {
      toast({ title: "שגיאה במחיקת פרוספקט", description: "לא ניתן למחוק את הפרוספקט", variant: "destructive" });
      throw new Error("Failed to delete prospect");
    }
  }, [setProspects, toast]);

  // User operations
  const handleCreateUser = useCallback(async (data: Partial<User>) => {
    const response = await csrfFetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const newUser = await response.json();
      setUsers((prev) => [...prev, newUser]);
    } else {
      toast({ title: "שגיאה ביצירת משתמש", description: "לא ניתן ליצור את המשתמש", variant: "destructive" });
      throw new Error("Failed to create user");
    }
  }, [setUsers, toast]);

  const handleUpdateUser = useCallback(async (id: string, data: Partial<User>) => {
    const response = await csrfFetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const updated = await response.json();
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updated : user))
      );
    } else {
      toast({ title: "שגיאה בעדכון משתמש", description: "לא ניתן לעדכן את המשתמש", variant: "destructive" });
      throw new Error("Failed to update user");
    }
  }, [setUsers, toast]);

  const handleDeleteUser = useCallback(async (id: string) => {
    const response = await csrfFetch(`/api/users/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } else {
      toast({ title: "שגיאה במחיקת משתמש", description: "לא ניתן למחוק את המשתמש", variant: "destructive" });
      throw new Error("Failed to delete user");
    }
  }, [setUsers, toast]);

  // R2 sync operation
  const handleSyncR2 = useCallback(async () => {
    const response = await csrfFetch("/api/media/sync-r2", {
      method: "POST",
    });
    if (!response.ok) {
      const errText = await response.text();
      toast({ title: "שגיאה בסנכרון", description: errText, variant: "destructive" });
      throw new Error("Failed to sync from R2");
    }
    const result = await response.json();

    // Reload full media list from server to get clean state
    const mediaRes = await fetch("/api/media", { credentials: "include" });
    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      const mediaArr = Array.isArray(mediaData) ? mediaData : (mediaData.data || mediaData);
      setMedia(Array.isArray(mediaArr) ? mediaArr : []);
    }

    return { newlySynced: result.newlySynced, totalR2Files: result.totalR2Files };
  }, [setMedia, toast]);

  // Settings operations (placeholder - settings are saved via individual handlers)
  const handleSaveSettings = useCallback(async (_settings: Record<string, unknown>) => {
    // Settings are saved through GeneralSettingsView directly
    await new Promise((resolve) => setTimeout(resolve, 100));
  }, []);

  return {
    handleUpdateLead,
    handleCreateLead,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleCreatePage,
    handleUpdatePage,
    handleDeletePage,
    handleUploadMedia,
    handleDeleteMedia,
    handleUpdateMediaAlt,
    handleUpdateMedia,
    handleSyncR2,
    handleCreateMiniSite,
    handleUpdateMiniSite,
    handleDeleteMiniSite,
    handleCreateProspect,
    handleUpdateProspect,
    handleDeleteProspect,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleSaveSettings,
  };
}
