import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Hook to detect if the user prefers reduced motion based on system accessibility settings.
 *
 * On web, checks the `prefers-reduced-motion` media query.
 * On native (iOS/Android), checks `AccessibilityInfo.isReduceMotionEnabled()`.
 *
 * Use this to conditionally disable or reduce animations for users with motion sensitivity.
 *
 * @returns boolean - true if user prefers reduced motion, false otherwise
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = usePrefersReducedMotion();
 * const duration = prefersReducedMotion ? 0 : 280;
 *
 * Animated.timing(value, {
 *   toValue: 1,
 *   duration,
 *   useNativeDriver: true,
 * }).start();
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web: use CSS media query
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (event: MediaQueryListEvent) => {
        setPrefersReducedMotion(event.matches);
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    } else {
      // iOS/Android: use AccessibilityInfo API
      AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
        setPrefersReducedMotion(isEnabled ?? false);
      });

      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (isEnabled) => {
          setPrefersReducedMotion(isEnabled);
        },
      );

      return () => {
        subscription.remove();
      };
    }
  }, []);

  return prefersReducedMotion;
}
