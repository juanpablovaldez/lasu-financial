import { Ionicons } from '@expo/vector-icons';
import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Announcement } from '@/components/ui/announcement';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useSignIn, useSignInWithOAuth } from '@/hooks/mutations/use-auth-mutations';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { signInRequestSchema } from '@/schemas';
import { useAdminStore } from '@/stores/admin-store';

// ─── Screen Component ──────────────────────────────────────────────────────

export default function SignInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [showPassword, setShowPassword] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const { mutate: signIn, isPending, error } = useSignIn();
  const { mutate: signInWithOAuth, isPending: isOAuthPending } = useSignInWithOAuth();

  async function handleGoogleSignIn() {
    setOauthError(null);
    signInWithOAuth('google', {
      onSuccess: async (data) => {
        if (!data) return; // user cancelled

        const userId = data.session?.user?.id;
        if (userId) {
          const { data: adminData } = await supabase
            .from('admin_roles')
            .select('role')
            .eq('user_id', userId)
            .is('revoked_at', null)
            .single();

          if (adminData?.role === 'super_admin' || adminData?.role === 'admin') {
            useAdminStore.getState().setAdminRole(adminData.role);
            router.replace('/(admin)');
            return;
          }
        }
        useAdminStore.getState().clearAdminRole();
        router.replace('/(tabs)');
      },
      onError: (err) => setOauthError(err.message),
    });
  }

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      signIn(value, {
        onSuccess: async (data) => {
          const userId = data.session?.user?.id;
          if (userId) {
            const { data: adminData } = await supabase
              .from('admin_roles')
              .select('role')
              .eq('user_id', userId)
              .is('revoked_at', null)
              .single();

            if (adminData?.role === 'super_admin' || adminData?.role === 'admin') {
              useAdminStore.getState().setAdminRole(adminData.role);
              router.replace('/(admin)');
              return;
            }
          }
          useAdminStore.getState().clearAdminRole();
          router.replace('/(tabs)');
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
        contentContainerClassName="mx-auto w-full max-w-md gap-6 px-6 pb-8 pt-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center py-2">
          <Image
            source={require('@/assets/images/lasucompleto.png')}
            style={{
              width: 180,
              height: 60,
              tintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
            }}
            resizeMode="contain"
            accessibilityLabel="Lasu Financial"
            accessibilityRole="image"
          />
        </View>

        {/* Header */}
        <View className="gap-2">
          <Text className="text-left text-3xl font-bold text-foreground">Bienvenido de nuevo</Text>
          <Text className="text-base text-muted-foreground">
            Accede a tu portafolio de forma segura
          </Text>
        </View>

        {/* Error Banner */}
        {(error || oauthError) && (
          <View className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3">
            <Text className="text-sm text-destructive">{error?.message ?? oauthError}</Text>
          </View>
        )}

        {/* Screen reader announcement for errors */}
        <Announcement message={error?.message ?? oauthError ?? undefined} politeness="assertive" />

        {/* Form */}
        <View className="gap-4">
          {/* Email Field */}
          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) => {
                const result = signInRequestSchema.shape.email.safeParse(value);

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
              />
            )}
          </form.Field>

          {/* Password Field */}
          <form.Field
            name="password"
            validators={{
              onBlur: ({ value }) => {
                const result = signInRequestSchema.shape.password.safeParse(value);

                return result.success ? undefined : result.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Contraseña
                  </Text>
                  <Link href="/(auth)/forgot-password" asChild>
                    <TouchableOpacity>
                      <Text className="text-sm font-medium text-primary">
                        ¿Olvidaste tu contraseña?
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                <TextInput
                  placeholder="Ingresa tu contraseña"
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
                  autoComplete="password"
                />
              </View>
            )}
          </form.Field>
        </View>

        {/* Submit Button */}
        <View className="gap-4">
          <Button onPress={() => form.handleSubmit()} disabled={isPending}>
            <Lock size={20} className="text-primary-foreground" />
            <Text className="text-primary-foreground">
              {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Text>
          </Button>

          {/* Divider */}
          <View className="flex-row items-center gap-4">
            <View className="h-px flex-1 bg-border" />
            <Text className="text-sm text-muted-foreground">O continuar con</Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          {/* Google OAuth Button */}
          <Button
            variant="outline"
            onPress={handleGoogleSignIn}
            disabled={isOAuthPending || isPending}
            accessibilityLabel="Continuar con Google"
            accessibilityRole="button"
          >
            <Ionicons name="logo-google" size={18} />
            <Text className="text-foreground">
              {isOAuthPending ? 'Abriendo Google...' : 'Continuar con Google'}
            </Text>
          </Button>
        </View>

        {/* Footer */}
        <View className="gap-4">
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-base text-muted-foreground">¿No tienes una cuenta?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="text-base font-medium text-primary">Crear cuenta →</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
