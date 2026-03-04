import { Image, View } from 'react-native';

import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      {/* Logo */}
      <Image
        source={require('@/assets/images/lasucompleto.png')}
        style={{ width: 160, height: 36, marginBottom: 24 }}
        resizeMode="contain"
        accessibilityLabel="LASU Asset Management"
        accessibilityRole="image"
      />

      {/* Badge */}
      <View className="mb-4 rounded-full border border-border px-4 py-1.5">
        <Text className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Acceso provisional
        </Text>
      </View>

      {/* Body */}
      <Text className="mb-4 max-w-[600px] text-center text-base leading-relaxed text-foreground/80">
        Estamos construyendo la plataforma privada de gestión patrimonial de LASU Asset Management,
        diseñada para convertirse en un nuevo estándar en Argentina.
      </Text>

      {/* Footer */}
      <Text className="text-center text-sm text-muted-foreground">
        Próximamente disponible en iOS y Android.
      </Text>
    </View>
  );
}
