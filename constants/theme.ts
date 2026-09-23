/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native'

const tintColorLight = '#0a7ea4'
const tintColorDark = '#fff'

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
}

// New brand palette — matches the web app's design tokens exactly
// (see web src/index.css :root and .dark). Use these instead of the old
// hardcoded #ea580c / #f97316 values in components.
export const Palette = {
  light: {
    primary: '#a23f00',
    onPrimary: '#ffffff',
    primaryContainer: '#ff7020',
    onPrimaryContainer: '#5c2000',
    surface: '#fff8f6',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#fff1ec',
    surfaceContainer: '#ffe9e1',
    onSurface: '#261913',
    onSurfaceVariant: '#594137',
    outlineVariant: '#e1bfb2',
    error: '#ba1a1a',
  },
  dark: {
    primary: '#ED8936',
    onPrimary: '#1A0F00',
    background: '#0B0E14',
    surface: '#1E242F',
    surfaceContainerLow: '#1A1F29',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#A0AEC0',
    outlineVariant: '#2D3748',
    error: '#ef4444',
  },
}

export const Fonts = {
  playfair: {
    black: 'PlayfairDisplay_800ExtraBold',
    bold: 'PlayfairDisplay_700Bold',
    semibold: 'PlayfairDisplay_600SemiBold',
    medium: 'PlayfairDisplay_500Medium',
    regular: 'PlayfairDisplay_400Regular',
  },
  inter: {
    extrabold: 'Inter_800ExtraBold',
    bold: 'Inter_700Bold',
    semibold: 'Inter_600SemiBold',
    medium: 'Inter_500Medium',
    regular: 'Inter_400Regular',
  },
  system: Platform.select({
    ios: {
      sans: 'system-ui',
      serif: 'ui-serif',
      rounded: 'ui-rounded',
      mono: 'ui-monospace',
    },
    default: {
      sans: 'normal',
      serif: 'serif',
      rounded: 'normal',
      mono: 'monospace',
    },
    web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
      rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
  }),
}
