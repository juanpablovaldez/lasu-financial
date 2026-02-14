import { Mail } from 'lucide-react-native';
import { Linking, Pressable, View } from 'react-native';

import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

const SUPPORT_EMAIL = 'leandroas727@gmail.com';

export function ContactSupportCard() {
  const handleContact = () => {
    const subject = encodeURIComponent('Ayuda desde la app Lasu');
    const body = encodeURIComponent('Hola equipo de soporte,\n\nNecesito ayuda con...');
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    Linking.openURL(mailto);
  };

  return (
    <Card className="mt-6 border-primary-200 dark:border-primary-800/40">
      <CardContent className="flex-row items-center gap-4 py-4">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
          <Mail size={22} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-base font-semibold">¿No encontraste lo que buscabas?</Text>
          <Text className="mb-2 text-sm text-muted-foreground">
            Contacta soporte y te ayudamos.
          </Text>
          <Pressable
            onPress={handleContact}
            className="mt-1 self-start rounded bg-primary-600 px-4 py-2"
            accessibilityRole="button"
            accessibilityLabel="Contactar soporte"
          >
            <Text className="font-medium text-white">Contactar soporte</Text>
          </Pressable>
        </View>
      </CardContent>
    </Card>
  );
}
