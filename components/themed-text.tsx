import type { TextProps } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

/**
 * Themed text component that wraps RNR Text with semantic colors.
 *
 * Type mappings use semantic color tokens:
 * - `default`: Base text with foreground color
 * - `title`: Large bold heading
 * - `defaultSemiBold`: Semibold base text
 * - `subtitle`: Medium bold heading
 * - `link`: Primary colored link text
 *
 * @deprecated lightColor and darkColor props - use className with semantic tokens instead
 */
export function ThemedText({
  className,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // Type mappings with semantic colors
  const typeClassName = {
    default: 'text-base leading-6 text-foreground',
    title: 'text-[32px] font-bold leading-8 text-foreground',
    defaultSemiBold: 'text-base leading-6 font-semibold text-foreground',
    subtitle: 'text-xl font-bold text-foreground',
    link: 'text-base leading-[30px] text-primary',
  }[type];

  return <Text className={cn(typeClassName, className)} {...rest} />;
}
