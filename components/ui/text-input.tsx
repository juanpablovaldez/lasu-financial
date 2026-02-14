import type { TextInput as RNTextInput } from 'react-native';
import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TextInputProps extends React.ComponentProps<typeof RNTextInput> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Compatibility wrapper for RNR Input that maintains the legacy API.
 *
 * Features:
 * - Label with uppercase tracking (semantic colors)
 * - Optional icons (left and right)
 * - Error state with border and message (semantic destructive colors)
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <TextInput
 *   label="EMAIL ADDRESS"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={errors.email}
 *   leftIcon={<Mail size={20} className="text-muted-foreground" />}
 *   keyboardType="email-address"
 *   autoCapitalize="none"
 * />
 * ```
 */
export function TextInput({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  ...props
}: TextInputProps) {
  return (
    <View className="gap-2">
      {label && (
        <Label className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
      )}

      <View
        className={cn(
          'flex-row items-center gap-3 rounded-xl bg-input px-4 py-3.5',
          error && 'border border-destructive',
        )}
      >
        {leftIcon}

        <Input
          className={cn('flex-1 border-0 bg-transparent p-0 shadow-none', className)}
          placeholderClassName="text-muted-foreground"
          aria-invalid={!!error}
          {...props}
        />

        {rightIcon}
      </View>

      {error && <Text className="text-sm text-destructive">{error}</Text>}
    </View>
  );
}
