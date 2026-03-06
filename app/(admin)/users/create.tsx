import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { CircleAlert, Eye, EyeOff } from 'lucide-react-native';
import { useRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useCreateClient } from '@/hooks/mutations/use-create-client';
import { createClientRequestSchema, type CreateClientRole } from '@/schemas';

export default function CreateClientScreen() {
  const router = useRouter();
  const { mutate: createClient, isPending } = useCreateClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [role, setRole] = useState<CreateClientRole | undefined>(undefined);
  const [initialBalance, setInitialBalance] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ title: string; description: string } | null>(
    null,
  );

  const passwordRef = useRef<RNTextInput>(null);
  const confirmPasswordRef = useRef<RNTextInput>(null);
  const phoneRef = useRef<RNTextInput>(null);
  const countryRef = useRef<RNTextInput>(null);

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      setAlertMessage({
        title: 'Error de validación',
        description: 'Las contraseñas no coinciden',
      });
      return;
    }

    const parsedBalance = initialBalance.trim() ? parseFloat(initialBalance.trim()) : undefined;

    const rawData = {
      email: email.trim().toLowerCase(),
      password,
      full_name: fullName.trim(),
      phone: phone.trim() || undefined,
      country: country.trim() || undefined,
      date_of_birth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : undefined,
      role,
      initial_balance: parsedBalance,
    };

    const result = createClientRequestSchema.safeParse(rawData);

    if (!result.success) {
      const firstError = result.error.errors[0];
      setAlertMessage({
        title: 'Error de validación',
        description: firstError?.message ?? 'Datos inválidos',
      });
      return;
    }

    setAlertMessage(null);
    createClient(result.data, {
      onSuccess: () => {
        router.back();
      },
      onError: (error) => {
        setAlertMessage({ title: 'Error al crear cliente', description: error.message });
      },
    });
  };

  const maxDateOfBirth = new Date();
  maxDateOfBirth.setFullYear(maxDateOfBirth.getFullYear() - 18);

  return (
    <ScrollView className="flex-1 bg-background" keyboardShouldPersistTaps="handled">
      <View className="mx-auto w-full max-w-lg gap-6 p-4">
        <Text className="text-xl font-bold">Registrar cliente</Text>

        {/* Required fields */}
        <View className="gap-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Datos de acceso
          </Text>

          <TextInput
            label="CORREO ELECTRÓNICO"
            placeholder="cliente@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            accessibilityLabel="Correo electrónico"
          />

          <TextInput
            ref={passwordRef}
            label="CONTRASEÑA"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            accessibilityLabel="Contraseña"
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                accessibilityRole="button"
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-muted-foreground" />
                ) : (
                  <Eye size={18} className="text-muted-foreground" />
                )}
              </TouchableOpacity>
            }
          />

          <TextInput
            ref={confirmPasswordRef}
            label="CONFIRMAR CONTRASEÑA"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            returnKeyType="next"
            accessibilityLabel="Confirmar contraseña"
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((v) => !v)}
                accessibilityLabel={
                  showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                accessibilityRole="button"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} className="text-muted-foreground" />
                ) : (
                  <Eye size={18} className="text-muted-foreground" />
                )}
              </TouchableOpacity>
            }
          />
        </View>

        {/* Personal info */}
        <View className="gap-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Información personal
          </Text>

          <TextInput
            label="NOMBRE COMPLETO"
            placeholder="Nombre y apellido"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            accessibilityLabel="Nombre completo"
          />

          <TextInput
            ref={phoneRef}
            label="TELÉFONO (OPCIONAL)"
            placeholder="+54 9 11 1234 5678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => countryRef.current?.focus()}
            accessibilityLabel="Teléfono"
          />

          <TextInput
            ref={countryRef}
            label="PAÍS (OPCIONAL)"
            placeholder="Argentina"
            value={country}
            onChangeText={setCountry}
            autoCapitalize="words"
            returnKeyType="done"
            accessibilityLabel="País"
          />

          <DatePicker
            label="FECHA DE NACIMIENTO (OPCIONAL)"
            value={dateOfBirth}
            onChange={setDateOfBirth}
            maximumDate={maxDateOfBirth}
            placeholder="Seleccionar fecha"
          />
        </View>

        {/* Initial balance */}
        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Balance inicial
          </Text>
          <TextInput
            label="BALANCE INICIAL (USD, OPCIONAL)"
            placeholder="0.00"
            value={initialBalance}
            onChangeText={setInitialBalance}
            keyboardType="decimal-pad"
            returnKeyType="done"
            accessibilityLabel="Balance inicial en dólares"
          />
          <Text className="text-xs text-muted-foreground">
            Si se especifica, se registrará un ingreso inicial por este monto al crear la cuenta.
          </Text>
        </View>

        {/* Role */}
        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rol en el sistema
          </Text>
          <View className="flex-row gap-2">
            {(
              [
                { value: undefined, label: 'Usuario' },
                { value: 'admin', label: 'Administrador' },
              ] as { value: CreateClientRole | undefined; label: string }[]
            ).map(({ value, label }) => (
              <Button
                key={label}
                variant={role === value ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onPress={() => setRole(value)}
              >
                <Text>{label}</Text>
              </Button>
            ))}
          </View>
          <Text className="text-xs text-muted-foreground">
            {role === 'admin'
              ? 'Podrá acceder al panel de administración y gestionar usuarios y transacciones.'
              : role === 'viewer'
                ? 'Podrá acceder al panel de administración en modo solo lectura.'
                : 'Acceso estándar a la app como cliente inversor.'}
          </Text>
        </View>

        {alertMessage && (
          <Alert icon={CircleAlert} variant="destructive">
            <AlertTitle>{alertMessage.title}</AlertTitle>
            <AlertDescription>{alertMessage.description}</AlertDescription>
          </Alert>
        )}

        <View className="gap-3 pb-8">
          <Button onPress={handleSubmit} disabled={isPending}>
            <Text>{isPending ? 'Registrando...' : 'Registrar cliente'}</Text>
          </Button>

          <Button variant="outline" onPress={() => router.back()} disabled={isPending}>
            <Text>Cancelar</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
