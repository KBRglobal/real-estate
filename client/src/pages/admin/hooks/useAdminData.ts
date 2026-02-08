import { useState, useEffect, useCallback } from "react";
import type { Lead, Project, Page, Media, MiniSite, Prospect, User } from "@shared/schema";

interface AdminData {
  leads: Lead[];
  projects: Project[];
  pages: Page[];
  media: Media[];
  miniSites: MiniSite[];
  prospects: Prospect[];
  users: User[];
}

interface UseAdminDataReturn extends AdminData {
  isLoading: boolean;
  refreshData: () => Promise<void>;
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  setMedia: React.Dispatch<React.SetStateAction<Media[]>>;
  setMiniSites: React.Dispatch<React.SetStateAction<MiniSite[]>>;
  setProspects: React.Dispatch<React.SetStateAction<Prospect[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

/**
 * Custom hook for fetching and managing admin data
 */
export function useAdminData(isAuthenticated: boolean): UseAdminDataReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [miniSites, setMiniSites] = useState<MiniSite[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [leadsRes, projectsRes, pagesRes, mediaRes, miniSitesRes, prospectsRes, usersRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/projects?limit=100"),
        fetch("/api/pages"),
        fetch("/api/media"),
        fetch("/api/mini-sites"),
        fetch("/api/prospects"),
        fetch("/api/users"),
      ]);

      // Helper to extract array from paginated or plain responses
      const extractArray = (json: unknown): unknown[] => {
        if (Array.isArray(json)) return json;
        if (json && typeof json === "object" && "data" in json && Array.isArray((json as { data: unknown[] }).data)) {
          return (json as { data: unknown[] }).data;
        }
        return [];
      };

      if (leadsRes.ok) {
        setLeads(extractArray(await leadsRes.json()) as Lead[]);
      }

      if (projectsRes.ok) {
        setProjects(extractArray(await projectsRes.json()) as Project[]);
      }

      if (pagesRes.ok) {
        setPages(extractArray(await pagesRes.json()) as Page[]);
      }

      if (mediaRes.ok) {
        setMedia(extractArray(await mediaRes.json()) as Media[]);
      }

      if (miniSitesRes.ok) {
        setMiniSites(extractArray(await miniSitesRes.json()) as MiniSite[]);
      }

      if (prospectsRes.ok) {
        setProspects(extractArray(await prospectsRes.json()) as Prospect[]);
      }

      if (usersRes.ok) {
        setUsers(extractArray(await usersRes.json()) as User[]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  return {
    leads,
    projects,
    pages,
    media,
    miniSites,
    prospects,
    users,
    isLoading,
    refreshData: fetchData,
    setLeads,
    setProjects,
    setPages,
    setMedia,
    setMiniSites,
    setProspects,
    setUsers,
  };
}
