import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Announcement } from '@/components/ui/announcement';
import { Button } from '@/components/ui/button';
import { useForgotPassword, useVerifyRecoveryOtp } from '@/hooks/mutations/use-auth-mutations';

// ─── Helpers ───────────────────────────────────────────────────────────────

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local[0] ?? '';
  return `${visible}***@${domain}`;
}

// ─── Screen Component ──────────────────────────────────────────────────────

export default function VerifyOtpRecoveryScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null, null, null]);

  const { mutate: verifyRecoveryOtp, isPending: isVerifying } = useVerifyRecoveryOtp();
  const { mutate: resendForgotPassword, isPending: isResending } = useForgotPassword();

  // ── Countdown timer ──────────────────────────────────────────────────────

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [countdown]);

  // ── OTP submission ───────────────────────────────────────────────────────

  function submitOtp(token: string) {
    if (!email) return;
    setErrorMessage(null);
    verifyRecoveryOtp(
      { email, token },
      {
        onSuccess: () => {
          router.replace('/(auth)/reset-password');
        },
        onError: (err) => {
          setErrorMessage(err.message);
          setDigits(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        },
      },
    );
  }

  // ── Digit input handlers ─────────────────────────────────────────────────

  function handleChange(index: number, value: string) {
    const cleaned = value.replace(/[^0-9]/g, '');

    // Paste: distribute digits starting from the current box
    if (cleaned.length > 1) {
      const newDigits = [...digits];
      cleaned.split('').forEach((char, i) => {
        if (index + i < 6) newDigits[index + i] = char;
      });
      setDigits(newDigits);
      const lastFilled = Math.min(index + cleaned.length - 1, 5);
      inputRefs.current[lastFilled]?.focus();
      if (newDigits.every(Boolean)) {
        submitOtp(newDigits.join(''));
      }
      return;
    }

    const digit = cleaned;
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newDigits.every(Boolean)) {
      submitOtp(newDigits.join(''));
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  // ── Resend handler ───────────────────────────────────────────────────────

  function handleResend() {
    if (!email || countdown > 0 || isResending) return;
    setErrorMessage(null);
    resendForgotPassword(email, {
      onSuccess: () => {
        setCountdown(60);
        setSuccessMessage('Código reenviado. Revisa tu correo electrónico.');
      },
      onError: (err) => {
        setErrorMessage(err.message);
      },
    });
  }

  const isSubmitting = isVerifying || isResending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="mx-auto w-full max-w-md flex-1 gap-8 px-6 pb-8 pt-12">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Restablece tu contraseña</Text>
          <Text className="text-base text-muted-foreground">
            Ingresa el código de 6 dígitos que enviamos a
          </Text>
          {email ? (
            <Text className="text-base font-medium text-foreground">{maskEmail(email)}</Text>
          ) : null}
        </View>

        {/* Error banner */}
        {errorMessage ? (
          <View className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3">
            <Text className="text-sm text-destructive">{errorMessage}</Text>
          </View>
        ) : null}

        {/* Success banner */}
        {successMessage ? (
          <View className="rounded-xl border border-green-500 bg-green-500/10 px-4 py-3">
            <Text className="text-sm text-green-600">{successMessage}</Text>
          </View>
        ) : null}

        {/* Screen reader announcements */}
        <Announcement message={errorMessage} politeness="assertive" />
        <Announcement message={successMessage} politeness="polite" />

        {/* 6-digit input boxes */}
        <View className="flex-row justify-center gap-3">
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(val) => handleChange(index, val)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={index === 0 ? 6 : 1}
              selectTextOnFocus
              editable={!isSubmitting}
              accessibilityLabel={`Dígito ${index + 1} del código de verificación`}
              accessibilityRole="text"
              className={[
                'h-14 w-12 rounded-xl border-2 text-center text-2xl font-bold text-foreground',
                digit ? 'border-primary bg-primary/5' : 'border-border bg-muted',
              ].join(' ')}
            />
          ))}
        </View>

        {/* Verify button */}
        <Button
          onPress={() => submitOtp(digits.join(''))}
          disabled={isSubmitting || digits.some((d) => !d)}
        >
          <Text>{isVerifying ? 'Verificando...' : 'Verificar código'}</Text>
        </Button>

        {/* Resend section */}
        <View className="items-center gap-2">
          <Text className="text-sm text-muted-foreground">¿No recibiste el código?</Text>
          {countdown > 0 ? (
            <Text className="text-sm text-muted-foreground">
              Puedes reenviar en <Text className="font-medium text-foreground">{countdown}s</Text>
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResend}
              disabled={isResending}
              accessibilityLabel="Reenviar código de verificación"
              accessibilityRole="button"
            >
              <Text className="text-sm font-medium text-primary">
                {isResending ? 'Reenviando...' : 'Reenviar código'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
