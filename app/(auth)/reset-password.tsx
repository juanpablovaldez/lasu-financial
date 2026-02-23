import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { Announcement } from '@/components/ui/announcement';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useResetPassword } from '@/hooks/mutations/use-auth-mutations';

// ─── Schema ────────────────────────────────────────────────────────────────

const passwordFieldSchema = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres');

const resetPasswordSchema = z
  .object({
    password: passwordFieldSchema,
    confirmPassword: passwordFieldSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// ─── Screen Component ──────────────────────────────────────────────────────

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      const result = resetPasswordSchema.safeParse(value);
      if (!result.success) {
        setError(result.error.errors[0]?.message ?? 'Error de validación');
        return;
      }
      setError(null);
      resetPassword(value.password, {
        onSuccess: () => {
          router.replace('/(auth)/sign-in');
        },
        onError: (err) => {
          setError(err.message);
        },
      });
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-8 pt-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="gap-2">
          <Text className="text-left text-3xl font-bold text-foreground">Nueva contraseña</Text>
          <Text className="text-base text-muted-foreground">
            Elige una contraseña segura para tu cuenta
          </Text>
        </View>

        {/* Error Banner */}
        {error && (
          <View className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3">
            <Text className="text-sm text-destructive">{error}</Text>
          </View>
        )}

        {/* Screen reader announcements */}
        <Announcement message={error} politeness="assertive" />

        {/* Form */}
        <View className="gap-4">
          {/* Password field */}
          <form.Field
            name="password"
            validators={{
              onBlur: ({ value }) => {
                const result = passwordFieldSchema.safeParse(value);
                return result.success ? undefined : result.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <TextInput
                label="Nueva contraseña"
                placeholder="Mínimo 8 caracteres"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0] as string | undefined}
                leftIcon={<Lock size={20} className="text-muted-foreground" />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    accessibilityRole="button"
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-muted-foreground" />
                    ) : (
                      <Eye size={20} className="text-muted-foreground" />
                    )}
                  </TouchableOpacity>
                }
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                autoFocus
                editable={!isPending}
              />
            )}
          </form.Field>

          {/* Confirm password field */}
          <form.Field
            name="confirmPassword"
            validators={{
              onBlur: ({ value, fieldApi }) => {
                if (value !== fieldApi.form.getFieldValue('password')) {
                  return 'Las contraseñas no coinciden';
                }
              },
            }}
          >
            {(field) => (
              <TextInput
                label="Confirmar contraseña"
                placeholder="Repite la contraseña"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0] as string | undefined}
                leftIcon={<Lock size={20} className="text-muted-foreground" />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    accessibilityLabel={
                      showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    accessibilityRole="button"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} className="text-muted-foreground" />
                    ) : (
                      <Eye size={20} className="text-muted-foreground" />
                    )}
                  </TouchableOpacity>
                }
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                editable={!isPending}
              />
            )}
          </form.Field>
        </View>

        {/* Submit Button */}
        <Button onPress={() => form.handleSubmit()} disabled={isPending}>
          <Text>{isPending ? 'Guardando...' : 'Guardar nueva contraseña'}</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
