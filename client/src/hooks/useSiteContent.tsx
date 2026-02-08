import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import type { ContentBlock } from "@shared/schema";

interface SiteContentContextType {
  blocks: ContentBlock[];
  isLoading: boolean;
  isLoaded: boolean;
  getContent: (section: string, blockKey: string, lang: "he" | "en") => string | null;
  refetch: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | null>(null);

// Global cache to avoid multiple fetches
let globalCache: ContentBlock[] | null = null;
let fetchPromise: Promise<ContentBlock[]> | null = null;

async function fetchContentBlocks(): Promise<ContentBlock[]> {
  if (globalCache) return globalCache;

  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/content-blocks")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch content blocks");
      return res.json();
    })
    .then((data) => {
      globalCache = data;
      return data;
    })
    .catch((err) => {
      console.error("Error fetching content blocks:", err);
      return [];
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(globalCache || []);
  const [isLoading, setIsLoading] = useState(!globalCache);
  const [isLoaded, setIsLoaded] = useState(!!globalCache);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchContentBlocks();
      setBlocks(data);
      setIsLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!globalCache) {
      loadContent();
    }
  }, [loadContent]);

  const getContent = useCallback(
    (section: string, blockKey: string, lang: "he" | "en"): string | null => {
      const block = blocks.find(
        (b) => b.section === section && b.blockKey === blockKey && b.isActive
      );
      if (!block) return null;
      return lang === "en" ? (block.valueEn || block.value || null) : (block.value || null);
    },
    [blocks]
  );

  const refetch = useCallback(async () => {
    globalCache = null;
    await loadContent();
  }, [loadContent]);

  return (
    <SiteContentContext.Provider value={{ blocks, isLoading, isLoaded, getContent, refetch }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    // Return a fallback for components that might be rendered outside provider
    return {
      blocks: [],
      isLoading: false,
      isLoaded: false,
      getContent: () => null,
      refetch: async () => {},
    };
  }
  return context;
}

/**
 * Hook that combines CMS content with i18n fallback
 * Returns CMS value if available, otherwise falls back to provided fallback
 */
export function useCmsText(
  section: string,
  blockKey: string,
  fallback: string,
  lang: "he" | "en" = "he"
): string {
  const { getContent, isLoaded } = useSiteContent();

  if (!isLoaded) return fallback;

  const cmsValue = getContent(section, blockKey, lang);
  return cmsValue || fallback;
}

/**
 * Clear the global cache (useful after admin updates)
 */
export function clearSiteContentCache() {
  globalCache = null;
}
