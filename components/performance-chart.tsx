import { useState } from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

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
  height = 120,
  showPercentage = true,
  totalAmount,
  totalPercentage,
}: PerformanceChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const colorScheme = useColorScheme();
  const isPositive = totalAmount >= 0;
  const chartColor = getChartColor(isPositive);
  const gridColor = colorScheme === 'dark' ? CHART_COLORS.gridDark : CHART_COLORS.gridLight;

  const rawChartData = data.map((d) => ({
    value: d.value,
    label: d.label,
    dataPointColor: chartColor,
    dataPointRadius: 3,
  }));

  // LineChart needs ≥2 points to draw a line — pad with a zero-origin point if needed
  const chartData =
    rawChartData.length === 1
      ? [
          { value: 0, label: '', dataPointColor: 'transparent', dataPointRadius: 0 },
          ...rawChartData,
        ]
      : rawChartData;

  // Compute Y-axis bounds from data so the chart never clips a data point.
  // Always include 0 as a visual baseline, then add 20% headroom above/below.
  const values = chartData.map((d) => d.value);
  const dataMax = Math.max(0, ...values);
  const dataMin = Math.min(0, ...values);
  const range = dataMax - dataMin || 100;
  const padding = range * 0.2;
  const yMax = Math.ceil(dataMax + padding);
  const yMin = dataMin < 0 ? Math.floor(dataMin - padding) : 0;

  // Area fill only makes visual sense when all values are non-negative.
  // With negative values, gifted-charts fills upward to the zero baseline,
  // making the shaded region appear disconnected from the line.
  const hasNegativeValues = dataMin < 0;

  const sign = isPositive ? '+' : '';
  const amountFormatted = `${sign}${formatCurrency(totalAmount, 'USD', 'en-US')}`;
  const percentageFormatted = `${sign}${totalPercentage.toFixed(2)}%`;

  return (
    <Card>
      <CardHeader className="gap-0.5 pb-1">
        <Text className="text-sm font-semibold text-muted-foreground">Rendimiento</Text>
        <View className="flex-row items-center gap-3">
          <Text className="text-xl font-bold" style={{ color: chartColor }}>
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
        <View
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          style={{ overflow: 'hidden' }}
        >
          {chartData.length >= 2 && containerWidth > 0 ? (
            <LineChart
              data={chartData}
              width={containerWidth}
              height={height}
              maxValue={yMax}
              mostNegativeValue={yMin < 0 ? yMin : undefined}
              curved
              color={chartColor}
              thickness={2}
              hideDataPoints={false}
              dataPointsColor={chartColor}
              dataPointsRadius={3}
              areaChart={!hasNegativeValues}
              startFillColor={hasNegativeValues ? 'transparent' : chartColor}
              endFillColor={hasNegativeValues ? 'transparent' : chartColor}
              startOpacity={hasNegativeValues ? 0 : 0.15}
              endOpacity={hasNegativeValues ? 0 : 0.02}
              hideYAxisText
              hideAxesAndRules={false}
              rulesColor={gridColor}
              rulesType="solid"
              noOfSections={4}
              yAxisColor="transparent"
              xAxisColor="transparent"
              xAxisLabelTextStyle={{ color: CHART_FONT.color, fontSize: CHART_FONT.size }}
              initialSpacing={16}
              endSpacing={16}
            />
          ) : (
            <View className="items-center justify-center py-8" style={{ height }}>
              <Text className="text-muted-foreground">Sin datos suficientes</Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  );
}
