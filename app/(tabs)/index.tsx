import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-4">
      <Text className="text-lg font-semibold text-foreground">Inicio</Text>
      <Text className="mt-2 text-center text-muted-foreground">
        Próximamente: tu portafolio de inversiones
      </Text>
    </View>
  );
}
