import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns the best site URL to use for redirects (magic links, password resets)
export function getSiteUrl(): string {
  const envUrl = (import.meta as any)?.env?.VITE_SITE_URL as string | undefined;
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return 'https://creatorspaces.in';
}
