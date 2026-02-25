/**
 * Shared chart theme constants for react-native-gifted-charts.
 * Colors match the app's shadcn/NativeWind palette.
 */

export const CHART_COLORS = {
  gain: '#22c55e',
  loss: '#ef4444',
  neutral: '#6366f1',
  muted: '#9BA1A6',
  gridLight: '#e5e7eb',
  gridDark: '#374151',
} as const;

export const CHART_FONT = {
  size: 11,
  color: '#9BA1A6',
} as const;

/**
 * Returns the appropriate chart color based on whether the value is positive.
 */
export function getChartColor(isPositive: boolean): string {
  return isPositive ? CHART_COLORS.gain : CHART_COLORS.loss;
}
