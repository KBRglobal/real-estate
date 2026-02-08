import { useState, useCallback } from "react";
import { getCsrfToken } from "@/lib/queryClient";

interface AIAssistOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * React hook for AI-assisted content generation.
 * Uses Google Gemini to generate project descriptions, taglines, and more.
 */
export function useAIAssist(options: AIAssistOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const callAI = useCallback(
    async <T>(endpoint: string, body: Record<string, unknown>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const csrfToken = await getCsrfToken();
        const response = await fetch(`/api/ai/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (response.status === 503) {
          throw new Error("AI לא מוגדר - יש להוסיף GOOGLE_API_KEY");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "שגיאה בקריאת ל-AI");
        }

        const data = await response.json();
        options.onSuccess?.();
        return data as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("שגיאה לא צפויה");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  /**
   * Generate project description
   */
  const generateDescription = useCallback(
    async (projectData: {
      name: string;
      developer?: string;
      location: string;
      propertyType?: string;
      bedrooms?: string;
      priceFrom?: number;
      roiPercent?: number;
    }) => {
      return callAI<{ description: string; descriptionEn: string }>(
        "generate-description",
        projectData
      );
    },
    [callAI]
  );

  /**
   * Generate tagline
   */
  const generateTagline = useCallback(
    async (projectData: {
      name: string;
      location: string;
      propertyType?: string;
      highlights?: string;
    }) => {
      return callAI<{ tagline: string; taglineEn: string }>(
        "generate-tagline",
        projectData
      );
    },
    [callAI]
  );

  /**
   * Translate text
   */
  const translate = useCallback(
    async (text: string, direction: "he-to-en" | "en-to-he") => {
      return callAI<{ translation: string }>("translate", { text, direction });
    },
    [callAI]
  );

  /**
   * Generate SEO metadata
   */
  const generateSEO = useCallback(
    async (projectData: {
      name: string;
      location: string;
      developer?: string;
      priceFrom?: number;
      propertyType?: string;
    }) => {
      return callAI<{ title: string; description: string; keywords: string[] }>(
        "generate-seo",
        projectData
      );
    },
    [callAI]
  );

  /**
   * Suggest amenities
   */
  const suggestAmenities = useCallback(
    async (projectData: {
      propertyType?: string;
      priceRange?: string;
      location?: string;
    }) => {
      return callAI<{
        amenities: Array<{ name: string; nameHe: string; category: string }>;
      }>("suggest-amenities", projectData);
    },
    [callAI]
  );

  /**
   * Generate payment plan description
   */
  const generatePaymentPlan = useCallback(
    async (projectData: {
      developer?: string;
      projectName?: string;
      priceFrom?: number;
    }) => {
      return callAI<{
        planText: string;
        plan: { downPayment: number; duringConstruction: number; onHandover: number };
      }>("generate-payment-plan", projectData);
    },
    [callAI]
  );

  /**
   * Extract project data from brochure PDF/image
   */
  const extractFromBrochure = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const csrfToken = await getCsrfToken();
        const formData = new FormData();
        formData.append("brochure", file);

        const response = await fetch("/api/ai/extract-from-brochure", {
          method: "POST",
          headers: { "x-csrf-token": csrfToken },
          credentials: "include",
          body: formData,
        });

        if (response.status === 503) {
          throw new Error("AI לא מוגדר - יש להוסיף GOOGLE_API_KEY");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "שגיאה בחילוץ נתונים מהברושור");
        }

        const data = await response.json();
        options.onSuccess?.();
        return data as Record<string, unknown>;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("שגיאה לא צפויה");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  /**
   * Check if AI is available
   */
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/ai/status");
      const data = await response.json();
      return data.configured === true;
    } catch {
      return false;
    }
  }, []);

  return {
    isLoading,
    error,
    generateDescription,
    generateTagline,
    translate,
    generateSEO,
    suggestAmenities,
    generatePaymentPlan,
    extractFromBrochure,
    checkStatus,
  };
}
