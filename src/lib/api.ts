import { auth } from "@clerk/nextjs/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Server-side fetch — use in Server Components and Route Handlers only. */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

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

  if (res.status === 204) return undefined as T;
  return res.json();
}