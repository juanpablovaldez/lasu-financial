import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from 'expo-router';
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

import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useSignUp } from '@/hooks/mutations/use-auth-mutations';
import { signUpRequestSchema } from '@/schemas';

// ─── Icons (using text emojis for MVP) ────────────────────────────────────

function UserIcon() {
  return <Text className="text-xl">👤</Text>;
}

function MailIcon() {
  return <Text className="text-xl">📧</Text>;
}

function LockIcon() {
  return <Text className="text-xl">🔒</Text>;
}

function EyeIcon({ visible }: { visible: boolean }) {
  return <Text className="text-xl">{visible ? '👁' : '🔒'}</Text>;
}

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
      className="flex-1 bg-surface-dark"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-8 pt-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-white">Crear cuenta</Text>
          <Text className="text-base text-gray-400">Únete a miles de inversores</Text>
        </View>

        {/* Success Message */}
        {successMessage && (
          <View className="rounded-xl border border-green-500 bg-green-500/10 px-4 py-3">
            <Text className="text-sm text-green-500">{successMessage}</Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity className="mt-2">
                <Text className="text-sm font-medium text-green-500">Ir a Iniciar Sesión →</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        {/* Error Banner */}
        {error && (
          <View className="rounded-xl border border-red-500 bg-red-500/10 px-4 py-3">
            <Text className="text-sm text-red-500">{error.message}</Text>
          </View>
        )}

        {/* Form */}
        <View className="gap-4">
          {/* Full Name Field (Optional) */}
          <form.Field name="full_name">
            {(field) => (
              <TextInput
                label="Nombre completo"
                placeholder="John Doe"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                leftIcon={<UserIcon />}
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
                placeholder="nombre@ejemplo.com"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0] as string | undefined}
                leftIcon={<MailIcon />}
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
              <TextInput
                label="Contraseña"
                placeholder="Al menos 8 caracteres"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0] as string | undefined}
                leftIcon={<LockIcon />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <EyeIcon visible={showPassword} />
                  </TouchableOpacity>
                }
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
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
                leftIcon={<LockIcon />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <EyeIcon visible={showConfirmPassword} />
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
          <Text className="text-base text-gray-400">¿Ya tienes una cuenta?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-base font-medium text-primary-500">Iniciar sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
