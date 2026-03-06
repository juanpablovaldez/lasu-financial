import { Pressable } from 'react-native';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'primary' | 'warning' | 'success' | 'destructive';
  onPress?: () => void;
}

export function StatCard({ title, value, subtitle, variant = 'default', onPress }: StatCardProps) {
  const cardClasses = cn(
    'rounded-2xl',
    variant === 'primary' && 'bg-primary/10',
    variant === 'warning' && 'bg-yellow-500/10',
    variant === 'success' && 'bg-green-500/10',
    variant === 'destructive' && 'bg-destructive/10',
  );

  const valueClasses = cn(
    'text-2xl font-bold',
    variant === 'primary' && 'text-primary',
    variant === 'warning' && 'text-yellow-500',
    variant === 'success' && 'text-green-500',
    variant === 'destructive' && 'text-destructive',
  );

  const content = (
    <Card className={cardClasses}>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Text className={valueClasses}>{value}</Text>
        {subtitle && <Text className="mt-1 text-xs text-muted-foreground">{subtitle}</Text>}
      </CardContent>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }

  return content;
}
