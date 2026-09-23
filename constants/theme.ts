/**
 * ApniDiaries design tokens (mobile)
 * -----------------------------------------------------------------------------
 * Mirrors the web app's refreshed design system (frontend/src/index.css):
 *   • warm cream surfaces + burnt-orange primary (Material-style role tokens)
 *   • Playfair Display for headings, Plus Jakarta Sans for body copy
 *   • soft, generous radii and a single soft elevation
 *
 * Light-mode tokens are the web `:root` tokens 1:1. Dark-mode tokens are the web
 * `.dark` palette (#0B0E14 / #1A1F29 / #1E242F), with the same role names so
 * a component only ever has to read `theme.<role>`.
 */

import { Platform } from 'react-native';

/* ---------------------------------------------------------------------------
 * Color roles
 * ------------------------------------------------------------------------- */

export const LightPalette = {
  // Surfaces
  surface: '#FFF8F6',
  surfaceBright: '#FFF8F6',
  surfaceDim: '#EED5CB',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#FFF1EC',
  surfaceContainer: '#FFE9E1',
  surfaceContainerHigh: '#FDE3D9',
  surfaceContainerHighest: '#F7DDD3',
  surfaceVariant: '#F7DDD3',
  inverseSurface: '#3C2D27',
  inverseOnSurface: '#FFEDE7',

  // Content on surfaces
  onSurface: '#261913',
  onSurfaceVariant: '#594137',
  outline: '#8D7165',
  outlineVariant: '#E1BFB2',
  /** hairline divider – outlineVariant @ ~60% on the cream surface */
  hairline: '#EDD6CD',

  // Primary (burnt orange)
  primary: '#A23F00',
  onPrimary: '#FFFFFF',
  primaryContainer: '#FF7020',
  onPrimaryContainer: '#5C2000',
  primaryFixed: '#FFDBCC',
  primaryFixedDim: '#FFB595',
  onPrimaryFixed: '#351000',
  onPrimaryFixedVariant: '#7C2E00',
  inversePrimary: '#FFB595',

  // Marketing / CTA orange (auth + landing – web uses #F97316 → #EA580C)
  brand: '#F97316',
  brandDark: '#EA580C',
  brandSoft: '#FDBA74',
  saffron: '#FF9933',

  // Secondary / tertiary
  secondary: '#5C5F61',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#DEE0E2',
  tertiary: '#006590',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#00A5E9',
  tertiaryFixed: '#C8E6FF',

  // Feedback
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  success: '#16A34A',
  successContainer: '#DCFCE7',
  warning: '#D97706',
  warningContainer: '#FEF3C7',

  // Legacy aliases (kept so existing screens keep working)
  bgPrimary: '#FFF8F6',
  bgSecondary: '#FFF1EC',
  bgCard: '#FFFFFF',
  textPrimary: '#261913',
  textSecondary: '#594137',
  textMuted: '#8D7165',
  border: '#EDD6CD',

  // Utility
  scrim: 'rgba(38, 25, 19, 0.5)',
  overlay: 'rgba(255, 248, 246, 0.92)',
};

export const DarkPalette: typeof LightPalette = {
  surface: '#0B0E14',
  surfaceBright: '#1E242F',
  surfaceDim: '#0B0E14',
  surfaceContainerLowest: '#0B0E14',
  surfaceContainerLow: '#1A1F29',
  surfaceContainer: '#1E242F',
  surfaceContainerHigh: '#252C39',
  surfaceContainerHighest: '#2D3748',
  surfaceVariant: '#2D3748',
  inverseSurface: '#FFEDE7',
  inverseOnSurface: '#3C2D27',

  onSurface: '#FFFFFF',
  onSurfaceVariant: '#A0AEC0',
  outline: '#718096',
  outlineVariant: '#2D3748',
  hairline: '#232A36',

  primary: '#ED8936',
  onPrimary: '#1A0B00',
  primaryContainer: '#F6AD55',
  onPrimaryContainer: '#351000',
  primaryFixed: 'rgba(237, 137, 54, 0.16)',
  primaryFixedDim: 'rgba(237, 137, 54, 0.30)',
  onPrimaryFixed: '#FFDBCC',
  onPrimaryFixedVariant: '#F6AD55',
  inversePrimary: '#A23F00',

  brand: '#F97316',
  brandDark: '#EA580C',
  brandSoft: '#FDBA74',
  saffron: '#FF9933',

  secondary: '#A0AEC0',
  onSecondary: '#0B0E14',
  secondaryContainer: '#2D3748',
  tertiary: '#63B3ED',
  onTertiary: '#001E2F',
  tertiaryContainer: '#004C6E',
  tertiaryFixed: '#0B2A3D',

  error: '#F87171',
  onError: '#3B0000',
  errorContainer: 'rgba(248, 113, 113, 0.16)',
  onErrorContainer: '#FFDAD6',
  success: '#4ADE80',
  successContainer: 'rgba(74, 222, 128, 0.16)',
  warning: '#FBBF24',
  warningContainer: 'rgba(251, 191, 36, 0.16)',

  bgPrimary: '#0B0E14',
  bgSecondary: '#1A1F29',
  bgCard: '#1E242F',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textMuted: '#718096',
  border: '#2D3748',

  scrim: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(11, 14, 20, 0.92)',
};

