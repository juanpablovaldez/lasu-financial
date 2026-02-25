import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type DatePickerProps = {
  label?: string;
  value?: Date | null;
  onChange: (date: Date | null) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  error?: string;
};

export function DatePicker({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder = 'Seleccionar fecha',
  error,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date>(value ?? new Date());

  const displayText = value ? format(value, "d 'de' MMMM yyyy", { locale: es }) : placeholder;

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) setPendingDate(selectedDate);
  };

  const handleConfirm = () => {
    onChange(pendingDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setPendingDate(value ?? new Date());
    setShowPicker(false);
  };

  if (Platform.OS === 'web') {
    return (
      <View className="gap-2">
        {label && (
          <Label className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </Label>
        )}
        <View
          className={cn(
            'flex-row items-center gap-3 rounded-xl bg-input px-4 py-3.5',
            error && 'border border-destructive',
          )}
        >
          <CalendarDays size={18} className="text-white" />
          <input
            type="date"
            value={value ? format(value, 'yyyy-MM-dd') : ''}
            min={minimumDate ? format(minimumDate, 'yyyy-MM-dd') : undefined}
            max={maximumDate ? format(maximumDate, 'yyyy-MM-dd') : undefined}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onChange(e.target.value ? new Date(e.target.value + 'T12:00:00') : null);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
            }}
          />
        </View>
        {error && <Text className="text-sm text-destructive">{error}</Text>}
      </View>
    );
  }

  return (
    <View className="gap-2">
      {label && (
        <Label className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
      )}

      <Pressable
        onPress={() => {
          setPendingDate(value ?? new Date());
          setShowPicker((prev) => !prev);
        }}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        className={cn(
          'flex-row items-center gap-3 rounded-xl bg-input px-4 py-3.5',
          error && 'border border-destructive',
        )}
      >
        <CalendarDays size={18} className="text-white" />
        <Text className={cn('flex-1 text-sm text-white', !value && 'opacity-50')}>
          {displayText}
        </Text>
      </Pressable>

      {error && <Text className="text-sm text-destructive">{error}</Text>}

      {showPicker && (
        <View className="rounded-xl border border-border bg-input">
          <View className="flex-row items-center justify-between border-b border-border px-2">
            <Button variant="ghost" size="sm" onPress={handleCancel}>
              <Text className="text-white">Cancelar</Text>
            </Button>
            <Button variant="ghost" size="sm" onPress={handleConfirm}>
              <Text className="font-medium text-primary">Listo</Text>
            </Button>
          </View>
          <DateTimePicker
            value={pendingDate}
            mode="date"
            display="spinner"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
            locale="es-AR"
            // iOS requires explicit height for the UIPickerView; textColor makes it readable
            {...(Platform.OS === 'ios' && { textColor: '#ffffff', style: { height: 200 } })}
          />
        </View>
      )}
    </View>
  );
}
