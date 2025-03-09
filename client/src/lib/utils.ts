import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL-friendly slug from a string
 * @param str The string to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a random string if needed
 * @param str The string to convert to a slug
 * @returns A unique URL-friendly slug
 */
export function generateUniqueSlug(str: string): string {
  const baseSlug = generateSlug(str);
  // Add a short random string to ensure uniqueness
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomStr}`;
}
