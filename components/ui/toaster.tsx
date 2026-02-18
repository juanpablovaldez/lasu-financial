import { CheckCircle2, CircleAlert } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDevice } from '@/hooks/use-device';
import { type ToastItem, useToastStore } from '@/stores/toast-store';

const TOAST_DURATION = 3500;

function ToastItemView({ id, title, description, variant }: ToastItem) {
  const removeToast = useToastStore((state) => state.removeToast);

  React.useEffect(() => {
    const timer = setTimeout(() => removeToast(id), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [id, removeToast]);

  const icon = variant === 'destructive' ? CircleAlert : CheckCircle2;

  return (
    <Animated.View entering={FadeInDown.springify()} exiting={FadeOutUp.springify()}>
      <Alert icon={icon} variant={variant}>
        <AlertTitle>{title}</AlertTitle>
        {description && <AlertDescription>{description}</AlertDescription>}
      </Alert>
    </Animated.View>
  );
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const { top } = useSafeAreaInsets();
  const { isWeb } = useDevice();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{ top: top + 8 }}
      className={`absolute px-4 ${isWeb ? 'right-0 items-end' : 'left-0 right-0 items-center'}`}
    >
      <View pointerEvents="box-none" className={`gap-2 ${isWeb ? 'w-96' : 'w-full'}`}>
        {toasts.map((t) => (
          <ToastItemView key={t.id} {...t} />
        ))}
      </View>
    </View>
  );
}
