import { MEMORY_TAGLINES } from "@/app/consts";

/**
 * Get a random tagline from the MEMORY_TAGLINES array
 * @returns A random tagline string
 */
export function getRandomTagline(): string {
  const randomIndex = Math.floor(Math.random() * MEMORY_TAGLINES.length);
  return MEMORY_TAGLINES[randomIndex];
}

/**
 * Get multiple random taglines from the MEMORY_TAGLINES array
 * @param count - Number of taglines to return (default: 1)
 * @param allowDuplicates - Whether to allow duplicate selections (default: false)
 * @returns Array of random taglines
 */
export function getRandomTaglines(
  count: number = 1,
  allowDuplicates: boolean = false
): string[] {
  if (count <= 0) return [];
  if (count === 1) return [getRandomTagline()];

  if (allowDuplicates) {
    // Simple case: allow duplicates
    return Array.from({ length: count }, () => getRandomTagline());
  } else {
    // No duplicates: shuffle and take first N
    const shuffled = [...MEMORY_TAGLINES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, MEMORY_TAGLINES.length));
  }
}

