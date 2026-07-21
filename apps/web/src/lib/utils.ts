import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomBoolean(threshold: number = 0.5) {
  return Math.random() < threshold;
}

/* Today's calendar date in the browser's own timezone as YYYY-MM-DD. The
   "en-CA" locale formats dates ISO-style, so this stays correct west of UTC
   where toISOString() would have already rolled over to tomorrow. */
export function localToday(): string {
  return new Date().toLocaleDateString("en-CA");
}

/** The browser's IANA timezone, e.g. "America/Phoenix" (empty if unavailable). */
export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
}

/* Supabase errors (PostgrestError, AuthError) are often plain objects, so a
   bare String() renders "[object Object]". */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    let { message, code, details } = error as {
      message?: string;
      code?: string;
      details?: string;
    };
    let parts = [message, code && `(${code})`, details].filter(Boolean);
    if (parts.length) return parts.join(" ");
    return JSON.stringify(error);
  }
  return String(error);
}
