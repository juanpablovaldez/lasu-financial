import { Link, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView className="flex-1 items-center justify-center p-5">
        <ThemedText type="title">Esta pantalla no existe.</ThemedText>
        <Link href="/" className="mt-4 py-4">
          <ThemedText type="link">Ir a la pantalla principal</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}
