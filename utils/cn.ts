/**
 * Utility for merging Tailwind CSS class names.
 *
 * Combines class names while handling conditional classes and deduplication.
 * This is a simple implementation suitable for NativeWind usage.
 *
 * @param classes - Class names to merge
 * @returns Merged class name string
 *
 * @example
 * ```ts
 * cn('text-white', 'bg-blue-500') // 'text-white bg-blue-500'
 * cn('text-white', condition && 'bg-blue-500') // 'text-white bg-blue-500' or 'text-white'
 * ```
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
