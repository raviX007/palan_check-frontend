"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Client-side fetch hook — use inside Client Components. */
export function useApiFetch() {
  const { getToken } = useAuth();

  const apiFetch = useCallback(
    async <T>(path: string, options: RequestInit = {}): Promise<T> => {
      const token = await getToken();

      // Don't force Content-Type for FormData — browser sets multipart boundary automatically
      const isFormData = options.body instanceof FormData;

      const res = await fetch(`${API_URL}/api/v1${path}`, {
        ...options,
        headers: {
          ...(!isFormData ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`API ${res.status}: ${text}`);
      }

      // 204 No Content (e.g. DELETE) has no body
      if (res.status === 204) return undefined as T;

      return res.json();
    },
    [getToken]
  );

  return apiFetch;
}
