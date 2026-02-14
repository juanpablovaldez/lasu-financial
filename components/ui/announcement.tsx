import { View } from 'react-native';

import { Text } from '@/components/ui/text';

interface AnnouncementProps {
  /**
   * The message to announce to screen readers
   */
  message: string | null | undefined;

  /**
   * The politeness level of the announcement
   * - 'polite': Wait for the current speech to finish (default, use for most cases)
   * - 'assertive': Interrupt current speech (use sparingly, only for urgent messages)
   */
  politeness?: 'polite' | 'assertive';
}

/**
 * Screen reader announcement component using aria-live regions.
 * This component is visually hidden but announces messages to screen readers.
 *
 * Use for:
 * - Form submission success/error messages
 * - Loading state changes
 * - Dynamic content updates
 *
 * @example
 * ```tsx
 * <Announcement message={error?.message} />
 * <Announcement message="Datos guardados correctamente" politeness="polite" />
 * ```
 */
export function Announcement({ message, politeness = 'polite' }: AnnouncementProps) {
  if (!message) return null;

  return (
    <View
      aria-live={politeness}
      aria-atomic="true"
      accessibilityRole="alert"
      className="absolute h-px w-px overflow-hidden opacity-0"
      style={{
        position: 'absolute',
        left: -10000,
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <Text>{message}</Text>
    </View>
  );
}
