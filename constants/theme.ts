/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Palette = {
  light: { surface:'#FFF8F6', surfaceLowest:'#FFFFFF', surfaceLow:'#FFF1EC', surfaceContainer:'#FFE9E1', surfaceHigh:'#FDE3D9', text:'#261913', textVariant:'#594137', outline:'#8D7165', outlineVariant:'#E1BFB2', primary:'#A23F00', onPrimary:'#FFFFFF', error:'#BA1A1A' },
  dark: { surface:'#0B0E14', surfaceLowest:'#1E242F', surfaceLow:'#1A1F29', surfaceContainer:'#1A1F29', surfaceHigh:'#2D3748', text:'#FFFFFF', textVariant:'#A0AEC0', outline:'#718096', outlineVariant:'#2D3748', primary:'#ED8936', onPrimary:'#0B0E14', error:'#FC8181' },
};
export const Colors = {
  light: { text:Palette.light.text, background:Palette.light.surface, tint:Palette.light.primary, icon:Palette.light.textVariant, tabIconDefault:Palette.light.textVariant, tabIconSelected:Palette.light.primary },
  dark: { text:Palette.dark.text, background:Palette.dark.surface, tint:Palette.dark.primary, icon:Palette.dark.textVariant, tabIconDefault:Palette.dark.textVariant, tabIconSelected:Palette.dark.primary },
};

export const Fonts = {
  playfair: {
    black: "PlayfairDisplay_800ExtraBold",
    bold: "PlayfairDisplay_700Bold",
    semibold: "PlayfairDisplay_600SemiBold",
    medium: "PlayfairDisplay_500Medium",
    regular: "PlayfairDisplay_400Regular",
  },
  inter: {
    extrabold: "PlusJakartaSans_800ExtraBold",
    bold: "PlusJakartaSans_700Bold",
    semibold: "PlusJakartaSans_600SemiBold",
    medium: "PlusJakartaSans_500Medium",
    regular: "PlusJakartaSans_400Regular",
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
};
