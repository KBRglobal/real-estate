import { useState, useRef, useCallback } from "react";
import { getAreaProximity } from "@/lib/dubai-proximity-data";
import type { AreaProximity } from "@/lib/dubai-proximity-data";

export interface LocationSuggestion {
  id: string;
  text: string;
  placeName: string;
  center: [number, number]; // [lng, lat]
}

let cachedToken: string | null = null;

async function getMapboxToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    const res = await fetch("/api/config/mapbox");
    if (!res.ok) return null;
    const data = await res.json();
    cachedToken = data.token;
    return data.token;
  } catch {
    return null;
  }
}

export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const token = await getMapboxToken();
      if (!token) {
        setIsSearching(false);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const encoded = encodeURIComponent(query);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&language=en&limit=5&proximity=55.27,25.2`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Mapbox API error");
        const data = await res.json();

        const results: LocationSuggestion[] = (data.features || []).map((f: any) => ({
          id: f.id,
          text: f.text,
          placeName: f.place_name,
          center: f.center,
        }));

        setSuggestions(results);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Mapbox geocoding error:", err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { suggestions, isSearching, search, clear };
}

// Exports for proximity data (nearby places feature)
export { type AreaProximity };
export { getAreaProximity };
