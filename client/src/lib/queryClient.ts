import { QueryClient, QueryFunction } from "@tanstack/react-query";

// CSRF token management
let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  // First, try to get from cookie
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf-token="))
    ?.split("=")[1];

  if (cookieToken) {
    csrfToken = cookieToken;
    return cookieToken;
  }

  // If no cookie, fetch from endpoint
  if (!csrfToken) {
    try {
      const response = await fetch("/api/csrf-token", {
        credentials: "include",
      });
      const data = await response.json();
      csrfToken = data.token;
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }

  return csrfToken || "";
}

export function clearCsrfToken() {
  csrfToken = null;
}

/**
 * Fetch wrapper with automatic CSRF token and retry on 403
 */
export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getCsrfToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
    "x-csrf-token": token,
  };

  let response = await fetch(url, { ...options, headers, credentials: "include" });

  if (response.status === 403) {
    clearCsrfToken();
    const freshToken = await getCsrfToken();
    headers["x-csrf-token"] = freshToken;
    response = await fetch(url, { ...options, headers, credentials: "include" });
  }

  return response;
}

// Initialize CSRF token on load
if (typeof window !== "undefined") {
  getCsrfToken();
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  // Add CSRF token for mutating requests
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (!safeMethods.includes(method.toUpperCase())) {
    const token = await getCsrfToken();
    if (token) {
      headers["x-csrf-token"] = token;
    }
  }

  let res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Retry once on 403 with a fresh CSRF token
  if (res.status === 403 && !safeMethods.includes(method.toUpperCase())) {
    clearCsrfToken();
    const freshToken = await getCsrfToken();
    if (freshToken) {
      headers["x-csrf-token"] = freshToken;
    }
    res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export function unwrapApiResponse<T>(json: unknown): T {
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
