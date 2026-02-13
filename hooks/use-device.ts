import { Platform, useWindowDimensions } from 'react-native';

type DeviceType = 'phone' | 'tablet' | 'desktop';

type PlatformOS = 'ios' | 'android' | 'web';

interface DeviceInfo {
  platform: PlatformOS;
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  deviceType: DeviceType;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

/**
 * Hook to detect the current device platform and type.
 *
 * Uses screen width to determine device type:
 * - Phone: < 768px
 * - Tablet: 768px - 1023px
 * - Desktop: >= 1024px (web only)
 *
 * @returns Device information including platform, type, and boolean flags
 */
export function useDevice(): DeviceInfo {
  const { width, height } = useWindowDimensions();

  const getDeviceType = (): DeviceType => {
    if (Platform.OS === 'web') {
      if (width >= 1024) return 'desktop';
      if (width >= 768) return 'tablet';
      return 'phone';
    }

    return width >= 768 ? 'tablet' : 'phone';
  };

  const deviceType = getDeviceType();

  return {
    platform: Platform.OS as PlatformOS,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isWeb: Platform.OS === 'web',
    deviceType,
    isPhone: deviceType === 'phone',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    width,
    height,
  };
}
