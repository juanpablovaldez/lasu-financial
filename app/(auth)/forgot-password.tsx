import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { Announcement } from '@/components/ui/announcement';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useForgotPassword } from '@/hooks/mutations/use-auth-mutations';

// ─── Schema ────────────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().email('Por favor, ingresa una dirección de correo electrónico válida'),
});

// ─── Screen Component ──────────────────────────────────────────────────────

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const form = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      forgotPassword(value.email, {
        onSuccess: () => {
          router.push(
            `/(auth)/verify-otp-recovery?email=${encodeURIComponent(value.email)}` as never,
          );
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
          <Text className="text-left text-3xl font-bold text-foreground">
            Restablecer contraseña
          </Text>
          <Text className="text-base text-muted-foreground">
            Te enviaremos un código de verificación a tu correo
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
                editable={!isPending}
              />
            )}
          </form.Field>
        </View>

        {/* Submit Button */}
        <Button onPress={() => form.handleSubmit()} disabled={isPending}>
          <Text>{isPending ? 'Enviando...' : 'Enviar código de verificación'}</Text>
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
