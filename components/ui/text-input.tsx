import type { TextInput as RNTextInput } from 'react-native';
import { TextInput as RNTextInputComponent, Text, View } from 'react-native';

import { cn } from '@/utils/cn';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TextInputProps extends React.ComponentProps<typeof RNTextInput> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Custom text input component with dark theme styling.
 *
 * Features:
 * - Label with uppercase tracking
 * - Optional icons (left and right)
 * - Error state with border and message
 * - Semi-transparent dark background
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <TextInput
 *   label="EMAIL ADDRESS"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={errors.email}
 *   leftIcon={<MailIcon />}
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
        <Text className="text-sm font-medium uppercase tracking-wide text-gray-400">{label}</Text>
      )}

      <View
        className={cn(
          'flex-row items-center gap-3 rounded-xl bg-gray-800/50 px-4 py-3.5',
          error && 'border border-red-500',
        )}
      >
        {leftIcon}

        <RNTextInputComponent
          className={cn('flex-1 text-base text-white', className)}
          placeholderTextColor="#6B7280"
          {...props}
        />

        {rightIcon}
      </View>

      {error && <Text className="text-sm text-red-500">{error}</Text>}
    </View>
  );
}
