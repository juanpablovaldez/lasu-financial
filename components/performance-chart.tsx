import { LineChart } from 'react-native-gifted-charts';
import { View } from 'react-native';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/format';
import { CHART_COLORS, CHART_FONT, getChartColor } from './chart-theme';

export interface PerformanceChartDataPoint {
  value: number;
  label?: string;
  date: string;
}

interface PerformanceChartProps {
  data: PerformanceChartDataPoint[];
  height?: number;
  showPercentage?: boolean;
  totalAmount: number;
  totalPercentage: number;
}

export function PerformanceChart({
  data,
  height = 180,
  showPercentage = true,
  totalAmount,
  totalPercentage,
}: PerformanceChartProps) {
  const colorScheme = useColorScheme();
  const isPositive = totalAmount >= 0;
  const chartColor = getChartColor(isPositive);
  const gridColor = colorScheme === 'dark' ? CHART_COLORS.gridDark : CHART_COLORS.gridLight;

  const chartData = data.map((d) => ({
    value: d.value,
    label: d.label,
    dataPointColor: chartColor,
    dataPointRadius: 3,
  }));

  const sign = isPositive ? '+' : '';
  const amountFormatted = `${sign}${formatCurrency(totalAmount, 'USD', 'en-US')}`;
  const percentageFormatted = `${sign}${totalPercentage.toFixed(2)}%`;

  return (
    <Card>
      <CardHeader className="gap-1 pb-2">
        <Text className="text-base font-semibold">Rendimiento</Text>
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl font-bold" style={{ color: chartColor }}>
            {amountFormatted}
          </Text>
          {showPercentage && (
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: `${chartColor}20` }}
            >
              <Text className="text-sm font-semibold" style={{ color: chartColor }}>
                {percentageFormatted}
              </Text>
            </View>
          )}
        </View>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        {chartData.length > 1 ? (
          <LineChart
            data={chartData}
            height={height}
            curved
            color={chartColor}
            thickness={2}
            hideDataPoints={false}
            dataPointsColor={chartColor}
            dataPointsRadius={3}
            startFillColor={chartColor}
            endFillColor={chartColor}
            startOpacity={0.15}
            endOpacity={0.02}
            areaChart
            hideYAxisText
            hideAxesAndRules={false}
            rulesColor={gridColor}
            rulesType="solid"
            noOfSections={3}
            yAxisColor="transparent"
            xAxisColor="transparent"
            xAxisLabelTextStyle={{ color: CHART_FONT.color, fontSize: CHART_FONT.size }}
            initialSpacing={16}
            endSpacing={16}
            adjustToWidth
          />
        ) : (
          <View className="items-center justify-center py-8" style={{ height }}>
            <Text className="text-muted-foreground">Sin datos suficientes</Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
