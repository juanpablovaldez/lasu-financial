import { useForm } from '@tanstack/react-form';
import { Link } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { Announcement } from '@/components/ui/announcement';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { supabase } from '@/lib/supabase';

// ─── Schema ────────────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().email('Por favor, ingresa una dirección de correo electrónico válida'),
});

// ─── Screen Component ──────────────────────────────────────────────────────

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form setup
  const form = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(value.email, {
          redirectTo: 'lasufinancial://auth/callback',
        });

        if (resetError) {
          throw resetError;
        }

        setSuccessMessage(
          '¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.',
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al enviar el correo de restablecimiento';
        setError(message);
      } finally {
        setIsLoading(false);
      }
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
          <Text className="text-left text-3xl font-bold text-foreground">
            Restablecer contraseña
          </Text>
          <Text className="text-base text-muted-foreground">
            Te enviaremos un enlace de restablecimiento a tu correo
          </Text>
        </View>

        {/* Success Message */}
        {successMessage && (
          <View className="rounded-xl border border-green-500 bg-green-500/10 px-4 py-3">
            <Text className="text-sm text-green-600">{successMessage}</Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity className="mt-2">
                <Text className="text-sm font-medium text-green-600">
                  Volver a Iniciar Sesión →
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        {/* Error Banner */}
        {error && (
          <View className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3">
            <Text className="text-sm text-destructive">{error}</Text>
          </View>
        )}

        {/* Screen reader announcements */}
        <Announcement message={successMessage} politeness="polite" />
        <Announcement message={error} politeness="assertive" />

        {/* Form */}
        <View className="gap-4">
          {/* Email Field */}
          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) => {
                const result = forgotPasswordSchema.shape.email.safeParse(value);

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
                autoFocus
                editable={!successMessage}
              />
            )}
          </form.Field>
        </View>

        {/* Submit Button */}
        <Button onPress={() => form.handleSubmit()} disabled={isLoading || !!successMessage}>
          <Text>{isLoading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}</Text>
        </Button>

        {/* Footer */}
        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-base text-muted-foreground">¿Recuerdas tu contraseña?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-base font-medium text-primary">Iniciar sesión →</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
