import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomBoolean(threshold: number = 0.5) {
  return Math.random() < threshold;
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
