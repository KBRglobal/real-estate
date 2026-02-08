import { useState, useEffect, useCallback } from "react";
import type { ContentBlock } from "@shared/schema";
import { getCsrfToken } from "@/lib/queryClient";

interface UseContentBlocksReturn {
  blocks: ContentBlock[];
  isLoading: boolean;
  error: string | null;
  getBlock: (section: string, blockKey: string) => ContentBlock | undefined;
  getValue: (section: string, blockKey: string, lang?: "he" | "en") => string;
  refetch: () => Promise<void>;
}

interface UseContentBlocksBySectionReturn {
  blocks: ContentBlock[];
  isLoading: boolean;
  error: string | null;
  getBlock: (blockKey: string) => ContentBlock | undefined;
  getValue: (blockKey: string, lang?: "he" | "en") => string;
  refetch: () => Promise<void>;
}

// Global cache for content blocks
const contentBlocksCache: Map<string, ContentBlock[]> = new Map();
let allBlocksCache: ContentBlock[] | null = null;

/**
 * Hook for fetching all content blocks
 */
export function useContentBlocks(): UseContentBlocksReturn {
  const [blocks, setBlocks] = useState<ContentBlock[]>(allBlocksCache || []);
  const [isLoading, setIsLoading] = useState(!allBlocksCache);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/content-blocks");
      if (!res.ok) throw new Error("Failed to fetch content blocks");
      const data = await res.json();
      allBlocksCache = data;
      setBlocks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allBlocksCache) {
      fetchBlocks();
    }
  }, [fetchBlocks]);

  const getBlock = useCallback(
    (section: string, blockKey: string) => {
      return blocks.find((b) => b.section === section && b.blockKey === blockKey);
    },
    [blocks]
  );

  const getValue = useCallback(
    (section: string, blockKey: string, lang: "he" | "en" = "he") => {
      const block = getBlock(section, blockKey);
      if (!block) return "";
      return lang === "en" ? (block.valueEn || block.value || "") : (block.value || "");
    },
    [getBlock]
  );

  return {
    blocks,
    isLoading,
    error,
    getBlock,
    getValue,
    refetch: fetchBlocks,
  };
}

/**
 * Hook for fetching content blocks by section
 */
export function useContentBlocksBySection(section: string): UseContentBlocksBySectionReturn {
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    contentBlocksCache.get(section) || []
  );
  const [isLoading, setIsLoading] = useState(!contentBlocksCache.has(section));
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/content-blocks/section/${section}`);
      if (!res.ok) throw new Error("Failed to fetch content blocks");
      const data = await res.json();
      contentBlocksCache.set(section, data);
      setBlocks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [section]);

  useEffect(() => {
    if (!contentBlocksCache.has(section)) {
      fetchBlocks();
    }
  }, [section, fetchBlocks]);

  const getBlock = useCallback(
    (blockKey: string) => {
      return blocks.find((b) => b.blockKey === blockKey);
    },
    [blocks]
  );

  const getValue = useCallback(
    (blockKey: string, lang: "he" | "en" = "he") => {
      const block = getBlock(blockKey);
      if (!block) return "";
      return lang === "en" ? (block.valueEn || block.value || "") : (block.value || "");
    },
    [getBlock]
  );

  return {
    blocks,
    isLoading,
    error,
    getBlock,
    getValue,
    refetch: fetchBlocks,
  };
}

/**
 * Hook for managing content blocks (CRUD operations)
 */
export function useContentBlocksAdmin() {
  const [isSaving, setIsSaving] = useState(false);

  const createBlock = async (block: Partial<ContentBlock>) => {
    setIsSaving(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch("/api/content-blocks", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(block),
      });
      if (!res.ok) throw new Error("Failed to create content block");
      const data = await res.json();
      // Invalidate cache
      allBlocksCache = null;
      contentBlocksCache.delete(block.section || "");
      return data;
    } finally {
      setIsSaving(false);
    }
  };

  const updateBlock = async (id: string, data: Partial<ContentBlock>) => {
    setIsSaving(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/content-blocks/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update content block");
      const result = await res.json();
      // Invalidate cache
      allBlocksCache = null;
      contentBlocksCache.delete(data.section || "");
      return result;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBlock = async (id: string) => {
    setIsSaving(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`/api/content-blocks/${id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete content block");
      // Invalidate cache
      allBlocksCache = null;
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const bulkUpsert = async (blocks: Partial<ContentBlock>[]) => {
    setIsSaving(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch("/api/content-blocks/bulk-upsert", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ blocks }),
      });
      if (!res.ok) throw new Error("Failed to bulk upsert content blocks");
      const result = await res.json();
      // Invalidate cache
      allBlocksCache = null;
      contentBlocksCache.clear();
      return result;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    createBlock,
    updateBlock,
    deleteBlock,
    bulkUpsert,
  };
}

/**
 * Clear all cached content blocks
 */
export function clearContentBlocksCache() {
  allBlocksCache = null;
  contentBlocksCache.clear();
}
