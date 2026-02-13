/**
 * React Navigation theme configuration synced with CSS variables.
 *
 * These constants map to the CSS variables defined in global.css.
 * When updating colors in global.css, update these values to match.
 */

import type { Theme } from '@react-navigation/native';

export const NAV_THEME: {
  light: Theme;
  dark: Theme;
} = {
  light: {
    dark: false,
    colors: {
      primary: 'rgb(59, 130, 246)', // --primary (hsl 217 91% 60%)
      background: 'rgb(255, 255, 255)', // --background
      card: 'rgb(255, 255, 255)', // --card
      text: 'rgb(10, 10, 10)', // --foreground
      border: 'rgb(229, 229, 229)', // --border
      notification: 'rgb(59, 130, 246)', // --primary
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '800',
      },
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: 'rgb(59, 130, 246)', // --primary
      background: 'rgb(21, 23, 24)', // --background (surface.dark #151718)
      card: 'rgb(21, 23, 24)', // --card
      text: 'rgb(250, 250, 250)', // --foreground
      border: 'rgb(38, 38, 38)', // --border
      notification: 'rgb(59, 130, 246)', // --primary
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '800',
      },
    },
  },
};
