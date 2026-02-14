import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

import { Announcement } from '@/components/ui/announcement';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useSignUp } from '@/hooks/mutations/use-auth-mutations';
import { signUpRequestSchema } from '@/schemas';

// ─── Screen Component ──────────────────────────────────────────────────────

export default function SignUpScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { mutate: signUp, isPending, error } = useSignUp();

  // Form setup
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
    },
    onSubmit: async ({ value }) => {
      signUp(
        {
          email: value.email,
          password: value.password,
          full_name: value.full_name || undefined,
        },
        {
          onSuccess: (data) => {
            if (data.session) {
              // Auto sign-in (no email confirmation required)
              router.replace('/(tabs)');
            } else {
              // Email confirmation required
              setSuccessMessage(
                '¡Cuenta creada! Por favor, verifica tu correo electrónico antes de iniciar sesión.',
              );
            }
          },
        },
      );
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
          <Text variant="h1" className="text-left text-3xl font-bold text-foreground">
            Crear cuenta
          </Text>
          <Text className="text-base text-muted-foreground">Únete a miles de inversores</Text>
        </View>

        {/* Success Message */}
        {successMessage && (
          <View className="rounded-xl border border-green-500 bg-green-500/10 px-4 py-3">
            <Text className="text-sm text-green-600">{successMessage}</Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity className="mt-2">
                <Text className="text-sm font-medium text-green-600">Ir a Iniciar Sesión →</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        {/* Error Banner */}
        {error && (
          <View className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3">
            <Text className="text-sm text-destructive">{error.message}</Text>
          </View>
        )}

        {/* Screen reader announcements */}
        <Announcement message={successMessage} politeness="polite" />
        <Announcement message={error?.message} politeness="assertive" />

        {/* Form */}
        <View className="gap-4">
          {/* Full Name Field (Optional) */}
          <form.Field name="full_name">
            {(field) => (
              <TextInput
                label="Nombre completo"
                placeholder="Juan Pérez…"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                leftIcon={<User size={20} className="text-muted-foreground" />}
                autoCapitalize="words"
                autoComplete="name"
                autoFocus
              />
            )}
          </form.Field>

          {/* Email Field */}
          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) => {
                const result = signUpRequestSchema.shape.email.safeParse(value);

                return result.success ? undefined : result.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <TextInput
                label="Correo electrónico"
                placeholder="nombre@ejemplo.com…"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0] as string | undefined}
                leftIcon={<Mail size={20} className="text-muted-foreground" />}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            )}
          </form.Field>

          {/* Password Field */}
          <form.Field
            name="password"
            validators={{
              onBlur: ({ value }) => {
                const result = signUpRequestSchema.shape.password.safeParse(value);

                return result.success ? undefined : result.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <View>
                <TextInput
                  label="Contraseña"
                  placeholder="Al menos 8 caracteres"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0] as string | undefined}
                  leftIcon={<Lock size={20} className="text-muted-foreground" />}
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      accessibilityLabel={
                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                      accessibilityRole="button"
                    >
                      {showPassword ? (
                        <Eye size={20} className="text-muted-foreground" />
                      ) : (
                        <EyeOff size={20} className="text-muted-foreground" />
                      )}
                    </TouchableOpacity>
                  }
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  accessibilityDescribedBy="password-requirements"
                />
                <Text
                  nativeID="password-requirements"
                  className="mt-1.5 text-xs text-muted-foreground"
                >
                  Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
                </Text>
              </View>
            )}
          </form.Field>

          {/* Confirm Password Field */}
          <form.Field
            name="confirmPassword"
            validators={{
              onBlur: ({ value }) => {
                const result = z
                  .string()
                  .min(1, 'Por favor, confirma tu contraseña')
                  .safeParse(value);

                return result.success ? undefined : result.error.errors[0]?.message;
              },
              onChange: ({ value, fieldApi }) => {
                const password = fieldApi.form.getFieldValue('password');

                if (value && value !== password) {
                  return 'Las contraseñas no coinciden';
                }

                return undefined;
              },
            }}
          >
            {(field) => (
              <TextInput
                label="Confirmar contraseña"
                placeholder="Vuelve a ingresar tu contraseña"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0] as string | undefined}
                leftIcon={<Lock size={20} className="text-muted-foreground" />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    accessibilityLabel={
                      showConfirmPassword
                        ? 'Ocultar confirmación de contraseña'
                        : 'Mostrar confirmación de contraseña'
                    }
                    accessibilityRole="button"
                  >
                    {showConfirmPassword ? (
                      <Eye size={20} className="text-muted-foreground" />
                    ) : (
                      <EyeOff size={20} className="text-muted-foreground" />
                    )}
                  </TouchableOpacity>
                }
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
            )}
          </form.Field>
        </View>

        {/* Submit Button */}
        <Button
          onPress={() => form.handleSubmit()}
          loading={isPending}
          disabled={isPending || !!successMessage}
        >
          Crear cuenta
        </Button>

        {/* Footer */}
        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-base text-muted-foreground">¿Ya tienes una cuenta?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-base font-medium text-primary">Iniciar sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
