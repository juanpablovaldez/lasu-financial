import { AdminHeader } from '@/components/admin';
import { GainLossForm } from '@/components/admin/gain-loss-form';
import { View } from 'react-native';

export default function GainLossScreen() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4">
        <AdminHeader
          title="Cargar ganancia / pérdida"
          subtitle="Asigna un resultado a un usuario"
        />
      </View>
      <GainLossForm />
    </View>
  );
}
