import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Custom button component with multiple variants and states.
 *
 * Variants:
 * - `primary`: Blue background with white text and shadow
 * - `secondary`: Transparent with gray border
 * - `ghost`: No background, just text (for links)
 *
 * States:
 * - `loading`: Shows activity indicator, disabled
 * - `disabled`: Reduced opacity, no interaction
 *
 * @example
 * ```tsx
 * <Button
 *   onPress={handleSubmit}
 *   loading={isPending}
 *   icon={<LockIcon />}
 * >
 *   Secure Login
 * </Button>
 * ```
 */
export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-xl',

        size === 'sm' && 'px-4 py-2',
        size === 'md' && 'px-6 py-4',
        size === 'lg' && 'px-8 py-5',

        fullWidth && 'w-full',

        variant === 'primary' && 'bg-primary-500 shadow-lg shadow-primary-500/20',
        variant === 'secondary' && 'border border-gray-700',
        variant === 'ghost' && 'py-2',

        isDisabled && 'opacity-50',

        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#3b82f6'} size="small" />
      ) : (
        <>
          {icon}
          <Text
            className={cn(
              'text-base font-semibold',
              variant === 'primary' && 'text-white',
              variant === 'secondary' && 'text-gray-300',
              variant === 'ghost' && 'text-primary-500',
            )}
          >
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
