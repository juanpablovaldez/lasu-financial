import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names using clsx and tailwind-merge.
 *
 * This is the standard utility function for React Native Reusables.
 * It combines conditional class logic (clsx) with intelligent Tailwind
 * class merging (twMerge) to handle conflicting utilities.
 *
 * @param inputs - Class values to merge
 * @returns Merged class name string
 *
 * @example
 * ```ts
 * cn('px-4 py-2', 'px-6') // 'py-2 px-6' (px-6 wins)
 * cn('text-white', isActive && 'bg-blue-500') // conditional classes
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