export type AppPalette = typeof LightPalette;

/* ---------------------------------------------------------------------------
 * Shape (web --radius-*)
 * ------------------------------------------------------------------------- */
export const Radius = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

/* ---------------------------------------------------------------------------
 * Spacing (web --space-unit: 8px, --margin-mobile: 20px)
 * ------------------------------------------------------------------------- */
export const Space = {
  unit: 8,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  gutter: 16,
  margin: 20,
  sectionGap: 40,
};

/* ---------------------------------------------------------------------------
 * Elevation (web --shadow-soft: 0 12px 32px rgba(0,0,0,.05))
 * ------------------------------------------------------------------------- */
export const Shadow = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  raised: {
    shadowColor: '#A23F00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

/* ---------------------------------------------------------------------------
 * Fonts
 * ------------------------------------------------------------------------- */
export const Fonts = {
  /** Headings – Playfair Display (web `font-display`) */
  display: {
    black: 'PlayfairDisplay_800ExtraBold',
    bold: 'PlayfairDisplay_700Bold',
    semibold: 'PlayfairDisplay_600SemiBold',
    medium: 'PlayfairDisplay_500Medium',
    regular: 'PlayfairDisplay_400Regular',
  },
  /** Body – Plus Jakarta Sans (web `font-body`) */
  body: {
    extrabold: 'PlusJakartaSans_800ExtraBold',
    bold: 'PlusJakartaSans_700Bold',
    semibold: 'PlusJakartaSans_600SemiBold',
    medium: 'PlusJakartaSans_500Medium',
    regular: 'PlusJakartaSans_400Regular',
  },

  // Backwards-compatible aliases so older call-sites keep resolving.
  playfair: {
    black: 'PlayfairDisplay_800ExtraBold',
    bold: 'PlayfairDisplay_700Bold',
    semibold: 'PlayfairDisplay_600SemiBold',
    medium: 'PlayfairDisplay_500Medium',
    regular: 'PlayfairDisplay_400Regular',
  },
  inter: {
    extrabold: 'PlusJakartaSans_800ExtraBold',
    bold: 'PlusJakartaSans_700Bold',
    semibold: 'PlusJakartaSans_600SemiBold',
    medium: 'PlusJakartaSans_500Medium',
    regular: 'PlusJakartaSans_400Regular',
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

/* ---------------------------------------------------------------------------
 * Type scale (web DESIGN.md scale – .text-display-lg … .text-caption)
 * Spread into a <Text style={[Type.headlineMd, { color }]} />
 * ------------------------------------------------------------------------- */
export const Type = {
  displayLg: {
    fontFamily: Fonts.display.bold,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: Fonts.display.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  headlineMd: {
    fontFamily: Fonts.display.semibold,
    fontSize: 22,
    lineHeight: 30,
  },
  titleMd: {
    fontFamily: Fonts.display.semibold,
    fontSize: 18,
    lineHeight: 26,
  },
  bodyLg: {
    fontFamily: Fonts.body.regular,
    fontSize: 17,
    lineHeight: 26,
  },
  bodyMd: {
    fontFamily: Fonts.body.regular,
    fontSize: 15,
    lineHeight: 23,
  },
  labelMd: {
    fontFamily: Fonts.body.semibold,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  caption: {
    fontFamily: Fonts.body.medium,
    fontSize: 12,
    lineHeight: 17,
  },
};

/* ---------------------------------------------------------------------------
 * Legacy Expo template colours (still imported by a few template files)
 * ------------------------------------------------------------------------- */
const tintColorLight = LightPalette.primary;
const tintColorDark = DarkPalette.primary;

export const Colors = {
  light: {
    text: LightPalette.onSurface,
    background: LightPalette.surface,
    tint: tintColorLight,
    icon: LightPalette.outline,
    tabIconDefault: LightPalette.outline,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: DarkPalette.onSurface,
    background: DarkPalette.surface,
    tint: tintColorDark,
    icon: DarkPalette.outline,
    tabIconDefault: DarkPalette.outline,
    tabIconSelected: tintColorDark,
  },
};
